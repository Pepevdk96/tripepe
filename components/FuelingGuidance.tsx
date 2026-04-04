'use client'

import { Utensils } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface FuelingGuidanceProps {
  workout: Workout
}

export default function FuelingGuidance({ workout }: FuelingGuidanceProps) {
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

  // Generate guidance based on workout type, duration, and intensity
  const getGuidance = () => {
    const guidance: {
      timing: string
      advice: string
    }[] = []

    // 3 hours before (only for workouts > 90min)
    if (durationMinutes > 90) {
      guidance.push({
        timing: '3 uur voor',
        advice: 'Volledige maaltijd: rijst/pasta + kip/vis + groenten. ~600 kcal.',
      })
    }

    // 1 hour before
    if (workout.intensity === 'easy' || workout.intensity === 'moderate') {
      guidance.push({
        timing: '1 uur voor',
        advice: 'Lichte snack: banaan + rijstwafel of toast met honing. ~200 kcal.',
      })
    } else if (workout.intensity === 'hard' || workout.intensity === 'race') {
      guidance.push({
        timing: '1 uur voor',
        advice: 'Makkelijk verteerbare koolhydraten: witte toast met jam of energiereep. ~250 kcal.',
      })
    }

    // 15 minutes before
    if (durationMinutes < 60) {
      guidance.push({
        timing: '15 min voor',
        advice: 'Water. Geen extra fuel nodig.',
      })
    } else if (durationMinutes <= 90) {
      guidance.push({
        timing: '15 min voor',
        advice: 'Slok sportdrank. Overweeg 1 gel mee te nemen.',
      })
    } else {
      guidance.push({
        timing: '15 min voor',
        advice: 'Sportdrank + 1 gel in zak. Start fuel na 45min.',
      })
    }

    return guidance
  }

  const guidance = getGuidance()

  return (
    <div className="card-base border border-amber-700/30 bg-gradient-to-br from-amber-900/10 to-amber-800/5">
      <div className="flex items-center gap-3 mb-4">
        <Utensils size={20} className="text-amber-400 flex-shrink-0" />
        <h3 className="font-semibold text-white">Voeding voor training</h3>
      </div>

      <div className="space-y-3">
        {guidance.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex-shrink-0 w-20">
              <p className="text-xs font-semibold text-amber-300">{item.timing}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-200">{item.advice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
