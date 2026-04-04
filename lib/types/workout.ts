/**
 * Workout TypeScript Types
 *
 * Matches the API contract from the architect plan for fetching and logging workouts.
 */

export type SportType = 'swim' | 'bike' | 'run' | 'rest'

export type IntensityLevel = 'easy' | 'recovery' | 'threshold' | 'interval' | 'long' | 'brick'

export type TargetType = 'pace' | 'heart_rate' | 'power' | 'rpe' | 'zone'

/**
 * Workout Target - defines what to aim for (pace, HR, power, RPE, etc.)
 */
export interface WorkoutTarget {
  type: TargetType
  value?: string
  min?: number
  max?: number
  unit?: string
  zone?: string
  label?: string
}

/**
 * Planned Workout - fetched from GET /api/v1/workouts/today
 */
export interface PlannedWorkout {
  id: string
  planId: string
  sport: SportType
  title: string
  description: string
  distanceMeters?: number
  durationSeconds?: number
  estimatedFinishTime?: string
  intensity: IntensityLevel
  isKeyWorkout: boolean
  targets: {
    primary?: WorkoutTarget
    secondary?: WorkoutTarget[]
  }
  color: string
  icon: string
  order: number
  isCompleted: boolean
  isMissed: boolean
}

/**
 * Workout Completion Data - sent to POST /api/v1/workouts/{id}/complete
 */
export interface WorkoutCompletion {
  workoutId: string
  rpe: number
  actualDistanceMeters?: number
  actualDurationSeconds?: number
  notes?: string
  feeling?: string
  timestamp: string
}

/**
 * Completed Workout - returned from API after logging
 */
export interface CompletedWorkout {
  id: string
  workoutId: string
  sport: SportType
  title: string
  date: string
  rpe: number
  actualDistanceMeters?: number
  actualDurationSeconds?: number
  avgHeartRate?: number
  avgPaceSecondsPerKm?: number
  avgPowerWatts?: number
  notes?: string
  feeling?: string
  completedAt: string
}

/**
 * Daily Workout Response - contains all workouts for a specific day
 */
export interface DailyWorkoutResponse {
  date: string
  dayOfWeek: string
  timezone: string
  workouts: PlannedWorkout[]
}

/**
 * Workout Card Display Data - used internally for rendering
 */
export interface WorkoutCardData {
  id: string
  sport: SportType
  title: string
  description: string
  distance?: string
  duration?: string
  intensity: IntensityLevel
  isKeyWorkout: boolean
  isPrimary: boolean
  targets: {
    primary?: WorkoutTarget
    secondary?: WorkoutTarget[]
  }
  color: string
  order: number
}

/**
 * RPE Scale (Borg 1-10)
 */
export const RPE_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type RPEValue = (typeof RPE_SCALE)[number]

/**
 * Sport color mapping (Tailwind + hex colors)
 */
export const SPORT_COLORS: Record<SportType, { hex: string; tailwind: string; bg: string }> = {
  swim: {
    hex: '#3B82F6',
    tailwind: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  bike: {
    hex: '#22C55E',
    tailwind: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  run: {
    hex: '#EF4444',
    tailwind: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  rest: {
    hex: '#9CA3AF',
    tailwind: 'text-gray-400',
    bg: 'bg-gray-500/10',
  },
}

/**
 * Intensity labels in Dutch
 */
export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  easy: 'Gemakkelijk',
  recovery: 'Herstel',
  threshold: 'Drempel',
  interval: 'Interval',
  long: 'Lang',
  brick: 'Brick',
}
