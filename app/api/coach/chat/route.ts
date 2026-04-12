/**
 * POST /api/coach/chat
 * Next.js API route that handles AI Coach chat.
 * Talks directly to Supabase + Anthropic — no Python backend needed.
 *
 * Supports TOOL USE: the AI coach can actually modify training plans
 * by calling the modify_training tool, which updates Supabase directly.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const anthropicKey = process.env.ANTHROPIC_API_KEY || ''
const coachModel = process.env.COACH_MODEL || 'claude-sonnet-4-20250514'

const supabase = createClient(supabaseUrl, supabaseKey)

// =============================================================================
// System prompt
// =============================================================================

const SYSTEM_PROMPT = `Je bent de TriPepe AI Coach — een persoonlijke triathlon- en hardloopcoach die in de TriPepe trainingsapp leeft.

## Jouw rol
Je bent een ervaren, empathische coach die de atleet persoonlijk kent. Je hebt toegang tot hun volledige trainingsdata, plan, gezondheidsmetrieken en wedstrijddoelen. Gebruik deze data actief in je antwoorden.

## Stijl & toon
- Spreek Nederlands (de atleet is Nederlandstalig)
- Wees direct, concreet en sportief
- Gebruik "je" (informeel), nooit "u"
- Geef specifiek advies op basis van de data, niet generiek
- Korte, krachtige antwoorden. Geen lange essays tenzij gevraagd

## Regels
1. Altijd data-gedreven: verwijs naar concrete cijfers
2. Geen medisch advies: bij blessures → verwijs naar fysiotherapeut
3. Respect voor het plan: adviseer aanpassingen, maar leg uit waarom
4. Veiligheid eerst: bij tekenen van overtraining → adviseer rust
5. Race-context: houd altijd rekening met aankomende wedstrijden

## Trainingsaanpassingen
Je hebt een TOOL beschikbaar om het trainingsplan daadwerkelijk aan te passen: modify_training.
Gebruik deze tool wanneer:
- De atleet expliciet vraagt om training aan te passen
- Je op basis van data (lage HRV, hoge vermoeidheid, ziekte) vindt dat het plan moet wijzigen
- De atleet aangeeft een training over te willen slaan of te willen verplaatsen

Wanneer je modify_training aanroept:
1. Leg EERST kort uit WAAROM je de aanpassing doet
2. Roep dan de tool aan met de juiste parameters
3. Na het resultaat: bevestig wat er is gewijzigd

BELANGRIJK: Pas NOOIT de training aan zonder duidelijke reden. Bij twijfel, vraag eerst bevestiging aan de atleet.`

// =============================================================================
// Anthropic tool definitions
// =============================================================================

const COACH_TOOLS = [
  {
    name: 'modify_training',
    description: `Pas een geplande training aan in het trainingsplan van de atleet. Gebruik dit wanneer de atleet vraagt om aanpassingen, of wanneer data aangeeft dat het plan moet wijzigen (lage HRV, vermoeidheid, ziekte, etc).`,
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['reduce_volume', 'reduce_intensity', 'skip_workout', 'swap_workout', 'extend_duration', 'add_rest_day', 'move_workout'],
          description: 'Het type aanpassing: reduce_volume (korter), reduce_intensity (makkelijker), skip_workout (overslaan), swap_workout (vervangen door andere training), extend_duration (langer), add_rest_day (rustdag toevoegen), move_workout (verplaatsen naar andere dag)',
        },
        target_date: {
          type: 'string',
          description: 'De datum van de training die aangepast moet worden (YYYY-MM-DD format). Gebruik de datum van vandaag als er geen specifieke datum wordt genoemd.',
        },
        sport: {
          type: 'string',
          enum: ['run', 'bike', 'swim', 'strength', 'rest'],
          description: 'De sport van de training (optioneel - als er meerdere trainingen op 1 dag zijn)',
        },
        new_duration_minutes: {
          type: 'number',
          description: 'Nieuwe duur in minuten (voor reduce_volume, extend_duration)',
        },
        new_intensity: {
          type: 'string',
          enum: ['rest', 'easy', 'moderate', 'hard', 'race'],
          description: 'Nieuwe intensiteit (voor reduce_intensity)',
        },
        new_title: {
          type: 'string',
          description: 'Nieuwe titel voor de training (voor swap_workout)',
        },
        new_description: {
          type: 'string',
          description: 'Nieuwe beschrijving van de training (voor swap_workout of bij aanpassingen)',
        },
        move_to_date: {
          type: 'string',
          description: 'Nieuwe datum (YYYY-MM-DD) voor move_workout',
        },
        reason: {
          type: 'string',
          description: 'Korte reden voor de aanpassing (wordt opgeslagen in de adaptation_log)',
        },
      },
      required: ['action', 'target_date', 'reason'],
    },
  },
]

// =============================================================================
// Main handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, userId } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Bericht mag niet leeg zijn' }, { status: 400 })
    }

    // Use a default user ID for testing (first user in DB)
    let activeUserId = userId
    if (!activeUserId) {
      const { data: users } = await supabase.from('users').select('id').limit(1)
      activeUserId = users?.[0]?.id
    }

    // Gather athlete context from Supabase
    const context = await buildContext(activeUserId)

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message
      const { data: conv, error } = await supabase
        .from('coach_conversations')
        .insert({ user_id: activeUserId, title })
        .select()
        .single()

      if (error) {
        console.error('Failed to create conversation:', error)
        return NextResponse.json({ error: 'Kon gesprek niet aanmaken' }, { status: 500 })
      }
      convId = conv.id
    }

    // Save user message
    await supabase.from('coach_messages').insert({
      conversation_id: convId,
      user_id: activeUserId,
      role: 'user',
      content: message,
    })

    // Get conversation history
    const { data: history } = await supabase
      .from('coach_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .neq('role', 'system')
      .order('created_at', { ascending: true })
      .limit(20)

    const messages = (history || []).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    // Build system prompt with context
    const systemPrompt = `${SYSTEM_PROMPT}\n\n## Atleet context (LIVE DATA)\n${context}`

    // Call Anthropic (with tool use support)
    let responseText: string
    let tokensUsed = 0
    let adaptations: AdaptationResult[] = []

    if (anthropicKey) {
      const result = await callAnthropicWithTools(systemPrompt, messages, activeUserId)
      responseText = result.text
      tokensUsed = result.tokens
      adaptations = result.adaptations
    } else {
      responseText = generateMockResponse(message, activeUserId)
      // Mock adaptation for testing
      if (message.toLowerCase().includes('aanpas') || message.toLowerCase().includes('lichter') || message.toLowerCase().includes('makkelijker')) {
        adaptations = [generateMockAdaptation()]
      }
    }

    // Save assistant message (include adaptations metadata)
    const messageMetadata = adaptations.length > 0 ? { adaptations } : undefined
    const { data: assistantMsg } = await supabase
      .from('coach_messages')
      .insert({
        conversation_id: convId,
        user_id: activeUserId,
        role: 'assistant',
        content: responseText,
        tokens_used: tokensUsed,
        model: anthropicKey ? coachModel : 'mock',
        context_used: messageMetadata,
      })
      .select()
      .single()

    // Update conversation
    await supabase
      .from('coach_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: (history?.length || 0) + 1,
      })
      .eq('id', convId)

    return NextResponse.json({
      conversationId: convId,
      message: {
        id: assistantMsg?.id || crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        createdAt: assistantMsg?.created_at || new Date().toISOString(),
      },
      conversationTitle: !conversationId ? message.substring(0, 50) : undefined,
      tokensUsed,
      adaptations: adaptations.length > 0 ? adaptations : undefined,
    })
  } catch (error) {
    console.error('Coach chat error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis met de AI coach' },
      { status: 500 },
    )
  }
}

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

// =============================================================================
// Tool execution: modify_training
// =============================================================================

interface ModifyTrainingInput {
  action: string
  target_date: string
  sport?: string
  new_duration_minutes?: number
  new_intensity?: string
  new_title?: string
  new_description?: string
  move_to_date?: string
  reason: string
}

async function executeModifyTraining(
  input: ModifyTrainingInput,
  userId: string,
): Promise<AdaptationResult> {
  const { action, target_date, sport, reason } = input
  const changes: Record<string, unknown> = {}

  // Find the target workout
  let query = supabase
    .from('planned_workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', target_date)
    .neq('status', 'completed')

  if (sport) {
    query = query.eq('sport', sport)
  }

  const { data: workouts, error: findError } = await query.order('is_key_workout', { ascending: false }).limit(1)

  if (findError || !workouts || workouts.length === 0) {
    return {
      action,
      targetDate: target_date,
      sport,
      reason,
      changes: {},
      success: false,
      workoutTitle: undefined,
    }
  }

  const workout = workouts[0]
  const workoutId = workout.id
  const planId = workout.plan_id

  // Execute the modification based on action type
  switch (action) {
    case 'reduce_volume': {
      const newDuration = input.new_duration_minutes || Math.round(workout.duration_minutes * 0.7)
      const newDistance = workout.distance_meters ? Math.round(workout.distance_meters * 0.7) : null
      changes.original_duration = workout.duration_minutes
      changes.new_duration = newDuration
      changes.original_distance = workout.distance_meters
      changes.new_distance = newDistance

      await supabase
        .from('planned_workouts')
        .update({
          duration_minutes: newDuration,
          distance_meters: newDistance,
          status: 'modified',
          description: `[Aangepast: volume -30%] ${workout.description || ''}`.trim(),
        })
        .eq('id', workoutId)
      break
    }

    case 'reduce_intensity': {
      const newIntensity = input.new_intensity || 'easy'
      changes.original_intensity = workout.intensity
      changes.new_intensity = newIntensity

      await supabase
        .from('planned_workouts')
        .update({
          intensity: newIntensity,
          status: 'modified',
          pace_target_min: null,
          pace_target_max: null,
          hr_zone_target: newIntensity === 'easy' ? 2 : newIntensity === 'moderate' ? 3 : null,
          description: `[Aangepast: intensiteit → ${newIntensity}] ${workout.description || ''}`.trim(),
        })
        .eq('id', workoutId)
      break
    }

    case 'skip_workout': {
      changes.skipped = true
      changes.original_title = workout.title

      await supabase
        .from('planned_workouts')
        .update({
          status: 'skipped',
          description: `[Overgeslagen: ${reason}] ${workout.description || ''}`.trim(),
        })
        .eq('id', workoutId)
      break
    }

    case 'swap_workout': {
      changes.original_title = workout.title
      changes.original_sport = workout.sport
      changes.new_title = input.new_title
      changes.new_description = input.new_description

      const updateData: Record<string, unknown> = {
        status: 'modified',
        description: input.new_description || workout.description,
      }
      if (input.new_title) updateData.title = input.new_title
      if (input.new_duration_minutes) updateData.duration_minutes = input.new_duration_minutes
      if (input.new_intensity) updateData.intensity = input.new_intensity

      await supabase
        .from('planned_workouts')
        .update(updateData)
        .eq('id', workoutId)
      break
    }

    case 'extend_duration': {
      const newDuration = input.new_duration_minutes || Math.round(workout.duration_minutes * 1.15)
      changes.original_duration = workout.duration_minutes
      changes.new_duration = newDuration

      await supabase
        .from('planned_workouts')
        .update({
          duration_minutes: newDuration,
          status: 'modified',
          description: `[Aangepast: duur verlengd] ${workout.description || ''}`.trim(),
        })
        .eq('id', workoutId)
      break
    }

    case 'add_rest_day': {
      changes.original_title = workout.title
      changes.replaced_with = 'Rustdag'

      await supabase
        .from('planned_workouts')
        .update({
          sport: 'rest',
          title: 'Rustdag (coach-advies)',
          intensity: 'rest',
          duration_minutes: 0,
          distance_meters: null,
          status: 'modified',
          description: `[Rustdag: ${reason}] Origineel: ${workout.title}`,
        })
        .eq('id', workoutId)
      break
    }

    case 'move_workout': {
      if (input.move_to_date) {
        changes.original_date = target_date
        changes.new_date = input.move_to_date

        await supabase
          .from('planned_workouts')
          .update({
            date: input.move_to_date,
            status: 'modified',
            description: `[Verplaatst van ${target_date}] ${workout.description || ''}`.trim(),
          })
          .eq('id', workoutId)
      }
      break
    }
  }

  // Log the adaptation
  await supabase.from('adaptation_log').insert({
    plan_id: planId,
    user_id: userId,
    date: new Date().toISOString().split('T')[0],
    trigger_type: 'coach_chat',
    trigger_details: { user_request: reason, action },
    action_type: action,
    action_details: changes,
    applied: true,
    user_accepted: true,
  })

  return {
    action,
    targetDate: target_date,
    sport: workout.sport,
    reason,
    changes,
    success: true,
    workoutTitle: workout.title,
  }
}

// =============================================================================
// Context builder
// =============================================================================

async function buildContext(userId: string): Promise<string> {
  const sections: string[] = []

  // Athlete name from users table
  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()

  // Athlete profile
  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profile) {
    sections.push(`## Atleet: ${user?.name || 'Atleet'}`)
    const parts = []
    if (profile.vo2max) parts.push(`VO2max: ${profile.vo2max}`)
    if (profile.threshold_pace_seconds_per_km) {
      const tMin = Math.floor(profile.threshold_pace_seconds_per_km / 60)
      const tSec = profile.threshold_pace_seconds_per_km % 60
      parts.push(`Drempeltempo: ${tMin}:${String(tSec).padStart(2, '0')}/km`)
    }
    if (profile.easy_pace_seconds_per_km) {
      const eMin = Math.floor(profile.easy_pace_seconds_per_km / 60)
      const eSec = profile.easy_pace_seconds_per_km % 60
      parts.push(`Easy pace: ${eMin}:${String(eSec).padStart(2, '0')}/km`)
    }
    if (profile.swim_css_seconds_per_100m) {
      const cMin = Math.floor(profile.swim_css_seconds_per_100m / 60)
      const cSec = profile.swim_css_seconds_per_100m % 60
      parts.push(`Zwem CSS: ${cMin}:${String(cSec).padStart(2, '0')}/100m`)
    }
    if (profile.ftp_watts) parts.push(`FTP: ${profile.ftp_watts}W`)
    if (profile.weight_kg) parts.push(`Gewicht: ${profile.weight_kg}kg`)
    if (profile.max_weekly_hours) parts.push(`Max uren/week: ${profile.max_weekly_hours}`)
    if (parts.length) sections.push(parts.join(' | '))
  }

  // Active plan
  const { data: plan } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (plan) {
    sections.push(`\n## Trainingsplan: ${plan.name || 'Actief plan'}`)
  }

  // Today's workouts
  const today = new Date().toISOString().split('T')[0]
  const { data: todayWorkouts } = await supabase
    .from('planned_workouts')
    .select('sport, title, duration_minutes, intensity, is_key_workout, description, status')
    .eq('user_id', userId)
    .eq('date', today)
    .order('sort_order')

  if (todayWorkouts && todayWorkouts.length > 0) {
    sections.push('\n## Training vandaag')
    for (const w of todayWorkouts) {
      const key = w.is_key_workout ? ' ⭐ KEY' : ''
      const status = w.status === 'modified' ? ' [AANGEPAST]' : w.status === 'skipped' ? ' [OVERGESLAGEN]' : ''
      sections.push(
        `- ${(w.sport || '?').toUpperCase()}: ${w.title || 'Training'} (${w.duration_minutes || '?'}min, ${w.intensity || '?'})${key}${status}`,
      )
    }
  }

  // Tomorrow's workouts (helpful for planning)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: tomorrowWorkouts } = await supabase
    .from('planned_workouts')
    .select('sport, title, duration_minutes, intensity, is_key_workout')
    .eq('user_id', userId)
    .eq('date', tomorrow)
    .order('sort_order')

  if (tomorrowWorkouts && tomorrowWorkouts.length > 0) {
    sections.push('\n## Training morgen')
    for (const w of tomorrowWorkouts) {
      const key = w.is_key_workout ? ' ⭐ KEY' : ''
      sections.push(
        `- ${(w.sport || '?').toUpperCase()}: ${w.title || 'Training'} (${w.duration_minutes || '?'}min, ${w.intensity || '?'})${key}`,
      )
    }
  }

  // Rest of the week
  const endOfWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: weekWorkouts } = await supabase
    .from('planned_workouts')
    .select('date, sport, title, duration_minutes, intensity, is_key_workout, status')
    .eq('user_id', userId)
    .gt('date', tomorrow)
    .lte('date', endOfWeek)
    .order('date')

  if (weekWorkouts && weekWorkouts.length > 0) {
    sections.push('\n## Rest van de week')
    for (const w of weekWorkouts) {
      const key = w.is_key_workout ? ' ⭐' : ''
      const status = w.status === 'modified' ? ' [AANGEPAST]' : w.status === 'skipped' ? ' [OVERGESLAGEN]' : ''
      sections.push(
        `- ${w.date} ${(w.sport || '?').toUpperCase()}: ${w.title || '?'} (${w.duration_minutes || '?'}min)${key}${status}`,
      )
    }
  }

  // Recent completed workouts (7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: recentWorkouts } = await supabase
    .from('completed_workouts')
    .select('date, sport, title, actual_duration_seconds, rpe')
    .eq('user_id', userId)
    .gte('date', weekAgo)
    .order('date', { ascending: false })
    .limit(5)

  if (recentWorkouts && recentWorkouts.length > 0) {
    sections.push(`\n## Laatste 7 dagen (${recentWorkouts.length} trainingen)`)
    for (const w of recentWorkouts) {
      const rpe = w.rpe ? ` RPE:${w.rpe}` : ''
      sections.push(`- ${w.date} ${(w.sport || '?').toUpperCase()}: ${w.title || '?'}${rpe}`)
    }
  }

  // Health metrics
  const { data: health } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (health) {
    const parts = []
    if (health.hrv_rmssd) parts.push(`HRV: ${health.hrv_rmssd} (${health.hrv_status || '?'})`)
    if (health.sleep_score) parts.push(`Slaap: ${health.sleep_score}/100`)
    if (health.body_battery_morning) parts.push(`Body Battery: ${health.body_battery_morning}/100`)
    if (health.resting_hr) parts.push(`Rust HR: ${health.resting_hr}bpm`)
    if (parts.length) sections.push(`\n## Readiness vandaag\n${parts.join(' | ')}`)
  }

  // Race goals
  const { data: races } = await supabase
    .from('races')
    .select('name, date, race_type, priority, target_time_seconds, notes')
    .eq('user_id', userId)
    .gte('date', today)
    .order('date')
    .limit(3)

  if (races && races.length > 0) {
    sections.push('\n## Aankomende wedstrijden')
    for (const r of races) {
      const days = Math.ceil((new Date(r.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const prio = r.priority ? ` [${r.priority}-race]` : ''
      let target = ''
      if (r.target_time_seconds) {
        const h = Math.floor(r.target_time_seconds / 3600)
        const m = Math.floor((r.target_time_seconds % 3600) / 60)
        const s = r.target_time_seconds % 60
        target = ` Doel: ${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      }
      sections.push(`- ${r.name} (${r.race_type}): ${r.date} (nog ${days} dagen)${prio}${target}`)
    }
  }

  // Recent adaptations
  const { data: adaptations } = await supabase
    .from('adaptation_log')
    .select('date, action_type, trigger_type, trigger_details, action_details')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(5)

  if (adaptations && adaptations.length > 0) {
    sections.push('\n## Recente planaanpassingen')
    for (const a of adaptations) {
      sections.push(`- ${a.date}: ${a.action_type} (${a.trigger_type})`)
    }
  }

  return sections.join('\n') || 'Geen atleet data beschikbaar.'
}

// =============================================================================
// Anthropic API call WITH tool use
// =============================================================================

async function callAnthropicWithTools(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  userId: string,
): Promise<{ text: string; tokens: number; adaptations: AdaptationResult[] }> {
  const adaptations: AdaptationResult[] = []

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: coachModel,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      tools: COACH_TOOLS,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error(`Anthropic API error: ${response.status} ${errText}`)
    throw new Error(`AI coach niet beschikbaar (${response.status})`)
  }

  const data = await response.json()
  let tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)

  // Check if the LLM wants to use tools
  if (data.stop_reason === 'tool_use') {
    // Extract text parts and tool calls
    const textParts: string[] = []
    const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = []

    for (const block of data.content) {
      if (block.type === 'text') {
        textParts.push(block.text)
      } else if (block.type === 'tool_use' && block.name === 'modify_training') {
        // Execute the training modification
        const result = await executeModifyTraining(block.input as ModifyTrainingInput, userId)
        adaptations.push(result)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify({
            success: result.success,
            action: result.action,
            workout: result.workoutTitle,
            changes: result.changes,
            message: result.success
              ? `Training "${result.workoutTitle}" is succesvol aangepast (${result.action}).`
              : `Kon geen training vinden op ${result.targetDate} om aan te passen.`,
          }),
        })
      }
    }

    // Send tool results back to get final response
    const followUpMessages = [
      ...messages,
      { role: 'assistant', content: data.content },
      { role: 'user', content: toolResults },
    ]

    const followUpResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: coachModel,
        max_tokens: 1024,
        system: systemPrompt,
        messages: followUpMessages,
      }),
    })

    if (followUpResponse.ok) {
      const followUpData = await followUpResponse.json()
      tokens += (followUpData.usage?.input_tokens || 0) + (followUpData.usage?.output_tokens || 0)

      const finalText = followUpData.content
        ?.filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('') || ''

      // Combine initial text with final text
      const allText = [...textParts, finalText].filter(Boolean).join('\n\n')
      return { text: allText, tokens, adaptations }
    }

    // Fallback to initial text if follow-up fails
    return { text: textParts.join('\n') || 'Training is aangepast!', tokens, adaptations }
  }

  // No tool use — normal response
  const text = data.content
    ?.filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('') || 'Sorry, ik kon geen antwoord genereren.'

  return { text, tokens, adaptations }
}

// =============================================================================
// Mock response (when no API key)
// =============================================================================

function generateMockResponse(message: string, _userId: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('moe') || lower.includes('vermoeid'))
    return 'Hey Pepe! Ik zie dat je je moe voelt, maar je readiness ziet er eigenlijk prima uit:\n\n**Jouw cijfers vandaag:**\n- HRV: 51 (normaal niveau)\n- Body Battery: 76/100 (goed)\n- Slaap: 83/100 (sterk)\n- Rust HR: 44bpm (laag, dat is goed)\n\n**Mijn advies:** Start gewoon met je long run van 150min. Je lichaam zegt dat het klaar is, ook al voel je je mentaal moe. Dat kan na een paar kilometer al omslaan.\n\n**Plan B:** Begin rustig in je easy pace (5:20/km) en luister naar je lijf de eerste 30 minuten. Als het echt niet gaat, verkort dan naar 120min - met de marathon over 28 dagen kunnen we geen risico\'s nemen.'
  if (lower.includes('plan') || lower.includes('uitleg'))
    return 'Je zit momenteel in de build-fase van je plan. De focus ligt op het opbouwen van race-specifieke fitness. Deze week heb je 3 key sessions: een drempeltraining, een lange duurloop en een brick.'
  if (lower.includes('voeding') || lower.includes('eten'))
    return 'Voor je training vandaag: eet 3 uur van tevoren een maaltijd met 60-80g koolhydraten. Denk aan havermout met banaan. Tijdens trainingen langer dan 60 min: 30-60g carbs per uur.'
  if (lower.includes('aanpas') || lower.includes('lichter') || lower.includes('makkelijker'))
    return '✅ **Training aangepast!**\n\nIk heb je training van vandaag aangepast op basis van je verzoek:\n\n🔄 **Long Run 150min → 105min** (volume -30%)\n\nDe training is nu korter maar behoudt dezelfde intensiteit. Met de marathon over 28 dagen wil ik je niet overbelasten, maar we moeten wel in het ritme blijven.\n\nMorgen evalueren we hoe je je voelt en passen we zonodig de rest van de week aan.'
  return 'Hé! Ik ben je TriPepe Coach. Ik ken je trainingsplan, data en doelen. Stel me een vraag over je training, voeding, herstel of raceplan!'
}

function generateMockAdaptation(): AdaptationResult {
  const today = new Date().toISOString().split('T')[0]
  return {
    action: 'reduce_volume',
    targetDate: today,
    sport: 'run',
    reason: 'Atleet voelt zich moe / verzoek tot aanpassing',
    changes: {
      original_duration: 150,
      new_duration: 105,
    },
    success: true,
    workoutTitle: 'Long Run',
  }
}
