# Fortis Mobile App - Development Roadmap

Complete development plan for building the Fortis mobile app MVP.

## Overview

**Goal**: Build an offline-first mobile workout tracker with Expo/React Native
**Timeline**: Phased approach - foundation first, then features
**Architecture**: Clean architecture with offline-first sync

---

## Phase 1: Foundation & Setup (Week 1)

### 1.1 Project Initialization
- [x] Create Expo project with TypeScript template
- [x] Set up Git repository structure
- [x] Configure `.gitignore` for React Native
- [x] Create environment variable setup (`.env.local`)
- [x] Set up ESLint and Prettier
- [x] Configure TypeScript strict mode

### 1.2 Project Structure
```
fortis-mobile-app/
├── app/                    # Expo Router screens
├── src/
│   ├── components/         # Reusable UI components
│   ├── features/          # Feature-based modules
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party integrations
│   ├── services/          # Business logic
│   ├── store/             # State management
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, etc.
└── constants/             # App constants
```

### 1.3 Core Dependencies Installation
- [x] **Navigation**: `expo-router` (file-based routing)
- [x] **UI Library**: Custom design system (Glass UI components)
- [x] **State Management**: `zustand` (lightweight, simple)
- [x] **Forms**: `react-hook-form` + `zod` validation
- [x] **Date/Time**: `date-fns`
- [x] **Icons**: `lucide-react-native`

### 1.4 Supabase Setup
- [x] Install `@supabase/supabase-js`
- [x] Create Supabase client configuration
- [x] Set up environment variables (URL, anon key)
- [x] Test connection to Supabase

### 1.5 Offline Data & Sync
- [x] Persist active/completed sessions locally (AsyncStorage)
- [x] Queue sync when offline and retry on reconnect
- [x] Sync workout sessions/sets + custom exercises to Supabase
- [ ] Local SQLite mirror (PowerSync/WatermelonDB) - not implemented

---

## Phase 2: Authentication (Week 2)

### 2.1 Auth Configuration
- [ ] Set up Supabase Auth client
- [ ] Configure Google OAuth (credentials, redirect URIs)
- [ ] Configure Apple Sign In (credentials, redirect URIs)
- [ ] Set up deep linking for OAuth callbacks
- [ ] Create auth context/store

### 2.2 Auth Screens
- [ ] **Splash Screen** - App loading with Fortis branding
- [ ] **Onboarding** - Intro carousel (3-5 screens)
- [ ] **Login Screen** - Google/Apple sign-in buttons
- [ ] **Profile Setup** - First-time user preferences (units, name)
- [ ] **Loading States** - Skeleton screens during auth

### 2.3 Auth Flow Logic
- [ ] Implement Google Sign-In
- [ ] Implement Apple Sign-In
- [ ] Handle OAuth callbacks
- [ ] Store auth tokens securely (`expo-secure-store`)
- [ ] Auto-login on app restart
- [ ] Logout functionality
- [ ] Error handling and user feedback

### 2.4 Protected Routes
- [ ] Create auth guard wrapper
- [ ] Redirect to login if not authenticated
- [ ] Redirect to home if authenticated
- [ ] Handle session expiration

---

## Phase 3: Core UI System (Week 2-3)

### 3.1 Design System
- [ ] Define color palette (dark theme from prototypes)
- [ ] Define typography scale
- [ ] Define spacing system
- [ ] Define component sizes (button, input, etc.)
- [ ] Create theme context/provider

### 3.2 Base Components
- [ ] **Button** - Primary, secondary, ghost variants
- [ ] **Input** - Text input with validation states
- [ ] **Card** - Container component
- [ ] **Typography** - Heading, body, caption
- [ ] **Icon** - Wrapper for lucide icons
- [ ] **Badge** - For tags, labels
- [ ] **Chip** - For filters, selections
- [ ] **Separator** - Divider line

### 3.3 Complex Components
- [ ] **BottomSheet** - For exercise selection, filters
- [ ] **Modal** - For confirmations, alerts
- [ ] **Tabs** - For navigation within screens
- [ ] **Picker** - For number selection (weight, reps)
- [ ] **SwipeableRow** - For delete/edit actions
- [ ] **EmptyState** - For no data scenarios
- [ ] **ErrorBoundary** - Catch and display errors

