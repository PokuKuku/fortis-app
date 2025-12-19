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

### Mobile App

```bash
cd fortis-mobile-app

npm start              # Start development server (Expo Metro)
npm run ios            # Run on iOS simulator (requires native build)
npm run android        # Run on Android emulator (requires native build)
npm run web            # Run on web browser (limited functionality)

# Native project generation (after adding native dependencies)
npx expo prebuild      # Generate native projects
npx expo prebuild --clean  # Clean rebuild
npx pod-install        # Install iOS CocoaPods dependencies

# Cache clearing (when bundler gets stuck)
npm start -- --clear   # Clear bundler cache
rm -rf .expo           # Clear Expo cache
```

### Supabase (Local Development)

```bash
# Requires Docker installed and running
supabase start         # Start local Supabase instance (PostgreSQL, Auth, Storage, etc.)
supabase db reset      # Reset database and apply all migrations from /migrations
supabase stop          # Stop local Supabase
supabase db pull       # Pull schema changes from remote
supabase migration new migration_name  # Create new migration file

# Database operations
supabase db push       # Apply local migrations to remote
supabase seed reset    # Reload seed data
```

### Quick Reference

| Task | Command |
|------|---------|
| Hot reload | Save a file (automatic) or press `r` in terminal |
| Full reload | Shake device → "Reload" or press `c` in terminal |
| Debug menu | Shake device or press `d` (iOS) / `m` (Android) |
| Clear all caches | `npm start -- --clear && rm -rf .expo` |
| Reinstall deps | `rm -rf node_modules && npm install` |

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
├── hooks/              # Custom hooks (useElapsedTime, useRestTimerTick, useExercises)
├── services/           # Service layer (exerciseService.ts)
├── lib/supabase.ts     # Supabase client with SecureStore adapter
├── store/workoutStore.ts  # Zustand state (active session, rest timer, number pad)
├── types/              # TypeScript definitions (workout.ts, exercise.ts)
└── constants/          # Storage keys, config, exerciseOptions, exerciseConfig

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
- **Icons**: react-native-heroicons/outline (see Icons section below)
- **Date handling**: date-fns

### Icons

**Primary Library**: `react-native-heroicons/outline`
- All icons use the outline variant for consistency
- Import from: `import { IconName } from 'react-native-heroicons/outline';`

**Common Icon Props**:
```tsx
<XMarkIcon size={20} color="#ffffff" strokeWidth={2.5} />
```
- `size`: Icon dimensions in pixels (use `IconSizes` from Sizes.ts)
- `color`: Icon color (use `Colors` constants)
- `strokeWidth`: Line thickness (default ~1.5, use 2-2.5 for better visibility)

**Custom Icons**: `src/components/icons/`
- `DumbbellIcon` - Custom SVG dumbbell icon (DO NOT replace with Heroicons)

**Common Icon Mappings** (reference):
| Purpose | Icon | Import |
|---------|------|--------|
| Close/Cancel | XMarkIcon | react-native-heroicons/outline |
| Delete | TrashIcon | react-native-heroicons/outline |
| Add | PlusIcon | react-native-heroicons/outline |
| Subtract | MinusIcon | react-native-heroicons/outline |
| Complete/Check | CheckIcon | react-native-heroicons/outline |
| Timer/Clock | ClockIcon | react-native-heroicons/outline |
| Calendar | CalendarDaysIcon | react-native-heroicons/outline |
| Search | MagnifyingGlassIcon | react-native-heroicons/outline |
| Sort | ArrowsUpDownIcon | react-native-heroicons/outline |
| Navigation | ChevronRightIcon, ChevronLeftIcon | react-native-heroicons/outline |
| Menu (horizontal) | EllipsisHorizontalIcon | react-native-heroicons/outline |
| Menu (vertical) | EllipsisVerticalIcon | react-native-heroicons/outline |
| Play/Pause | PlayIcon, PauseIcon | react-native-heroicons/outline |
| Info | InformationCircleIcon | react-native-heroicons/outline |
| Replace/Refresh | ArrowPathIcon | react-native-heroicons/outline |
| Notes/Document | DocumentTextIcon | react-native-heroicons/outline |
| Copy | DocumentDuplicateIcon | react-native-heroicons/outline |
| Skip | ForwardIcon | react-native-heroicons/outline |
| Reset | ArrowUturnLeftIcon | react-native-heroicons/outline |
| Warning | ExclamationTriangleIcon | react-native-heroicons/outline |
| Trophy | TrophyIcon | react-native-heroicons/outline |
| User | UserIcon | react-native-heroicons/outline |
| List | Bars3Icon | react-native-heroicons/outline |
| Grid/Layout | Squares2X2Icon | react-native-heroicons/outline |
| Backspace | BackspaceIcon | react-native-heroicons/outline |

