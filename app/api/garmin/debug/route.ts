/**
 * GET /api/garmin/debug
 * Debug endpoint: tests all Garmin API methods and reports what works.
 */

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)

function getCliPath(): string {
  return path.resolve(process.cwd(), '..', 'backend', 'garmin', 'cli_sync.py')
}

export async function GET() {
  try {
    const cliPath = getCliPath()

    let result: { stdout: string; stderr: string }
    try {
      result = await execFileAsync('python3', [cliPath, 'debug'], {
        timeout: 30000,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      })
    } catch (execError: any) {
      // Python script may output JSON even on error
      if (execError.stdout) {
        try {
          return NextResponse.json(JSON.parse(execError.stdout))
        } catch {
          // Not JSON
        }
      }
      return NextResponse.json({
        success: false,
        error: execError.stderr || execError.message,
        cli_path: cliPath,
      })
    }

    try {
      return NextResponse.json(JSON.parse(result.stdout))
    } catch {
      return NextResponse.json({
        success: false,
        raw_output: result.stdout,
        stderr: result.stderr,
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
