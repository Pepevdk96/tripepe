'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, Wind, Thermometer, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface WeatherRouteProps {
  workout: Workout
}

interface WeatherData {
  temp: number
  feelsLike: number
  windSpeed: number
  windDirection: string
  humidity: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy'
  description: string
  uvIndex: number
}

interface WeatherAdvice {
  routeAdvice: string
  gearAdvice: string[]
  hydrationAdvice: string
  warningLevel: 'green' | 'yellow' | 'red'
  warningMessage?: string
}

// Simulated weather for Rotterdam area based on season
function getSimulatedWeather(): WeatherData {
  const now = new Date()
  const month = now.getMonth()
  const hour = now.getHours()

  // Spring (April) Rotterdam typical weather
  const baseTemp = month <= 2 ? 5 : month <= 4 ? 12 : month <= 7 ? 20 : month <= 9 ? 15 : 8
  const variation = Math.sin(hour * Math.PI / 12) * 4
  const temp = Math.round(baseTemp + variation)

  const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'windy']
  // Weighted random based on season
  const weights = month >= 3 && month <= 5
    ? [0.3, 0.35, 0.2, 0.15]  // Spring
    : month >= 6 && month <= 8
      ? [0.45, 0.25, 0.15, 0.15]  // Summer
      : [0.15, 0.3, 0.35, 0.2]    // Fall/Winter

  let rand = Math.random()
  let condIdx = 0
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]
    if (rand <= 0) { condIdx = i; break; }
  }
  const condition = conditions[condIdx]

  const windSpeeds: Record<string, number> = { sunny: 12, cloudy: 18, rainy: 22, windy: 30, stormy: 45 }
  const windDirs = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW']

  const descriptions: Record<string, string> = {
    sunny: 'Zonnig met lichte bewolking',
    cloudy: 'Bewolkt, droog',
    rainy: 'Lichte regen verwacht',
    windy: 'Stevige wind uit het westen',
    stormy: 'Stormachtig weer',
  }

  return {
    temp,
    feelsLike: Math.round(temp - (windSpeeds[condition] > 20 ? 3 : 1)),
    windSpeed: windSpeeds[condition] + Math.round(Math.random() * 8 - 4),
    windDirection: windDirs[Math.floor(Math.random() * windDirs.length)],
    humidity: condition === 'rainy' ? 85 : condition === 'sunny' ? 55 : 70,
    condition,
    description: descriptions[condition],
    uvIndex: condition === 'sunny' ? (month >= 5 && month <= 7 ? 7 : 4) : 2,
  }
}

function getWeatherAdvice(weather: WeatherData, workout: Workout): WeatherAdvice {
  const isRun = workout.type === 'run'
  const isBike = workout.type === 'bike'
  const isHard = workout.intensity === 'hard'

  let routeAdvice = ''
  const gearAdvice: string[] = []
  let hydrationAdvice = ''
  let warningLevel: WeatherAdvice['warningLevel'] = 'green'
  let warningMessage: string | undefined

  // Temperature advice
  if (weather.temp > 25) {
    routeAdvice = isRun
      ? 'Kies een schaduwrijke route door het park of langs de Kralingse Plas'
      : 'Fiets richting kust voor verkoeling — Hoek van Holland route'
    gearAdvice.push('Lichte kleding, pet of zonneklep')
    hydrationAdvice = 'Neem extra water mee — drink elke 15 min'
    if (weather.temp > 30) {
      warningLevel = 'red'
      warningMessage = 'Extreem warm — overweeg training naar ochtend/avond te verplaatsen'
    } else {
      warningLevel = 'yellow'
    }
  } else if (weather.temp < 5) {
    routeAdvice = isRun
      ? 'Kies een beschutte route — Zuiderpark of langs de Maas'
      : 'Overweeg een indoor trainer sessie bij deze temperatuur'
    gearAdvice.push('Thermische laag, handschoenen, buff')
    hydrationAdvice = 'Je zweet minder maar drink nog steeds regelmatig'
    warningLevel = weather.temp < 0 ? 'red' : 'yellow'
    if (weather.temp < 0) warningMessage = 'Bevriezing risico — indoor alternatief aanbevolen'
  } else {
    routeAdvice = isRun
      ? 'Perfect weer — alle routes geschikt, probeer de Maas-route'
      : 'Ideaal fiets weer — richting Kinderdijk of Delft'
    hydrationAdvice = 'Normaal hydratie schema — 500ml per uur'
  }

  // Wind advice
  if (weather.windSpeed > 25) {
    if (isBike) {
      routeAdvice = 'Vermijd open polders — kies beschutte stadsroute of fiets met de wind mee'
      gearAdvice.push('Windjack, aerodynamische positie')
      warningLevel = weather.windSpeed > 35 ? 'red' : 'yellow'
      if (weather.windSpeed > 35) warningMessage = 'Gevaarlijke windstoten — indoor trainer aanbevolen'
    } else {
      gearAdvice.push('Winddicht jack')
    }
  }

  // Rain advice
  if (weather.condition === 'rainy') {
    gearAdvice.push('Regenjack, reflecterende kleding')
    if (isBike) {
      gearAdvice.push('Spatborden, goede verlichting')
      routeAdvice = 'Kies geasfalteerde routes — vermijd onverharde paden bij regen'
    }
    if (isHard) {
      warningLevel = 'yellow'
      warningMessage = 'Natte omstandigheden — pas intervallen aan, let op gladheid'
    }
  }

  // UV advice
  if (weather.uvIndex >= 6) {
    gearAdvice.push('Zonnebrand SPF50+')
  }

  // Default gear if nothing added
  if (gearAdvice.length === 0) {
    gearAdvice.push(weather.temp > 15 ? 'Licht shirt en korte broek' : 'Lang shirt en legging')
  }

  return { routeAdvice, gearAdvice, hydrationAdvice, warningLevel, warningMessage }
}

