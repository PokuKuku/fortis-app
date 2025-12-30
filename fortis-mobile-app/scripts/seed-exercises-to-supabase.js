/**
 * Seed exercises to Supabase using direct database connection
 * Uses the exercises-export.json file as the source
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env has EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Load exercises
const jsonPath = path.join(__dirname, '..', 'exercises-export.json');
const rawExercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Deduplicate by name (keep first occurrence)
const seenNames = new Set();
const exercises = rawExercises.filter(e => {
  if (seenNames.has(e.name)) {
    return false;
  }
  seenNames.add(e.name);
  return true;
});

console.log(`Loaded ${exercises.length} unique exercises (${rawExercises.length - exercises.length} duplicates removed)\n`);

async function seedExercises() {
  const BATCH_SIZE = 50;
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);

    // Transform to database format
    const records = batch.map(e => ({
      name: e.name,
      slug: e.slug,
      level: e.level,
      equipment: e.equipment,
      primary_muscles: e.primary_muscles,
      secondary_muscles: e.secondary_muscles,
      instructions: e.instructions,
      category: e.category,
      images: e.images,
      is_custom: false
    }));

    // Upsert batch
    const { data, error } = await supabase
      .from('exercises')
      .upsert(records, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length || batch.length;
      process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, exercises.length)}/${exercises.length} exercises...`);
    }
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log(`Seeding complete!`);
  console.log(`  Inserted/Updated: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log('='.repeat(50));

  // Verify count
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('is_custom', false);

  console.log(`\nTotal base exercises in database: ${count}`);
}

seedExercises().catch(console.error);
