# In-App Tour / Demo (One-Time)

We will **plan first**, then implement.

## Product Behavior (Requirements)

- Runs **only once per user**.
- Trigger: **first session after** `onboarding_completed = true` **AND** user is **paid or free-trial**.
- Persist (server): `has_seen_in_app_tour`, `tour_completed_at`, `tour_version`.
- If app backgrounds mid-tour, resume gracefully (still the same one tour).
- Include **Skip** (still sets `has_seen_in_app_tour = true`).
- Show a special **Started / Getting Started** insight card (paid/trial only).
- Started card stays until **Get Started workout completion**, then converts to normal weekly insight behavior.
- Introduce **Workout Recap**: completing a workout generates a recap and where to find it.
- Teach/point to **Quick Start** workout FAB on the main tabs UI.
- No new screens: anchored overlays/tooltips on real UI elements.

---

## Proposed Tour (v1)

### Happy Path Flow

1) User finishes onboarding + paywall (entitled) -> lands in main tabs.
2) Tour starts -> user is guided to **Insights**.
3) Tour explains insight cards via the **Started** card.
4) Tour highlights **Quick Start** FAB -> user taps it -> app starts **Get Started** workout.
5) Tour nudges user to finish the workout (and what they’ll see next).
6) After finishing, user sees **Workout Recap** (Insights + History) -> tour completes.

### Step Sequence + Copy (Short, action-oriented)

Notes:
- Each step is anchored to a real UI element.
- “Advance” describes how we move to the next step.

| Step | Screen/Route | Anchor | Copy | Advance |
|---:|---|---|---|---|
| 1 | `/(tabs)/insights` | Insights header/title | **Insights** show what’s changing in your training. | Next |
| 2 | `/(tabs)/insights` | **Started** insight card | Tap any card for details. **Ask Fortis** explains the “why”. | Next |
| 3 | Any tabs | Quick Start FAB (Dumbbell) | **Quick Start** begins logging fast. Tap it to start **Get Started**. Press & hold to reset what it starts. | Tap-through (route change) |
| 4 | `/workout/active` | “Finish Workout” button | Complete a few sets, then tap **Finish**. You’ll get a **Workout Recap**. | Wait for workout completion |
| 5 | `/(tabs)/insights` | Workout Recap insight card (if present) OR empty-state area | Here’s your **Workout Recap**. You’ll get one after every workout. | Next |
| 6 | `/(tabs)/history` | History header/title | All workouts live in **History**. Tap any session to review it. | Done |

Optional (if we want to keep v1 shorter): drop Step 6 and mention History in Step 5 copy.

---

## Entitlement Gating (Paid / Trial)

Current paywall system is **Superwall** (`expo-superwall`).

Proposed source of truth in-app:
- `useUser().subscriptionStatus.status === "ACTIVE"` => treat as paid/trial.

Implementation plan:
- Add `SuperwallAuthSync` to identify the Supabase user in Superwall (so `subscriptionStatus` is reliable).
- Create a tiny `useEntitlementStatus()` hook that returns `isEntitled` + `isLoaded` (ACTIVE/INACTIVE/UNKNOWN).

---

## Tour State Model + Persistence

### Server (Preferred)

Add columns to `profiles`:
- `has_seen_in_app_tour` boolean default false
- `in_app_tour_completed_at` timestamptz null
- `in_app_tour_version` int default 1

Local cache (scoped storage):
- `in_app_tour_state_v1` JSON:
  - `version`
  - `status`: `idle | in_progress | completed | skipped`
  - `stepId`
  - `updatedAt`

Resume rule:
- If `status === in_progress` and `version === CURRENT_TOUR_VERSION`, resume at `stepId`.
- If anchor is missing, fall back to the nearest safe step for the current route.

---

## Started Insight Lifecycle (Deterministic Rules)

### What “Started” Does

- Shows only when:
  - user is entitled (paid/trial), AND
  - Get Started workout is not completed (see next section)
- Appears at the top of Insights feed (replaces the weekly verdict slot until completion).
- After completion:
  - hide Started card
  - allow normal weekly insight(s) to show
  - trigger an insights refresh so Recap/Weekly cards appear quickly

### Where to Implement

- Client-only card in `fortis-mobile-app/app/(tabs)/insights.tsx` (v1).
- Later (optional): promote to server-generated insight type if we want analytics or experimentation.

---

## Get Started Workout Template

### Requirements

- Short (3–5 exercises).
- Produces meaningful recap signal (>= 1 completed set required to “finish”).
- Must be startable from Quick Start (FAB).

### Proposed Implementation (v1)

- Add a default template seed to `fortis-mobile-app/src/data/defaultPrograms.ts`:
  - id: `default-template-get-started`
  - name: `Get Started`
  - 3 exercises, 2 sets each, simple rep ranges.

### Quick Start Integration

Because new users may have no `startPreset` yet:
- Auto-set start preset to the Get Started template **only if**:
  - start preset is null AND
  - Get Started not completed AND
  - we haven’t auto-set it before (local guard)
