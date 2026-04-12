/**
 * Workout TypeScript Types
 *
 * Matches the API contract from the architect plan for fetching and logging workouts.
 * Backend sends camelCase JSON, which is deserialized directly to these types.
 */

export type SportType = 'swim' | 'bike' | 'run' | 'rest' | 'brick'

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
 * Backend sends all fields in camelCase (matching API contract)
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
  labelSecondary?: string
  primaryTarget?: WorkoutTarget
  secondaryTargets?: WorkoutTarget[]
  color: string
  icon: string
  order: number
  isCompleted: boolean
  isMissed: boolean
  dayOfWeek: string
  rationale?: string
}

/**
 * Workout Completion Data - sent to POST /api/v1/workouts/complete
 */
export interface WorkoutCompletion {
  plannedWorkoutId: string
  rpe: number
  actualDistanceMeters?: number
  actualDurationSeconds?: number
  avgHeartRate?: number
  maxHeartRate?: number
  notes?: string
  garminActivityId?: string
}

/**
 * Completed Workout - returned from API after logging
 */
export interface CompletedWorkout {
  id: string
  plannedWorkoutId: string
  sport: SportType
  date: string
  rpe: number
  actualDistanceMeters?: number
  actualDurationSeconds?: number
  avgHeartRate?: number
  maxHeartRate?: number
  notes?: string
  matchScore: number
  matchScoreDetails?: {
    distanceDiffPct: number
    durationDiffPct: number
    notes: string
  }
  createdAt: string
}

/**
 * Daily Workout Response - contains all workouts for a specific day
 */
export interface DailyWorkoutResponse {
  date: string
  dayOfWeek: string
  timezone: string
  workouts: PlannedWorkout[]
  lastSync: string
  hasMissedWorkout: boolean
  missedWorkoutNote?: string | null
  taperStatus?: string | null
  raceDay: boolean
  raceInfo?: {
    raceName: string
    raceDate: string
    distance: string
  } | null
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
  brick: {
    hex: '#F59E0B',
    tailwind: 'text-amber-500',
    bg: 'bg-amber-500/10',
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

/**
 * Helper function to normalize PlannedWorkout data from backend
 * Handles conversion of targets field structure for backward compatibility
 */
export function normalizePlannedWorkout(workout: unknown): PlannedWorkout {
  const data = workout as Record<string, unknown>

  // Support both old nested structure (targets.primary/secondary)
  // and new top-level structure (primaryTarget/secondaryTargets)
  const primaryTarget = (data.primaryTarget ||
    (typeof data.targets === 'object' && data.targets !== null
      ? (data.targets as Record<string, unknown>).primary
      : undefined)) as WorkoutTarget | undefined

  const secondaryTargets = (data.secondaryTargets ||
    (typeof data.targets === 'object' && data.targets !== null
      ? (data.targets as Record<string, unknown>).secondary
      : undefined)) as WorkoutTarget[] | undefined

  return {
    id: String(data.id),
    planId: String(data.planId || data.plan_id || ''),
    sport: String(data.sport) as SportType,
    title: String(data.title),
    description: String(data.description),
    distanceMeters: typeof data.distanceMeters === 'number' ? data.distanceMeters : undefined,
    durationSeconds: typeof data.durationSeconds === 'number' ? data.durationSeconds : undefined,
    estimatedFinishTime: data.estimatedFinishTime ? String(data.estimatedFinishTime) : undefined,
    intensity: String(data.intensity) as IntensityLevel,
    isKeyWorkout: Boolean(data.isKeyWorkout || data.is_key_workout),
    labelSecondary: data.labelSecondary ? String(data.labelSecondary) : undefined,
    primaryTarget,
    secondaryTargets: Array.isArray(secondaryTargets) ? secondaryTargets : undefined,
    color: String(data.color || getColorForSport(String(data.sport) as SportType)),
    icon: String(data.icon || String(data.sport)),
    order: typeof data.order === 'number' ? data.order : 1,
    isCompleted: Boolean(data.isCompleted || data.is_completed),
    isMissed: Boolean(data.isMissed || data.is_missed),
    dayOfWeek: String(data.dayOfWeek || data.day_of_week || ''),
    rationale: data.rationale ? String(data.rationale) : undefined,
  }
}

/**
 * Get default color for a sport type
 */
function getColorForSport(sport: SportType): string {
  return SPORT_COLORS[sport]?.hex || '#9CA3AF'
}
