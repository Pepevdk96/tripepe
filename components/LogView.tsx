'use client'

import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Check, Wifi, WifiOff, Clock, Activity, LogIn, ChevronDown, ChevronUp, ExternalLink, Filter } from 'lucide-react'
import { triggerGarminSync, loginGarmin, getGarminStatus } from '@/lib/supabaseData'
import { formatDate } from '@/lib/helpers'

interface LogViewProps {
  completedWorkouts: any[]
  garminSync: { last_sync_at: string | null; sync_enabled: boolean | null } | null
  onSync: () => void
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}u${m.toString().padStart(2, '0')}`
  return `${m}min`
}

function formatPace(secPerKm: number | null): string {
  if (!secPerKm) return '-'
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

function formatDistance(meters: number | null): string {
  if (!meters) return '-'
  return `${(meters / 1000).toFixed(1)} km`
}

function formatSpeed(metersPerSec: number | null): string {
  if (!metersPerSec) return '-'
  return `${(metersPerSec * 3.6).toFixed(1)} km/u`
}

const sportColors: Record<string, string> = {
  run: 'border-[#FF4444] text-[#FF4444]',
  bike: 'border-[#00CC66] text-[#00CC66]',
  swim: 'border-[#00AAFF] text-[#00AAFF]',
  strength: 'border-[#AA66FF] text-[#AA66FF]',
  other: 'border-[#FF9933] text-[#FF9933]',
}

const sportBgColors: Record<string, string> = {
  run: 'bg-[#FF4444]/10',
  bike: 'bg-[#00CC66]/10',
  swim: 'bg-[#00AAFF]/10',
  strength: 'bg-[#AA66FF]/10',
  other: 'bg-[#FF9933]/10',
}

const sportLabels: Record<string, string> = {
  run: 'Hardlopen',
  bike: 'Fietsen',
  swim: 'Zwemmen',
  strength: 'Kracht',
  other: 'Overig',
}

const sportIcons: Record<string, string> = {
  run: 'R', bike: 'B', swim: 'S', strength: 'St', other: '•',
}

export default function LogView({ completedWorkouts, garminSync, onSync }: LogViewProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [garminStatus, setGarminStatus] = useState<{
    connected: boolean
    display_name?: string
    synced_activities?: number
  } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sportFilter, setSportFilter] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(30)

  // Check Garmin status on mount
  useEffect(() => {
    getGarminStatus().then(status => {
      setGarminStatus(status)
    })
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await triggerGarminSync()
      if (result.success) {
        setSyncResult(`✓ ${result.synced || 0} nieuwe activiteiten gesync'd`)
        onSync()
        getGarminStatus().then(setGarminStatus)
      } else {
        setSyncResult(`✗ ${result.error || 'onbekend'}`)
      }
    } catch {
      setSyncResult('Sync mislukt — probeer opnieuw')
    } finally {
      setSyncing(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail) return
    setLoggingIn(true)
    setLoginError(null)
    try {
      const result = await loginGarmin(loginEmail, loginPassword || undefined)
      if (result.success) {
        setShowLogin(false)
        setLoginEmail('')
        setLoginPassword('')
        setGarminStatus({ connected: true, display_name: result.display_name })
        handleSync()
      } else {
        setLoginError(result.error || 'Login mislukt')
      }
    } catch {
      setLoginError('Kon niet verbinden met Garmin')
    } finally {
      setLoggingIn(false)
    }
  }

  const isConnected = garminStatus?.connected || garminSync?.sync_enabled

  // Filtered workouts
  const filteredWorkouts = useMemo(() => {
    if (!sportFilter) return completedWorkouts
    return completedWorkouts.filter(w => w.sport === sportFilter)
  }, [completedWorkouts, sportFilter])

  // Sport counts for filter buttons
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    completedWorkouts.forEach(w => {
      counts[w.sport] = (counts[w.sport] || 0) + 1
    })
    return counts
  }, [completedWorkouts])

  // Stats from completed workouts (this week)
  const thisWeekWorkouts = completedWorkouts.filter(w => {
    const d = new Date(w.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  })

  const totalSeconds = thisWeekWorkouts.reduce((s, w) => s + (w.actual_duration_seconds || 0), 0)
  const totalKm = thisWeekWorkouts.reduce((s, w) => s + (w.actual_distance_meters || 0), 0) / 1000
  const avgHR = thisWeekWorkouts.length > 0
    ? Math.round(thisWeekWorkouts.reduce((s, w) => s + (w.avg_heart_rate || 0), 0) / (thisWeekWorkouts.filter(w => w.avg_heart_rate).length || 1))
    : 0

  // Monthly grouping for display
  const groupedByMonth = useMemo(() => {
    const groups: { month: string; workouts: any[] }[] = []
    let currentMonth = ''
    filteredWorkouts.slice(0, showCount).forEach(w => {
      const d = new Date(w.date + 'T00:00:00')
      const monthKey = d.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })
      if (monthKey !== currentMonth) {
        currentMonth = monthKey
        groups.push({ month: monthKey, workouts: [] })
      }
      groups[groups.length - 1].workouts.push(w)
    })
    return groups
  }, [filteredWorkouts, showCount])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Training Log</h2>
        <p className="text-sm text-gray-400">Garmin sync & workout history</p>
      </div>

      {/* Garmin Connection Card */}
      <div className="card-base border border-[#222233] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-gray-500" />
            )}
            <span className="font-semibold text-white text-sm">Garmin Connect</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isConnected ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
          }`}>
            {isConnected ? (garminStatus?.display_name || 'Verbonden') : 'Niet verbonden'}
          </span>
        </div>

        {garminSync?.last_sync_at && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            Laatste sync: {new Date(garminSync.last_sync_at).toLocaleString('nl-NL')}
            {garminStatus?.synced_activities ? ` • ${garminStatus.synced_activities} activiteiten` : ''}
          </div>
        )}

        {!isConnected && !showLogin && (
          <button onClick={() => setShowLogin(true)}
            className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-[#0A7BCC] text-white hover:bg-[#0969B3] transition-all">
            <LogIn size={14} /> Verbind met Garmin Connect
          </button>
        )}

        {showLogin && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" placeholder="Garmin email" value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#333355] text-white text-sm focus:border-[#0A7BCC] focus:outline-none"
              required autoFocus />
            <input type="password" placeholder="Wachtwoord" value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#333355] text-white text-sm focus:border-[#0A7BCC] focus:outline-none" />
            <p className="text-xs text-gray-500">Gebruik je Garmin Connect email en wachtwoord</p>
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={loggingIn}
                className="flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-[#0A7BCC] text-white hover:bg-[#0969B3] disabled:opacity-50 transition-all">
                {loggingIn ? <><RefreshCw size={14} className="animate-spin" /> Verbinden...</> : <><LogIn size={14} /> Inloggen</>}
              </button>
              <button type="button" onClick={() => { setShowLogin(false); setLoginError(null) }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-[#1a1a2e] transition-all">Annuleer</button>
            </div>
          </form>
        )}

        {isConnected && (
          <button onClick={handleSync} disabled={syncing}
            className="w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-[#E8755A] text-white hover:bg-[#d4654d] disabled:opacity-50 transition-all">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync nu'}
          </button>
        )}

        {syncResult && (
          <p className={`text-xs text-center ${syncResult.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{syncResult}</p>
        )}
      </div>

      {/* Weekly summary */}
      {completedWorkouts.length > 0 && (
        <div className="card-base space-y-3">
          <h3 className="font-semibold text-white">Deze week</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">Uren</p>
              <p className="text-2xl font-bold text-white">{(totalSeconds / 3600).toFixed(1)}</p>
            </div>
            <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">Km</p>
              <p className="text-2xl font-bold text-white">{totalKm.toFixed(1)}</p>
            </div>
            <div className="bg-[#1a1a2e] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">Avg HR</p>
              <p className="text-2xl font-bold text-white">{avgHR || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sport filter */}
      {completedWorkouts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSportFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              !sportFilter ? 'bg-white text-black' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
            }`}
          >
            Alle ({completedWorkouts.length})
          </button>
          {Object.entries(sportCounts).sort((a, b) => b[1] - a[1]).map(([sport, count]) => (
            <button
              key={sport}
              onClick={() => setSportFilter(sportFilter === sport ? null : sport)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                sportFilter === sport
                  ? `${sportBgColors[sport] || 'bg-gray-700'} ${(sportColors[sport] || 'text-gray-300').replace('border-', 'text-').replace(/border-\[[^\]]+\]/, '')}`
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
              }`}
            >
              {sportLabels[sport] || sport} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Completed workouts list grouped by month */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity size={16} />
          Voltooide trainingen
          <span className="text-xs font-normal text-gray-400">({filteredWorkouts.length})</span>
        </h3>

        {filteredWorkouts.length === 0 ? (
          <div className="card-base text-center py-8">
            <p className="text-gray-400 text-sm mb-2">Nog geen voltooide trainingen</p>
            <p className="text-gray-500 text-xs">
              {isConnected
                ? 'Klik op "Sync nu" om je Garmin activiteiten te importeren'
                : 'Verbind met Garmin Connect om je activiteiten te importeren'}
            </p>
          </div>
        ) : (
          groupedByMonth.map(group => (
            <div key={group.month} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                {group.month}
              </h4>

              {group.workouts.map((workout) => {
                const isExpanded = expandedId === workout.id
                const hasDetails = workout.actual_duration_seconds || workout.actual_distance_meters || workout.avg_heart_rate
                const garminUrl = workout.garmin_activity_id
                  ? `https://connect.garmin.com/modern/activity/${workout.garmin_activity_id}`
                  : null

                return (
                  <div
                    key={workout.id}
                    className={`card-base border-l-4 ${sportColors[workout.sport] || 'border-gray-600 text-gray-400'} cursor-pointer transition-all hover:bg-[#16162a]`}
                    onClick={() => toggleExpand(workout.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm truncate">{workout.title || workout.sport}</h4>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(workout.date)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${sportColors[workout.sport] || ''} bg-black/20`}>
                          {sportIcons[workout.sport] || '?'}
                        </span>
                        {hasDetails ? (
                          isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />
                        ) : null}
                      </div>
                    </div>

                    {/* Compact stats row (always visible if data exists) */}
                    {hasDetails && !isExpanded && (
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        {workout.actual_distance_meters ? <span>{formatDistance(workout.actual_distance_meters)}</span> : null}
                        {workout.actual_duration_seconds ? <span>{formatDuration(workout.actual_duration_seconds)}</span> : null}
                        {workout.avg_heart_rate ? <span>{workout.avg_heart_rate} bpm</span> : null}
                      </div>
                    )}

                    {/* Expanded detail view */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#1a1a2e] p-2.5 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase">Afstand</p>
                            <p className="text-sm font-semibold text-white">{formatDistance(workout.actual_distance_meters)}</p>
                          </div>
                          <div className="bg-[#1a1a2e] p-2.5 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase">Duur</p>
                            <p className="text-sm font-semibold text-white">{formatDuration(workout.actual_duration_seconds)}</p>
                          </div>
                          <div className="bg-[#1a1a2e] p-2.5 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase">{workout.sport === 'bike' ? 'Snelheid' : 'Pace'}</p>
                            <p className="text-sm font-semibold text-white">
                              {workout.sport === 'bike'
                                ? (workout.actual_distance_meters && workout.actual_duration_seconds
                                  ? formatSpeed(workout.actual_distance_meters / workout.actual_duration_seconds)
                                  : '-')
                                : formatPace(workout.avg_pace_seconds_per_km)}
                            </p>
                          </div>
                          <div className="bg-[#1a1a2e] p-2.5 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase">Gem. HR</p>
                            <p className="text-sm font-semibold text-white">
                              {workout.avg_heart_rate ? `${workout.avg_heart_rate} bpm` : '-'}
                            </p>
                          </div>
                        </div>

                        {/* TSS bar */}
                        {workout.training_stress_score && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">TSS</span>
                            <div className="flex-1 bg-[#1a1a2e] rounded-full h-1.5">
                              <div className="h-full bg-[#E8755A] rounded-full"
                                style={{ width: `${Math.min(workout.training_stress_score, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium text-white">{Math.round(workout.training_stress_score)}</span>
                          </div>
                        )}

                        {workout.planned_workout_id && (
                          <div className="flex items-center gap-1">
                            <Check size={12} className="text-green-400" />
                            <span className="text-xs text-green-400">Gematcht met plan</span>
                          </div>
                        )}

                        {/* Garmin link */}
                        {garminUrl && (
                          <a
                            href={garminUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-[#0A7BCC] hover:text-[#3A9BEC] transition-colors py-1"
                          >
                            <ExternalLink size={12} />
                            Bekijk in Garmin Connect
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}

        {/* Load more button */}
        {filteredWorkouts.length > showCount && (
          <button
            onClick={() => setShowCount(s => s + 30)}
            className="w-full py-3 rounded-lg text-sm text-gray-400 hover:text-white bg-[#1a1a2e] hover:bg-[#222244] transition-all"
          >
            Meer laden ({filteredWorkouts.length - showCount} resterend)
          </button>
        )}
      </div>
    </div>
  )
}
