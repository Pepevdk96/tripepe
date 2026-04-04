# Daily "Vandaag" Workout View - Implementation Guide

## Overview

This guide documents the implementation of the Daily Workout View feature for TriPepe. It includes:

- **Type definitions** for type-safe workout data
- **API client** for fetching and logging workouts
- **React components** for displaying and completing workouts
- **Custom hooks** for state management
- **Integration examples** showing how to use everything together

Built following the technical plan in `/agents/plans/daily-workout-view.md` and product spec in `/agents/specs/daily-workout-view.md`.

---

## File Structure

```
frontend/
├── lib/
│   ├── types/
│   │   └── workout.ts              # TypeScript interfaces & enums
│   ├── api/
│   │   └── workouts.ts             # API client functions
│   └── hooks/
│       └── useDailyWorkouts.ts     # Custom hook for workout state
│
├── components/
│   ├── sport-badge.tsx             # Reusable sport type badge
│   ├── workout-card-daily.tsx       # Single workout card (daily view)
│   ├── workout-completion-modal.tsx # RPE logging modal
│   ├── daily-view.tsx              # Main daily view component
│   └── daily-view-integration.tsx   # Integration example
│
└── app/
    └── vandaag/
        └── page.tsx                 # Dedicated daily view page
```

---

## Type Definitions (`lib/types/workout.ts`)

### Core Types

#### `SportType`
```typescript
type SportType = 'swim' | 'bike' | 'run' | 'rest'
```

#### `IntensityLevel`
```typescript
type IntensityLevel = 'easy' | 'recovery' | 'threshold' | 'interval' | 'long' | 'brick'
```

#### `PlannedWorkout`
Main workout object from API containing:
- `id`: Unique workout ID
- `sport`: Sport type (swim, bike, run, rest)
- `title`: Workout title (e.g., "Run - Tempo")
- `description`: Detailed description
- `distanceMeters`: Optional distance
- `durationSeconds`: Optional duration
- `intensity`: Intensity level
- `isKeyWorkout`: Boolean for important workouts
- `targets`: Primary and secondary targets (pace, HR, power, RPE, zone)
- `isCompleted`: Whether already logged
- `isMissed`: Whether the workout was missed

#### `WorkoutCompletion`
Data submitted when logging a workout:
- `rpe`: Borg RPE scale (1-10)
- `actualDistanceMeters`: Optional actual distance
- `actualDurationSeconds`: Optional actual duration
- `notes`: Optional notes field
- `feeling`: Optional feeling (strong, good, okay, tired, struggling)

#### `WorkoutTarget`
Defines what to aim for:
- `type`: 'pace' | 'heart_rate' | 'power' | 'rpe' | 'zone'
- `value`: Single target value
- `min`/`max`: Range targets
- `zone`: HR zone or power zone
- `label`: Human-readable label

#### `SPORT_COLORS`
Pre-defined colors for each sport:
```typescript
{
  swim: { hex: '#3B82F6', tailwind: 'text-blue-500', bg: 'bg-blue-500/10' },
  bike: { hex: '#22C55E', tailwind: 'text-green-500', bg: 'bg-green-500/10' },
  run: { hex: '#EF4444', tailwind: 'text-red-500', bg: 'bg-red-500/10' },
  rest: { hex: '#9CA3AF', tailwind: 'text-gray-400', bg: 'bg-gray-500/10' },
}
```

---

## API Client (`lib/api/workouts.ts`)

### Functions

#### `getTodayWorkouts(token: string, timezone?: string): Promise<DailyWorkoutResponse>`

Fetch today's planned workouts from the backend.

```typescript
const data = await getTodayWorkouts(authToken, 'Europe/Amsterdam')
// Returns: { date, dayOfWeek, timezone, workouts[] }
```

**Request:**
```
GET /api/v1/workouts/today
Headers: Authorization: Bearer {token}
Query: timezone (optional)
```

