/**
 * Generate smaller SQL batches for MCP execute_sql tool
 * Each batch has 10 exercises to stay under size limits
 */

const fs = require('fs');
const path = require('path');

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

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return str.toString().replace(/'/g, "''");
}

function toPostgresArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map(s => `"${escapeSQL(s)}"`).join(',');
  return `'{${escaped}}'`;
}

// Generate VALUES tuples
const values = exercises.map(e => {
  return `(
    '${escapeSQL(e.name)}',
    '${escapeSQL(e.slug)}',
    '${escapeSQL(e.level)}',
    '${escapeSQL(e.equipment)}',
    ${toPostgresArray(e.primary_muscles)},
    ${toPostgresArray(e.secondary_muscles)},
    ${toPostgresArray(e.instructions)},
    '${escapeSQL(e.category)}',
    ${toPostgresArray(e.images)},
    false
  )`;
});

// Split into batches of 10 for MCP
const BATCH_SIZE = 10;
const outputDir = path.join(__dirname, '..', 'mcp-batches');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

for (let i = 0; i < values.length; i += BATCH_SIZE) {
  const batch = values.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;

  const sql = `INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES
${batch.join(',\n')}
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;`;

  const outputPath = path.join(outputDir, `batch-${String(batchNum).padStart(3, '0')}.sql`);
  fs.writeFileSync(outputPath, sql);
}

const totalBatches = Math.ceil(values.length / BATCH_SIZE);
console.log(`Generated ${totalBatches} batch files in ${outputDir}`);
console.log(`Each batch has ${BATCH_SIZE} exercises`);
