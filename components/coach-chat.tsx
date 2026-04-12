'use client'

/**
 * TriPepe AI Coach - Chat Component
 * Full chat interface with message history, quick actions, and conversation management.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  CoachMessage,
  CoachConversation,
  QuickAction,
  QuickActionId,
} from '@/lib/types/coach'
import {
  sendCoachMessage,
  listConversations,
  getConversation,
  getQuickActions,
} from '@/lib/api/coach'

// =============================================================================
// Adaptation types
// =============================================================================
interface AdaptationResult {
  action: string
  targetDate: string
  sport?: string
  reason: string
  changes: Record<string, unknown>
  success: boolean
  workoutTitle?: string
}

// Extended message with optional adaptations
interface ExtendedCoachMessage extends CoachMessage {
  adaptations?: AdaptationResult[]
}

// =============================================================================
// Quick Actions — Hardcoded fallback if API fails
// =============================================================================
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'adjust_training', label: 'Training aanpassen', icon: '🔄', promptPreview: 'Pas mijn training aan...' },
  { id: 'explain_plan', label: 'Plan uitleggen', icon: '📋', promptPreview: 'Leg mijn plan uit...' },
  { id: 'recovery_tips', label: 'Hersteltips', icon: '💤', promptPreview: 'Geef me hersteltips...' },
  { id: 'race_prep', label: 'Racevoorbereid', icon: '🏁', promptPreview: 'Help met raceprep...' },
  { id: 'nutrition_advice', label: 'Voedingsadvies', icon: '🍌', promptPreview: 'Geef voedingsadvies...' },
  { id: 'feeling_tired', label: 'Ik ben moe', icon: '😴', promptPreview: 'Ik voel me moe...' },
]

// =============================================================================
// Adaptation Changes — typed helper for rendering change details
// =============================================================================
function AdaptationChanges({ changes }: { changes: Record<string, unknown> }) {
  const c = changes as Record<string, string | number | boolean | null>
  const items: React.ReactNode[] = []

  if (c.original_duration && c.new_duration) {
    items.push(
      <div key="dur" className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-500">Duur:</span>
        <span className="text-red-400 line-through">{String(c.original_duration)}min</span>
        <span className="text-gray-500">→</span>
        <span className="text-emerald-400 font-medium">{String(c.new_duration)}min</span>
      </div>,
    )
  }
  if (c.original_intensity && c.new_intensity) {
    items.push(
      <div key="int" className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-500">Intensiteit:</span>
        <span className="text-red-400 line-through">{String(c.original_intensity)}</span>
        <span className="text-gray-500">→</span>
        <span className="text-emerald-400 font-medium">{String(c.new_intensity)}</span>
      </div>,
    )
  }
  if (c.original_date && c.new_date) {
    items.push(
      <div key="date" className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-500">Datum:</span>
        <span className="text-red-400 line-through">{String(c.original_date)}</span>
        <span className="text-gray-500">→</span>
        <span className="text-emerald-400 font-medium">{String(c.new_date)}</span>
      </div>,
    )
  }
  if (c.replaced_with) {
    items.push(
      <div key="repl" className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-500">Vervangen door:</span>
        <span className="text-emerald-400 font-medium">{String(c.replaced_with)}</span>
      </div>,
    )
  }
  if (c.skipped) {
    items.push(
      <div key="skip" className="text-[11px] text-gray-400 italic">Training overgeslagen</div>,
    )
  }

  return <>{items}</>
}

// =============================================================================
// Adaptation Card — shows when training was auto-adjusted
// =============================================================================
function AdaptationCard({ adaptation }: { adaptation: AdaptationResult }) {
  const actionLabels: Record<string, string> = {
    reduce_volume: '📉 Volume verlaagd',
    reduce_intensity: '🔽 Intensiteit verlaagd',
    skip_workout: '⏭️ Training overgeslagen',
    swap_workout: '🔄 Training vervangen',
    extend_duration: '📈 Duur verlengd',
    add_rest_day: '😴 Rustdag ingevoegd',
    move_workout: '📅 Training verplaatst',
  }

  const sportEmoji: Record<string, string> = {
    run: '🏃',
    bike: '🚴',
    swim: '🏊',
    strength: '💪',
    rest: '😴',
  }

  const label = actionLabels[adaptation.action] || `🔧 ${adaptation.action}`
  const emoji = adaptation.sport ? (sportEmoji[adaptation.sport] || '🏋️') : '🏋️'

  return (
    <div className="mb-3 flex justify-start">
      <div className="max-w-[85%] rounded-2xl overflow-hidden border border-emerald-500/30">
        {/* Green header bar */}
        <div className="bg-emerald-500/20 px-4 py-2 flex items-center gap-2">
          <span className="text-sm">✅</span>
          <span className="text-xs font-semibold text-emerald-400">
            Training automatisch aangepast
          </span>
        </div>
        {/* Card body */}
        <div className="bg-[#0f1a15] px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{emoji}</span>
            <div>
              <p className="text-sm font-medium text-white">
                {adaptation.workoutTitle || 'Training'}
              </p>
              <p className="text-[10px] text-gray-400">{adaptation.targetDate}</p>
            </div>
          </div>
          <div className="text-xs text-emerald-300 font-medium mb-1.5">
            {label}
          </div>
          {/* Show specific changes */}
          {adaptation.changes && Object.keys(adaptation.changes).length > 0 && (
            <div className="space-y-1">
              <AdaptationChanges changes={adaptation.changes} />
            </div>
          )}
          <p className="text-[10px] text-gray-500 mt-2 italic">
            {adaptation.reason}
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Message Bubble
// =============================================================================
function MessageBubble({ message }: { message: ExtendedCoachMessage }) {
  const isUser = message.role === 'user'

  return (
    <>
      {/* Show adaptation cards before the message */}
      {!isUser && message.adaptations && message.adaptations.length > 0 && (
        <>
          {message.adaptations.map((adaptation, i) => (
            <AdaptationCard key={`adapt-${message.id}-${i}`} adaptation={adaptation} />
          ))}
        </>
      )}
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-[#1a1a2e] text-gray-100 rounded-bl-md border border-[#2a2a3e]'
          }`}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-medium text-blue-400">TriPepe Coach</span>
            </div>
          )}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div
            className={`text-[10px] mt-1.5 ${
              isUser ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </>
  )
}

// =============================================================================
// Typing Indicator
// =============================================================================
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-medium text-blue-400">TriPepe Coach</span>
        </div>
        <div className="flex gap-1.5 py-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Quick Action Chips
// =============================================================================
function QuickActionChips({
  actions,
  onSelect,
  disabled,
}: {
  actions: QuickAction[]
  onSelect: (action: QuickAction) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onSelect(action)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium
            bg-[#1a1a2e] border border-[#2a2a3e] rounded-full
            text-gray-300 hover:text-white hover:border-blue-500/50
            hover:bg-blue-500/10 transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// =============================================================================
// Conversation Sidebar (mobile: overlay)
// =============================================================================
function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onClose,
}: {
  conversations: CoachConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d0d17] border-r border-[#2a2a3e]
          overflow-y-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Gesprekken</h2>
          <button
            onClick={onNewChat}
            className="text-xs px-3 py-1.5 bg-blue-600 rounded-lg text-white
              hover:bg-blue-500 transition-colors"
          >
            + Nieuw
          </button>
        </div>
        <div className="p-2">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-500 p-3 text-center">
              Nog geen gesprekken. Start er een!
            </p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelect(conv.id)
                onClose()
              }}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                activeId === conv.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'hover:bg-[#1a1a2e]'
              }`}
            >
              <p className="text-sm text-white truncate">
                {conv.title || 'Nieuw gesprek'}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {conv.messageCount} berichten · {formatDate(conv.lastMessageAt)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Empty State
// =============================================================================
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">🏊‍♂️🚴🏃‍♂️</div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Hoi! Ik ben je TriPepe Coach
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Stel me een vraag over je training, plan, voeding of wedstrijdvoorbereiding.
          Ik ken je data en geef persoonlijk advies.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// Main Chat Component
// =============================================================================
export default function CoachChat() {
  // State
  const [messages, setMessages] = useState<ExtendedCoachMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<CoachConversation[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS)
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Load conversations and quick actions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [convResponse, actionsResponse] = await Promise.allSettled([
          listConversations(undefined, { limit: 20 }),
          getQuickActions(),
        ])

        if (convResponse.status === 'fulfilled') {
          setConversations(convResponse.value.conversations)
        }
        if (actionsResponse.status === 'fulfilled') {
          setQuickActions(actionsResponse.value.actions)
        }
      } catch (err) {
        // Silently fail — quick actions have fallback
        console.warn('Failed to load initial coach data:', err)
      }
    }

    loadInitialData()
  }, [])

  // Load a conversation
  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true)
      const detail = await getConversation(id)
      setMessages(detail.messages)
      setConversationId(id)
      setError(null)
    } catch (err) {
      setError('Kon gesprek niet laden')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Start new conversation
  const startNewChat = () => {
    setMessages([])
    setConversationId(null)
    setError(null)
    setShowSidebar(false)
    inputRef.current?.focus()
  }

  // Send message
  const sendMessage = async (text: string, quickAction?: QuickActionId) => {
    if (!text.trim() && !quickAction) return
    if (isLoading) return

    const userMessage: CoachMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendCoachMessage({
        message: text.trim(),
        conversationId: conversationId || undefined,
        quickAction,
      })

      // Update conversation ID (for new conversations)
      if (!conversationId) {
        setConversationId(response.conversationId)
        // Refresh conversation list
        try {
          const convResponse = await listConversations(undefined, { limit: 20 })
          setConversations(convResponse.conversations)
        } catch {
          // Non-critical
        }
      }

      // Add assistant response (with adaptations if any)
      const assistantMessage: ExtendedCoachMessage = {
        ...response.message,
        adaptations: response.adaptations,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis'
      setError(errorMessage)
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  // Handle quick action
  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.promptPreview, action.id as QuickActionId)
  }

  // Handle Enter key (shift+enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    // Auto resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3e] bg-[#0d0d17]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(true)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Gesprekken"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">AI Coach</h1>
            <p className="text-[10px] text-gray-500">Persoonlijk trainingsadvies</p>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="text-xs px-3 py-1.5 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg
            text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors"
        >
          + Nieuw
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading ? (
          <>
            <EmptyState />
            <QuickActionChips
              actions={quickActions}
              onSelect={handleQuickAction}
              disabled={isLoading}
            />
          </>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center mb-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 max-w-[85%]">
              <p className="text-xs text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-[10px] text-red-300 underline mt-1"
              >
                Sluiten
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions when conversation is active */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-1">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.slice(0, 4).map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="flex-shrink-0 px-2.5 py-1.5 text-[10px] font-medium
                  bg-[#1a1a2e] border border-[#2a2a3e] rounded-full
                  text-gray-400 hover:text-white hover:border-blue-500/50
                  transition-all disabled:opacity-40"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-[#2a2a3e] bg-[#0d0d17]"
      >
        <div className="flex items-end gap-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-3 py-2
          focus-within:border-blue-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Vraag je coach iets..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500
              resize-none outline-none max-h-[120px] py-1
              disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center
              bg-blue-600 rounded-full text-white
              hover:bg-blue-500 transition-colors
              disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            aria-label="Verstuur"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-[9px] text-gray-600 text-center mt-1.5">
          AI coach kent je trainingsdata en geeft persoonlijk advies
        </p>
      </form>

      {/* Conversation Sidebar */}
      {showSidebar && (
        <ConversationList
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNewChat={startNewChat}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'vandaag'
    if (days === 1) return 'gisteren'
    if (days < 7) return `${days}d geleden`
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
