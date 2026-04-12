/**
 * POST /api/garmin/sync
 * Syncs recent Garmin activities to Supabase.
 * Calls the Python CLI script for Garmin API access, then saves to DB.
 */

export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

// Path to the Python CLI script (relative to project root)
function getCliPath(): string {
  // Try multiple possible paths
  const candidates = [
    path.resolve(process.cwd(), '..', 'backend', 'garmin', 'cli_sync.py'),
    path.resolve(process.cwd(), 'backend', 'garmin', 'cli_sync.py'),
    path.resolve(__dirname, '..', '..', '..', '..', '..', 'backend', 'garmin', 'cli_sync.py'),
  ]
  return candidates[0] // Primary path: frontend/../backend/garmin/cli_sync.py
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const days = body.days || 30
    const userId = body.userId || DEFAULT_USER_ID

    // Call Python CLI to fetch activities from Garmin
    const cliPath = getCliPath()
    let result: { stdout: string; stderr: string }

    try {
      result = await execFileAsync('python3', [cliPath, 'sync', '--days', String(days)], {
        timeout: 60000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
    } catch (execError: any) {
      // Python script may output JSON even on error (via output_error)
      if (execError.stdout) {
        try {
          const errorData = JSON.parse(execError.stdout)
          return NextResponse.json(errorData, { status: 502 })
        } catch {
          // Not JSON
        }
      }
      console.error('Garmin CLI error:', execError.stderr || execError.message)
      return NextResponse.json({
        success: false,
        error: `Garmin sync fout: ${execError.stderr || execError.message}`,
      }, { status: 500 })
    }

    // Parse the JSON output from Python
    let garminData: any
    try {
      garminData = JSON.parse(result.stdout)
    } catch {
      console.error('Invalid JSON from Garmin CLI:', result.stdout)
      return NextResponse.json({
        success: false,
        error: 'Ongeldig antwoord van Garmin sync',
      }, { status: 500 })
    }

    if (!garminData.success) {
      return NextResponse.json(garminData, { status: 502 })
    }

    // Save activities to Supabase
    const activities = garminData.activities || []
    let newCount = 0
    let updatedCount = 0

    for (const activity of activities) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('completed_workouts')
        .select('id')
        .eq('garmin_activity_id', activity.garmin_activity_id)
        .eq('user_id', userId)
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabase
          .from('completed_workouts')
          .update({
            title: activity.title,
            actual_duration_seconds: activity.actual_duration_seconds,
            actual_distance_meters: activity.actual_distance_meters,
            avg_pace_seconds_per_km: activity.avg_pace_seconds_per_km,
            avg_heart_rate: activity.avg_heart_rate,
            max_heart_rate: activity.max_heart_rate,
            calories: activity.calories,
            elevation_gain_meters: activity.elevation_gain_meters,
            avg_power_watts: activity.avg_power_watts,
            normalized_power_watts: activity.normalized_power_watts,
            training_stress_score: activity.training_stress_score,
          })
          .eq('id', existing[0].id)

        if (!error) updatedCount++
      } else {
        // Insert new
        const { error } = await supabase
          .from('completed_workouts')
          .insert({
            user_id: userId,
            garmin_activity_id: activity.garmin_activity_id,
            date: activity.date,
            sport: activity.sport,
            title: activity.title,
            actual_duration_seconds: activity.actual_duration_seconds,
            actual_distance_meters: activity.actual_distance_meters,
            avg_pace_seconds_per_km: activity.avg_pace_seconds_per_km,
            avg_heart_rate: activity.avg_heart_rate,
            max_heart_rate: activity.max_heart_rate,
            calories: activity.calories,
            elevation_gain_meters: activity.elevation_gain_meters,
            avg_power_watts: activity.avg_power_watts,
            normalized_power_watts: activity.normalized_power_watts,
            training_stress_score: activity.training_stress_score,
          })

        if (!error) newCount++
        else console.error('Insert error:', error)
      }
    }

    // Update last_sync_at in garmin_tokens
    await supabase
      .from('garmin_tokens')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      total_from_garmin: activities.length,
      new_activities: newCount,
      updated_activities: updatedCount,
      message: `${newCount} nieuwe + ${updatedCount} bijgewerkte activiteiten`,
    })
  } catch (error) {
    console.error('Garmin sync error:', error)
    return NextResponse.json({
      success: false,
      error: 'Er ging iets mis met de Garmin sync',
    }, { status: 500 })
  }
}
