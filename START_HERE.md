# START HERE - TriPepe PWA Frontend

Welcome to the complete TriPepe triathlon training PWA frontend!

## What You Have

A **production-ready** Next.js PWA with:
- Complete 9-week training plan (all 63 sessions)
- Marathon pacing strategy (May 10, 2026 - Target: 2:49:59)
- 70.3 triathlon race plan (June 7, 2026 - Target: 4:29:00)
- Beautiful dark theme mobile UI
- 5 main navigation views
- Workout logging with RPE tracking
- PWA installability (iOS & Android)
- TypeScript for type safety
- Dutch language UI

## Get Running in 3 Steps

### Step 1: Install
```bash
npm install
```

### Step 2: Run
```bash
npm run dev
```

### Step 3: Open
Visit `http://localhost:3000`

**That's it!** The app is now running with all training data included.

## What to Explore First

1. **Click tabs at bottom** to navigate:
   - Vandaag (Today) - Home screen
   - Week - Current week view
   - Plan - 9-week timeline
   - Races - Marathon & 70.3 info
   - Log - Workout logging

2. **Check out these features:**
   - Time-based Dutch greeting
   - Race countdowns with progress
   - All 63 workouts for 9 weeks
   - Marathon pacing splits
   - 70.3 race strategy
   - Workout RPE tracking

## Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICKSTART.md** | Get started in 60 seconds | 5 min |
| **README.md** | Features & overview | 10 min |
| **DEVELOPMENT.md** | Architecture & code guide | 15 min |
| **PROJECT_SUMMARY.md** | Complete project details | 10 min |
| **FILES_MANIFEST.txt** | List of all files | 5 min |

Start with **QUICKSTART.md** if you're in a hurry.

## Customization

Want to change something? Edit these files:

```
# Athlete name
lib/trainingData.ts → athleteProfile.name

# Training plan
lib/trainingData.ts → trainingPlan array

# Race dates/targets
lib/trainingData.ts → races array

# Colors
tailwind.config.ts → colors section

# UI text
components/* → search for hardcoded strings
```

## Build Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm start         # Run production build
npm run lint      # Check code
```

## Deploy to Production

Recommended: Vercel (0 config needed)

```bash
npm install -g vercel
vercel
```

Or deploy to Netlify, AWS Amplify, or any Node.js host.

**Requirement:** HTTPS enabled for PWA

## Project Stats

- **Components:** 9 (TodayView, WeekView, PlanView, RacesView, LogView, Header, TabNav, WorkoutCard, RaceCountdown)
- **Code Lines:** 2,642 (TypeScript/React/CSS)
- **Training Data:** 9 weeks × 7 days = 63 sessions
- **Documentation:** 4 complete guides
- **Configuration:** 7 setup files

## Key Files

**Most important files to know:**

| File | What It Does |
|------|--------------|
| `lib/trainingData.ts` | All 9 weeks of training + race data |
| `app/page.tsx` | Main app shell & tab routing |
| `components/TodayView.tsx` | Home screen |
| `app/layout.tsx` | PWA setup |

## Technology

- **Framework:** Next.js 14
- **React:** 18.2.0
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Visualization:** Recharts (optional)

## Next Steps

### 1. Immediate (5 min)
- [ ] Run `npm install && npm run dev`
- [ ] Open http://localhost:3000
- [ ] Click through the 5 tabs

### 2. Customize (10 min)
- [ ] Update athlete name in `lib/trainingData.ts`
- [ ] Review training plan
- [ ] Check race dates

### 3. PWA Test (10 min)
- [ ] Open in iPhone Safari
- [ ] Share → Add to Home Screen
- [ ] Open in Android Chrome
- [ ] Menu → Install app

### 4. Deploy (15 min)
- [ ] Run `npm run build` to check for errors
- [ ] Create .env.production with API_URL
- [ ] Deploy to Vercel or Netlify
- [ ] Test PWA on live URL

### 5. Backend (Future)
- [ ] Implement Garmin OAuth in backend
- [ ] Connect API endpoints
- [ ] Add user authentication
- [ ] Persistent workout storage

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Module not found?**
```bash
rm -rf node_modules && npm install
```

**Styles not showing?**
```bash
rm -rf .next && npm run dev
```

## Need Help?

1. **How do I run it?** → QUICKSTART.md
2. **What features exist?** → README.md
3. **How is it structured?** → DEVELOPMENT.md
4. **What files are where?** → FILES_MANIFEST.txt
5. **Project overview?** → PROJECT_SUMMARY.md

## Final Notes

- **No setup required** - Everything is included
- **No backend needed** - Works standalone
- **No additional config** - Just run and go
- **All data included** - Complete 9-week plan ready
- **Production ready** - Deploy immediately

The app shows training data based on today's date. When the date is April 6, 2026, it shows Week 1. The plan automatically progresses through the 9 weeks.

## Let's Go!

```bash
npm install && npm run dev
```

Then open http://localhost:3000

Enjoy your training! 🏃‍♂️🚴‍♂️🏊‍♂️

---

**Created:** April 4, 2026  
**Built for:** Pepe's Marathon (May 10) + 70.3 Triathlon (June 7, 2026)  
**Framework:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
