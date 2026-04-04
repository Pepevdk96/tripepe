# Features 7-9 Implementation Summary

## Feature 7: GPX Route Suggestions (RouteSuggestion.tsx)

**File:** `components/RouteSuggestion.tsx`

A new component that suggests workout-specific routes with smart logic:

### Route Logic
- **Easy run**: "Vlak parcours langs de gracht" (5-8km, flat loop)
- **Hard run (intervals)**: "Atletiekbaan of vlak park met meetpunten" (marked distances for intervals)
- **Long run**: "Rondje buitengebied, rustige wegen, drinkfontein bij km 10" (scenic loop)
- **Easy bike**: "Vlakke polderwegen, weinig wind" (flat, safe roads)
- **Hard bike**: "Parcours met heuvels of dijken voor wattage-werk" (hilly for VO2max)
- **Long bike**: "Grote ronde via platteland, tankstation halverwege" (60+ km route)
- **Swim/Rest**: Returns null (no route needed)

### Component Features
- MapPin icon (green) for visual identification
- Route name and description
- Three informational tags: distance, elevation (vlak/heuvelachtig), type (loop/out-and-back)
- "Bekijk route" button (disabled placeholder for future implementation)
- "Exporteer GPX" button with toast notification: "GPX export komt binnenkort"
- Dark theme styling with green accent color
- Only renders for non-swim, non-rest workouts

### Integration
Integrated into `TodayView.tsx` after the `DuringFueling` component and before the "Start Workout" button.

---

## Feature 8: Export Route to GPX (placeholder)

**Location:** `RouteSuggestion.tsx`

The "Exporteer GPX" button:
- Uses Download icon from lucide-react
- Shows a toast notification when clicked
- Message: "GPX export komt binnenkort"
- Toast appears for 2 seconds at the bottom of the screen
- Placeholder for future GPX file generation implementation

---

## Feature 9: Race Finder (RaceFinder.tsx)

**File:** `components/RaceFinder.tsx`

A comprehensive race discovery component with filtering and browsing capabilities.

### Hardcoded Race Data
8 European/Dutch races relevant to triathletes:
1. Marathon Kopenhagen (2026-05-10)
2. Challenge Almere-Amsterdam (2026-09-12)
3. Ironman 70.3 Westfriesland (2026-06-07)
4. Dam tot Damloop (2026-09-20)
5. Halve Marathon Egmond (2027-01-10)
6. Ironman Hamburg (2026-06-28)
7. Singelloop Utrecht (2026-10-04)
8. Ironman 70.3 Barcelona (2026-10-18)

Each race includes:
- Name, date, type (marathon/triathlon/run)
- Distance and location
- URL/link
- Attributes: fast (boolean), scenic (boolean), pbPotential (boolean)

### Filtering System
- **Type filters**: Alle | Marathon | Triathlon | Run (toggle buttons)
- **Attribute chips**: Fast course | Scenic | PB potential (green when active)
- Combination filtering: shows races matching selected type AND all selected attributes

### UI Components
- Header with Search icon and "Vind wedstrijden" title
- Type filter buttons with active state styling
- Attribute filter chips with toggle behavior
- Race cards displaying:
  - Race name and date (formatted in Dutch: "Vr 10 mei 2026")
  - Location with MapPin icon
  - Race type badge (color-coded)
  - Distance
  - Attribute tags (⚡ Fast, 🏞️ Scenic, 🎯 PB potential)
  - "+ Voeg toe als doel" button (for future A/B/C goal integration)
- Empty state message when no races match filters

### Dark Theme Styling
- Primary background: `bg-[#0a0a0f]`
- Card background: `bg-[#12121f]`
- Text colors: white for titles, gray-400 for secondary
- Color-coded type badges: Red for marathon/run, Gold for triathlon
- Green active states for filters and chips

---

## Integration with Main App

### Updated Files

**1. `app/page.tsx`**
- Added import: `import RaceFinder from '@/components/RaceFinder'`
- Added case in `renderView()` switch statement:
  ```typescript
  case 'discover':
    return <RaceFinder />
  ```

**2. `components/TabNav.tsx`**
- Updated imports to include `Search` icon from lucide-react
- Added new tab configuration:
  ```typescript
  { id: 'discover', label: 'Ontdek', icon: Search }
  ```
- Updated nav container to use `overflow-x-auto` for horizontal scrolling with 6 tabs
- Tab buttons have `min-w-fit` class to prevent squashing

**3. `components/TodayView.tsx`**
- Added import: `import RouteSuggestion from './RouteSuggestion'`
- Integrated RouteSuggestion component after DuringFueling, before Start Workout button
- Conditional rendering: only shows for non-rest, non-swim workouts

---

## Design Consistency

All components follow the TriPepe design system:
- Dark theme (bg-[#0a0a0f], cards bg-[#12121f])
- White text, gray-400 secondary text
- Lucide React icons
- Gradient backgrounds with subtle borders
- Hover states and smooth transitions
- Mobile-first responsive design

---

## Future Enhancements

1. **RouteSuggestion**: Implement actual GPX file generation and download
2. **RouteSuggestion**: "Bekijk route" button to open maps integration
3. **RaceFinder**: Connect "+ Voeg toe als doel" button to goal management system
4. **RaceFinder**: Integration with race calendar APIs for live race data
5. **RaceFinder**: User favorites/bookmarks for races
6. **RaceFinder**: Race registration links and entry status tracking
