# Backend & Database Design Plan

## Overview

Design a minimal backend architecture and database schema to support all Fortis features while remaining simple and extensible. This builds upon the existing schema in `supabase/schema.sql`.

**Security is the top priority.** Every table, function, and endpoint must be designed with defense-in-depth. AI read/write access requires strict boundaries.

---

## Security Architecture (TOP PRIORITY)

### Core Security Principles

1. **Zero Trust** - Every request is untrusted until validated
2. **Least Privilege** - AI and users only access what they need
3. **Defense in Depth** - Multiple layers of protection
4. **Audit Everything** - All AI actions are logged and reversible
5. **Fail Secure** - Errors deny access, never grant it

### Row Level Security (RLS) - Mandatory for ALL Tables

Every table MUST have RLS enabled with explicit policies. No exceptions.

```sql
-- Template for ALL new tables
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (prevents bypass)
ALTER TABLE {table_name} FORCE ROW LEVEL SECURITY;

-- Default deny - no access without explicit policy
-- (This is PostgreSQL's default when RLS is enabled)
```

### AI Access Control

AI operates through a **service role with restricted permissions**, never as the user directly.

#### AI Permission Boundaries

```sql
-- AI can ONLY access these tables for READ
-- workout_sessions, workout_sets, exercises, workout_programs,
-- program_workouts, program_exercises, user_program_progress,
-- exercise_sticky_notes, session_exercise_notes

-- AI can ONLY access these tables for WRITE (with audit)
-- workout_programs, program_workouts, program_exercises,
-- workout_sessions (logging on behalf), workout_sets (logging on behalf)

-- AI CANNOT access (ever)
-- profiles (except read-only: units, timezone)
-- subscriptions
-- auth.users
-- ai_mutations (read-only for display, no direct writes from AI)
```

### AI Note Access for Personalization

The AI can read user notes to provide personalized responses. There are two types:

#### 1. Sticky Notes (Persistent, High Weight)
- Attached to exercises, persist across all sessions
- Examples: "Bad shoulder - avoid going too heavy", "Focus on mind-muscle connection"
- **AI Usage**: These reveal qualitative information about the user's body, preferences, or training philosophy. Weight heavily in recommendations.

#### 2. Session Exercise Notes (Temporary, Medium Weight)
- Attached to exercises within a specific session
- Examples: "Felt weak today", "New PR attempt", "Testing wider grip"
- **AI Usage**: Context for that specific session. Consider when analyzing that workout, but don't generalize to other sessions.

#### Note Quality Filter
AI must filter out nonsense notes:
```typescript
// Notes to IGNORE:
// - Empty or whitespace-only
// - Single characters or random letters
// - Obvious placeholder text ("asdf", "test", "xxx")
// - Very short notes that lack meaning

// Notes to USE:
// - Complete sentences or meaningful phrases
// - Body/injury information
// - Technique cues
// - Equipment preferences
// - Feeling/fatigue indicators
```

#### Secure Note Access Function
```sql
-- AI calls this function to get all relevant notes for a user
-- Returns both sticky notes and recent session notes
CREATE OR REPLACE FUNCTION get_user_notes_for_ai(p_user_id UUID)
RETURNS TABLE (
  note_type TEXT,           -- 'sticky' or 'session'
  exercise_id UUID,
  exercise_name TEXT,
  content TEXT,
  set_index INTEGER,        -- null for exercise-level notes
  session_date TIMESTAMPTZ, -- null for sticky notes
  session_id UUID           -- null for sticky notes
) AS $$
BEGIN
  -- Security: Only allow access to own notes
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Can only access own notes';
  END IF;

  RETURN QUERY
  -- Sticky notes (persistent)
  SELECT
    'sticky'::TEXT as note_type,
    esn.exercise_id,
    e.name as exercise_name,
    esn.content,
    esn.set_index,
    NULL::TIMESTAMPTZ as session_date,
    NULL::UUID as session_id
  FROM exercise_sticky_notes esn
  JOIN exercises e ON esn.exercise_id = e.id
  WHERE esn.user_id = p_user_id
    AND esn.content IS NOT NULL
    AND char_length(trim(esn.content)) >= 3  -- Filter very short notes

  UNION ALL

  -- Session exercise notes (from last 90 days)
  SELECT
    'session'::TEXT as note_type,
    sen.exercise_id,
    e.name as exercise_name,
    sen.content,
    NULL::INTEGER as set_index,
    ws.started_at as session_date,
    sen.session_id
  FROM session_exercise_notes sen
  JOIN exercises e ON sen.exercise_id = e.id
  JOIN workout_sessions ws ON sen.session_id = ws.id
  WHERE sen.user_id = p_user_id
    AND sen.content IS NOT NULL
    AND char_length(trim(sen.content)) >= 3
    AND ws.started_at > NOW() - INTERVAL '90 days'

  ORDER BY note_type DESC, session_date DESC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### AI Request Validation

```typescript
// All AI requests go through this validator
interface AIRequest {
  user_id: string           // From JWT, not user input
  action: AIActionType      // Enum, not string
  target_entity?: string    // UUID, validated
  payload: unknown          // Sanitized and validated
}

