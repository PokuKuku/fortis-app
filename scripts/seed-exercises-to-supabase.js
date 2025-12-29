/**
 * Script to convert exercise JSON files to SQL and seed Supabase
 * Run with: node scripts/seed-exercises-to-supabase.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const exercisesDir = path.join(__dirname, '../free-exercise-db-main/exercises');
const outputFile = path.join(__dirname, '../supabase/seed-all-exercises.sql');

// Generate deterministic UUID from exercise name (so it's reproducible)
function generateUUID(name) {
  const hash = crypto.createHash('md5').update(name).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

// Escape single quotes for SQL
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Convert array to PostgreSQL array literal
function toPostgresArray(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::TEXT[]";
  const escaped = arr.map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(',');
  return `ARRAY[${arr.map(s => escapeSql(s)).join(',')}]`;
}

// Create slug from name
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} exercise files`);

  let sql = `-- Auto-generated exercise seed file
-- Generated: ${new Date().toISOString()}
-- Total exercises: ${files.length}

-- Clear existing non-custom exercises first
DELETE FROM exercises WHERE is_custom = FALSE;

INSERT INTO exercises (id, name, slug, force, level, mechanic, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom, created_by) VALUES
`;

  const values = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(exercisesDir, file), 'utf8');
      const ex = JSON.parse(content);

      const id = generateUUID(ex.name);
      const slug = slugify(ex.name);
      const force = escapeSql(ex.force || null);
      const level = escapeSql(ex.level || 'intermediate');
      const mechanic = escapeSql(ex.mechanic || null);
      const equipment = escapeSql(ex.equipment || null);
      const primaryMuscles = toPostgresArray(ex.primaryMuscles || []);
      const secondaryMuscles = toPostgresArray(ex.secondaryMuscles || []);
      const instructions = toPostgresArray(ex.instructions || []);
      const category = escapeSql(ex.category || 'strength');
      const images = "ARRAY[]::TEXT[]"; // Skip images for now

      values.push(`(
  '${id}',
  ${escapeSql(ex.name)},
  ${escapeSql(slug)},
  ${force},
  ${level},
  ${mechanic},
  ${equipment},
  ${primaryMuscles},
  ${secondaryMuscles},
  ${instructions},
  ${category},
  ${images},
  FALSE,
  NULL
)`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }

  sql += values.join(',\n');
  sql += '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  slug = EXCLUDED.slug,\n';
  sql += '  force = EXCLUDED.force,\n';
  sql += '  level = EXCLUDED.level,\n';
  sql += '  mechanic = EXCLUDED.mechanic,\n';
  sql += '  equipment = EXCLUDED.equipment,\n';
  sql += '  primary_muscles = EXCLUDED.primary_muscles,\n';
  sql += '  secondary_muscles = EXCLUDED.secondary_muscles,\n';
  sql += '  instructions = EXCLUDED.instructions,\n';
  sql += '  category = EXCLUDED.category;\n';

  fs.writeFileSync(outputFile, sql);
  console.log(`SQL file written to: ${outputFile}`);
  console.log(`Total exercises: ${values.length}`);
}

main().catch(console.error);
