/**
 * Seed realistic workout data for a specific user to validate Insights.
 * Usage: node scripts/seed-insights-test-user.js <email> --confirm [--first-only]
 */

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

const email = process.argv[2];
const shouldConfirm = process.argv.includes('--confirm');
const firstOnly = process.argv.includes('--first-only');

if (!email) {
  console.error('Missing email. Usage: node scripts/seed-insights-test-user.js <email> --confirm');
  process.exit(1);
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to fortis-mobile-app/.env for this script.');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY.startsWith('eyJ') || SERVICE_ROLE_KEY.length < 120) {
  console.error('SUPABASE_SERVICE_ROLE_KEY does not look like a valid service role JWT.');
  console.error('Grab the service_role key from Supabase Project Settings → API.');
  process.exit(1);
}

if (!shouldConfirm) {
  console.error('Refusing to delete data without --confirm.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const WEEKDAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const getWeekStartInTimezone = (timeZone) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    const year = Number(partMap.year);
    const month = Number(partMap.month);
    const day = Number(partMap.day);
    const weekday = partMap.weekday;

    const weekdayIndex = WEEKDAY_INDEX[weekday] ?? 0;
    const diff = weekdayIndex === 0 ? -6 : 1 - weekdayIndex;
    const localDate = new Date(Date.UTC(year, month - 1, day));
    localDate.setUTCDate(localDate.getUTCDate() + diff);
    localDate.setUTCHours(0, 0, 0, 0);
    return localDate;
  } catch (error) {
    const fallback = new Date();
    const day = fallback.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(Date.UTC(fallback.getUTCFullYear(), fallback.getUTCMonth(), fallback.getUTCDate()));
    start.setUTCDate(start.getUTCDate() + diff);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }
};

const exerciseQueries = [
  { key: 'bench', label: 'Bench Press', query: '%Bench Press%' },
  { key: 'squat', label: 'Squat', query: '%Squat%' },
  { key: 'deadlift', label: 'Deadlift', query: '%Deadlift%' },
  { key: 'overhead', label: 'Overhead Press', query: '%Overhead Press%' },
  { key: 'row', label: 'Row', query: '%Row%' },
];

const sessionTemplates = {
  A: ['bench', 'squat', 'overhead'],
  B: ['bench', 'row'],
  C: ['deadlift', 'bench', 'row'],
  D: ['bench', 'overhead'],
};