// Allowlist of AI actions - NOTHING else is permitted
type AIActionType =
  | 'read_history'
  | 'read_analytics'
  | 'create_template'
  | 'modify_template'      // Only templates user owns
  | 'create_program'
  | 'modify_program'       // Only programs user owns
  | 'preview_workout_log'  // Preview only, requires confirmation
  | 'confirm_workout_log'  // After user approval
  | 'explain_plateau'
  | 'generate_summary'
```

#### AI Write Flow (Mandatory Confirmation)

```
┌─────────────────────────────────────────────────────────────┐
│                    AI WRITE FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AI generates proposed change                            │
│     ↓                                                       │
│  2. Change stored in PENDING state (ai_pending_actions)     │
│     ↓                                                       │
│  3. User sees preview in UI                                 │
│     ↓                                                       │
│  4. User explicitly confirms OR rejects                     │
│     ↓                                                       │
│  5a. CONFIRM → Execute change, log to ai_mutations          │
│  5b. REJECT → Delete pending action, log rejection          │
│                                                             │
│  ⚠️  AI NEVER writes directly. Always pending → confirm.    │
└─────────────────────────────────────────────────────────────┘
```

### Input Validation & Sanitization

#### SQL Injection Prevention

```sql
-- NEVER use dynamic SQL with user input
-- ALWAYS use parameterized queries

-- ❌ DANGEROUS - Never do this
EXECUTE 'SELECT * FROM ' || user_input;

-- ✅ SAFE - Always do this
SELECT * FROM exercises WHERE id = $1;
```

#### Text Field Limits

```sql
-- All text fields have explicit limits
content TEXT NOT NULL CHECK (char_length(content) <= 10000),
title TEXT NOT NULL CHECK (char_length(title) <= 500),
notes TEXT CHECK (char_length(notes) <= 5000),

-- AI-generated content has stricter limits
ai_prompt_summary TEXT CHECK (char_length(ai_prompt_summary) <= 1000),
summary_text TEXT NOT NULL CHECK (char_length(summary_text) <= 50000),
```

#### UUID Validation

```sql
-- All entity references must be valid UUIDs
-- Foreign keys enforce this, but also validate in application layer

