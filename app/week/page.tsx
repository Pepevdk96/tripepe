'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, Star, Trophy, Moon, Lightbulb } from 'lucide-react'
import { SportBadge } from '@/components/sport-badge'
import { SPORT_COLORS, SportType } from '@/lib/types/workout'
import { supabase, DEFAULT_USER_ID } from '@/lib/supabase'

/**
 * Weekly Calendar Page - Shows the full week training schedule
 * URL: /week
 *
 * Now uses Supabase directly (no Python backend required).
 */

// ============================================================================
// Types
// ============================================================================

interface WorkoutData {
  id: string
  date: string
  sport: string
  title: string
  description: string | null
  duration_minutes: number | null
  distance_meters: number | null
  intensity: string | null
  is_key_workout: boolean
  phase: string | null
  rationale: string | null
  status: string | null
  week_number: number
}

interface DayData {
  date: string
  dayOfWeek: string
  dayShort: string
  dayNumber: number
  isToday: boolean
  isRestDay: boolean
  workouts: WorkoutData[]
  totalDurationMinutes: number
}

// ============================================================================
// Helpers
// ============================================================================

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

const DAY_NAMES = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
const DAY_SHORT = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}u${m}m` : `${h}u`
}

function formatDistance(meters: number | null): string {
  if (!meters) return ''
  if (meters >= 1000) return `${(meters / 1000).toFixed(1).replace('.0', '')} km`
  return `${meters}m`
}

function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = MONTHS[start.getMonth()]
  const endMonth = MONTHS[end.getMonth()]
  if (startMonth === endMonth) return `${startDay} \u2013 ${endDay} ${endMonth}`
  return `${startDay} ${startMonth} \u2013 ${endDay} ${endMonth}`
}

// ============================================================================
// Data fetching
// ============================================================================

async function fetchWeekWorkouts(weekStart: Date, weekEnd: Date): Promise<WorkoutData[]> {
  const { data, error } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .gte('date', formatDate(weekStart))
    .lte('date', formatDate(weekEnd))
    .order('date')
    .order('sort_order')

  if (error) {
    console.error('Error fetching week workouts:', error)
    return []
  }
  return (data as WorkoutData[]) || []
}

function buildWeekDays(weekStart: Date, workouts: WorkoutData[]): DayData[] {
  const today = formatDate(new Date())
  const days: DayData[] = []

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)
    const dateStr = formatDate(date)
    const dayWorkouts = workouts.filter(w => w.date === dateStr)
    const isRestDay = dayWorkouts.length === 0 || dayWorkouts.every(w => w.sport === 'rest')
    const totalMin = dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)

    days.push({
      date: dateStr,
      dayOfWeek: DAY_NAMES[date.getDay()],
      dayShort: DAY_SHORT[date.getDay()],
      dayNumber: date.getDate(),
      isToday: dateStr === today,
      isRestDay,
      workouts: dayWorkouts,
      totalDurationMinutes: totalMin,
    })
  }
  return days
}

// ============================================================================
// Sub-components
// ============================================================================

function WorkoutPill({ workout, onClick }: { workout: WorkoutData; onClick: (w: WorkoutData) => void }) {
  const sport = workout.sport as SportType
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.rest
  const isCompleted = workout.status === 'completed'

  return (
    <button
      onClick={() => onClick(workout)}
      className={`w-full text-left rounded-lg p-2.5 transition-all duration-150
        hover:scale-[1.02] active:scale-[0.98]
        ${isCompleted ? 'opacity-60' : ''}`}
      style={{ backgroundColor: `${colors.hex}15`, borderLeft: `3px solid ${colors.hex}` }}
    >
      <div className="flex items-center gap-2">
        <SportBadge sport={sport} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{workout.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {workout.duration_minutes && (
              <span className="text-xs text-gray-400">{formatDuration(workout.duration_minutes)}</span>
            )}
            {workout.distance_meters && (
              <span className="text-xs text-gray-400">{formatDistance(workout.distance_meters)}</span>
            )}
            {workout.intensity && workout.intensity !== 'rest' && (
              <span className={`text-xs capitalize ${
                workout.intensity === 'hard' ? 'text-red-400' :
                workout.intensity === 'moderate' ? 'text-yellow-400' :
                workout.intensity === 'race' ? 'text-amber-400' :
                'text-green-400'
              }`}>{workout.intensity === 'moderate' ? 'Matig' : workout.intensity === 'hard' ? 'Hard' : workout.intensity === 'race' ? 'Race' : 'Easy'}</span>
            )}
          </div>
        </div>
        {workout.is_key_workout && <Star size={14} className="text-amber-400 flex-shrink-0" />}
        {isCompleted && <span className="text-xs text-green-400">✓</span>}
      </div>
    </button>
  )
}

function DayColumn({ day, onWorkoutClick }: { day: DayData; onWorkoutClick: (w: WorkoutData) => void }) {
  return (
    <div className={`flex flex-col rounded-xl p-3 min-h-[140px] transition-colors
      ${day.isToday ? 'bg-[#1a1a3e] ring-1 ring-blue-500/50' : 'bg-[#12121f]'}
      ${day.isRestDay ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase">{day.dayShort}</span>
          <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
            ${day.isToday ? 'bg-blue-500 text-white' : 'text-gray-300'}`}>
            {day.dayNumber}
          </span>
        </div>
        {day.workouts.some(w => w.sport === 'race') && <Trophy size={14} className="text-amber-400" />}
      </div>

      <div className="flex-1 space-y-1.5">
        {day.isRestDay && day.workouts.length <= 1 ? (
          <div className="flex items-center justify-center h-full">
            <Moon size={20} className="text-gray-600" />
          </div>
        ) : (
          day.workouts.filter(w => w.sport !== 'rest').map((workout) => (
            <WorkoutPill key={workout.id} workout={workout} onClick={onWorkoutClick} />
          ))
        )}
      </div>

      {day.totalDurationMinutes > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">{formatDuration(day.totalDurationMinutes)}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Page
// ============================================================================

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState<DayData[]>([])
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()))
  const [weekEnd, setWeekEnd] = useState<Date>(addDays(getMonday(new Date()), 6))
  const [phase, setPhase] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutData | null>(null)

  const loadWeek = useCallback(async (offset: number) => {
    setLoading(true)
    const start = addDays(getMonday(new Date()), offset * 7)
    const end = addDays(start, 6)
    setWeekStart(start)
    setWeekEnd(end)

    const workouts = await fetchWeekWorkouts(start, end)
    setDays(buildWeekDays(start, workouts))

    // Get phase from first workout
    const firstNonRest = workouts.find(w => w.phase)
    setPhase(firstNonRest?.phase || '')

    setLoading(false)
  }, [])

  useEffect(() => { loadWeek(weekOffset) }, [weekOffset, loadWeek])

  const totalMinutes = days.reduce((sum, d) => sum + d.totalDurationMinutes, 0)
  const totalWorkouts = days.reduce((sum, d) => sum + d.workouts.filter(w => w.sport !== 'rest').length, 0)
  const weekNumber = days[0]?.workouts[0]?.week_number

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-400" />
              <h1 className="text-lg font-semibold">Weekoverzicht</h1>
            </div>
          </div>
          <Link href="/vandaag" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Vandaag →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 hover:bg-[#1a1a2e] rounded-lg">
            <ChevronLeft size={22} className="text-gray-400" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">
              {weekNumber ? `Week ${weekNumber}` : formatWeekRange(weekStart, weekEnd)}
            </h2>
            <p className="text-xs text-gray-500">{formatWeekRange(weekStart, weekEnd)}</p>
            {phase && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                {phase}
              </span>
            )}
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="block mx-auto mt-1 text-xs text-gray-500 hover:text-blue-400">
                ← Terug naar deze week
              </button>
            )}
          </div>
          <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 hover:bg-[#1a1a2e] rounded-lg">
            <ChevronRight size={22} className="text-gray-400" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-[#12121f] rounded-xl p-3 h-[140px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Week grid */}
        {!loading && (
          <>
            <div className="hidden md:grid grid-cols-7 gap-2">
              {days.map(day => (
                <DayColumn key={day.date} day={day} onWorkoutClick={setSelectedWorkout} />
              ))}
            </div>
            <div className="md:hidden space-y-2">
              {days.map(day => (
                <DayColumn key={day.date} day={day} onWorkoutClick={setSelectedWorkout} />
              ))}
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 px-1 py-2 text-xs text-gray-400">
              <span><span className="text-white font-medium">{totalWorkouts}</span> workouts</span>
              <span><span className="text-white font-medium">{formatDuration(totalMinutes)}</span> totaal</span>
              {days.some(d => d.workouts.some(w => w.is_key_workout)) && (
                <span className="flex items-center gap-1">
                  <Star size={10} className="text-amber-400" />
                  Key workouts: {days.filter(d => d.workouts.some(w => w.is_key_workout)).map(d => d.dayShort).join(', ')}
                </span>
              )}
            </div>
          </>
        )}
      </main>

      {/* Workout detail modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center"
          onClick={() => setSelectedWorkout(null)}>
          <div className="bg-[#12121f] rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5"
              style={{ borderTopColor: SPORT_COLORS[selectedWorkout.sport as SportType]?.hex || '#6B7280', borderTopWidth: '3px' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedWorkout.title}</h3>
                <button onClick={() => setSelectedWorkout(null)} className="p-1 text-gray-400 hover:text-white">✕</button>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {DAY_NAMES[new Date(selectedWorkout.date + 'T00:00:00').getDay()]} {selectedWorkout.date}
              </p>
            </div>
            <div className="p-4 space-y-4">
              {selectedWorkout.description && (
                <p className="text-sm text-gray-300">{selectedWorkout.description}</p>
              )}
              {selectedWorkout.rationale && (
                <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Waarom deze training</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedWorkout.rationale}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedWorkout.duration_minutes && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Duur</p>
                    <p className="text-lg font-semibold text-white">{formatDuration(selectedWorkout.duration_minutes)}</p>
                  </div>
                )}
                {selectedWorkout.distance_meters && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Afstand</p>
                    <p className="text-lg font-semibold text-white">{formatDistance(selectedWorkout.distance_meters)}</p>
                  </div>
                )}
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Intensiteit</p>
                  <p className="text-lg font-semibold text-white capitalize">{selectedWorkout.intensity || '-'}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Sport</p>
                  <p className="text-lg font-semibold capitalize"
                    style={{ color: SPORT_COLORS[selectedWorkout.sport as SportType]?.hex }}>
                    {selectedWorkout.sport}
                  </p>
                </div>
              </div>
              {selectedWorkout.is_key_workout && (
                <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg p-3">
                  <span className="text-amber-400 text-sm font-medium">⭐ Sleuteltraining — Niet overslaan!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