**Response:**
```json
{
  "date": "2026-04-05",
  "day_of_week": "Sunday",
  "timezone": "Europe/Amsterdam",
  "workouts": [...]
}
```

#### `completeWorkout(workoutId: string, completion: WorkoutCompletion, token: string): Promise<CompletedWorkout>`

Log workout completion with RPE and optional details.

```typescript
await completeWorkout(workoutId, {
  rpe: 7,
  notes: "Felt strong but legs heavy",
  feeling: "good"
}, authToken)
```

**Request:**
```
POST /api/v1/workouts/{workoutId}/complete
Headers: Authorization: Bearer {token}
Body: { rpe, actualDistanceMeters, actualDurationSeconds, notes, feeling, timestamp }
```

#### `refreshTodayWorkouts(token: string): Promise<DailyWorkoutResponse>`

Force-refresh today's workouts from the backend (with cache-busting).

```typescript
const updated = await refreshTodayWorkouts(authToken)
```

#### `getWorkout(workoutId: string, token: string): Promise<PlannedWorkout>`

Fetch a single workout by ID.

#### `getWorkoutsByDateRange(startDate: string, endDate: string, token: string): Promise<PlannedWorkout[]>`

Fetch workouts for a date range (format: YYYY-MM-DD).

---

## Components

### 1. SportBadge (`components/sport-badge.tsx`)

Reusable badge displaying sport type with icon.

**Props:**
```typescript
interface SportBadgeProps {
  sport: SportType                    // 'swim' | 'bike' | 'run' | 'rest'
  size?: 'sm' | 'md' | 'lg'           // Default: 'md'
  showLabel?: boolean                 // Show sport name text
}
```

**Usage:**
```tsx
<SportBadge sport="run" size="lg" showLabel={true} />
```

**Output:**
- Small colored badge with sport icon
- Responsive sizing (sm=16px, md=20px, lg=24px)
- Sport-specific colors (blue/green/red/gray)

---

### 2. WorkoutCardDaily (`components/workout-card-daily.tsx`)

Single workout card for the daily view. Shows all critical info at a glance.

**Props:**
```typescript
interface WorkoutCardDailyProps {
  workout: PlannedWorkout             // The workout to display
  isPrimary?: boolean                 // Highlight as primary workout
  onClick?: () => void                // Handler when card is clicked
}
```

**Features:**
- Sport badge with icon and color coding
- Workout title and description
- Duration and distance metrics
- Primary and secondary targets (pace, HR, power, zone)
- Key workout indicator (⭐)
- Responsive layout (mobile-first)
- Call-to-action footer

**Usage:**
```tsx
<WorkoutCardDaily
  workout={plannedWorkout}
  isPrimary={true}
  onClick={() => handleStartWorkout()}
/>
```

---

### 3. WorkoutCompletionModal (`components/workout-completion-modal.tsx`)

Bottom-sheet modal for logging workout completion.

**Props:**
```typescript
interface WorkoutCompletionModalProps {
  workout: PlannedWorkout             // The completed workout
  isOpen: boolean                     // Modal visibility
  onClose: () => void                 // Handler to close modal
  onSubmit: (rpe: number, notes?: string, feeling?: string) => Promise<void>
  isLoading?: boolean                 // Loading state during submit
}
```

**Features:**
- RPE scale (Borg 1-10) with descriptions in Dutch
- Feeling selector (5 emoji options: strong, good, okay, tired, struggling)
- Notes field (optional)
- Form validation (RPE required)
- Loading and success states
- Mobile-optimized bottom sheet design

