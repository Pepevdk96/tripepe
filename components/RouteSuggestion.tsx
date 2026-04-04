'use client'

import { MapPin, Download, ArrowRight } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface RouteSuggestionProps {
  workout: Workout
}

interface RouteSuggestion {
  name: string
  description: string
  distance: string
  elevation: 'vlak' | 'heuvelachtig'
  type: 'loop' | 'out-and-back'
}

export default function RouteSuggestion({ workout }: RouteSuggestionProps) {
  const getRouteSuggestion = (): RouteSuggestion | null => {
    const workoutType = workout.type
    const intensity = workout.intensity

    // No routes for swim or rest
    if (workoutType === 'swim' || workoutType === 'rest') {
      return null
    }

    if (workoutType === 'run') {
      if (intensity === 'easy') {
        return {
          name: 'Vlak parcours langs de gracht',
          description: 'Weinig verkeer, ontspannen route',
          distance: '5-8km',
          elevation: 'vlak',
          type: 'loop',
        }
      }
      if (intensity === 'hard') {
        return {
          name: 'Atletiekbaan of vlak park met meetpunten',
          description: 'Perfecte omstandigheden voor intervallen',
          distance: 'Afhankelijk van sessie',
          elevation: 'vlak',
          type: 'loop',
        }
      }
      // Long run (moderate intensity typically)
      return {
        name: 'Rondje buitengebied',
        description: 'Rustige wegen, drinkfontein bij km 10',
        distance: '10-20km',
        elevation: 'vlak',
        type: 'loop',
      }
    }

    if (workoutType === 'bike') {
      if (intensity === 'easy') {
        return {
          name: 'Vlakke polderwegen',
          description: 'Weinig wind, veilige wegen',
          distance: '30-50km',
          elevation: 'vlak',
          type: 'loop',
        }
      }
      if (intensity === 'hard') {
        return {
          name: 'Parcours met heuvels of dijken',
          description: 'Voor wattage-werk en VO2max training',
          distance: '40-60km',
          elevation: 'heuvelachtig',
          type: 'loop',
        }
      }
      // Long bike
      return {
        name: 'Grote ronde via platteland',
        description: 'Tankstation halverwege, mooie natuur',
        distance: '60-120km',
        elevation: 'vlak',
        type: 'loop',
      }
    }

    return null
  }

  const suggestion = getRouteSuggestion()

  if (!suggestion) {
    return null
  }

  const handleExportGPX = () => {
    // Toast notification
    const message = document.createElement('div')
    message.className =
      'fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#E8755A] text-white px-4 py-2 rounded-lg text-sm z-50 animate-pulse'
    message.textContent = 'GPX export komt binnenkort'
    document.body.appendChild(message)

    setTimeout(() => {
      message.remove()
    }, 2000)
  }

  return (
    <div className="card-base border border-green-700/30 bg-gradient-to-br from-green-900/10 to-green-800/5">
      <div className="flex items-start gap-3 mb-4">
        <MapPin size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{suggestion.name}</h3>
          <p className="text-xs text-gray-400">{suggestion.description}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.distance}
        </span>
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.elevation === 'vlak' ? 'Vlak' : 'Heuvelachtig'}
        </span>
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.type === 'loop' ? 'Loop' : 'Out-and-back'}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm font-medium cursor-not-allowed opacity-50 hover:opacity-50"
        >
          <ArrowRight size={16} />
          Bekijk route
        </button>
        <button
          onClick={handleExportGPX}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm font-medium hover:bg-green-500/30 transition-colors"
        >
          <Download size={16} />
          Exporteer GPX
        </button>
      </div>
    </div>
  )
}
