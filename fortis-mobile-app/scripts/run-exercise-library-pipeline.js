const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

const BASICS_PATH = path.join(repoRoot, 'exercise-basics-acceptance.json');
const VARIANTS_PATH = path.join(repoRoot, 'exercise-required-variants.json');
const CURATED_PATH = path.join(__dirname, '..', 'curated-exercises.json');
const MANIFEST_PATH = path.join(repoRoot, 'exercise-library-manifest.json');

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

const normalizeAlias = (alias) => normalizeText(alias);

const slugify = (name) =>
  normalizeText(name)
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

const PLURAL_OVERRIDES = {
  ups: 'up',
  downs: 'down',
};

const stemToken = (token) => {
  if (PLURAL_OVERRIDES[token]) return PLURAL_OVERRIDES[token];
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('es') && token.length > 3) return token.slice(0, -2);
  if (token.endsWith('s') && token.length > 3) return token.slice(0, -1);
  return token;
};

const tokenize = (text) =>
  normalizeText(text)
    .split(' ')
    .map((token) => stemToken(token))
    .filter((token) => token.length > 0);

const stableUuid = (seed) => {
  const hash = crypto.createHash('sha1').update(seed).digest('hex');
  const timeLow = hash.slice(0, 8);
  const timeMid = hash.slice(8, 12);
  const timeHi = `5${hash.slice(13, 16)}`;
  const clockSeq = ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20);
  const node = hash.slice(20, 32);
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
};

const inferCategory = () => 'strength';

const inferEquipment = (name) => {
  const normalized = normalizeText(name);
  if (normalized.includes('dumbbell')) return 'dumbbell';
  if (normalized.includes('barbell')) return 'barbell';
  if (normalized.includes('cable')) return 'cable';
  if (normalized.includes('band')) return 'band';
  if (normalized.includes('assisted')) return 'assisted';
  if (normalized.includes('bosu')) return 'bosu ball';
  if (normalized.includes('bodyweight') || normalized.includes('body weight') || normalized.includes('push up')) {
    return 'body weight';
  }
  return null;
};

const inferPrimaryMuscle = (canonicalKey, name) => {
  const key = canonicalKey || normalizeText(name);
  if (key.includes('squat') || key.includes('lunge') || key.includes('leg_press') || key.includes('hack_squat')) {
    return ['quadriceps'];
  }
  if (key.includes('calf')) return ['calves'];
  if (key.includes('leg_extension')) return ['quadriceps'];
  if (key.includes('leg_curl') || key.includes('hamstring')) return ['hamstrings'];
  if (key.includes('deadlift') || key.includes('romanian') || key.includes('good_morning') || key.includes('glute_ham')) {
    return ['hamstrings'];
  }
  if (key.includes('hip_thrust') || key.includes('glute')) return ['glutes'];
  if (key.includes('bench') || key.includes('pec') || key.includes('fly') || key.includes('chest')) return ['chest'];
  if (key.includes('overhead_press') || key.includes('shoulder') || key.includes('lateral_raise')) return ['shoulders'];
  if (key.includes('pull_up') || key.includes('pulldown') || key.includes('row')) return ['middle back'];
  if (key.includes('biceps') || key.includes('curl')) return ['biceps'];
  if (key.includes('triceps') || key.includes('pushdown') || key.includes('skullcrusher') || key.includes('dip')) return ['triceps'];
  if (key.includes('plank') || key.includes('sit_up') || key.includes('crunch') || key.includes('ab_wheel')) {
    return ['abdominals'];
  }
  if (key.includes('farmer')) return ['forearms'];
  return ['unknown'];
};

const defaultInstructions = (category) =>
  category === 'cardio' ? ['Cardio movement.'] : ['Standard movement.'];

const isPlaceholderExercise = (exercise) => {
  const instructions = exercise.instructions || [];
  const category = exercise.category || 'strength';
  const defaultSet = defaultInstructions(category);
  const hasDefaultInstruction = instructions.length === 1 && instructions[0] === defaultSet[0];
  const hasNoImages = (exercise.images || []).length === 0;
  return exercise.source === 'manifest' && hasDefaultInstruction && hasNoImages;
};

