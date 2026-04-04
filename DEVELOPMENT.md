# TriPepe Development Guide

## Project Overview

TriPepe is a Runna-style adaptive triathlon training PWA built for Pepe's marathon (May 10) and Half Ironman 70.3 (June 7, 2026) races.

**Target Device**: Mobile-first (428px width), responsive up to tablet

**Tech Stack**:
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization (optional)

## Architecture

### Component Hierarchy

```
App (page.tsx)
├── Header
│   └── Shows phase badge & settings
├── [Active View Component]
│   ├── TodayView
│   ├── WeekView
│   ├── PlanView
│   ├── RacesView
│   └── LogView
└── TabNav
    └── Bottom navigation (5 tabs)
```

### Data Flow

```
trainingData.ts (source of truth)
│
├─→ TodayView (current day, races)
├─→ WeekView (7 daily workouts)
├─→ PlanView (9-week timeline)
├─→ RacesView (race splits & strategy)
└─→ LogView (completed workouts)

helpers.ts (utility functions)
├─→ Date calculations (getDaysUntil, getCurrentWeek)
├─→ Formatting (formatPace, formatDate)
├─→ Color mapping (getSportColor, getIntensityColor)
└─→ UI helpers (getGreeting, getRecoveryTips)
```

## File Structure

### Core Files

**app/layout.tsx**
- PWA meta tags for installability
- Service worker registration
- Global HTML setup

**app/page.tsx**
- Main app shell
- Tab state management
- View rendering logic

**app/globals.css**
- Tailwind imports
- Custom dark theme variables
- Animation definitions
- Custom component classes

### Data Layer

**lib/trainingData.ts**
- `trainingPlan`: 9-week array of weeks
  - Each week has 7 sessions (Mon-Sun)
  - Complete with all metadata
- `marathonSplits`: 9 splits with nutrition timing
- `triathlonSplits`: Split targets for 70.3
- `races`: Race configurations
- `athleteProfile`: Pepe's metrics

**lib/helpers.ts**
- Pure utility functions
- No side effects
- Exported for use in components

**lib/api.ts**
- Backend API client (placeholder)
- Ready for Garmin integration
- Workout logging functions

### Components

**Header.tsx**
- Displays "TriPepe" with gradient
- Phase badge
- Settings icon (non-functional)

**TabNav.tsx**
- 5 tabs with icons
- Active state highlighting
- Gradient underline animation

**TodayView.tsx**
- Greeting based on time of day
- Race countdowns (both races)
- Today's workout card (or rest message)
- This week daily discipline circles
- Recovery tip carousel

**WeekView.tsx**
- Week navigation (prev/next)
- Week number and date range
- 7 daily workout cards
- Key workout highlight
- Week statistics

**PlanView.tsx**
- 9-week vertical timeline
- Phase color coding
- Interactive week selection
- Total plan statistics
- Phase legend

**RacesView.tsx**
- Race countdowns
- Marathon pacing table
  - 9 splits with nutrition
  - Strategy description
- 70.3 split cards
  - Swim/bike/run targets
  - Transition times
  - Bike nutrition plan

**LogView.tsx**
- Weekly summary stats
- Recent workouts list
- Expandable log entries
  - RPE selector (1-10)
  - Notes textarea
  - Save button with confirmation
- Logging tips

**WorkoutCard.tsx** (Reusable)
- Sport type detection
- Color-coded left border
- Sport icon + metrics
- Intensity badge
- Distance and pace info

**RaceCountdown.tsx** (Reusable)
- Race name and type
- Days remaining (large number)
- Progress bar
- Target time

## Styling System

### Tailwind Classes Used

**Dark Theme Colors**
```
bg-[#0a0a0f]      // Primary background
bg-[#141420]      // Card background
bg-[#1a1a2e]      // Hover state
text-white        // Primary text
text-gray-400     // Secondary text
```

