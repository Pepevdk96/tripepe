'use client'

import { useState } from 'react'
import { Clock, ChevronDown } from 'lucide-react'
import { Workout } from '@/lib/trainingData'
import { generateFallback } from '@/lib/helpers'

interface FallbackWorkoutProps {
  workout: Workout
}

export default function FallbackWorkout({ workout }: FallbackWorkoutProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const fallback = generateFallback(workout)

  if (!fallback) {
    return null
  }

  return (
    <div className="card-base bg-[#12121f] border border-amber-700/30 hover:bg-[#1a1a2e] transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Geen tijd? Verkorte versie:</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-amber-400 flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-700/20">
          <p className="text-sm text-gray-300 mb-1">
            <span className="font-medium text-amber-300">Duur:</span> {fallback.duration}
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-medium text-amber-300">Plan:</span> {fallback.description}
          </p>
        </div>
      )}
    </div>
  )
}
