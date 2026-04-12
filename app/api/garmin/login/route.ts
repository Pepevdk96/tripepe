/**
 * POST /api/garmin/login
 * Login to Garmin Connect.
 * Calls the Python CLI to handle the auth flow with garth.
 */

export const runtime = 'nodejs'

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

function getCliPath(): string {
  return path.resolve(process.cwd(), '..', 'backend', 'garmin', 'cli_sync.py')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is verplicht',
      }, { status: 400 })
    }

    // Call Python CLI to login
    const cliPath = getCliPath()
    const args = ['login', '--email', email]
    if (password) args.push('--password', password)

    let result: { stdout: string; stderr: string }
    try {
      result = await execFileAsync('python3', [cliPath, ...args], {
        timeout: 30000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
    } catch (execError: any) {
      if (execError.stdout) {
        try {
          const errorData = JSON.parse(execError.stdout)
          return NextResponse.json(errorData, { status: 401 })
        } catch {
          // Not JSON
        }
      }
      return NextResponse.json({
        success: false,
        error: execError.stderr || execError.message || 'Login mislukt',
      }, { status: 500 })
    }

    // Parse result
    let loginData: any
    try {
      loginData = JSON.parse(result.stdout)
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Ongeldig antwoord van login script',
      }, { status: 500 })
    }

    if (!loginData.success) {
      return NextResponse.json(loginData, { status: 401 })
    }

    // Update garmin_tokens in DB
    const { data: existing } = await supabase
      .from('garmin_tokens')
      .select('id')
      .eq('user_id', DEFAULT_USER_ID)
      .limit(1)

    if (existing && existing.length > 0) {
      await supabase
        .from('garmin_tokens')
        .update({
          garmin_email: email,
          sync_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', DEFAULT_USER_ID)
    } else {
      await supabase
        .from('garmin_tokens')
        .insert({
          user_id: DEFAULT_USER_ID,
          garmin_email: email,
          sync_enabled: true,
        })
    }

    return NextResponse.json({
      success: true,
      display_name: loginData.display_name,
      message: `Ingelogd als ${loginData.display_name}`,
    })
  } catch (error) {
    console.error('Garmin login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Er ging iets mis met de Garmin login',
    }, { status: 500 })
  }
}
