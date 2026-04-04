'use client'

import { useState, useCallback, useEffect } from 'react'
import { PlannedWorkout, DailyWorkoutResponse } from '@/lib/types/workout'
import {
  getTodayWorkouts,
  refreshTodayWorkouts,
  completeWorkout as completeWorkoutAPI,
} from '@/lib/api/workouts'

interface UseDailyWorkoutsReturn {
  workouts: PlannedWorkout[]
  date: string
  dayOfWeek: string
  timezone: string
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
  refresh: () => Promise<void>
  completeWorkout: (
    workoutId: string,
    rpe: number,
    notes?: string,
    feeling?: string
  ) => Promise<void>
}

/**
 * Custom hook for managing today's workouts
 *
 * Handles fetching, refreshing, and completing workouts
 * with automatic error handling and loading states
 */
export function useDailyWorkouts(token: string): UseDailyWorkoutsReturn {
  const [workouts, setWorkouts] = useState<PlannedWorkout[]>([])
  const [date, setDate] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('Europe/Amsterdam')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Load today's workouts on mount
  useEffect(() => {
    loadWorkouts()
  }, [token])

  const loadWorkouts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getTodayWorkouts(token)
      setWorkouts(data.workouts)
      setDate(data.date)
      setDayOfWeek(data.day_of_week)
      setTimezone(data.timezone)
      setLastSyncTime(new Date().toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workouts'
      setError(message)
      console.error('Error loading workouts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await refreshTodayWorkouts(token)
      setWorkouts(data.workouts)
      setDate(data.date)
      setDayOfWeek(data.day_of_week)
      setTimezone(data.timezone)
      setLastSyncTime(new Date().toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh workouts'
      setError(message)
      console.error('Error refreshing workouts:', err)
      throw err
    }
  }, [token])

  const completeWorkout = useCallback(
    async (workoutId: string, rpe: number, notes?: string, feeling?: string) => {
      try {
        setError(null)
        await completeWorkoutAPI(
          workoutId,
          {
            rpe,
            notes,
            feeling,
          },
          token
        )

        // Update local state to mark workout as completed
        setWorkouts((prev) =>
          prev.map((w) => (w.id === workoutId ? { ...w, isCompleted: true } : w))
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete workout'
        setError(message)
        console.error('Error completing workout:', err)
        throw err
      }
    },
    [token]
  )

  return {
    workouts,
    date,
    dayOfWeek,
    timezone,
    isLoading,
    error,
    lastSyncTime,
    refresh,
    completeWorkout,
  }
}
