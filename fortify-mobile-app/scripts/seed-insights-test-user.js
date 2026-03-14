/**
 * Seed realistic workout data for a specific user to validate Insights.
 * Usage: node scripts/seed-insights-test-user.js <email> --confirm [--first-only|--positive|--bench-plateau-fatigue|--elite-discipline]
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
const positiveOnly = process.argv.includes('--positive');
const benchPlateauFatigueOnly = process.argv.includes('--bench-plateau-fatigue');
const eliteDisciplineOnly = process.argv.includes('--elite-discipline');

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

const getWeekStartUtc = (date) => {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

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

const getTodayInTimezone = (timeZone) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const partMap = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    const year = Number(partMap.year);
    const month = Number(partMap.month);
    const day = Number(partMap.day);
    const today = new Date(Date.UTC(year, month - 1, day));
    today.setUTCHours(0, 0, 0, 0);
    return today;
  } catch {
    const fallback = new Date();
    fallback.setUTCHours(0, 0, 0, 0);
    return fallback;
  }
};

const getYearStartInTimezone = (timeZone) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
    });
    const parts = formatter.formatToParts(new Date());
    const yearPart = parts.find((part) => part.type === 'year');
    const year = Number(yearPart?.value);
    const start = new Date(Date.UTC(year, 0, 1));
    start.setUTCHours(0, 0, 0, 0);
    return start;
  } catch {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }
};

const roundToNearest5 = (value) => Math.round(value / 5) * 5;

const scaleLoad = (value, factor) => roundToNearest5(value * factor);

const buildEliteWeekConfig = (weekIndex) => {
  const block = Math.floor(weekIndex / 4);
  const phase = weekIndex % 4;
  const isDeloadWeek = phase === 3 && weekIndex > 0;

  const benchBase = 225 + block * 5 + (phase === 1 ? 5 : phase === 2 ? 10 : 0);
  const squatBase = 315 + block * 10 + (phase === 2 ? 10 : phase === 1 ? 5 : 0);
  const deadliftBase = 365 + block * 10 + (phase === 2 ? 15 : phase === 1 ? 5 : 0);
  const overheadBase = 145 + block * 5 + (phase === 2 ? 5 : 0);
  const rowBase = 185 + block * 5 + (phase >= 1 ? 5 : 0);

  const intensityFactor = isDeloadWeek ? 0.93 : 1;
  const baseSets = isDeloadWeek
    ? { benchA: 4, benchB: 4, benchC: 3, benchD: 3, squat: 4, deadlift: 3, overheadA: 3, overheadD: 3, row: 4 }
    : { benchA: 5, benchB: 5, benchC: 4, benchD: 4, squat: 5, deadlift: 4, overheadA: 4, overheadD: 4, row: 5 };

  let days = [1, 2, 3, 4, 5];
  let types = ['A', 'B', 'C', 'D', 'A'];
  if (isDeloadWeek) {
    days = [1, 2, 4, 5];
    types = ['A', 'B', 'C', 'D'];
  } else if (weekIndex % 6 === 2) {
    days = [1, 2, 3, 4, 5, 6];
    types = ['A', 'B', 'C', 'D', 'A', 'B'];
  }

  return {
    bench: {
      weight: scaleLoad(benchBase, intensityFactor),
      reps: isDeloadWeek ? 6 : 5,
      setsA: baseSets.benchA,
      setsB: baseSets.benchB,
      setsC: baseSets.benchC,
      setsD: baseSets.benchD,
    },
    squat: {
      weight: scaleLoad(squatBase, intensityFactor),
      reps: isDeloadWeek ? 6 : 5,
      sets: baseSets.squat,
    },
    deadlift: {
      weight: scaleLoad(deadliftBase, intensityFactor),
      reps: isDeloadWeek ? 5 : 4,
      sets: baseSets.deadlift,
    },
    overhead: {
      weight: scaleLoad(overheadBase, intensityFactor),
      reps: 8,
      setsA: baseSets.overheadA,
      setsD: baseSets.overheadD,
    },
    row: {
      weight: scaleLoad(rowBase, intensityFactor),
      reps: 8,
      sets: baseSets.row,
    },
    days,
    types,
  };
};

const buildEliteSessionPlan = (timeZone, currentWeekStart) => {
  const today = getTodayInTimezone(timeZone);
  const yearStart = getYearStartInTimezone(timeZone);
  const firstWeekStart = getWeekStartUtc(yearStart);

  const sessions = [];
  let weekCursor = new Date(firstWeekStart);
  let weekIndex = 0;

  while (weekCursor.getTime() <= currentWeekStart.getTime()) {
    const config = buildEliteWeekConfig(weekIndex);
    config.days.forEach((dayOffset, idx) => {
      const sessionDay = addDays(weekCursor, dayOffset);
      sessionDay.setUTCHours(0, 0, 0, 0);
      if (sessionDay.getTime() < yearStart.getTime()) return;
      if (sessionDay.getTime() > today.getTime()) return;

      const sessionDate = new Date(sessionDay);
      sessionDate.setUTCHours(18, 0, 0, 0);
      sessions.push({
        sessionDate,
        template: config.types[idx],
        config,
      });
    });

    weekCursor = addDays(weekCursor, 7);
    weekIndex += 1;
  }

  return {
    sessions,
    yearStart,
    today,
  };
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

const positiveWeekConfigs = [
  {
    offset: -3,
    bench: { weight: 185, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 225, reps: 5, sets: 3 },
    deadlift: { weight: 275, reps: 5, sets: 3 },
    overhead: { weight: 95, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -2,
    bench: { weight: 190, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 235, reps: 5, sets: 3 },
    deadlift: { weight: 285, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -1,
    bench: { weight: 195, reps: 8, setsA: 3, setsB: 4, setsC: 3, setsD: 0 },
    squat: { weight: 245, reps: 5, sets: 3 },
    deadlift: { weight: 295, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 140, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: 0,
    bench: { weight: 205, reps: 8, setsA: 6, setsB: 5, setsC: 4, setsD: 4 },
    squat: { weight: 255, reps: 5, sets: 4 },
    deadlift: { weight: 305, reps: 5, sets: 4 },
    overhead: { weight: 110, reps: 8, setsA: 4, setsD: 4 },
    row: { weight: 145, reps: 10, sets: 4 },
    days: [1, 2, 4, 5],
    types: ['A', 'B', 'C', 'D'],
  },
];

const benchPlateauFatigueWeekConfigs = [
  {
    offset: -3,
    bench: { weight: 185, reps: 8, setsA: 3, setsB: 3, setsC: 3, setsD: 0 },
    squat: { weight: 235, reps: 5, sets: 3 },
    deadlift: { weight: 285, reps: 5, sets: 3 },
    overhead: { weight: 100, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 135, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -2,
    bench: { weight: 190, reps: 8, setsA: 3, setsB: 3, setsC: 3, setsD: 0 },
    squat: { weight: 245, reps: 5, sets: 3 },
    deadlift: { weight: 295, reps: 5, sets: 3 },
    overhead: { weight: 105, reps: 8, setsA: 3, setsD: 0 },
    row: { weight: 140, reps: 10, sets: 3 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: -1,
    bench: { weight: 205, reps: 5, setsA: 2, setsB: 3, setsC: 3, setsD: 0 },
    squat: { weight: 255, reps: 5, sets: 2 },
    deadlift: { weight: 305, reps: 5, sets: 2 },
    overhead: { weight: 110, reps: 8, setsA: 2, setsD: 0 },
    row: { weight: 150, reps: 8, sets: 2 },
    days: [1, 3, 5],
    types: ['A', 'B', 'C'],
  },
  {
    offset: 0,
    bench: { weight: 195, reps: 5, setsA: 5, setsB: 5, setsC: 6, setsD: 4 },
    squat: { weight: 245, reps: 5, sets: 6 },
    deadlift: { weight: 285, reps: 5, sets: 5 },
    overhead: { weight: 100, reps: 8, setsA: 4, setsD: 4 },
    row: { weight: 135, reps: 10, sets: 5 },
    days: [1, 2, 4, 5],
    types: ['A', 'B', 'C', 'D'],
  },
];

const resolveExercises = async () => {
  const resolved = {};

  if (benchPlateauFatigueOnly) {
    const { data: benchExact, error: benchExactError } = await supabase
      .from('exercises')
      .select('id, name')
      .ilike('name', 'barbell bench press')
      .limit(1);

    if (benchExactError || !benchExact || benchExact.length === 0) {
      throw new Error(`Missing exact barbell bench press match`);
    }

    resolved.bench = benchExact[0];
  }

  for (const entry of exerciseQueries) {
    if (benchPlateauFatigueOnly && entry.key === 'bench') {
      continue;
    }

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

const STALL_THRESHOLDS = {
  chill: 0,
  standard: 0.5,
  aggressive: 1.0,
};

const FATIGUE_THRESHOLDS = {
  chill: { volumeSpikeWoW: 40, e1rmDropForFatigue: -2.5, minSessions: 2 },
  standard: { volumeSpikeWoW: 30, e1rmDropForFatigue: -2.0, minSessions: 2 },
  aggressive: { volumeSpikeWoW: 20, e1rmDropForFatigue: -1.5, minSessions: 2 },
};

const formatPct = (value) => (Number.isFinite(value) ? Number(value.toFixed(1)) : null);

const reportEliteDiscipline = ({ sessions, yearStart, today }) => {
  const weeklyCounts = new Map();
  const uniqueDays = new Set();
  sessions.forEach((item) => {
    const weekKey = toIsoDate(getWeekStartUtc(item.sessionDate));
    weeklyCounts.set(weekKey, (weeklyCounts.get(weekKey) ?? 0) + 1);
    uniqueDays.add(toIsoDate(item.sessionDate));
  });

  const currentWeekKey = toIsoDate(getWeekStartUtc(today));
  const completedWeekCounts = Array.from(weeklyCounts.entries())
    .filter(([weekKey]) => weekKey < currentWeekKey)
    .map(([, count]) => count);

  const minCompletedWeek =
    completedWeekCounts.length > 0 ? Math.min(...completedWeekCounts) : 0;
  const avgCompletedWeek =
    completedWeekCounts.length > 0
      ? completedWeekCounts.reduce((sum, value) => sum + value, 0) / completedWeekCounts.length
      : 0;

  const firstSessionDate = sessions[0]?.sessionDate ?? yearStart;
  const lastSessionDate = sessions[sessions.length - 1]?.sessionDate ?? today;

  console.log('\nVerification snapshot (elite discipline mode):');
  console.log(`- Date range: ${toIsoDate(firstSessionDate)} to ${toIsoDate(lastSessionDate)}`);
  console.log(`- Active training days: ${uniqueDays.size}`);
  console.log(`- Sessions per completed week: min ${minCompletedWeek}, avg ${avgCompletedWeek.toFixed(1)}`);
  console.log(`- Completed weeks seeded: ${completedWeekCounts.length}`);
};

const reportBenchPlateauFatigue = async ({
  userId,
  weekStart,
  benchExerciseId,
  conservatismLevel,
}) => {
  const stallThreshold = STALL_THRESHOLDS[conservatismLevel] ?? STALL_THRESHOLDS.standard;
  const fatigueThreshold =
    FATIGUE_THRESHOLDS[conservatismLevel] ?? FATIGUE_THRESHOLDS.standard;

  const lastWeekStart = addDays(weekStart, -7);
  const lookbackStart = addDays(weekStart, -42);

  const { data: weeklyVolumeRows } = await supabase
    .from('weekly_workout_volume')
    .select('week_start, workouts_count, total_volume')
    .eq('user_id', userId)
    .gte('week_start', toIsoDate(lastWeekStart))
    .lte('week_start', toIsoDate(weekStart));

  const weeklyVolumeByWeek = new Map();
  (weeklyVolumeRows ?? []).forEach((row) => {
    const key = toIsoDate(new Date(row.week_start));
    weeklyVolumeByWeek.set(key, row);
  });

  const thisWeekKey = toIsoDate(weekStart);
  const lastWeekKey = toIsoDate(lastWeekStart);
  const thisWeekVolume = Number(weeklyVolumeByWeek.get(thisWeekKey)?.total_volume ?? 0);
  const lastWeekVolume = Number(weeklyVolumeByWeek.get(lastWeekKey)?.total_volume ?? 0);
  const thisWeekWorkouts = Number(weeklyVolumeByWeek.get(thisWeekKey)?.workouts_count ?? 0);
  const lastWeekWorkouts = Number(weeklyVolumeByWeek.get(lastWeekKey)?.workouts_count ?? 0);
  const totalWorkouts = thisWeekWorkouts + lastWeekWorkouts;
  const volumeDeltaPct =
    lastWeekVolume > 0 ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : null;

  const { data: exposures } = await supabase
    .from('exercise_exposures')
    .select('exercise_id, exposure_at')
    .eq('user_id', userId)
    .gte('exposure_at', new Date(lookbackStart).toISOString());

  const exposureByExercise = new Map();
  (exposures ?? []).forEach((row) => {
    if (!row?.exercise_id || !row?.exposure_at) return;
    const ts = new Date(row.exposure_at).getTime();
    const existing = exposureByExercise.get(row.exercise_id);
    if (existing) {
      existing.exposures += 1;
      existing.lastExposureAt = Math.max(existing.lastExposureAt, ts);
    } else {
      exposureByExercise.set(row.exercise_id, {
        exerciseId: row.exercise_id,
        exposures: 1,
        lastExposureAt: ts,
      });
    }
  });

  const candidateIds = Array.from(exposureByExercise.values())
    .sort((a, b) => {
      if (a.exposures !== b.exposures) return b.exposures - a.exposures;
      return b.lastExposureAt - a.lastExposureAt;
    })
    .slice(0, 5)
    .map((item) => item.exerciseId);

  const { data: weeklyAggRows } = candidateIds.length
    ? await supabase
        .from('exercise_weekly_agg')
        .select('exercise_id, week_start, total_volume, best_e1rm')
        .eq('user_id', userId)
        .in('exercise_id', candidateIds)
        .gte('week_start', toIsoDate(addDays(weekStart, -21)))
        .lte('week_start', toIsoDate(weekStart))
    : { data: [] };

  const weeklyByExercise = new Map();
  (weeklyAggRows ?? []).forEach((row) => {
    if (!row?.exercise_id || !row?.week_start) return;
    const key = toIsoDate(new Date(row.week_start));
    if (!weeklyByExercise.has(row.exercise_id)) {
      weeklyByExercise.set(row.exercise_id, new Map());
    }
    weeklyByExercise.get(row.exercise_id).set(key, {
      totalVolume: Number(row.total_volume ?? 0),
      bestE1rm: Number(row.best_e1rm ?? 0),
    });
  });

  const e1rmLast = [];
  const e1rmThis = [];
  candidateIds.forEach((exerciseId) => {
    const weeks = weeklyByExercise.get(exerciseId);
    if (!weeks) return;
    const last = Number(weeks.get(lastWeekKey)?.bestE1rm ?? 0);
    const current = Number(weeks.get(thisWeekKey)?.bestE1rm ?? 0);
    if (last > 0 && current > 0) {
      e1rmLast.push(last);
      e1rmThis.push(current);
    }
  });

  const avgLastE1rm =
    e1rmLast.length > 0 ? e1rmLast.reduce((sum, v) => sum + v, 0) / e1rmLast.length : 0;
  const avgThisE1rm =
    e1rmThis.length > 0 ? e1rmThis.reduce((sum, v) => sum + v, 0) / e1rmThis.length : 0;
  const fatigueE1rmDeltaPct =
    avgLastE1rm > 0 ? ((avgThisE1rm - avgLastE1rm) / avgLastE1rm) * 100 : null;

  const benchItems = (weeklyAggRows ?? []).filter((row) => row.exercise_id === benchExerciseId);
  const benchWeekMap = new Map();
  benchItems.forEach((row) => {
    if (!row?.week_start) return;
    benchWeekMap.set(toIsoDate(new Date(row.week_start)), Number(row.total_volume ?? 0));
  });

  const weekKeyMinus1 = toIsoDate(addDays(weekStart, -7));
  const weekKeyMinus2 = toIsoDate(addDays(weekStart, -14));
  const weekKeyMinus3 = toIsoDate(addDays(weekStart, -21));
  const recentBenchVolume =
    Number(benchWeekMap.get(thisWeekKey) ?? 0) + Number(benchWeekMap.get(weekKeyMinus1) ?? 0);
  const previousBenchVolume =
    Number(benchWeekMap.get(weekKeyMinus2) ?? 0) + Number(benchWeekMap.get(weekKeyMinus3) ?? 0);
  const benchVolumeDeltaPct =
    previousBenchVolume > 0 ? ((recentBenchVolume - previousBenchVolume) / previousBenchVolume) * 100 : null;

  const { data: benchExposureRows } = await supabase
    .from('exercise_exposures')
    .select('best_e1rm, exposure_at')
    .eq('user_id', userId)
    .eq('exercise_id', benchExerciseId)
    .gte('exposure_at', new Date(lookbackStart).toISOString())
    .order('exposure_at', { ascending: true });

  const lastThreeBench = (benchExposureRows ?? []).slice(-3);
  const benchOldestE1rm = Number(lastThreeBench[0]?.best_e1rm ?? 0);
  const benchLatestE1rm = Number(lastThreeBench[lastThreeBench.length - 1]?.best_e1rm ?? 0);
  const benchLastThreeDeltaPct =
    benchOldestE1rm > 0 ? ((benchLatestE1rm - benchOldestE1rm) / benchOldestE1rm) * 100 : null;

  const fatigueExpected =
    totalWorkouts >= fatigueThreshold.minSessions &&
    thisWeekVolume > 0 &&
    lastWeekVolume > 0 &&
    volumeDeltaPct !== null &&
    fatigueE1rmDeltaPct !== null &&
    volumeDeltaPct >= fatigueThreshold.volumeSpikeWoW &&
    fatigueE1rmDeltaPct <= fatigueThreshold.e1rmDropForFatigue;

  const benchStallExpected =
    lastThreeBench.length === 3 &&
    benchLastThreeDeltaPct !== null &&
    benchVolumeDeltaPct !== null &&
    benchLastThreeDeltaPct <= stallThreshold &&
    benchVolumeDeltaPct <= 5;

  console.log('\nVerification snapshot (bench plateau + fatigue mode):');
  console.log(`- Conservatism level: ${conservatismLevel}`);
  console.log(`- Weekly volume WoW: ${Math.round(lastWeekVolume)} -> ${Math.round(thisWeekVolume)} (${formatPct(volumeDeltaPct)}%)`);
  console.log(`- Fatigue avg e1RM WoW: ${Math.round(avgLastE1rm)} -> ${Math.round(avgThisE1rm)} (${formatPct(fatigueE1rmDeltaPct)}%)`);
  console.log(`- Fatigue trigger expected: ${fatigueExpected ? 'YES' : 'NO'}`);
  console.log(`- Bench stall (last 3) e1RM delta: ${formatPct(benchLastThreeDeltaPct)}%`);
  console.log(`- Bench volume delta (recent2w vs prior2w): ${formatPct(benchVolumeDeltaPct)}%`);
  console.log(`- Bench stall trigger expected: ${benchStallExpected ? 'YES' : 'NO'}`);
};

const run = async () => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, timezone, conservatism_level')
    .eq('email', email)
    .single();

  if (profileError || !profile?.id) {
    throw new Error(`Failed to find profile for ${email}: ${profileError?.message ?? 'Unknown error'}`);
  }

  const userId = profile.id;
  const timezone = profile.timezone || 'UTC';
  const conservatismLevel = profile.conservatism_level || 'standard';
  const weekStart = getWeekStartInTimezone(timezone);

  console.log(`Seeding user ${email} (${userId}) with timezone ${timezone}`);

  await supabase.from('training_insight_snoozes').delete().eq('user_id', userId);
  await supabase.from('training_insights').delete().eq('user_id', userId);
  await supabase.from('workout_sessions').delete().eq('user_id', userId);

  const exerciseMap = await resolveExercises();

  let sessionCount = 0;
  let setCount = 0;

  const insertSession = async ({
    sessionDate,
    template,
    config,
    localId,
    name,
  }) => {
    const completedAt = new Date(sessionDate.getTime() + 60 * 60 * 1000);

    const sessionPayload = {
      user_id: userId,
      name,
      started_at: sessionDate.toISOString(),
      completed_at: completedAt.toISOString(),
      duration_seconds: 3600,
      is_synced: true,
      local_id: localId,
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
  };

  if (eliteDisciplineOnly) {
    const elitePlan = buildEliteSessionPlan(timezone, weekStart);

    for (const [index, sessionPlan] of elitePlan.sessions.entries()) {
      await insertSession({
        sessionDate: sessionPlan.sessionDate,
        template: sessionPlan.template,
        config: sessionPlan.config,
        localId: `seed-elite-${index}`,
        name: `Elite Session (${toIsoDate(sessionPlan.sessionDate)})`,
      });
    }

    console.log(`Seeded ${sessionCount} sessions and ${setCount} sets.`);
    reportEliteDiscipline(elitePlan);
  } else {
    const selectedConfigs = firstOnly
      ? [weekConfigs[weekConfigs.length - 1]]
      : positiveOnly
      ? positiveWeekConfigs
      : benchPlateauFatigueOnly
      ? benchPlateauFatigueWeekConfigs
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

        await insertSession({
          sessionDate,
          template,
          config,
          localId: firstOnly ? 'seed-first' : `seed-${config.offset}-${index}`,
          name: `Seed Session (${toIsoDate(sessionDate)})`,
        });
      }

      if (firstOnly) {
        break;
      }
    }

    console.log(`Seeded ${sessionCount} sessions and ${setCount} sets.`);
  }

  if (benchPlateauFatigueOnly && exerciseMap.bench?.id) {
    await reportBenchPlateauFatigue({
      userId,
      weekStart,
      benchExerciseId: exerciseMap.bench.id,
      conservatismLevel,
    });
  }
};

run()
  .then(() => {
    console.log('Seed complete. Open the app and refresh Insights to generate new cards.');
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