CREATE OR REPLACE FUNCTION is_valid_uuid(input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN input::UUID IS NOT NULL;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Rate Limiting

```sql
-- AI action rate limits per user
CREATE TABLE ai_rate_limits (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- Rolling window counters
  actions_this_minute INTEGER DEFAULT 0,
  actions_this_hour INTEGER DEFAULT 0,
  actions_this_day INTEGER DEFAULT 0,

  -- Timestamps for window reset
  minute_window_start TIMESTAMPTZ DEFAULT NOW(),
  hour_window_start TIMESTAMPTZ DEFAULT NOW(),
  day_window_start TIMESTAMPTZ DEFAULT NOW(),

  -- Limits (can be adjusted per subscription tier)
  max_per_minute INTEGER DEFAULT 10,
  max_per_hour INTEGER DEFAULT 100,
  max_per_day INTEGER DEFAULT 500
);

-- Check rate limit before AI action
CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limits ai_rate_limits%ROWTYPE;
BEGIN
  SELECT * INTO v_limits FROM ai_rate_limits WHERE user_id = p_user_id;

  -- Reset windows if expired
  IF v_limits.minute_window_start < NOW() - INTERVAL '1 minute' THEN
    v_limits.actions_this_minute := 0;
    v_limits.minute_window_start := NOW();
  END IF;

  -- Check limits
  IF v_limits.actions_this_minute >= v_limits.max_per_minute THEN
    RETURN FALSE;
  END IF;

  -- Increment and allow
  UPDATE ai_rate_limits
  SET actions_this_minute = actions_this_minute + 1
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Secure Share Tokens

```sql
-- Share tokens use cryptographically secure random generation
-- NOT uuid_generate_v4() which is predictable

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  -- 32 bytes of cryptographic randomness, base64 encoded
  -- Results in ~43 character URL-safe token
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Share tokens expire
ALTER TABLE training_summaries
  ADD COLUMN share_expires_at TIMESTAMPTZ,
  ADD COLUMN share_view_count INTEGER DEFAULT 0,
  ADD COLUMN max_share_views INTEGER DEFAULT 1000;
```

### Sensitive Data Protection

```sql
-- Profiles: Users can only see their own data
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- AI can read limited profile fields via secure function
CREATE OR REPLACE FUNCTION get_user_preferences(p_user_id UUID)
RETURNS TABLE (
  preferred_units TEXT,
  timezone TEXT
) AS $$
BEGIN
  -- Only return non-sensitive preferences
  -- NEVER return email, full_name, avatar_url to AI
  RETURN QUERY
  SELECT p.preferred_units, p.timezone
  FROM profiles p
  WHERE p.id = p_user_id
    AND p.id = auth.uid(); -- Double-check auth
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Audit Trail Requirements

```sql
-- AI mutations table with comprehensive audit fields
CREATE TABLE ai_mutations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- What happened
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Full state snapshots (for complete reversibility)
  previous_state JSONB,
  new_state JSONB NOT NULL,

  -- Undo tracking
  is_undone BOOLEAN DEFAULT FALSE,
  undone_at TIMESTAMPTZ,
  undone_by TEXT, -- 'user' or 'system' or 'admin'

  -- Security context
  request_id UUID NOT NULL,           -- Trace ID for the request
  ip_address INET,                     -- For abuse detection
  user_agent TEXT,                     -- For abuse detection

  -- AI context (sanitized, no raw prompts with PII)
  ai_conversation_id TEXT,
  ai_action_summary TEXT,              -- Sanitized description

  -- Immutable timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Prevent tampering
  CONSTRAINT ai_mutations_immutable CHECK (
    -- Once created, these fields cannot change
    -- Enforced via trigger, not just constraint
    TRUE
  )
);

-- Prevent updates to audit records (immutable log)
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating is_undone, undone_at, undone_by
  IF OLD.action_type != NEW.action_type
     OR OLD.entity_type != NEW.entity_type
     OR OLD.entity_id != NEW.entity_id
     OR OLD.previous_state IS DISTINCT FROM NEW.previous_state
     OR OLD.new_state != NEW.new_state
     OR OLD.created_at != NEW.created_at
  THEN
    RAISE EXCEPTION 'Audit records are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_audit_immutability
  BEFORE UPDATE ON ai_mutations
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- No deletes allowed on audit table
CREATE POLICY "ai_mutations_no_delete" ON ai_mutations
  FOR DELETE USING (FALSE);
```

### Edge Function Security

```typescript
// All Edge Functions follow this pattern
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validate Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization')
    }

    // 3. Create client with user's JWT (inherits their RLS permissions)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // 4. Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 5. Validate and sanitize input
    const body = await req.json()
    const validated = validateInput(body) // Throws on invalid

    // 6. Check rate limits
    const { data: allowed } = await supabase.rpc('check_ai_rate_limit', {
      p_user_id: user.id
    })
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: corsHeaders }
      )
    }

    // 7. Process request with user's permissions
    const result = await processRequest(supabase, user.id, validated)

    // 8. Return success
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // 9. Log error securely (no sensitive data)
    console.error('Request failed:', error.message)

    // 10. Return generic error (no internal details)
    return new Response(
      JSON.stringify({ error: 'Request failed' }),
      { status: 400, headers: corsHeaders }
    )
  }
})
```

### Security Checklist for Every Table

Before creating any table, verify:

- [ ] RLS enabled with `FORCE ROW LEVEL SECURITY`
- [ ] SELECT policy restricts to owner (`auth.uid() = user_id`)
- [ ] INSERT policy validates ownership
- [ ] UPDATE policy validates ownership AND field restrictions
- [ ] DELETE policy validates ownership (or disables deletion)
- [ ] Text fields have length limits
- [ ] No dynamic SQL with user input
- [ ] Foreign keys validate references
- [ ] Sensitive fields are never exposed to AI
- [ ] Audit logging for mutations (where applicable)

### Security Testing Requirements

Before deployment, verify:

1. **RLS Bypass Tests** - Attempt to access other users' data
2. **SQL Injection Tests** - Attempt injection in all text inputs
3. **Rate Limit Tests** - Verify limits are enforced
4. **Token Security** - Verify share tokens are unpredictable
5. **AI Boundary Tests** - Verify AI cannot access restricted tables
6. **Undo Integrity** - Verify all AI actions are reversible
7. **Audit Immutability** - Verify audit logs cannot be modified

---

## Current Schema Analysis

### Already Supported
| Feature | Tables/Fields | Status |
|---------|---------------|--------|
| Auth & User Settings | `profiles` (units, theme) | ✅ Complete |
| Workout Logging | `workout_sessions`, `workout_sets` | ✅ Complete |
| Exercises | `exercises` (custom support) | ✅ Complete |
| Temporary Notes | `workout_sets.notes` | ✅ Complete |
| Programs/Templates | `workout_programs`, `program_workouts`, `program_exercises` | ✅ Complete |
| Data Import | `import_source`, `import_id` on sessions | ✅ Complete |
| Analytics Views | PRs, volume, muscle frequency | ✅ Complete |
| Subscriptions | `subscriptions` (Stripe) | ✅ Complete |
| Offline-First | `local_id`, `is_synced` fields | ✅ Complete |

### Gaps to Address
| Feature | Status | Priority |
|---------|--------|----------|
| "Start" System | ❌ Missing | High |
| Program Progression | ❌ Missing | High |
| Sticky Notes (Persistent) | ❌ Missing | Medium |
| Timezone | ❌ Missing | Medium |
| AI Audit Log | ❌ Missing | Medium |
| Shareable Summaries | ❌ Missing | Low |

---

## Proposed Schema Changes

### 1. Profile Enhancements (High Priority)

Add fields to `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN default_start_type TEXT CHECK (default_start_type IN ('template', 'program'));
ALTER TABLE profiles ADD COLUMN default_start_template_id UUID REFERENCES program_workouts(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN default_start_program_id UUID REFERENCES workout_programs(id) ON DELETE SET NULL;
```

### 2. Program Progression Tracking (High Priority)

New table to track user's position in programs:

```sql
CREATE TABLE user_program_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,

  -- Current position (with bounds checking)
  current_workout_index INTEGER NOT NULL DEFAULT 0 CHECK (current_workout_index >= 0),

  -- Cycle tracking (for repeating programs)
  current_cycle INTEGER NOT NULL DEFAULT 1 CHECK (current_cycle >= 1),

  -- Status
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Last workout completed
  last_workout_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  last_workout_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, program_id)
);

-- RLS: Strict ownership
ALTER TABLE user_program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_progress FORCE ROW LEVEL SECURITY;

CREATE POLICY "program_progress_select_own" ON user_program_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "program_progress_insert_own" ON user_program_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "program_progress_update_own" ON user_program_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "program_progress_delete_own" ON user_program_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX idx_program_progress_user ON user_program_progress(user_id);
```

### 3. Sticky Notes (Medium Priority)

Persistent notes attached to exercises (shown in future workouts):

```sql
CREATE TABLE exercise_sticky_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,

  -- Optional set index (null = applies to all sets)
  set_index INTEGER CHECK (set_index IS NULL OR set_index >= 1),

  -- Note content (with length limit)
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),

  -- Display preferences
  show_in_workout BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, exercise_id, set_index)
);

-- RLS: Strict ownership
ALTER TABLE exercise_sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sticky_notes FORCE ROW LEVEL SECURITY;

CREATE POLICY "sticky_notes_select_own" ON exercise_sticky_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sticky_notes_insert_own" ON exercise_sticky_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sticky_notes_update_own" ON exercise_sticky_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "sticky_notes_delete_own" ON exercise_sticky_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Index for workout lookups
CREATE INDEX idx_sticky_notes_user_exercise ON exercise_sticky_notes(user_id, exercise_id);
```

### 4. AI Pending Actions (Medium Priority) - SECURITY CRITICAL

AI writes are NEVER direct. All proposed changes go through a pending state.

```sql
CREATE TABLE ai_pending_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- What the AI wants to do
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set'
  )),

  -- Target entity (null for creates)
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set'
  )),
  target_entity_id UUID,

  -- Proposed change (validated JSON schema)
  proposed_state JSONB NOT NULL,

  -- Human-readable description for UI
  description TEXT NOT NULL CHECK (char_length(description) <= 500),

  -- Expiration (pending actions auto-expire)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  resolved_at TIMESTAMPTZ,

  -- Security context
  request_id UUID NOT NULL,
  ai_conversation_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure pending actions expire
  CONSTRAINT pending_not_stale CHECK (
    status != 'pending' OR expires_at > NOW()
  )
);

-- RLS: Users can only see/manage their own pending actions
ALTER TABLE ai_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_pending_actions FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_pending_select_own" ON ai_pending_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_pending_update_own" ON ai_pending_actions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND OLD.status = 'pending'  -- Can only update pending actions
    AND NEW.status IN ('confirmed', 'rejected')  -- Can only confirm or reject
  );

-- No direct inserts from client - only via secure function
CREATE POLICY "ai_pending_no_insert" ON ai_pending_actions
  FOR INSERT WITH CHECK (FALSE);

-- No deletes - let them expire
CREATE POLICY "ai_pending_no_delete" ON ai_pending_actions
  FOR DELETE USING (FALSE);

-- Index for efficient lookups
CREATE INDEX idx_ai_pending_user_status ON ai_pending_actions(user_id, status)
  WHERE status = 'pending';

-- Auto-expire old pending actions
CREATE OR REPLACE FUNCTION expire_pending_actions()
RETURNS void AS $$
BEGIN
  UPDATE ai_pending_actions
  SET status = 'expired', resolved_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. AI Audit Log (Medium Priority) - IMMUTABLE

Track all AI-initiated mutations for undo capability. This table is append-only.

```sql
CREATE TABLE ai_mutations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Link to the pending action that was confirmed
  pending_action_id UUID REFERENCES ai_pending_actions(id),

  -- Action details (denormalized for query performance)
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set',
    'delete_workout',
    'delete_set'
  )),

  -- Reference to affected entity
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set'
  )),
  entity_id UUID NOT NULL,

  -- Full state snapshots for complete reversibility
  previous_state JSONB, -- null for creates
  new_state JSONB NOT NULL,

  -- Undo tracking
  is_undone BOOLEAN DEFAULT FALSE,
  undone_at TIMESTAMPTZ,
  undone_by TEXT CHECK (undone_by IN ('user', 'system', 'admin')),

  -- Security context (captured at execution time)
  request_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT CHECK (char_length(user_agent) <= 500),

  -- AI context (sanitized - no raw prompts)
  ai_conversation_id TEXT CHECK (char_length(ai_conversation_id) <= 100),
  ai_action_summary TEXT CHECK (char_length(ai_action_summary) <= 1000),

  -- Immutable timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: Users can only see their own mutations
