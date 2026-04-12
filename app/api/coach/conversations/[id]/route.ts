/**
 * GET /api/coach/conversations/[id]
 * Get a conversation with all its messages.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const convId = params.id

    const { data: conv } = await supabase
      .from('coach_conversations')
      .select('*')
      .eq('id', convId)
      .single()

    if (!conv) {
      return NextResponse.json({ error: 'Gesprek niet gevonden' }, { status: 404 })
    }

    const { data: messages } = await supabase
      .from('coach_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      conversation: {
        id: conv.id,
        title: conv.title,
        startedAt: conv.started_at,
        lastMessageAt: conv.last_message_at,
        messageCount: conv.message_count,
        isArchived: conv.is_archived,
      },
      messages: (messages || []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ error: 'Kon gesprek niet laden' }, { status: 500 })
  }
}
