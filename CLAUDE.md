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

- **Tab layout with FAB**: `app/(tabs)/_layout.tsx` includes a floating action button for exercises tab
- **Persisted order**: `usePersistedOrder` hook for saving drag-drop order to AsyncStorage
- **Event emitter**: `DeviceEventEmitter` used for cross-component communication (e.g., modal visibility)
- **Supabase client**: Uses platform-specific storage (SecureStore on native, AsyncStorage on web)