async function fetchAllExercises() {
  let from = 0;
  const all = [];

  while (true) {
    const { data, error } = await supabase
      .from('exercises')
      .select(
        'id,name,slug,equipment,category,primary_muscles,secondary_muscles,instructions,level,force,mechanic,images,is_custom,created_by,canonical_id,canonical_key,aliases,is_hidden,is_curated,source,normalized_name'
      )
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

async function backfillNormalizedNames(exercises) {
  const updates = exercises
    .filter((exercise) => !exercise.is_custom)
    .map((exercise) => ({
      id: exercise.id,
      normalized_name: normalizeText(exercise.name || ''),
    }));

  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((entry) =>
        supabase
          .from('exercises')
          .update({ normalized_name: entry.normalized_name })
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

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mergeAliases(existing, incoming) {
  const normalized = uniqueList([
    ...(existing || []).map(normalizeAlias),
    ...(incoming || []).map(normalizeAlias),
  ]);
  return normalized;
}

function applyUpdate(target, patch) {
  Object.assign(target, patch);
}

async function insertExercises(inserts) {
  if (inserts.length === 0) return [];
  const { data, error } = await supabase
    .from('exercises')
    .insert(inserts)
    .select('id,name,canonical_key');
  if (error) throw error;
  return data ?? [];
}

function buildManifest(exercises, basics, variants, curatedList) {
  const byId = new Map(exercises.map((exercise) => [exercise.id, { ...exercise }]));
  const publicExercises = exercises.filter((exercise) => !exercise.is_custom);
  const canonicalIds = new Set();
  const canonicalIdByKey = new Map();
  const existingSlugs = new Set(publicExercises.map((exercise) => exercise.slug));
  const variantNameSet = new Set();

  variants.forEach((variant) => {
    variantNameSet.add(normalizeText(variant.name));
    (variant.aliases || []).forEach((alias) => variantNameSet.add(normalizeText(alias)));
  });

  const curatedNormalized = new Set(
    curatedList.map((entry) => normalizeText(entry.name || entry.slug || ''))
  );

  const scoreMatch = (exercise) => {
    let score = 0;
    if (exercise.source && exercise.source !== 'manifest') score += 6;
    if ((exercise.images || []).length > 0) score += 4;
    if ((exercise.instructions || []).length > 1) score += 3;
    if ((exercise.primary_muscles || []).length > 0) score += 2;
    if ((exercise.primary_muscles || []).includes('unknown')) score -= 2;
    return score;
  };

  const findMatch = (terms) => {
    const normalizedTerms = terms.map((term) => normalizeText(term));
    const matches = publicExercises.filter((exercise) =>
      normalizedTerms.includes(normalizeText(exercise.name || ''))
    ).filter((exercise) => !variantNameSet.has(normalizeText(exercise.name || '')));
    if (matches.length === 0) return null;
    matches.sort((a, b) => {
      const scoreDiff = scoreMatch(b) - scoreMatch(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.name || '').localeCompare(b.name || '') || a.id.localeCompare(b.id);
    });
    return { best: matches[0], matches };
  };

  const insertQueue = [];

  basics.forEach((item) => {
    const matchResult = findMatch([item.name, ...(item.aliases || [])]);
    if (matchResult) {
      const match = matchResult.best;
      const target = byId.get(match.id);
      const mergedAliases = mergeAliases(target.aliases, [item.name, ...(item.aliases || [])]);
      applyUpdate(target, {
        canonical_key: item.canonical_key,
        canonical_id: null,
        is_curated: true,
        is_hidden: false,
        aliases: mergedAliases,
      });
      canonicalIds.add(match.id);
      canonicalIdByKey.set(item.canonical_key, match.id);
      matchResult.matches.forEach((candidate) => {
        if (candidate.id === match.id) return;
        const candidateTarget = byId.get(candidate.id);
        if (!candidateTarget) return;
        applyUpdate(candidateTarget, {
          canonical_key: null,
          canonical_id: match.id,
          is_curated: false,
        });
      });
    } else {
      const generatedId = stableUuid(`canonical:${item.canonical_key}`);
      const slugBase = slugify(item.name);
      let slug = slugBase;
      let suffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }
      existingSlugs.add(slug);
      const category = inferCategory(item.name);
      const equipment = inferEquipment(item.name);
      const primaryMuscles = inferPrimaryMuscle(item.canonical_key, item.name);
      const placeholder = {
        source: 'manifest',
        instructions: defaultInstructions(category),
        images: [],
        category,
      };
      const shouldHidePlaceholder = isPlaceholderExercise(placeholder);
      const insert = {
        id: generatedId,
        name: item.name,
        slug,
        level: 'intermediate',
        equipment,
        category,
        primary_muscles: primaryMuscles,
        secondary_muscles: [],
        instructions: placeholder.instructions,
        images: placeholder.images,
        is_custom: false,
        canonical_key: item.canonical_key,
        canonical_id: null,
        aliases: mergeAliases([], [item.name, ...(item.aliases || [])]),
        is_curated: !shouldHidePlaceholder,
        is_hidden: shouldHidePlaceholder,
        source: 'manifest',
        normalized_name: normalizeText(item.name),
      };
      insertQueue.push(insert);
      byId.set(generatedId, { ...insert });
      canonicalIds.add(generatedId);
      canonicalIdByKey.set(item.canonical_key, generatedId);
    }
  });

  curatedNormalized.forEach((normalized) => {
    const match = publicExercises.find(
      (exercise) => normalizeText(exercise.name || '') === normalized
    );
    if (!match) return;
    const target = byId.get(match.id);
    if (!target) return;
    if (!target.is_curated) {
      applyUpdate(target, { is_curated: true, is_hidden: false });
    }
    if (!variantNameSet.has(normalizeText(target.name || ''))) {
      applyUpdate(target, { canonical_id: null });
    }
  });

  return {
    byId,
    insertQueue,
    canonicalIds,
    canonicalIdByKey,
    existingSlugs,
  };
}

function applyRequiredVariants({
  byId,
  publicExercises,
  canonicalIds,
  canonicalIdByKey,
  existingSlugs,
  variants,
  insertQueue,
}) {
  const findMatch = (terms) => {
    const normalizedTerms = terms.map((term) => normalizeText(term));
    const matches = publicExercises.filter((exercise) =>
      normalizedTerms.includes(normalizeText(exercise.name || ''))
    );
    if (matches.length === 0) return null;
    matches.sort((a, b) => (a.name || '').localeCompare(b.name || '') || a.id.localeCompare(b.id));
    return matches[0];
  };

  variants.forEach((variant) => {
    const parentId = canonicalIdByKey.get(variant.parent_canonical_key);
    if (!parentId) {
      console.warn(`Missing parent canonical for variant ${variant.variant_key}`);
      return;
    }
    const match = findMatch([variant.name, ...(variant.aliases || [])]);
    if (match) {
      if (match.id === parentId) {
        match = null;
      }
    }
    if (match) {
      const target = byId.get(match.id);
      const mergedAliases = mergeAliases(target.aliases, variant.aliases);
      applyUpdate(target, {
        canonical_id: parentId,
        canonical_key: variant.variant_key,
        is_hidden: false,
        is_curated: false,
        aliases: mergedAliases,
      });
    }

    if (!match) {
      const generatedId = stableUuid(`variant:${variant.variant_key}`);
      const parent = byId.get(parentId);
      const slugBase = slugify(variant.name);
      let slug = slugBase;
      let suffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugBase}-${suffix}`;
        suffix += 1;
      }
      existingSlugs.add(slug);
      const insert = {
        id: generatedId,
        name: variant.name,
        slug,
        level: parent?.level || 'intermediate',
        equipment: parent?.equipment || null,
        category: parent?.category || 'strength',
        primary_muscles: parent?.primary_muscles || ['unknown'],
        secondary_muscles: parent?.secondary_muscles || [],
        instructions: parent?.instructions || defaultInstructions(parent?.category || 'strength'),
        images: parent?.images || [],
        is_custom: false,
        canonical_key: variant.variant_key,
        canonical_id: parentId,
        aliases: mergeAliases([], variant.aliases),
        is_curated: false,
        is_hidden: false,
        source: 'manifest',
        normalized_name: normalizeText(variant.name),
      };
      insertQueue.push(insert);
      byId.set(generatedId, { ...insert });
    }
  });
}

function mapDuplicates({
  byId,
  publicExercises,
  canonicalIds,
}) {
  const canonicalMatchMap = new Map();
  const aliasMatchers = [];

  publicExercises.forEach((exercise) => {
    if (!canonicalIds.has(exercise.id)) return;
    const nameNorm = normalizeText(exercise.name || '');
    if (nameNorm) {
      canonicalMatchMap.set(nameNorm, exercise.id);
    }
    (exercise.aliases || []).forEach((alias) => {
      const aliasNorm = normalizeAlias(alias);
      if (aliasNorm) {
        canonicalMatchMap.set(aliasNorm, exercise.id);
        const tokens = tokenize(aliasNorm);
        if (tokens.length >= 2) {
          aliasMatchers.push({ canonicalId: exercise.id, tokens });
        }
      }
    });
    const nameTokens = tokenize(exercise.name || '');
    if (nameTokens.length >= 2) {
      aliasMatchers.push({ canonicalId: exercise.id, tokens: nameTokens });
    }
  });

  publicExercises.forEach((exercise) => {
    if (exercise.canonical_id || exercise.canonical_key || canonicalIds.has(exercise.id)) {
      return;
    }
    const normalized = normalizeText(exercise.name || '');
    const canonicalId = canonicalMatchMap.get(normalized);
    let resolvedCanonicalId = canonicalId;
    if (!resolvedCanonicalId) {
      const exerciseTokens = new Set(tokenize(exercise.name || ''));
      const match = aliasMatchers.find((matcher) =>
        matcher.tokens.every((token) => exerciseTokens.has(token))
      );
      resolvedCanonicalId = match ? match.canonicalId : null;
    }

    if (resolvedCanonicalId && resolvedCanonicalId !== exercise.id) {
      const target = byId.get(exercise.id);
      const wasCurated = Boolean(target?.is_curated);
      if (wasCurated && !canonicalMatchMap.has(normalized)) {
        return;
      }
      applyUpdate(target, {
        canonical_id: resolvedCanonicalId,
        is_curated: false,
      });
    }
  });
}

function applyHiddenFlags({ byId, publicExercises, canonicalIds }) {
  publicExercises.forEach((exercise) => {
    const target = byId.get(exercise.id);
    if (!target) return;
    if (isPlaceholderExercise(target)) {
      applyUpdate(target, { is_hidden: true, is_curated: false });
      return;
    }
    if (canonicalIds.has(exercise.id) || target.is_curated) return;
    if (target.category === 'stretching' || target.equipment === 'foam roll') {
      applyUpdate(target, { is_hidden: true });
    }
  });
}

function buildManifestOutput(byId, insertQueue, canonicalIds) {
  const exercises = Array.from(byId.values()).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    canonical_key: exercise.canonical_key ?? null,
    canonical_id: exercise.canonical_id ?? null,
    is_curated: Boolean(exercise.is_curated),
    is_hidden: Boolean(exercise.is_hidden),
    aliases: uniqueList(exercise.aliases || []),
  }));

  const inserts = insertQueue.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    slug: exercise.slug,
    canonical_key: exercise.canonical_key ?? null,
    canonical_id: exercise.canonical_id ?? null,
    is_curated: Boolean(exercise.is_curated),
    is_hidden: Boolean(exercise.is_hidden),
    aliases: uniqueList(exercise.aliases || []),
    metadata: {
      level: exercise.level,
      equipment: exercise.equipment,
      category: exercise.category,
      primary_muscles: exercise.primary_muscles,
      secondary_muscles: exercise.secondary_muscles,
      instructions: exercise.instructions,
      images: exercise.images,
      source: exercise.source,
      normalized_name: exercise.normalized_name,
    },
  }));

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      canonicals: canonicalIds.size,
      inserts: inserts.length,
      updates: exercises.length,
    },
    exercises,
    inserts,
  };
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
  const basics = loadJson(BASICS_PATH);
  const variants = loadJson(VARIANTS_PATH);
  const curatedList = loadJson(CURATED_PATH);

  const exercises = await fetchAllExercises();

  await backfillNormalizedNames(exercises);

  exercises.forEach((exercise) => {
    exercise.normalized_name = normalizeText(exercise.name || '');
    exercise.aliases = exercise.aliases || [];
  });

  const publicExercises = exercises.filter((exercise) => !exercise.is_custom);

  const {
    byId,
    insertQueue,
    canonicalIds,
    canonicalIdByKey,
    existingSlugs,
  } = buildManifest(exercises, basics, variants, curatedList);

  applyRequiredVariants({
    byId,
    publicExercises,
    canonicalIds,
    canonicalIdByKey,
    existingSlugs,
    variants,
    insertQueue,
  });

  const updatedExercises = Array.from(byId.values());
  const updatedPublicExercises = updatedExercises.filter((exercise) => !exercise.is_custom);

  mapDuplicates({
    byId,
    publicExercises: updatedPublicExercises,
    canonicalIds,
  });

  applyHiddenFlags({
    byId,
    publicExercises: updatedPublicExercises,
    canonicalIds,
  });

  const manifest = buildManifestOutput(byId, insertQueue, canonicalIds);
  const invalidInsert = manifest.inserts.find((entry) => !entry.name || !entry.slug);
  if (invalidInsert) {
    console.error('Invalid insert entry detected:', invalidInsert);
    process.exit(1);
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  await applyManifest(manifest);

  console.log(`Manifest written to ${MANIFEST_PATH}`);
  console.log('Manifest applied successfully.');
}

main().catch((error) => {
  console.error('Exercise library pipeline failed:', error);
  process.exit(1);
});
