'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Flag, Plus } from 'lucide-react'

interface RaceData {
  name: string
  date: string
  type: 'marathon' | 'run' | 'triathlon'
  distance: string
  location: string
  url: string
  fast: boolean
  scenic: boolean
  pbPotential: boolean
}

const races: RaceData[] = [
  {
    name: 'Marathon Kopenhagen',
    date: '2026-05-10',
    type: 'marathon',
    distance: '42.2km',
    location: 'Kopenhagen, DK',
    url: 'https://copenhagenmarathon.dk',
    fast: true,
    scenic: true,
    pbPotential: true,
  },
  {
    name: 'Challenge Almere-Amsterdam',
    date: '2026-09-12',
    type: 'triathlon',
    distance: 'Full (226km)',
    location: 'Almere, NL',
    url: '#',
    fast: false,
    scenic: true,
    pbPotential: false,
  },
  {
    name: 'Ironman 70.3 Westfriesland',
    date: '2026-06-07',
    type: 'triathlon',
    distance: '70.3 (113km)',
    location: 'Hoorn, NL',
    url: '#',
    fast: true,
    scenic: true,
    pbPotential: true,
  },
  {
    name: 'Dam tot Damloop',
    date: '2026-09-20',
    type: 'run',
    distance: '16.1km',
    location: 'Amsterdam, NL',
    url: '#',
    fast: true,
    scenic: true,
    pbPotential: true,
  },
  {
    name: 'Halve Marathon Egmond',
    date: '2027-01-10',
    type: 'run',
    distance: '21.1km',
    location: 'Egmond, NL',
    url: '#',
    fast: false,
    scenic: true,
    pbPotential: false,
  },
  {
    name: 'Ironman Hamburg',
    date: '2026-06-28',
    type: 'triathlon',
    distance: 'Full (226km)',
    location: 'Hamburg, DE',
    url: '#',
    fast: true,
    scenic: false,
    pbPotential: true,
  },
  {
    name: 'Singelloop Utrecht',
    date: '2026-10-04',
    type: 'run',
    distance: '10km',
    location: 'Utrecht, NL',
    url: '#',
    fast: true,
    scenic: true,
    pbPotential: true,
  },
  {
    name: 'Ironman 70.3 Barcelona',
    date: '2026-10-18',
    type: 'triathlon',
    distance: '70.3 (113km)',
    location: 'Barcelona, ES',
    url: '#',
    fast: true,
    scenic: true,
    pbPotential: true,
  },
]

export default function RaceFinder() {
  const [activeType, setActiveType] = useState<string>('all')
  const [activeTags, setActiveTags] = useState<{ fast: boolean; scenic: boolean; pbPotential: boolean }>({
    fast: false,
    scenic: false,
    pbPotential: false,
  })

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'marathon':
        return 'bg-[#FF4444]/20 border-[#FF4444]/50 text-[#FF4444]'
      case 'run':
        return 'bg-[#FF4444]/20 border-[#FF4444]/50 text-[#FF4444]'
      case 'triathlon':
        return 'bg-[#FFD700]/20 border-[#FFD700]/50 text-[#FFD700]'
      default:
        return 'bg-gray-600/20 border-gray-600/50 text-gray-300'
    }
  }

  const getTypeName = (type: string): string => {
    switch (type) {
      case 'marathon':
        return 'Marathon'
      case 'run':
        return 'Run'
      case 'triathlon':
        return 'Triathlon'
      default:
        return type
    }
  }

  const filterRaces = (): RaceData[] => {
    return races.filter((race) => {
      // Filter by type
      if (activeType !== 'all' && race.type !== activeType) {
        return false
      }

      // Filter by tags
      if (activeTags.fast && !race.fast) {
        return false
      }
      if (activeTags.scenic && !race.scenic) {
        return false
      }
      if (activeTags.pbPotential && !race.pbPotential) {
        return false
      }

      return true
    })
  }

  const toggleTag = (tag: 'fast' | 'scenic' | 'pbPotential') => {
    setActiveTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }))
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${dayName} ${day} ${month} ${year}`
  }

  const filteredRaces = filterRaces()

  return (
    <div className="pb-32 px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Search size={24} className="text-white" />
        <h2 className="text-2xl font-bold text-white">Vind wedstrijden</h2>
      </div>

      {/* Type filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveType('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            activeType === 'all'
              ? 'bg-white text-[#0a0a0f]'
              : 'bg-[#12121f] text-gray-300 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setActiveType('marathon')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            activeType === 'marathon'
              ? 'bg-[#FF4444] text-white'
              : 'bg-[#12121f] text-gray-300 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          Marathon
        </button>
        <button
          onClick={() => setActiveType('triathlon')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            activeType === 'triathlon'
              ? 'bg-[#FFD700] text-[#0a0a0f]'
              : 'bg-[#12121f] text-gray-300 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          Triathlon
        </button>
        <button
          onClick={() => setActiveType('run')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
            activeType === 'run'
              ? 'bg-[#FF4444] text-white'
              : 'bg-[#12121f] text-gray-300 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          Run
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => toggleTag('fast')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            activeTags.fast
              ? 'bg-green-500 text-white'
              : 'bg-[#12121f] text-gray-400 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          ⚡ Fast course
        </button>
        <button
          onClick={() => toggleTag('scenic')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            activeTags.scenic
              ? 'bg-green-500 text-white'
              : 'bg-[#12121f] text-gray-400 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          🏞️ Scenic
        </button>
        <button
          onClick={() => toggleTag('pbPotential')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            activeTags.pbPotential
              ? 'bg-green-500 text-white'
              : 'bg-[#12121f] text-gray-400 border border-gray-600/30 hover:border-gray-400/50'
          }`}
        >
          🎯 PB potential
        </button>
      </div>

      {/* Race cards */}
      <div className="space-y-3">
        {filteredRaces.length > 0 ? (
          filteredRaces.map((race) => (
            <div
              key={race.name}
              className="card-base border border-gray-700/30 hover:border-gray-600/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{race.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Calendar size={14} />
                    {formatDate(race.date)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <MapPin size={14} />
                    {race.location}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(race.type)}`}>
                  {getTypeName(race.type)}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-300 mb-2">Afstand: {race.distance}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {race.fast && (
                  <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
                    ⚡ Fast
                  </span>
                )}
                {race.scenic && (
                  <span className="inline-block px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                    🏞️ Scenic
                  </span>
                )}
                {race.pbPotential && (
                  <span className="inline-block px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
                    🎯 PB potential
                  </span>
                )}
              </div>

              {/* Add button */}
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#FF4444]/20 text-[#FF4444] rounded-lg border border-[#FF4444]/30 text-sm font-medium hover:bg-[#FF4444]/30 transition-colors">
                <Plus size={16} />
                Voeg toe als doel
              </button>
            </div>
          ))
        ) : (
          <div className="card-base border border-gray-700/30 text-center py-8">
            <p className="text-gray-400">Geen wedstrijden gevonden met deze filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
