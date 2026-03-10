const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const MANIFEST_PATH = path.join(repoRoot, 'exercise-library-manifest.json');
const BASICS_PATH = path.join(repoRoot, 'exercise-basics-acceptance.json');

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

const PLURAL_OVERRIDES = {
  ups: 'up',
  downs: 'down',
};

const normalizeText = (input) =>
  input
    .toLowerCase()
    .replace(/[_/]+/g, ' ')
    .replace(/[-–—]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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
    .map((token) => stemToken(token.trim()))
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));

const hasAllTokens = (tokens, tokenSet) => tokens.every((token) => tokenSet.has(token));

function buildIndex(entries) {
  return entries.map((entry) => {
    const nameText = normalizeText(entry.name);
    const nameTokens = tokenize(entry.name);
    const nameTokenSet = new Set(nameTokens);
    const aliasTexts = (entry.aliases || []).map((alias) => normalizeText(alias));
    const aliasTokenSet = new Set(aliasTexts.flatMap((text) => tokenize(text)));
    return {
      entry,
      nameText,
      nameTokenSet,
      aliasTexts,
      aliasTokenSet,
    };
  });
}

function scoreEntry(query, entry) {
  const normalizedQuery = normalizeText(query);
  const tokens = tokenize(query);
  let score = 0;

  if (hasAllTokens(tokens, entry.nameTokenSet)) score = 100;
  if (hasAllTokens(tokens, entry.aliasTokenSet)) score = Math.max(score, 90);
  if (entry.nameText.includes(normalizedQuery)) score += 10;
  if (entry.aliasTexts.some((text) => text.includes(normalizedQuery))) score += 8;
  if (entry.nameText === normalizedQuery) score += 20;
  if (entry.aliasTexts.includes(normalizedQuery)) score += 16;

  return score;
}

function search(query, index) {
  const normalizedQuery = normalizeText(query);
  const exactCandidates = index.filter(
    (entry) =>
      entry.nameText === normalizedQuery || entry.aliasTexts.includes(normalizedQuery)
  );
  const candidates = exactCandidates.length > 0 ? exactCandidates : index;

  const results = candidates
    .map((entry) => ({ entry: entry.entry, score: scoreEntry(query, entry) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.entry.name.localeCompare(b.entry.name)));

  return results;
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${path.basename(filePath)}.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const manifest = loadJson(MANIFEST_PATH);
  const basics = loadJson(BASICS_PATH);

  const canonicals = manifest.exercises.filter(
    (entry) => entry.is_curated && !entry.canonical_id
  );
  const index = buildIndex(canonicals);

  const failures = [];

  basics.forEach((basic) => {
    const queries = [basic.name, ...(basic.aliases || [])];
    queries.forEach((query) => {
      const results = search(query, index);
      const top = results[0]?.entry;
      if (!top || top.canonical_key !== basic.canonical_key) {
        failures.push({
          query,
          expected: basic.canonical_key,
          got: top ? top.canonical_key : 'none',
          topName: top ? top.name : 'none',
        });
      }
    });
  });

  if (failures.length > 0) {
    console.error('Alias smoke test failed.');
    failures.slice(0, 50).forEach((failure) => {
      console.error(
        `- "${failure.query}" -> expected ${failure.expected}, got ${failure.got} (${failure.topName})`
      );
    });
    process.exit(1);
  }

  console.log('Alias smoke test passed.');
}

main();
