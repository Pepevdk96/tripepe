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
  brick: 'Brick',
}

const SPORT_ICONS: Record<SportType, React.ComponentType<{ size: number; className: string }>> = {
  swim: Waves,
  bike: Bike,
  run: Footprints,
  rest: Zzz,
  brick: Bike, // Brick sessions show bike icon (bike is primary)
}

export function SportBadge({ sport, size = 'md', showLabel = false }: SportBadgeProps) {
  const colors = SPORT_COLORS[sport] || SPORT_COLORS.bike // Fallback to bike for brick
  const Icon = SPORT_ICONS[sport] || SPORT_ICONS.bike

  const iconSizeMap: Record<string, number> = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  const paddingMap: Record<string, string> = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const gapMap: Record<string, string> = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-2',
  }

  const textSizeMap: Record<string, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={`flex items-center ${gapMap[size]} ${paddingMap[size]} rounded-lg ${colors.bg}`}>
      <Icon size={iconSizeMap[size]} className={colors.tailwind} />
      {showLabel && (
        <span className={`${textSizeMap[size]} font-medium ${colors.tailwind}`}>
          {SPORT_LABELS[sport]}
        </span>
      )}
    </div>
  )
}

/**
 * Brick Session Badge - shows both Bike and Run badges
 */
interface BrickSessionBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function BrickSessionBadge({ size = 'md', showLabel = false }: BrickSessionBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <SportBadge sport="bike" size={size} showLabel={showLabel} />
      <span className="text-gray-500 text-xs">+</span>
      <SportBadge sport="run" size={size} showLabel={showLabel} />
    </div>
  )
}