ALTER TABLE ai_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mutations FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_mutations_select_own" ON ai_mutations
  FOR SELECT USING (auth.uid() = user_id);

-- Updates only allowed for undo fields
CREATE POLICY "ai_mutations_update_undo" ON ai_mutations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND OLD.is_undone = FALSE  -- Can only undo once
    AND NEW.is_undone = TRUE   -- Must be setting to undone
  );

-- No inserts from client - only via secure function
CREATE POLICY "ai_mutations_no_insert" ON ai_mutations
  FOR INSERT WITH CHECK (FALSE);

-- NEVER allow deletes
CREATE POLICY "ai_mutations_no_delete" ON ai_mutations
  FOR DELETE USING (FALSE);

-- Prevent tampering with audit records
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating undo-related fields
  IF OLD.action_type != NEW.action_type
     OR OLD.entity_type != NEW.entity_type
     OR OLD.entity_id != NEW.entity_id
     OR OLD.previous_state IS DISTINCT FROM NEW.previous_state
     OR OLD.new_state IS DISTINCT FROM NEW.new_state
     OR OLD.request_id != NEW.request_id
     OR OLD.created_at != NEW.created_at
     OR OLD.pending_action_id IS DISTINCT FROM NEW.pending_action_id
  THEN
    RAISE EXCEPTION 'Audit records are immutable - only undo fields can be updated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_audit_immutability
  BEFORE UPDATE ON ai_mutations
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

