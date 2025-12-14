# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code Rules

**Workflow:**
1. Think through the problem, read relevant files, and write a plan to `tasks/todo.md`
2. Check in with user to verify the plan before starting
3. Work through todo items, marking complete as you go, with high-level explanations
4. Add a review section to `tasks/todo.md` with a summary when done

**Principles:**
- Make changes as simple as possible - impact only necessary code
- Find root causes for bugs - NO temporary fixes
- When debugging, trace through the ENTIRE code flow step by step - no assumptions
- If a task is unclear, push back to clarify before implementing
- Before implementing ANY UI, run the design system checklist below
- Proactively scan for duplicated UI patterns and suggest component extraction (2+ occurrences)

## Project Overview

Fortis is an offline-first mobile workout tracker built with Expo/React Native. The repository is a monorepo:

- **fortis-mobile-app/**: Main React Native app (Expo SDK 54, React 19.1, React Native 0.81.5, TypeScript)
- **fortis-mobile/fortis-mobile-design/**: UI prototypes built with Vite/React
- **fortis-web/**: Web dashboard designs
- **supabase/**: Database schema, migrations, and seed data
- **free-exercise-db-main/**: Exercise database with JSON files

## Development Commands

```bash
cd fortis-mobile-app

npm start              # Start development server
npm run ios            # Run on iOS simulator (requires native build)
npm run android        # Run on Android emulator (requires native build)
npm run web            # Run on web

npx expo prebuild      # Generate native projects (after dependency changes)
npx expo prebuild --clean  # Clean rebuild
npx pod-install        # Install iOS CocoaPods (after native dependency changes)

# Local Supabase (requires Docker)
supabase start         # Start local Supabase instance
supabase db reset      # Reset and apply migrations
supabase stop          # Stop local instance
```

## Architecture

### Mobile App Structure (fortis-mobile-app/)

```
app/                    # Expo Router file-based routing
├── _layout.tsx         # Root layout (GestureHandler, fonts, Stack)
├── index.tsx           # Splash/landing screen
├── (tabs)/             # Tab navigator group
│   ├── _layout.tsx     # Tab bar + FAB for exercises
│   ├── index.tsx       # Home/workout screen (CANONICAL UI REFERENCE)
│   ├── start.tsx       # Start workout screen
│   ├── exercises.tsx   # Exercise library
│   ├── history.tsx     # Workout history
│   └── profile.tsx     # User profile
├── exercise/
│   └── [id].tsx        # Exercise details screen (dynamic route)
└── workout/
    └── active.tsx      # Active workout logging screen

src/
├── components/
│   ├── ui/             # Base UI primitives
│   ├── shared/         # Cross-feature components
│   └── workout/        # Workout components (ExerciseCard, SetRow, NumberPadModal, modals/)
├── hooks/              # Custom hooks (useElapsedTime, useRestTimerTick, usePersistedOrder)
├── lib/supabase.ts     # Supabase client with SecureStore adapter
├── store/workoutStore.ts  # Zustand state (active session, rest timer, number pad)
├── types/workout.ts    # TypeScript definitions (WorkoutSession, WorkoutSet, SetType)
└── constants/          # Storage keys, config

components/             # Root-level glass morphism components
├── GlassButton.tsx     # Green gradient button (USE FOR ALL GREEN BUTTONS)
├── GlassCard.tsx       # Glass effect card container
└── StainlessSteelPattern.tsx  # Background pattern (USE ON ALL SCREENS)

constants/              # Design system tokens
├── Colors.ts           # Color palette
├── Sizes.ts            # Spacing, border radius, font sizes
└── Typography.ts       # Text styles
```

### Key Dependencies

- **State**: Zustand with AsyncStorage persistence
- **Forms**: react-hook-form with zod validation
- **Animations**: react-native-reanimated
- **Gestures**: react-native-gesture-handler, react-native-draggable-flatlist
- **Icons**: lucide-react-native
- **Date handling**: date-fns

### Key Patterns

- **Offline-first state**: `workoutStore.ts` uses Zustand with AsyncStorage persistence
- **Local ID generation**: Client-side UUID generation for offline-first operations
- **Storage keys**: All AsyncStorage keys in `src/constants/storageKeys.ts`
- **Event emitter**: `DeviceEventEmitter` for cross-component communication
- **Number pad pattern**: Global `activeNumberPad` state in store, single `NumberPadModal` rendered at root

### Backend (Supabase)

Schema in `supabase/schema.sql`: profiles, exercises, workout_programs, workout_sessions, workout_sets, subscriptions

Sessions and sets use `local_id` and `is_synced` fields for offline sync.

Import support for Strong, Hevy apps - see `supabase/IMPORT_GUIDE.md`.

## Environment Setup

Copy `fortis-mobile-app/.env.example` to `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_ENV=development
```

## Design System (MANDATORY)

### Pre-Implementation Checklist

Before implementing ANY UI feature, verify:
- [ ] Using `Colors.ts` constants (NO hardcoded hex/rgba)
- [ ] Using `Spacing` from `Sizes.ts` (NO magic numbers)
- [ ] Using `Typography.ts` style objects (spread entire object)
- [ ] Using `BorderRadius` from `Sizes.ts`
- [ ] Background uses `Colors.background` with `<StainlessSteelPattern>`
- [ ] Checked `app/(tabs)/index.tsx` for similar patterns to reuse
- [ ] Using `GlassButton`/`GlassCard` instead of custom implementations

### Design Tokens

**Colors** (`constants/Colors.ts`):
```tsx
// ✅ ALWAYS use
Colors.background      // #0a0a0a
Colors.textPrimary     // #fafafa
Colors.textSecondary   // #a3a3a3
Colors.success         // #22c55e (THE green - never use #10b981)
Colors.error           // #dc2626
Colors.warning         // #f59e0b
Colors.white           // #ffffff
Colors.black           // #000000

// ❌ NEVER hardcode
'#22c55e', '#ef4444', '#fff', 'rgba(255,255,255,0.08)'
```

**Spacing** (`constants/Sizes.ts`):
```tsx
// ✅ ALWAYS use
Spacing.xs (4), Spacing.sm (8), Spacing.md (12), Spacing.lg (16), Spacing.xl (20)
Spacing['2xl'] (24), Spacing['3xl'] (32), Spacing['4xl'] (40), Spacing['5xl'] (48), Spacing['6xl'] (64)

// ❌ NEVER hardcode
padding: 16, margin: 24, gap: 12
```

**Border Radius** (`constants/Sizes.ts`):
```tsx
// ✅ ALWAYS use
BorderRadius.sm (6), BorderRadius.md (8), BorderRadius.lg (10), BorderRadius.xl (14)
```

**Button/Icon Sizes** (`constants/Sizes.ts`):
```tsx
ButtonHeights.sm (32), ButtonHeights.md (36), ButtonHeights.lg (40), ButtonHeights.xl (48)
IconSizes.xs (12), IconSizes.sm (16), IconSizes.md (20), IconSizes.lg (24), IconSizes.xl (32)
```

**Typography** (`constants/Typography.ts`):
```tsx
// ✅ Spread complete style object
style={{ ...Typography.h2, color: Colors.textPrimary }}

// Available variants: h1-h6, body, bodyLarge, bodySmall, label, labelSmall,
// caption, button, buttonSmall, buttonLarge, number, numberLarge, mono, link

// ❌ NEVER use individual props
fontSize: 16, fontWeight: '600'
```

### Component Patterns

**Screen Structure** (all screens):
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
  <StainlessSteelPattern />
  <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing['2xl'] }}>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

**Green Buttons** (use `GlassButton` - see `app/(tabs)/index.tsx` line ~853):
```tsx
<GlassButton style={{ height: ButtonHeights.md, borderRadius: BorderRadius.md }} onPress={handleAction}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
    <Icon color={Colors.white} size={IconSizes.md} />
    <Text style={{ ...Typography.button, color: Colors.white }}>Button Text</Text>
  </View>
</GlassButton>
```

**Modals** (follow `DeleteConfirmationModal` pattern in `app/(tabs)/index.tsx`):
- Use `StainlessSteelPattern` background
- Pop-in/pop-out animations (spring for scale, timing for opacity)
- Background color `Colors.secondary` or similar dark gray with `overflow: 'hidden'`

### Animation Standards

Use `react-native-reanimated` for all animations. Apply consistent easing for smooth, polished feel.

**Slide-up Modals/Sheets** (bottom sheets, keyboards, action sheets):
```tsx
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';

// Standard durations and easing
entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
```

**Number Pad / Keyboards** (slightly faster enter, slower dismiss):
```tsx
entering={SlideInDown.duration(250).easing(Easing.out(Easing.cubic))}
exiting={SlideOutDown.duration(350).easing(Easing.in(Easing.cubic))}
```

**Pop-in Modals** (centered dialogs):
```tsx
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

// Container fade
entering={FadeIn.duration(200)}
exiting={FadeOut.duration(150)}

// Content zoom
entering={ZoomIn.duration(250)}
exiting={ZoomOut.duration(200)}
```

**Easing Guide**:
- `Easing.out(Easing.cubic)` - Enter animations (starts fast, slows at end)
- `Easing.in(Easing.cubic)` - Exit animations (starts slow, accelerates)
- `Easing.inOut(Easing.cubic)` - Symmetrical animations

**Haptics** (use `expo-haptics` for tactile feedback):
```tsx
import * as Haptics from 'expo-haptics';

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // Button taps
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // Set completion
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);  // Workout complete
```

### Component Extraction

**When to extract** (create reusable component):
- Pattern appears 2+ times across different screens
- Complex styling (5+ style properties or uses LinearGradient)

**Where to place**:
- `src/components/ui/`: Base primitives (Button, Input, Chip)
- `src/components/shared/`: Cross-feature (EmptyState, LoadingSpinner)
- `src/components/[feature]/`: Feature-specific (workout/, exercises/)

**Protocol**: Suggest extraction to user before creating new components.

### Prototype Code Handling

When user provides prototype code:
1. **Preserve logic/behavior** from the prototype
2. **Replace all styling** with current app patterns:
   - Custom buttons → `GlassButton`
   - Hardcoded colors → `Colors.ts`
   - Hardcoded spacing → `Spacing` constants
   - Custom modals → `DeleteConfirmationModal` pattern

**Priority**: Current app design system > Prototype styling
