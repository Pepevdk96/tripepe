'use client'

import { useState } from 'react'
import {
  getGreeting,
  getTodayWorkout,
  getCurrentWeek,
  getRecoveryTips,
} from '@/lib/helpers'
import type { Week, Race } from '@/lib/trainingData'
import WorkoutCard from './WorkoutCard'
import RaceCountdown from './RaceCountdown'
import { Play, Lightbulb } from 'lucide-react'

interface TodayViewProps {
  trainingPlan: Week[]
  races: Race[]
}

export default function TodayView({ trainingPlan, races }: TodayViewProps) {
  const todayWorkout = getTodayWorkout(trainingPlan)
  const currentWeek = getCurrentWeek(trainingPlan)
  const [showTip, setShowTip] = useState(false)

  const tips = getRecoveryTips()
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{getGreeting()}</h2>
        <p className="text-gray-400 text-sm">
          {currentWeek && `Week ${currentWeek.number} - ${currentWeek.phase}`}
        </p>
      </div>

      {/* Race countdowns */}
      <div className="space-y-3">
        {races.map((race) => (
          <RaceCountdown
            key={race.name}
            race={race}
            currentWeek={currentWeek?.number || 1}
          />
        ))}
      </div>

      {/* Today's workout */}
      {todayWorkout ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Vandaag</h3>
          </div>

          <div className="glow-run">
            <WorkoutCard workout={todayWorkout} />
          </div>

          {/* Start workout button */}
          {todayWorkout.type !== 'rest' && (
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Play size={20} />
              Start Workout
            </button>
          )}
        </div>
      ) : (
        // Rest day message
        <div className="card-base bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30">
          <div className="text-center py-8">
            <h3 className="text-lg font-bold text-white mb-2">Rustdag!</h3>
            <p className="text-gray-400 text-sm mb-4">Geniet van je recovery!</p>
          </div>
        </div>
      )}

      {/* This week overview */}
      {currentWeek && (
        <div className="space-y-3">
          <h3 className="font-bold text-white">Deze week</h3>
          <div className="flex items-center justify-center gap-2">
            {currentWeek.sessions.map((session, idx) => {
              const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
              const sportColors: Record<string, string> = {
                swim: 'bg-[#00AAFF]/20 border-[#00AAFF]',
                bike: 'bg-[#00CC66]/20 border-[#00CC66]',
                run: 'bg-[#FF4444]/20 border-[#FF4444]',
                rest: 'bg-[#666688]/20 border-[#666688]',
                race: 'bg-[#FFD700]/20 border-[#FFD700]',
              }

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-lg border ${
                    sportColors[session.type] || 'bg-gray-900/20 border-gray-700'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-400">
                    {dayNames[idx]}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      session.type === 'swim'
                        ? 'border-[#00AAFF] text-[#00AAFF]'
                        : session.type === 'bike'
                          ? 'border-[#00CC66] text-[#00CC66]'
                          : session.type === 'run'
                            ? 'border-[#FF4444] text-[#FF4444]'
                            : 'border-[#666688] text-[#666688]'
                    }`}
                  >
                    {session.type === 'swim'
                      ? 'S'
                      : session.type === 'bike'
                        ? 'B'
                        : session.type === 'run'
                          ? 'R'
                          : session.type === 'race'
                            ? '!'
                            : '-'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recovery tip */}
      <div className="card-base bg-gradient-to-br from-blue-900/20 to-cyan-800/10 border border-cyan-700/30">
        <button
          onClick={() => setShowTip(!showTip)}
          className="w-full flex items-start gap-3 text-left"
        >
          <Lightbulb size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-cyan-200 font-medium">Tip van de dag</p>
            {showTip && (
              <p className="text-xs text-gray-300 mt-2">{randomTip}</p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
