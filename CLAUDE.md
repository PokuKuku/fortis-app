# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Related Documentation

| File | Description |
|------|-------------|
| `fortis-dashboard-web/CLAUDE.md` | Web dashboard-specific guidance (Next.js, Tailwind) |
| `tasks/todo.md` | Current task planning and progress tracking |
| `tasks/AI_COORDINATION.md` | Multi-session feature coordination (check for active feature work) |
| `BACKEND.md` | Backend architecture, security, AI flow, RLS patterns |
| `supabase/DATABASE_SCHEMA.md` | Complete ERD and table relationships |
| `AGENTS.md` | Repository guidelines for AI agents |

## Claude Code Rules

**Workflow:**
1. First think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change as simple as possible - avoid massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity, however, if a task demands a more complex implementation for long-term stability of the project, do the complex implementation.
7. Finally, add a review section to `tasks/todo.md` with a summary of the changes you made and any other relevant information

**Task Files & Scripts:**
- `tasks/todo.md` - Current task planning and progress tracking
- `tasks/AI_COORDINATION.md` - Multi-session feature coordination (check for active feature work)
- `scripts/` - Data seeding and utility scripts (seed exercises, generate SQL, etc.)

**Principles:**
- DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
- MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY
- **CRITICAL:** When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
- Before implementing ANY UI, run the design system checklist below
- Proactively scan for duplicated UI patterns and suggest component extraction (2+ occurrences)

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
│   └── programs/[id].tsx   # Program detail
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
└── constants/              # Design tokens
    ├── Colors.ts, Sizes.ts, Typography.ts
```

**Note:** There are TWO `components/` directories:
- `fortis-mobile-app/components/` - Root-level shared glass morphism components
- `fortis-mobile-app/src/components/` - Feature-specific components (ui/, workout/, ai/, hub/, program/)

**Key Dependencies:** Zustand + AsyncStorage, react-hook-form + zod, react-native-reanimated, react-native-gesture-handler, react-native-heroicons/outline, date-fns, victory-native (charts), react-native-calendars, lucide-react-native, posthog-react-native (analytics)

**TypeScript Path Alias:** Use `@/` prefix for imports from project root (e.g., `@/src/components/ui/BaseModal`)

**Icons:** Use `react-native-heroicons/outline` for all icons. Props: `size`, `color`, `strokeWidth` (2-2.5 for visibility). Custom: `DumbbellIcon` in `src/components/icons/`.

**Font:** `fontFamily: 'BankGothicMediumBT'` - loaded in `app/_layout.tsx`

## State Management

**Zustand + AsyncStorage** for offline-first persistence:

- **workoutStore**: Active session, sets, rest timer, number pad state
- **programsStore**: Programs/templates, CRUD operations
- **aiStore**: Conversation, pending mutations, image attachments

**Key Patterns:**
- Offline-first: All stores persist to AsyncStorage
- Local ID generation: Client-side UUIDs for offline sessions
- Event emitter: `DeviceEventEmitter` for cross-component communication
  - Events: `workout-updated`, `customExerciseUpsert`, `exerciseDetailVisible`, `openEditExercise`

## Services (`src/services/`)

- **exerciseService.ts**: Exercise CRUD, search, filtering, custom exercises
- **programProgressService.ts**: Track program completion and progress
- **programSyncService.ts**: Sync programs between local storage and Supabase
- **workoutHistoryService.ts**: Past workout queries, volume calculations
- **aiService.ts**: AI chat integration with Supabase edge function
- **stickyNotesService.ts**: Notes attached to exercises/workouts
- **exerciseDbClient.ts**: External exercise database API client

## Backend (Supabase)

**Key Tables** (see `supabase/schema.sql`):
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

**Offline-First Pattern:**
- `local_id` (client UUID) + `is_synced` boolean
- Persists to AsyncStorage immediately
- Syncs to Supabase when online

**Migrations** (`supabase/migrations/`):
- Naming: `NNN_description.sql` (e.g., `000_initial_schema.sql`)
- Run `ls supabase/migrations/` to see all migrations
- Each migration is idempotent and can be re-run safely

**Adding New User Tables:**
- Enable RLS + FORCE
- Add SELECT/INSERT/UPDATE/DELETE policies with USING and WITH CHECK
- Add ownership columns (`user_id` or `created_by`)
- Add indexes on `user_id + created_at` for common access patterns

**AI Edge Function** (`supabase/functions/ai/index.ts`):
- Rate limiting via `ai_rate_limits` table
- Claude 3.5 Sonnet via Anthropic API
- Image support (base64-encoded)

```bash
supabase functions deploy ai
supabase secrets set ANTHROPIC_API_KEY=<key>
```

**Adding New AI Mutation Types:**
- Update allowlists in `supabase/functions/ai/index.ts`
- Update `ACTION_TYPE_BY_INTENT` and `LOGGABLE_ENTITY_TYPES` in `src/services/aiService.ts`
- Update CHECK constraints on `ai_pending_actions` and `ai_mutations` tables if needed

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

### Fullscreen Bottom Sheet Routes

For AI chat, workout logger - use Expo Router navigation:

```tsx
// In app/_layout.tsx
<Stack.Screen
  name="feature/screen"
  options={{
    animation: 'slide_from_bottom',
    gestureEnabled: true,
    gestureDirection: 'vertical',
    headerShown: false,
  }}
