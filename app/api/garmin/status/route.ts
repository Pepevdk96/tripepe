/**
 * GET /api/garmin/status
 * Returns Garmin connection status.
 */

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

function getCliPath(): string {
  return path.resolve(process.cwd(), '..', 'backend', 'garmin', 'cli_sync.py')
}

export async function GET() {
  try {
    // Get DB status
    const { data: tokenRow } = await supabase
      .from('garmin_tokens')
      .select('garmin_email, last_sync_at, sync_enabled')
      .eq('user_id', DEFAULT_USER_ID)
      .single()

    // Check if Python CLI can connect
    let cliStatus: any = null
    try {
      const cliPath = getCliPath()
      const { stdout } = await execFileAsync('python3', [cliPath, 'status'], {
        timeout: 15000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
      cliStatus = JSON.parse(stdout)
    } catch {
      cliStatus = { connected: false, message: 'Python CLI niet beschikbaar' }
    }

    // Count synced activities
    const { count } = await supabase
      .from('completed_workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', DEFAULT_USER_ID)

    return NextResponse.json({
      connected: cliStatus?.connected || false,
      display_name: cliStatus?.display_name || null,
      garmin_email: tokenRow?.garmin_email || null,
      last_sync_at: tokenRow?.last_sync_at || null,
      sync_enabled: tokenRow?.sync_enabled ?? false,
      synced_activities: count || 0,
    })
  } catch (error) {
    console.error('Garmin status error:', error)
    return NextResponse.json({
      connected: false,
      error: 'Kon status niet ophalen',
    }, { status: 500 })
  }
}