### 3.4 Navigation Components
- [ ] **Tab Bar** - Bottom navigation
- [ ] **Header** - Screen headers with actions
- [ ] **Back Button** - Consistent navigation
- [ ] **Screen Wrapper** - Safe area, keyboard handling

---

## Phase 4: Exercise Library (Week 3)

### 4.1 Data Layer
- [ ] Create Exercise type definitions
- [ ] Create exercise service (CRUD operations)
- [ ] Implement exercise search/filter
- [ ] Cache exercises locally
- [ ] Sync exercises from Supabase

### 4.2 Exercise Screens
- [ ] **Exercise List** - Scrollable list with search
- [ ] **Exercise Detail** - Full exercise info, instructions
- [ ] **Exercise Filters** - Filter by muscle, equipment, level
- [ ] **Exercise Search** - Real-time search
- [ ] **Favorite Exercises** - Quick access to favorites

### 4.3 Exercise Features
- [ ] Display exercise name, equipment, muscles
- [ ] Show exercise instructions
- [ ] Display exercise images (if available)
- [ ] Add to favorites
- [ ] Filter by muscle group
- [ ] Filter by equipment
- [ ] Filter by difficulty level
- [ ] Recent exercises

---

## Phase 5: Workout Logging (Week 4-5) - CORE FEATURE

### 5.1 Data Models
- [ ] WorkoutSession type
- [ ] WorkoutSet type
- [ ] Create workout service
- [ ] Create set service
- [ ] Implement offline queue

### 5.2 Start Workout Flow
- [ ] **Home Screen** - Quick start workout button
- [ ] **Program Selection** - Choose from 3 default programs or free workout
- [ ] **Workout Session Screen** - Main workout interface
- [ ] **Timer** - Workout duration timer
- [ ] **Rest Timer** - Between-set rest timer

### 5.3 Exercise Selection
- [ ] **Add Exercise Button** - Open exercise picker
- [ ] **Exercise Picker Bottom Sheet** - Searchable exercise list
- [ ] **Quick Add** - Recent/favorite exercises
- [ ] **Reorder Exercises** - Drag to reorder

### 5.4 Set Logging
- [ ] **Set Row** - Display set number, previous data
- [ ] **Weight Input** - Number picker or keyboard input
- [ ] **Reps Input** - Number picker or keyboard input
- [ ] **RPE Slider** - 1-10 scale
- [ ] **Rest Timer Input** - Custom rest time
- [ ] **Notes Input** - Per-set notes
- [ ] **Set Type Toggle** - Warmup, working, dropset, failure
- [ ] **Complete Set** - Mark set as done
- [ ] **Delete Set** - Remove set
- [ ] **Add Set** - Add another set to exercise

### 5.5 Workout Session Management
- [ ] **Save Workout** - Complete and save workout
- [ ] **Discard Workout** - Cancel with confirmation
- [ ] **Pause Workout** - Pause timer
- [ ] **Resume Workout** - Continue paused workout
- [ ] **Workout Notes** - Overall workout notes
- [ ] **Session Summary** - Show total volume, duration, exercises

### 5.6 Offline Functionality
- [ ] Save workouts to local database
- [ ] Queue for sync when offline
- [ ] Sync when connection restored
- [ ] Handle sync conflicts
- [ ] Show sync status indicator

---

## Phase 6: Workout History (Week 5)

### 6.1 History Screen
- [ ] **Workout List** - Scrollable list of past workouts
- [ ] **Workout Card** - Summary of each workout
- [ ] **Date Grouping** - Group by day/week/month
- [ ] **Infinite Scroll** - Pagination for old workouts
- [ ] **Pull to Refresh** - Sync latest data

### 6.2 Workout Detail
- [ ] **Workout Summary** - Duration, volume, exercises
- [ ] **Exercise Breakdown** - All sets performed
- [ ] **Edit Past Workout** - Modify old workouts
- [ ] **Delete Workout** - Remove workout
- [ ] **Share Workout** - Export/share workout summary

### 6.3 Exercise History
- [ ] **Exercise Progress** - View history for specific exercise
- [ ] **PR Tracking** - Highlight personal records
- [ ] **Volume Chart** - Simple line chart
- [ ] **1RM Calculator** - Estimated max

