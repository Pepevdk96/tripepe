'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import TabNav from '@/components/TabNav'
import TodayView from '@/components/TodayView'
import WeekView from '@/components/WeekView'
import PlanView from '@/components/PlanView'
import RacesView from '@/components/RacesView'
import LogView from '@/components/LogView'
import RaceFinder from '@/components/RaceFinder'
import CoachChat from '@/components/coach-chat'
import { useTriPepeData } from '@/lib/useTriPepeData'
import { RefreshCw } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('today')
  const { trainingPlan, races, profile, completedWorkouts, garminSync, loading, refetch } = useTriPepeData()

  const renderView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView trainingPlan={trainingPlan} races={races} completedWorkouts={completedWorkouts} />
      case 'week':
        return <WeekView trainingPlan={trainingPlan} />
      case 'plan':
        return <PlanView trainingPlan={trainingPlan} onSelectWeek={() => setActiveTab('week')} />
      case 'races':
        return <RacesView races={races} />
      case 'discover':
        return <RaceFinder />
      case 'log':
        return <LogView completedWorkouts={completedWorkouts} garminSync={garminSync} onSync={refetch} />
      case 'coach':
        return <CoachChat />
      default:
        return <TodayView trainingPlan={trainingPlan} races={races} completedWorkouts={completedWorkouts} />
    }
  }

  return (
    <>
      <Header profile={profile} />
      <div className="min-h-screen bg-[#0a0a0f]">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 bg-[#E8755A]/10 text-[#E8755A] text-xs">
            <RefreshCw size={12} className="animate-spin" />
            Laden vanuit Supabase...
          </div>
        )}
        {renderView()}
      </div>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
