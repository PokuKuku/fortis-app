/**
 * Generate SQL INSERT statements from exercises-export.json
 * Outputs batched SQL suitable for manual execution via Supabase
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'exercises-export.json');
const rawExercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Deduplicate by name (keep first occurrence)
const seenNames = new Set();
const exercises = rawExercises.filter(e => {
  if (seenNames.has(e.name)) {
    console.log(`Skipping duplicate: ${e.name}`);
    return false;
  }
  seenNames.add(e.name);
  return true;
});
console.log(`Deduplicated: ${rawExercises.length} -> ${exercises.length} exercises\n`);

// Helper to escape single quotes in SQL
function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return str.toString().replace(/'/g, "''");
}

// Convert JS array to PostgreSQL array literal
function toPostgresArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map(s => `"${escapeSQL(s)}"`).join(',');
  return `'{${escaped}}'`;
}

// Generate INSERT statement for a single exercise
function generateInsert(exercise) {
  return `INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  '${escapeSQL(exercise.name)}',
  '${escapeSQL(exercise.slug)}',
  '${escapeSQL(exercise.level)}',
  '${escapeSQL(exercise.equipment)}',
  ${toPostgresArray(exercise.primary_muscles)},
  ${toPostgresArray(exercise.secondary_muscles)},
  ${toPostgresArray(exercise.instructions)},
  '${escapeSQL(exercise.category)}',
  ${toPostgresArray(exercise.images)},
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;`;
}

// Generate batched SQL files
const BATCH_SIZE = 20; // Smaller batches for MCP tool
const outputDir = path.join(__dirname, '..', 'sql-batches');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Generate batches
for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
  const batch = exercises.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const sql = batch.map(generateInsert).join('\n\n');

  const outputPath = path.join(outputDir, `batch-${String(batchNum).padStart(2, '0')}.sql`);
  fs.writeFileSync(outputPath, sql);
  console.log(`Generated ${outputPath} (${batch.length} exercises)`);
}

console.log(`\nGenerated ${Math.ceil(exercises.length / BATCH_SIZE)} batch files in ${outputDir}`);
console.log(`Total exercises: ${exercises.length}`);
