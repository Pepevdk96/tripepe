'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { PlannedWorkout, RPE_SCALE } from '@/lib/types/workout'

interface WorkoutCompletionModalProps {
  workout: PlannedWorkout
  isOpen: boolean
  onClose: () => void
  onSubmit: (rpe: number, notes?: string, feeling?: string) => Promise<void>
  isLoading?: boolean
}

export function WorkoutCompletionModal({
  workout,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: WorkoutCompletionModalProps) {
  const [rpe, setRpe] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [feeling, setFeeling] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rpe === null) return

    try {
      // Show loading state immediately - prevents double-submit
      setSubmitted(true)
      await onSubmit(rpe, notes || undefined, feeling || undefined)
      // Only close after successful submission
      setRpe(null)
      setNotes('')
      setFeeling('')
      setSubmitted(false)
      onClose()
    } catch (error) {
      setSubmitted(false)
      console.error('Failed to log workout:', error)
      // Error is handled by parent component's error display
    }
  }

  const rpeDescriptions: Record<number, string> = {
    1: 'Zeer gemakkelijk',
    2: 'Gemakkelijk',
    3: 'Matig gemakkelijk',
    4: 'Matig',
    5: 'Tamelijk zwaar',
    6: 'Zwaar',
    7: 'Zeer zwaar',
    8: 'Zeer zeer zwaar',
    9: 'Extreem zwaar',
    10: 'Maximaal mogelijk',
  }

  const feelingOptions = [
    { value: 'strong', label: 'Sterk', emoji: '💪' },
    { value: 'good', label: 'Goed', emoji: '👍' },
    { value: 'okay', label: 'Prima', emoji: '🙂' },
    { value: 'tired', label: 'Moe', emoji: '😴' },
    { value: 'struggling', label: 'Moeizaam', emoji: '😰' },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end z-50">
      <div className="w-full max-w-md bg-[#141420] rounded-t-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Training gelogd</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-[#1a1a2e] rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Workout Info */}
        <div className="bg-[#1a1a2e] rounded-lg p-3">
          <p className="text-sm text-gray-400">{workout.title}</p>
          <p className="text-sm text-gray-500 mt-1">{workout.description}</p>
        </div>

        {/* RPE Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">
            Hoe voelde de training? (Borg schaal)
          </label>
          <p className="text-xs text-gray-400">
            1 = zeer gemakkelijk, 10 = maximaal mogelijk
          </p>

          {/* RPE Scale */}
          <div className="grid grid-cols-5 gap-2">
            {RPE_SCALE.map((value) => (
              <button
                key={value}
                onClick={() => setRpe(value)}
                disabled={isLoading}
                className={`p-2 rounded-lg font-semibold transition-all ${
                  rpe === value
                    ? 'bg-red-500 text-white'
                    : 'bg-[#1a1a2e] text-gray-400 hover:bg-[#242430]'
                } disabled:opacity-50`}
              >
                {value}
              </button>
            ))}
          </div>

          {/* RPE Description */}
          {rpe !== null && (
            <p className="text-sm text-gray-300 text-center py-2 bg-[#1a1a2e] rounded-lg">
              {rpeDescriptions[rpe]}
            </p>
          )}
        </div>

        {/* Feeling Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">Hoe voelde je je?</label>
          <div className="grid grid-cols-5 gap-2">
            {feelingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFeeling(option.value)}
                disabled={isLoading}
                className={`p-3 rounded-lg text-center text-sm transition-all ${
                  feeling === option.value
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-[#1a1a2e] border-2 border-transparent hover:border-[#2a2a36]'
                } disabled:opacity-50`}
                title={option.label}
              >
                <div className="text-xl">{option.emoji}</div>
                <div className="text-xs text-gray-400 mt-1">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">Opmerkingen (optioneel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            placeholder="Bijzonderheden, pijn, etc."
            className="w-full bg-[#1a1a2e] text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none h-20"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rpe === null || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Opslaan...' : 'Training opslaan'}
        </button>

        {/* Info Text */}
        {submitted && (
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
            <p className="text-sm text-green-400">Training succesvol gelogd!</p>
          </div>
        )}
      </div>
    </div>
  )
}
