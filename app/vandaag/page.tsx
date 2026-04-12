'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DailyView } from '@/components/daily-view'
import { PlannedWorkout } from '@/lib/types/workout'
import { getTodayWorkouts, refreshTodayWorkouts, completeWorkout } from '@/lib/api/workouts'

/**
 * Daily Workout Page - Dedicated page for the "Vandaag" (Today) view
 * URL: /vandaag
 */
export default function VandaagPage() {
  const [workouts, setWorkouts] = useState<PlannedWorkout[]>([])
  const [date, setDate] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('Europe/Amsterdam')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')

  // Get token from environment or auth context
  // TODO: Replace with actual auth context/session when available
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN || ''

  // Load today's workouts on mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        setTimezone(userTimezone)

        // Load from API
        const data = await getTodayWorkouts(token, userTimezone)
        setWorkouts(data.workouts)
        setDate(data.date)
        setDayOfWeek(data.dayOfWeek)
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
    }

    if (token) {
      loadWorkouts()
    } else {
      setError('Authentication required. Please log in.')
      setIsLoading(false)
    }
  }, [token])

  const handleRefresh = async () => {
    try {
      setError(null)
      const data = await refreshTodayWorkouts(token, timezone)
      setWorkouts(data.workouts)
      setDate(data.date)
      setDayOfWeek(data.dayOfWeek)
      setTimezone(data.timezone)
      setLastSyncTime(new Date().toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh workouts'
      setError(message)
      console.error('Error refreshing workouts:', err)
    }
  }

  const handleCompleteWorkout = async (
    workoutId: string,
    rpe: number,
    notes?: string,
    feeling?: string
  ) => {
    try {
      setError(null)
      await completeWorkout(
        workoutId,
        {
          rpe,
          notes,
        },
        token
      )

      // Mark workout as completed locally
      setWorkouts((prev) =>
        prev.map((w) => (w.id === workoutId ? { ...w, isCompleted: true } : w))
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete workout'
      setError(message)
      console.error('Error completing workout:', err)
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">⚙️</div>
          <p className="text-gray-400">Workouts laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Back button / Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-[#242430] px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Terug
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full max-w-md mx-auto h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin text-3xl">⚙️</div>
            <p className="text-gray-400">Trainingen laden...</p>
          </div>
        </div>
      )}

      {/* Ready to display - either error or daily view */}
      {!isLoading && (
        <DailyView
          workouts={workouts}
          date={date}
          dayOfWeek={dayOfWeek}
          onRefresh={handleRefresh}
          onCompleteWorkout={handleCompleteWorkout}
          isLoading={isLoading}
          lastSyncTime={lastSyncTime}
          error={error}
        />
      )}
    </div>
  )
}
