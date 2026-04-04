'use client'

import { Waves, Bike, Footprints, Zzz } from 'lucide-react'
import { SportType, SPORT_COLORS } from '@/lib/types/workout'

interface SportBadgeProps {
  sport: SportType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SPORT_LABELS: Record<SportType, string> = {
  swim: 'Zwemmen',
  bike: 'Fietsen',
  run: 'Hardlopen',
  rest: 'Rust',
}

const SPORT_ICONS = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
  rest: Zzz,
}

export function SportBadge({ sport, size = 'md', showLabel = false }: SportBadgeProps) {
  const colors = SPORT_COLORS[sport]
  const Icon = SPORT_ICONS[sport]

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  const paddingMap = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const gapMap = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-2',
  }

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={`flex items-center ${gapMap[size]} ${paddingMap[size]} rounded-lg ${colors.bg}`}>
      <Icon size={iconSizeMap[size]} className={colors.tailwind} />
      {showLabel && <span className={`${textSizeMap[size]} font-medium ${colors.tailwind}`}>
        {SPORT_LABELS[sport]}
      </span>}
    </div>
  )
}
