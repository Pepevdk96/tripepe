/**
 * GET /api/coach/conversations
 * List all coach conversations for the user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get first user for testing
    const { data: users } = await supabase.from('users').select('id').limit(1)
    const userId = users?.[0]?.id
    if (!userId) {
      return NextResponse.json({ conversations: [], total: 0, hasMore: false })
    }

    const { data, count } = await supabase
      .from('coach_conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const total = count || 0

    return NextResponse.json({
      conversations: (data || []).map((c) => ({
        id: c.id,
        title: c.title,
        startedAt: c.started_at,
        lastMessageAt: c.last_message_at,
        messageCount: c.message_count,
        isArchived: c.is_archived,
      })),
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('List conversations error:', error)
    return NextResponse.json({ conversations: [], total: 0, hasMore: false })
  }
}
