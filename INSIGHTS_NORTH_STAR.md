# Insights Feature North Star (Phase 1 MVP)

Purpose of the Insights feature

We are turning the app from "a workout logger" into "training intelligence." The Insights page should proactively tell the user what’s happening in their training, using their real logged data, without them needing to ask. This creates a habit loop (check weekly verdict/watchlist) and provides a clean paid value boundary later (free = logging, paid = interpretation).

For the MVP, the goal is not a perfect AI coach. The goal is to ship a fast, trustworthy Insights feed with one always-on card: Weekly Verdict. The AI chat remains, but becomes contextual ("Explain this insight") rather than being the primary interface.

What value the user should feel

When a user opens Insights, they should immediately feel:
- "This app understands my training week."
- "I can see if I’m progressing, maintaining, or accumulating fatigue."
- "It gives me a concrete next step (keep going / add a little stimulus / consider a deload)."
- "It’s backed by numbers I trust."

This should work even if the user never opens chat. Chat is a drill-down for "why" and "what should I change."

Implementation principles the agent must follow
1. Server is the source of truth. Insights must be computed server-side and persisted, so they load instantly and are consistent across devices.
2. AI does not compute numbers. The app computes metrics deterministically (SQL/views/aggregates) and stores them as evidence. AI only explains what’s already computed.
3. No noise. Start with one card that always appears. Don’t generate lots of low-confidence insights.
4. Trust by evidence. Every insight shows 2–4 evidence bullets with real numbers and comparisons.

What exactly to build (Phase 1 MVP scope)

A) Database: persisted insight storage
Create a training_insights table (or equivalent) in Supabase with:
- id (uuid)
- user_id
- created_at
- type (finite enum string, start with WEEKLY_VERDICT_V1)
- window (e.g. 7d)
- anchor_date (the week start date; used for dedupe)
- severity (low/medium/high)
- title (text)
- summary (text)
- evidence (jsonb array)
- recommendation (jsonb array; can be empty in MVP)
- status (active/dismissed)

Add RLS so users can only read their own insights. Index on (user_id, created_at desc) and (user_id, type, window, anchor_date) for upsert/dedupe.

Evidence schema (must be consistent)
Each evidence item is an object with:
- key (stable machine key)
- label (UI label)
- value (number)
- unit (string)
Optional:
- compareValue (number)
- deltaValue (number)
- source (string)

Example evidence array:
- sessions: this week vs last week
- volume_load: this week vs last week
- prs: count this week (if available)

B) Insight generator: Weekly Verdict
Implement a server-side generator that produces exactly one weekly verdict per user per week.

Inputs:
- use existing analytics views you already have (weekly volume, workout stats, PRs, etc.)
- compute "this week" vs "last week" stats

Output:
- Upsert into training_insights with:
  - type: WEEKLY_VERDICT_V1
  - window: 7d
  - anchor_date: start of current week
  - title + one-sentence summary
  - 2–4 evidence bullets

Dedupe rule:
- Upsert by natural key: user_id + type + window + anchor_date

Triggering:
- Call generator after a completed workout sync (best)
- Optionally also run daily or weekly via schedule to keep it fresh

Verdict logic (simple and deterministic)
Use a small decision tree based on volume + sessions + PRs:
- If sessions and volume up and PRs > 0 -> "Great week, keep going."
- If volume up but performance/PRs down or none -> "Volume increased; watch fatigue, consider holding intensity steady."
- If sessions/volume down -> "Lower training load this week; next week aim for consistency."
- If brand new user with not enough data -> "Log 2+ sessions to unlock deeper insights."

C) Mobile UI: Insights screen + feed
Add an Insights tab/screen that:
- fetches training_insights for the logged-in user (active status, most recent first)
- renders cards with:
  - title
  - summary
  - 2–4 evidence bullets
  - "Why?" button

Performance goal:
- should load very fast (use cached query data immediately; refresh in background)

IA requirement:
- If replacing the Exercises tab, ensure Exercise Library is still one tap away (via Insights search/shortcut and via Settings/Profile).

D) Contextual chat integration (minimal)
Keep the existing chat screen, but make it open from an insight card with context.

Changes:
- Add insightId to the AI request context type.
- When "Why?" is tapped, open chat with that insightId.
- In the AI Edge Function, fetch the insight row by id and include it in the prompt context.
- Prompt rule: explain only the evidence provided; do not invent metrics; propose 1–3 next-week adjustments.

What "done" means (Phase 1 acceptance criteria)
- Weekly Verdict exists for every user-week (or shows a "not enough data" verdict).
- No duplicates: only one weekly verdict per user per week.
- Each verdict displays at least 2 evidence bullets.
- Insights screen renders quickly and reliably.
- "Why?" opens chat, and the response references the evidence values (not vague generic advice).

Non-goals for this phase (explicitly out of scope)
- Lift stall detection (Phase 2)
- Fatigue and imbalance flags (Phase 3)
- One-tap apply actions that modify programs (Phase 4)
- Complex personalization beyond basic conservatism setting

Extra notes for the agent (to avoid mistakes)
- Always exclude warmups and incomplete sets in any future aggregates.
- Normalize weight units server-side before comparing volume.
- Prefer "fewer insights, higher confidence" to avoid user distrust.
- Persist insights so the UI never depends on AI being available to show value.
