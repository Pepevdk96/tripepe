'use client'

import { useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react'
import type { Week } from '@/lib/trainingData'

interface GroceryListProps {
  currentWeek: Week | null
}

interface GroceryItem {
  name: string
  quantity: string
  category: 'proteïne' | 'koolhydraten' | 'groenten' | 'fruit' | 'zuivel' | 'sportvoeding' | 'overig'
  reason?: string
}

const categoryIcons: Record<string, string> = {
  proteïne: '🥩',
  koolhydraten: '🍝',
  groenten: '🥦',
  fruit: '🍌',
  zuivel: '🥛',
  sportvoeding: '⚡',
  overig: '🛒',
}

const categoryColors: Record<string, string> = {
  proteïne: 'text-red-400',
  koolhydraten: 'text-amber-400',
  groenten: 'text-green-400',
  fruit: 'text-yellow-400',
  zuivel: 'text-blue-400',
  sportvoeding: 'text-purple-400',
  overig: 'text-gray-400',
}

function generateGroceryList(week: Week): GroceryItem[] {
  const items: GroceryItem[] = []
  const totalHours = parseFloat(week.totalHours) || 6
  const hasHardWorkout = week.sessions.some(s => s.intensity === 'hard')
  const hasLongRun = week.sessions.some(s => s.type === 'run' && parseInt(s.duration) > 60)
  const hasLongBike = week.sessions.some(s => s.type === 'bike' && parseInt(s.duration) > 90)
  const swimDays = week.sessions.filter(s => s.type === 'swim').length
  const runDays = week.sessions.filter(s => s.type === 'run').length
  const bikeDays = week.sessions.filter(s => s.type === 'bike').length
  const trainingDays = swimDays + runDays + bikeDays

  // Base protein needs (higher with more training)
  items.push({ name: 'Kipfilet', quantity: `${Math.ceil(trainingDays * 0.3)} kg`, category: 'proteïne', reason: 'Spierherstel na training' })
  items.push({ name: 'Eieren', quantity: '12 stuks', category: 'proteïne', reason: 'Ontbijt + snacks' })
  items.push({ name: 'Zalm of tonijn', quantity: `${Math.ceil(trainingDays * 0.15)} kg`, category: 'proteïne', reason: 'Omega-3 voor herstel' })

  // Carbs based on training load
  items.push({ name: 'Volkoren pasta', quantity: '500g', category: 'koolhydraten', reason: 'Koolhydraat loading' })
  items.push({ name: 'Rijst (basmati)', quantity: '1 kg', category: 'koolhydraten', reason: 'Snelle energie' })
  items.push({ name: 'Havermout', quantity: '500g', category: 'koolhydraten', reason: 'Ontbijt — langzame koolhydraten' })
  if (hasLongRun || hasLongBike) {
    items.push({ name: 'Zoete aardappel', quantity: '1 kg', category: 'koolhydraten', reason: 'Complexe koolhydraten voor lange sessies' })
  }
  items.push({ name: 'Volkoren brood', quantity: '1 brood', category: 'koolhydraten', reason: 'Lunch + pre-workout' })

  // Vegetables
  items.push({ name: 'Broccoli', quantity: '500g', category: 'groenten', reason: 'Ijzer + vitaminen' })
  items.push({ name: 'Spinazie', quantity: '200g', category: 'groenten', reason: 'Ijzer voor zuurstoftransport' })
  items.push({ name: 'Paprika (mix)', quantity: '3 stuks', category: 'groenten', reason: 'Vitamine C' })
  items.push({ name: 'Avocado', quantity: '3 stuks', category: 'groenten', reason: 'Gezonde vetten + kalium' })

  // Fruit
  items.push({ name: 'Bananen', quantity: `${Math.max(trainingDays, 4)} stuks`, category: 'fruit', reason: 'Pre/post workout snack — kalium' })
  items.push({ name: 'Blauwe bessen', quantity: '250g', category: 'fruit', reason: 'Antioxidanten voor herstel' })
  items.push({ name: 'Appels', quantity: '4 stuks', category: 'fruit', reason: 'Snack + vezels' })

  // Dairy
  items.push({ name: 'Griekse yoghurt', quantity: '500g', category: 'zuivel', reason: 'Proteïne + probiotica' })
  items.push({ name: 'Melk (halfvol)', quantity: '2 liter', category: 'zuivel', reason: 'Herstel + calcium' })
  items.push({ name: 'Cottage cheese', quantity: '250g', category: 'zuivel', reason: 'Caseïne — nacht herstel' })

  // Sport nutrition based on training intensity
  if (hasHardWorkout || totalHours > 5) {
    items.push({ name: 'Energy gels (6-pack)', quantity: '1 pak', category: 'sportvoeding', reason: 'Interval/lange sessies' })
  }
  if (hasLongBike || hasLongRun) {
    items.push({ name: 'Isotone sportdrank', quantity: '1 bus', category: 'sportvoeding', reason: 'Elektrolyten tijdens lange sessies' })
  }
  items.push({ name: 'Whey proteïne', quantity: totalHours > 7 ? '1 pot' : '500g', category: 'sportvoeding', reason: 'Post-workout shake' })

  // Other essentials
  items.push({ name: 'Noten (mix)', quantity: '200g', category: 'overig', reason: 'Gezonde vetten + snack' })
  items.push({ name: 'Honing', quantity: '1 pot', category: 'overig', reason: 'Natuurlijke suiker voor in yoghurt' })
  items.push({ name: 'Pindakaas', quantity: '1 pot', category: 'overig', reason: 'Proteïne + gezonde vetten' })

  return items
}

export default function GroceryList({ currentWeek }: GroceryListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  if (!currentWeek) return null

  const items = generateGroceryList(currentWeek)
  const categories = [...new Set(items.map(i => i.category))]

  const toggleItem = (name: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(name)) {
      newChecked.delete(name)
    } else {
      newChecked.add(name)
    }
    setCheckedItems(newChecked)
  }

  const handleCopyList = () => {
    const text = categories.map(cat => {
      const catItems = items.filter(i => i.category === cat)
      return `${categoryIcons[cat]} ${cat.toUpperCase()}\n${catItems.map(i => `  - ${i.name} (${i.quantity})`).join('\n')}`
    }).join('\n\n')

    navigator.clipboard.writeText(`🛒 TriPepe Boodschappenlijst — Week ${currentWeek.number}\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const progress = items.length > 0 ? Math.round((checkedItems.size / items.length) * 100) : 0

  return (
    <div className="card-base border border-emerald-700/30 bg-gradient-to-br from-emerald-900/10 to-green-900/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">Boodschappenlijst</span>
          <span className="text-xs text-gray-500">
            Week {currentWeek.number} — {items.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checkedItems.size > 0 && (
            <span className="text-xs text-emerald-400">{progress}%</span>
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Training context */}
          <div className="p-2 bg-[#1a1a2e] rounded-lg">
            <p className="text-xs text-gray-400">
              Gebaseerd op {currentWeek.totalHours}u training — {currentWeek.phase} fase
            </p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopyList}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-emerald-600/10 border border-emerald-600/30 text-emerald-300 text-xs hover:bg-emerald-600/20 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Gekopieerd!' : 'Kopieer lijst'}
          </button>

          {/* Progress bar */}
          {checkedItems.size > 0 && (
            <div className="w-full bg-gray-700/30 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Categorized items */}
          {categories.map(cat => {
            const catItems = items.filter(i => i.category === cat)
            return (
              <div key={cat}>
                <p className={`text-xs font-medium mb-2 ${categoryColors[cat]}`}>
                  {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </p>
                <div className="space-y-1">
                  {catItems.map(item => (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                        checkedItems.has(item.name)
                          ? 'bg-[#1a1a2e]/50 opacity-50'
                          : 'bg-[#1a1a2e] hover:bg-[#202038]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        checkedItems.has(item.name)
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-600'
                      }`}>
                        {checkedItems.has(item.name) && <Check size={10} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${checkedItems.has(item.name) ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.quantity}</span>
                        </div>
                        {item.reason && !checkedItems.has(item.name) && (
                          <p className="text-xs text-gray-600 mt-0.5">{item.reason}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
