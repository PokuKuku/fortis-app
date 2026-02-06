# In-App Tour / Demo (One-Time)

We will **plan first**, then implement.

## Product Behavior (Requirements)

- Runs **only once per user**.
- Trigger: **first session after** `onboarding_completed = true` **AND** user is **paid or free-trial**.
- Persist (server): `has_seen_in_app_tour`, `tour_completed_at`, `tour_version`.
- If app backgrounds mid-tour, resume gracefully (still the same one tour).
- Include **Skip** (still sets `has_seen_in_app_tour = true`).
- Teach the core **workout basics** (rest timer) after the workout opens.
- No new screens: anchored overlays/tooltips on real UI elements.

---

## Proposed Tour (v5)

### Happy Path Flow

1) User finishes onboarding + paywall (entitled) -> lands on Programs tab.
2) Tour welcomes the user (intro text).
3) Tour explains Workouts + Programs (templates + drag-and-drop).
4) Tour highlights Fortis AI chat and asks the user to open it.
5) In the chat, explain what Fortis AI can be used for.
6) Tour highlights the Quick Start FAB to set a default (Get Started).
7) Tour asks the user to tap the FAB again to start the workout.
8) In workout, highlight the **rest timer** control and how it works.
9) In workout, explain how to set the **rest timer duration**.
10) Workout closes automatically, then the user taps Insights.
11) Insights intro finishes the tour.

### Step Sequence + Copy

Notes:
- Each step is anchored to a real UI element.
- “Advance” describes how we move to the next step.
- After closing the workout, the user manually taps the Insights tab.

| Step | Screen/Route | Anchor | Copy | Advance |
|---:|---|---|---|---|
| 1 | `/(tabs)/index` | n/a | Welcome to Fortis! Congrats on committing to your fitness journey! Now let’s show you around. | Tap Next |
| 2 | `/(tabs)/index` | Workouts header | Workouts are exercise templates. Programs group workouts—drag a workout card into a program to add it. | Tap Next |
| 3 | `/(tabs)/index` | AI chat button | Tap to open the Fortis AI chat. | Tap AI button |
| 4 | `/ai/chat` | n/a | Fortis helps with training analysis and insights on your data—weekly progress, trends, and what to do next. Ask about your training insights, weekly progress, trends, and what to focus on next. | Tap Next |
| 5 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | Tap the dumbbell, select “Get Started,” and confirm to set your default workout. | Tap FAB |
| 6 | `/(tabs)/index` | Quick Start FAB (Dumbbell) | Now tap the dumbbell to start your workout. | Tap FAB |
| 7 | `/workout/active` | Rest timer control | **Rest Timer** keeps you on pace between sets. Tap to start/pause and adjust anytime. | Tap Next |
| 8 | `/workout/active` | Clock icon | Use the clock to set your rest timer duration. | Tap Next |
| 9 | `/(tabs)` | Insights tab | Next, tap Insights to see your progress. | Tap Insights tab |
| 10 | `/(tabs)/insights` | n/a | Insights power Fortis AI—tap "Ask Fortis" on any insight to get a breakdown and next steps. | Tap Done |

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
- After the rest timer steps, the workout closes automatically.
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
- `fortis-mobile-app/app/(tabs)/_layout.tsx` (register anchor for AI chat button)
- `fortis-mobile-app/src/components/workout/WorkoutHeader.tsx` (register rest timer + rest timer settings anchors)
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
- [ ] AI chat button is introduced before Quick Start (tap to open chat).
- [ ] Chat explainer step shows in `/ai/chat`.
- [ ] Quick Start FAB prompts setting a default, then prompts tapping to start the workout.
- [ ] Rest timer steps show once the workout starts (timer + duration).
- [ ] Workout closes automatically after the rest timer steps, then user taps Insights.
- [ ] Tour completes after the Insights intro step.
