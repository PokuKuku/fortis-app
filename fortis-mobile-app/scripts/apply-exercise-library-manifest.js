const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const repoRoot = path.resolve(__dirname, '..', '..');
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
const envPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const MANIFEST_PATH = path.join(repoRoot, 'exercise-library-manifest.json');

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Missing exercise-library-manifest.json. Run the pipeline first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

async function applyManifest(manifest) {
  if (manifest.inserts && manifest.inserts.length > 0) {
    const insertRows = manifest.inserts.map((entry) => ({
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      level: entry.metadata.level,
      equipment: entry.metadata.equipment,
      category: entry.metadata.category,
      primary_muscles: entry.metadata.primary_muscles,
      secondary_muscles: entry.metadata.secondary_muscles,
      instructions: entry.metadata.instructions,
      images: entry.metadata.images,
      is_custom: false,
      canonical_key: entry.canonical_key,
      canonical_id: entry.canonical_id,
      aliases: entry.aliases,
      is_curated: entry.is_curated,
      is_hidden: entry.is_hidden,
      source: entry.metadata.source,
      normalized_name: entry.metadata.normalized_name,
    }));

    const { error } = await supabase
      .from('exercises')
      .upsert(insertRows, { onConflict: 'id' });
    if (error) {
      throw error;
    }
  }

  const updates = manifest.exercises.map((exercise) => ({
    id: exercise.id,
    canonical_key: exercise.canonical_key,
    canonical_id: exercise.canonical_id,
    is_curated: exercise.is_curated,
    is_hidden: exercise.is_hidden,
    aliases: exercise.aliases,
  }));

  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((entry) =>
        supabase
          .from('exercises')
          .update({
            canonical_key: entry.canonical_key,
            canonical_id: entry.canonical_id,
            is_curated: entry.is_curated,
            is_hidden: entry.is_hidden,
            aliases: entry.aliases,
          })
          .eq('id', entry.id)
      )
    );
    results.forEach((result) => {
      if (result.error) {
        throw result.error;
      }
    });
  }
}

async function main() {
  const manifest = loadManifest();
  await applyManifest(manifest);
  console.log('Manifest applied successfully.');
}

main().catch((error) => {
  console.error('Failed to apply exercise library manifest:', error);
  process.exit(1);
});
