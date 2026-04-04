'use client'

import { useState } from 'react'
import { RefreshCw, Check, Wifi, Clock, Activity } from 'lucide-react'
import { triggerGarminSync } from '@/lib/supabaseData'
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
  const sec = secPerKm % 60
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

function formatDistance(meters: number | null): string {
  if (!meters) return '-'
  return `${(meters / 1000).toFixed(1)} km`
}

const sportColors: Record<string, string> = {
  run: 'border-[#FF4444] text-[#FF4444]',
  bike: 'border-[#00CC66] text-[#00CC66]',
  swim: 'border-[#00AAFF] text-[#00AAFF]',
  strength: 'border-[#AA66FF] text-[#AA66FF]',
}

const sportIcons: Record<string, string> = {
  run: 'R', bike: 'B', swim: 'S', strength: 'St',
}

export default function LogView({ completedWorkouts, garminSync, onSync }: LogViewProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const result = await triggerGarminSync()
      if (result.success) {
        setSyncResult(`${result.synced || 0} nieuwe activiteiten gesync'd`)
        onSync() // Refresh data
      } else {
        setSyncResult(`Sync fout: ${result.error || 'onbekend'}`)
      }
    } catch {
      setSyncResult('Sync mislukt — probeer opnieuw')
    } finally {
      setSyncing(false)
    }
  }

  // Stats from completed workouts
  const thisWeekWorkouts = completedWorkouts.filter(w => {
    const d = new Date(w.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return d >= weekAgo
  })

  const totalSeconds = thisWeekWorkouts.reduce((s, w) => s + (w.actual_duration_seconds || 0), 0)
  const totalKm = thisWeekWorkouts.reduce((s, w) => s + (w.actual_distance_meters || 0), 0) / 1000
  const avgHR = thisWeekWorkouts.length > 0
    ? Math.round(thisWeekWorkouts.reduce((s, w) => s + (w.avg_heart_rate || 0), 0) / thisWeekWorkouts.filter(w => w.avg_heart_rate).length || 0)
    : 0

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Training Log</h2>
        <p className="text-sm text-gray-400">Garmin sync & workout history</p>
      </div>

      {/* Garmin sync status */}
      <div className="card-base border border-[#222233] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi size={16} className={garminSync?.sync_enabled ? 'text-green-400' : 'text-gray-500'} />
            <span className="font-semibold text-white text-sm">Garmin Connect</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            garminSync?.sync_enabled ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
          }`}>
            {garminSync?.sync_enabled ? 'Actief' : 'Inactief'}
          </span>
        </div>

        {garminSync?.last_sync_at && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            Laatste sync: {new Date(garminSync.last_sync_at).toLocaleString('nl-NL')}
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-[#E8755A] text-white hover:bg-[#d4654d] disabled:opacity-50 transition-all"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync nu'}
        </button>

        {syncResult && (
          <p className="text-xs text-center text-gray-300">{syncResult}</p>
        )}
      </div>

      {/* Weekly summary */}
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

      {/* Completed workouts list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity size={16} />
          Voltooide trainingen
          <span className="text-xs font-normal text-gray-400">({completedWorkouts.length})</span>
        </h3>

        {completedWorkouts.length === 0 ? (
          <div className="card-base text-center py-8">
            <p className="text-gray-400 text-sm mb-2">Nog geen voltooide trainingen</p>
            <p className="text-gray-500 text-xs">Sync met Garmin om je activiteiten te importeren</p>
          </div>
        ) : (
          completedWorkouts.slice(0, 20).map((workout) => (
            <div
              key={workout.id}
              className={`card-base border-l-4 ${sportColors[workout.sport] || 'border-gray-600 text-gray-400'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white text-sm">{workout.title || workout.sport}</h4>
                  <p className="text-xs text-gray-400">{formatDate(workout.date)}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${sportColors[workout.sport] || ''} bg-black/20`}>
                  {sportIcons[workout.sport] || '?'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Duur</p>
                  <p className="font-medium text-white">{formatDuration(workout.actual_duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Afstand</p>
                  <p className="font-medium text-white">{formatDistance(workout.actual_distance_meters)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pace</p>
                  <p className="font-medium text-white">{formatPace(workout.avg_pace_seconds_per_km)}</p>
                </div>
                <div>
                  <p className="text-gray-500">HR</p>
                  <p className="font-medium text-white">{workout.avg_heart_rate || '-'} bpm</p>
                </div>
              </div>

              {workout.training_stress_score && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">TSS</span>
                  <div className="flex-1 bg-[#1a1a2e] rounded-full h-1.5">
                    <div
                      className="h-full bg-[#E8755A] rounded-full"
                      style={{ width: `${Math.min(workout.training_stress_score, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white">{Math.round(workout.training_stress_score)}</span>
                </div>
              )}

              {workout.planned_workout_id && (
                <div className="mt-2 flex items-center gap-1">
                  <Check size={12} className="text-green-400" />
                  <span className="text-xs text-green-400">Gematcht met plan</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
