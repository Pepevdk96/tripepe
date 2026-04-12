/**
 * GET /api/coach/quick-actions
 * Returns available quick action buttons for the chat UI.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    actions: [
      {
        id: 'adjust_training',
        label: 'Training aanpassen',
        icon: '🔄',
        promptPreview: 'Ik wil mijn training van vandaag aanpassen. Wat raad je aan?',
      },
      {
        id: 'explain_plan',
        label: 'Plan uitleggen',
        icon: '📋',
        promptPreview: 'Leg mijn huidige trainingsplan uit. In welke fase zit ik?',
      },
      {
        id: 'recovery_tips',
        label: 'Hersteltips',
        icon: '💤',
        promptPreview: 'Geef me hersteltips na mijn recente trainingen.',
      },
      {
        id: 'race_prep',
        label: 'Racevoorbereid',
        icon: '🏁',
        promptPreview: 'Hoe ziet mijn aanloop naar mijn volgende wedstrijd eruit?',
      },
      {
        id: 'nutrition_advice',
        label: 'Voedingsadvies',
        icon: '🍌',
        promptPreview: 'Geef me voedingsadvies voor vandaag op basis van mijn training.',
      },
      {
        id: 'feeling_tired',
        label: 'Ik ben moe',
        icon: '😴',
        promptPreview: 'Ik voel me moe. Moet ik mijn training aanpassen?',
      },
    ],
  })
}