### State Management Stores

The app uses **Zustand** with AsyncStorage persistence for offline-first operation. Key stores:

#### `workoutStore.ts` - Active Workout Session
```tsx
// Active session state
sessionId: string | null
currentExerciseIndex: number
sets: WorkoutSet[]  // Completed/in-progress sets
restTimer: number
isLoading: boolean

// Global UI state
activeNumberPad: null | { exerciseIndex: number; setIndex: number }
```
- Persists to `ACTIVE_SESSION_KEY` in AsyncStorage
- Auto-syncs completed sets to Supabase when online
- Handles rest timers, set logging, exercise transitions

#### `programsStore.ts` - Workout Programs/Templates
```tsx
// Data
programs: Program[]  // User's saved programs
isLoading: boolean
error: string | null

// Actions
fetchPrograms(): Promise<void>
deleteProgram(id: string): Promise<boolean>
duplicateProgram(id: string): Promise<string | null>
createWorkoutTemplate(...): Promise<string | null>
updateLastPerformed(id: string): Promise<void>
```
- Fetches from `workout_programs` table in Supabase
- Supports AI-generated programs (with source tracking)
- Maps DTO responses to typed Program objects

#### `aiStore.ts` - AI Assistant
```tsx
// Conversation
conversation: AIConversation | null
isConversationOpen: boolean
isSendingMessage: boolean

// Pending mutations awaiting user confirmation
pendingActions: AIPendingAction[]
currentMutationPlan: AIMutationPlan | null
mutationHistory: AIMutationRecord[]  // For undo

// Image attachment
selectedImage: { uri: string; base64: string; mimeType: AIImageMimeType } | null
```
- Stores conversation history in AsyncStorage (`AI_CONVERSATION_KEY`)
- Handles image-to-template generation (base64 encoding)
- Applies mutations to workouts with user confirmation
- Tracks rate limits for API safety

### Key Patterns

- **Offline-first state**: All stores use Zustand + AsyncStorage for persistence
- **Local ID generation**: Client-side UUIDs in `workoutStore` for offline sessions
- **Storage keys**: Centralized in `src/constants/storageKeys.ts`
- **Event emitter**: `DeviceEventEmitter` for store-to-component communication (e.g., `workout-updated`)
- **Number pad pattern**: Single global `NumberPadModal` at app root, state in `workoutStore.activeNumberPad`
- **DTO mapping**: Programs and AI responses use DTOs that get mapped to typed models

### Exercise Database Abstraction Layer

The exercise data is abstracted behind a service layer to allow easy switching between data sources (local JSON, different databases, or external APIs).

**Key Files:**
```
src/
├── types/exercise.ts           # Exercise, ExerciseWithSource, ExerciseSource types
├── constants/
│   ├── exerciseOptions.ts      # PRIMARY_MUSCLES, CATEGORIES, EQUIPMENT_TYPES, etc.
│   └── exerciseConfig.ts       # Data source configuration
├── services/exerciseService.ts # Core service with caching, search, filter
└── hooks/useExercises.ts       # useExercises(), useExercise(id) hooks
```

**Usage in Components:**
```tsx
import { useExercises, useExercise } from '@/src/hooks/useExercises';
import { getExerciseImageUrl } from '@/src/services/exerciseService';

// Get all exercises (auto-refreshes on custom exercise changes)
const { exercises, loading, error, refresh } = useExercises();

// Get single exercise by ID
const { exercise, loading } = useExercise(exerciseId);

// Get image URL
const imageUrl = getExerciseImageUrl(exercise.images[0]);
```

