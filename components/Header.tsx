'use client'

import { Settings, Wifi, WifiOff } from 'lucide-react'
import type { AthleteProfile, Week } from '@/lib/trainingData'

interface HeaderProps {
  profile?: AthleteProfile | null
}

export default function Header({ profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f] border-b border-[#222233] px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {/* TriPepe logo met gradient */}
          <h1 className="text-3xl font-bold gradient-text">TriPepe</h1>

          {/* Athlete info */}
          {profile && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">
                VO2max {profile.vo2max}
              </span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                <Wifi size={10} />
                Live
              </span>
            </div>
          )}
        </div>

        {/* Settings icon */}
        <button className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors">
          <Settings size={24} className="text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  )
}