CREATE INDEX idx_ai_mutations_user ON ai_mutations(user_id, created_at DESC);
CREATE INDEX idx_ai_mutations_entity ON ai_mutations(entity_type, entity_id);
CREATE INDEX idx_ai_mutations_undo ON ai_mutations(user_id, is_undone) WHERE is_undone = FALSE;
```

### 6. Training Summaries (Low Priority) - SECURE SHARING

Shareable AI-generated training summaries with expiring tokens.

```sql
CREATE TABLE training_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Period covered
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Summary content (with length limits)
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  summary_text TEXT NOT NULL CHECK (char_length(summary_text) <= 50000),
  metrics JSONB NOT NULL,

  -- Sharing with security controls
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,  -- Cryptographically secure token
  share_expires_at TIMESTAMPTZ,  -- Tokens expire
  share_view_count INTEGER DEFAULT 0,
  max_share_views INTEGER DEFAULT 1000,  -- Rate limit views

  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure share tokens have expiration
  CONSTRAINT share_must_expire CHECK (
    share_token IS NULL OR share_expires_at IS NOT NULL
  )
);

-- RLS policies
ALTER TABLE training_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_summaries FORCE ROW LEVEL SECURITY;

-- Owners can see all their summaries
CREATE POLICY "training_summaries_select_own" ON training_summaries
  FOR SELECT USING (auth.uid() = user_id);

