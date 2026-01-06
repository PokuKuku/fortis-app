# Training Intelligence Roadmap (Insights)

Tracking rules
- Status values: Not started / In progress / Done / Blocked
- Update cadence: update status + "Last updated" when any task changes
- Evidence links: add PRs/screenshots/analytics notes under each phase

## Phase 0: Foundations (Status: Not started)
Last updated: TBD
- [ ] Confirm IA change: replace Exercises tab with Insights
- [ ] Add "Exercise Library" entry in Settings/Profile
- [ ] Define insight types, evidence schema, and recommendation schema
- [ ] Decide compute model (server-only vs hybrid)
- [ ] Define conservatism settings (Chill / Standard / Aggressive)

## Phase 1: Insights Feed MVP (Status: Not started)
Last updated: TBD
- [ ] Persisted insights storage (server-side source of truth)
- [ ] Weekly Verdict generator using existing analytics views
- [ ] Insights tab feed with cached load (<300ms)
- [ ] Card layout: title, summary, 2-4 evidence bullets, "Why?" CTA
- [ ] Contextual chat opens with insightId + evidence reference
Acceptance criteria:
- Weekly Verdict always shows with 2+ evidence bullets
- Insights load from cache under 300ms

## Phase 2: Lift Watchlist (Status: Not started)
Last updated: TBD
- [ ] Per-exercise weekly aggregates (server-side)
- [ ] Lift Stall Risk logic (flat/declining e1RM + volume)
- [ ] Watchlist card (top 3-5 lifts)
- [ ] "Not enough data yet" empty state
Acceptance criteria:
- Stall risk matches defined window and shows evidence values
- Watchlist never shows for lifts with <3 exposures

## Phase 3: Fatigue + Balance + Feedback (Status: Not started)
Last updated: TBD
- [ ] Fatigue Risk logic (volume spike + e1RM drop)
- [ ] Imbalance Flag logic (muscle group ratio or underdose)
- [ ] Evidence detail view ("Why am I seeing this?")
- [ ] Helpful / Not helpful feedback capture
Acceptance criteria:
- No more than 3 cards per refresh unless user is very active
- Feedback can suppress noisy cards over time

## Phase 4: One-tap Actions (Optional) (Status: Not started)
Last updated: TBD
- [ ] Recommendation actions schema wired to templates/programs
- [ ] Apply + Undo flow with audit log
- [ ] Track whether changes improved outcomes
Acceptance criteria:
- User can apply an action and undo it safely
