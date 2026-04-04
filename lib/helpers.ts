import { Workout, Week } from './trainingData'

// Check if a date string matches today
export const isToday = (dateStr: string): boolean => {
  const today = new Date().toLocaleDateString('en-CA')
  return dateStr === today
}

// Get today's date formatted in Dutch
export const getTodayFormatted = (): string => {
  return new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Calculate days until target date
export const getDaysUntil = (dateStr: string): number => {
  const today = new Date(new Date().toLocaleDateString('en-CA'))
  const targetDate = new Date(dateStr)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Get today's workout from training plan
export const getTodayWorkout = (weeks: Week[]): Workout | null => {
  const today = new Date().toLocaleDateString('en-CA')

  for (const week of weeks) {
    for (const session of week.sessions) {
      if (session.date === today) {
        return session
      }
    }
  }
  return null
}

// Determine current week in training plan
export const getCurrentWeek = (weeks: Week[]): Week | null => {
  const today = new Date().toLocaleDateString('en-CA')

  for (const week of weeks) {
    const startDate = new Date(week.dateStart)
    const endDate = new Date(week.dateEnd)
    const todayDate = new Date(today)

    if (todayDate >= startDate && todayDate <= endDate) {
      return week
    }
  }

  // If no current week, return first future week or last week
  for (const week of weeks) {
    const startDate = new Date(week.dateStart)
    const todayDate = new Date(today)
    if (startDate > todayDate) {
      return week
    }
  }

  return weeks[weeks.length - 1] || null
}

// Get time-based Dutch greeting
export const getGreeting = (name: string = 'Pepe'): string => {
  const hour = new Date().getHours()

  if (hour < 12) {
    return `Goedemorgen ${name}`
  } else if (hour < 18) {
    return `Goedemiddag ${name}`
  } else {
    return `Goedenavond ${name}`
  }
}

// Get color for intensity level
export const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'bg-green-900/30 text-green-400'
    case 'moderate':
      return 'bg-yellow-900/30 text-yellow-400'
    case 'hard':
      return 'bg-orange-900/30 text-orange-400'
    case 'race':
      return 'bg-red-900/30 text-red-400'
    case 'rest':
      return 'bg-gray-900/30 text-gray-400'
    default:
      return 'bg-gray-900/30 text-gray-400'
  }
}

// Get intensity label in Dutch
export const getIntensityLabel = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'Gemakkelijk'
    case 'moderate':
      return 'Matig'
    case 'hard':
      return 'Zwaar'
    case 'race':
      return 'Wedstrijd'
    case 'rest':
      return 'Rust'
    default:
      return intensity
  }
}

// Get color for discipline/sport type
export const getSportColor = (type: string): string => {
  switch (type) {
    case 'swim':
      return '#00AAFF'
    case 'bike':
      return '#00CC66'
    case 'run':
      return '#FF4444'
    case 'rest':
      return '#666688'
    case 'race':
      return '#FFD700'
    default:
      return '#8888aa'
  }
}

// Get background color class for sport type
export const getSportBgColor = (type: string): string => {
  switch (type) {
    case 'swim':
      return 'border-l-4 border-[#00AAFF]'
    case 'bike':
      return 'border-l-4 border-[#00CC66]'
    case 'run':
      return 'border-l-4 border-[#FF4444]'
    case 'rest':
      return 'border-l-4 border-[#666688]'
    case 'race':
      return 'border-l-4 border-[#FFD700]'
    default:
      return 'border-l-4 border-[#8888aa]'
  }
}

// Get sport icon name (lucide-react)
export const getSportIcon = (type: string): string => {
  switch (type) {
    case 'swim':
      return 'Waves'
    case 'bike':
      return 'Bike'
    case 'run':
      return 'Footprints'
    case 'rest':
      return 'Zzz'
    case 'race':
      return 'Trophy'
    default:
      return 'Activity'
  }
}

// Format pace string for display
export const formatPace = (pace: string): string => {
  return pace || '-'
}

// Format duration string
export const formatDuration = (duration: string): string => {
  return duration || '-'
}

// Get day name in Dutch
export const getDayNameDutch = (dayIndex: number): string => {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  return days[dayIndex] || ''
}

// Format date for display
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })
}

// Get progress percentage (weeks completed / total weeks)
export const getProgressPercentage = (currentWeekNumber: number, totalWeeks: number = 9): number => {
  return Math.round((currentWeekNumber / totalWeeks) * 100)
}

// Calculate time until race in format "X days, Y hours"
export const getTimeUntilRace = (dateStr: string): string => {
  const today = new Date(new Date().toLocaleDateString('en-CA'))
  const targetDate = new Date(dateStr)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Race completed!'
  if (diffDays === 0) return 'Today!'
  if (diffDays === 1) return 'Tomorrow!'

  return `${diffDays} days`
}

// Parse time string (e.g., "2:50" to minutes)
export const timeToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':')
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1])
  }
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return 0
}

// Format minutes to time string
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }
  return `${mins}m`
}

// Get recovery tips
export const getRecoveryTips = (): string[] => {
  return [
    'Zorg voor voldoende water: minstens 3 liter per dag',
    'Slaap 7-9 uur per nacht voor optimaal herstel',
    'Eet een uitgebalanceerde maaltijd met proteïne en koolhydraten',
    'Doe wat lichte stretching of yoga',
    'Neem een warm bad of ga naar de sauna',
    'Zorg voor mentale rust en meditatie',
  ]
}

// Generate fallback workout based on original
export const generateFallback = (workout: Workout): { duration: string; description: string } | null => {
  if (workout.type === 'rest' || workout.type === 'race') return null

  // Parse duration to minutes
  const durationStr = workout.duration
  if (!durationStr || durationStr === '-') return null

  const minutes = parseInt(durationStr)
  if (isNaN(minutes)) return null

  const fallbackMinutes = Math.max(20, Math.round(minutes * 0.6))

  const fallbackDescriptions: Record<string, string> = {
    swim: `${fallbackMinutes}min: warm-up + hoofdset verkort, skip cooldown`,
    bike: `${fallbackMinutes}min: focus op intervalblokken, verkort Z2 deel`,
    run: `${fallbackMinutes}min: behoud intensiteit, verkort opbouw en cooldown`,
  }

  return {
    duration: `${fallbackMinutes} min`,
    description: fallbackDescriptions[workout.type] || `${fallbackMinutes}min verkorte versie`,
  }
}
