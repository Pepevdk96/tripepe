'use client'

import { Waves, Bike, Footprints, Zzz, Clock, MapPin, Zap } from 'lucide-react'
import { PlannedWorkout, SPORT_COLORS } from '@/lib/types/workout'
import { SportBadge } from './sport-badge'

interface WorkoutCardDailyProps {
  workout: PlannedWorkout
  isPrimary?: boolean
  onClick?: () => void
}

const SPORT_ICONS = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
  rest: Zzz,
}

const INTENSITY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  recovery: 'bg-blue-500/20 text-blue-400',
  threshold: 'bg-orange-500/20 text-orange-400',
  interval: 'bg-red-500/20 text-red-400',
  long: 'bg-purple-500/20 text-purple-400',
  brick: 'bg-pink-500/20 text-pink-400',
}

const INTENSITY_LABELS: Record<string, string> = {
  easy: 'Gemakkelijk',
  recovery: 'Herstel',
  threshold: 'Drempel',
  interval: 'Interval',
  long: 'Lang',
  brick: 'Brick',
}

/**
 * Format duration from seconds to human-readable string
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format distance from meters to human-readable string
 */
function formatDistance(meters?: number): string {
  if (!meters) return '-'

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters} m`
}

export function WorkoutCardDaily({
  workout,
  isPrimary = true,
  onClick,
}: WorkoutCardDailyProps) {
  const colors = SPORT_COLORS[workout.sport]
  const Icon = SPORT_ICONS[workout.sport]
  const intensityColor = INTENSITY_COLORS[workout.intensity] || 'bg-gray-500/20 text-gray-400'
  const intensityLabel = INTENSITY_LABELS[workout.intensity] || workout.intensity

  const distance = formatDistance(workout.distanceMeters)
  const duration = formatDuration(workout.durationSeconds)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-[#242430] overflow-hidden transition-all hover:bg-[#1a1a2e] ${
        isPrimary
          ? 'bg-[#141420] ring-2 ring-opacity-50 ring-blue-500'
          : 'bg-[#0a0a0f]'
      }`}
    >
      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Header: Sport badge + Title + Intensity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <SportBadge sport={workout.sport} size="md" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg truncate">{workout.title}</h3>
              <p className="text-xs text-gray-500 truncate">{workout.description}</p>
            </div>
          </div>

          {/* Intensity Badge */}
          {workout.sport !== 'rest' && (
            <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${intensityColor}`}>
              {intensityLabel}
            </span>
          )}
        </div>

        {/* Primary Target */}
        {workout.targets.primary && (
          <div className="bg-[#1a1a2e] rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Doel
            </p>
            <div className="flex items-center gap-2">
              <Zap size={16} className={colors.tailwind} />
              <div className="min-w-0">
                <p className="text-white font-bold">
                  {workout.targets.primary.value || `${workout.targets.primary.min}-${workout.targets.primary.max}`}
                </p>
                <p className="text-xs text-gray-400">
                  {workout.targets.primary.zone || workout.targets.primary.label}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics: Distance, Duration */}
        <div className="grid grid-cols-2 gap-2">
          {workout.durationSeconds && (
            <div className="bg-[#1a1a2e] rounded-lg p-3 flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Duur</p>
                <p className="text-sm font-semibold text-white">{duration}</p>
              </div>
            </div>
          )}

          {workout.distanceMeters && (
            <div className="bg-[#1a1a2e] rounded-lg p-3 flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Afstand</p>
                <p className="text-sm font-semibold text-white">{distance}</p>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Targets */}
        {workout.targets.secondary && workout.targets.secondary.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Secundaire doelen
            </p>
            <div className="space-y-1">
              {workout.targets.secondary.map((target, idx) => (
                <div key={idx} className="text-xs text-gray-400 bg-[#1a1a2e] rounded px-2 py-1">
                  {target.label || target.zone} {
                    target.min && target.max ? `${target.min}-${target.max}` : target.value
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Workout Badge */}
        {workout.isKeyWorkout && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <p className="text-xs font-semibold text-yellow-400">
              Dit is een belangrijke training — voorkeur geven
            </p>
          </div>
        )}
      </div>

      {/* Call-to-action footer */}
      <div className="border-t border-[#242430] bg-[#0a0a0f] px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">Klik om training te starten</p>
        <span className="text-blue-500 font-bold">→</span>
      </div>
    </button>
  )
}
