const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const appRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(appRoot, '.env.local');
const envPath = path.join(appRoot, '.env');
const snapshotPath = path.join(appRoot, 'src/data/exerciseLibrarySnapshot.json');

if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (fs.existsSync(envPath)) dotenv.config({ path: envPath, override: false });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const PAGE_SIZE = 1000;

async function fetchAllPublicExercises() {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_custom', false)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function countReferences(table, ids) {
  let count = 0;
  for (let index = 0; index < ids.length; index += 100) {
    const { count: batchCount, error } = await supabase
      .from(table)
      .select('exercise_id', { count: 'exact', head: true })
      .in('exercise_id', ids.slice(index, index + 100));

    if (error) {
      if (error.code === '42P01') return null;
      throw error;
    }
    count += batchCount ?? 0;
  }
  return count;
}

async function fetchReferences(table, ids) {
  const rows = [];
  for (let index = 0; index < ids.length; index += 100) {
    const { data, error } = await supabase
      .from(table)
      .select('exercise_id')
      .in('exercise_id', ids.slice(index, index + 100));

    if (error) {
      if (error.code === '42P01') return null;
      throw error;
    }
    rows.push(...(data ?? []));
  }
  return Array.from(new Set(rows.map((row) => row.exercise_id)));
}

async function main() {
  const bundledRows = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const bundledIds = new Set(bundledRows.map((row) => row.id));
  const publicRows = await fetchAllPublicExercises();
  const publicIds = new Set(publicRows.map((row) => row.id));
  const extras = publicRows.filter((row) => !bundledIds.has(row.id));
  const missingBundled = bundledRows.filter((row) => !publicIds.has(row.id));
  const extraIds = extras.map((row) => row.id);

  const referenceTables = [
    'program_exercises',
    'workout_sets',
    'exercise_sticky_notes',
    'session_exercise_notes',
    'training_insights',
  ];
  const references = {};
  for (const table of referenceTables) {
    references[table] = await countReferences(table, extraIds);
  }
  const referencedExerciseIds = {};
  for (const table of referenceTables) {
    referencedExerciseIds[table] = await fetchReferences(table, extraIds);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    bundledPublicExercises: bundledRows.length,
    livePublicExercises: publicRows.length,
    nonBundledPublicExercises: extras.length,
    missingBundledPublicExercises: missingBundled.length,
    references,
    referencedExerciseIds,
    extras,
    missingBundled,
  };

  const reportPath = path.join('/tmp', 'fortify-non-bundled-exercises-audit.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    ...report,
    extras: undefined,
    missingBundled: undefined,
    reportPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
