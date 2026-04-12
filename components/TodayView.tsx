'use client'

import { useState } from 'react'
import {
  getGreeting,
  getTodayWorkout,
  getCurrentWeek,
  getRecoveryTips,
  getTodayFormatted,
  isToday,
} from '@/lib/helpers'
import type { Week, Race } from '@/lib/trainingData'
import WorkoutCard from './WorkoutCard'
import RaceCountdown from './RaceCountdown'
import FallbackWorkout from './FallbackWorkout'
import WhyThisWorkout from './WhyThisWorkout'
import FuelingGuidance from './FuelingGuidance'
import DuringFueling from './DuringFueling'
import RouteSuggestion from './RouteSuggestion'
import AdaptiveReplan from './AdaptiveReplan'
import ReadinessCheck from './ReadinessCheck'
import WeatherRoute from './WeatherRoute'
import RaceWeekAutopilot from './RaceWeekAutopilot'
import { Play, Lightbulb, Clock, Zap, CircleCheck } from 'lucide-react'

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
        <p className="text-gray-400 text-sm capitalize">{getTodayFormatted()}</p>
        <p className="text-gray-500 text-xs mt-1">
          {currentWeek && `Week ${currentWeek.number} â ${currentWeek.phase}`}
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

      {/* Race Week Autopilot */}
      <RaceWeekAutopilot races={races} />

      {/* Adaptive Replan for missed workouts */}
      {currentWeek && (
        <AdaptiveReplan weekSessions={currentWeek.sessions} />
      )}

      {/* Today's workout */}
      {todayWorkout ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Vandaag</h3>
            {todayWorkout.type !== 'rest' && todayWorkout.type !== 'race' && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={14} />
                {todayWorkout.duration}
              </div>
            )}
          </div>

          {/* Duration and goal summary */}
          {todayWorkout.type !== 'rest' && todayWorkout.type !== 'race' && (
            <div className="bg-[#12121f] border border-gray-700/30 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-400">
                <span className="text-gray-300 font-medium">{todayWorkout.title}</span>
                {todayWorkout.paceTarget && (
                  <>
                    <span className="text-gray-600"> â¢ </span>
                    <span className="text-gray-400">Doel: {todayWorkout.paceTarget}</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Readiness Check */}
          <ReadinessCheck />

          <div className="glow-run">
            <WorkoutCard workout={todayWorkout} />
          </div>

          {/* Voorbereiding section */}
          {todayWorkout.type !== 'rest' && todayWorkout.type !== 'race' && (
            <div className="card-base bg-[#12121f] border border-blue-700/30">
              <div className="flex items-start gap-3">
                <CircleCheck size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-300 mb-2">Voorbereiding</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    {todayWorkout.type === 'swim' && (
                      <>
                        <li>â¢ Neem zwembril mee</li>
                        <li>â¢ Pak badmuts in</li>
                        <li>â¢ Controleer pullbuoy in tas</li>
                      </>
                    )}
                    {todayWorkout.type === 'bike' && (
                      <>
                        <li>â¢ Check bandenspanning</li>
                        <li>â¢ Vul bidons met drank</li>
                        <li>â¢ Zet fietscomputer aan</li>
                      </>
                    )}
                    {todayWorkout.type === 'run' && (
                      <>
                        <li>â¢ Leg kleding klaar</li>
                        <li>â¢ Vul waterfles</li>
                        <li>â¢ Check weersvoorspelling</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Race day checklist */}
          {todayWorkout.type === 'race' && (
            <div className="card-base bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/30">
              <div className="flex items-start gap-3">
                <Zap size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-300 mb-2">Race Day Checklist</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>â¢ Zet wekker op tijd</li>
                    <li>â¢ Eet goed ontbijt (carbs + proteÃ¯ne)</li>
                    <li>â¢ Controleer weersomstandigheden</li>
                    <li>â¢ Pak race kit in</li>
                    <li>â¢ Zorg voor voldoende voeding</li>
                    <li>â¢ Blijf relaxed, je bent klaar!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recovery tips for rest day */}
          {todayWorkout.type === 'rest' && (
            <div className="card-base bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30">
              <div className="flex items-start gap-3">
                <CircleCheck size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-300 mb-2">Recovery Tips</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>â¢ Zorg voor voldoende water</li>
                    <li>â¢ Slaap 7-9 uur per nacht</li>
                    <li>â¢ Eet proteÃ¯ne-rijk voedsel</li>
                    <li>â¢ Doe wat lichte stretching</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fallback workout option */}
          <FallbackWorkout workout={todayWorkout} />

          {/* Why This Workout explanation */}
          {todayWorkout.type !== 'rest' && (
            <WhyThisWorkout workout={todayWorkout} weekPhase={currentWeek?.phase || ''} />
          )}

          {/* Fueling Guidance */}
          {todayWorkout.type !== 'rest' && (
            <FuelingGuidance workout={todayWorkout} />
          )}

          {/* During Fueling Calculator */}
          {todayWorkout.type !== 'rest' && todayWorkout.duration && parseInt(todayWorkout.duration) > 45 && (
            <DuringFueling workout={todayWorkout} />
          )}


          {/* Weather & Route Advice */}
          {todayWorkout.type !== 'rest' && todayWorkout.type !== 'swim' && (
            <WeatherRoute workout={todayWorkout} />
          )}

          {/* Route Suggestion */}
          {todayWorkout.type !== 'rest' && todayWorkout.type !== 'swim' && (
            <RouteSuggestion workout={todayWorkout} />
          )}
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
              const isTodaySession = isToday(session.date)
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
                  } ${isTodaySession ? 'ring-2 ring-white/40 scale-105' : ''}`}
                >
                  <div className={`text-xs font-medium ${isTodaySession ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {dayNames[idx]}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isTodaySession
                        ? 'bg-white/20 border-white text-white'
                        : session.type === 'swim'
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
                  {isTodaySession && (
                    <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
                  )}
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
