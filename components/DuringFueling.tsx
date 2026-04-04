'use client'

import { Droplets } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface DuringFuelingProps {
  workout: Workout
}

export default function DuringFueling({ workout }: DuringFuelingProps) {
  // Parse duration in minutes from duration string (e.g., "90" or "1:30")
  const getDurationInMinutes = (): number => {
    const duration = workout.duration
    if (!duration) return 0

    // Try parsing as "HH:MM" format
    if (duration.includes(':')) {
      const parts = duration.split(':')
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1])
      }
    }

    // Try parsing as plain number (minutes)
    const minutes = parseInt(duration)
    return isNaN(minutes) ? 0 : minutes
  }

  const durationMinutes = getDurationInMinutes()

  // Calculate fueling recommendations
  const calculateFueling = () => {
    const isHardIntensity = workout.intensity === 'hard' || workout.intensity === 'race'
    const isModerateIntensity = workout.intensity === 'moderate'
    const durationHours = durationMinutes / 60

    let carbs = ''
    let fluidRange = ''
    let sodium = ''
    let practical = ''

    // Calculate carbs based on intensity and duration
    if (isHardIntensity && durationMinutes > 60) {
      const carbMin = Math.round(60 * durationHours)
      const carbMax = Math.round(90 * durationHours)
      carbs = `${carbMin}-${carbMax}g/uur`
      practical = `= ${Math.round(carbMin / 30)}-${Math.round(carbMax / 30)} gels per uur`
    } else if (isModerateIntensity && durationMinutes > 60) {
      const carbMin = Math.round(30 * durationHours)
      const carbMax = Math.round(60 * durationHours)
      carbs = `${carbMin}-${carbMax}g/uur`
      practical = `= ${Math.round(carbMin / 30)}-${Math.round(carbMax / 30)} gels per uur of 1 gel + 500ml sportdrank`
    } else {
      carbs = 'Afhankelijk van intensiteit en duur'
      practical = 'N.v.t. voor werkingen < 60 minuten'
    }

    // Calculate fluid based on sport type
    if (workout.type === 'bike') {
      fluidRange = '600-750ml/uur (meer voor warme omstandigheden)'
      practical = practical !== '' ? practical + ' | Vul 2 bidons: 1 sportdrank, 1 water' : 'Vul 2 bidons: 1 sportdrank, 1 water'
    } else if (workout.type === 'run') {
      fluidRange = '500-750ml/uur'
    } else if (workout.type === 'swim') {
      fluidRange = '250-500ml/uur (water beschikbaar na segmenten)'
    } else {
      fluidRange = '500-750ml/uur'
    }

    // Calculate sodium for sessions > 90 min
    if (durationMinutes > 90) {
      sodium = '500-700mg/uur'
    } else {
      sodium = 'Niet nodig voor sessies < 90 minuten'
    }

    return {
      carbs,
      fluid: fluidRange,
      sodium,
      practical,
    }
  }

  const fueling = calculateFueling()

  return (
    <div className="card-base border border-cyan-700/30 bg-gradient-to-br from-cyan-900/10 to-cyan-800/5">
      <div className="flex items-center gap-3 mb-4">
        <Droplets size={20} className="text-cyan-400 flex-shrink-0" />
        <h3 className="font-semibold text-white">Fuel tijdens training</h3>
      </div>

      <div className="space-y-3">
        {/* Carbs */}
        <div>
          <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
            Koolhydraten
          </p>
          <p className="text-sm text-gray-200">{fueling.carbs}</p>
        </div>

        {/* Fluid */}
        <div>
          <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
            Vloeistof
          </p>
          <p className="text-sm text-gray-200">{fueling.fluid}</p>
        </div>

        {/* Sodium */}
        <div>
          <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
            Natrium
          </p>
          <p className="text-sm text-gray-200">{fueling.sodium}</p>
        </div>

        {/* Practical translation */}
        {fueling.practical && (
          <div className="pt-2 border-t border-cyan-700/20">
            <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
              Praktisch
            </p>
            <p className="text-sm text-gray-200">{fueling.practical}</p>
          </div>
        )}
      </div>
    </div>
  )
}