const weekConfigs = [
  {
    offset: -5,
    bench: { weight: 185, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 225, reps: 5, sets: 3 },
    deadlift: { weight: 275, reps: 5, sets: 3 },
    overhead: { weight: 95, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -4,
    bench: { weight: 190, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 235, reps: 5, sets: 3 },
    deadlift: { weight: 285, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -3,
    bench: { weight: 195, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 245, reps: 5, sets: 3 },
    deadlift: { weight: 290, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -2,
    bench: { weight: 195, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 250, reps: 5, sets: 3 },
    deadlift: { weight: 295, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -1,
    bench: { weight: 200, reps: 8, setsA: 3, setsB: 3, setsC: 3, setsD: 0 },
    squat: { weight: 255, reps: 5, sets: 3 },
    deadlift: { weight: 295, reps: 5, sets: 3 },
    overhead: { weight: 105, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: 0,
    bench: { weight: 195, reps: 8, setsA: 5, setsB: 4, setsC: 4, setsD: 4 },
    squat: { weight: 245, reps: 5, sets: 4 },
    deadlift: { weight: 285, reps: 5, sets: 4 },
    overhead: { weight: 100, reps: 8, setsA: 4, setsD: 4 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 2, 4, 5],
    types: ['A', 'B', 'C', 'D'],
  },
];

const resolveExercises = async () => {
  const resolved = {};
  for (const entry of exerciseQueries) {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .ilike('name', entry.query)
      .limit(1);
    if (error || !data || data.length === 0) {
      throw new Error(`Missing exercise match for ${entry.label}`);
    }
    resolved[entry.key] = data[0];
  }
  return resolved;
};

const buildSets = (exerciseId, config, setCount, orderIndexStart) => {
  const sets = [];
  let orderIndex = orderIndexStart;
  for (let i = 0; i < setCount; i += 1) {
    sets.push({
      exercise_id: exerciseId,
      set_number: i + 1,
      reps: config.reps,
      weight: config.weight,
      weight_unit: 'lbs',
      is_warmup: false,
      order_index: orderIndex,
    });
    orderIndex += 1;
  }
  return { sets, nextIndex: orderIndex };
};

const buildSessionSets = (template, exerciseMap, config) => {
  let orderIndex = 1;
  const sets = [];
  const items = sessionTemplates[template] || [];

  items.forEach((key) => {
    const exercise = exerciseMap[key];
    if (!exercise) return;
    if (key === 'bench') {
      const count =
        template === 'A'
          ? config.bench.setsA
          : template === 'B'
          ? config.bench.setsB
          : template === 'C'
          ? config.bench.setsC
          : config.bench.setsD;
      if (count > 0) {
        const result = buildSets(exercise.id, config.bench, count, orderIndex);
        sets.push(...result.sets);
        orderIndex = result.nextIndex;
      }
      return;
    }
    if (key === 'squat') {
      const result = buildSets(exercise.id, config.squat, config.squat.sets, orderIndex);
      sets.push(...result.sets);
      orderIndex = result.nextIndex;
      return;
    }
    if (key === 'deadlift') {
      const result = buildSets(exercise.id, config.deadlift, config.deadlift.sets, orderIndex);
      sets.push(...result.sets);
      orderIndex = result.nextIndex;
      return;
    }
    if (key === 'overhead') {
      const count = template === 'A' ? config.overhead.setsA : config.overhead.setsD;
      if (count > 0) {
        const result = buildSets(exercise.id, config.overhead, count, orderIndex);
        sets.push(...result.sets);
        orderIndex = result.nextIndex;
      }
      return;
    }
    if (key === 'row') {
      const result = buildSets(exercise.id, config.row, config.row.sets, orderIndex);
      sets.push(...result.sets);
      orderIndex = result.nextIndex;
    }
  });

  return sets;
};

const run = async () => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, timezone')
    .eq('email', email)
    .single();

  if (profileError || !profile?.id) {
    throw new Error(`Failed to find profile for ${email}: ${profileError?.message ?? 'Unknown error'}`);
  }

  const userId = profile.id;
  const timezone = profile.timezone || 'UTC';
  const weekStart = getWeekStartInTimezone(timezone);

  console.log(`Seeding user ${email} (${userId}) with timezone ${timezone}`);

  await supabase.from('training_insight_feedback').delete().eq('user_id', userId);
  await supabase.from('training_insight_snoozes').delete().eq('user_id', userId);
  await supabase.from('training_insights').delete().eq('user_id', userId);
  await supabase.from('workout_sessions').delete().eq('user_id', userId);

  const exerciseMap = await resolveExercises();

  let sessionCount = 0;
  let setCount = 0;

  const selectedConfigs = firstOnly
    ? [weekConfigs[weekConfigs.length - 1]]
    : weekConfigs;

  for (const config of selectedConfigs) {
    const weekBase = addDays(weekStart, config.offset * 7);
    const sessionDays = firstOnly ? [config.days[0]] : config.days;
    const sessionTypes = firstOnly ? [config.types[0]] : config.types;

    for (let index = 0; index < sessionDays.length; index += 1) {
      const dayOffset = sessionDays[index];
      const template = sessionTypes[index];
      const sessionDate = addDays(weekBase, dayOffset);
      sessionDate.setUTCHours(18, 0, 0, 0);
      const completedAt = new Date(sessionDate.getTime() + 60 * 60 * 1000);

      const sessionPayload = {
        user_id: userId,
        name: `Seed Session (${toIsoDate(sessionDate)})`,
        started_at: sessionDate.toISOString(),
        completed_at: completedAt.toISOString(),
        duration_seconds: 3600,
        is_synced: true,
        local_id: firstOnly ? 'seed-first' : `seed-${config.offset}-${index}`,
      };

      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert(sessionPayload)
        .select('id')
        .single();

      if (sessionError || !session?.id) {
        throw new Error(`Failed to insert session: ${sessionError?.message ?? 'unknown error'}`);
      }

      const sets = buildSessionSets(template, exerciseMap, config).map((set) => ({
        ...set,
        session_id: session.id,
        created_at: sessionPayload.started_at,
        updated_at: sessionPayload.started_at,
      }));

      if (sets.length > 0) {
        const { error: setError } = await supabase.from('workout_sets').insert(sets);
        if (setError) {
          throw new Error(`Failed to insert sets: ${setError.message}`);
        }
      }

      sessionCount += 1;
      setCount += sets.length;
    }

    if (firstOnly) {
      break;
    }
  }

  console.log(`Seeded ${sessionCount} sessions and ${setCount} sets.`);
};

run()
  .then(() => {
    console.log('Seed complete. Open the app and refresh Insights to generate new cards.');
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
