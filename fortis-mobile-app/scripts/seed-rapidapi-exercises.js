/**
 * Seed Script: RapidAPI ExerciseDB to Supabase
 *
 * This script fetches all exercises from RapidAPI ExerciseDB and upserts them
 * into Supabase. This ensures the app's exercise data matches the database.
 *
 * Usage:
 *   node scripts/seed-rapidapi-exercises.js
 *
 * Prerequisites:
 *   - .env file with EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
 *     and EXPO_PUBLIC_EXERCISEDB_API_KEY
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env
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
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Check .env file.');
  process.exit(1);
}

// Determine which API to use
const USE_RAPIDAPI = !!RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;
const OPENSOURCE_BASE_URL = 'https://exercisedb-api.vercel.app/api/v1';

/**
 * Fetch all exercises from ExerciseDB (RapidAPI or open source)
 */
async function fetchAllExercises() {
  const allExercises = [];
  let offset = 0;
  const limit = 100; // Both APIs have max limit of 100
  let hasMore = true;
  let retryCount = 0;
  const MAX_RETRIES = 5;

  const apiName = USE_RAPIDAPI ? 'RapidAPI' : 'Open Source ExerciseDB';
  console.log(`Fetching exercises from ${apiName}...`);

  while (hasMore) {
    const url = USE_RAPIDAPI
      ? `${RAPIDAPI_BASE_URL}/exercises?offset=${offset}&limit=${limit}`
      : `${OPENSOURCE_BASE_URL}/exercises?offset=${offset}&limit=${limit}`;

    try {
      const headers = USE_RAPIDAPI
        ? { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST }
        : {};

      console.log(`  Requesting: ${url}`);
      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (response.status === 429) {
          retryCount++;
          if (retryCount > MAX_RETRIES) {
            console.log(`Max retries (${MAX_RETRIES}) exceeded. Stopping with ${allExercises.length} exercises.`);
            hasMore = false;
            break;
          }
          const waitTime = Math.min(2000 * Math.pow(2, retryCount - 1), 30000); // Exponential backoff, max 30s
          console.log(`Rate limited (attempt ${retryCount}/${MAX_RETRIES}), waiting ${waitTime/1000}s...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        const errorText = await response.text().catch(() => '');
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText.slice(0, 200)}`);
      }

      let exercises;
      if (USE_RAPIDAPI) {
        // RapidAPI returns array directly
        exercises = await response.json();
      } else {
        // Open source returns { success, data }
        const json = await response.json();
        exercises = json.success ? json.data : [];
      }

      // Reset retry count on success
      retryCount = 0;

      if (!exercises || exercises.length === 0) {
        hasMore = false;
      } else {
        allExercises.push(...exercises);
        offset += limit;
        console.log(`  Fetched ${allExercises.length} exercises...`);

        if (exercises.length < limit) {
          hasMore = false;
        }
      }

      // Be gentle with the API
      await new Promise(r => setTimeout(r, 200));

      // Safety limit
      if (offset > 5000) {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error fetching exercises:', error.message);
      break;
    }
  }

  console.log(`Total exercises fetched: ${allExercises.length}`);
  return allExercises;
}

/**
 * Transform exercise to Supabase schema
 * Handles both RapidAPI and open source ExerciseDB formats
 */
function transformExercise(exercise) {
  // Get the exercise ID (RapidAPI uses 'id', open source might use 'exerciseId')
  const exerciseId = exercise.id || exercise.exerciseId || '';
  // Generate a slug from the ID or name
  const slug = exerciseId || exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get primary muscles (different field names between APIs)
  let primaryMuscles;
  if (exercise.targetMuscles && exercise.targetMuscles.length > 0) {
    primaryMuscles = exercise.targetMuscles;
  } else if (exercise.target) {
    primaryMuscles = [exercise.target];
  } else if (exercise.bodyPart) {
    primaryMuscles = [exercise.bodyPart];
  } else {
    primaryMuscles = ['unknown'];
  }

  // Get images (RapidAPI uses gifUrl, open source might use imageUrl or images array)
  let images = [];
  if (exercise.gifUrl) {
    images = [exercise.gifUrl];
  } else if (exercise.imageUrl) {
    images = [exercise.imageUrl];
  } else if (exercise.images && Array.isArray(exercise.images)) {
    images = exercise.images;
  }

  return {
    name: exercise.name,
    slug: slug,
    level: 'intermediate', // Default level
    equipment: exercise.equipment || (exercise.equipments && exercise.equipments[0]) || 'body only',
    primary_muscles: primaryMuscles,
    secondary_muscles: exercise.secondaryMuscles || [],
    instructions: exercise.instructions || ['No instructions available'],
    category: 'strength', // Default category
    images: images,
    is_custom: false,
  };
}

/**
 * Upsert exercises to Supabase in batches
 */
async function upsertExercises(exercises) {
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  console.log(`\nUpserting ${exercises.length} exercises to Supabase...`);

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    const transformed = batch.map(transformExercise);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates', // Upsert on conflict
        },
        body: JSON.stringify(transformed),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, errorText);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${inserted} exercises upserted`);
      }
    } catch (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      errors += batch.length;
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nComplete: ${inserted} inserted, ${errors} errors`);
  return { inserted, errors };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const exportOnly = args.includes('--export');

  console.log('===========================================');
  console.log('RapidAPI ExerciseDB → Supabase Seed Script');
  console.log('===========================================\n');

  // Fetch exercises from API
  const exercises = await fetchAllExercises();

  if (exercises.length === 0) {
    console.error('No exercises fetched. Check your API key.');
    process.exit(1);
  }

  if (exportOnly) {
    // Export to JSON file for manual import
    const transformed = exercises.map(transformExercise);
    const outputPath = path.join(__dirname, '..', 'exercises-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
    console.log(`\nExported ${transformed.length} exercises to ${outputPath}`);
    return;
  }

  // Upsert to Supabase
  const result = await upsertExercises(exercises);

  console.log('\n===========================================');
  console.log(`Seed complete!`);
  console.log(`  Exercises processed: ${exercises.length}`);
  console.log(`  Successfully upserted: ${result.inserted}`);
  console.log(`  Errors: ${result.errors}`);
  console.log('===========================================');
}

main().catch(console.error);