---

## Phase 7: Analytics (Week 6)

### 7.1 Dashboard Screen
- [ ] **Workout Stats** - Total workouts, time, volume
- [ ] **Current Week Summary** - Workouts this week
- [ ] **Streak Tracking** - Consecutive workout days
- [ ] **Personal Records** - Recent PRs

### 7.2 Charts (Simple)
- [ ] **Volume Chart** - Weekly volume trend
- [ ] **Frequency Chart** - Workouts per week
- [ ] **Muscle Group Heatmap** - Training frequency by muscle

### 7.3 Progress Tracking
- [ ] **Exercise PRs** - Max weight per exercise
- [ ] **Body Metrics** - Optional weight tracking
- [ ] **Photos** - Progress photos (optional)

---

## Phase 8: Programs (Week 6-7)

### 8.1 Program Display
- [ ] **Program List** - Show 3 default programs
- [ ] **Program Detail** - View program structure
- [ ] **Workout Days** - List workouts in program
- [ ] **Exercise Prescriptions** - Sets, reps, rest times

### 8.2 Following Programs
- [ ] **Start Program** - Begin following a program
- [ ] **Track Progress** - Which day you're on
- [ ] **Complete Workout** - Mark program workout as done
- [ ] **Program Calendar** - Visual progress tracker

---

## Phase 9: Settings & Profile (Week 7)

### 9.1 Profile Screen
- [ ] **User Info** - Name, email, avatar
- [ ] **Edit Profile** - Update user details
- [ ] **Profile Picture** - Upload/change avatar
- [ ] **Preferences** - Units (lbs/kg), theme

### 9.2 Settings
- [ ] **Units** - Imperial/Metric toggle
- [ ] **Rest Timer Settings** - Default rest time, sound
- [ ] **Notifications** - Rest timer, workout reminders
- [ ] **Data & Privacy** - Export data, delete account
- [ ] **About** - App version, credits
- [ ] **Logout** - Sign out

### 9.3 Import/Export
- [ ] **Import Data** - From Strong/Hevy
- [ ] **Export Data** - Download workout history
- [ ] **Import Flow** - File picker, progress, success

---

## Phase 10: Polish & Testing (Week 8)

### 10.1 Performance
- [ ] Optimize list rendering (FlashList)
- [ ] Reduce unnecessary re-renders
- [ ] Lazy load images
- [ ] Profile app with Flipper
- [ ] Reduce bundle size

### 10.2 Error Handling
- [ ] Graceful error messages
- [ ] Retry failed sync operations
- [ ] Handle network errors
- [ ] Handle validation errors
- [ ] Sentry/error tracking integration

### 10.3 User Experience
- [ ] Loading states for all async operations
- [ ] Success/error feedback (toasts)
- [ ] Haptic feedback on interactions
- [ ] Smooth animations
- [ ] Keyboard handling
- [ ] Form validation messages

### 10.4 Testing
- [ ] Unit tests for services
- [ ] Integration tests for sync
- [ ] E2E tests for critical flows
- [ ] Test on iOS and Android
- [ ] Test offline scenarios
- [ ] Test on different screen sizes

---

## Phase 11: Deployment Prep (Week 9)

### 11.1 App Store Assets
- [ ] App icon (iOS and Android)
- [ ] Splash screen
- [ ] Screenshots (5 per platform)
- [ ] App description
- [ ] Keywords
- [ ] Privacy policy
- [ ] Terms of service

### 11.2 Build Configuration
- [ ] Configure app.json (name, version, bundle IDs)
- [ ] Set up EAS Build
- [ ] Configure iOS build (certificates, profiles)
- [ ] Configure Android build (keystore)
- [ ] Create app store listings

### 11.3 Submission
- [ ] TestFlight beta (iOS)
- [ ] Internal testing (Android)
- [ ] Beta testing with users
- [ ] Fix critical bugs
- [ ] Submit to App Store
- [ ] Submit to Google Play

---

## Tech Stack Summary

### Core
- **Framework**: Expo SDK 51+
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google/Apple OAuth)
- **Storage**: Supabase Storage (images)

### Offline
- **Local DB**: WatermelonDB or PowerSync
- **Storage**: AsyncStorage, SecureStore

