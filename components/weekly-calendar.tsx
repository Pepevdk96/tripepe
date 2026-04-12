'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Trophy, Moon } from 'lucide-react'
import { SportBadge } from './sport-badge'
import { PlannedWorkout, SportType, SPORT_COLORS } from '@/lib/types/workout'

// ============================================================================
// Types
// ============================================================================

interface WeekDay {
  date: string
  dayOfWeek: string
  dayShort: string
  dayNumber: number
  isToday: boolean
  isRestDay: boolean
  isRaceDay: boolean
  hasKeyWorkout: boolean
  workouts: PlannedWorkout[]
  totalDurationMinutes: number
  sports: string[]
}

interface WeekSummary {
  totalWorkouts: number
  completedWorkouts: number
  totalDurationMinutes: number
  totalDistanceKm: number
  sports: string[]
  keyWorkoutDays: string[]
}

interface WeekResponse {
  weekStart: string
  weekEnd: string
  weekOffset: number
  isCurrentWeek: boolean
  days: WeekDay[]
  summary: WeekSummary
}

interface WeeklyCalendarProps {
  token: string
  onWorkoutClick?: (workout: PlannedWorkout) => void
}

// ============================================================================
// API
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function fetchWeek(token: string, weekOffset: number): Promise<WeekResponse> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam'
  const url = new URL(`${API_BASE_URL}/workouts/week`)
  url.searchParams.append('timezone', tz)
  url.searchParams.append('week_offset', String(weekOffset))

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch week: ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// Helper functions
// ============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}u${m}m` : `${h}u`
}

function formatDistance(meters: number | undefined): string {
  if (!meters) return ''
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`
  return `${meters}m`
}

function formatWeekRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const startMonth = months[startDate.getMonth()]
  const endMonth = months[endDate.getMonth()]

  if (startMonth === endMonth) {
    return `${startDay} – ${endDay} ${endMonth}`
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`
}

// ============================================================================
// Sub-components
// ============================================================================

function WorkoutPill({
  workout,
  onClick,
}: {
  workout: PlannedWorkout
  onClick?: (w: PlannedWorkout) => void
}) {
  const sport = workout.sport as SportType
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.rest
  const isCompleted = workout.isCompleted
  const isMissed = workout.isMissed

  return (
    <button
      onClick={() => onClick?.(workout)}
      className={`
        w-full text-left rounded-lg p-2.5 transition-all duration-150
        hover:scale-[1.02] active:scale-[0.98]
        ${isCompleted ? 'opacity-60' : ''}
        ${isMissed ? 'opacity-40 line-through' : ''}
      `}
      style={{ backgroundColor: `${colors.hex}15`, borderLeft: `3px solid ${colors.hex}` }}
    >
      <div className="flex items-center gap-2">
        <SportBadge sport={sport} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{workout.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {workout.durationSeconds && (
              <span className="text-xs text-gray-400">
                {formatDuration(Math.round(workout.durationSeconds / 60))}
              </span>
            )}
            {workout.distanceMeters && (
              <span className="text-xs text-gray-400">
                {formatDistance(workout.distanceMeters)}
              </span>
            )}
          </div>
          {workout.rationale && (
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-snug">{workout.rationale}</p>
          )}
        </div>
        {workout.isKeyWorkout && <Star size={14} className="text-amber-400 flex-shrink-0" />}
        {isCompleted && <span className="text-xs text-green-400">✓</span>}
      </div>
    </button>
  )
}

function DayColumn({
  day,
  onWorkoutClick,
}: {
  day: WeekDay
  onWorkoutClick?: (w: PlannedWorkout) => void
}) {
  return (
    <div
      className={`
        flex flex-col rounded-xl p-3 min-h-[140px] transition-colors
        ${day.isToday ? 'bg-[#1a1a3e] ring-1 ring-blue-500/50' : 'bg-[#12121f]'}
        ${day.isRestDay ? 'opacity-60' : ''}
      `}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-400 uppercase">{day.dayShort}</span>
          <span
            className={`
              text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
              ${day.isToday ? 'bg-blue-500 text-white' : 'text-gray-300'}
            `}
          >
            {day.dayNumber}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {day.isRaceDay && <Trophy size={14} className="text-amber-400" />}
          {day.hasKeyWorkout && !day.isRaceDay && <Star size={12} className="text-amber-400/60" />}
        </div>
      </div>

      {/* Workouts */}
      <div className="flex-1 space-y-1.5">
        {day.isRestDay && day.workouts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Moon size={20} className="text-gray-600" />
          </div>
        ) : (
          day.workouts.map((workout) => (
            <WorkoutPill
              key={workout.id}
              workout={workout}
              onClick={onWorkoutClick}
            />
          ))
        )}
      </div>

      {/* Duration footer */}
      {day.totalDurationMinutes > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">{formatDuration(day.totalDurationMinutes)}</span>
        </div>
      )}
    </div>
  )
}

