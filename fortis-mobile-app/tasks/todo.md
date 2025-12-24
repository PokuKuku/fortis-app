# Profile Page Restructure

## Tasks

- [x] Create settings screen at app/settings.tsx
- [x] Add gear icon to profile header that navigates to settings
- [x] Move WeeklyActivityChart into ProfileHeader card
- [x] Move SettingsSection and App Info to settings screen
- [x] Clean up profile.tsx imports

## Review

### Summary of Changes

Restructured the profile page to have a cleaner layout with a combined profile header card and a separate settings screen.

### New Profile Page Layout

```
┌─────────────────────────────┐
│  Logo              [Gear]   │  ← Settings button top right
├─────────────────────────────┤
│  Profile Header Card        │
│  - Avatar + Name + Email    │
│  ─────────────────────────  │
│  - Weekly Activity Chart    │  ← Now inside same card
├─────────────────────────────┤
│  Stats Overview             │
├─────────────────────────────┤
│  Personal Records           │
└─────────────────────────────┘
```

### New Settings Screen

```
┌─────────────────────────────┐
│  [Back]    Settings         │
├─────────────────────────────┤
│  Preferences                │
│  - Weight Units (tap)       │
│  - Body Type (tap)          │
├─────────────────────────────┤
│  App                        │
│  - Sign Out                 │
├─────────────────────────────┤
│  Fortis v1.0.0              │
└─────────────────────────────┘
```

### Files Created

- `app/settings.tsx` - New settings screen with preferences and sign out

### Files Modified

- `app/(tabs)/profile.tsx` - Added gear icon, removed settings/app sections
- `src/components/profile/ProfileHeader.tsx` - Integrated weekly activity chart
- `src/components/profile/index.ts` - Removed unused exports

### Files No Longer Used (can be deleted)

- `src/components/profile/WeeklyActivityChart.tsx` - Now integrated into ProfileHeader
- `src/components/profile/SettingsSection.tsx` - Moved to settings screen

---

## Previous Work

See bottom of file for previous profile redesign review.

---

# History Page Implementation

## Tasks

- [x] Install react-native-calendars dependency
- [x] Create week streak calculation function
- [x] Create volume heatmap data utilities
- [x] Implement calendar with custom day component
- [x] Update history screen layout with streak badge and calendar
- [x] Add date filtering for workout list
- [x] Style calendar for dark theme
- [x] Test the implementation

## Review

### Summary of Changes

Redesigned the history tab to match the reference design from `WorkoutPage.tsx`. The new implementation features:

1. **Calendar Heatmap**: A full calendar view inside a GlassCard showing workout volume intensity with 4 levels of green shading (20%, 40%, 60%, 80% opacity).

2. **Week Streak Badge**: Displays consecutive weeks with at least one workout, shown with a fire icon in the title bar.

3. **Date Selection**: Tapping a day filters the workout list to show only workouts from that date.

4. **Volume Summary**: When a date has workouts, shows the total volume lifted in a badge.

5. **Empty States**:
   - No workouts ever: Shows trophy icon with "No workouts yet"
   - No workouts on selected date: Shows calendar icon with "No workouts logged on this day"

### Files Modified

1. **`package.json`** - Added `react-native-calendars` dependency
2. **`app/(tabs)/history.tsx`** - Complete rewrite with new features

### Technical Details

- Uses `react-native-calendars` with custom `dayComponent` for heatmap rendering
- Week streak calculated using `date-fns` functions (`startOfWeek`, `subWeeks`)
- Volume aggregated per date using `getWorkoutSummary()` from workoutStore
- Intensity levels based on ratio to max daily volume
- All styling follows the existing design system (Colors, Spacing, BorderRadius, Typography)
- Calendar themed for dark mode with green accents
- Existing Supabase integration preserved - data fetching unchanged

### Supabase Integration

The existing data flow is preserved:
- Local sessions from `useWorkoutStore.completedSessions`
- Remote sessions from `fetchWorkoutHistory()` when authenticated
- Merged and deduplicated by `localId`
- Sync status shown on individual workout cards

---

# Profile Page Redesign

## Tasks

- [x] Create useProfileStats.ts hook
- [x] Create useWeeklyActivity.ts hook
- [x] Create useTopPersonalRecords.ts hook
- [x] Create StatsOverviewCard.tsx component
- [x] Create WeeklyActivityChart.tsx component
- [x] Create PersonalRecordsCard.tsx component
- [x] Create SettingsSection.tsx component
- [x] Create ProfileHeader.tsx with inline editing
- [x] Add uploadAvatar to AuthContext
- [x] Refactor profile.tsx to use new components

## Review

### Summary of Changes

Redesigned the profile page to be more production/beta-ready with volume-focused statistics, activity charts, personal records, and inline profile editing.

### New Profile Page Layout

1. **Profile Header** - Tappable avatar with camera picker, inline editable name, email display
2. **Stats Overview** - 3-column display: Total Volume, Workouts, Training Time
3. **Weekly Activity Chart** - Bar chart showing last 7 days of volume (Victory Native + fallback)
4. **Personal Records** - Top 5 PRs sorted by max weight with trophy icons
5. **Account Settings** - Weight units and body type toggles
6. **App Section** - Sign out button, version info

### Files Created

**Hooks:**
- `src/hooks/useProfileStats.ts` - Calculates total volume, workouts, time, unique exercises
- `src/hooks/useWeeklyActivity.ts` - Returns last 7 days of activity with volume per day
- `src/hooks/useTopPersonalRecords.ts` - Returns top 5 PRs by max weight

**Components:**
- `src/components/profile/ProfileHeader.tsx` - Avatar picker, inline name editing
- `src/components/profile/StatsOverviewCard.tsx` - Volume-focused stats display
- `src/components/profile/WeeklyActivityChart.tsx` - Bar chart with fallback for Expo Go
- `src/components/profile/PersonalRecordsCard.tsx` - Top 5 PRs list
- `src/components/profile/SettingsSection.tsx` - Weight units + body type toggles
- `src/components/profile/index.ts` - Exports all components

### Files Modified

- `src/contexts/AuthContext.tsx` - Added `uploadAvatar()` method for Supabase storage
- `app/(tabs)/profile.tsx` - Refactored to use modular components

### Technical Details

- All hooks use `useMemo` for optimized calculations from `completedSessions`
- WeeklyActivityChart has a simple bars fallback when Victory Native/Skia unavailable
- Avatar upload uses Supabase storage bucket `avatars`
- Inline name editing auto-saves on blur with haptic feedback
- All components follow existing design system (GlassCard, Typography, Colors, Spacing)
- Volume formatting uses K/M suffixes for large numbers
- Time formatting shows hours and minutes