**Sport Colors**
```
border-[#FF4444]  // Run (red)
border-[#00CC66]  // Bike (green)
border-[#00AAFF]  // Swim (cyan)
border-[#666688]  // Rest (gray)
border-[#FFD700]  // Race (gold)
```

**Gradient Utilities**
```
gradient-text        // For TriPepe logo
gradient-accent      // Button gradient
```

**Custom Classes (in globals.css)**
```
.card-base          // Standard card styling
.card-hover         // Hoverable card
.btn-primary        // Primary button
.btn-secondary      // Secondary button
.intensity-badge    // Intensity indicator
.sport-run/bike/swim // Sport borders
.glow-run           // Glow animation
.pulse-custom       // Pulse animation
```

### Responsive Design

**Mobile-First Approach**
```tsx
// Container (max-width for mobile, centered)
<main className="min-h-screen max-w-md mx-auto">

// Grid for mobile (2-3 columns)
<div className="grid grid-cols-2 gap-3">
  // Auto-adapts if Tailwind MD breakpoint applied
</div>

// Tab bar (fixed bottom)
<nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
```

**Padding and Spacing**
- Use 4px base grid (Tailwind default)
- Containers: `px-4 py-6`
- Cards: `p-4`
- Gaps: `gap-2`, `gap-3`, `gap-4`

## State Management

### Current Approach
- React `useState` only
- No Context API or Redux (KISS principle)
- Page-level state in `app/page.tsx`
- Component-level state in individual components

### Examples

**Page-level (app/page.tsx)**
```tsx
const [activeTab, setActiveTab] = useState('today')
// Passed to views and TabNav
```

**Component-level (LogView.tsx)**
```tsx
const [expandedLog, setExpandedLog] = useState<string | null>(null)
const [logs, setLogs] = useState<Record<string, LogEntry>>({})
```

### Future State Management
If app grows:
- Consider Context API for cross-component state
- User profile/preferences context
- Training state context (current week, etc.)

## Styling Patterns

### Card Component Pattern
```tsx
<div className="card-base space-y-4">
  {/* Content */}
</div>
```

### Button Patterns
```tsx
// Primary action
<button className="btn-primary">Action</button>

// Secondary action
<button className="btn-secondary">Secondary</button>

// Icon button
<button className="p-2 hover:bg-[#1a1a2e] rounded-lg transition-colors">
  <Icon size={24} />
</button>
```

### Conditional Rendering with Classes
```tsx
<div className={`card-base ${getSportBgColor(workout.type)}`}>
```

### Animation Usage
```tsx
// Pulse on current week
<div className="pulse-custom">Week Item</div>

// Glow on current workout
<div className="glow-run"><WorkoutCard /></div>

// Transitions
className="transition-colors hover:bg-[#1a1a2e]"
```

## Adding New Features

### Adding a New View
1. Create new component in `/components`
   ```tsx
   export default function NewView() {
     return <div className="pb-32 px-4 py-6 space-y-6">
       {/* Content */}
     </div>
   }
   ```

2. Add to tab routing in `app/page.tsx`
   ```tsx
   case 'new':
     return <NewView />
   ```

3. Add tab to TabNav (edit `TabNav.tsx`)
   ```tsx
   { id: 'new', label: 'New', icon: IconName }
   ```

### Adding New Training Data
Edit `/lib/trainingData.ts`:

1. **Add week**: Push to `trainingPlan` array
   ```typescript
   {
     number: 10,
     dateStart: '2026-06-08',
     dateEnd: '2026-06-14',
     phase: 'Recovery',
     phaseColor: 'bg-gradient-to-r from-purple-600 to-purple-400',
     totalHours: '3.5',
     keyWorkout: 'Easy swim',
     sessions: [/* 7 workouts */]
   }
   ```

2. **Add race**: Push to `races` array
   ```typescript
   {
     name: 'Test Race',
     date: '2026-07-15',
     target: '1:30:00',
     type: 'triathlon'
   }
   ```

