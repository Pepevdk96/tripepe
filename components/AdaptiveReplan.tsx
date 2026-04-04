'use client'

import { useState } from 'react'
import { ChevronDown, Clock, AlertCircle, Zap } from 'lucide-react'
import { Workout } from '@/lib/trainingData'
import { generateFallback } from '@/lib/helpers'

interface AdaptiveReplanProps {
  weekSessions: Workout[]
}

interface SessionStatus {
  workout: Workout
  completed: boolean
  missed: boolean
  isKeyWorkout: boolean
}

export default function AdaptiveReplan({ weekSessions }: AdaptiveReplanProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [selectedReplans, setSelectedReplans] = useState<Record<string, string>>({})

  // Calculate session statuses (in a real app, this would come from completed workouts data)
  const sessionStatuses: SessionStatus[] = weekSessions.map((workout) => ({
    workout,
    completed: false, // Would be calculated from actual completion data
    missed: false, // Would be calculated from actual date comparison
    isKeyWorkout: workout.isKeyWorkout || false,
  }))

  const missedSessions = sessionStatuses.filter(
    (s) => s.missed && s.workout.type !== 'rest' && s.workout.type !== 'race'
  )

  if (missedSessions.length === 0) {
    return null
  }

  const handleReplanning = (workoutDate: string, option: string) => {
    setSelectedReplans((prev) => ({
      ...prev,
      [workoutDate]: option,
    }))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={18} className="text-orange-400" />
        <h3 className="font-bold text-white">Gemiste workouts</h3>
        <span className="bg-orange-900/30 text-orange-300 text-xs font-medium px-2 py-0.5 rounded">
          {missedSessions.length}
        </span>
      </div>

      <div className="space-y-2">
        {missedSessions.map((session) => {
          const workout = session.workout
          const isExpanded = expandedSession === workout.date
          const selected = selectedReplans[workout.date]
          const fallback = generateFallback(workout)
          const sportColors: Record<string, string> = {
            swim: 'border-[#00AAFF]/40 bg-[#00AAFF]/5',
            bike: 'border-[#00CC66]/40 bg-[#00CC66]/5',
            run: 'border-[#FF4444]/40 bg-[#FF4444]/5',
          }

          return (
            <div
              key={workout.date}
              className={`card-base border ${sportColors[workout.type] || 'border-gray-700/30'}`}
            >
              <button
                onClick={() =>
                  setExpandedSession(isExpanded ? null : workout.date)
                }
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <p className="text-sm font-medium text-white truncate">
                      {workout.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {workout.duration}
                      {workout.paceTarget && ` • ${workout.paceTarget}`}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 flex-shrink-0 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-700/30 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">
                    Herplanningsopties:
                  </p>

                  {/* Option 1: Shift to tomorrow */}
                  <button
                    onClick={() =>
                      handleReplanning(workout.date, 'tomorrow')
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selected === 'tomorrow'
                        ? 'bg-blue-900/40 border border-blue-700/50 text-blue-300'
                        : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-400 hover:bg-[#202038]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selected === 'tomorrow'}
                        onChange={() => {}}
                        className="w-3 h-3"
                      />
                      <span>Verschuif naar morgen</span>
                    </div>
                  </button>

                  {/* Option 2: Add to weekend */}
                  <button
                    onClick={() =>
                      handleReplanning(workout.date, 'weekend')
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selected === 'weekend'
                        ? 'bg-purple-900/40 border border-purple-700/50 text-purple-300'
                        : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-400 hover:bg-[#202038]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selected === 'weekend'}
                        onChange={() => {}}
                        className="w-3 h-3"
                      />
                      <span>Voeg toe aan weekend</span>
                    </div>
                  </button>

                  {/* Option 3: Shorter version */}
                  {fallback && (
                    <button
                      onClick={() =>
                        handleReplanning(workout.date, 'shorter')
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected === 'shorter'
                          ? 'bg-amber-900/40 border border-amber-700/50 text-amber-300'
                          : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-400 hover:bg-[#202038]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected === 'shorter'}
                          onChange={() => {}}
                          className="w-3 h-3"
                        />
                        <span>Verkort versie doen ({fallback.duration})</span>
                      </div>
                    </button>
                  )}

                  {/* Option 4: Skip (only for non-key workouts) */}
                  {!session.isKeyWorkout && (
                    <button
                      onClick={() => handleReplanning(workout.date, 'skip')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected === 'skip'
                          ? 'bg-red-900/40 border border-red-700/50 text-red-300'
                          : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-400 hover:bg-[#202038]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selected === 'skip'}
                          onChange={() => {}}
                          className="w-3 h-3"
                        />
                        <span className="text-xs">
                          Sla over (niet belangrijk)
                        </span>
                      </div>
                    </button>
                  )}

                  {session.isKeyWorkout && (
                    <p className="text-xs text-yellow-400/70 flex items-center gap-1">
                      <Zap size={12} />
                      Dit is een sleuteltraining - probeer het in te halen
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary of replans */}
      {Object.keys(selectedReplans).length > 0 && (
        <div className="card-base bg-green-900/20 border border-green-700/30">
          <p className="text-sm text-green-300 flex items-center gap-2">
            <Clock size={16} />
            {Object.keys(selectedReplans).length} herplanningen geselecteerd
          </p>
        </div>
      )}
    </div>
  )
}
