# Training Intelligence Roadmap (Insights)

Tracking rules
- Status values: Not started / In progress / Done / Blocked
- Update cadence: update status + "Last updated" when any task changes
- Evidence links: add PRs/screenshots/analytics notes under each phase
- North Star: INSIGHTS_NORTH_STAR.md

## Phase 0: Foundations (Status: Done)
Last updated: 2026-01-07
- [x] Confirm IA change: replace Exercises tab with Insights
- [x] Add one-tap Exercise Library entry point (Settings/Profile + Insights shortcut/search)
- [x] Define insight types (finite enum) and versioning
- [x] Define evidence item schema (key, label, value, unit, compareValue, deltaValue, source)
- [x] Define recommendation schema (type, payload, rationaleKey)
- [x] Decide compute model: server-truth + client-render (define offline stance)
- [x] Define conservatism thresholds (Chill / Standard / Aggressive)
Evidence:
- Local changes (no PR yet)

## Phase 1: Insights Feed MVP (Status: Done)
Last updated: 2026-01-07
- [x] Persisted insights storage (server-side source of truth)
- [x] Weekly Verdict generator using existing analytics views
- [x] Dedupe/upsert policy for Weekly Verdict (natural key per user + window)
- [x] Insights tab feed with cached load (<300ms)
- [x] Card layout: title, summary, 2-4 evidence bullets, "Why?" CTA
- [x] Contextual chat anchored to insightId; server fetches insight row
- [x] Prompt contract: explain only provided evidence, no invented metrics
Evidence:
- Local changes (no PR yet)
Acceptance criteria:
- Weekly Verdict always shows with 2+ evidence bullets
- Insights load from cache under 300ms
- No duplicate Weekly Verdict per user per window

## Phase 2: Lift Watchlist (Status: Done)
Last updated: 2026-01-07
- [x] Per-exercise weekly aggregates (server-side)
- [x] Define top lifts selection method (frequency or volume) and window
- [x] Define exposure rule (completed session with >=1 working set)
- [x] e1RM guardrails (exclude warmups, cap reps, ignore incomplete sets)
- [x] Lift Stall Risk logic (flat/declining e1RM + volume)
- [x] Watchlist card (top 3-5 lifts)
- [x] "Not enough data yet" empty state
Evidence:
- Local changes (no PR yet)
Acceptance criteria:
- Stall risk matches defined window and shows evidence values
- Watchlist never shows for lifts with <3 exposures

## Phase 2.5: Trust + Habit Hardening (Status: Done)
Last updated: 2026-01-07
- [x] Server-side week boundaries using profile timezone
- [x] Guardrail for suspicious deltas (suppress volume delta when implausible)
- [x] Watchlist states: all clear / not enough data
- [x] Watchlist reason line + bounded suggestion
- [x] Dismiss insight + snooze type for 14 days
- [x] Instrumentation: insights_viewed, verdict_why_tapped, watchlist_item_opened, chat_opened_from_insight, insight_dismissed
Evidence:
- Local changes (no PR yet)

## Phase 2.75: Evidence Graphs (Status: Done)
Last updated: 2026-01-07
- [x] Inline sparklines on insight cards (evidence layer)
- [x] Sparkline metric labels (explicit: Weekly volume / e1RM)
- [x] Chart detail view with segmented tabs (Progress / Volume / Frequency)
- [x] Insight-to-chart mapping + highlighted windows/exposures
- [x] Evidence ordering aligned to chart mapping
- [x] Server-truth chart series (weekly volume + workouts, per-exercise e1RM, exposures)
- [x] Cached chart data client-side for fast open
Evidence:
- Local changes (no PR yet)

## Phase 3: Fatigue + Balance + Feedback (Status: Done)
Last updated: 2026-01-08
- [x] Fatigue Risk logic (volume spike + e1RM drop)
- [x] Fatigue risk card UI + wiring (server-truth persisted insights)
- [x] Imbalance Flag logic (muscle group ratio or underdose)
- [x] Evidence detail view ("Why am I seeing this?")
- [x] Helpful / Not helpful feedback capture
- [x] Feedback suppression rules (suppress type + raise thresholds after 1 not helpful)
- [x] Card priority ordering (Weekly Verdict always, then high severity)
- [x] Dismiss/snooze insight cards or types
- [x] Instrumentation: impressions, "Why?" taps, chat opens, retention
- [x] Validation pass with realistic datasets (feedback suppression confirmed)
Evidence:
- Seeded realistic data for pokubimpong@gmail.com; fatigue card suppressed after 2x "not helpful"
Acceptance criteria:
- No more than 3 cards per refresh unless user is very active
- Feedback can suppress noisy cards over time
- Dismissed cards stay hidden for the window

## Phase 3.5: Early Value + Positive Insights + Sharing (Status: Done)
Last updated: 2026-01-08
- [x] FIRST_WORKOUT_RECAP_V1 generator (baseline recap after first completed session)
- [x] Session-based chart for recap (per-exercise volume breakdown)
- [x] CONSISTENCY_STREAK_V1 (milestone streaks)
- [x] WEEKLY_VOLUME_PR_V1 (12-week best with +5% threshold)
- [x] Share preview + privacy toggle (private/detailed)
- [x] Share instrumentation: share_started, share_completed
- [x] Feed ordering: Weekly insight → risks → one positive (first workout recap always shown for new users)
Evidence:
- Implemented in code; share requires dev client rebuild, insights require function deploy

