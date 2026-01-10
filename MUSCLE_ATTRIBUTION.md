# Heatmap + Muscle Attribution Plan (Draft)

This document captures our current plan to fix muscle attribution across the app. The goal is to make heatmap coloring and muscle lists accurate, consistent, and volume-based so users see a true representation of what they trained.

We’ll use this as a briefing for ChatGPT collaborators: it summarizes the existing architecture, the confirmed target behavior, the problem areas, and the decisions still needed before implementation.

## Goal
- Make heatmap attribution accurate and volume-based.
- Standardize muscle labels and listing behavior with a single source of truth.
- Use primary muscles only for listing/filtering for now.

## Desired Behavior (Confirmed)
- Heatmap intensity is based on **volume**.
- Primary vs secondary weights: **1.0 / 0.5**.
- Heatmap uses **5 intensity levels** with relative scaling.
- Muscle listings/filters use **primary muscles only**.
- Labels should be **more specific** (moderate granularity).

## Current Architecture (Where It Breaks)
- **Multiple normalization layers**:
  - `src/utils/muscleMapping.ts`
  - `src/components/workout/MuscleHeatmap.tsx` (slug + alias rules)
  - `app/profile/share.tsx` (normalizeGroup)
  - `src/services/insightChartsService.ts` (normalizeMuscleGroup)
- **Heatmap ignores volume**:
  - `app/workout/active.tsx` computes `muscleWeights` with a `weight` (set count), but `MuscleHeatmap` ignores it.
- **Weekly heatmap is presence-based**:
  - `useWeeklyMuscles` only pulls unique exercise IDs for the week.
- **Custom exercises use a small Title-Case list**:
  - `PRIMARY_MUSCLES` in `src/constants/exerciseOptions.ts` doesn’t match base DB labels.

## Decisions (Locked)
1) **Volume definition (heatmap intensity)**
   - `setUnits = weightKg * reps` when both exist.
   - If bodyweight movement and reps exist:
     - If user bodyweight is known: `setUnits = bodyweightKg * reps`.
     - Else: `setUnits = reps` (fallback).
   - If reps missing but set completed: `setUnits = 1` (fallback).
   - Warmup / incomplete / zero reps / zero weight => `setUnits = 0`.
   - Apply weights: primary * 1.0, secondary * 0.5.
2) **Intensity scaling**
   - 5 levels, relative to the window (session/week/4w).
   - Normalize by max muscle score, then bucket:
     - `< 0.08 => 0`, `< 0.20 => 1`, `< 0.40 => 2`, `< 0.65 => 3`, `< 0.85 => 4`, else `5`.
3) **Granularity**
   - Moderate canonical keys (not overly split):
     - chest
     - front_delts / side_delts / rear_delts
     - triceps / biceps / forearms
     - lats
     - upper_back
     - lower_back
     - abs / obliques
     - glutes
     - quads
     - hamstrings
     - calves
     - adductors / abductors (optional)
     - neck (optional)
4) **Heatmap slug constraints**
   - Multiple canonical keys can map to the same slug(s); acceptable for visualization.

## Proposed Direction (Implementation Brief)
1) **Single canonical muscle module**
   - New module (e.g., `src/utils/muscleTaxonomy.ts`) owns:
     - `MuscleKey` type
     - `MUSCLE_DISPLAY` (canonical display labels)
     - `normalizeMuscle(input)` → `MuscleKey | null`
     - `MUSCLE_TO_HEATMAP_REGIONS` mapping to body-highlighter slugs + side
2) **Deterministic volume-based attribution**
   - `computeSetUnits(set, userBodyweightKg?)`
   - `attributeSessionToMuscles(session, exercisesById, userBodyweightKg?)`
3) **Unified heatmap data**
   - Create `useWeeklyMuscleHeatmapData` (or update `useWeeklyMuscles`) to aggregate volumes + compute intensity buckets.
4) **Replace duplicate normalizers**
   - Route `muscleMapping`, `MuscleHeatmap`, `profile/share`, `insightChartsService` through the canonical module.
5) **Listing/filter behavior**
   - Use canonical **primary** muscles only.
   - Custom exercise creation stores canonical muscles; UI displays canonical labels.
6) **Acceptance checks**
   - Volume changes alter heatmap intensities.
   - All screens show consistent labels and grouping.
   - Mapping is deterministic with no casing mismatches.

## Open Decisions (Remaining)
1) **Canonical labels to finalize**
   - Exact display names for each canonical key.
   - Confirm whether adductors/abductors/neck are in or out.
2) **Bodyweight detection**
   - Define how to detect bodyweight movements (equipment = bodyweight? exercise metadata?).
3) **User bodyweight source**
   - Where to read bodyweight for volume fallback (profile? settings?).
4) **Historic data**
   - Whether to backfill canonical muscles for existing custom exercises.

## Next Steps (Once Decisions Are Final)
1) Inventory existing muscle strings from base + custom exercises.
2) Draft canonical label list + alias/normalization table.
3) Implement volume-based attribution + 5-level intensity scaling.
4) Update heatmap and all listings/filters to use canonical primary-only labels.
5) Remove duplicate normalizers and route all muscle mapping through one module.
