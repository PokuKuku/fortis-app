# Fortis Database Schema Documentation

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION & USERS                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  auth.users      │ (Supabase Auth - Managed)
    │──────────────────│
    │ id (PK)          │
    │ email            │
    │ encrypted_pass   │
    │ email_confirmed  │
    │ provider         │ (google, apple, email)
    └────────┬─────────┘
             │ 1
             │
             │ extends
             │
             │ 1
    ┌────────▼─────────┐                    ┌──────────────────┐
    │  profiles        │                    │  subscriptions   │
    │──────────────────│                    │──────────────────│
    │ id (PK, FK)      │◄───────────────────│ id (PK)          │
    │ email            │         1 : 1      │ user_id (FK)     │
    │ full_name        │                    │ stripe_customer  │
    │ avatar_url       │                    │ stripe_subscr.   │
    │ preferred_units  │                    │ stripe_price_id  │
    │ theme            │                    │ status           │
    │ onboarding_done  │                    │ tier             │
    │ created_at       │                    │ trial_ends_at    │
    │ updated_at       │                    │ period_start     │
    └────────┬─────────┘                    │ period_end       │
             │                               │ created_at       │
             │                               │ updated_at       │
             │                               └──────────────────┘
             │
             │
             │

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXERCISE LIBRARY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────▼─────────┐
    │  exercises       │
    │──────────────────│
    │ id (PK)          │
    │ name             │
    │ slug             │
    │ force            │ (push/pull/static)
    │ level            │ (beginner/intermediate/expert)
    │ mechanic         │ (compound/isolation)
    │ equipment        │ (barbell/dumbbell/...)
    │ primary_muscles  │ (array)
    │ secondary_muscle │ (array)
    │ instructions     │ (array)
    │ category         │ (strength/powerlifting/...)
    │ images           │ (array)
    │ video_url        │
    │ is_custom        │
    │ created_by (FK)  │──┐
    │ created_at       │  │ references profiles (optional)
    │ updated_at       │  │
    └────────┬─────────┘  │
             │            │
             │            └─────────────┐
             │                          │
             │                          │
             │                          │

┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKOUT PROGRAMS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────▼─────────┐
    │ workout_programs │
    │──────────────────│
    │ id (PK)          │
    │ name             │
    │ description      │
    │ difficulty       │ (beginner/intermediate/advanced)
    │ duration_weeks   │
    │ goal             │ (strength/hypertrophy/...)
    │ is_default       │
    │ is_public        │
    │ created_by (FK)  │──┐
    │ created_at       │  │ references profiles (optional)
    │ updated_at       │  │
    └────────┬─────────┘  │
             │ 1           │
             │             │
             │             │
             │ M           │
    ┌────────▼─────────┐  │
    │ program_workouts │  │
    │──────────────────│  │
    │ id (PK)          │  │
    │ program_id (FK)  │  │
    │ name             │  │
    │ description      │  │
    │ day_number       │  │
    │ created_at       │  │
    └────────┬─────────┘  │
             │ 1           │
             │             │
             │             │
             │ M           │
    ┌────────▼─────────┐  │
    │ program_exercise │  │
    │──────────────────│  │
    │ id (PK)          │  │
    │ program_wkt(FK)  │  │
    │ exercise_id (FK) │──┼───────┐
    │ order_index      │  │       │
    │ sets             │  │       │
    │ reps             │  │       │ references exercises
    │ rest_seconds     │  │       │
    │ notes            │  │       │
    │ created_at       │  │       │
    └──────────────────┘  │       │
                          │       │
                          │       │
                          │       │

┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER WORKOUT TRACKING                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  profiles        │
    │──────────────────│
    │ id (PK)          │
    └────────┬─────────┘
             │ 1
             │
             │
             │ M
    ┌────────▼─────────┐         ┌──────────────────┐
    │ workout_sessions │         │ workout_programs │
    │──────────────────│         │──────────────────│
    │ id (PK)          │         │ id (PK)          │
    │ user_id (FK)     │    ┌────┤ ...              │
    │ name             │    │    └──────────────────┘
    │ notes            │    │
    │ started_at       │    │    ┌──────────────────┐
    │ completed_at     │    │    │ program_workouts │
    │ duration_seconds │    │    │──────────────────│
    │ program_id (FK)  │────┘    │ id (PK)          │
    │ prog_workout(FK) │─────────┤ ...              │
    │ is_synced        │         └──────────────────┘
    │ local_id         │ (for offline sync)
    │ created_at       │
    │ updated_at       │
    └────────┬─────────┘
             │ 1
             │
             │
             │ M
    ┌────────▼─────────┐
    │  workout_sets    │         ┌──────────────────┐
    │──────────────────│         │  exercises       │
    │ id (PK)          │         │──────────────────│
    │ session_id (FK)  │         │ id (PK)          │
    │ exercise_id (FK) │─────────┤ ...              │
    │ set_number       │         └──────────────────┘
    │ reps             │
    │ weight           │ (in user's preferred unit)
    │ rpe              │ (1-10 scale)
    │ rest_seconds     │
    │ notes            │
    │ is_warmup        │
    │ is_dropset       │
    │ is_failure       │
    │ order_index      │
    │ local_id         │ (for offline sync)
    │ created_at       │
    │ updated_at       │
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS VIEWS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐
    │  user_workout_stats      │  (VIEW)
    │──────────────────────────│
    │ user_id                  │
    │ total_workouts           │
    │ total_workout_days       │
    │ total_time_seconds       │
    │ avg_workout_duration     │
    │ last_workout_date        │
    │ unique_exercises         │
    │ total_volume             │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │ exercise_personal_record │  (VIEW)
    │──────────────────────────│
    │ exercise_id              │
    │ user_id                  │
    │ exercise_name            │
    │ max_weight               │
    │ estimated_1rm            │
    │ max_reps                 │
    │ achieved_at              │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │  weekly_workout_volume   │  (VIEW)
    │──────────────────────────│
    │ user_id                  │
    │ week_start               │
    │ workouts_count           │
    │ total_volume             │
    │ total_time_seconds       │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │ muscle_group_frequency   │  (VIEW)
    │──────────────────────────│
    │ user_id                  │
    │ muscle_group             │
    │ times_trained            │
    │ total_volume             │
    │ last_trained             │
    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRAINING INTELLIGENCE                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  profiles        │
    │──────────────────│
    │ id (PK)          │
    │ ...              │
    │ conservatism_lvl │  (chill/standard/aggressive)
    └────────┬─────────┘
             │ 1
             │
             │ M
    ┌────────▼─────────┐
    │training_insights │
    │──────────────────│
    │ id (PK)          │
    │ user_id (FK)     │
    │ type             │  (WEEKLY_VERDICT_V1, LIFT_STALL_RISK_V1, ...)
    │ window           │  (7d/4w/12w)
    │ anchor_date      │
    │ subject_key      │  (global/exercise:<uuid>/muscle:<group>)
    │ severity         │  (low/medium/high)
    │ status           │  (active/dismissed)
    │ title            │
    │ summary          │
    │ evidence         │  (JSONB array)
    │ recommendation   │  (JSONB array)
    │ schema_version   │
    │ exercise_id (FK) │──────────┐
    │ muscle_group     │          │ optional, for filtering
    │ created_at       │          │
    │ updated_at       │          │
    └──────────────────┘          ▼
                           ┌──────────────────┐
                           │  exercises       │
                           │──────────────────│
                           │ id (PK)          │
                           │ ...              │
                           └──────────────────┘
```

## Table Relationships Summary

### One-to-One Relationships
- `auth.users` ↔ `profiles` (extends Supabase Auth)
- `profiles` ↔ `subscriptions` (one subscription per user)

### One-to-Many Relationships
- `profiles` → `exercises` (user can create custom exercises)
- `profiles` → `workout_programs` (user can create programs)
- `profiles` → `workout_sessions` (user has many workout sessions)
- `profiles` → `training_insights` (user has many server-generated insights)
- `workout_programs` → `program_workouts` (program has many workouts)
- `program_workouts` → `program_exercises` (workout has many exercises)
- `workout_sessions` → `workout_sets` (session has many sets)

### Many-to-Many Relationships
- `exercises` ↔ `program_exercises` ↔ `program_workouts` (exercises used in programs)
- `exercises` ↔ `workout_sets` ↔ `workout_sessions` (exercises performed in sessions)

## Key Features

### Row Level Security (RLS)

All tables have RLS policies ensuring:

**Profiles**
- Users can view and update only their own profile
- Auto-created on signup

**Subscriptions**
- Users can view only their own subscription
- Updated via Stripe webhooks

**Exercises**
- All users can view default exercises
- Users can create and view their own custom exercises

**Workout Programs**
- All users can view public/default programs
- Users can create and view their own programs

**Workout Sessions & Sets**
- Users can only access their own workout data
- Full CRUD operations on own data

**Training Insights** (Server-truth model)
- Users can SELECT their own insights
- Users can UPDATE their own insights (for dismiss/reactivate only)
- No client INSERT - server (Edge Function) inserts via service_role
- No client DELETE - insights are dismissed, not deleted

### Offline-First Design

The schema supports offline-first mobile apps through:

1. **Local ID tracking**
   - `workout_sessions.local_id`
   - `workout_sets.local_id`
   - Client generates UUIDs for offline sessions

2. **Sync status**
   - `workout_sessions.is_synced`
   - Tracks which sessions need syncing

3. **Upsert capability**
   - Unique constraints on `(user_id, local_id)`
   - Prevents duplicates during sync

4. **Conflict resolution**
   - Last-write-wins strategy
   - Updated timestamps for tracking

### Automatic Behaviors

**Triggers**
- `update_updated_at_column()` - Auto-updates `updated_at` on all tables
- `handle_new_user()` - Auto-creates profile and subscription on signup
- `calculate_session_duration()` - Auto-calculates workout duration

**Indexes**
- Foreign keys (automatic)
- `user_id` on all user-owned tables
- `started_at` DESC for recent workouts
- `is_synced` for offline sync queries
- GIN indexes on array columns (muscles)

## Data Flow

### User Signup Flow
```
1. User signs up via Supabase Auth (Google/Apple/Email)
   ↓
2. Trigger: handle_new_user()
   ↓
3. Creates profile in profiles table
   ↓
4. Creates free subscription in subscriptions table
```

### Workout Logging Flow (Offline-First)
```
1. User starts workout (offline)
   ↓
2. App creates local workout_session with local_id
   ↓
3. User logs sets → stored locally with local_id
   ↓
4. User completes workout
   ↓
5. When online, app syncs to Supabase
   ↓
6. Upsert with conflict on (user_id, local_id)
   ↓
7. Mark is_synced = true
```

### Analytics Calculation Flow
```
1. User completes workouts over time
   ↓
2. Data stored in workout_sessions and workout_sets
   ↓
3. Views automatically calculate:
   - Personal records (max weight, estimated 1RM)
   - Weekly volume trends
   - Muscle group frequency
   - Overall statistics
   ↓
4. Web app queries views for analytics dashboard
```

### Stripe Subscription Flow
```
1. User clicks "Upgrade to Pro"
   ↓
2. App creates Stripe Checkout session
   ↓
3. User completes payment
   ↓
4. Stripe sends webhook to backend
   ↓
5. Backend updates subscriptions table:
   - stripe_customer_id
   - stripe_subscription_id
   - status = 'active'
   - tier = 'pro'
```

## Muscle Groups Reference

Supported muscle groups (used in exercises):
- `abdominals`
- `abductors`
- `adductors`
- `biceps`
- `calves`
- `chest`
- `forearms`
- `glutes`
- `hamstrings`
- `lats`
- `lower back`
- `middle back`
- `neck`
- `quadriceps`
- `shoulders`
- `traps`
- `triceps`

## Equipment Types Reference

Supported equipment types:
- `barbell`
- `dumbbell`
- `kettlebells`
- `machine`
- `cable`
- `body only`
- `bands`
- `medicine ball`
- `exercise ball`
- `e-z curl bar`
- `foam roll`
- `other`

## Exercise Categories Reference

Supported categories:
- `strength` - General strength training
- `powerlifting` - Squat, bench, deadlift
- `olympic weightlifting` - Snatch, clean & jerk
- `strongman` - Carries, yoke, etc.
- `stretching` - Flexibility work
- `cardio` - Cardiovascular exercises
- `plyometrics` - Jump training

## Subscription Tiers

Defined tiers (customize based on your pricing):
- `free` - Basic features, limited programs
- `pro` - Full exercise library, all programs, basic analytics
- `elite` - AI features, advanced analytics, custom programming

## Performance Considerations

### Indexes Created
```sql
-- User queries
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sets_session_id ON workout_sets(session_id);

-- Time-based queries
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(started_at DESC);
CREATE INDEX idx_workout_sets_created_at ON workout_sets(created_at DESC);

-- Sync queries
CREATE INDEX idx_workout_sessions_is_synced ON workout_sessions(is_synced)
  WHERE is_synced = FALSE;

-- Exercise queries
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_level ON exercises(level);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN(primary_muscles);

-- Training insights queries
CREATE INDEX idx_training_insights_user_created
  ON training_insights(user_id, created_at DESC);
CREATE INDEX idx_training_insights_user_status
  ON training_insights(user_id, status) WHERE status = 'active';
CREATE UNIQUE INDEX idx_training_insights_dedupe
  ON training_insights(user_id, type, window, anchor_date, subject_key);
```

### Query Optimization Tips

1. **Always filter by user_id first**
   ```sql
   WHERE user_id = $1 AND started_at > $2
   ```

2. **Use pagination for large datasets**
   ```sql
   LIMIT 50 OFFSET 0
   ```

3. **Leverage materialized views for heavy analytics**
   ```sql
   CREATE MATERIALIZED VIEW mv_user_stats AS ...
   REFRESH MATERIALIZED VIEW mv_user_stats;
   ```

4. **Use partial indexes for specific queries**
   ```sql
   CREATE INDEX idx_active_subscriptions
   ON subscriptions(user_id)
   WHERE status = 'active';
   ```

## Migration Strategy

### Initial Setup (v1.0.0)
1. Run `schema.sql` - Creates all tables, functions, triggers
2. Run `seed-exercises.sql` - Seeds 50 default exercises
3. Run `seed-programs.sql` - Seeds 3 default programs

### Future Migrations
When schema changes are needed:
1. Create new migration file: `migrations/002_add_feature.sql`
2. Use ALTER TABLE for changes
3. Test on staging environment first
4. Document changes in this file

### Rollback Strategy
```sql
-- Example rollback
BEGIN;
-- Your migration
ROLLBACK; -- if issues

-- Or
COMMIT; -- if success
```

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Policies restrict access to user's own data
- ✅ Public data (exercises, programs) accessible to all
- ✅ Service role key kept secret (server-side only)
- ✅ Anon key used in client apps
- ✅ Foreign key constraints prevent orphaned records
- ✅ Input validation on client and database level
- ✅ Prepared statements prevent SQL injection

## Monitoring & Maintenance

### Queries to Monitor

```sql
-- Find slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Regular Maintenance

- **Weekly**: Review slow query log
- **Monthly**: Analyze table growth and index usage
- **Quarterly**: Review and optimize RLS policies
- **Yearly**: Full schema review and optimization

---

**Schema Version**: 1.1.0
**Last Updated**: 2026-01-06
**PostgreSQL Version**: 15+
**Supabase Compatible**: Yes