-- Public summaries viewable by anyone with valid token (via function, not direct access)
-- Note: Anonymous access is handled by a secure function, not RLS

CREATE POLICY "training_summaries_insert_own" ON training_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_summaries_update_own" ON training_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "training_summaries_delete_own" ON training_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Secure function to view shared summary (validates token + limits)
CREATE OR REPLACE FUNCTION view_shared_summary(p_share_token TEXT)
RETURNS TABLE (
  title TEXT,
  summary_text TEXT,
  metrics JSONB,
  period_start DATE,
  period_end DATE
) AS $$
DECLARE
  v_summary training_summaries%ROWTYPE;
BEGIN
  -- Find the summary
  SELECT * INTO v_summary
  FROM training_summaries
  WHERE share_token = p_share_token;

  -- Validate token exists
  IF v_summary.id IS NULL THEN
    RAISE EXCEPTION 'Invalid share token';
  END IF;

  -- Check if public
  IF NOT v_summary.is_public THEN
    RAISE EXCEPTION 'Summary is not public';
  END IF;

  -- Check expiration
  IF v_summary.share_expires_at < NOW() THEN
    RAISE EXCEPTION 'Share link has expired';
  END IF;

  -- Check view limit
  IF v_summary.share_view_count >= v_summary.max_share_views THEN
    RAISE EXCEPTION 'Share link view limit exceeded';
  END IF;

  -- Increment view count
  UPDATE training_summaries
  SET share_view_count = share_view_count + 1
  WHERE id = v_summary.id;

  -- Return sanitized data (no user_id, no internal fields)
  RETURN QUERY
  SELECT
    v_summary.title,
    v_summary.summary_text,
    v_summary.metrics,
    v_summary.period_start,
    v_summary.period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate secure share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  -- 32 bytes of cryptographic randomness, URL-safe base64
  RETURN replace(replace(encode(gen_random_bytes(32), 'base64'), '+', '-'), '/', '_');
END;
$$ LANGUAGE plpgsql;

CREATE INDEX idx_training_summaries_user ON training_summaries(user_id, period_start DESC);
CREATE INDEX idx_training_summaries_share ON training_summaries(share_token)
  WHERE share_token IS NOT NULL AND is_public = TRUE;
```

---

## Backend Architecture

### Single Service (Monolith)

```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Backend                        │
├─────────────────────────────────────────────────────────────┤
│  Auth          │  Database      │  Storage     │  Edge Fns  │
│  ─────         │  ────────      │  ───────     │  ────────  │
│  • Supabase    │  • PostgreSQL  │  • Exercise  │  • Import  │
│    Auth        │  • RLS         │    images    │    Parser  │
│  • OAuth       │  • Views       │  • Summary   │  • Summary │
│  • JWT         │  • Triggers    │    images    │    Gen     │
│                │                │              │  • Widget  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  Stripe        │  Claude AI     │  Expo Push                │
│  ─────         │  ─────────     │  ─────────                │
│  • Billing     │  • Summaries   │  • Widget                 │
│  • Webhooks    │  • Plateaus    │    updates                │
│                │  • Assistant   │                           │
└─────────────────────────────────────────────────────────────┘
```

### API Structure

All operations go through Supabase client with RLS policies:

```typescript
// Mobile app uses Supabase client directly
import { supabase } from '@/lib/supabase'

// Core operations - direct table access with RLS
await supabase.from('workout_sessions').insert(...)
await supabase.from('workout_sets').insert(...)

