'use client'

import { useState } from 'react'
import { Rocket, ChevronDown, ChevronUp, Check, AlertTriangle, Zap, Moon, Droplets, Apple } from 'lucide-react'
import type { Race } from '@/lib/trainingData'

interface RaceWeekAutopilotProps {
  races: Race[]
}

interface DayPlan {
  day: string
  date: string
  training: string
  nutrition: string
  sleep: string
  mental: string
  icon: string
  isRaceDay: boolean
}

function getDaysUntilRace(raceDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const race = new Date(raceDate)
  race.setHours(0, 0, 0, 0)
  return Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function generateRaceWeekPlan(race: Race): DayPlan[] {
  const raceDate = new Date(race.date)
  const plans: DayPlan[] = []
  const isMarathon = race.type === 'marathon'
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']

  for (let i = 6; i >= 0; i--) {
    const date = new Date(raceDate)
    date.setDate(date.getDate() - i)
    const dayName = dayNames[date.getDay()]
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`
    const isRaceDay = i === 0

    let plan: Omit<DayPlan, 'day' | 'date' | 'isRaceDay'>

    if (isRaceDay) {
      plan = isMarathon ? {
        training: 'RACE DAY! Warming-up: 10 min joggen + 4x strides',
        nutrition: 'Ontbijt 3u voor start: havermout + banaan + honing. Gel 15 min voor start.',
        sleep: 'Vroeg op — neem de tijd voor je routine',
        mental: 'Vertrouw je training. Begin conservatief, eindig sterk.',
        icon: '🏁',
      } : {
        training: 'RACE DAY! T1/T2 check. Warming-up: 5 min joggen + dynamisch stretchen',
        nutrition: 'Ontbijt 3u voor start: rijst + ei + brood. Drink 500ml in de ochtend.',
        sleep: 'Vroeg op — check alle gear, T1 en T2 bags',
        mental: 'Geniet ervan. Swim: relax. Bike: pacing. Run: character.',
        icon: '🏁',
      }
    } else if (i === 1) {
      plan = {
        training: 'Compleet rust. Optioneel: 15 min wandelen',
        nutrition: 'Carb loading dag 2: pasta + brood + rijst. Vermijd vezels en zuivel. Drink 2-3L water.',
        sleep: 'Vroeg naar bed. Het is OK als je niet goed slaapt — de nacht ervoor telt meer.',
        mental: 'Leg alles klaar: racekleding, startnummer, gels, schoenen. Visualiseer je race.',
        icon: '😴',
      }
    } else if (i === 2) {
      plan = {
        training: isMarathon
          ? '20 min easy jog + 4x 100m strides op racepace'
          : '15 min easy jog + 10 min easy spin. Alles super makkelijk.',
        nutrition: 'Carb loading start: +50% koolhydraten. Witte rijst, pasta, brood. Drink extra.',
        sleep: 'Slaap 8-9 uur. Dit is de belangrijkste nacht!',
        mental: 'Geen stress. Je bent klaar. Vertrouw het proces.',
        icon: '🍝',
      }
    } else if (i === 3) {
      plan = {
        training: isMarathon
          ? '25 min easy run + 2x 200m op marathonpace'
          : '20 min easy spin of 15 min easy jog',
        nutrition: 'Normale maaltijden, iets meer koolhydraten. Vermijd alcohol en experiment eten.',
        sleep: 'Probeer 8 uur slaap. Vermijd schermen voor bedtijd.',
        mental: 'Bekijk het parcours. Plan je race strategie.',
        icon: '🗺️',
      }
    } else if (i === 4) {
      plan = {
        training: isMarathon
          ? '30 min easy run. Last echte workout — hou het licht.'
          : '30 min easy bike of 20 min easy swim. Alles Z1-Z2.',
        nutrition: 'Eet normaal en gezond. Focus op slaap en hydratatie.',
        sleep: 'Begin je slaapritme aan te passen: eerder naar bed.',
        mental: 'Check je gear lijst. Bestell wat je nog mist.',
        icon: '✅',
      }
    } else if (i === 5) {
      plan = {
        training: isMarathon
          ? '35 min easy run met 3x 30s strides'
          : '30 min easy spin + 15 min easy swim. Houd het chill.',
        nutrition: 'Normale voeding. Vermijd nieuw eten. Drink voldoende water.',
        sleep: 'Normale routine. Geen late avonden meer.',
        mental: 'Verlaag stress. Geen zware taken op werk plannen.',
        icon: '🏃',
      }
    } else {
      plan = {
        training: isMarathon
          ? '40 min easy run. Laatste "normale" training.'
          : '40 min moderate bike of 30 min easy run. Begin af te bouwen.',
        nutrition: 'Eet goed en gevarieerd. Begin cafeïne te verminderen als je dat wilt.',
        sleep: 'Zorg voor een goede nachtrust. Vermijd alcohol.',
        mental: 'Maak een race plan: splits, voeding, mentale ankerpunten.',
        icon: '📋',
      }
    }

    plans.push({
      day: dayName,
      date: dateStr,
      isRaceDay,
      ...plan,
    })
  }

  return plans
}

export default function RaceWeekAutopilot({ races }: RaceWeekAutopilotProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  // Find races within 14 days
  const upcomingRaces = races
    .filter(r => {
      const days = getDaysUntilRace(r.date)
      return days >= 0 && days <= 14
    })
    .sort((a, b) => getDaysUntilRace(a.date) - getDaysUntilRace(b.date))

  if (upcomingRaces.length === 0) return null

  const activeRace = selectedRace || upcomingRaces[0]
  const daysToRace = getDaysUntilRace(activeRace.date)
  const plan = generateRaceWeekPlan(activeRace)

  // Highlight today in the plan
  const today = new Date()
  const todayStr = `${today.getDate()}/${today.getMonth() + 1}`

  return (
    <div className="card-base border border-orange-700/30 bg-gradient-to-br from-orange-900/10 to-red-900/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-orange-400" />
          <span className="text-sm font-medium text-orange-300">Race Week Autopilot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-400 font-bold">
            {daysToRace === 0 ? 'RACE DAY!' : `${daysToRace}d to go`}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Race selector if multiple */}
          {upcomingRaces.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {upcomingRaces.map(race => (
                <button
                  key={race.name}
                  onClick={() => setSelectedRace(race)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    race.name === activeRace.name
                      ? 'bg-orange-500/20 border border-orange-500 text-orange-300'
                      : 'bg-[#1a1a2e] border border-gray-700/30 text-gray-400'
                  }`}
                >
                  {race.name} — {getDaysUntilRace(race.date)}d
                </button>
              ))}
            </div>
          )}

          {/* Race info */}
          <div className="p-3 bg-[#1a1a2e] rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{activeRace.name}</p>
              <p className="text-xs text-gray-400">Target: {activeRace.target}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-400">{daysToRace}</p>
              <p className="text-xs text-gray-500">dagen</p>
            </div>
          </div>

          {/* Day-by-day plan */}
          <div className="space-y-1.5">
            {plan.map((dayPlan, idx) => {
              const isToday = dayPlan.date === todayStr
              const isPast = idx < plan.findIndex(p => p.date === todayStr)
              const isDayExpanded = expandedDay === idx

              return (
                <button
                  key={idx}
                  onClick={() => setExpandedDay(isDayExpanded ? null : idx)}
                  className={`w-full text-left rounded-lg transition-all ${
                    dayPlan.isRaceDay
                      ? 'bg-gradient-to-r from-orange-900/30 to-yellow-900/20 border border-orange-500/50 p-3'
                      : isToday
                        ? 'bg-[#1a1a2e] border border-orange-500/30 ring-1 ring-orange-500/20 p-3'
                        : isPast
                          ? 'bg-[#1a1a2e]/50 p-2.5 opacity-60'
                          : 'bg-[#1a1a2e] p-2.5 hover:bg-[#202038]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{dayPlan.icon}</span>
                      <div>
                        <span className={`text-xs font-medium ${
                          isToday ? 'text-orange-300' : dayPlan.isRaceDay ? 'text-yellow-300' : 'text-gray-300'
                        }`}>
                          {dayPlan.day} {dayPlan.date}
                        </span>
                        {isToday && <span className="ml-2 text-xs text-orange-400 font-bold">VANDAAG</span>}
                      </div>
                    </div>
                    {isPast && <Check size={14} className="text-green-500" />}
                  </div>

                  {/* Training summary always visible */}
                  <p className={`text-xs mt-1 ${
                    dayPlan.isRaceDay ? 'text-yellow-200' : 'text-gray-400'
                  }`}>
                    {dayPlan.training}
                  </p>

                  {/* Expanded details */}
                  {isDayExpanded && (
                    <div className="mt-3 space-y-2 border-t border-gray-700/30 pt-2">
                      <div className="flex items-start gap-2">
                        <Apple size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-green-400 font-medium">Voeding</p>
                          <p className="text-xs text-gray-400">{dayPlan.nutrition}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Moon size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-purple-400 font-medium">Slaap</p>
                          <p className="text-xs text-gray-400">{dayPlan.sleep}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-yellow-400 font-medium">Mentaal</p>
                          <p className="text-xs text-gray-400">{dayPlan.mental}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Key reminders */}
          {daysToRace <= 3 && (
            <div className="p-3 bg-[#1a1a2e] rounded-lg border-l-2 border-orange-500">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-orange-400 font-medium">Laatste dagen checklist</p>
                  <ul className="mt-1 space-y-0.5">
                    <li className="text-xs text-gray-400">• Startnummer en chip ophalen</li>
                    <li className="text-xs text-gray-400">• Race outfit klaarleggen</li>
                    <li className="text-xs text-gray-400">• Gels en voeding in race belt</li>
                    <li className="text-xs text-gray-400">• Garmin opladen + race activity instellen</li>
                    <li className="text-xs text-gray-400">• Geen nieuw eten of nieuwe schoenen!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
