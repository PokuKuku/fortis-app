/**
 * Seed exercises to local Supabase PostgreSQL database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

async function seedExercises() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('Connected to local Supabase database');

    // First, update the equipment constraint to allow all ExerciseDB values
    console.log('Updating equipment constraint...');
    await client.query(`
      ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_equipment_check;
      ALTER TABLE exercises ADD CONSTRAINT exercises_equipment_check CHECK (
        equipment IS NULL OR equipment IN (
          'barbell', 'dumbbell', 'cable', 'kettlebell', 'body weight', 'machine',
          'band', 'medicine ball', 'ez barbell', 'trap bar', 'smith machine',
          'suspension', 'bodyweight', 'resistance band', 'rope', 'weighted',
          'stability ball', 'olympic barbell', 'assisted', 'leverage machine',
          'skierg machine', 'roller', 'bosu ball', 'upper body ergometer',
          'sled machine', 'tire', 'stationary bike', 'stepmill machine',
          'elliptical machine', 'hammer', 'wheel roller'
        )
      );
    `);
    console.log('Constraint updated!');

    // Read the combined SQL file
    const sqlPath = '/tmp/all-exercises-seed.sql';
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Executing seed SQL...');
    await client.query(sql);

    // Verify count
    const result = await client.query(
      "SELECT COUNT(*) as count FROM exercises WHERE is_custom = false"
    );
    console.log(`\nSeeding complete! Total base exercises: ${result.rows[0].count}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedExercises();