## Phase 4: One-tap Actions (Optional) (Status: Not started)
Last updated: TBD
- [ ] Recommendation actions schema wired to templates/programs
- [ ] Apply + Undo flow with audit log
- [ ] Track whether changes improved outcomes
Acceptance criteria:
- User can apply an action and undo it safely
- Actions only update templates/programs, not historical sessions

---

# Implementation Addendum (Definitions + Contracts)

## Insight Types (versioned enums)
- WEEKLY_VERDICT_V1
- LIFT_STALL_RISK_V1
- FATIGUE_RISK_V1
- IMBALANCE_FLAG_V1
- FIRST_WORKOUT_RECAP_V1
- CONSISTENCY_STREAK_V1
- WEEKLY_VOLUME_PR_V1
- Optional later: PR_READINESS_V1, CONSISTENCY_FLAG_V1

## Severity enum
- low / medium / high

## Window enum
- 7d / 4w / 12w

## EvidenceItem schema (JSON)
Required
- key: string (stable machine key, e.g., volume_load, best_e1rm, sessions, hard_sets)
- label: string (UI label)
- value: number
- unit: string (lb, kg, sets, workouts, %, e1rm)
Optional
- compareValue: number
- deltaValue: number
- source: string (weekly_workout_volume, exercise_weekly_agg, etc.)
- period: string (this_week, last_week, last_4w, prev_4w)
- schemaVersion: string (for backward compatibility)

## Recommendation schema (JSON array)
Each item
- type: enum
- ADD_SETS
- DELOAD
- CHANGE_REP_RANGE
- INCREASE_FREQUENCY
- SWAP_ACCESSORY
- payload: object (typed by action type)
- rationaleKey: enum
- STALL_LOW_STIMULUS
- STALL_TECHNIQUE_VARIATION (optional)
- FATIGUE_ACCUMULATION
- IMBALANCE_UNDERDOSED
- CONSISTENCY_LOW (optional)

## Conservatism thresholds (numeric)
Chill
- volumeSpikeWoW: +40%
- e1rmDropForFatigue: -2.5%
- stallFlatE1rmPct: +0.0% over 3 exposures
- minExposures: 3
- suggestionAddSetsMax: +1 set/week

Standard
- volumeSpikeWoW: +30%
- e1rmDropForFatigue: -2.0%
- stallFlatE1rmPct: +0.5% over 3 exposures
- minExposures: 3
- suggestionAddSetsMax: +2 sets/week

Aggressive
- volumeSpikeWoW: +20%
- e1rmDropForFatigue: -1.5%
- stallFlatE1rmPct: +1.0% over 3 exposures
- minExposures: 3
- suggestionAddSetsMax: +2 sets/week

Caps
- Never recommend > +10% weekly volume increase in one step
- Deload recommendation: reduce sets 20-30% for 1 week

## Insight dedupe/upsert (natural keys)
Anchor date
- WEEKLY_VERDICT_V1: week_start in user timezone
- Other types: use current period start for window; include exercise_id or muscle_group when applicable
Uniqueness (logical)
- user_id + type + window + anchor_date + (exercise_id nullable) + (muscle_group nullable)

## Source-of-truth rule
- Mobile renders only persisted insights (no local computation of evidence)
- Chat always receives insightId; server fetches insight row and uses its evidence/recommendations

## Prompt contract (enforceable)
- Use only evidence values from the insight record; do not invent metrics
- Output: 1 diagnosis sentence + 1-3 recommended changes
- Ask at most one question if critical context is missing

## Phase 2 definitions
Top lifts selection (recommended: frequency)
- Look back 6 weeks
- Rank exercises by count of distinct completed sessions containing >=1 working set
- Take top 5; display 3-5

Exposure definition
- One exposure = one completed session with >=1 completed non-warmup working set

e1RM guardrails
- Epley: weight * (1 + min(reps, 12)/30)
- Exclude warmups, incomplete sets, non-positive reps/weight
- Normalize units before computing

Stall risk trigger (V1)
- Use last 3 exposures within 6 weeks
- Trigger if e1rm_delta_pct <= stallFlatE1rmPct AND volume_delta_pct <= +5%
- Severity: medium if flat/slight down; high if e1rm down and volume up
Evidence
- Best e1RM (3 exposures): X -> Y
- Weekly sets or volume: A -> B

## Phase 3 definitions
Fatigue risk trigger (V1)
- volume_spike_pct >= volumeSpikeWoW AND best_e1rm_delta_pct <= e1rmDropForFatigue
Evidence
- Volume WoW %
- Best e1RM WoW %
Recommendation
- Deload 1 week (reduce sets 20-30%) or keep intensity and reduce volume

Imbalance flag trigger (V1)
- Compute hard sets per muscle group per week (working sets)
- Flag if for 2+ weeks:
  - push/pull ratio outside [0.7, 1.3], or
  - any major group below baseline minimum
Evidence
- Back hard sets: X vs Chest: Y
Recommendation
- Add sets to underdosed group or swap accessory

Feedback suppression
- If "not helpful" for a type >=2 times in 30 days, suppress for 14 days or raise thresholds by +10%
Card cap per refresh
- Weekly Verdict always
- Then severity desc, created_at desc
- Max 3 unless sessions_this_week >= 5 (then allow 4)

Dismiss/snooze
- Dismiss: status=dismissed; hide until anchor_date changes
- Snooze type: store until_date in user prefs

## Phase 4 safety
Action invariants
- Actions only mutate templates/programs, never completed sessions
- Each action writes an audit record (before/after + insight_id)
- Undo restores the prior snapshot

## Insights refresh trigger
- After successful sync of a completed session, trigger:
  - aggregate refresh for that user
  - generate/upsert insights for current anchor_date
