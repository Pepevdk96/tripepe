'use client'

import { MapPin, Download, ArrowRight } from 'lucide-react'
import type { Workout } from '@/lib/trainingData'

interface RouteSuggestionProps {
  workout: Workout
}

interface RouteSuggestionData {
  name: string
  description: string
  distance: string
  elevation: 'vlak' | 'heuvelachtig'
  type: 'loop' | 'out-and-back'
  // Sample waypoints for GPX export (Rotterdam/Den Haag area)
  waypoints: { lat: number; lon: number; name?: string }[]
}

export default function RouteSuggestion({ workout }: RouteSuggestionProps) {
  const getRouteSuggestion = (): RouteSuggestionData | null => {
    const workoutType = workout.type
    const intensity = workout.intensity

    // No routes for swim or rest
    if (workoutType === 'swim' || workoutType === 'rest') {
      return null
    }

    if (workoutType === 'run') {
      if (intensity === 'easy') {
        return {
          name: 'Vlak parcours langs de gracht',
          description: 'Weinig verkeer, ontspannen route',
          distance: '5-8km',
          elevation: 'vlak',
          type: 'loop',
          waypoints: [
            { lat: 51.9225, lon: 4.4792, name: 'Start - Kralingse Plas' },
            { lat: 51.9240, lon: 4.4850, name: 'Langs het water' },
            { lat: 51.9260, lon: 4.4900, name: 'Rondje Kralingse Bos' },
            { lat: 51.9250, lon: 4.4820, name: 'Terug via parkpad' },
            { lat: 51.9225, lon: 4.4792, name: 'Finish' },
          ],
        }
      }
      if (intensity === 'hard') {
        return {
          name: 'Atletiekbaan of vlak park met meetpunten',
          description: 'Perfecte omstandigheden voor intervallen',
          distance: 'Afhankelijk van sessie',
          elevation: 'vlak',
          type: 'loop',
          waypoints: [
            { lat: 51.9080, lon: 4.4870, name: 'Start - Zuiderpark' },
            { lat: 51.9090, lon: 4.4920, name: '400m mark' },
            { lat: 51.9100, lon: 4.4870, name: '800m mark' },
            { lat: 51.9090, lon: 4.4820, name: '1200m mark' },
            { lat: 51.9080, lon: 4.4870, name: 'Finish ronde' },
          ],
        }
      }
      return {
        name: 'Rondje buitengebied',
        description: 'Rustige wegen, drinkfontein bij km 10',
        distance: '10-20km',
        elevation: 'vlak',
        type: 'loop',
        waypoints: [
          { lat: 51.9225, lon: 4.4792, name: 'Start' },
          { lat: 51.9350, lon: 4.4600, name: 'Richting Hillegersberg' },
          { lat: 51.9450, lon: 4.4500, name: 'Schiebroek' },
          { lat: 51.9500, lon: 4.4700, name: 'Drinkfontein' },
          { lat: 51.9400, lon: 4.4900, name: 'Terug via Bergse Voorplas' },
          { lat: 51.9225, lon: 4.4792, name: 'Finish' },
        ],
      }
    }

    if (workoutType === 'bike') {
      if (intensity === 'easy') {
        return {
          name: 'Vlakke polderwegen',
          description: 'Weinig wind, veilige wegen',
          distance: '30-50km',
          elevation: 'vlak',
          type: 'loop',
          waypoints: [
            { lat: 51.9225, lon: 4.4792, name: 'Start' },
            { lat: 51.9500, lon: 4.4200, name: 'Polder Noord' },
            { lat: 51.9800, lon: 4.3900, name: 'Bleiswijk' },
            { lat: 51.9600, lon: 4.3500, name: 'Berkel' },
            { lat: 51.9400, lon: 4.4000, name: 'Terug via Bergschenhoek' },
            { lat: 51.9225, lon: 4.4792, name: 'Finish' },
          ],
        }
      }
      if (intensity === 'hard') {
        return {
          name: 'Parcours met heuvels of dijken',
          description: 'Voor wattage-werk en VO2max training',
          distance: '40-60km',
          elevation: 'heuvelachtig',
          type: 'loop',
          waypoints: [
            { lat: 51.9225, lon: 4.4792, name: 'Start' },
            { lat: 51.8900, lon: 4.5200, name: 'Krimpen a/d IJssel' },
            { lat: 51.8700, lon: 4.5800, name: 'Langs de Lek' },
            { lat: 51.8500, lon: 4.5500, name: 'Dijk training segment' },
            { lat: 51.8800, lon: 4.5000, name: 'Terug via Capelle' },
            { lat: 51.9225, lon: 4.4792, name: 'Finish' },
          ],
        }
      }
      return {
        name: 'Grote ronde via platteland',
        description: 'Tankstation halverwege, mooie natuur',
        distance: '60-120km',
        elevation: 'vlak',
        type: 'loop',
        waypoints: [
          { lat: 51.9225, lon: 4.4792, name: 'Start' },
          { lat: 51.9800, lon: 4.3500, name: 'Pijnacker' },
          { lat: 52.0100, lon: 4.3000, name: 'Delft' },
          { lat: 52.0500, lon: 4.3200, name: 'Den Haag Zuid' },
          { lat: 52.0200, lon: 4.4500, name: 'Zoetermeer' },
          { lat: 51.9600, lon: 4.4800, name: 'Terug via A13 route' },
          { lat: 51.9225, lon: 4.4792, name: 'Finish' },
        ],
      }
    }

    return null
  }

  const suggestion = getRouteSuggestion()

  if (!suggestion) {
    return null
  }

  const handleExportGPX = () => {
    if (!suggestion) return

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TriPepe"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${suggestion.name}</name>
    <desc>${suggestion.description} - ${workout.title}</desc>
    <author><name>TriPepe</name></author>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${suggestion.name}</name>
    <type>${workout.type}</type>
    <trkseg>
${suggestion.waypoints.map(wp => `      <trkpt lat="${wp.lat}" lon="${wp.lon}">
        <name>${wp.name || ''}</name>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
  <rte>
    <name>${suggestion.name}</name>
${suggestion.waypoints.map(wp => `    <rtept lat="${wp.lat}" lon="${wp.lon}">
      <name>${wp.name || ''}</name>
    </rtept>`).join('\n')}
  </rte>
</gpx>`

    // Create and download the file
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tripepe-${workout.type}-${suggestion.name.toLowerCase().replace(/\s+/g, '-')}.gpx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Success toast
    const message = document.createElement('div')
    message.className =
      'fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm z-50'
    message.textContent = 'GPX gedownload! Open in Garmin Connect of Strava.'
    document.body.appendChild(message)
    setTimeout(() => message.remove(), 3000)
  }

  return (
    <div className="card-base border border-green-700/30 bg-gradient-to-br from-green-900/10 to-green-800/5">
      <div className="flex items-start gap-3 mb-4">
        <MapPin size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{suggestion.name}</h3>
          <p className="text-xs text-gray-400">{suggestion.description}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.distance}
        </span>
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.elevation === 'vlak' ? 'Vlak' : 'Heuvelachtig'}
        </span>
        <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
          {suggestion.type === 'loop' ? 'Loop' : 'Out-and-back'}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (suggestion && suggestion.waypoints.length > 0) {
              const wp = suggestion.waypoints[0]
              window.open(`https://www.google.com/maps/dir/${suggestion.waypoints.map(w => `${w.lat},${w.lon}`).join('/')}`, '_blank')
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm font-medium hover:bg-green-500/30 transition-colors"
        >
          <ArrowRight size={16} />
          Bekijk route
        </button>
        <button
          onClick={handleExportGPX}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm font-medium hover:bg-green-500/30 transition-colors"
        >
          <Download size={16} />
          Exporteer GPX
        </button>
      </div>
    </div>
  )
}
