/**
 * Seed exercises to remote Supabase using the Supabase JS client
 * This script reads the exercise JSON and seeds directly via the API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Remote Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eaknadypkkvravvaeihq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Usage: SUPABASE_SERVICE_KEY=your-service-key node scripts/seed-remote-supabase.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedExercises() {
  const jsonPath = path.join(__dirname, '..', 'exercises-export.json');
  const rawExercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Deduplicate by name
  const seenNames = new Set();
  const exercises = rawExercises.filter(e => {
    if (seenNames.has(e.name)) return false;
    seenNames.add(e.name);
    return true;
  });

  console.log(`Processing ${exercises.length} unique exercises...`);

  // Transform exercises to match database schema
  const exercisesForDb = exercises.map(e => ({
    name: e.name,
    slug: e.slug,
    level: e.level,
    equipment: e.equipment,
    primary_muscles: e.primary_muscles || [],
    secondary_muscles: e.secondary_muscles || [],
    instructions: e.instructions || [],
    category: e.category,
    images: e.images || [],
    is_custom: false
  }));

  // Process in batches of 50
  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < exercisesForDb.length; i += BATCH_SIZE) {
    const batch = exercisesForDb.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(exercisesForDb.length / BATCH_SIZE);

    process.stdout.write(`\rProcessing batch ${batchNum}/${totalBatches}...`);

    const { data, error } = await supabase
      .from('exercises')
      .upsert(batch, {
        onConflict: 'slug',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`\nError in batch ${batchNum}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
    }
  }

  console.log(`\n\nSeeding complete!`);
  console.log(`Success: ${successCount} exercises`);
  console.log(`Errors: ${errorCount} exercises`);

  // Verify count
  const { count, error: countError } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('is_custom', false);

  if (!countError) {
    console.log(`\nTotal base exercises in database: ${count}`);
  }
}

seedExercises().catch(console.error);