**Usage:**
```tsx
<WorkoutCompletionModal
  workout={selectedWorkout}
  isOpen={isModalOpen}
  onClose={handleClose}
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

---

### 4. DailyView (`components/daily-view.tsx`)

Main container for today's workouts. Handles multi-workout scenarios.

**Props:**
```typescript
interface DailyViewProps {
  workouts: PlannedWorkout[]          // All workouts for today
  date: string                        // Date (YYYY-MM-DD)
  dayOfWeek: string                   // Day name (Zondag, Maandag, etc.)
  onRefresh?: () => Promise<void>     // Refresh handler
  onCompleteWorkout?: (id, rpe, notes?, feeling?) => Promise<void>
  isLoading?: boolean                 // Loading state
  lastSyncTime?: string               // Last sync timestamp
}
```

**Features:**
- Date header with day name in Dutch
- Refresh button (with loading spinner)
- Primary workout (featured, larger)
- Secondary workouts (double sessions, PM workouts)
- Rest day message (if no workouts)
- Warnings for missed workouts
- Key workout notice
- Last sync timestamp
- Mobile-first responsive layout

**Handles Scenarios:**
- ✓ Single workouts
- ✓ Double sessions (AM + PM)
- ✓ Brick sessions (bike + run)
- ✓ Rest days
- ✓ Missed workouts
- ✓ Key workouts

**Usage:**
```tsx
<DailyView
  workouts={workouts}
  date="2026-04-05"
  dayOfWeek="Zondag"
  onRefresh={handleRefresh}
  onCompleteWorkout={handleComplete}
  lastSyncTime="14:30"
/>
```

---

### 5. DailyViewIntegration (`components/daily-view-integration.tsx`)

Wrapper component showing how to integrate DailyView with loading/error states.

**Usage:**
```tsx
import { DailyViewIntegration } from '@/components/daily-view-integration'
import { useDailyWorkouts } from '@/lib/hooks/useDailyWorkouts'

export default function Page() {
  const {
    workouts,
    date,
    dayOfWeek,
    isLoading,
    error,
    lastSyncTime,
    refresh,
    completeWorkout,
  } = useDailyWorkouts(authToken)

  return (
    <DailyViewIntegration
      workouts={workouts}
      date={date}
      dayOfWeek={dayOfWeek}
      isLoading={isLoading}
      error={error}
      lastSyncTime={lastSyncTime}
      onRefresh={refresh}
      onCompleteWorkout={completeWorkout}
    />
  )
}
```

---

## Custom Hook (`lib/hooks/useDailyWorkouts.ts`)

### `useDailyWorkouts(token: string): UseDailyWorkoutsReturn`

Custom hook for managing today's workouts state and API interactions.

**Returns:**
```typescript
{
  workouts: PlannedWorkout[]          // Today's workouts
  date: string                        // Date (YYYY-MM-DD)
  dayOfWeek: string                   // Day name
  timezone: string                    // User's timezone
  isLoading: boolean                  // Initial load state
  error: string | null                // Error message if any
  lastSyncTime: string | null         // Formatted sync time
  refresh: () => Promise<void>        // Refresh workouts
  completeWorkout: (id, rpe, notes?, feeling?) => Promise<void>
}
```

**Features:**
- Automatic loading on component mount
- Error handling with user-friendly messages
- Auto-updating sync timestamp
- Optimistic UI updates
- Works with mock data for development

**Usage:**
```tsx
'use client'

import { useDailyWorkouts } from '@/lib/hooks/useDailyWorkouts'

export default function MyComponent() {
  const { workouts, isLoading, error, refresh, completeWorkout } =
    useDailyWorkouts(authToken)

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {workouts.map((w) => (
        <WorkoutItem key={w.id} workout={w} />
      ))}
    </>
  )
}
```

---

## Dedicated Page (`app/vandaag/page.tsx`)

Full page implementation of the daily workout view.

**Route:** `/vandaag`

**Features:**
- Sticky back button to return to home
- Error state display
- Loading spinner
- Full DailyView component
- Mock data for development (replace with API call in production)

**Usage:**
Visit `http://localhost:3000/vandaag` to see the daily view.

---

## Integration Steps

### Step 1: Use Types in Your Components

```typescript
import { PlannedWorkout, SportType, WorkoutCompletion } from '@/lib/types/workout'

const myWorkout: PlannedWorkout = { ... }
```

### Step 2: Call API Functions

