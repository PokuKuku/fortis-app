const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const appRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(appRoot, '.env.local');
const envPath = path.join(appRoot, '.env');
const snapshotPath = path.join(appRoot, 'src/data/exerciseLibrarySnapshot.json');
const shouldApply = process.argv.includes('--apply');

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

// Existing program templates that used remote-only variants are moved to the
// closest exercise with a bundled GIF before those variants are removed.
const PROGRAM_EXERCISE_REPLACEMENTS = {
  '07f87749-5b59-4a33-9faa-cf6db85bdb40': '2c0b5821-950f-46e0-9b1f-532cc51bf9ce',
  '2d4746e8-65f3-490c-8c78-b09acadc884c': '090d8a0e-2266-5e54-bce6-252e693a0331',
  '5bdc2fe7-eb66-4c26-bf31-4821b98c2c29': '2a2b89a4-b0a8-4d14-bee1-2fbef182806e',
  '7973f478-908a-404f-976e-b5e3838f4849': 'b5c55593-897e-4248-83a1-844e1f02fcbe',
  '87b088d5-a949-42d8-a2a2-1fcc6bca4f0f': 'c592f0e1-ee8b-4747-a244-446dc2dff472',
  '8cccde6a-6d23-4b91-b5be-9988e85c4493': '13dae4ef-77c6-40fd-84b6-7fa7f95e8fa4',
  'a3a93383-4a13-4f37-8fc9-4ec4730fadd9': 'e346ad56-88e1-4a74-89ca-92be88d11f3d',
  'a71be0d5-992c-407c-94bb-f8946f90386e': '7c6fd86b-d9ba-48a2-aa09-65110cdc829c',
  'c56d8350-56c1-4bc4-99e1-4de71e680c21': 'c2bf4f7e-82ac-4155-bd3a-899d724f2c1a',
  'd28f20fd-befc-49ae-8def-b0d8061fec6f': '22c8551d-891b-5fc2-865d-6a7aac7ff8bf',
  'da096c85-5edc-456c-bda4-bdde3a0f2be2': '437918b1-0d1d-4e81-bc60-3d368f1de96c',
  'dba70c60-7dd1-4cc6-945a-05b87f0ef0c9': 'b4859d7d-06a0-5250-977b-3d9b0d0f7538',
  'ded97f49-6e2c-4449-80a5-bfa8a6190242': '2bd37132-6b23-4c10-b00d-dd867dbb4b99',
  'fa6b8c4a-b771-4fbd-8bb4-ce0d86500c52': '44321c23-9411-44cf-ada0-b93238d60962',
};

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

async function fetchReferencedProgramExerciseIds(extraIds) {
  const ids = new Set();
  for (let index = 0; index < extraIds.length; index += 100) {
    const { data, error } = await supabase
      .from('program_exercises')
      .select('exercise_id')
      .in('exercise_id', extraIds.slice(index, index + 100));
    if (error) throw error;
    (data ?? []).forEach((row) => ids.add(row.exercise_id));
  }
  return Array.from(ids);
}

async function preserveSnapshots(extras) {
  for (const exercise of extras) {
    const { error: programError } = await supabase
      .from('program_exercises')
      .update({ exercise_name_snapshot: exercise.name })
      .eq('exercise_id', exercise.id);
    if (programError) throw programError;

    const { error: setsError } = await supabase
      .from('workout_sets')
      .update({
        exercise_name_snapshot: exercise.name,
        primary_muscles_snapshot: exercise.primary_muscles ?? [],
        secondary_muscles_snapshot: exercise.secondary_muscles ?? [],
      })
      .eq('exercise_id', exercise.id);
    if (setsError) throw setsError;
  }
}

async function remapProgramExercises(referencedIds) {
  for (const exerciseId of referencedIds) {
    const replacementId = PROGRAM_EXERCISE_REPLACEMENTS[exerciseId];
    if (!replacementId) {
      throw new Error(`No bundled replacement configured for referenced exercise ${exerciseId}.`);
    }
    const { error } = await supabase
      .from('program_exercises')
      .update({ exercise_id: replacementId })
      .eq('exercise_id', exerciseId);
    if (error) throw error;
  }
}

async function deleteExtras(extraIds) {
  for (let index = 0; index < extraIds.length; index += 100) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('is_custom', false)
      .in('id', extraIds.slice(index, index + 100));
    if (error) throw error;
  }
}

async function bumpLibraryVersion() {
  const { data, error } = await supabase
    .from('exercise_library_meta')
    .select('version')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;

  const { error: updateError } = await supabase
    .from('exercise_library_meta')
    .upsert({
      id: 1,
      version: Number(data?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
    });
  if (updateError) throw updateError;
}

async function main() {
  const bundledRows = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const bundledIds = new Set(bundledRows.map((row) => row.id));
  const publicRows = await fetchAllPublicExercises();
  const extras = publicRows.filter((row) => !bundledIds.has(row.id));
  const extraIds = extras.map((row) => row.id);
  const referencedProgramIds = await fetchReferencedProgramExerciseIds(extraIds);
  const unmapped = referencedProgramIds.filter((id) => !PROGRAM_EXERCISE_REPLACEMENTS[id]);

  console.log(JSON.stringify({
    mode: shouldApply ? 'apply' : 'dry-run',
    bundledRows: bundledRows.length,
    livePublicRows: publicRows.length,
    extras: extras.length,
    referencedProgramExerciseIds: referencedProgramIds.length,
    unmappedReferencedProgramExerciseIds: unmapped,
  }, null, 2));

  if (unmapped.length > 0) {
    throw new Error('Cleanup stopped because referenced program exercises lack bundled replacements.');
  }
  if (!shouldApply) return;

  const backupPath = path.join('/tmp', `fortify-non-bundled-exercises-${Date.now()}.json`);
  fs.writeFileSync(backupPath, `${JSON.stringify(extras, null, 2)}\n`);

  await preserveSnapshots(extras);
  await remapProgramExercises(referencedProgramIds);
  await deleteExtras(extraIds);
  await bumpLibraryVersion();

  const remainingRows = await fetchAllPublicExercises();
  const remainingExtras = remainingRows.filter((row) => !bundledIds.has(row.id));
  if (remainingExtras.length > 0) {
    throw new Error(`${remainingExtras.length} non-bundled public exercises remain after cleanup.`);
  }

  console.log(JSON.stringify({
    removed: extras.length,
    remappedProgramExercises: referencedProgramIds.length,
    remainingNonBundledPublicExercises: 0,
    backupPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