**To Switch to an API:**
1. Update `src/constants/exerciseConfig.ts`:
```tsx
export const EXERCISE_CONFIG = {
  source: 'api',  // Change from 'local' to 'api'
  apiBaseUrl: 'https://your-api.com/v1',
  imageBaseUrl: '...',
};
```
2. Implement `fetchApiExercises()` in `exerciseService.ts` with error handling
3. No UI changes needed - all components use the hooks

**Option Constants** (use these instead of inline arrays):
```tsx
import { PRIMARY_MUSCLES, CATEGORIES, EQUIPMENT_TYPES, LEVELS, FORCES, MECHANICS } from '@/src/constants/exerciseOptions';
```

### Backend (Supabase)

**Key Tables** (see `supabase/schema.sql`):
- `profiles` - User account data
- `exercises` - Exercise library (name, muscles, equipment, instructions)
- `workout_programs` - Program templates created by users or AI
- `workout_sessions` - Active workouts
- `workout_sets` - Individual sets within sessions
- `ai_conversations` - AI assistant conversation history
- `subscriptions` - Subscription/payment tracking

**Offline-First Pattern**:
- Sessions and sets use `local_id` (UUID generated client-side) and `is_synced` boolean
- Data persists to AsyncStorage immediately for offline access
- Periodic sync to Supabase when online (watch `getNetInfo()`)
- Conflict resolution: last-write-wins or user confirmation

**Migrations** (`supabase/migrations/`):
- `000_initial_schema.sql` - Core tables
- `001_add_import_support.sql` - Strong/Hevy app imports
- `002_core_features_and_ai_security.sql` - AI, programs, security policies
- `003_program_ai_tracking.sql` - AI-generated program tracking

**Data Import**:
- Support for Strong and Hevy app exports - see `supabase/IMPORT_GUIDE.md`
- Exercises seeded from `free-exercise-db-main/` (6000+ exercises)

## Environment Setup

**Local Development**:
Copy `fortis-mobile-app/.env.example` to `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321   # Local Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_APP_ENV=development
```

**Production**:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_APP_ENV=production
```

**Important Notes**:
- `EXPO_PUBLIC_*` variables are embedded in the app bundle (not secret)
- Supabase anon key has RLS policies - all data access controlled at DB level
- Never commit `.env.local` (it's in `.gitignore`)
- For Supabase local dev: Use keys from `supabase start` output (printed in terminal)

## Debugging Guide

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Module not found" | Missing import or stale cache | `npm start -- --clear && npm install` |
| White/blank screen | Bundler error | Check terminal for errors, shake device for debug menu |
| AsyncStorage data not persisting | Wrong storage key or Zustand hydration | Verify key in `storageKeys.ts`, check store subscribers |
| Supabase connection fails | Wrong URL/key or local instance down | `supabase start`, verify `.env.local` |
| Network sync stuck | Device offline or connection timeout | Check `@react-native-community/netinfo` state |
| AI mutations not applying | Pending action not confirmed | Check `aiStore.pendingActions` state in dev menu |

### Logging Patterns

**State inspection** (in device menu):
```tsx
// Check store state
import { useWorkoutStore } from '@/src/store/workoutStore';
const state = useWorkoutStore.getState();
console.log('Workout state:', state);
```

**Trace async operations**:
```tsx
// Add logs to store actions
fetchPrograms: async () => {
  console.log('[programsStore] Fetching programs...');
  try {
    const { data } = await supabase.from('workout_programs').select('*');
    console.log('[programsStore] Fetched', data?.length, 'programs');
    set({ programs: data || [] });
  } catch (error) {
    console.error('[programsStore] Fetch failed:', error);
  }
}
```

**Network monitoring**:
```tsx
import NetInfo from '@react-native-community/netinfo';
NetInfo.addEventListener(state => {
  console.log('[Network] Connected:', state.isConnected, 'Type:', state.type);
});
```

### Performance Debug

Enable React Native debugger to profile renders:
- Shake device → Enable "Debug" → Open Metro debug menu
- Watch for unnecessary re-renders (use `whyDidYouRender` if added)
- Check AsyncStorage operations (they're async and can block UI)

## AI Features & Image Processing

### Image-to-Template Generation

The AI can convert workout photos to program templates:

**Flow**:
1. User selects image from device camera/gallery
2. Image → base64 encoding in `aiStore`
3. Send with message to Claude API
4. Claude extracts exercises and proposes template structure
5. AI returns `currentMutationPlan` with mutations
6. User confirms → mutations apply to workout

**Implementation** (`aiStore.ts`):
```tsx
// Selected image persists until message sent
selectedImage: { uri: string; base64: string; mimeType: AIImageMimeType }

