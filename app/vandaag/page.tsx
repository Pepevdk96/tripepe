'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DailyView } from '@/components/daily-view'
import { PlannedWorkout, DailyWorkoutResponse } from '@/lib/types/workout'
import { getTodayWorkouts, refreshTodayWorkouts } from '@/lib/api/workouts'

/**
 * Daily Workout Page - Dedicated page for the "Vandaag" (Today) view
 * URL: /vandaag
 */
export default function VandaagPage() {
  const [workouts, setWorkouts] = useState<PlannedWorkout[]>([])
  const [date, setDate] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')

  // Mock token - in production, get from auth context/session
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN || 'mock-token'

  // Load today's workouts on mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // For now, use mock data since API might not be available in development
        // In production, replace with actual API call:
        // const data = await getTodayWorkouts(token)

        // Mock data for demo purposes
        const today = new Date().toISOString().split('T')[0]
        const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
        const dayIndex = new Date(today).getDay()

        setDate(today)
        setDayOfWeek(dayNames[dayIndex])

        // Mock workouts - replace with actual API response
        const mockWorkouts: PlannedWorkout[] = [
          {
            id: 'wo_1',
            planId: 'plan_1',
            sport: 'run',
            title: 'Run - Tempo',
            description: '5x 5min @ threshold intensity with 2min recovery',
            distanceMeters: 10000,
            durationSeconds: 3600,
            estimatedFinishTime: new Date().toISOString(),
            intensity: 'threshold',
            isKeyWorkout: true,
            targets: {
              primary: {
                type: 'pace',
                value: '4:30',
                unit: 'per km',
                zone: 'Z4',
              },
              secondary: [
                {
                  type: 'heart_rate',
                  min: 160,
                  max: 175,
                  zone: 'Z4',
                },
                {
                  type: 'rpe',
                  min: 7,
                  max: 8,
                  label: 'Hard',
                },
              ],
            },
            color: '#EF4444',
            icon: 'run',
            order: 1,
            isCompleted: false,
            isMissed: false,
          },
        ]

        setWorkouts(mockWorkouts)
        setLastSyncTime(new Date().toLocaleTimeString('nl-NL', {
          hour: '2-digit',
          minute: '2-digit',
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workouts')
        console.error('Error loading workouts:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkouts()
  }, [token])

  const handleRefresh = async () => {
    try {
      // In production, use: await refreshTodayWorkouts(token)
      // For now, just update the sync time
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLastSyncTime(new Date().toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }))
    } catch (err) {
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
      // In production, use actual API:
      // await completeWorkout(workoutId, { rpe, notes, feeling }, token)

      // For demo, just log and update UI
      console.log('Workout completed:', { workoutId, rpe, notes, feeling })

      // Mark workout as completed locally
      setWorkouts((prev) =>
        prev.map((w) => (w.id === workoutId ? { ...w, isCompleted: true } : w))
      )
    } catch (err) {
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

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Daily View */}
      <DailyView
        workouts={workouts}
        date={date}
        dayOfWeek={dayOfWeek}
        onRefresh={handleRefresh}
        onCompleteWorkout={handleCompleteWorkout}
        isLoading={isLoading}
        lastSyncTime={lastSyncTime}
      />
    </div>
  )
}
