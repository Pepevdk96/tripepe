'use client'

import { Calendar, CalendarCheck, BarChart3, Trophy, ClipboardList } from 'lucide-react'

interface TabNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs = [
    { id: 'today', label: 'Vandaag', icon: CalendarCheck },
    { id: 'week', label: 'Week', icon: Calendar },
    { id: 'plan', label: 'Plan', icon: BarChart3 },
    { id: 'races', label: 'Races', icon: Trophy },
    { id: 'log', label: 'Log', icon: ClipboardList },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0f] border-t border-[#222233] px-0">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-colors ${
                isActive
                  ? 'text-[#FF4444]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-gradient-to-r from-[#FF4444] to-[#FFD700] rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
