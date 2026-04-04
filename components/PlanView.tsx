'use client'

import { getCurrentWeek, getProgressPercentage, formatDate } from '@/lib/helpers'
import type { Week, Race } from '@/lib/trainingData'
import { races } from '@/lib/trainingData'
import PlanReshapeInfo from './PlanReshapeInfo'

interface PlanViewProps {
  trainingPlan: Week[]
  onSelectWeek?: (weekNumber: number) => void
}

export default function PlanView({ trainingPlan, onSelectWeek }: PlanViewProps) {
  const currentWeek = getCurrentWeek(trainingPlan)

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">9-Week Plan</h2>
        <p className="text-sm text-gray-400">Marathon + 70.3 Triathlon</p>
      </div>

      {/* Plan Reshape Info */}
      <PlanReshapeInfo races={races} currentWeekPhase={currentWeek?.phase} />

      {/* Timeline */}
      <div className="space-y-2">
        {trainingPlan.map((week, idx) => {
          const isCurrentWeek = week.number === currentWeek?.number
          const progress = getProgressPercentage(week.number)

          return (
            <button
              key={week.number}
              onClick={() => onSelectWeek?.(week.number)}
              className={`w-full p-4 rounded-xl transition-all ${
                isCurrentWeek
                  ? 'ring-2 ring-[#FF4444] pulse-custom'
                  : 'hover:bg-[#1a1a2e]'
              } ${week.phaseColor.replace('bg-gradient', 'bg').replace('-to-', ' to-')} group`}
            >
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isCurrentWeek
                        ? 'border-[#FF4444] bg-[#FF4444]'
                        : 'border-gray-600 bg-[#0a0a0f]'
                    } transition-all`}
                  />
                  {idx < trainingPlan.length - 1 && (
                    <div className="w-0.5 h-8 bg-gradient-to-b from-gray-600 to-gray-800" />
                  )}
                </div>

                {/* Week info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">
                      Week {week.number}
                    </span>
                    <span className="text-xs font-bold text-white bg-black/30 px-2 py-1 rounded">
                      {week.totalHours}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 mb-2">
                    {formatDate(week.dateStart)} - {formatDate(week.dateEnd)}
                  </p>

                  <p className="text-sm text-gray-200 mb-3">{week.phase}</p>

                  <p className="text-xs text-gray-400 italic mb-3">
                    Key: {week.keyWorkout}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-white/60 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick stats */}
      <div className="card-base space-y-3">
        <h3 className="font-semibold text-white">Plan Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Total Training Hours</p>
            <p className="text-2xl font-bold text-white">
              {(
                trainingPlan.reduce((sum, week) => sum + parseFloat(week.totalHours), 0)
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
            <p className="text-xs text-gray-400 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-white">
              {trainingPlan.reduce(
                (sum, week) =>
                  sum + week.sessions.filter((s) => s.type !== 'rest').length,
                0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
