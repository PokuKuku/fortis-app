# Fortis Database Setup Guide

This directory contains all the database schema and seed data for the Fortis strength training app.

## Overview

The Fortis database is built on Supabase (PostgreSQL) and includes:
- **Complete schema** with tables, indexes, RLS policies, and triggers
- **50 curated exercises** covering all major muscle groups
- **3 default workout programs** for different training goals
- **Offline-first architecture** for seamless mobile sync
- **Import/Export support** for Strong, Hevy, and other fitness apps
- **Stripe integration** ready for billing
- **Analytics views** for comprehensive workout insights

## Database Architecture

### Core Tables

1. **profiles** - User profiles extending Supabase Auth
2. **subscriptions** - Stripe subscription management
3. **exercises** - Exercise library (50+ default exercises)
4. **workout_programs** - Pre-built and custom workout programs
5. **program_workouts** - Individual workouts within a program
6. **program_exercises** - Exercise prescriptions within program workouts
7. **workout_sessions** - User workout sessions (offline-first)
8. **workout_sets** - Individual sets tracked during workouts

### Analytics Views

- `user_workout_stats` - Overall user statistics
- `exercise_personal_records` - PRs and estimated 1RMs
- `weekly_workout_volume` - Volume tracking by week
- `muscle_group_frequency` - Training frequency per muscle group

### Import/Export Support

Fortis supports importing workout history from popular fitness apps:
- ✅ **Strong App** - Full CSV import support
- ✅ **Hevy App** - Full CSV import support
- ✅ **Generic CSV** - Custom format support
- 📤 **Fortis Export** - Export your data to CSV

See [IMPORT_GUIDE.md](./IMPORT_GUIDE.md) for detailed import instructions and data transformation logic.

## Setup Instructions

### Prerequisites

