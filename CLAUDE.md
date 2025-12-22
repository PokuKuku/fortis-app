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

## Project Overview

Fortis is an offline-first mobile workout tracker built with Expo/React Native. Monorepo structure:

- **fortis-mobile-app/**: Main React Native app (Expo SDK 54, React 19.1, RN 0.81.5, TypeScript)
- **fortis-dashboard-web/**: Next.js analytics dashboard (Next.js 16, React 19.2, TypeScript, Tailwind CSS)
- **supabase/**: Database schema, migrations, and seed data
- **free-exercise-db-main/**: Exercise database with JSON files

## Development Commands

```bash
cd fortis-mobile-app
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm start -- --clear   # Clear bundler cache

# Testing
npm test               # Run all tests
npm test:watch         # Run tests in watch mode
npm test:coverage      # Run tests with coverage report
npm test -- ComponentName  # Run specific test file

# Supabase (requires Docker)
supabase start         # Start local instance
supabase db reset      # Reset and apply migrations
supabase functions deploy ai  # Deploy AI edge function
```

## Architecture

```
fortis-mobile-app/
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
│   ├── workout/active.tsx  # Active workout logger
│   ├── exercise/[id].tsx   # Exercise detail
│   ├── workouts/[id].tsx   # Workout detail
│   └── programs/[id].tsx   # Program detail
│
├── src/
│   ├── components/         # UI components (ui/, workout/, ai/, hub/, program/)
│   ├── features/           # Feature-specific components (workout/)
│   ├── hooks/              # Custom hooks
│   ├── services/           # exerciseService, programService, aiService
│   ├── store/              # Zustand stores (workoutStore, programsStore, aiStore)
│   ├── types/              # TypeScript definitions (exercise, program, workout, ai)
│   ├── constants/          # Storage keys, exerciseOptions
│   ├── contexts/           # React contexts (DragDropContext)
│   └── lib/                # Supabase client
│
├── components/             # Root-level glass morphism components
│   ├── GlassButton.tsx     # Green gradient button (USE FOR ALL GREEN BUTTONS)
│   ├── GlassCard.tsx       # Glass effect card
│   └── StainlessSteelPattern.tsx  # Background pattern (USE ON ALL SCREENS)
│
└── constants/              # Design tokens
    ├── Colors.ts, Sizes.ts, Typography.ts
```

**Key Dependencies:** Zustand + AsyncStorage, react-hook-form + zod, react-native-reanimated, react-native-gesture-handler, react-native-heroicons/outline, date-fns, victory-native (charts), react-native-calendars, lucide-react-native

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

## Backend (Supabase)

**Key Tables** (see `supabase/schema.sql`):
- `profiles` - User accounts
- `exercises` - Exercise library
- `workout_programs` - Program templates
- `workout_sessions` - Active workouts
- `workout_sets` - Individual sets
- `ai_conversations` - AI chat history

**Offline-First Pattern:**
- `local_id` (client UUID) + `is_synced` boolean
- Persists to AsyncStorage immediately
- Syncs to Supabase when online

**Migrations** (`supabase/migrations/`):
- `000_initial_schema.sql` - Core tables
- `001_add_import_support.sql` - Strong/Hevy imports
- `002_core_features_and_ai_security.sql` - AI, programs, RLS
- `003_program_ai_tracking.sql` - AI-generated program tracking
- `004_add_program_delete_update_policies.sql` - Program deletion/update RLS policies

**AI Edge Function** (`supabase/functions/ai/index.ts`):
- Rate limiting via `ai_rate_limits` table
- Claude 3.5 Sonnet via Anthropic API
- Image support (base64-encoded)

```bash
supabase functions deploy ai
supabase secrets set ANTHROPIC_API_KEY=<key>
```

**Environment:** Copy `.env.example` to `.env.local` with Supabase URL/key.

## Design System (MANDATORY)

### Pre-Implementation Checklist

Before implementing ANY UI:
- [ ] Using `Colors.ts` constants (NO hardcoded hex/rgba)
- [ ] Using `Spacing` from `Sizes.ts` (NO magic numbers)
- [ ] Using `Typography.ts` style objects
- [ ] Background uses `Colors.background` + `<StainlessSteelPattern>`
- [ ] Checked `app/(tabs)/index.tsx` for similar patterns
- [ ] Using `GlassButton`/`GlassCard` instead of custom implementations
- [ ] Using `BaseModal` for all centered dialog modals

### Design Tokens

**Colors** (`constants/Colors.ts`):
```tsx
Colors.background      // #0a0a0a
Colors.textPrimary     // #fafafa
Colors.textSecondary   // #a3a3a3
Colors.success         // #22c55e (THE green)
Colors.error           // #dc2626
Colors.warning         // #f59e0b
```

**Spacing** (`constants/Sizes.ts`):
```tsx
Spacing.xs (4), Spacing.sm (8), Spacing.md (12), Spacing.lg (16), Spacing.xl (20)
Spacing['2xl'] (24), Spacing['3xl'] (32), Spacing['4xl'] (40)
```

**Border Radius:** `BorderRadius.sm (6), .md (8), .lg (10), .xl (14), ['2xl'] (16)`

**Typography:** Spread complete style objects: `style={{ ...Typography.h2, color: Colors.textPrimary }}`

### Component Patterns

**Screen Structure:**
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
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
