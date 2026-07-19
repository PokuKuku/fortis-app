const crypto = require('crypto');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');
const sourceRoot = path.resolve(process.argv[2] ?? '/Users/kwakubimpong/Desktop/mobile');
const sourceJsonPath = path.join(sourceRoot, 'exerciseData_complete_051426.json');
const sourceGifDir = path.join(sourceRoot, '360');
const oldSnapshotPath = path.join(appRoot, 'src/data/exerciseLibrarySnapshot.json');
const outputSnapshotPath = path.join(appRoot, 'src/data/exerciseLibrarySnapshot.json');
const outputLegacyPath = path.join(appRoot, 'src/data/exerciseLegacyCompatibility.json');
const outputGifDir = path.join(appRoot, 'assets/exercise-gifs/360');
const outputAssetMapPath = path.join(appRoot, 'src/utils/exerciseGifAssets.ts');
const recoveredGifDir = path.join(appRoot, 'assets/exercise-gifs-recovered');

const UUID_NAMESPACE = 'fortify-exercisedb-v8';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeExerciseKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function titleCase(value) {
  return String(value ?? '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function deterministicUuid(seed) {
  const bytes = crypto
    .createHash('sha256')
    .update(`${UUID_NAMESPACE}:${seed}`)
    .digest()
    .subarray(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function buildOldSnapshotMaps(oldRows) {
  const byName = new Map();
  oldRows.forEach((row) => {
    const key = normalizeExerciseKey(row.name);
    if (!key || byName.has(key)) return;
    byName.set(key, row);
  });
  return { byName };
}

function mapExercise(row, oldRow) {
  const exerciseDbId = String(row.id);
  const aliases = new Set([
    exerciseDbId,
    row.name,
    titleCase(row.name),
  ]);

  if (oldRow?.slug) aliases.add(oldRow.slug);
  if (oldRow?.normalized_name) aliases.add(oldRow.normalized_name);
  (oldRow?.aliases ?? []).forEach((alias) => aliases.add(alias));

  return {
    id: oldRow?.id ?? deterministicUuid(exerciseDbId),
    exercise_db_id: exerciseDbId,
    name: row.name,
    slug: exerciseDbId,
    equipment: row.equipment ?? 'body weight',
    category: row.category ?? 'strength',
    primary_muscles: [row.target].filter(Boolean),
    secondary_muscles: row.secondaryMuscles ?? [],
    instructions: row.instructions ?? [],
    images: [`exercise-gif://${exerciseDbId}`],
    aliases: Array.from(aliases).filter(Boolean),
    canonical_id: oldRow?.canonical_id ?? null,
    canonical_key: oldRow?.canonical_key ?? null,
    based_on_exercise_id: oldRow?.based_on_exercise_id ?? null,
    is_curated: oldRow?.is_curated ?? true,
    is_hidden: false,
    is_custom: false,
    normalized_name: normalizeExerciseKey(row.name),
  };
}

function mapLegacyExercise(row) {
  return {
    ...row,
    aliases: Array.from(new Set([
      ...(row.aliases ?? []),
      row.slug,
      row.normalized_name,
      row.name,
    ].filter(Boolean))),
    images: [],
    is_hidden: row.is_hidden ?? false,
    is_custom: row.is_custom ?? false,
    normalized_name: row.normalized_name ?? normalizeExerciseKey(row.name),
  };
}

function copyGifs(exerciseDbIds) {
  fs.rmSync(outputGifDir, { recursive: true, force: true });
  fs.mkdirSync(outputGifDir, { recursive: true });

  const missing = [];
  exerciseDbIds.forEach((id) => {
    const source = path.join(sourceGifDir, `${id}.gif`);
    const target = path.join(outputGifDir, `${id}.gif`);
    if (!fs.existsSync(source)) {
      missing.push(id);
      return;
    }
    const optimizedTarget = `${target}.tmp.gif`;
    const result = spawnSync('ffmpeg', [
      '-y',
      '-loglevel', 'error',
      '-i', source,
      '-vf', 'scale=300:300:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
      optimizedTarget,
    ], { stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`Failed to optimize exercise GIF ${id}. Ensure ffmpeg is installed.`);
    }
    fs.renameSync(optimizedTarget, target);
  });

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.length} 360 GIFs: ${missing.slice(0, 10).join(', ')}`);
  }
}

function writeAssetMap(exerciseDbIds) {
  const lines = [
    "import type { ImageSourcePropType } from 'react-native';",
    '',
    `export const EXERCISE_GIF_ASSET_COUNT = ${exerciseDbIds.length};`,
    '',
    'export function getExerciseGifAsset(exerciseDbId: string): ImageSourcePropType | null {',
    '  switch (exerciseDbId) {',
    ...exerciseDbIds.map((id) => `    case '${id}': return require('../../assets/exercise-gifs/360/${id}.gif');`),
    '    default: return null;',
    '  }',
    '}',
    '',
  ];

  fs.writeFileSync(outputAssetMapPath, lines.join('\n'));
}

function main() {
  if (process.argv.includes('--asset-map-only')) {
    const snapshot = readJson(outputSnapshotPath);
    const exerciseDbIds = snapshot
      .map((row) => String(row.exercise_db_id ?? ''))
      .filter(Boolean)
      .sort();

    writeAssetMap(exerciseDbIds);
    console.log(`Wrote ${path.relative(repoRoot, outputAssetMapPath)} (${exerciseDbIds.length} lazy assets)`);
    return;
  }

  const nextRows = readJson(sourceJsonPath);
  const oldRows = readJson(oldSnapshotPath);
  const { byName } = buildOldSnapshotMaps(oldRows);

  const nextNameKeys = new Set(nextRows.map((row) => normalizeExerciseKey(row.name)));
  const snapshot = nextRows.map((row) => mapExercise(row, byName.get(normalizeExerciseKey(row.name))));
  const legacy = oldRows
    .filter((row) => !nextNameKeys.has(normalizeExerciseKey(row.name)))
    .map(mapLegacyExercise);

  const exerciseDbIds = snapshot.map((row) => row.exercise_db_id).sort();

  copyGifs(exerciseDbIds);
  writeAssetMap(exerciseDbIds);

  fs.writeFileSync(outputSnapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  fs.writeFileSync(outputLegacyPath, `${JSON.stringify(legacy, null, 2)}\n`);

  fs.rmSync(recoveredGifDir, { recursive: true, force: true });

  console.log(`Wrote ${path.relative(repoRoot, outputSnapshotPath)} (${snapshot.length} exercises)`);
  console.log(`Wrote ${path.relative(repoRoot, outputLegacyPath)} (${legacy.length} legacy exercises)`);
  console.log(`Optimized ${exerciseDbIds.length} GIFs to ${path.relative(repoRoot, outputGifDir)}`);
  console.log(`Wrote ${path.relative(repoRoot, outputAssetMapPath)}`);
}

main();
