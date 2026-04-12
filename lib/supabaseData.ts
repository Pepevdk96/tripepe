// TriPepe Supabase Data Layer
// Fetches live data from Supabase and maps to existing frontend interfaces
import { supabase, DEFAULT_USER_ID } from './supabase'
import type { Week, Race, AthleteProfile } from './trainingData'
import type { Workout } from './trainingData'

// ---- Pace helpers ----
function secPerKmToString(sec: number | null): string {
  if (!sec) return ''
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return `${min}:${s.toString().padStart(2, '0')}/km`
}

function minutesToDurationStr(min: number | null): string {
  if (!min) return '-'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}u${m.toString().padStart(2, '0')}` : `${h}u`
}

function metersToDistStr(meters: number | null): string {
  if (!meters) return ''
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1).replace('.0', '')
    return `${km} km`
  }
  return `${meters}m`
}

function mapSport(sport: string): Workout['type'] {
  const map: Record<string, Workout['type']> = {
    swim: 'swim', bike: 'bike', run: 'run',
    rest: 'rest', race: 'race', strength: 'rest',
  }
  return map[sport] || 'rest'
}

function mapIntensity(intensity: string | null): Workout['intensity'] {
  const map: Record<string, Workout['intensity']> = {
    rest: 'rest', easy: 'easy', moderate: 'moderate', hard: 'hard', race: 'race',
  }
  return map[intensity || 'easy'] || 'easy'
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  return days[d.getDay()] || ''
}

function getPhaseColor(phase: string | null): string {
  if (!phase) return '#8888aa'
  if (phase.toLowerCase().includes('build')) return '#FF6B35'
  if (phase.toLowerCase().includes('peak')) return '#FF4444'
  if (phase.toLowerCase().includes('taper')) return '#00CC66'
  return '#8888aa'
}

// Pace target string from min/max seconds
function paceTargetStr(min: number | null, max: number | null): string {
  if (!min && !max) return ''
  if (min && max && min !== max) {
    return `${secPerKmToString(min)} - ${secPerKmToString(max)}`
  }
  return secPerKmToString(min || max)
}

// ---- Main data fetching functions ----

// Fetch all planned workouts, grouped by week
export async function fetchTrainingPlan(): Promise<Week[]> {
  const { data: workouts, error } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('date', { ascending: true })

  if (error || !workouts) {
    console.error('Error fetching workouts:', error)
    return []
  }

  // Group by week_number
  const weekMap = new Map<number, typeof workouts>()
  for (const w of workouts) {
    const existing = weekMap.get(w.week_number) || []
    existing.push(w)
    weekMap.set(w.week_number, existing)
  }

  // Convert to Week[]
  const weeks: Week[] = []
  for (const [weekNum, wkWorkouts] of weekMap) {
    const sorted = wkWorkouts.sort((a, b) => a.date.localeCompare(b.date))
    const phase = sorted[0]?.phase || 'Training'

    // Calculate total hours for the week
    const totalMinutes = sorted.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
    const totalHours = (totalMinutes / 60).toFixed(1)

    // Find key workout
    const keyWk = sorted.find(w => w.is_key_workout)

    const sessions: Workout[] = sorted.map(w => ({
      day: getDayName(w.date),
      date: w.date,
      type: mapSport(w.sport),
      title: w.title,
      description: w.description || '',
      duration: minutesToDurationStr(w.duration_minutes),
      distance: metersToDistStr(w.distance_meters),
      intensity: mapIntensity(w.intensity),
      paceTarget: paceTargetStr(w.pace_target_min, w.pace_target_max),
      isKeyWorkout: w.is_key_workout || false,
      // Extra fields for Supabase tracking
      _id: w.id,
      _status: w.status,
      _sport: w.sport,
    }))

    weeks.push({
      number: weekNum,
      dateStart: sorted[0]?.date || '',
      dateEnd: sorted[sorted.length - 1]?.date || '',
      phase,
      phaseColor: getPhaseColor(phase),
      totalHours: `${totalHours}u`,
      keyWorkout: keyWk?.title || '',
      sessions,
    })
  }

  return weeks.sort((a, b) => a.number - b.number)
}

// Fetch races
export async function fetchRaces(): Promise<Race[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('date', { ascending: true })

  if (error || !data) {
    console.error('Error fetching races:', error)
    return []
  }

  return data.map(r => {
    // Convert target_time_seconds to readable format
    let target = ''
    if (r.target_time_seconds) {
      const h = Math.floor(r.target_time_seconds / 3600)
      const m = Math.floor((r.target_time_seconds % 3600) / 60)
      const s = r.target_time_seconds % 60
      target = h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`
    }

    return {
      name: r.name,
      date: r.date,
      target,
      type: (r.race_type === 'marathon' ? 'marathon' : 'triathlon') as Race['type'],
      distance: r.race_type === 'marathon' ? '42.195 km' : r.race_type === '70.3' ? '113 km' : r.race_type,
      priority: r.priority || undefined,
      status: r.status || 'upcoming',
    }
  })
}

// Fetch athlete profile
export async function fetchAthleteProfile(): Promise<AthleteProfile | null> {
  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', DEFAULT_USER_ID)
    .single()

  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .single()

  if (!profile || !user) return null

  return {
    name: user.name,
    marathonPR: '3:01',
    ironmanPR: '9:56',
    vo2max: profile.vo2max || 0,
    thresholdPace: secPerKmToString(profile.threshold_pace_seconds_per_km),
    easyPace: secPerKmToString(profile.easy_pace_seconds_per_km),
    intervalPace: secPerKmToString(profile.interval_pace_seconds_per_km),
  }
}

// Fetch completed workouts (from Garmin sync)
export async function fetchCompletedWorkouts() {
  console.log('[TriPepe] Fetching completed workouts for user:', DEFAULT_USER_ID)

  const { data, error } = await supabase
    .from('completed_workouts')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('date', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[TriPepe] Error fetching completed workouts:', error)
    return []
  }

  console.log(`[TriPepe] Got ${data?.length || 0} completed workouts`)
  return data || []
}

// Fetch last Garmin sync status
export async function fetchGarminSyncStatus() {
  const { data } = await supabase
    .from('garmin_tokens')
    .select('last_sync_at, sync_enabled')
    .eq('user_id', DEFAULT_USER_ID)
    .single()

  return data
}

// Trigger manual Garmin sync via Next.js API route
export async function triggerGarminSync(): Promise<{ success: boolean; synced?: number; error?: string }> {
  try {
    const resp = await fetch('/api/garmin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 30 }),
    })

    const result = await resp.json()

    if (result.success) {
      return {
        success: true,
        synced: result.new_activities || 0,
        error: undefined,
      }
    }

    return { success: false, error: result.error || 'Sync mislukt' }
  } catch (err) {
    return {
      success: false,
      error: 'Kon Garmin niet bereiken. Controleer of Python + garminconnect geïnstalleerd is.',
    }
  }
}

// Login to Garmin Connect
export async function loginGarmin(email: string, password?: string): Promise<{ success: boolean; display_name?: string; error?: string }> {
  try {
    const resp = await fetch('/api/garmin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    return await resp.json()
  } catch (err) {
    return {
      success: false,
      error: 'Kon Garmin login niet bereiken.',
    }
  }
}

// Get Garmin connection status
export async function getGarminStatus(): Promise<{
  connected: boolean
  display_name?: string
  garmin_email?: string
  last_sync_at?: string
  synced_activities?: number
  error?: string
}> {
  try {
    const resp = await fetch('/api/garmin/status')
    return await resp.json()
  } catch {
    return { connected: false, error: 'Status niet beschikbaar' }
  }
}
