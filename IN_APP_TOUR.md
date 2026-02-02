# In-App Tour / Demo (One-Time)

We will **plan first**, then implement.

## Product Behavior (Requirements)

- Runs **only once per user**.
- Trigger: **first session after** `onboarding_completed = true` **AND** user is **paid or free-trial**.
- Persist (server): `has_seen_in_app_tour`, `tour_completed_at`, `tour_version`.
- If app backgrounds mid-tour, resume gracefully (still the same one tour).
- Include **Skip** (still sets `has_seen_in_app_tour = true`).
- Teach the **workout basics** (rest timer, columns, and card/modal basics) after the workout opens.
- No new screens: anchored overlays/tooltips on real UI elements.

---

## Proposed Tour (v5)

### Happy Path Flow

1) User finishes onboarding + paywall (entitled) -> lands on Programs tab.
2) Tour welcomes the user (intro text).
3) Tour points to **Workouts** and explains workout templates.
4) Tour points to **Programs** and explains program templates + drag-and-drop.
5) Tour points to Quick Start FAB.
6) Start config modal opens; user chooses any workout/program to set.
7) User presses the Start FAB to launch the chosen workout.
8) In workout, highlight the **rest timer** control and how it works.
9) In workout, explain the **clock icon** sets rest timer defaults.
10) In workout, explain the **set columns** (set, prev, weight, reps, done).
11) In workout, explain **exercise card basics** (menu, add sets).
12) User closes the workout session (X).
13) Tour points to the Insights tab; user taps it, then the Insights intro finishes the tour.
14) System in-app review prompt appears right after the tour completes.

### Step Sequence + Copy

Notes:
- Each step is anchored to a real UI element.
- “Advance” describes how we move to the next step.
- After closing the workout, the user manually taps the Insights tab.

| Step | Screen/Route | Anchor | Copy | Advance |
|---:|---|---|---|---|
| 1 | `/(tabs)/index` | n/a | Welcome to Fortis! Congrats on committing to your fitness journey! Now let’s show you around. | Tap Next |
| 2 | `/(tabs)/index` | Workouts header | Workouts are templates that contain exercises. | Tap Next |
| 3 | `/(tabs)/index` | Programs header | Programs are templates that contain workouts. Drag and drop a workout card into a program card to add it. | Tap Next |
| 4 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | **This button starts your default workout.** Tap the dumbbell to choose what it launches, and press & hold anytime to change it later. | Tap FAB |
| 5 | Start Config Modal | Any workout/program option | Choose a workout or program and confirm to set your default. | Confirm selection |
| 6 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | Now press the dumbbell Start button to launch your workout. | Tap FAB |
| 7 | `/workout/active` | Rest timer control | **Rest Timer** keeps you on pace between sets. Tap to start/pause, and adjust as needed. | Tap Next |
| 8 | `/workout/active` | Clock icon | Set your rest timer defaults here. | Tap Next |
| 9 | `/workout/active` | Set columns row | **Columns:** set → prev → weight → reps → done. Tap a box to edit, long‑press to apply to remaining sets. | Tap Next |
| 10 | `/workout/active` | Exercise card header | **Exercise cards:** use the menu for options and “+ Add Set” to add volume. | Tap Next |
| 11 | `/workout/active` | Close (X) | Tap X to close the workout. | Close workout |
| 12 | `/(tabs)` | Insights tab | Next, tap Insights to see your progress. | Tap Insights tab |
| 13 | `/(tabs)/insights` | n/a | Insights power Fortis AI—tap "Ask Fortis" on any insight to get a breakdown and next steps. | Tap Done |

---

## Entitlement Gating (Paid / Trial)

Current paywall system is **Superwall** (`expo-superwall`).

Source of truth in-app:
- `useUser().subscriptionStatus.status === "ACTIVE"` => treat as paid/trial.

---

## Tour State Model + Persistence

### Server (Preferred)

Add columns to `profiles`:
- `has_seen_in_app_tour` boolean default false
- `in_app_tour_completed_at` timestamptz null
- `in_app_tour_version` int default 2

