'use client'

/**
 * Integration Example: Using the DailyView component with useDailyWorkouts hook
 *
 * This is a reference implementation showing how to wire up:
 * - DailyView component
 * - useDailyWorkouts custom hook
 * - API calls for fetching and completing workouts
 *
 * Usage in a page:
 * ```tsx
 * export default function MyPage() {
 *   const { workouts, date, dayOfWeek, isLoading, error, lastSyncTime, refresh, completeWorkout } =
 *     useDailyWorkouts(token)
 *
 *   return (
 *     <DailyViewIntegration
 *       workouts={workouts}
 *       date={date}
 *       dayOfWeek={dayOfWeek}
 *       isLoading={isLoading}
 *       error={error}
 *       lastSyncTime={lastSyncTime}
 *       onRefresh={refresh}
 *       onCompleteWorkout={completeWorkout}
 *     />
 *   )
 * }
 * ```
 */

import { DailyView } from './daily-view'
import { PlannedWorkout } from '@/lib/types/workout'

interface DailyViewIntegrationProps {
  workouts: PlannedWorkout[]
  date: string
  dayOfWeek: string
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
  onRefresh: () => Promise<void>
  onCompleteWorkout: (
    workoutId: string,
    rpe: number,
    notes?: string,
    feeling?: string
  ) => Promise<void>
}

export function DailyViewIntegration({
  workouts,
  date,
  dayOfWeek,
  isLoading,
  error,
  lastSyncTime,
  onRefresh,
  onCompleteWorkout,
}: DailyViewIntegrationProps) {
  return (
    <>
      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="w-full max-w-md mx-auto h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin text-3xl">⚙️</div>
            <p className="text-gray-400">Trainingen laden...</p>
          </div>
        </div>
      ) : (
        <DailyView
          workouts={workouts}
          date={date}
          dayOfWeek={dayOfWeek}
          onRefresh={onRefresh}
          onCompleteWorkout={onCompleteWorkout}
          isLoading={isLoading}
          lastSyncTime={lastSyncTime}
        />
      )}
    </>
  )
}
