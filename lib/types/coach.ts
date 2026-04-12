/**
 * TriPepe AI Coach - TypeScript Types
 * Types for the AI coaching chat feature.
 */

// =============================================================================
// Enums
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export type QuickActionId =
  | 'adjust_training'
  | 'explain_plan'
  | 'recovery_tips'
  | 'race_prep'
  | 'nutrition_advice'
  | 'feeling_tired'

// =============================================================================
// Core Types
// =============================================================================

export interface CoachMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string // ISO 8601
  contextUsed?: Record<string, unknown>
}

export interface CoachConversation {
  id: string
  title: string | null
  startedAt: string
  lastMessageAt: string
  messageCount: number
  isArchived: boolean
}

export interface QuickAction {
  id: QuickActionId
  label: string
  icon: string
  promptPreview: string
}

// =============================================================================
// Request Types
// =============================================================================

export interface ChatMessageRequest {
  message: string
  conversationId?: string
  quickAction?: QuickActionId
}

// =============================================================================
// Response Types
// =============================================================================

export interface AdaptationResult {
  action: string
  targetDate: string
  sport?: string
  reason: string
  changes: Record<string, unknown>
  success: boolean
  workoutTitle?: string
}

export interface ChatResponse {
  conversationId: string
  message: CoachMessage
  conversationTitle?: string
  tokensUsed?: number
  adaptations?: AdaptationResult[]
}

export interface ConversationListResponse {
  conversations: CoachConversation[]
  total: number
  hasMore: boolean
}

export interface ConversationDetailResponse {
  conversation: CoachConversation
  messages: CoachMessage[]
}

export interface QuickActionsResponse {
  actions: QuickAction[]
}

// =============================================================================
// Normalization
// =============================================================================

export function normalizeCoachMessage(data: Record<string, unknown>): CoachMessage {
  return {
    id: String(data.id || ''),
    role: String(data.role || 'assistant') as MessageRole,
    content: String(data.content || ''),
    createdAt: String(data.createdAt || data.created_at || new Date().toISOString()),
  }
}

export function normalizeConversation(data: Record<string, unknown>): CoachConversation {
  return {
    id: String(data.id || ''),
    title: data.title ? String(data.title) : null,
    startedAt: String(data.startedAt || data.started_at || ''),
    lastMessageAt: String(data.lastMessageAt || data.last_message_at || ''),
    messageCount: Number(data.messageCount || data.message_count || 0),
    isArchived: Boolean(data.isArchived || data.is_archived || false),
  }
}
