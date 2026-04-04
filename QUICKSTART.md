# TriPepe Quick Start Guide

## 60 Seconds to Running App

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit http://localhost:3000
```

Done! The app should load with today's training plan.

## What You're Seeing

- **Goedemorgen/middag/avond**: Time-based Dutch greeting
- **Race countdowns**: Days until Marathon (May 10) and 70.3 (June 7)
- **Today's workout**: If scheduled, or "Rustdag!" if rest day
- **This week circles**: Shows daily discipline (swim/bike/run/rest)

## Testing the App

### Test Different Dates
The app shows training based on `today's date`. To test different weeks:

1. Open browser DevTools (F12)
2. Go to Application tab
3. Find the date calculations in `lib/helpers.ts`
4. Or modify test dates temporarily

### Test All Views
Click the bottom tabs:
- **Vandaag** → Today's home screen
- **Week** → Current week details with prev/next navigation
- **Plan** → 9-week timeline (click weeks to select)
- **Races** → Marathon & 70.3 race info with pacing
- **Log** → Workout logging interface

### Test Responsive Design
In DevTools:
1. Click device toolbar icon
2. Select different devices
3. Test on iPhone SE (375px), iPhone 12 (390px), Pixel 4a (412px)

## Key Features to Explore

### 1. Today View
- Time-based greeting (changes morning/afternoon/evening)
- Current phase badge
- Race countdowns with progress bars
- Today's workout (or rest day message)
- This week's discipline overview
- Daily tip carousel

### 2. Week View
- Previous/Next week navigation
- Week statistics (total hours, sessions, rest days)
- 7 daily workout cards with full details
- Color-coded sport types

### 3. Plan View
- 9-week timeline with visual phases
- Phase color coding:
  - Red: Marathon Build (weeks 1-3)
  - Orange: Taper (weeks 4-5)
  - Purple: Recovery (week 6)
  - Blue: 70.3 Build (weeks 7-8)
  - Cyan: Race Week (week 9)
- Click any week to jump to Week View
- Total plan statistics

### 4. Races View
- Marathon Rotterdam (May 10)
  - Target: 2:49:59
  - Detailed 9-split pacing table
  - Per-split nutrition strategy
- Half Ironman 70.3 (June 7)
  - Target: 4:29:00
  - Sport-specific splits
  - Bike nutrition plan

### 5. Log View
- Weekly summary stats
- Expandable workout entries
- RPE selector (1-10 scale)
- Notes textarea for workout reflection
- Visual confirmation on save

## Customization

### Change Today's Date for Testing
In `lib/helpers.ts`, modify `getDaysUntil()`:
```typescript
const today = new Date('2026-05-10') // Test marathon day
```

### Add Your Own Workouts
Edit `lib/trainingData.ts`, add to `trainingPlan`:
```typescript
{
  day: 'Woensdag',
  date: '2026-04-29',
  type: 'run',
  title: 'Your workout title',
  description: 'Your workout description',
  duration: '60 min',
  distance: '12 km',
  intensity: 'moderate',
  paceTarget: '4:00/km',
}
```

### Change Athlete Name
In `lib/trainingData.ts`:
```typescript
export const athleteProfile: AthleteProfile = {
  name: 'Your Name', // Change this
  // ... rest of profile
}
```

Also update greeting in `TodayView.tsx`:
```typescript
const greeting = getGreeting('Your Name')
```

## Build for Production

```bash
# Create optimized build
npm run build

# Test production build
npm start
```

## Deploy to Production

### Option 1: Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Drag & drop 'out' folder to netlify.com
```

### Requirements
- HTTPS enabled (required for PWA)
- Environment variables set (`.env.production`)

## Project Structure at a Glance

```
frontend/
├── app/
│   ├── layout.tsx      ← PWA setup, HTML root
│   ├── page.tsx        ← Main app & tab routing
│   └── globals.css     ← Tailwind & custom styles
├── components/         ← 7 main views + reusables
├── lib/
│   ├── trainingData.ts ← 9-week plan + race data
│   ├── helpers.ts      ← Utility functions
│   └── api.ts          ← Backend API client
├── public/
│   ├── manifest.json   ← PWA manifest
│   ├── sw.js          ← Service worker
│   └── icons/         ← App icons (add your own)
└── config files (next, tailwind, tsconfig, etc.)
```

## Troubleshooting

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001  # Use different port
```

### "Module not found" errors
```bash
rm -rf node_modules
npm install
```

### Styles not showing
```bash
# Rebuild Tailwind cache
rm -rf .next
npm run dev
```

### Service worker not updating
- In DevTools → Application → Service Workers
- Click "Unregister" and reload page

## Development Tips

### Use TypeScript Strict Mode
All components are type-safe. Check errors with:
```bash
npx tsc --noEmit
```

### Hot Reload on Save
Changes auto-reload in browser. No manual refresh needed!

### Debug with Console
Open browser console (F12) to see errors or logs:
```typescript
console.log('Debug info:', data)
```

### Check Generated Types
TypeScript will catch most errors. Look for red squiggly lines in IDE.

## Next Steps

1. **Customize data**: Update training plan in `lib/trainingData.ts`
2. **Add icons**: Replace placeholder icons in `public/icons/`
3. **Connect backend**: Update API calls in `lib/api.ts`
4. **Add Garmin sync**: Implement OAuth in future backend
5. **Deploy**: Follow deployment instructions above

## Documentation

- **README.md** - Full project overview
- **DEVELOPMENT.md** - Architecture & patterns guide
- **This file** - Quick start & testing

## Support

Check files in order:
1. Component file for the view you're working on
2. `lib/helpers.ts` for utility functions
3. `lib/trainingData.ts` for data structure
4. DEVELOPMENT.md for architecture details

---

## Commands Reference

```bash
npm install         # Install dependencies
npm run dev         # Start dev server (http://localhost:3000)
npm run build       # Build for production
npm start           # Run production build
npm run lint        # Check for linting errors (if configured)
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

That's it! You're ready to train. Let's crush those races! 🏃‍♂️🚴‍♂️🏊‍♂️