3. **Update athlete profile**: Edit `athleteProfile` object

### Adding Helper Functions
Edit `/lib/helpers.ts`:

```typescript
export const newHelper = (param: string): string => {
  // Implementation
  return result
}
```

Then import and use:
```tsx
import { newHelper } from '@/lib/helpers'

// In component
const result = newHelper('value')
```

## Testing

### Manual Testing Checklist

**Mobile Responsiveness**
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12 (390px)
- [ ] Test on Pixel 4a (412px)
- [ ] Test on tablet (iPad)

**PWA Installation**
- [ ] Install on iOS (Safari)
- [ ] Install on Android (Chrome)
- [ ] Test offline functionality
- [ ] Check splash screen display

**All Views**
- [ ] Vandaag: Today's workout, races
- [ ] Week: Navigation, workout display
- [ ] Plan: Timeline interaction
- [ ] Races: Splits display, expandable sections
- [ ] Log: RPE selection, note saving

**Dark Theme**
- [ ] Colors correct on OLED displays
- [ ] Sufficient contrast for readability
- [ ] Gradient effects visible
- [ ] No bright flashes

### Browser DevTools Testing
```javascript
// In console
// Check current active view
document.querySelector('main')

// Simulate offline
// DevTools > Network > Offline
```

## Performance Optimization

### Current Optimizations
- Next.js automatic code splitting
- CSS-in-JS with Tailwind (minimal bundle)
- Service worker caching strategy
- No unused libraries imported

### Further Optimizations
- Image optimization (if added)
- Code splitting by view
- Lazy component loading
- API request debouncing

## Browser Support

**Target Support**
- iOS Safari 14+
- Android Chrome 90+
- Modern browsers (2022+)

**PWA Requirements Met**
- HTTPS (production)
- manifest.json
- Service worker (sw.js)
- Responsive design
- Icon set

## Deployment

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Test production build locally
npm start
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.tripepe.app/v1
NEXT_PUBLIC_GARMIN_CLIENT_ID=your_client_id
```

### Hosting Recommendations
- Vercel (Next.js native, zero config)
- Netlify (auto-deployment from Git)
- AWS Amplify (for more control)

**MUST HAVE**: HTTPS enabled for PWA functionality

## Debugging Tips

### Common Issues

**Service Worker Not Updating**
```javascript
// Clear all caches in DevTools > Application
// Or navigate to chrome://serviceworker-internals
```

**Styles Not Applying**
- Check Tailwind config inclusion
- Verify class names are in content array
- Clear `.next` and rebuild

**Date Calculations Off**
- Remember: `new Date()` is client-side local time
- Use consistent date format: YYYY-MM-DD

**Workout Not Showing for Today**
- Check trainingPlan date matches today's date
- Verify date string format in training data

## Performance Metrics

### Target Metrics
- First Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Measuring Performance
```bash
npm install -g lighthouse
lighthouse http://localhost:3000
```

## Code Style

### ESLint Config
Using Next.js defaults (ESLint + TypeScript strict mode)

### Preferred Patterns
- Use TypeScript interfaces for props
- Destructure props in function signature
- Use `const` for components (functional)
- Arrow functions for event handlers
- Template literals for strings

### Import Order
```tsx
// 1. React imports
import { useState } from 'react'

// 2. Third-party imports
import { Waves, Bike } from 'lucide-react'

// 3. Local imports
import { getTodayWorkout } from '@/lib/helpers'
import { trainingPlan } from '@/lib/trainingData'
import WorkoutCard from '@/components/WorkoutCard'
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web.dev Learn](https://web.dev/learn/)

## Contact & Support

For questions about the codebase:
- Review the specific component files
- Check helper functions in `/lib/helpers.ts`
- Look at similar components for patterns

---

**Last Updated**: April 2026
**Built for**: Pepe's Ironman Training Journey