Local cache (scoped storage):
- `in_app_tour_state_v2` JSON:
  - `version`
  - `status`: `idle | in_progress | completed | skipped`
  - `stepId`
  - `updatedAt`

Resume rule:
- If `status === in_progress` and `version === CURRENT_TOUR_VERSION`, resume at `stepId`.
- If anchor is missing, fall back to the nearest safe step for the current route.

---

## Get Started Workout (v2)

### Requirements

- One set of **3 reps**.
- Exercise: **Pushups**.
- Startable from Quick Start (FAB).

### Proposed Implementation

- Update the default template seed in `fortis-mobile-app/src/data/defaultPrograms.ts`:
  - id: `default-template-get-started`
  - name: `Get Started`
  - 1 exercise: `Pushup`
  - 1 set, 3 reps

---

## Quick Start Integration

- Auto-set start preset to the Get Started template **only if**:
  - start preset is null AND
  - Get Started not completed AND
  - we haven’t auto-set it before (local guard)
- Long-press Quick Start resets/changes preset (mentioned in step 1 copy).

---

## Workout Recap Entry Points (Current UI)

1) **Insights tab**: `WORKOUT_RECAP_V1` insight card (appears after completed workout + refresh).
2) **History tab**: tap a workout to open `WorkoutHistoryDetailModal`.

Tour behavior:
- After the workout‑basics steps, the user closes the session and taps the Insights tab.
- The tour ends after the Insights intro step.

Get Started insight card:
- Copy: “Complete a quick workout to unlock your first recap and weekly insights.”
- Hide after the first completed workout session (any workout).

---

## Codebase Touchpoints (Where Each Piece Lives)

Entitlements:
- `fortis-mobile-app/src/components/superwall/SuperwallAuthSync.tsx`
- `fortis-mobile-app/src/hooks/useEntitlementStatus.ts`

Tour state + trigger:
- `fortis-mobile-app/src/contexts/InAppTourContext.tsx`
- `fortis-mobile-app/src/services/inAppTourService.ts`
- `fortis-mobile-app/app/_layout.tsx` (mount provider + launcher)
- `fortis-mobile-app/src/constants/storageKeys.ts` (add `IN_APP_TOUR_STATE_KEY`)

Tour overlay system:
- `fortis-mobile-app/src/components/tour/TourOverlay.tsx`
- `fortis-mobile-app/src/components/tour/useTourAnchor.ts`
- `fortis-mobile-app/app/(tabs)/_layout.tsx` (register anchor for Quick Start FAB)
- `fortis-mobile-app/app/(tabs)/index.tsx` (register anchor for Start FAB)
- `fortis-mobile-app/src/components/workout/WorkoutHeader.tsx` (register rest timer + rest timer settings + close button anchors)
- `fortis-mobile-app/src/components/workout/ExerciseCard.tsx` (register columns + exercise card anchors)
- Start config modal anchor (wherever the modal component is implemented)

Get Started workflow:
- `fortis-mobile-app/src/data/defaultPrograms.ts` (template seed)
- `fortis-mobile-app/src/hooks/useGetStartedStatus.ts`
- `fortis-mobile-app/src/components/insights/StartedInsightCard.tsx` (if retained)

Supabase migration:
- `supabase/migrations/XXX_in_app_tour_state.sql` (version bump + columns)

Tests:
- `fortis-mobile-app/components/__tests__/inAppTourState.test.ts`

---

## Edge Cases (Decisions)

- Skip: marks `has_seen_in_app_tour = true`.
- Background mid-tour: resume on next foreground from last `stepId`.
- User switches tabs: overlay should either follow (if anchor exists) or auto-navigate back to expected route.
- User starts a different workout:
  - Keep tour in “in progress”; continue the workout‑basics steps on the active session screen.

---

## Implementation Checklist

### Confirm + Align

- [ ] Tour starts on Programs tab with Quick Start FAB anchor.
- [ ] Step 2 allows choosing any workout/program in Start config modal.
- [ ] Step 3 prompts tapping the FAB to launch the chosen workout.
- [ ] Workout basics steps show (rest timer, rest timer settings, columns, exercise card basics).
- [ ] User closes the workout session and taps the Insights tab.
- [ ] Tour completes after the Insights intro step.