### State Management
- **Global State**: Zustand
- **Server State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

### UI/UX
- **UI Components**: Custom (based on prototypes)
- **Icons**: Lucide React Native
- **Charts**: Victory Native (simple charts)
- **Animations**: Reanimated 3

### Developer Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict
- **Testing**: Jest, React Native Testing Library
- **Debugging**: Flipper, React DevTools

---

## Key Decisions to Make Before Starting

1. **Offline Database**: WatermelonDB vs PowerSync vs @op-engineering/op-sqlite
   - Recommendation: **WatermelonDB** (mature, well-documented)

2. **UI Library**: Build custom vs use library
   - Recommendation: **Custom components** (you have designs already)

3. **State Management**: Zustand vs Redux vs Jotai
   - Recommendation: **Zustand** (simple, TypeScript-first)

4. **Navigation**: Expo Router vs React Navigation
   - Recommendation: **Expo Router** (modern, file-based)

5. **Form Management**: React Hook Form vs Formik
   - Recommendation: **React Hook Form + Zod** (performance, validation)

---

## Success Metrics (MVP)

### Functional Requirements
- ✅ User can sign in with Google/Apple
- ✅ User can start a workout
- ✅ User can log exercises, sets, reps, weight, RPE
- ✅ User can view workout history
- ✅ User can browse exercise library
- ✅ User can see basic analytics
- ✅ App works offline
- ✅ Data syncs when online

### Non-Functional Requirements
- ✅ App loads in < 3 seconds
- ✅ Smooth 60fps scrolling
- ✅ No data loss (offline queue)
- ✅ Intuitive UX matching designs
- ✅ Works on iOS and Android

---

## File Structure Plan

```
fortis-mobile-app/
├── app/                                    # Expo Router screens
│   ├── (auth)/                            # Auth group
│   │   ├── login.tsx
│   │   ├── onboarding.tsx
│   │   └── profile-setup.tsx
│   ├── (tabs)/                            # Main tabs
│   │   ├── index.tsx                      # Home/Workout
│   │   ├── history.tsx                    # History
│   │   ├── analytics.tsx                  # Analytics
│   │   └── profile.tsx                    # Profile
│   ├── workout/                           # Workout flow
│   │   ├── [id].tsx                       # Active workout
│   │   └── summary.tsx                    # Post-workout
│   ├── exercises/                         # Exercise screens
│   │   ├── index.tsx                      # Exercise list
│   │   └── [id].tsx                       # Exercise detail
│   └── _layout.tsx                        # Root layout
│
├── src/
│   ├── components/
│   │   ├── ui/                            # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── workout/                       # Workout components
│   │   │   ├── SetRow.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── WorkoutTimer.tsx
│   │   └── shared/                        # Shared components
│   │       ├── Header.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── features/                          # Feature modules
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── store/
│   │   ├── workout/
│   │   ├── exercises/
│   │   └── analytics/
│   │
│   ├── lib/                               # Third-party setup
│   │   ├── supabase.ts
│   │   ├── database.ts
│   │   └── sync.ts
│   │
│   ├── services/                          # Business logic
│   │   ├── workout.service.ts
│   │   ├── exercise.service.ts
│   │   └── sync.service.ts
│   │
│   ├── store/                             # Global state
│   │   ├── workout.store.ts
│   │   ├── auth.store.ts
│   │   └── settings.store.ts
│   │
│   ├── types/                             # TypeScript types
│   │   ├── database.types.ts              # Generated from Supabase
│   │   ├── models.ts
│   │   └── api.ts
│   │
│   └── utils/                             # Utilities
│       ├── date.ts
│       ├── calculations.ts                # 1RM, volume, etc.
│       └── validation.ts
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── animations/
│
├── constants/
│   ├── Colors.ts
│   ├── Sizes.ts
│   └── Config.ts
│
├── .env.local                             # Environment variables
├── app.json                               # Expo config
├── tsconfig.json                          # TypeScript config
└── package.json
```

---

## Next Steps

Ready to start Phase 1? I'll:
1. Initialize the Expo project
2. Set up the folder structure
3. Install core dependencies
4. Configure TypeScript and linting
5. Set up Supabase connection

Let me know if you want to adjust anything in this roadmap before we begin!
