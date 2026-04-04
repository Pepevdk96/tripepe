'use client'

import { useState, useEffect } from 'react'
import type { Workout, Week, Race, AthleteProfile } from './trainingData'
import {
  fetchTrainingPlan,
  fetchRaces,
  fetchAthleteProfile,
  fetchCompletedWorkouts,
  fetchGarminSyncStatus,
} from './supabaseData'
// Fallback to static data if Supabase is unavailable
import {
  trainingPlan as staticPlan,
  races as staticRaces,
  athleteProfile as staticProfile,
} from './trainingData'

interface TriPepeData {
  trainingPlan: Week[]
  races: Race[]
  profile: AthleteProfile | null
  completedWorkouts: any[]
  garminSync: { last_sync_at: string | null; sync_enabled: boolean | null } | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTriPepeData(): TriPepeData {
  const [trainingPlan, setTrainingPlan] = useState<Week[]>(staticPlan)
  const [races, setRaces] = useState<Race[]>(staticRaces)
  const [profile, setProfile] = useState<AthleteProfile | null>(staticProfile)
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([])
  const [garminSync, setGarminSync] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [planData, raceData, profileData, completedData, syncData] = await Promise.all([
        fetchTrainingPlan(),
        fetchRaces(),
        fetchAthleteProfile(),
        fetchCompletedWorkouts(),
        fetchGarminSyncStatus(),
      ])

      // Only update if we got data (otherwise keep static fallback)
      if (planData.length > 0) setTrainingPlan(planData)
      if (raceData.length > 0) setRaces(raceData)
      if (profileData) setProfile(profileData)
      setCompletedWorkouts(completedData)
      setGarminSync(syncData)
    } catch (err) {
      console.error('Error loading TriPepe data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      // Keep static data as fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    trainingPlan,
    races,
    profile,
    completedWorkouts,
    garminSync,
    loading,
    error,
    refetch: loadData,
  }
}
