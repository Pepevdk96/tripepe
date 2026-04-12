/**
 * Workout API Client
 *
 * Functions to interact with the workout endpoints:
 * - GET /api/v1/workouts/today
 * - POST /api/v1/workouts/complete
 */

import {
  DailyWorkoutResponse,
  PlannedWorkout,
  WorkoutCompletion,
  CompletedWorkout,
  normalizePlannedWorkout,
} from '@/lib/types/workout'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Get user's timezone (from browser or preferences)
 */
function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'Europe/Amsterdam'
  }

  // Try to get from localStorage (user preferences)
  try {
    const stored = localStorage.getItem('user_timezone')
    if (stored) return stored
  } catch {
    // localStorage might not be available
  }

  // Fall back to browser timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Europe/Amsterdam'
  }
}

/**
 * Fetch today's planned workouts
 *
 * @param token - JWT bearer token for authentication
 * @param timezone - Optional timezone (defaults to user's timezone)
 * @returns Promise<DailyWorkoutResponse>
 */
export async function getTodayWorkouts(
  token: string,
  timezone?: string
): Promise<DailyWorkoutResponse> {
  const tz = timezone || getUserTimezone()
  const url = new URL(`${API_BASE_URL}/workouts/today`)
  url.searchParams.append('timezone', tz)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch today's workouts: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as unknown
  const dailyResponse = data as DailyWorkoutResponse

  // Normalize all workouts
  return {
    ...dailyResponse,
    workouts: Array.isArray(dailyResponse.workouts)
      ? dailyResponse.workouts.map(normalizePlannedWorkout)
      : [],
  }
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
  completion: Omit<WorkoutCompletion, 'plannedWorkoutId'>,
  token: string
): Promise<CompletedWorkout> {
  const payload: WorkoutCompletion = {
    plannedWorkoutId: workoutId,
    ...completion,
  }

  const response = await fetch(`${API_BASE_URL}/workouts/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to complete workout: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as CompletedWorkout
  return data
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
    const errorText = await response.text()
    throw new Error(`Failed to fetch workout: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as unknown
  return normalizePlannedWorkout(data)
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
    const errorText = await response.text()
    throw new Error(`Failed to fetch workouts: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as unknown[]
  return Array.isArray(data) ? data.map(normalizePlannedWorkout) : []
}

/**
 * Refresh/resync today's workouts from backend
 *
 * @param token - JWT bearer token for authentication
 * @param timezone - Optional timezone (defaults to user's timezone)
 * @returns Promise<DailyWorkoutResponse>
 */
export async function refreshTodayWorkouts(
  token: string,
  timezone?: string
): Promise<DailyWorkoutResponse> {
  // Add cache-busting parameter to force fresh fetch
  const tz = timezone || getUserTimezone()
  const url = new URL(`${API_BASE_URL}/workouts/today`)
  url.searchParams.append('timezone', tz)
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
    const errorText = await response.text()
    throw new Error(`Failed to refresh workouts: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as unknown
  const dailyResponse = data as DailyWorkoutResponse

  return {
    ...dailyResponse,
    workouts: Array.isArray(dailyResponse.workouts)
      ? dailyResponse.workouts.map(normalizePlannedWorkout)
      : [],
  }
}
