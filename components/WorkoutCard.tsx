'use client'

import { Waves, Bike, Footprints, Zzz, Trophy } from 'lucide-react'
import { Workout } from '@/lib/trainingData'
import { getSportColor, getIntensityColor, getIntensityLabel } from '@/lib/helpers'

interface WorkoutCardProps {
  workout: Workout
  showDate?: boolean
  expandable?: boolean
}

export default function WorkoutCard({
  workout,
  showDate = false,
  expandable = false,
}: WorkoutCardProps) {
  // Get the appropriate icon
  const getIcon = () => {
    switch (workout.type) {
      case 'swim':
        return <Waves size={20} />
      case 'bike':
        return <Bike size={20} />
      case 'run':
        return <Footprints size={20} />
      case 'rest':
        return <Zzz size={20} />
      case 'race':
        return <Trophy size={20} />
      default:
        return null
    }
  }

  // Get border color based on sport
  const getBorderClass = () => {
    const color = getSportColor(workout.type)
    if (color === '#00AAFF') return 'border-l-4 border-[#00AAFF]'
    if (color === '#00CC66') return 'border-l-4 border-[#00CC66]'
    if (color === '#FF4444') return 'border-l-4 border-[#FF4444]'
    if (color === '#666688') return 'border-l-4 border-[#666688]'
    if (color === '#FFD700') return 'border-l-4 border-[#FFD700]'
    return 'border-l-4 border-[#8888aa]'
  }

  return (
    <div
      className={`card-base ${getBorderClass()} hover:bg-[#1a1a2e] transition-all cursor-pointer ${
        expandable ? 'group' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Sport icon */}
        <div
          className="p-2 rounded-lg flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${getSportColor(workout.type)}20` }}
        >
          <div style={{ color: getSportColor(workout.type) }}>
            {getIcon()}
          </div>
        </div>

        {/* Workout details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{workout.title}</h3>
            {workout.type !== 'rest' && (
              <span
                className={`intensity-badge ${getIntensityColor(
                  workout.intensity
                )} flex-shrink-0`}
              >
                {getIntensityLabel(workout.intensity)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-2 line-clamp-1">
            {workout.description}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-3 flex-wrap">
            {workout.duration && (
              <span className="text-xs text-gray-500 bg-[#1a1a2e] px-2 py-1 rounded">
                ⏱ {workout.duration}
              </span>
            )}
            {workout.distance && (
              <span className="text-xs text-gray-500 bg-[#1a1a2e] px-2 py-1 rounded">
                📍 {workout.distance}
              </span>
            )}
            {workout.paceTarget && (
              <span className="text-xs text-gray-500 bg-[#1a1a2e] px-2 py-1 rounded">
                ⚡ {workout.paceTarget}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
