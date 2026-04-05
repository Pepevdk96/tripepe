'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCurrentWeek, formatDate, isToday, getTodayFormatted } from '@/lib/helpers'
import type { Week } from '@/lib/trainingData'
import WorkoutCard from './WorkoutCard'
import WeeklyStressBalance from './WeeklyStressBalance'
import GroceryList from './GroceryList'

interface WeekViewProps {
  trainingPlan: Week[]
}

export default function WeekView({ trainingPlan }: WeekViewProps) {
  const currentWeek = getCurrentWeek(trainingPlan)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(currentWeek?.number || 1)

  const week = trainingPlan.find((w) => w.number === selectedWeekNumber)

  const handlePrevWeek = () => {
    if (selectedWeekNumber > 1) {
      setSelectedWeekNumber(selectedWeekNumber - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeekNumber < trainingPlan.length) {
      setSelectedWeekNumber(selectedWeekNumber + 1)
    }
  }

  if (!week) return null

  const isCurrentWeek = week.number === currentWeek?.number

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Week header */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevWeek}
            disabled={selectedWeekNumber === 1}
            className="p-2 hover:bg-[#1a1a2e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-400" />
          </button>

          <div className="text-center flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              Week {week.number}
            </h2>
            <p className="text-sm text-gray-400">
              {formatDate(week.dateStart)} - {formatDate(week.dateEnd)}
            </p>
          </div>

          <button
            onClick={handleNextWeek}
            disabled={selectedWeekNumber === trainingPlan.length}
            className="p-2 hover:bg-[#1a1a2e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Phase badge */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${week.phaseColor} text-white`}
          >
            {week.phase}
          </span>
          {isCurrentWeek && (
            <span className="text-xs font-medium px-2 py-1 bg-green-900/30 text-green-400 rounded-full">
              Current
            </span>
          )}
        </div>

        {/* Week stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-base text-center">
            <p className="text-xs text-gray-400 mb-1">Total Hours</p>
            <p className="text-xl font-bold text-white">{week.totalHours}</p>
          </div>
          <div className="card-base text-center">
            <p className="text-xs text-gray-400 mb-1">Sessions</p>
            <p className="text-xl font-bold text-white">
              {week.sessions.filter((s) => s.type !== 'rest').length}
            </p>
          </div>
          <div className="card-base text-center">
            <p className="text-xs text-gray-400 mb-1">Rest Days</p>
            <p className="text-xl font-bold text-white">
              {week.sessions.filter((s) => s.type === 'rest').length}
            </p>
          </div>
        </div>
      </div>

      {/* Daily sessions */}
      <div className="space-y-3">
        <h3 className="font-bold text-white">Trainingen</h3>

        {week.sessions.map((session, idx) => {
          const dayNames = [
            'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag',
          ]
          const dayName = dayNames[idx]
          const isTodaySession = isToday(session.date)

          return (
            <div key={idx} className={`space-y-2 ${isTodaySession ? 'relative' : ''}`}>
              {/* Today indicator */}
              {isTodaySession && (
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF4444] to-[#FFD700] rounded-full" />
              )}
              <div className={`flex items-center justify-between px-2 ${isTodaySession ? 'pl-4' : ''}`}>
                <span className={`text-sm font-medium ${isTodaySession ? 'text-white' : 'text-gray-400'}`}>
                  {dayName}
                  {isTodaySession && (
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-[#FF4444]/20 text-[#FF4444] rounded-full">
                      Vandaag
                    </span>
                  )}
                </span>
                <span className={`text-xs ${isTodaySession ? 'text-gray-300' : 'text-gray-500'}`}>
                  {formatDate(session.date)}
                </span>
              </div>
              <div className={isTodaySession ? 'pl-3' : ''}>
                <WorkoutCard workout={session} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Stress Balance */}
      <WeeklyStressBalance trainingPlan={trainingPlan} />

      {/* Grocery List */}
      <GroceryList currentWeek={week} />

      {/* Key workout highlight */}
      {week.keyWorkout && (
        <div className="card-base border-l-4 border-[#FFD700]">
          <p className="text-xs text-gray-400 mb-1">Key workout deze week</p>
          <p className="font-semibold text-white">{week.keyWorkout}</p>
        </div>
      )}
    </div>
  )
}