// Complex operations - Edge Functions
await supabase.functions.invoke('import-workouts', { body: csvData })
await supabase.functions.invoke('generate-summary', { body: { period } })
await supabase.functions.invoke('ai-assistant', { body: { prompt } })
```

### Edge Functions

1. **import-workouts** - Parse CSV, match exercises, batch insert
2. **generate-summary** - Query analytics, call Claude, generate image
3. **ai-assistant** - Handle AI requests with audit logging
4. **widget-data** - Return next workout for iOS/Android widget

---

## Key Design Decisions

### 1. "Start" System Implementation

```typescript
// Get next workout for Start button
async function getNextWorkout(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_start_type, default_start_template_id, default_start_program_id')
    .eq('id', userId)
    .single()

  if (profile.default_start_type === 'template') {
    // Return single template
    return getTemplate(profile.default_start_template_id)
  }

  if (profile.default_start_type === 'program') {
    // Get next workout in program progression
    const { data: progress } = await supabase
      .from('user_program_progress')
      .select('current_workout_index, program:workout_programs(*)')
      .eq('user_id', userId)
      .eq('program_id', profile.default_start_program_id)
      .single()

    return getProgramWorkout(progress.program.id, progress.current_workout_index)
  }

  return null // No default set
}
```

### 2. AI Mutation Pattern

All AI writes go through an audit wrapper:

```typescript
async function aiMutate<T>(
  userId: string,
  actionType: string,
  entityType: string,
  mutation: () => Promise<{ data: T; previousState?: any }>
): Promise<T> {
  const { data, previousState } = await mutation()

  // Log mutation for undo capability
  await supabase.from('ai_mutations').insert({
    user_id: userId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: data.id,
    previous_state: previousState,
    new_state: data,
    ai_conversation_id: currentConversationId
  })

  return data
}

// Usage
const newProgram = await aiMutate(
  userId,
  'create_program',
  'workout_program',
  async () => {
    const { data } = await supabase
      .from('workout_programs')
      .insert({ name: 'AI Generated Program', ... })
      .select()
      .single()
    return { data }
  }
)
```

### 3. Undo Implementation

```typescript
async function undoAiAction(mutationId: string) {
  const { data: mutation } = await supabase
    .from('ai_mutations')
    .select('*')
    .eq('id', mutationId)
    .single()

  if (mutation.action_type.startsWith('create_')) {
    // Delete the created entity
    await supabase
      .from(mutation.entity_type)
      .delete()
      .eq('id', mutation.entity_id)
  } else if (mutation.action_type.startsWith('modify_')) {
    // Restore previous state
    await supabase
      .from(mutation.entity_type)
      .update(mutation.previous_state)
      .eq('id', mutation.entity_id)
  }

  // Mark as undone
  await supabase
    .from('ai_mutations')
    .update({ is_undone: true, undone_at: new Date() })
    .eq('id', mutationId)
}
```

---

## Migration Path

### Migration 002: Core Features

```sql
-- File: supabase/migrations/002_core_features.sql

-- 1. Profile enhancements
ALTER TABLE profiles
  ADD COLUMN timezone TEXT DEFAULT 'UTC',
  ADD COLUMN default_start_type TEXT CHECK (default_start_type IN ('template', 'program')),
  ADD COLUMN default_start_template_id UUID REFERENCES program_workouts(id) ON DELETE SET NULL,
  ADD COLUMN default_start_program_id UUID REFERENCES workout_programs(id) ON DELETE SET NULL;

-- 2. Program progression
CREATE TABLE user_program_progress (...);

-- 3. Sticky notes
CREATE TABLE exercise_sticky_notes (...);

-- 4. AI audit log
CREATE TABLE ai_mutations (...);

-- 5. Training summaries
CREATE TABLE training_summaries (...);

