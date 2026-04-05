'use client'

import { useState } from 'react'
import { Activity, Moon, Smile, Frown, Meh, ChevronDown, ChevronUp, Zap } from 'lucide-react'

interface ReadinessCheckProps {
  onReadinessChange?: (score: number) => void
}

type ReadinessCategory = 'sleep' | 'energy' | 'soreness' | 'motivation'

interface ReadinessState {
  sleep: number
  energy: number
  soreness: number
  motivation: number
}

const categoryConfig: Record<ReadinessCategory, { label: string; icon: string; lowLabel: string; highLabel: string }> = {
  sleep: { label: 'Slaap', icon: '🌙', lowLabel: 'Slecht', highLabel: 'Uitgerust' },
  energy: { label: 'Energie', icon: '⚡', lowLabel: 'Leeg', highLabel: 'Vol energie' },
  soreness: { label: 'Spierpijn', icon: '💪', lowLabel: 'Veel pijn', highLabel: 'Geen pijn' },
  motivation: { label: 'Motivatie', icon: '🔥', lowLabel: 'Geen zin', highLabel: 'Super gemotiveerd' },
}

export default function ReadinessCheck({ onReadinessChange }: ReadinessCheckProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [ratings, setRatings] = useState<ReadinessState>({
    sleep: 0,
    energy: 0,
    soreness: 0,
    motivation: 0,
  })
  const [submitted, setSubmitted] = useState(false)

  const handleRating = (category: ReadinessCategory, value: number) => {
    const newRatings = { ...ratings, [category]: value }
    setRatings(newRatings)
  }

  const totalScore = Math.round(
    (ratings.sleep + ratings.energy + ratings.soreness + ratings.motivation) / 4
  )

  const allRated = ratings.sleep > 0 && ratings.energy > 0 && ratings.soreness > 0 && ratings.motivation > 0

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-400'
    if (score >= 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 4) return 'Go! Volle bak trainen'
    if (score >= 3) return 'Oké — doe de geplande training'
    if (score >= 2) return 'Pas aan — doe de verkorte versie'
    return 'Rust — skip of lichte sessie'
  }

  const getScoreAdvice = (score: number) => {
    if (score >= 4) return 'Je lichaam is hersteld. Ga ervoor!'
    if (score >= 3) return 'Normaal trainen, luister naar je lichaam onderweg.'
    if (score >= 2) return 'Overweeg de fallback workout of verlaag de intensiteit.'
    return 'Rust is ook trainen. Neem een extra rustdag of doe een lichte walk.'
  }

  const handleSubmit = () => {
    setSubmitted(true)
    onReadinessChange?.(totalScore)
  }

  return (
    <div className="card-base border border-cyan-700/30 bg-gradient-to-br from-cyan-900/10 to-blue-900/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">Readiness Check</span>
          {submitted && (
            <span className={`text-xs font-bold ${getScoreColor(totalScore)}`}>
              {totalScore}/5
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {!submitted ? (
            <>
              <p className="text-xs text-gray-400">
                Hoe voel je je vandaag? Dit helpt je training aan te passen.
              </p>

              {(Object.keys(categoryConfig) as ReadinessCategory[]).map((cat) => {
                const config = categoryConfig[cat]
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">
                        {config.icon} {config.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ratings[cat] > 0
                          ? ratings[cat] <= 2
                            ? config.lowLabel
                            : ratings[cat] >= 4
                              ? config.highLabel
                              : 'Gemiddeld'
                          : ''}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleRating(cat, val)}
                          className={`flex-1 h-8 rounded-md text-xs font-medium transition-all ${
                            ratings[cat] === val
                              ? val <= 2
                                ? 'bg-red-500/30 border border-red-500 text-red-300'
                                : val === 3
                                  ? 'bg-yellow-500/30 border border-yellow-500 text-yellow-300'
                                  : 'bg-green-500/30 border border-green-500 text-green-300'
                              : ratings[cat] > 0 && val <= ratings[cat]
                                ? 'bg-gray-700/50 border border-gray-600 text-gray-400'
                                : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-500 hover:bg-[#202038]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              {allRated && (
                <button
                  onClick={handleSubmit}
                  className="w-full py-2 rounded-lg bg-cyan-600/20 border border-cyan-600/40 text-cyan-300 text-sm font-medium hover:bg-cyan-600/30 transition-colors"
                >
                  Bekijk advies
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {/* Score display */}
              <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                <div>
                  <p className={`text-lg font-bold ${getScoreColor(totalScore)}`}>
                    {totalScore}/5
                  </p>
                  <p className={`text-xs ${getScoreColor(totalScore)}`}>
                    {getScoreLabel(totalScore)}
                  </p>
                </div>
                <div className="text-3xl">
                  {totalScore >= 4 ? '💚' : totalScore >= 3 ? '💛' : '🔴'}
                </div>
              </div>

              {/* Advice */}
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-2 border-cyan-500">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Advies</p>
                <p className="text-sm text-gray-300">{getScoreAdvice(totalScore)}</p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(categoryConfig) as ReadinessCategory[]).map((cat) => {
                  const config = categoryConfig[cat]
                  return (
                    <div key={cat} className="text-center p-2 bg-[#1a1a2e] rounded-lg">
                      <p className="text-sm">{config.icon}</p>
                      <p className={`text-xs font-bold ${getScoreColor(ratings[cat])}`}>
                        {ratings[cat]}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSubmitted(false)
                  setRatings({ sleep: 0, energy: 0, soreness: 0, motivation: 0 })
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Opnieuw invullen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
