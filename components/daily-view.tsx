'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { PlannedWorkout, SportType } from '@/lib/types/workout'
import { WorkoutCardDaily } from './workout-card-daily'
import { WorkoutCompletionModal } from './workout-completion-modal'

interface DailyViewProps {
  workouts: PlannedWorkout[]
  date: string
  dayOfWeek: string
  onRefresh?: () => Promise<void>
  onCompleteWorkout?: (workoutId: string, rpe: number, notes?: string, feeling?: string) => Promise<void>
  isLoading?: boolean
  lastSyncTime?: string
}

/**
 * Get formatted date in Dutch (e.g., "Zondag 5 april")
 */
function formatDateDutch(date: string): string {
  const dateObj = new Date(date + 'T00:00:00')
  return dateObj.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Get sport type from workout (handles brick sessions)
 */
function getSportTypeForWorkout(workout: PlannedWorkout): SportType {
  if (workout.sport === 'brick' || workout.title.toLowerCase().includes('brick')) {
    return 'bike'
  }
  return workout.sport as SportType
}

/**
 * Separate workouts into primary and secondary for multi-sport days
 */
function separateWorkouts(workouts: PlannedWorkout[]): {
  primary: PlannedWorkout | null
  secondary: PlannedWorkout[]
} {
  if (workouts.length === 0) {
    return { primary: null, secondary: [] }
  }

  // Primary is the first workout (highest order or first in array)
  const sorted = [...workouts].sort((a, b) => a.order - b.order)
  return {
    primary: sorted[0] || null,
    secondary: sorted.slice(1),
  }
}

export function DailyView({
  workouts,
  date,
  dayOfWeek,
  onRefresh,
  onCompleteWorkout,
  isLoading = false,
  lastSyncTime,
}: DailyViewProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [completionLoading, setCompletionLoading] = useState(false)

  const { primary, secondary } = separateWorkouts(workouts)
  const formattedDate = formatDateDutch(date)

  const handleRefresh = async () => {
    if (!onRefresh) return

    try {
      setIsRefreshing(true)
      await onRefresh()
    } catch (error) {
      console.error('Failed to refresh workouts:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleWorkoutClick = (workout: PlannedWorkout) => {
    setSelectedWorkout(workout)
    setIsModalOpen(true)
  }

  const handleCompleteWorkout = async (
    rpe: number,
    notes?: string,
    feeling?: string
  ) => {
    if (!selectedWorkout || !onCompleteWorkout) return

    try {
      setCompletionLoading(true)
      await onCompleteWorkout(selectedWorkout.id, rpe, notes, feeling)
    } catch (error) {
      console.error('Failed to complete workout:', error)
      throw error
    } finally {
      setCompletionLoading(false)
    }
  }

  // No workouts scheduled (rest day)
  if (workouts.length === 0 || !primary) {
    return (
      <div className="w-full max-w-md mx-auto pb-32 px-4 py-6 space-y-6">
        {/* Date Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Vandaag</p>
            <h1 className="text-2xl font-bold text-white capitalize">{formattedDate}</h1>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors disabled:opacity-50"
            title="Synchroniseren"
          >
            <RefreshCw
              size={24}
              className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Rest Day Message */}
        <div className="bg-[#141420] rounded-xl border border-[#242430] p-6 space-y-4">
          <div className="text-5xl text-center">😴</div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">Rust dag</h2>
            <p className="text-sm text-gray-400">
              Je hebt vandaag geen training gepland. Dit is een goed moment om te herstellen.
            </p>
          </div>

          {/* Recovery Tips */}
          <div className="bg-[#0a0a0f] rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Herstel tips</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Zorg voor voldoende slaap (7-9 uur)</li>
              <li>• Drink veel water</li>
              <li>• Eet voedzaam</li>
              <li>• Doe wat lichte stretching</li>
            </ul>
          </div>
        </div>

        {/* Sync Info */}
        {lastSyncTime && (
          <p className="text-xs text-gray-500 text-center">
            Gesynchroniseerd op {lastSyncTime}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto pb-32 px-4 py-6 space-y-6">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Vandaag</p>
          <h1 className="text-2xl font-bold text-white capitalize">{formattedDate}</h1>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors disabled:opacity-50"
          title="Synchroniseren"
        >
          <RefreshCw
            size={24}
            className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Primary Workout (featured) */}
      {primary && (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
            Voornaamste training
          </p>
          <WorkoutCardDaily
            workout={primary}
            isPrimary={true}
            onClick={() => handleWorkoutClick(primary)}
          />
        </div>
      )}

      {/* Secondary Workouts (e.g., double sessions) */}
      {secondary.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Tweede training
          </p>
          {secondary.map((workout) => (
            <WorkoutCardDaily
              key={workout.id}
              workout={workout}
              isPrimary={false}
              onClick={() => handleWorkoutClick(workout)}
            />
          ))}
        </div>
      )}

      {/* Warnings */}
      {workouts.some((w) => w.isMissed) && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-400">Gemiste training</p>
            <p className="text-xs text-orange-300 mt-1">
              Je hebt een training gemist. Deze kan morgen ingehaald worden.
            </p>
          </div>
        </div>
      )}

      {/* Key Workout Notice */}
      {workouts.some((w) => w.isKeyWorkout) && (
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              Dit is een belangrijke training
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Deze training is belangrijk voor je doelen. Zorg dat je deze afmaakt.
            </p>
          </div>
        </div>
      )}

      {/* Sync Info */}
      {lastSyncTime && (
        <p className="text-xs text-gray-500 text-center">
          Gesynchroniseerd op {lastSyncTime}
        </p>
      )}

      {/* Completion Modal */}
      {selectedWorkout && (
        <WorkoutCompletionModal
          workout={selectedWorkout}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedWorkout(null)
          }}
          onSubmit={handleCompleteWorkout}
          isLoading={completionLoading}
        />
      )}
    </div>
  )
}
