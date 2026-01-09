# Exercise Library Roadmap

Tracking rules
- Status values: Not started / In progress / Done / Blocked
- Update cadence: update status + "Last updated" when any task changes
- Evidence links: add PRs/screenshots/notes under each phase

Decisions (2026-01-09)
- Target curated size: 350 (within 250-400)
- Default UX: curated canonical results only; variants accessible from canonical detail
- Base dataset: 873 public exercises in Supabase; use curated-exercises.json (307) as initial curated list
- Keep 1500 export as offline/reference only (not default)

## Phase 0: Audit + Snapshot (Status: Not started)
Last updated: TBD
- [ ] Export public exercises to library-snapshot.json (id, name, slug, equipment, muscles, is_custom, created_by)
- [ ] Summary report: total public, total curated, top duplicate clusters, missing basics check
- [ ] Confirm live counts in Supabase (public vs custom)
Evidence:
- None
Acceptance criteria:
- Snapshot + report committed and shareable

## Phase 1: Canonical Layer (Schema + Indexes) (Status: Not started)
Last updated: TBD
- [ ] Add columns: canonical_id, canonical_key, aliases, is_hidden, is_curated, source, normalized_name
- [ ] Indexes: GIN(aliases), (is_curated, is_hidden, canonical_id)
- [ ] Unique index: (created_by, normalized_name) WHERE is_custom = true
Evidence:
- None
Acceptance criteria:
- Schema migration applied and verified

## Phase 2: Curation Manifest + Apply (Status: Not started)
Last updated: TBD
- [ ] Build exercise-library-manifest.json from curated-exercises.json
- [ ] Map variants to canonical_id
- [ ] Populate aliases for search
- [ ] Flag junk/obscure items as is_hidden
- [ ] Apply hide vs variant rules (modifiers -> variant, obscure rehab/mobility -> hidden by default)
- [ ] Validate curated canonicals have valid muscle taxonomy entries
- [ ] Generate SQL migration to apply manifest updates
Evidence:
- None
Acceptance criteria:
- Curated canonical set present and searchable

## Phase 3: Client Search + Browse Behavior (Status: Not started)
Last updated: TBD
- [ ] Default fetch: is_curated = true AND is_hidden = false AND canonical_id IS NULL
- [ ] Variants list on canonical detail (canonical_id = this.id)
- [ ] Search index includes aliases + synonym map (manual)
- [ ] Optional "More results" to include non-curated public exercises (deferred unless needed)
Evidence:
- None
Acceptance criteria:
- Searching "pull up" returns Pull-Up first
- No clutter in default browse/search

## Phase 4: Custom Exercises (Insights-safe) (Status: Not started)
Last updated: TBD
- [ ] Custom creation requires primary muscle group
- [ ] Optional secondary muscles + equipment
- [ ] Optional "Based on" canonical exercise (link via canonical_id or based_on_exercise_id)
- [ ] Store custom muscles in normalized format for analytics/insights
Evidence:
- None
Acceptance criteria:
- Custom exercise appears in search immediately
- Insights still group by muscle reliably

## Phase 5: Basics Acceptance List (Status: Not started)
Last updated: TBD
- [ ] Create exercise-basics-acceptance.json (canonical_key + aliases)
- [ ] Ensure each is canonical + curated + has aliases
- [ ] Add validation check in curation pipeline
Evidence:
- None
Acceptance criteria:
- All basics are present as canonical curated items

---

# Implementation Addendum (Definitions + Guardrails)

## Normalized name definition
- Lowercase
- Strip punctuation
- Normalize hyphens/slashes to spaces
- Collapse whitespace
- Trim

## Canonical key definition
- Stable snake_case key for canonicals (e.g., pull_up, bench_press)
- Used for basics acceptance checks and alias mapping

## Canonical + variant rules
- Canonical row: canonical_id IS NULL
- Variant row: canonical_id = canonical exercise id
- Hidden rows never appear in default browse/search
Hide vs variant:
- Minor modifier (grip width, angle, implement) -> variant
- Obscure rehab/mobility or redundant noise -> hidden by default
- Unknown/typo -> hidden or mapped after review

## Synonym starter map (manual)
- pull up / pullup / chin up / chinup
- ohp / overhead press / military press / shoulder press
- rdl / romanian deadlift
- lat pulldown / pull down / pulldown
- hip thrust / barbell hip thrust / glute bridge
- dip / dips / parallel bar dip
- bench / bench press
- incline bench / incline press
- deadlift / conventional deadlift
- squat / back squat
- lateral raise / side raise
- triceps pushdown / pressdown
- dumbbell bench / db bench
- face pull / facepull
- pullup / pulldown / dumbbell / dumbell
