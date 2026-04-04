/**
 * Workout API Client
 *
 * Functions to interact with the workout endpoints:
 * - GET /api/v1/workouts/today
 * - POST /api/v1/workouts/{id}/complete
 */

import {
  DailyWorkoutResponse,
  PlannedWorkout,
  WorkoutCompletion,
  CompletedWorkout,
} from '@/lib/types/workout'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Fetch today's planned workouts
 *
 * @param timezone - Optional timezone (defaults to user profile timezone)
 * @param token - JWT bearer token for authentication
 * @returns Promise<DailyWorkoutResponse>
 */
export async function getTodayWorkouts(
  token: string,
  timezone?: string
): Promise<DailyWorkoutResponse> {
  const url = new URL(`${API_BASE_URL}/workouts/today`)

  if (timezone) {
    url.searchParams.append('timezone', timezone)
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch today's workouts: ${response.statusText}`)
  }

  const data = await response.json()
  return data as DailyWorkoutResponse
}

/**
 * Log workout completion with RPE and optional details
 *
 * @param workoutId - Workout ID to complete
 * @param completion - Completion data (RPE, distance, duration, notes, etc.)
 * @param token - JWT bearer token for authentication
 * @returns Promise<CompletedWorkout>
 */
export async function completeWorkout(
  workoutId: string,
  completion: Omit<WorkoutCompletion, 'workoutId' | 'timestamp'>,
  token: string
): Promise<CompletedWorkout> {
  const payload: WorkoutCompletion = {
    workoutId,
    timestamp: new Date().toISOString(),
    ...completion,
  }

  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to complete workout: ${response.statusText}`)
  }

  const data = await response.json()
  return data as CompletedWorkout
}

/**
 * Fetch a single planned workout by ID
 *
 * @param workoutId - Workout ID
 * @param token - JWT bearer token for authentication
 * @returns Promise<PlannedWorkout>
 */
export async function getWorkout(workoutId: string, token: string): Promise<PlannedWorkout> {
  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch workout: ${response.statusText}`)
  }

  const data = await response.json()
  return data as PlannedWorkout
}

/**
 * Fetch workouts for a specific date range
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param token - JWT bearer token for authentication
 * @returns Promise<PlannedWorkout[]>
 */
export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string,
  token: string
): Promise<PlannedWorkout[]> {
  const url = new URL(`${API_BASE_URL}/workouts`)
  url.searchParams.append('start_date', startDate)
  url.searchParams.append('end_date', endDate)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch workouts: ${response.statusText}`)
  }

  const data = await response.json()
  return data as PlannedWorkout[]
}

/**
 * Refresh/resync today's workouts from backend
 *
 * @param token - JWT bearer token for authentication
 * @returns Promise<DailyWorkoutResponse>
 */
export async function refreshTodayWorkouts(token: string): Promise<DailyWorkoutResponse> {
  // Add cache-busting parameter to force fresh fetch
  const url = new URL(`${API_BASE_URL}/workouts/today`)
  url.searchParams.append('_t', Date.now().toString())

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh workouts: ${response.statusText}`)
  }

  const data = await response.json()
  return data as DailyWorkoutResponse
}
