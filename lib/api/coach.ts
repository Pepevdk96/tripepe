/**
 * TriPepe AI Coach - API Client
 * Talks to Next.js API routes (/api/coach/*) which handle Supabase + Anthropic.
 */

import {
  ChatMessageRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationDetailResponse,
  QuickActionsResponse,
  normalizeCoachMessage,
  normalizeConversation,
} from '@/lib/types/coach'

// Use Next.js API routes (same origin)
const COACH_API = '/api/coach'

// =============================================================================
// CHAT — Main endpoint
// =============================================================================

export async function sendCoachMessage(
  request: ChatMessageRequest,
  _token?: string,
): Promise<ChatResponse> {
  const response = await fetch(`${COACH_API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: request.message,
      conversationId: request.conversationId || undefined,
      quickAction: request.quickAction || undefined,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    if (response.status === 503) {
      throw new Error('AI coach is tijdelijk niet beschikbaar. Probeer het zo opnieuw.')
    }
    throw new Error(`Coach error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return {
    conversationId: String(data.conversationId || data.conversation_id),
    message: normalizeCoachMessage(data.message),
    conversationTitle: data.conversationTitle || data.conversation_title || undefined,
    tokensUsed: data.tokensUsed || data.tokens_used || undefined,
    adaptations: data.adaptations || undefined,
  }
}

// =============================================================================
// CONVERSATIONS
// =============================================================================

export async function listConversations(
  _token?: string,
  options?: { limit?: number; offset?: number; includeArchived?: boolean },
): Promise<ConversationListResponse> {
  const params = new URLSearchParams()
  if (options?.limit) params.append('limit', String(options.limit))
  if (options?.offset) params.append('offset', String(options.offset))
  if (options?.includeArchived) params.append('include_archived', 'true')

  const url = `${COACH_API}/conversations${params.toString() ? '?' + params.toString() : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to list conversations: ${response.status}`)
  }

  const data = await response.json()
  return {
    conversations: (data.conversations || []).map((c: Record<string, unknown>) =>
      normalizeConversation(c),
    ),
    total: Number(data.total || 0),
    hasMore: Boolean(data.hasMore || data.has_more || false),
  }
}

export async function getConversation(
  conversationId: string,
  _token?: string,
): Promise<ConversationDetailResponse> {
  const response = await fetch(`${COACH_API}/conversations/${conversationId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to get conversation: ${response.status}`)
  }

  const data = await response.json()
  return {
    conversation: normalizeConversation(data.conversation),
    messages: (data.messages || []).map((m: Record<string, unknown>) =>
      normalizeCoachMessage(m),
    ),
  }
}

export async function archiveConversation(
  conversationId: string,
  _token?: string,
): Promise<void> {
  const response = await fetch(`${COACH_API}/conversations/${conversationId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`Failed to archive: ${response.status}`)
}

export async function deleteConversation(
  conversationId: string,
  _token?: string,
): Promise<void> {
  const response = await fetch(`${COACH_API}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`Failed to delete: ${response.status}`)
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

export async function getQuickActions(_token?: string): Promise<QuickActionsResponse> {
  const response = await fetch(`${COACH_API}/quick-actions`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) throw new Error(`Failed to get quick actions: ${response.status}`)
  return response.json()
}