- Supabase account (create at [supabase.com](https://supabase.com))
- Supabase CLI installed (optional but recommended)

### Option 1: Supabase Dashboard (Easiest)

1. **Create a new Supabase project**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Choose organization, name, database password, and region
   - Wait for project to be created (~2 minutes)

2. **Run the schema migration**
   - Navigate to SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy the entire contents of `schema.sql`
   - Paste into the query editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Seed exercises**
   - Create a new query
   - Copy the entire contents of `seed-exercises.sql`
   - Paste and run

4. **Seed workout programs**
   - Create a new query
   - Copy the entire contents of `seed-programs.sql`
   - Paste and run

5. **Add import/export support (optional but recommended)**
   - Create a new query
   - Copy the entire contents of `migrations/001_add_import_support.sql`
   - Paste and run
   - This adds fields for importing from Strong, Hevy, and other apps

6. **Verify the setup**
   - Navigate to Table Editor
   - You should see all tables listed
   - Check `exercises` table - should have 50 rows
   - Check `workout_programs` table - should have 3 rows

### Option 2: Supabase CLI (Recommended for Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
cd /path/to/fortis-app
supabase init

# Link to your remote project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Or run migrations manually
psql <your-database-url> -f supabase/schema.sql
psql <your-database-url> -f supabase/seed-exercises.sql
psql <your-database-url> -f supabase/seed-programs.sql
```

### Option 3: Local Development with Supabase

```bash
# Start local Supabase (requires Docker)
supabase start

# Apply migrations
supabase db reset

# Your local Supabase is now running at:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

## Environment Variables

After setting up your Supabase project, you'll need these environment variables:

```bash
# .env.local (for local development)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For Next.js web app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in:
- Supabase Dashboard → Settings → API

## Authentication Setup

### Enable OAuth Providers

1. **Google OAuth**
   - Go to Authentication → Providers
   - Enable Google
   - Add your OAuth credentials from Google Cloud Console
   - Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

2. **Apple OAuth**
   - Go to Authentication → Providers
   - Enable Apple
   - Add your credentials from Apple Developer Console
   - Configure Sign in with Apple service ID

### Email Confirmation

For production, configure email templates:
- Authentication → Email Templates
- Customize confirmation, reset password, and magic link emails

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public exercises and programs are viewable by all
- Workout sessions and sets are private to each user

### Testing RLS Policies

```sql
-- Test as a specific user
SET request.jwt.claim.sub = 'user-uuid-here';

-- View accessible data
SELECT * FROM workout_sessions;
SELECT * FROM workout_sets;
```

## Database Schema

### Exercise Data Structure

```typescript
interface Exercise {
  id: UUID
  name: string
  slug: string
  force: 'push' | 'pull' | 'static'
  level: 'beginner' | 'intermediate' | 'expert'
  mechanic: 'compound' | 'isolation'
  equipment: 'barbell' | 'dumbbell' | 'machine' | ...
  primary_muscles: string[]
  secondary_muscles: string[]
  instructions: string[]
  category: 'strength' | 'powerlifting' | ...
  images: string[]
  video_url?: string
  is_custom: boolean
  created_by?: UUID
}
```

### Workout Session Structure

```typescript
interface WorkoutSession {
  id: UUID
  user_id: UUID
  name?: string
  notes?: string
  started_at: timestamp
  completed_at?: timestamp
  duration_seconds?: number
  program_id?: UUID
  program_workout_id?: UUID
  is_synced: boolean
  local_id?: string // For offline sync
}
```

### Workout Set Structure

```typescript
interface WorkoutSet {
  id: UUID
  session_id: UUID
  exercise_id: UUID
  set_number: number
  reps?: number
  weight?: number // In user's preferred unit
  rpe?: number // 1-10 scale
  rest_seconds?: number
  notes?: string
  is_warmup: boolean
  is_dropset: boolean
  is_failure: boolean
  order_index: number
  local_id?: string
}
```

## Default Workout Programs

### 1. Full Body Strength (3 days/week)
- **Duration**: 12 weeks
- **Goal**: Total body strength
- **Level**: Beginner
- **Focus**: Compound movements
- **Schedule**: Monday, Wednesday, Friday

### 2. Push Pull Legs (6 days/week)
- **Duration**: 12 weeks
- **Goal**: Hypertrophy (muscle growth)
- **Level**: Intermediate
- **Focus**: Volume and frequency
- **Schedule**: 6 days on, 1 day rest

### 3. Upper/Lower Split (4 days/week)
- **Duration**: 12 weeks
- **Goal**: Strength and size
- **Level**: Intermediate
- **Focus**: Balanced training
- **Schedule**: Mon, Tue, Thu, Fri

## Offline-First Implementation

The database is designed for offline-first mobile apps:

1. **Local ID tracking**: Each session/set can have a `local_id` (client-generated UUID)
2. **Sync flag**: `is_synced` boolean tracks sync status
3. **Upsert operations**: Use local_id to prevent duplicates during sync
4. **Conflict resolution**: Last-write-wins strategy

### Sync Strategy Example

```typescript
// Client-side sync logic
async function syncWorkoutSession(localSession) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert({
      ...localSession,
      user_id: user.id,
      is_synced: true
    }, {
      onConflict: 'user_id,local_id'
    })

  if (!error) {
    // Mark as synced in local DB
    await localDB.updateSyncStatus(localSession.local_id, true)
  }
}
```

## Stripe Integration

The `subscriptions` table is ready for Stripe integration:

```typescript
interface Subscription {
  user_id: UUID
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: 'trialing' | 'active' | 'canceled' | ...
  tier: 'free' | 'pro' | 'elite'
  trial_ends_at: timestamp
  current_period_start: timestamp
  current_period_end: timestamp
}
```

### Webhook Handler Pattern

```typescript
// Handle Stripe webhooks
export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(...)

  switch (event.type) {
    case 'customer.subscription.updated':
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000)
        })
        .eq('stripe_subscription_id', subscription.id)
      break
  }
}
```

## Analytics Queries

### Get User Stats

```sql
SELECT * FROM user_workout_stats
WHERE user_id = 'user-uuid';
```

### Get Personal Records

```sql
SELECT * FROM exercise_personal_records
WHERE user_id = 'user-uuid'
ORDER BY estimated_1rm DESC;
```

### Get Weekly Volume

```sql
SELECT * FROM weekly_workout_volume
WHERE user_id = 'user-uuid'
AND week_start >= NOW() - INTERVAL '12 weeks'
ORDER BY week_start DESC;
```

### Get Muscle Group Frequency

```sql
SELECT * FROM muscle_group_frequency
WHERE user_id = 'user-uuid'
ORDER BY total_volume DESC;
```

## Maintenance

### Backup Strategy

Supabase provides automatic daily backups. For additional safety:

```bash
# Manual backup
pg_dump <database-url> > backup_$(date +%Y%m%d).sql

# Restore from backup
psql <database-url> < backup_20250101.sql
```

### Performance Monitoring

Monitor slow queries in Supabase Dashboard:
- Database → Query Performance
- Look for queries > 1000ms
- Add indexes as needed

### Indexes

The schema includes indexes on:
- Foreign keys (automatic)
- Common query patterns (user_id, started_at, etc.)
- Array columns (GIN indexes for muscle groups)

## Common Issues & Solutions

### Issue: RLS policies blocking queries
**Solution**: Ensure JWT token is properly set in client
```typescript
const { data, error } = await supabase.auth.getSession()
```

### Issue: Duplicate key violations during sync
**Solution**: Use upsert with proper conflict resolution
```typescript
.upsert(data, { onConflict: 'user_id,local_id' })
```

### Issue: Slow queries on large datasets
**Solution**: Add pagination and proper indexes
```typescript
.range(0, 49) // Limit to 50 results
.order('started_at', { ascending: false })
```

## Next Steps

1. ✅ Database schema created
2. ✅ Exercises seeded
3. ✅ Programs seeded
4. ⏳ Set up Supabase project
5. ⏳ Configure OAuth providers
6. ⏳ Set up Stripe webhooks
7. ⏳ Implement mobile app with offline sync
8. ⏳ Build web analytics dashboard

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review schema comments in SQL files
- Test queries in Supabase SQL Editor

---

**Database Version**: 1.0.0
**Last Updated**: 2025-12-04
**Compatibility**: Supabase (PostgreSQL 15+)