export default function WeatherRoute({ workout }: WeatherRouteProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    // Simulate weather fetch
    setWeather(getSimulatedWeather())
  }, [])

  if (!weather || workout.type === 'rest' || workout.type === 'swim') return null

  const advice = getWeatherAdvice(weather, workout)

  const WeatherIcon = weather.condition === 'sunny' ? Sun
    : weather.condition === 'rainy' ? CloudRain
    : weather.condition === 'windy' ? Wind
    : Cloud

  const warningColors = {
    green: 'border-green-700/30 from-green-900/10 to-emerald-900/10',
    yellow: 'border-yellow-700/30 from-yellow-900/10 to-amber-900/10',
    red: 'border-red-700/30 from-red-900/10 to-rose-900/10',
  }

  const warningTextColors = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  }

  return (
    <div className={`card-base border bg-gradient-to-br ${warningColors[advice.warningLevel]}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <WeatherIcon size={18} className={warningTextColors[advice.warningLevel]} />
          <span className="text-sm font-medium text-gray-200">Weer & Route Advies</span>
          <span className={`text-xs ${warningTextColors[advice.warningLevel]}`}>
            {weather.temp}°C
          </span>
        </div>
        <div className="flex items-center gap-2">
          {advice.warningLevel !== 'green' && (
            <AlertTriangle size={14} className={warningTextColors[advice.warningLevel]} />
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Weather overview */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
              <Thermometer size={14} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-300 font-bold">{weather.temp}°C</p>
              <p className="text-xs text-gray-500">Voelt {weather.feelsLike}°</p>
            </div>
            <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
              <Wind size={14} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-300 font-bold">{weather.windSpeed} km/u</p>
              <p className="text-xs text-gray-500">{weather.windDirection}</p>
            </div>
            <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
              <Cloud size={14} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-300 font-bold">{weather.humidity}%</p>
              <p className="text-xs text-gray-500">Vochtigheid</p>
            </div>
            <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
              <Sun size={14} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-300 font-bold">UV {weather.uvIndex}</p>
              <p className="text-xs text-gray-500">{weather.uvIndex >= 6 ? 'Hoog' : 'Matig'}</p>
            </div>
          </div>

          {/* Warning */}
          {advice.warningMessage && (
            <div className={`flex items-start gap-2 p-2 rounded-lg bg-[#1a1a2e] border-l-2 ${
              advice.warningLevel === 'red' ? 'border-red-500' : 'border-yellow-500'
            }`}>
              <AlertTriangle size={14} className={`flex-shrink-0 mt-0.5 ${warningTextColors[advice.warningLevel]}`} />
              <p className={`text-xs ${warningTextColors[advice.warningLevel]}`}>
                {advice.warningMessage}
              </p>
            </div>
          )}

          {/* Route advice */}
          <div className="p-3 bg-[#1a1a2e] rounded-lg">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Route Advies</p>
            <p className="text-sm text-gray-300">{advice.routeAdvice}</p>
          </div>

          {/* Gear advice */}
          <div className="p-3 bg-[#1a1a2e] rounded-lg">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Kleding & Gear</p>
            <ul className="space-y-1">
              {advice.gearAdvice.map((item, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Hydration */}
          <div className="p-3 bg-[#1a1a2e] rounded-lg">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Hydratatie</p>
            <p className="text-xs text-gray-300">{advice.hydrationAdvice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
