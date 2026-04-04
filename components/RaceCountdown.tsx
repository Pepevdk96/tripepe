'use client'

import { getDaysUntil, getProgressPercentage } from '@/lib/helpers'
import { Race } from '@/lib/trainingData'

interface RaceCountdownProps {
  race: Race
  currentWeek?: number
}

export default function RaceCountdown({ race, currentWeek = 1 }: RaceCountdownProps) {
  const daysUntil = getDaysUntil(race.date)
  const progress = getProgressPercentage(currentWeek)

  return (
    <div className="card-base space-y-4">
      {/* Race header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{race.name}</h3>
        <p className="text-sm text-gray-400">{race.type === 'marathon' ? 'Marathon' : 'Half Ironman'}</p>
      </div>

      {/* Days countdown */}
      <div className="text-center py-4 bg-[#1a1a2e] rounded-xl">
        <div className="text-4xl font-bold gradient-text">{daysUntil}</div>
        <div className="text-sm text-gray-400 mt-1">days to go</div>
      </div>

      {/* Target time */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a2e] rounded-xl">
        <span className="text-sm text-gray-400">Target</span>
        <span className="font-bold text-white">{race.target}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Plan progress</span>
          <span className="text-xs font-medium text-gray-400">{progress}%</span>
        </div>
        <div className="w-full bg-[#1a1a2e] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF4444] to-[#FFD700] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Race date */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {new Date(race.date).toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}
