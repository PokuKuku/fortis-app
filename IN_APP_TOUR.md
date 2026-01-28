# In-App Tour / Demo (One-Time)

We will **plan first**, then implement.

## Product Behavior (Requirements)

- Runs **only once per user**.
- Trigger: **first session after** `onboarding_completed = true` **AND** user is **paid or free-trial**.
- Persist (server): `has_seen_in_app_tour`, `tour_completed_at`, `tour_version`.
- If app backgrounds mid-tour, resume gracefully (still the same one tour).
- Include **Skip** (still sets `has_seen_in_app_tour = true`).
- Introduce **Workout Recap**: completing a workout generates a recap and where to find it.
- No new screens: anchored overlays/tooltips on real UI elements.

---

## Proposed Tour (v2)

### Happy Path Flow

1) User finishes onboarding + paywall (entitled) -> lands on Programs tab.
2) Tour starts on Programs -> points to Quick Start FAB.
3) Start config modal opens; user is forced to set **Get Started**.
4) User presses the Start FAB to launch the **Get Started** workout.
5) User finishes workout (3 pushups).
6) App auto-navigates to Insights; tour completes.

### Step Sequence + Copy

Notes:
- Each step is anchored to a real UI element.
- “Advance” describes how we move to the next step.
- After workout completion, we auto-navigate to Insights and mark the tour complete (no tooltip).

| Step | Screen/Route | Anchor | Copy | Advance |
|---:|---|---|---|---|
| 1 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | **This button starts your default workout.** Set **Get Started** now, and press & hold anytime to change it later. | Tap FAB |
| 2 | Start Config Modal | **Get Started** option | Tap **Get Started** and confirm to lock in your default. | Confirm selection (forced) |
| 3 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | Now press the dumbbell Start button to launch your workout. | Tap FAB |
| 4 | `/workout/active` | “Finish Workout” button | Do 3 pushups, then tap **Finish**. | Wait for workout completion |
| 5 | `/(tabs)/insights` | n/a | Auto-navigate to Insights; mark tour complete. | Done |

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
- Before any workout, set expectation (“you’ll see a recap after finishing”).
- After Get Started completion, navigate to Insights.

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
- `fortis-mobile-app/app/workout/active.tsx` (register Finish button anchor)
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
  - Keep tour in “in progress”; after they finish any workout, auto-navigate to Insights and complete.

---

## Implementation Checklist

### Confirm + Align

- [ ] Tour starts on Programs tab with Quick Start FAB anchor.
- [ ] Step 2 is forced inside Start config modal.
- [ ] Step 3 prompts tapping the FAB to launch Get Started.
- [ ] Get Started workout is 1 set of 3 pushups.
- [ ] Auto-navigate to Insights after workout completion; no tooltip on Insights.

