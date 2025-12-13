# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fortis is an offline-first mobile workout tracker built with Expo/React Native. The repository is a monorepo containing:

- **fortis-mobile-app/**: Main React Native app (Expo SDK 54, React 19, TypeScript)
- **fortis-mobile/fortis-mobile-design/**: UI prototypes built with Vite/React
- **fortis-web/**: Web dashboard designs
- **supabase/**: Database schema, migrations, and seed data
- **free-exercise-db-main/**: Exercise database with JSON files

## Development Commands

```bash
# Navigate to mobile app
cd fortis-mobile-app

# Start development server
npm start

# Run on iOS simulator (requires native build)
npm run ios

# Run on Android emulator (requires native build)
npm run android

# Run on web
npm run web
```

## Architecture

### Mobile App Structure (fortis-mobile-app/)

```
app/                    # Expo Router file-based routing
├── _layout.tsx         # Root layout (GestureHandler, fonts, Stack)
├── index.tsx           # Splash/landing screen
├── (tabs)/             # Tab navigator group
│   ├── _layout.tsx     # Tab bar + FAB for exercises
│   ├── index.tsx       # Home/workout screen
│   ├── exercises.tsx   # Exercise library
│   ├── history.tsx     # Workout history
│   ├── profile.tsx     # User profile
│   └── start.tsx       # Start workout
├── auth/               # Auth screens (planned)
├── workout/            # Active workout flow (planned)
└── exercises/          # Exercise details (planned)

src/
├── components/
│   ├── DraggableGrid.tsx  # Drag-and-drop grid using react-native-draggable-flatlist
│   ├── shared/         # Shared components
│   ├── ui/             # Base UI components
│   └── workout/        # Workout-specific components
├── features/           # Feature modules (auth, workout, exercises, analytics, programs, settings)
├── hooks/              # Custom hooks (usePersistedOrder)
├── lib/
│   └── supabase.ts     # Supabase client with SecureStore adapter
├── store/              # Zustand state management
├── types/              # TypeScript definitions
└── constants/          # Storage keys, config

components/             # Root-level splash/landing components
├── AnimatedLogo.tsx
├── GlassButton.tsx
├── GlassCard.tsx
└── StainlessSteelPattern.tsx

constants/              # Design system
├── Colors.ts           # Dark theme color palette
├── Sizes.ts            # Spacing, font sizes
└── Typography.ts       # Text styles

ios/                    # Native iOS project (Expo prebuild)
android/                # Native Android project (Expo prebuild)
```

### Key Dependencies

- **expo-router**: File-based navigation
- **zustand**: State management
- **react-hook-form + zod**: Form handling and validation
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Gestures and drag-drop
- **react-native-draggable-flatlist**: Draggable lists
- **@supabase/supabase-js**: Backend client
- **expo-secure-store**: Secure token storage
- **lucide-react-native**: Icons

### Backend (Supabase)

Database schema in `supabase/schema.sql` includes:
- **profiles**: User profiles extending Supabase Auth
- **exercises**: Exercise library (default + custom)
- **workout_programs**: Training programs with program_workouts and program_exercises
- **workout_sessions**: User workout logs
- **workout_sets**: Individual sets with weight, reps, RPE tracking
- **subscriptions**: Stripe subscription tracking

Views for analytics: `user_workout_stats`, `exercise_personal_records`, `weekly_workout_volume`, `muscle_group_frequency`

### Offline-First Design

Sessions and sets use `local_id` and `is_synced` fields for offline sync. The app generates UUIDs locally and syncs via upsert when online.

## Environment Setup

Copy `fortis-mobile-app/.env.example` to `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_ENV=development
```

## Design System

The app uses a dark theme extracted from Figma prototypes:
- Background: `#0a0a0a`
- Foreground: `#fafafa`
- See `constants/Colors.ts` for full palette including semantic colors for RPE, muscle groups, and status

Custom font: BankGothic (loaded in `app/_layout.tsx`)

## Key Patterns

- **Tab layout with FAB**: `app/(tabs)/_layout.tsx` includes a floating action button for exercises tab with action sheet
- **Persisted order**: `usePersistedOrder` hook for saving drag-drop order to AsyncStorage
- **Event emitter**: `DeviceEventEmitter` used for cross-component communication (e.g., modal visibility)
- **Supabase client**: Uses platform-specific storage (SecureStore on native, AsyncStorage on web) in `src/lib/supabase.ts`
- **Offline-first state**: `workoutStore.ts` uses Zustand with AsyncStorage persistence and `subscribeWithSelector` middleware
- **Local ID generation**: Client-side UUID generation for offline-first operations before syncing to Supabase
- **Storage keys**: All AsyncStorage keys centralized in `src/constants/storageKeys.ts`

## State Management (Zustand)

The app uses Zustand for centralized state management:

- **workoutStore.ts**: Core workout state including active sessions, exercises, sets, and rest timer
  - Persists to AsyncStorage on every state change
  - Rehydrates on app launch (`loadActiveSession`)
  - Uses `local_id` fields for offline-first sync
  - Auto-starts rest timer when sets are completed
  - Supports workout templates from programs

## Native Features

- **New Architecture**: Expo SDK 54 with React Native new architecture enabled (`newArchEnabled: true`)
- **Haptics**: Uses `expo-haptics` for tactile feedback
- **SecureStore**: Auth tokens stored securely on native, AsyncStorage fallback on web
- **Animations**: `react-native-reanimated` for performant animations
- **Edge-to-edge**: Android uses `edgeToEdgeEnabled` for modern UI

## Testing & Building

No test suite currently configured. To build native apps:

```bash
# Generate native projects (only needed after dependency changes)
cd fortis-mobile-app
npx expo prebuild

# Clean rebuild (if needed)
npx expo prebuild --clean
```

## UI/UX Consistency

### Pre-Implementation Checklist
Before implementing ANY UI feature, verify:
- [ ] Using `Colors.ts` constants (NO hardcoded hex/rgba values like `#22c55e`, `rgba(255,255,255,0.08)`)
- [ ] Using `Spacing` from `Sizes.ts` (NO magic numbers like 8, 12, 16, 24)
- [ ] Using `Typography.ts` style objects (spread entire object for font, size, weight)
- [ ] Using `BorderRadius` from `Sizes.ts` (NO hardcoded 6, 8, 10, 16)
- [ ] Background uses `#0a0a0a` with `<StainlessSteelPattern>` component
- [ ] Is this pattern duplicated elsewhere? Should it be a component?

### Design System Enforcement

**Colors** (`constants/Colors.ts`):
- Background: `Colors.background` (#0a0a0a)
- Text: `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textTertiary`
- Success/Error/Warning: `Colors.success`, `Colors.error`, `Colors.warning`
- Semantic: `Colors.rpe.low/medium/high`, `Colors.muscle.chest/back/etc`
- ❌ NEVER: `#22c55e`, `#ef4444`, `#fff`, `rgba(255,255,255,0.08)`
- ✅ ALWAYS: Import and use `Colors` object

**Spacing** (`constants/Sizes.ts`):
- Scale: `Spacing.xs`, `Spacing.sm`, `Spacing.md`, `Spacing.lg`, `Spacing.xl`, `Spacing['2xl']`, etc.
- ❌ NEVER: `padding: 16`, `margin: 24`, `gap: 12`
- ✅ ALWAYS: `padding: Spacing.lg`, `margin: Spacing['2xl']`, `gap: Spacing.md`

**Typography** (`constants/Typography.ts`):
- Use: `...Typography.h1`, `...Typography.body`, `...Typography.label`
- ❌ NEVER: `fontSize: 16`, `fontWeight: '600'`, individual style props
- ✅ ALWAYS: Spread complete style object: `style={{ ...Typography.h2 }}`

**Border Radius** (`constants/Sizes.ts`):
- Use: `BorderRadius.sm`, `BorderRadius.md`, `BorderRadius.lg`, `BorderRadius.xl`
- ❌ NEVER: `borderRadius: 6`, `borderRadius: 16`
- ✅ ALWAYS: `borderRadius: BorderRadius.lg`

### Glass Morphism Pattern

**When to use**: Cards, buttons, modals, overlays

**How to implement**:
1. **Prefer existing components**: Use `<GlassCard>` or `<GlassButton>` from `components/`
2. **For custom glass effects**: Layer structure = base background → fog gradient (LinearGradient) → content
3. **Reference**: See `components/GlassCard.tsx` for the multi-layer pattern

**Example**:
```tsx
// ✅ Good - Use existing component
<GlassCard padding={Spacing.lg}>
  <Text style={{ ...Typography.h3, color: Colors.textPrimary }}>Content</Text>
</GlassCard>

// ❌ Bad - Inline glass styling
<View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
```

### Component Extraction Rules

**When to extract** (create a reusable component):
- Pattern appears **2+ times** across different screens
- Complex styling (5+ style properties or uses LinearGradient)
- Reusable interaction pattern (chip selection, toggle, badge)
- Any repeated UI element (buttons, inputs, cards, chips)

**Where to put components**:
- `src/components/ui/`: Base UI primitives (Button, Input, Chip, Badge, Avatar)
- `src/components/shared/`: Cross-feature components (EmptyState, LoadingSpinner, ErrorBoundary)
- `src/components/[feature]/`: Feature-specific (workout/, exercises/, history/)

**Extraction protocol**:
1. Identify duplicate pattern while implementing
2. **Proactively suggest**: "I noticed this chip/button/card pattern appears in [file1] and [file2]. Should I extract it to `src/components/ui/Chip.tsx` for consistency?"
3. Wait for user approval before extracting
4. If obvious duplication (3+ occurrences), suggest strongly

**Component composition principles**:
- Small, focused components (single responsibility)
- Flexible props (style, onPress, children, variant)
- Use design system tokens internally
- Export from index.ts for clean imports

### Proactive Suggestions Protocol

**While implementing UI, actively check for**:
1. **Hardcoded colors**: Scan code for hex/rgba → suggest Colors.ts replacement
2. **Hardcoded spacing**: Scan for magic numbers → suggest Spacing constants
3. **Duplicated styling**: Compare with existing screens → suggest component extraction
4. **Missing glass effect**: If card/button/modal → suggest GlassCard/GlassButton
5. **Background inconsistency**: If new screen → ensure StainlessSteelPattern is used

**Suggestion phrasing examples**:
- "I noticed you're using `#22c55e` - this should use `Colors.success` from the design system for consistency."
- "This chip styling is similar to the chips in `app/(tabs)/_layout.tsx`. Should I extract a reusable `<Chip>` component to `src/components/ui/Chip.tsx`?"
- "This card has custom glass styling. We have a `<GlassCard>` component that provides this effect. Should I use that instead?"

**Balance**:
- Auto-fix obvious issues: hardcoded colors → design system tokens
- Suggest for architectural decisions: component extraction, new patterns
- Ask user before creating new components or major refactors

### Common Anti-Patterns

**❌ Hardcoded colors**:
```tsx
color: '#22c55e'
backgroundColor: 'rgba(255,255,255,0.08)'
borderColor: '#ef4444'
```
**✅ Design system**:
```tsx
color: Colors.success
backgroundColor: Colors.card
borderColor: Colors.error
```

**❌ Hardcoded spacing**:
```tsx
padding: 16
margin: 24
gap: 12
```
**✅ Design system**:
```tsx
padding: Spacing.lg
margin: Spacing['2xl']
gap: Spacing.md
```

**❌ Inline typography**:
```tsx
fontSize: 16, fontWeight: '600', color: '#fff'
```
**✅ Design system**:
```tsx
{ ...Typography.body, color: Colors.textPrimary }
```

**❌ Duplicated chip component**:
```tsx
// In screen A
<TouchableOpacity style={{ borderRadius: 999, paddingHorizontal: 14, ... }}>

// In screen B
<TouchableOpacity style={{ borderRadius: 999, paddingHorizontal: 14, ... }}>
```
**✅ Extracted component**:
```tsx
// src/components/ui/Chip.tsx created
<Chip label="Primary Muscle" selected={isPrimary} onPress={...} />
```

**❌ Custom glass implementation**:
```tsx
<View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
  <LinearGradient colors={[...]} />
  {children}
</View>
```
**✅ Use existing component**:
```tsx
<GlassCard>{children}</GlassCard>
```

### Background Pattern Requirements

**All screens MUST use**:
1. Background color: `Colors.background` (#0a0a0a)
2. Background component: `<StainlessSteelPattern>` with `StyleSheet.absoluteFillObject`
3. Content layered on top with proper zIndex

**Example screen structure**:
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
  <StainlessSteelPattern />
  <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing['2xl'] }}>
    {/* Screen content */}
  </ScrollView>
</SafeAreaView>
```

Claude Code Rules:
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY
10. Before implementing ANY UI, run the UI/UX Consistency pre-implementation checklist
11. Proactively scan for duplicated UI patterns and suggest component extraction (2+ occurrences)
12. Auto-suggest design system usage when spotting hardcoded colors, spacing, or typography


CRITICAL: When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
- If I haven't gone into plan mode, and I give you a task that's not completely clear and simple, and you don't quite know which files to search or what to do, push back on me to clarify what exactly you need to do. Don't push back just for the sake of pushing back, but push back to verify what needs to be done so it can be implemented properly.