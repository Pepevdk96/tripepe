'use client'

import { useState } from 'react'
import { Trophy, Target, Flag, ChevronRight } from 'lucide-react'
import type { Race } from '@/lib/trainingData'

interface RaceGoalsProps {
  races: Race[]
}

export default function RaceGoals({ races }: RaceGoalsProps) {
  const [racePriorities, setRacePriorities] = useState<Record<string, 'A' | 'B' | 'C'>>(
    races.reduce((acc, race) => {
      acc[race.name] = race.priority || 'C'
      return acc
    }, {} as Record<string, 'A' | 'B' | 'C'>)
  )

  const cyclePriority = (raceName: string) => {
    const current = racePriorities[raceName]
    const next = current === 'A' ? 'B' : current === 'B' ? 'C' : 'A'
    setRacePriorities({ ...racePriorities, [raceName]: next })
  }

  const getRacesbyPriority = (priority: 'A' | 'B' | 'C') => {
    return races.filter((race) => (racePriorities[race.name] || race.priority) === priority)
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date('2026-04-04')
    const raceDate = new Date(dateString)
    const diff = raceDate.getTime() - today.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  const getPriorityBadgeColor = (priority: 'A' | 'B' | 'C') => {
    switch (priority) {
      case 'A':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40'
      case 'B':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/40'
      case 'C':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/40'
    }
  }

  const getPriorityBadgeText = (priority: 'A' | 'B' | 'C') => {
    switch (priority) {
      case 'A':
        return 'A-race (hoofddoel)'
      case 'B':
        return 'B-race (belangrijk)'
      case 'C':
        return 'C-race (training/plezier)'
    }
  }

  const getPriorityIcon = (priority: 'A' | 'B' | 'C') => {
    switch (priority) {
      case 'A':
        return Trophy
      case 'B':
        return Target
      case 'C':
        return Flag
    }
  }

  const renderRacesByPriority = (priority: 'A' | 'B' | 'C') => {
    const racesInGroup = getRacesbyPriority(priority)
    if (racesInGroup.length === 0) return null

    const Icon = getPriorityIcon(priority)
    const badgeClass = getPriorityBadgeColor(priority)
    const badgeText = getPriorityBadgeText(priority)

    return (
      <div key={priority} className="space-y-3">
        {/* Section header */}
        <div className="flex items-center gap-2">
          <Icon
            size={20}
            className={
              priority === 'A'
                ? 'text-yellow-500'
                : priority === 'B'
                  ? 'text-blue-500'
                  : 'text-gray-500'
            }
          />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            {priority}-races
          </h3>
        </div>

        {/* Race cards */}
        <div className="space-y-2">
          {racesInGroup.map((race) => {
            const daysUntil = getDaysUntil(race.date)
            const currentPriority = racePriorities[race.name] || race.priority

            return (
              <div
                key={race.name}
                className="card-base group hover:bg-[#1a1a2e] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white mb-1 truncate">{race.name}</h4>

                    {/* Date and days until */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <span>{new Date(race.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span className={daysUntil <= 7 ? 'text-[#FF4444] font-medium' : ''}>
                        {daysUntil} dagen
                      </span>
                    </div>

                    {/* Target time */}
                    <div className="text-sm text-gray-300">
                      Target: <span className="font-semibold text-white">{race.target}</span>
                    </div>
                  </div>

                  {/* Priority badge */}
                  <button
                    onClick={() => cyclePriority(race.name)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium ${badgeClass} hover:opacity-80 transition-opacity whitespace-nowrap`}
                  >
                    {getPriorityBadgeText(currentPriority || 'C')}
                  </button>
                </div>

                {/* A-race info */}
                {(currentPriority || race.priority) === 'A' && (
                  <div className="flex items-start gap-2 p-2 bg-[#1a1a2e] rounded-lg border-l-2 border-yellow-500/50">
                    <ChevronRight size={14} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300">Je trainingsplan is hierop afgestemd</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="card-base space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Race Goals</h3>
        <p className="text-sm text-gray-400">Organize your races by priority level</p>
      </div>

      {/* Race timeline */}
      <div className="space-y-2">
        {races.length > 0 && (
          <div className="flex items-center gap-2">
            {races.map((race, idx) => {
              const priority = racePriorities[race.name] || race.priority || 'C'
              const color =
                priority === 'A'
                  ? 'bg-yellow-500'
                  : priority === 'B'
                    ? 'bg-blue-500'
                    : 'bg-gray-500'
              return (
                <div key={race.name} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  {idx < races.length - 1 && <div className="flex-1 h-0.5 bg-gray-700" />}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Priority sections */}
      <div className="space-y-6">
        {renderRacesByPriority('A')}
        {renderRacesByPriority('B')}
        {renderRacesByPriority('C')}
      </div>
    </div>
  )
}