- After Get Started completion:
  - leave user’s preset alone (don’t overwrite)
  - optionally prompt via Started card CTA to customize (press & hold Quick Start) later (not required for v1)

---

## Workout Recap Entry Points (Current UI)

1) **Insights tab**: `WORKOUT_RECAP_V1` insight card (appears after completed workout + refresh).
2) **History tab**: tap a workout to open `WorkoutHistoryDetailModal`.

Tour behavior:
- Before any workout, set expectation (“you’ll see a recap after finishing”).
- After Get Started completion, highlight the recap card if it exists; otherwise direct to History.

---

## Codebase Touchpoints (Where Each Piece Lives)

Entitlements:
- New: `fortis-mobile-app/src/components/superwall/SuperwallAuthSync.tsx`
- New: `fortis-mobile-app/src/hooks/useEntitlementStatus.ts`

Tour state + trigger:
- New: `fortis-mobile-app/src/contexts/InAppTourContext.tsx`
- New: `fortis-mobile-app/src/services/inAppTourService.ts`
- Update: `fortis-mobile-app/app/_layout.tsx` (mount provider + launcher)
- Update: `fortis-mobile-app/src/constants/storageKeys.ts` (add `IN_APP_TOUR_STATE_KEY`)

Tour overlay system:
- New: `fortis-mobile-app/src/components/tour/TourOverlay.tsx`
- New: `fortis-mobile-app/src/components/tour/useTourAnchor.ts`
- Update: `fortis-mobile-app/app/(tabs)/_layout.tsx` (register anchors for Quick Start FAB + tab icons if needed)
- Update: `fortis-mobile-app/app/(tabs)/insights.tsx` (register Started/Recap anchors)
- Update: `fortis-mobile-app/app/workout/active.tsx` (register Finish button anchor)

Started card + Get Started status:
- New: `fortis-mobile-app/src/components/insights/StartedInsightCard.tsx`
- New: `fortis-mobile-app/src/hooks/useGetStartedStatus.ts`
- Update: `fortis-mobile-app/src/data/defaultPrograms.ts` (add template)

Supabase migration:
- New: `supabase/migrations/XXX_in_app_tour_state.sql` (profiles columns)

Tests:
- New: `fortis-mobile-app/components/__tests__/inAppTourState.test.ts`
- New/Update: tests for Started card + Get Started completion logic

---

## Edge Cases (Decisions)

- Skip: marks `has_seen_in_app_tour = true` but **Started card still shows** until Get Started completion.
- Background mid-tour: resume on next foreground from last `stepId`.
- User switches tabs: overlay should either follow (if anchor exists) or auto-navigate back to expected route.
- User starts a different workout:
  - Keep tour in “in progress”; after they finish any workout, show recap step; keep Started card until Get Started is done.
- Offline after finishing Get Started:
  - History recap still works immediately (local).
  - Insights recap may require refresh; tour falls back to History if recap card isn’t present yet.

---

## Implementation Checklist

### Confirm + Align

- [ ] Confirm tour should start on `/(tabs)` landing, then route user to Insights (vs starting wherever they land).
- [ ] Confirm “paid_or_trial” is `Superwall subscriptionStatus === ACTIVE`.
- [ ] Confirm Get Started workout content (exercise list + sets/reps).
- [ ] Confirm if Started card should be dismissible (recommend: no, only disappears on completion).
- [ ] Confirm copy: Quick Start can be reset by pressing & holding it (wording + whether we say “reset” vs “change”).

### Backend/Data

- [ ] Add Supabase migration: `profiles.has_seen_in_app_tour`, `profiles.in_app_tour_completed_at`, `profiles.in_app_tour_version`.
- [ ] Decide if we also want `in_app_tour_started_at` / `in_app_tour_step` server-side (optional).

### Mobile App

- [ ] Add storage key + local cache for tour progress.
- [ ] Implement Superwall user identification sync (`SuperwallAuthSync`).
- [ ] Implement `useEntitlementStatus()` gating helper.
- [ ] Add Get Started default template seed.
- [ ] Implement Get Started completion detection hook.
- [ ] Implement Started insight card + rules (show until completion).
- [ ] Auto-set Quick Start preset to Get Started when appropriate.
- [ ] Implement tour state machine + resume behavior.
- [ ] Implement overlay/anchor system (touch passthrough on highlighted element).
- [ ] Wire steps across Insights -> Quick Start -> Workout -> Recap.

### Tests + QA

- [ ] Unit tests: tour state model (skip/completed/versioning).
- [ ] Unit tests: Get Started completion logic (by programId/workoutId).
- [ ] Manual QA on device:
  - [ ] entitled user: tour runs once, resumes after background, skip works
  - [ ] not entitled: tour never runs
  - [ ] complete Get Started: Started card disappears, recap visible (or fallback)
  - [ ] restart app mid-tour: resumes correctly
