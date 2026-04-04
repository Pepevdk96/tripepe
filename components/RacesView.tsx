'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { marathonSplits, triathlonSplits } from '@/lib/trainingData'
import type { Race } from '@/lib/trainingData'
import RaceCountdown from './RaceCountdown'

interface RacesViewProps {
  races: Race[]
}

export default function RacesView({ races }: RacesViewProps) {
  const [expandedSplit, setExpandedSplit] = useState<'marathon' | '70.3' | null>(null)
  const currentWeek = 1

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Race Info</h2>
        <p className="text-sm text-gray-400">Pacing strategy & splits</p>
      </div>

      {/* Race countdowns */}
      <div className="space-y-4">
        {races.map((race) => (
          <RaceCountdown key={race.name} race={race} currentWeek={currentWeek} />
        ))}
      </div>

      {/* Marathon splits */}
      <div className="space-y-3">
        <button
          onClick={() =>
            setExpandedSplit(expandedSplit === 'marathon' ? null : 'marathon')
          }
          className="w-full card-base flex items-center justify-between hover:bg-[#1a1a2e] transition-colors group"
        >
          <div className="text-left flex-1">
            <h3 className="font-bold text-white mb-1">Marathon Rotterdam</h3>
            <p className="text-sm text-gray-400">Pacing splits & nutrition</p>
          </div>
          {expandedSplit === 'marathon' ? (
            <ChevronUp className="text-gray-400 group-hover:text-white" />
          ) : (
            <ChevronDown className="text-gray-400 group-hover:text-white" />
          )}
        </button>

        {expandedSplit === 'marathon' && (
          <div className="card-base space-y-2">
            <div className="mb-4 p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#FF4444]">
              <p className="text-sm text-white font-medium mb-2">Strategy</p>
              <p className="text-xs text-gray-300">
                Negative split approach: Start conservative at 4:05/km, cruise at 4:00-4:01/km
                for majority, finish strong with 3:58-3:59/km.
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {marathonSplits.map((split, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-2 p-3 bg-[#1a1a2e] rounded-lg text-sm"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-1">KM</p>
                    <p className="font-bold text-white">{split.km}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pace</p>
                    <p className="font-bold text-white">{split.pace}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Time</p>
                    <p className="font-bold text-white">{split.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="font-bold text-white">{split.cumulative}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fuel</p>
                    <p className="text-xs text-gray-300">{split.nutrition}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 70.3 splits */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedSplit(expandedSplit === '70.3' ? null : '70.3')}
          className="w-full card-base flex items-center justify-between hover:bg-[#1a1a2e] transition-colors group"
        >
          <div className="text-left flex-1">
            <h3 className="font-bold text-white mb-1">Half Ironman 70.3</h3>
            <p className="text-sm text-gray-400">Race plan & splits</p>
          </div>
          {expandedSplit === '70.3' ? (
            <ChevronUp className="text-gray-400 group-hover:text-white" />
          ) : (
            <ChevronDown className="text-gray-400 group-hover:text-white" />
          )}
        </button>

        {expandedSplit === '70.3' && (
          <div className="card-base space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#00AAFF]">
                <p className="text-xs text-gray-400 mb-1">Swim</p>
                <p className="text-xl font-bold text-[#00AAFF]">{triathlonSplits.swim}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#00AAFF]">
                <p className="text-xs text-gray-400 mb-1">T1</p>
                <p className="text-xl font-bold text-[#00AAFF]">{triathlonSplits.t1}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#00CC66]">
                <p className="text-xs text-gray-400 mb-1">Bike</p>
                <p className="text-xl font-bold text-[#00CC66]">{triathlonSplits.bike}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#00CC66]">
                <p className="text-xs text-gray-400 mb-1">T2</p>
                <p className="text-xl font-bold text-[#00CC66]">{triathlonSplits.t2}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#FF4444]">
                <p className="text-xs text-gray-400 mb-1">Run</p>
                <p className="text-xl font-bold text-[#FF4444]">{triathlonSplits.run}</p>
              </div>
              <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-4 border-[#FFD700]">
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-xl font-bold text-[#FFD700]">{triathlonSplits.total}</p>
              </div>
            </div>

            <div className="p-3 bg-[#1a1a2e] rounded-lg">
              <p className="text-sm font-medium text-white mb-2">Bike Nutrition</p>
              <div className="space-y-1">
                {triathlonSplits.bikeNutrition.map((item, idx) => (
                  <p key={idx} className="text-xs text-gray-300">- {item}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