/>
```

Include drag handle at top matching workout logger pattern.

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

### Theming Guidelines (MANDATORY)

The app supports both dark and light modes via `ThemeContext`. **All new components MUST support both themes.**

**Key Files:**
- `src/contexts/ThemeContext.tsx` - ThemeProvider, useTheme hook, DarkTheme/LightTheme palettes
- `constants/Colors.ts` - Backward-compatible Colors export (always dark theme)

**Architecture:**
```
ThemeProvider (app/_layout.tsx)
    │
    ├── mode: 'system' | 'light' | 'dark'  ← User preference (persisted to AsyncStorage)
    ├── resolvedTheme: 'light' | 'dark'    ← Actual theme displayed
    ├── colors: ThemeColors                 ← Active color palette
    └── isDark: boolean                     ← Convenience boolean
```

#### 1. Import and use the theme hook

```tsx
import { useTheme } from '@/src/contexts/ThemeContext';

export default function MyComponent() {
  const { colors, isDark } = useTheme();
  // ...
}
```

#### 2. Use dynamic colors for text (NOT static Colors.*)

```tsx
// ✅ CORRECT - responds to theme changes
<Text style={{ color: colors.textPrimary }}>Hello</Text>
<Text style={{ color: colors.textSecondary }}>Subtitle</Text>

// ❌ WRONG - always shows dark theme colors
<Text style={{ color: Colors.textPrimary }}>Hello</Text>
```

**Available dynamic colors:**
- `colors.textPrimary` - Main text (#fafafa dark / #1A1A1A light)
- `colors.textSecondary` - Secondary text
- `colors.textTertiary` - Tertiary/muted text
- `colors.background` - Screen background
- `colors.white` - Pure white (for button text on green)
- `colors.success`, `colors.error`, `colors.warning` - Semantic colors (same in both themes)

#### 3. Invert glass/overlay effects for light mode

**Quick Reference - RGBA Inversions:**

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Glass background (subtle) | `rgba(255,255,255, 0.04)` | `rgba(0,0,0, 0.04)` |
| Glass background (normal) | `rgba(255,255,255, 0.08)` | `rgba(0,0,0, 0.04)` |
| Glass background (elevated) | `rgba(255,255,255, 0.12)` | `rgba(0,0,0, 0.06)` |
| Border (subtle) | `rgba(255,255,255, 0.08)` | `rgba(0,0,0, 0.06)` |
| Border (normal) | `rgba(255,255,255, 0.1)` | `rgba(0,0,0, 0.1)` |
| Border (prominent) | `rgba(255,255,255, 0.15)` | `rgba(0,0,0, 0.08)` |
| Solid modal background | `#222222` | `#FFFFFF` |
| Popover background | `rgba(36,36,36, 0.95)` | `rgba(255,255,255, 0.95)` |

```tsx
// Glass card backgrounds
backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'

// Glass borders
borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'

// Progress dots, dividers
backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
```

#### 4. Use the themedStyles pattern

Since `StyleSheet.create()` runs at module load time (before theme is available), create a `themedStyles` object inside your component:

```tsx
export default function MyScreen() {
  const { colors, isDark } = useTheme();

  // Dynamic styles that depend on theme
  const themedStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      <Text style={[styles.title, themedStyles.title]}>Title</Text>
    </View>
  );
}

// Static styles (layout, sizing - theme-independent)
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...Typography.h1, marginBottom: Spacing.md },
});
```

#### 5. Keep semantic colors static

These work on both backgrounds:
- `Colors.success` (#22c55e green)
- `Colors.error` (#dc2626 red)
- `Colors.warning` (#f59e0b amber)

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
