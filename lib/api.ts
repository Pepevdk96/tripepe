// API client for TriPepe backend
// Currently placeholder - will connect to actual Garmin/backend services

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Generic fetch wrapper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Garmin activity interface
export interface GarminActivity {
  id: string
  activityName: string
  activityType: string
  startTimeInSeconds: number
  durationInSeconds: number
  elapsedDurationInSeconds: number
  movingDurationInSeconds: number
  distance: number
  calories: number
  averageHeartRate: number
  maxHeartRate: number
  averagePace?: string
  maxPace?: string
  averageCadence?: number
}

// Fetch Garmin activities
export async function fetchGarminActivities(
  days: number = 7
): Promise<GarminActivity[]> {
  const result = await apiCall<GarminActivity[]>(
    `/activities?days=${days}`,
    { method: 'GET' }
  )

  return result.data || []
}

// Sync a completed workout
export interface WorkoutLog {
  date: string
  type: 'swim' | 'bike' | 'run'
  duration: number
  distance: number
  rpe: number
  notes?: string
  garminActivityId?: string
}

export async function syncWorkout(
  workout: WorkoutLog
): Promise<{ success: boolean; id?: string }> {
  const result = await apiCall<{ id: string }>(
    '/workouts',
    {
      method: 'POST',
      body: JSON.stringify(workout),
    }
  )

  return {
    success: result.success,
    id: result.data?.id,
  }
}

// Fetch health metrics
export interface HealthMetrics {
  date: string
  restingHeartRate: number
  bodyTemperature: number
  sleep: number
  stress: number
  trainingLoad: number
  vo2max?: number
}

export async function fetchHealthMetrics(
  days: number = 7
): Promise<HealthMetrics[]> {
  const result = await apiCall<HealthMetrics[]>(
    `/metrics?days=${days}`,
    { method: 'GET' }
  )

  return result.data || []
}

// Get race details and pacing strategy
export interface RaceDetails {
  id: string
  name: string
  date: string
  type: 'marathon' | 'triathlon'
  pacingStrategy: string
  splits: any[]
}

export async function fetchRaceDetails(raceId: string): Promise<RaceDetails | null> {
  const result = await apiCall<RaceDetails>(
    `/races/${raceId}`,
    { method: 'GET' }
  )

  return result.data || null
}

// Submit feedback or notes
export async function submitFeedback(
  workoutId: string,
  rpe: number,
  notes: string
): Promise<boolean> {
  const result = await apiCall<{ success: boolean }>(
    `/workouts/${workoutId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify({ rpe, notes }),
    }
  )

  return result.success
}

// Get authenticated user data
export async function fetchUserProfile(): Promise<any> {
  const result = await apiCall('/user/profile', { method: 'GET' })
  return result.data
}

// Sync with Garmin
export async function initiateGarminSync(): Promise<boolean> {
  const result = await apiCall<{ status: string }>(
    '/garmin/sync',
    { method: 'POST' }
  )

  return result.success
}