-- Apply RLS policies...
```

---

## Implementation Order

1. **Phase 1: Core Logging (Current)** ✅
   - workout_sessions, workout_sets, exercises
   - Offline-first sync

2. **Phase 2: Start System**
   - Profile start preferences
   - Program progression tracking
   - Widget data endpoint

3. **Phase 3: Enhanced Notes**
   - Sticky notes table
   - Show in workout flow

4. **Phase 4: AI Integration**
   - AI mutations table
   - Undo functionality
   - Assistant endpoint

5. **Phase 5: Social/Sharing**
   - Training summaries
   - Share tokens
   - Image generation

---

## Review Summary

The existing schema provides a solid foundation for offline-first workout logging. The proposed additions are minimal and focused:

### Schema Additions
- **5 new fields** on profiles (timezone, start preferences)
- **5 new tables**:
  - `user_program_progress` - Track position in programs
  - `exercise_sticky_notes` - Persistent exercise cues
  - `ai_pending_actions` - Staging area for AI writes (mandatory confirmation)
  - `ai_mutations` - Immutable audit log of all AI actions
  - `training_summaries` - Shareable AI-generated summaries
- **1 new table** for rate limiting: `ai_rate_limits`
- **No schema changes** to core logging tables

### Security Summary

| Layer | Protection |
|-------|------------|
| **Database** | RLS + FORCE on all tables, explicit policies, no default access |
| **AI Writes** | Two-phase: pending → user confirms → execute + audit |
| **AI Reads** | Allowlisted tables only, no access to profiles/subscriptions/auth |
| **Audit Log** | Immutable (trigger-enforced), enables full undo |
| **Input** | Text length limits, parameterized queries, UUID validation |
| **Rate Limits** | Per-user limits on AI actions (minute/hour/day) |
| **Sharing** | Cryptographic tokens, expiration, view limits |

### Security-First Design Principles

1. **AI never writes directly** - All AI mutations go through `ai_pending_actions` → user confirmation → `ai_mutations` audit
2. **RLS everywhere** - Every table has `FORCE ROW LEVEL SECURITY` with explicit policies
3. **Immutable audit** - The `ai_mutations` table cannot be modified or deleted (trigger-enforced)
4. **Fail secure** - Missing policies = no access, errors deny rather than grant
5. **Least privilege** - AI only sees workout data, never profiles/billing/auth
6. **Defense in depth** - Multiple validation layers (RLS + functions + application)

This design maintains simplicity while supporting all specified features. Each addition is optional and independent—the core logging flow remains unchanged, and AI integration is fully auditable and reversible.

---

## Implementation Status

### Completed

- [x] **Migration file created**: `supabase/migrations/002_core_features_and_ai_security.sql`
  - 4 new columns on `profiles` (timezone, start preferences)
  - 7 new tables with FORCE RLS
  - 8 new secure functions
  - 1 audit immutability trigger
  - Verification queries included

### Migration Contents

| Component | Status | Security |
|-----------|--------|----------|
| `profiles` enhancements | ✅ | Existing RLS applies |
| `user_program_progress` | ✅ | FORCE RLS, 4 policies |
| `exercise_sticky_notes` | ✅ | FORCE RLS, 4 policies, AI can read |
| `session_exercise_notes` | ✅ | FORCE RLS, 4 policies, AI can read |
| `ai_rate_limits` | ✅ | FORCE RLS, read-only for users |
| `ai_pending_actions` | ✅ | FORCE RLS, no client inserts |
| `ai_mutations` | ✅ | FORCE RLS, immutable trigger |
| `training_summaries` | ✅ | FORCE RLS, secure share function |
| `check_ai_rate_limit()` | ✅ | SECURITY DEFINER |
| `expire_pending_actions()` | ✅ | SECURITY DEFINER |
| `view_shared_summary()` | ✅ | SECURITY DEFINER, validates all constraints |
| `generate_share_token()` | ✅ | Uses `gen_random_bytes(32)` |
| `get_user_preferences_for_ai()` | ✅ | Only returns units/timezone |
| `get_user_notes_for_ai()` | ✅ | Returns all notes for personalization |
| `get_exercise_notes_for_ai()` | ✅ | Returns notes for specific exercise |
| `is_valid_uuid()` | ✅ | IMMUTABLE |
| `prevent_audit_tampering()` | ✅ | Trigger on ai_mutations |

### AI Note Access

The AI can access three types of notes for personalization:

| Note Type | Source | Weight | Retention |
|-----------|--------|--------|-----------|
| **Sticky** | `exercise_sticky_notes` | High | Permanent |
| **Session** | `session_exercise_notes` | Medium | 90 days |
| **Set** | `workout_sets.notes` | Low | 90 days |

Notes are filtered to exclude:
- Very short notes (< 3 characters)
- Empty/whitespace-only content

AI should additionally filter out:
- Obvious placeholders ("asdf", "test", "xxx")
- Random characters without meaning

### Next Steps

1. **Test migration locally**: `supabase db reset` to apply
2. **Create Edge Functions** for AI operations (when ready)
3. **Implement mobile app integration** for Start system and notes
