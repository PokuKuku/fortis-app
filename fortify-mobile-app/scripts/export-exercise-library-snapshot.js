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
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

const SNAPSHOT_PATH = path.join(repoRoot, 'library-snapshot.json');
const REPORT_PATH = path.join(repoRoot, 'exercise-library-report.md');
const BASICS_PATH = path.join(repoRoot, 'exercise-basics-acceptance.json');

const PAGE_SIZE = 1000;

const normalizeText = (input) =>
  input
    .toLowerCase()
    .replace(/[_/]+/g, ' ')
    .replace(/[-–—]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const uniqueList = (values) => Array.from(new Set(values.filter(Boolean)));

async function fetchAllPublicExercises() {
  let from = 0;
  const all = [];
  let totalCount = null;
  let customCount = null;

  if (supabaseAdmin) {
    const { count, error } = await supabaseAdmin
      .from('exercises')
      .select('id', { count: 'exact', head: true })
      .eq('is_custom', true);
    if (!error && typeof count === 'number') {
      customCount = count;
    }
  }

  while (true) {
    const { data, error, count } = await supabase
      .from('exercises')
      .select(
        'id,name,slug,equipment,category,primary_muscles,secondary_muscles,instructions,is_custom,created_by',
        { count: totalCount === null ? 'exact' : null }
      )
      .eq('is_custom', false)
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (totalCount === null && typeof count === 'number') {
      totalCount = count;
    }

    if (!data || data.length === 0) {
      break;
    }

    all.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return { exercises: all, totalCount: totalCount ?? all.length, customCount };
}

function buildDuplicateClusters(exercises) {
  const clusters = new Map();

  exercises.forEach((exercise) => {
    const normalized = normalizeText(exercise.name || '');
    if (!normalized) return;
    const entry = clusters.get(normalized) ?? [];
    entry.push(exercise);
    clusters.set(normalized, entry);
  });

  return Array.from(clusters.entries())
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
}

function loadBasics() {
  if (!fs.existsSync(BASICS_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(BASICS_PATH, 'utf8');
  return JSON.parse(raw);
}

function buildMissingBasicsReport(exercises, basics) {
  const nameIndex = new Map();
  exercises.forEach((exercise) => {
    const normalized = normalizeText(exercise.name || '');
    if (!normalized) return;
    if (!nameIndex.has(normalized)) {
      nameIndex.set(normalized, []);
    }
    nameIndex.get(normalized).push(exercise.name);
  });

  const missing = [];
  const found = [];

  basics.forEach((item) => {
    const terms = uniqueList([item.name, ...(item.aliases || [])]);
    const normalizedTerms = terms.map((term) => normalizeText(term));
    const matchedNames = [];

    normalizedTerms.forEach((term) => {
      const match = nameIndex.get(term);
      if (match) {
        matchedNames.push(...match);
      }
    });

    if (matchedNames.length === 0) {
      missing.push({
        canonical_key: item.canonical_key,
        name: item.name,
        aliases: item.aliases || [],
      });
    } else {
      found.push({
        canonical_key: item.canonical_key,
        name: item.name,
        matched: uniqueList(matchedNames),
      });
    }
  });

  return { missing, found };
}

function renderReport({ totalCount, customCount, duplicates, missingBasics }) {
  const lines = [];
  lines.push('# Exercise Library Snapshot Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Public exercises exported: ${totalCount}`);
  lines.push(`- Custom exercises (remote count): ${customCount ?? 'unknown'}`);
  lines.push(`- Duplicate name clusters (normalized): ${duplicates.length}`);
  lines.push(`- Missing basics: ${missingBasics.missing.length}`);
  lines.push('');

  lines.push('## Missing Basics');
  if (missingBasics.missing.length === 0) {
    lines.push('- None');
  } else {
    missingBasics.missing.forEach((item) => {
      lines.push(`- ${item.name} (${item.canonical_key})`);
      if (item.aliases.length > 0) {
        lines.push(`  aliases: ${item.aliases.join(', ')}`);
      }
    });
  }
  lines.push('');

  lines.push('## Top Duplicate Clusters (Normalized Name)');
  if (duplicates.length === 0) {
    lines.push('- None');
  } else {
    duplicates.slice(0, 50).forEach(([normalized, items]) => {
      const names = uniqueList(items.map((item) => item.name));
      lines.push(`- ${normalized} (${items.length} entries)`);
      lines.push(`  names: ${names.join(', ')}`);
    });
  }
  lines.push('');

  lines.push('## Export Details');
  lines.push(`- Output: ${path.relative(repoRoot, SNAPSHOT_PATH)}`);
  lines.push(
    '- Fields: id, name, slug, equipment, category, primary_muscles, secondary_muscles, instructions, is_custom, created_by'
  );

  return lines.join('\n');
}

async function main() {
  const { exercises, totalCount, customCount } = await fetchAllPublicExercises();

  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(exercises, null, 2)}\n`, 'utf8');

  const duplicates = buildDuplicateClusters(exercises);
  const basics = loadBasics();
  const missingBasics = buildMissingBasicsReport(exercises, basics);

  const report = renderReport({
    totalCount,
    customCount,
    duplicates,
    missingBasics,
  });

  fs.writeFileSync(REPORT_PATH, `${report}\n`, 'utf8');

  console.log(`Snapshot saved to ${SNAPSHOT_PATH}`);
  console.log(`Report saved to ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error('Failed to export exercise snapshot:', error);
  process.exit(1);
});