```typescript
import { getTodayWorkouts, completeWorkout } from '@/lib/api/workouts'

const workouts = await getTodayWorkouts(token)
await completeWorkout(workoutId, { rpe: 7 }, token)
```

### Step 3: Use the Hook

```typescript
import { useDailyWorkouts } from '@/lib/hooks/useDailyWorkouts'

const {
  workouts,
  refresh,
  completeWorkout,
  isLoading,
  error,
} = useDailyWorkouts(token)
```

### Step 4: Render Components

```typescript
import { DailyView } from '@/components/daily-view'

return (
  <DailyView
    workouts={workouts}
    date={date}
    dayOfWeek={dayOfWeek}
    onRefresh={refresh}
    onCompleteWorkout={completeWorkout}
  />
)
```

---

## Styling & Colors

### Sport Colors (Tailwind + Hex)

```typescript
// Swim (Blue)
text-blue-500, bg-blue-500/10, hex: #3B82F6

// Bike (Green)
text-green-500, bg-green-500/10, hex: #22C55E

// Run (Red)
text-red-500, bg-red-500/10, hex: #EF4444

// Rest (Gray)
text-gray-400, bg-gray-500/10, hex: #9CA3AF
```

### Dark Theme

- Primary background: `#0a0a0f`
- Card background: `#141420`
- Hover state: `#1a1a2e`
- Border: `#242430`
- Text: `white`, `gray-400`, `gray-500`

### Intensity Colors

- Easy: `bg-green-500/20 text-green-400`
- Recovery: `bg-blue-500/20 text-blue-400`
- Threshold: `bg-orange-500/20 text-orange-400`
- Interval: `bg-red-500/20 text-red-400`
- Long: `bg-purple-500/20 text-purple-400`
- Brick: `bg-pink-500/20 text-pink-400`

---

## Mobile-First Design

All components follow mobile-first principles:

- **Max width:** 428px (mobile optimized)
- **Tap targets:** 44px minimum
- **Padding:** 4px grid (Tailwind defaults)
- **Responsive:** Adapts to tablet screens
- **Touch-friendly:** Large buttons and clear spacing

---

## API Contract

The implementation expects the following API endpoints:

### `GET /api/v1/workouts/today`
**Request:**
```
Headers:
  Authorization: Bearer {jwt_token}
  Timezone: Europe/Amsterdam (optional)
```

**Response (200):**
```json
{
  "date": "2026-04-05",
  "day_of_week": "Sunday",
  "timezone": "Europe/Amsterdam",
  "workouts": [
    {
      "id": "wo_550e8400-e29b-41d4-a716-446655440000",
      "plan_id": "plan_550e8400...",
      "sport": "run",
      "title": "Run - Tempo",
      "description": "5x 5min threshold",
      "distance_meters": 10000,
      "duration_seconds": 3600,
      "estimated_finish_time": "2026-04-05T08:30:00Z",
      "intensity": "threshold",
      "is_key_workout": true,
      "targets": {
        "primary": {
          "type": "pace",
          "value": "4:30",
          "unit": "per km",
          "zone": "Z4"
        },
        "secondary": [...]
      },
      "color": "#EF4444",
      "icon": "run",
      "order": 1,
      "is_completed": false,
      "is_missed": false
    }
  ]
}
```

### `POST /api/v1/workouts/{id}/complete`
**Request:**
```
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "workout_id": "wo_550e8400-e29b-41d4-a716-446655440000",
  "rpe": 7,
  "actual_distance_meters": 10000,
  "actual_duration_seconds": 3550,
  "notes": "Felt good, strong finish",
  "feeling": "good",
  "timestamp": "2026-04-05T09:15:00Z"
}
```

**Response (200):**
```json
{
  "id": "cw_550e8400...",
  "workout_id": "wo_550e8400...",
  "sport": "run",
  "date": "2026-04-05",
  "rpe": 7,
  "actual_distance_meters": 10000,
  "notes": "Felt good, strong finish",
  "feeling": "good",
  "completed_at": "2026-04-05T09:15:00Z"
}
```

