'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface WhyThisWorkoutProps {
  workout: Workout
  weekPhase: string
}

export default function WhyThisWorkout({ workout, weekPhase }: WhyThisWorkoutProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate goal based on intensity and type
  const getGoal = (): string => {
    if (workout.type === 'rest') {
      return 'Herstel en adaptatie'
    }
    if (workout.type === 'race') {
      return 'Race performance'
    }

    switch (workout.intensity) {
      case 'easy':
        return 'Aeroob basiswerk'
      case 'moderate':
        return 'Duurvermogen'
      case 'hard':
        return workout.type === 'run'
          ? 'Lactaatdrempel training'
          : 'VO2max of FTP werk'
      default:
        return 'Trainingsadaptatie'
    }
  }

  // Generate physiological effect based on workout type and intensity
  const getPhysiologicalEffect = (): string => {
    if (workout.type === 'rest') {
      return 'Herstel is waar de adaptatie plaatsvindt. Je lichaam wordt sterker tijdens rust, niet tijdens training.'
    }
    if (workout.type === 'race') {
      return 'Wedstrijddag! Vertrouw op je voorbereiding. Volg je racestrategie.'
    }

    if (workout.intensity === 'easy') {
      return 'Bouwt mitochondriën op en versterkt bindweefsel. Essentieel voor volume zonder te veel belasting.'
    }

    if (workout.intensity === 'hard') {
      if (workout.type === 'run') {
        return 'Verhoogt je vermogen om hoge intensiteit langer vol te houden.'
      } else if (workout.type === 'bike') {
        return 'Verhoogt maximale zuurstofopname en vermogen.'
      }
    }

    if (workout.intensity === 'moderate') {
      if (workout.type === 'bike') {
        return 'Traint vetverbranding en houding op de fiets.'
      }
    }

    if (workout.type === 'swim') {
      return 'Techniek en uithoudingsvermogen in het water. Efficiëntie is belangrijker dan snelheid.'
    }

    return 'Trainingsadaptatie en verbeteringen'
  }

  // Get phase context
  const getPhaseContext = (): string => {
    const phase = weekPhase.toLowerCase()

    if (phase.includes('marathon')) {
      if (phase.includes('build')) {
        return 'Marathon Build: focus op race-specifiek tempo en lange runs.'
      }
      if (phase.includes('taper')) {
        return 'Marathon Taper: herstel en scherpen voor de race.'
      }
    }

    if (phase.includes('70.3') || phase.includes('triathlon')) {
      if (phase.includes('build')) {
        return '70.3 Build: tri-specifieke combinatie met multi-sport focus.'
      }
      if (phase.includes('taper')) {
        return '70.3 Taper: adaptatie en herstel voor race.'
      }
    }

    if (phase.includes('base')) {
      return 'Base Phase: fundering opbouwen met volume en consistentie.'
    }

    if (phase.includes('intensity')) {
      return 'Intensity Phase: kracht en snelheid verbeteren.'
    }

    return `${weekPhase}: training en adaptatie`
  }

  return (
    <div className="card-base border border-purple-700/30 bg-gradient-to-br from-purple-900/10 to-purple-800/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <HelpCircle size={20} className="text-purple-400 flex-shrink-0" />
          <h3 className="font-semibold text-white">Waarom deze training?</h3>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 pt-4 border-t border-purple-700/20">
          {/* Goal */}
          <div>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
              Doel
            </p>
            <p className="text-sm text-gray-200">{getGoal()}</p>
          </div>

          {/* Physiological effect */}
          <div>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
              Fysiologisch effect
            </p>
            <p className="text-sm text-gray-200">{getPhysiologicalEffect()}</p>
          </div>

          {/* Phase context */}
          <div>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
              Plek in het plan
            </p>
            <p className="text-sm text-gray-200">{getPhaseContext()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
