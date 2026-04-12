'use client'

import { useState } from 'react'
import { BarChart3, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import type { Week } from '@/lib/trainingData'

interface WeeklyStressBalanceProps {
  trainingPlan: Week[]
}

interface DayLoad {
  day: string
  type: string
  minutes: number
  intensity: string
  score: number
}

const intensityMultiplier: Record<string, number> = {
  rest: 0,
  easy: 1,
  moderate: 1.5,
  hard: 2.5,
  race: 3,
}

function parseDuration(duration: string): number {
  if (!duration || duration === '-') return 0
  // Handle "1:30" format
  if (duration.includes(':')) {
    const parts = duration.split(':')
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  // Handle "60 min" or just "60"
  const num = parseInt(duration)
  return isNaN(num) ? 0 : num
}

function calculateLoadScore(minutes: number, intensity: string): number {
  const multiplier = intensityMultiplier[intensity] || 1
  return Math.round(minutes * multiplier)
}

export default function WeeklyStressBalance({ trainingPlan }: WeeklyStressBalanceProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Find current week
  const today = new Date()
  const currentWeek = trainingPlan.find((week) => {
    const start = new Date(week.dateStart)
    const end = new Date(week.dateEnd)
    return today >= start && today <= end
  }) || trainingPlan[0]

  const previousWeek = trainingPlan.find(
    (w) => w.number === (currentWeek?.number || 1) - 1
  )

  if (!currentWeek) return null

  // Calculate daily load scores
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
  const dailyLoads: DayLoad[] = currentWeek.sessions.map((session, idx) => {
    const minutes = parseDuration(session.duration)
    const score = calculateLoadScore(minutes, session.intensity)
    return {
      day: dayNames[idx],
      type: session.type,
      minutes,
      intensity: session.intensity,
      score,
    }
  })

  const totalLoad = dailyLoads.reduce((sum, d) => sum + d.score, 0)
  const maxDayLoad = Math.max(...dailyLoads.map((d) => d.score), 1)

  // Previous week comparison
  let previousLoad = 0
  if (previousWeek) {
    previousLoad = previousWeek.sessions.reduce((sum, session) => {
      const minutes = parseDuration(session.duration)
      return sum + calculateLoadScore(minutes, session.intensity)
    }, 0)
  }

  const loadDiff = previousLoad > 0 ? Math.round(((totalLoad - previousLoad) / previousLoad) * 100) : 0

  // Total hours
  const totalMinutes = dailyLoads.reduce((sum, d) => sum + d.minutes, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  // Sport distribution
  const sportMinutes: Record<string, number> = {}
  dailyLoads.forEach((d) => {
    if (d.type !== 'rest') {
      sportMinutes[d.type] = (sportMinutes[d.type] || 0) + d.minutes
    }
  })

  const sportColors: Record<string, string> = {
    swim: '#00AAFF',
    bike: '#00CC66',
    run: '#FF4444',
    race: '#FFD700',
  }

  return (
    <div className="card-base border border-purple-700/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            Week {currentWeek.number} — Stress Balance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{totalHours}u</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Load bar chart */}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Dagelijkse belasting
            </p>
            <div className="flex items-end gap-1.5 h-24">
              {dailyLoads.map((day, idx) => {
                const height = day.score > 0 ? Math.max(8, (day.score / maxDayLoad) * 100) : 4
                const color = sportColors[day.type] || '#666688'
                const isToday = idx === (today.getDay() === 0 ? 6 : today.getDay() - 1)

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm transition-all relative"
                      style={{
                        height: `${height}%`,
                        backgroundColor: `${color}33`,
                        borderLeft: `2px solid ${color}`,
                      }}
                    >
                      {day.score > 0 && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-500">
                          {day.score}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${
                        isToday ? 'text-white font-bold' : 'text-gray-500'
                      }`}
                    >
                      {day.day}
                    </span>
                    {isToday && <div className="w-1 h-1 rounded-full bg-white -mt-0.5" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-[#1a1a2e] rounded-lg text-center">
              <p className="text-xs text-gray-500">Totaal</p>
              <p className="text-sm font-bold text-white">{totalLoad}</p>
              <p className="text-[10px] text-gray-500">load score</p>
            </div>
            <div className="p-2 bg-[#1a1a2e] rounded-lg text-center">
              <p className="text-xs text-gray-500">Volume</p>
              <p className="text-sm font-bold text-white">{totalHours}u</p>
              <p className="text-[10px] text-gray-500">deze week</p>
            </div>
            <div className="p-2 bg-[#1a1a2e] rounded-lg text-center">
              <p className="text-xs text-gray-500">vs Vorig</p>
              <div className="flex items-center justify-center gap-1">
                {loadDiff > 0 ? (
                  <TrendingUp size={12} className="text-red-400" />
                ) : loadDiff < 0 ? (
                  <TrendingDown size={12} className="text-green-400" />
                ) : null}
                <p
                  className={`text-sm font-bold ${
                    loadDiff > 15
                      ? 'text-red-400'
                      : loadDiff < -15
                        ? 'text-green-400'
                        : 'text-yellow-400'
                  }`}
                >
                  {loadDiff > 0 ? '+' : ''}
                  {loadDiff}%
                </p>
              </div>
              <p className="text-[10px] text-gray-500">week {(currentWeek.number || 1) - 1}</p>
            </div>
          </div>

          {/* Sport distribution */}
          {Object.keys(sportMinutes).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Sport verdeling
              </p>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {Object.entries(sportMinutes).map(([sport, mins]) => (
                  <div
                    key={sport}
                    className="h-full transition-all"
                    style={{
                      width: `${(mins / totalMinutes) * 100}%`,
                      backgroundColor: sportColors[sport] || '#666688',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                {Object.entries(sportMinutes).map(([sport, mins]) => (
                  <div key={sport} className="flex items-center gap-1">
                    <div
                      className="v-2 h-2 rounded-full"
                      style={{ backgroundColor: sportColors[sport] }}
                    />
                    <span className="text-[10px] text-gray-400 capitalize">
                      {sport} {Math.round(mins)}min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load advice */}
          <div className="p-2 bg-[#1a1a2e] rounded-lg">
            <p className="text-xs text-gray-300">
              {loadDiff > 20
                ? '⚠️ Hoge belastingstoename — zorg voor extra herstel'
                : loadDiff > 10
                  ? '📈 Goede progressie — houd je herstel in de gaten'
                  : loadDiff < -10
                    ? '📉 Herstelweek — mooi, je lichaam heeft dit nodig'
                    : '✅ Stabiele belasting — goed gebalanceerd'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