// Send message with image attachment
sendMessage(text: string): Promise<void>
// → encodes image to base64 before API call
// → clears selectedImage after send
```

**Supported formats**: JPEG, PNG (see `AIImageMimeType` enum in `types/ai.ts`)

### Rate Limiting & Safety

`aiStore` tracks API rate limits:
```tsx
rateLimitStatus: AIRateLimitStatus {
  requestsRemaining: number
  resetAt: Date
  isLimited: boolean
}

// Update during API calls
updateRateLimit(headers: APIHeaders): void
```

Monitor in UI before allowing requests - disable "Send" button if limited.

### Mutation System

AI-generated changes are staged before applying:

```tsx
// User proposes mutation (e.g., add exercise)
currentMutationPlan: {
  id: string
  description: string  // "Add barbell bench press to day 1"
  mutations: AIMutation[]
}

// Pending confirmation
pendingActions: AIPendingAction[]

// After confirmation
mutationHistory: AIMutationRecord[]  // For undo support
```

Each mutation tracks:
- Type (add, remove, update exercise)
- Affected entities (workout/session/set IDs)
- Previous state (for undo)
- Timestamp of application

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
- [ ] Using `BaseModal` from `src/components/ui/BaseModal.tsx` for all centered dialog modals

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

**Modals** (use `BaseModal` component from `src/components/ui/BaseModal.tsx`):

All centered dialog modals MUST use the `BaseModal` component to ensure consistent styling. This component automatically handles:
- StainlessSteelPattern background texture
- FadeIn/FadeOut + ZoomIn/ZoomOut animations
- Dark backdrop (`rgba(0, 0, 0, 0.7)`)
- Container styling (`#222222` bg, `BorderRadius['2xl']`, shadows)
- Header with title, optional icon, and close button
- Haptic feedback on close

```tsx
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';
import { ExclamationTriangleIcon } from 'react-native-heroicons/outline';

// Confirmation modal (two buttons)
<BaseModal visible={visible} onClose={onClose} title="Finish Workout?">
  <Text style={modalStyles.message}>Are you sure you want to finish?</Text>
  <View style={modalStyles.actions}>
    <Pressable style={modalStyles.cancelButton} onPress={onClose}>
      <Text style={modalStyles.cancelButtonText}>Keep Going</Text>
    </Pressable>
    <Pressable style={modalStyles.successButton} onPress={onConfirm}>
      <Text style={modalStyles.successButtonText}>Finish</Text>
    </Pressable>
  </View>
</BaseModal>

// Warning modal with icon (icon displays centered above title)
<BaseModal
  visible={visible}
  onClose={onClose}
  title="Limit Reached"
  icon={<ExclamationTriangleIcon size={24} color="#f59e0b" />}
>
  <Text style={modalStyles.message}>Maximum limit reached.</Text>
  <Pressable style={modalStyles.warningButton} onPress={onClose}>
    <Text style={modalStyles.warningButtonText}>Got it</Text>
  </Pressable>
</BaseModal>
```

**BaseModal Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | boolean | required | Modal visibility |
| `onClose` | () => void | required | Close handler |
| `title` | string | required | Header title |
| `icon` | ReactNode | - | Icon before title |
| `showCloseButton` | boolean | true | Show X button |
| `closeButtonColor` | string | textSecondary | Close icon color |
| `closeOnBackdropPress` | boolean | true | Dismiss on backdrop tap |
| `width` | number | 320 | Container width |

**Modal Button Styles** (from `modalStyles`):
- `cancelButton` / `cancelButtonText` - Gray neutral button
- `successButton` / `successButtonText` - Green success action
- `warningButton` / `warningButtonText` - Amber warning action
- `errorButton` / `errorButtonText` - Red destructive action
- `message` - Centered message text style
- `actions` - Two-button row layout
- `buttonPressed` - Apply on pressed state

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