function WeekSummaryBar({ summary }: { summary: WeekSummary }) {
  return (
    <div className="flex items-center gap-4 px-1 py-2 text-xs text-gray-400">
      <span>
        <span className="text-white font-medium">{summary.totalWorkouts}</span> workouts
      </span>
      <span>
        <span className="text-white font-medium">{formatDuration(summary.totalDurationMinutes)}</span> totaal
      </span>
      {summary.totalDistanceKm > 0 && (
        <span>
          <span className="text-white font-medium">{summary.totalDistanceKm}km</span>
        </span>
      )}
      {summary.completedWorkouts > 0 && (
        <span className="text-green-400">
          {summary.completedWorkouts}/{summary.totalWorkouts} voltooid
        </span>
      )}
      {summary.keyWorkoutDays.length > 0 && (
        <span className="flex items-center gap-1">
          <Star size={10} className="text-amber-400" />
          {summary.keyWorkoutDays.join(', ')}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function WeeklyCalendar({ token, onWorkoutClick }: WeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekData, setWeekData] = useState<WeekResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeek = useCallback(async (offset: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeek(token, offset)
      setWeekData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon week niet laden')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadWeek(weekOffset)
  }, [weekOffset, loadWeek])

  const goToPrevWeek = () => setWeekOffset((prev) => prev - 1)
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1)
  const goToCurrentWeek = () => setWeekOffset(0)

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevWeek}
          className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
          aria-label="Vorige week"
        >
          <ChevronLeft size={22} className="text-gray-400" />
        </button>

        <div className="text-center">
          {weekData ? (
            <>
              <h2 className="text-lg font-semibold text-white">
                {formatWeekRange(weekData.weekStart, weekData.weekEnd)}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                {weekData.isCurrentWeek ? (
                  <span className="text-xs text-blue-400 font-medium">Deze week</span>
                ) : (
                  <button
                    onClick={goToCurrentWeek}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    ← Terug naar deze week
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="h-8 w-40 bg-[#1a1a2e] rounded animate-pulse" />
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors"
          aria-label="Volgende week"
        >
          <ChevronRight size={22} className="text-gray-400" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-[#12121f] rounded-xl p-3 h-[140px] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => loadWeek(weekOffset)}
            className="mt-2 text-xs text-red-300 hover:text-white transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Week grid */}
      {weekData && !loading && (
        <>
          {/* Desktop: 7-column grid */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {weekData.days.map((day) => (
              <DayColumn key={day.date} day={day} onWorkoutClick={onWorkoutClick} />
            ))}
          </div>

          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-2">
            {weekData.days.map((day) => (
              <DayColumn key={day.date} day={day} onWorkoutClick={onWorkoutClick} />
            ))}
          </div>

          {/* Week summary */}
          <WeekSummaryBar summary={weekData.summary} />
        </>
      )}
    </div>
  )
}
