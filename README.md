# TriPepe - Triathlon Training PWA

A modern, mobile-first Progressive Web App for adaptive triathlon training with a focus on Marathon + Half Ironman (70.3) preparation. Built with Next.js, React, and TypeScript.

## Features

- **Dark Theme UI**: Beautiful, athlete-focused dark interface optimized for mobile
- **5 Main Views**:
  - **Vandaag (Today)**: Current workout, race countdowns, this week overview
  - **Week**: Detailed weekly plan view with daily workouts
  - **Plan**: 9-week training timeline with phase visualization
  - **Races**: Race-specific pacing strategies and splits
  - **Log**: Workout logging with RPE tracking and notes

- **PWA Capabilities**:
  - Installable as standalone app on iOS and Android
  - Service worker for offline functionality
  - Responsive design optimized for mobile

- **Training Data**:
  - Complete 9-week triathlon plan
  - Marathon and 70.3 race-specific pacing
  - Detailed nutrition strategies
  - Phase-based periodization

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app                    # Next.js app directory
  /layout.tsx          # Root layout with PWA meta tags
  /page.tsx            # Main app shell and routing
  /globals.css         # Tailwind and custom styles

/components            # React components
  /Header.tsx          # Top navigation with phase badge
  /TabNav.tsx          # Bottom tab navigation
  /TodayView.tsx       # Home screen with daily workout
  /WeekView.tsx        # Weekly training view
  /PlanView.tsx        # 9-week training timeline
  /RacesView.tsx       # Race pacing and strategy
  /LogView.tsx         # Workout logging interface
  /WorkoutCard.tsx     # Reusable workout card
  /RaceCountdown.tsx   # Race countdown widget

/lib
  /trainingData.ts     # Complete training plan (9 weeks)
  /helpers.ts          # Utility functions
  /api.ts              # Backend API client

/public
  /manifest.json       # PWA manifest
  /sw.js              # Service worker
  /icons/             # App icons (placeholder)

/styles
  globals.css         # Global styles & Tailwind
```

## Design System

### Colors (Dark Theme)
- **Primary Background**: #0a0a0f
- **Card Background**: #141420
- **Text Primary**: #ffffff
- **Text Secondary**: #8888aa

### Sport Colors
- **Run**: #FF4444 (red)
- **Bike**: #00CC66 (green)
- **Swim**: #00AAFF (cyan)
- **Rest**: #666688 (gray)
- **Race**: #FFD700 (gold)

### Intensity Badges
- **Easy**: Green (#22c55e)
- **Moderate**: Yellow (#eab308)
- **Hard**: Orange (#f97316)
- **Race**: Red (#ef4444)

## Key Components

### Training Data
Complete 9-week plan with:
- Week 1-3: Marathon Build Phase
- Week 4-5: Marathon Taper
- Week 6: Recovery
- Week 7-8: 70.3 Build Phase
- Week 9: 70.3 Race Week

Each week includes:
- 7 daily sessions with sport type, duration, distance
- Phase color coding
- Key workout identification
- Total hours per week

### Race Strategies

**Marathon (May 10, 2026)**
- Target: 2:49:59 (negative split strategy)
- Detailed km splits with pace, time, and nutrition
- Pacing from 4:05 to 3:58 /km

**70.3 (June 7, 2026)**
- Target: 4:29:00
- Swim: 35 min | Bike: 2:22 | Run: 1:27
- Hourly nutrition plan for bike leg

## API Integration

The app is prepared for backend integration:
- `fetchGarminActivities()`: Sync Garmin workouts
- `syncWorkout()`: Log completed workout
- `fetchHealthMetrics()`: Get training load data
- `submitFeedback()`: Save RPE and notes

Configure API endpoint in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## PWA Installation

### iOS
1. Open in Safari
2. Tap Share → Add to Home Screen
3. App launches in fullscreen mode

### Android
1. Open in Chrome
2. Tap Menu → Install app
3. App installs to home screen

## Offline Support

The service worker caches:
- HTML pages
- CSS and JavaScript
- Manifest and icons
- Recently viewed workouts

Network-first strategy: App tries to fetch fresh data, falls back to cache when offline.

## Customization

### Change Athlete Name
Edit `athleteProfile` in `/lib/trainingData.ts`

### Update Training Plan
Edit `trainingPlan` array in `/lib/trainingData.ts`

### Modify Colors
Update Tailwind config in `tailwind.config.ts` and CSS variables in `/app/globals.css`

### Add Icons
Replace placeholder icon files in `/public/icons/` (required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)

## Development Notes

- **No localStorage**: State management uses React useState only
- **Dutch/English**: UI text is Dutch, technical terms are English
- **Mobile-first**: Designed for max-width 428px (mobile screens)
- **TypeScript**: Fully typed components and utilities

## Future Enhancements

- Garmin Connect integration for activity sync
- Real-time health metrics from wearables
- AI-powered training adjustments
- Social features (share workouts, compete)
- Video form analysis for swimming and running
- Nutrition tracking and hydration reminders

## License

MIT - Created for TriPepe athlete training

## Support

For issues or feature requests, create an issue in the project repository.

---

Built with Next.js, React, TypeScript, Tailwind CSS, and Lucide Icons.