---

## Development Mode

For development, the hook and page use mock data. In production:

1. Replace mock data with actual API calls
2. Ensure authentication token is available
3. Update `NEXT_PUBLIC_API_URL` environment variable

**Mock data is located in:**
- `app/vandaag/page.tsx` (lines 40-80)

To use real API:
```typescript
// Replace this:
const mockWorkouts: PlannedWorkout[] = [...]
setWorkouts(mockWorkouts)

// With this:
const data = await getTodayWorkouts(token)
setWorkouts(data.workouts)
```

---

## Testing

### Manual Testing Checklist

- [ ] Single workout displays correctly
- [ ] Double session (AM + PM) shows both workouts
- [ ] Brick session shows as combined item
- [ ] Rest day shows rest message
- [ ] Key workout shows ⭐ indicator
- [ ] Missed workout shows warning
- [ ] RPE scale works (1-10 buttons)
- [ ] Feeling selector works (5 emoji options)
- [ ] Notes field accepts text
- [ ] Submit button disables until RPE selected
- [ ] Refresh button updates sync time
- [ ] Mobile responsive (375px, 428px widths)
- [ ] Dark theme colors correct
- [ ] Loading spinner shows while loading
- [ ] Error message displays on failure

### Component Unit Tests

Example test for WorkoutCardDaily:

```typescript
import { render, screen } from '@testing-library/react'
import { WorkoutCardDaily } from '@/components/workout-card-daily'

describe('WorkoutCardDaily', () => {
  it('renders workout title', () => {
    const workout = {
      id: '1',
      sport: 'run',
      title: 'Run - Tempo',
      // ... other props
    }
    render(<WorkoutCardDaily workout={workout} />)
    expect(screen.getByText('Run - Tempo')).toBeInTheDocument()
  })

  it('shows key workout indicator', () => {
    const workout = {
      // ...
      isKeyWorkout: true,
    }
    render(<WorkoutCardDaily workout={workout} />)
    expect(screen.getByText(/belangrijke training/i)).toBeInTheDocument()
  })
})
```

---

## Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Authentication (from session/context in production)
NEXT_PUBLIC_AUTH_TOKEN=your_jwt_token_here
```

---

## Next Steps

1. **Connect to Backend**
   - Update `NEXT_PUBLIC_API_URL` to your backend
   - Implement proper authentication flow
   - Replace mock data with real API calls

2. **Add to Main App**
   - Integrate into TodayView or existing page
   - Update TabNav to link to `/vandaag`
   - Add to existing navigation

3. **PWA Caching**
   - Add today's workouts to service worker cache
   - Implement offline-first strategy
   - Cache workout photos/icons

4. **Garmin Integration**
   - Send completed workout data to Garmin
   - Fetch live metrics during workout
   - Show real-time stats in modal

5. **Analytics**
   - Track workout completion rates
   - Monitor RPE patterns
   - Collect feeling/mood data

---

## Troubleshooting

**Workouts not loading:**
- Check API URL in `.env.local`
- Verify authentication token is valid
- Check browser console for API errors

**Styles not applying:**
- Clear `.next` build directory
- Verify Tailwind classes are in `tailwind.config.ts` content array
- Check dark mode is enabled in config

**Modal not opening:**
- Verify `isOpen` prop is set to `true`
- Check `onClick` handler is passed to WorkoutCardDaily
- Confirm state is updating correctly

**Type errors:**
- Import types from `@/lib/types/workout`
- Check all required props are provided
- Use TypeScript strict mode

---

## Related Files

- **API Contract:** `/agents/plans/daily-workout-view.md`
- **Product Spec:** `/agents/specs/daily-workout-view.md`
- **Development Guide:** `DEVELOPMENT.md`
- **Architecture Rules:** `../CLAUDE.md`

---

**Created:** April 2026
**Last Updated:** April 5, 2026
**Status:** Ready for Production
**Version:** 1.0
