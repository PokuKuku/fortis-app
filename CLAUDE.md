# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code Rules

**Workflow:**
1. First think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change as simple as possible - avoid massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity, however, if a task demands a more complex implementation for long-term stability of the project, do the complex implementation.
7. Finally, add a review section to `tasks/todo.md` with a summary of the changes you made and any other relevant information

**Principles:**
- DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
- MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY
- **CRITICAL:** When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
- Before implementing ANY UI, run the design system checklist below
- Proactively scan for duplicated UI patterns and suggest component extraction (2+ occurrences)

## Related Documentation

| File | Description |
|------|-------------|
| `fortis-dashboard-web/CLAUDE.md` | Web dashboard-specific guidance (Next.js, Tailwind) |
| `tasks/todo.md` | Current task planning and progress tracking |
| `tasks/AI_COORDINATION.md` | Multi-session feature coordination (check for active feature work) |
| `BACKEND.md` | Backend architecture, security, AI flow, RLS patterns |
| `supabase/DATABASE_SCHEMA.md` | Complete ERD and table relationships |
| `AGENTS.md` | Repository guidelines for AI agents |

## Project Overview

Fortis is an offline-first mobile workout tracker built with Expo/React Native. Monorepo structure:

- **fortis-mobile-app/**: Main React Native app (Expo SDK 54, React 19.1, RN 0.81.5, TypeScript)
- **fortis-dashboard-web/**: Next.js analytics dashboard (Next.js 16.1, React 19.2, TypeScript, Tailwind CSS 4) - has its own `CLAUDE.md` with web-specific guidance
- **supabase/**: Database schema, migrations, and seed data
- **free-exercise-db-main/**: Exercise database with JSON files

## Development Commands

```bash
# Mobile App (fortis-mobile-app/)
cd fortis-mobile-app
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm start -- --clear   # Clear bundler cache

# Testing
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm test -- ComponentName   # Run specific test file

# EAS Builds (production)
eas build --platform ios --profile preview      # TestFlight build
eas build --platform android --profile preview  # APK for testing
eas submit --platform ios                       # Submit to App Store

# E2E Testing with Maestro (requires maestro CLI: https://maestro.mobile.dev/)
maestro test .maestro/tests/smoke-test.yaml  # Run smoke test
maestro test .maestro/tests/                 # Run all E2E tests
maestro studio                               # Interactive test builder

# Writing Maestro Tests:
# - Place tests in .maestro/tests/*.yaml
# - Use `maestro studio` to record interactions
# - Common commands: tapOn, assertVisible, inputText, scroll, waitForAnimationToEnd
# - Add testID props to components for reliable selectors
# - Example: tapOn: { id: "start-workout-button" }

# Web Dashboard (fortis-dashboard-web/)
cd fortis-dashboard-web
npm run dev            # Start Next.js dev server (http://localhost:3000)
npm run build          # Production build
npm run lint           # ESLint

# Supabase (requires Docker)
supabase start         # Start local instance
supabase db reset      # Reset and apply migrations
supabase functions deploy ai  # Deploy AI edge function

# Remote (production)
supabase db push --dns-resolver https      # Push migrations to remote
supabase db lint --linked --dns-resolver https  # Lint remote schema

# Utility Scripts (from fortis-mobile-app/)
node scripts/seed-exercises-to-supabase.js  # Seed exercise database
node scripts/curate-exercises.js            # Curate exercise selections
node scripts/generate-exercise-sql.js       # Generate SQL for exercises
```

## Quick Reference

| I want to... | Use this |
|--------------|----------|
| Create a green action button | `<GlassButton>` from `components/GlassButton.tsx` |
| Create a card container | `<GlassCard>` from `components/GlassCard.tsx` |
| Show a centered dialog | `<BaseModal>` from `src/components/ui/BaseModal.tsx` |
| Add screen background | `<StainlessSteelPattern />` + `colors.background` |
| Get theme colors | `const { colors, isDark } = useTheme()` |
| Persist state offline | Zustand store with AsyncStorage (see `src/store/`) |
| Navigate between screens | Expo Router: `router.push()`, `router.back()` |
| Add an icon | `react-native-heroicons/outline` or `DumbbellIcon` |
| Make API calls | Supabase client from `src/lib/supabase.ts` |
| Add haptic feedback | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` |
| Animate a component | `react-native-reanimated` with `entering`/`exiting` props |
| Style with spacing | `Spacing.xs/sm/md/lg/xl` from `constants/Sizes.ts` |
| Use typography | Spread `Typography.h1/h2/body` from `constants/Typography.ts` |
| Emit cross-component events | `DeviceEventEmitter.emit('event-name', data)` |
| Track user analytics | PostHog: `usePostHog().capture('event_name', props)` |
| Validate form input | `react-hook-form` + `zod` schema |
| Format dates | `date-fns`: `format()`, `formatDistanceToNow()` |
| Store data offline | `AsyncStorage.getItem/setItem` with JSON parse/stringify |
| Generate UUIDs | `import uuid from 'uuid'; uuid.v4()` |
| Check network status | `@react-native-community/netinfo` |

## Architecture

```
fortis-mobile-app/
├── .maestro/                   # E2E test configuration (Maestro)
│   ├── config.yaml             # App ID, test settings (update appId here)
│   └── tests/                  # E2E test flows (.yaml)
│
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx         # Root layout (fonts, Stack nav)
│   ├── index.tsx           # Splash screen
│   ├── (tabs)/             # Tab navigator
│   │   ├── index.tsx       # Home (CANONICAL UI REFERENCE)
│   │   ├── exercises.tsx   # Exercise library
│   │   ├── history.tsx     # Workout history
│   │   ├── start.tsx       # Start workout screen
│   │   └── profile.tsx     # User profile
│   ├── ai/chat.tsx         # AI chat (fullscreen route)
│   ├── auth/               # Authentication screens (login, signup)
│   ├── onboarding/         # Onboarding flow
│   ├── workout/active.tsx  # Active workout logger
│   ├── exercise/[id].tsx   # Exercise detail
│   ├── workouts/[id].tsx   # Workout detail
│   ├── programs/[id].tsx   # Program detail
│   └── insights/           # Analytics and progress insights
│
├── src/
│   ├── components/         # UI components (ui/, workout/, ai/, hub/, program/)
│   ├── features/           # Feature-specific components (workout/)
│   ├── hooks/              # Custom hooks
│   ├── services/           # Data services (see Services section below)
│   ├── store/              # Zustand stores (workoutStore, programsStore, aiStore)
│   ├── types/              # TypeScript definitions (exercise, program, workout, ai)
│   ├── constants/          # Storage keys, exerciseOptions
│   ├── contexts/           # React contexts (ThemeContext, DragDropContext)
│   └── lib/                # Supabase client
│
├── components/             # Root-level glass morphism components (SHARED UI)
│   ├── GlassButton.tsx     # Green gradient button (USE FOR ALL GREEN BUTTONS)
│   ├── GlassCard.tsx       # Glass effect card
│   └── StainlessSteelPattern.tsx  # Background pattern (USE ON ALL SCREENS)
│
├── scripts/                # Data seeding and utility scripts
│   ├── seed-exercises-to-supabase.js
│   ├── curate-exercises.js
│   └── generate-exercise-sql.js
│
└── constants/              # Design tokens
    ├── Colors.ts, Sizes.ts, Typography.ts
```

**Note:** There are TWO `components/` directories:
- `fortis-mobile-app/components/` - Root-level shared glass morphism components
- `fortis-mobile-app/src/components/` - Feature-specific components (ui/, workout/, ai/, hub/, program/)

**Key Dependencies:** Zustand + AsyncStorage (state/persistence), react-hook-form + zod (forms), react-native-reanimated + react-native-gesture-handler (animations/gestures), react-native-heroicons/outline (icons), date-fns (dates), victory-native (charts), react-native-calendars, posthog-react-native (analytics), @supabase/supabase-js (backend)

**TypeScript Path Alias:** Use `@/` prefix for imports from project root (e.g., `@/src/components/ui/BaseModal`)

**Icons:** Use `react-native-heroicons/outline` for all icons. Props: `size`, `color`, `strokeWidth` (2-2.5 for visibility). Custom: `DumbbellIcon` in `src/components/icons/`.

**Font:** `fontFamily: 'BankGothicMediumBT'` - loaded in `app/_layout.tsx`

**React 19 Note:** Uses React 19 with automatic batching. No special handling needed for most cases.

## State Management

**Zustand + AsyncStorage** for offline-first persistence:

- **workoutStore**: Active session, sets, rest timer, number pad state
- **programsStore**: Programs/templates, CRUD operations
- **aiStore**: Conversation, pending mutations, image attachments
- **programProgressStore**: Program completion tracking, progress per program
- **startPresetStore**: Workout start presets, default exercise selections

**Key Patterns:**
- Offline-first: All stores persist to AsyncStorage
- Local ID generation: Client-side UUIDs for offline sessions
- Event emitter: `DeviceEventEmitter` for cross-component communication
  - Events: `workout-updated`, `customExerciseUpsert`, `exerciseDetailVisible`, `openEditExercise`

**Offline Sync Pattern:**
```typescript
// Generate local ID on client
const localId = uuid.v4();
await AsyncStorage.setItem(key, JSON.stringify({ ...data, local_id: localId, is_synced: false }));

// Sync to Supabase when online
const { data: synced } = await supabase.from('table').upsert(
  { ...localData, user_id: userId },
  { onConflict: 'user_id,local_id' }
);
await AsyncStorage.setItem(key, JSON.stringify({ ...synced, is_synced: true }));
```

## Services (`src/services/`)

- **exerciseService.ts**: Exercise CRUD, search, filtering, custom exercises
- **programProgressService.ts**: Track program completion and progress
- **programSyncService.ts**: Sync programs between local storage and Supabase
- **workoutHistoryService.ts**: Past workout queries, volume calculations
- **aiService.ts**: AI chat integration with Supabase edge function
- **stickyNotesService.ts**: Notes attached to exercises/workouts
- **exerciseDbClient.ts**: External exercise database API client
- **analyticsService.ts**: PostHog/Mixpanel event tracking abstraction
- **insightsService.ts**: Analytics data queries for insights page
- **insightChartsService.ts**: Chart data generation for insights visualizations

## Backend (Supabase)

See `BACKEND.md` for detailed backend architecture, RLS patterns, and security documentation.

**Key Tables** (see `supabase/DATABASE_SCHEMA.md` for full ERD):
- `profiles` - User accounts
- `exercises` - Exercise library
- `workout_programs` - Program templates
- `workout_sessions` - Active workouts
- `workout_sets` - Individual sets
- `ai_conversations` - AI chat history

**Analytics Views** (for dashboard):
- `user_workout_stats` - Overall user statistics
- `exercise_personal_records` - PRs and estimated 1RMs
- `weekly_workout_volume` - Volume tracking by week
- `muscle_group_frequency` - Training frequency per muscle group

**Migrations** (`supabase/migrations/`):
- Naming: `NNN_description.sql` (e.g., `000_initial_schema.sql`)
- Run `ls supabase/migrations/` to see all migrations

**AI Edge Function** (`supabase/functions/ai/index.ts`):
```bash
supabase functions deploy ai
supabase secrets set ANTHROPIC_API_KEY=<key>
```

**Environment:** Copy `.env.example` to `.env.local` with Supabase URL/key.

## Design System (MANDATORY)

### Pre-Implementation Checklist

Before implementing ANY UI:
- [ ] **Theming:** Using `useTheme()` hook for dynamic colors (NOT static `Colors.textPrimary`)
- [ ] **Theming:** Glass effects use `isDark` conditional (see quick reference table below)
- [ ] **Theming:** Created `themedStyles` object for theme-dependent values
- [ ] Using `Spacing` from `Sizes.ts` (NO magic numbers)
- [ ] Using `Typography.ts` style objects
- [ ] Background uses `colors.background` + `<StainlessSteelPattern>`
- [ ] Checked `app/(tabs)/index.tsx` for similar patterns
- [ ] Using `GlassButton`/`GlassCard` instead of custom implementations
- [ ] Using `BaseModal` for all centered dialog modals

### Design Tokens

**Colors** - Two ways to access:

```tsx
// 1. DYNAMIC (theme-aware) - USE THIS FOR TEXT/BACKGROUNDS
import { useTheme } from '@/src/contexts/ThemeContext';
const { colors } = useTheme();
colors.textPrimary    // #fafafa (dark) OR #1A1A1A (light)
colors.textSecondary  // adapts to theme
colors.background     // adapts to theme

// 2. STATIC (backward compat) - USE ONLY FOR SEMANTIC COLORS
import { Colors } from '@/constants/Colors';
Colors.success        // #22c55e (THE green) - same in both themes
Colors.error          // #dc2626 - same in both themes
Colors.warning        // #f59e0b - same in both themes
```

**Spacing** (`constants/Sizes.ts`):
```tsx
Spacing.xs (4), Spacing.sm (8), Spacing.md (12), Spacing.lg (16), Spacing.xl (20)
Spacing['2xl'] (24), Spacing['3xl'] (32), Spacing['4xl'] (40)
```

**Border Radius:** `BorderRadius.sm (6), .md (8), .lg (10), .xl (14), ['2xl'] (16)`

**Typography:** Spread complete style objects: `style={{ ...Typography.h2, color: colors.textPrimary }}`

### Component Patterns

**Screen Structure:**
```tsx
const { colors } = useTheme();

<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  <StainlessSteelPattern />
  <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing['2xl'] }}>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

**Green Buttons:** Use `GlassButton`:
```tsx
<GlassButton style={{ height: 40, borderRadius: BorderRadius.md }} onPress={handleAction}>
  <Text style={{ ...Typography.button, color: Colors.white }}>Button Text</Text>
</GlassButton>
```

### BaseModal

All centered dialog modals use `BaseModal` from `src/components/ui/BaseModal.tsx`:

```tsx
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';

<BaseModal visible={visible} onClose={onClose} title="Finish Workout?">
  <Text style={modalStyles.message}>Are you sure?</Text>
  <View style={modalStyles.actions}>
    <Pressable style={modalStyles.cancelButton} onPress={onClose}>
      <Text style={modalStyles.cancelButtonText}>Cancel</Text>
    </Pressable>
    <Pressable style={modalStyles.successButton} onPress={onConfirm}>
      <Text style={modalStyles.successButtonText}>Confirm</Text>
    </Pressable>
  </View>
</BaseModal>
```

**Props:** `visible`, `onClose`, `title`, `icon?`, `showCloseButton?`, `width?`

**Button styles:** `cancelButton`, `successButton`, `warningButton`, `errorButton`

### Glass Effect RGBA Values (Light/Dark Mode)

All glass morphism effects must adapt to theme. Use `isDark` from `useTheme()`:

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Glass background (normal) | `rgba(255,255,255, 0.08)` | `rgba(0,0,0, 0.04)` |
| Glass background (elevated) | `rgba(255,255,255, 0.12)` | `rgba(0,0,0, 0.06)` |
| Border (normal) | `rgba(255,255,255, 0.1)` | `rgba(0,0,0, 0.08)` |
| Solid modal background | `#222222` | `#FFFFFF` |

**themedStyles Pattern** (required for all theme-dependent components):

```tsx
const { colors, isDark } = useTheme();

const themedStyles = {
  container: { backgroundColor: colors.background },
  card: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  },
};
```

### Animation Standards

Use `react-native-reanimated`:

**Slide-up modals:**
```tsx
entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
```

**Pop-in modals:**
```tsx
entering={ZoomIn.duration(250)}
exiting={ZoomOut.duration(200)}
```

**Haptics:**
```tsx
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // Button taps
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // Set completion
```

### Component Extraction

**When to extract:** Pattern appears 2+ times OR complex styling (5+ properties)

**Where to place:**
- `src/components/ui/`: Base primitives
- `src/components/shared/`: Cross-feature
- `src/components/[feature]/`: Feature-specific

## AI Chat Feature

The app includes an AI-powered workout assistant. See `tasks/AI_COORDINATION.md` for detailed architecture.

**Key Files:**
- `app/ai/chat.tsx` - Chat screen route
- `src/store/aiStore.ts` - Conversation state, mutation handling
- `src/services/aiService.ts` - API calls to edge function
- `src/types/ai.ts` - TypeScript types and intent config
- `supabase/functions/ai/index.ts` - Edge function (Claude integration)

**Current Intents:** `CREATE_PROGRAM` (full program), `CREATE_TEMPLATE` (single workout)

**Flow:** User message → aiStore → aiService → Supabase edge function → Claude → mutation preview → user confirms → applied to database

**Adding a New AI Intent:**
1. Add to `AIIntent` union in `src/types/ai.ts`
2. Add to `INTENT_CONFIG` in `src/types/ai.ts`
3. Update `ACTION_TYPE_BY_INTENT` in `src/services/aiService.ts`
4. Add intent handling in `supabase/functions/ai/index.ts`
5. Update intent inference in `app/ai/chat.tsx`

## Analytics (PostHog)

Track user events for product analytics:

```tsx
import { usePostHog } from 'posthog-react-native';

const posthog = usePostHog();
posthog.capture('workout_completed', {
  duration_seconds: 3600,
  exercise_count: 8,
  total_sets: 24,
});
```

**Event naming:** Use `snake_case` with clear action verbs (e.g., `workout_started`, `exercise_added`, `program_created`).

## Troubleshooting

```bash
# Metro bundler won't start
npm start -- --clear

# "Unable to resolve module"
rm -rf node_modules && npm install && npm start

# App crashes on launch
# - Use Expo Go app (not Dev Client) for testing
# - Check terminal for error messages
# - Shake device → Reload for full refresh

# Debug menu
# iOS: Cmd + D (Simulator) or Shake device
# Android: Cmd + M (Emulator) or Shake device
```

## Git Conventions

- Commit messages: short, imperative verbs in sentence case
- Examples: "Add workout history", "Fix missing SVG paths", "Refactor auth UI"

## Key Debugging Patterns

**Active Workout Flow:**
```
app/(tabs)/start.tsx → router.push('/workout/active') → workoutStore.startWorkout()
                                                      → activeSession state
                                                      → ExerciseCard/SetRow components
```

**Template Creation Flow:**
```
Kebab menu → /workout/create?mode=template → workoutStore.initEditorSession()
                                           → editorSession state
                                           → saveEditorAsTemplate() → programsStore
```

**Offline Sync Flow:**
```
Local change → AsyncStorage (local_id, is_synced=false)
Online detected → supabase.upsert({ onConflict: 'user_id,local_id' })
Success → AsyncStorage (is_synced=true)
```
