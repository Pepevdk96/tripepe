'use client'

import { Sliders } from 'lucide-react'
import type { Race } from '@/lib/trainingData'

interface PlanReshapeInfoProps {
  races: Race[]
  currentWeekPhase?: string
}

export default function PlanReshapeInfo({ races, currentWeekPhase = 'Build' }: PlanReshapeInfoProps) {
  const today = new Date('2026-04-04')

  // Get A-races sorted by date
  const aRaces = races
    .filter((race) => race.priority === 'A')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const getDaysUntil = (dateString: string) => {
    const raceDate = new Date(dateString)
    const diff = raceDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getPhaseInfo = (daysUntil: number) => {
    if (daysUntil > 42) {
      return {
        phase: 'Base',
        label: 'Base fase — volume opbouwen',
        color: 'from-green-600 to-green-500',
        textColor: 'text-green-400',
      }
    } else if (daysUntil > 28) {
      return {
        phase: 'Build',
        label: 'Build fase — race-specifiek werk',
        color: 'from-blue-600 to-blue-500',
        textColor: 'text-blue-400',
      }
    } else if (daysUntil > 7) {
      return {
        phase: 'Peak',
        label: 'Peak fase — maximale fitness',
        color: 'from-purple-600 to-purple-500',
        textColor: 'text-purple-400',
      }
    } else if (daysUntil > 0) {
      return {
        phase: 'Taper',
        label: 'Taper fase — herstel en scherpte',
        color: 'from-orange-600 to-orange-500',
        textColor: 'text-orange-400',
      }
    } else {
      return {
        phase: 'Race',
        label: 'Race week! Vertrouw op je voorbereiding',
        color: 'from-yellow-600 to-yellow-500',
        textColor: 'text-yellow-400',
      }
    }
  }

  // Calculate the next A-race
  const nextARace = aRaces.find((race) => getDaysUntil(race.date) > 0)
  const nextRaceDays = nextARace ? getDaysUntil(nextARace.date) : null
  const phaseInfo = nextRaceDays !== null ? getPhaseInfo(nextRaceDays) : null

  // Calculate time between two A-races
  const pivotText =
    aRaces.length > 1
      ? `Na ${aRaces[0].name}: ${Math.ceil(
          (new Date(aRaces[1].date).getTime() - new Date(aRaces[0].date).getTime()) /
            (1000 * 60 * 60 * 24)
        )} weken pivot naar triathlon-specifiek (fietsprioriteit + bricks)`
      : null

  return (
    <div className={`card-base space-y-4 border-l-4 border-[#00AAFF]`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sliders size={20} className="text-[#00AAFF]" />
        <h3 className="text-lg font-bold text-white">Plan aanpassing</h3>
      </div>

      {/* Timeline Visualization */}
      {aRaces.length > 0 && (
        <div className="space-y-4">
          {/* Phase timeline */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Timeline</p>

            {aRaces.map((race, idx) => {
              const daysUntil = getDaysUntil(race.date)
              const info = getPhaseInfo(daysUntil)

              return (
                <div key={race.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{race.name}</span>
                    <span className="text-gray-400">
                      {daysUntil > 0
                        ? `${daysUntil} days away`
                        : daysUntil === 0
                          ? 'Today!'
                          : 'Past race'}
                    </span>
                  </div>

                  {daysUntil > 0 && (
                    <div className="relative h-8 bg-[#1a1a2e] rounded-lg overflow-hidden">
                      {/* Phase segments */}
                      <div className="flex h-full">
                        {/* Base */}
                        {daysUntil > 42 && (
                          <div className="flex-1 bg-gradient-to-r from-green-600/30 to-green-500/30 relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-green-300 font-medium">Base</span>
                            </div>
                          </div>
                        )}

                        {/* Build */}
                        {daysUntil > 28 && daysUntil <= 42 && (
                          <div className="flex-1 bg-gradient-to-r from-blue-600/30 to-blue-500/30 relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-blue-300 font-medium">Build</span>
                            </div>
                          </div>
                        )}

                        {/* Peak */}
                        {daysUntil > 7 && daysUntil <= 28 && (
                          <div className="flex-1 bg-gradient-to-r from-purple-600/30 to-purple-500/30 relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-purple-300 font-medium">Peak</span>
                            </div>
                          </div>
                        )}

                        {/* Taper */}
                        {daysUntil > 0 && daysUntil <= 7 && (
                          <div className="flex-1 bg-gradient-to-r from-orange-600/30 to-orange-500/30 relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-orange-300 font-medium">Taper</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current position marker */}
                      {daysUntil > 0 && (
                        <div className="absolute top-0 bottom-0 w-1 bg-[#FF4444]" style={{ left: '0%' }} />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Current focus */}
          {phaseInfo && (
            <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-2 border-[#00AAFF]">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Current Focus</p>
              <p className={`text-sm font-medium ${phaseInfo.textColor}`}>{phaseInfo.label}</p>
            </div>
          )}

          {/* Race interaction */}
          {pivotText && (
            <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-2 border-blue-500">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Race Interaction</p>
              <p className="text-sm text-blue-300">{pivotText}</p>
            </div>
          )}
        </div>
      )}

      {/* No A-races message */}
      {aRaces.length === 0 && (
        <div className="p-3 bg-[#1a1a2e] rounded-lg">
          <p className="text-sm text-gray-400">No A-races scheduled. Set race priorities to see plan adaptation.</p>
        </div>
      )}
    </div>
  )
}
