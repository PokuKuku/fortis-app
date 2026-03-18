import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const MOBILE_APP_DIR = path.join(ROOT_DIR, 'fortify-mobile-app');

const BODY_ASSET_FILES = {
  maleFront: path.join(MOBILE_APP_DIR, 'node_modules', 'react-native-body-highlighter', 'assets', 'bodyFront.ts'),
  maleBack: path.join(MOBILE_APP_DIR, 'node_modules', 'react-native-body-highlighter', 'assets', 'bodyBack.ts'),
  femaleFront: path.join(MOBILE_APP_DIR, 'node_modules', 'react-native-body-highlighter', 'assets', 'bodyFemaleFront.ts'),
  femaleBack: path.join(MOBILE_APP_DIR, 'node_modules', 'react-native-body-highlighter', 'assets', 'bodyFemaleBack.ts'),
};

export const MUSCLE_KEYS = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'triceps',
  'biceps',
  'forearms',
  'lats',
  'upper_back',
  'lower_back',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'adductors',
  'abductors',
];

export const MUSCLE_TO_HEATMAP_REGIONS = {
  chest: [{ slug: 'chest', side: 'front' }],
  front_delts: [{ slug: 'deltoids', side: 'both' }],
  side_delts: [{ slug: 'deltoids', side: 'both' }],
  rear_delts: [{ slug: 'deltoids', side: 'both' }],
  triceps: [{ slug: 'triceps', side: 'both' }],
  biceps: [{ slug: 'biceps', side: 'front' }],
  forearms: [
    { slug: 'forearm', side: 'both' },
    { slug: 'hands', side: 'both' },
  ],
  lats: [{ slug: 'upper-back', side: 'back' }],
  upper_back: [
    { slug: 'trapezius', side: 'both' },
    { slug: 'neck', side: 'both' },
    { slug: 'deltoids', side: 'front' },
  ],
  lower_back: [{ slug: 'lower-back', side: 'back' }],
  abs: [{ slug: 'abs', side: 'front' }],
  obliques: [{ slug: 'obliques', side: 'front' }],
  glutes: [{ slug: 'gluteal', side: 'back' }],
  quads: [
    { slug: 'quadriceps', side: 'front' },
    { slug: 'knees', side: 'front' },
  ],
  hamstrings: [{ slug: 'hamstring', side: 'back' }],
  calves: [
    { slug: 'calves', side: 'both' },
    { slug: 'tibialis', side: 'front' },
    { slug: 'ankles', side: 'both' },
    { slug: 'feet', side: 'both' },
  ],
  adductors: [{ slug: 'adductors', side: 'both' }],
  abductors: [{ slug: 'gluteal', side: 'back' }],
};

export const TIER_COLORS = {
  0: '#8C949E',
  1: '#F67B7D',
  2: '#F6C07A',
  3: '#F2E57A',
  4: '#9AF06C',
  5: '#7DBBFF',
  6: '#8B7CFF',
};

export const TIER_LABELS = [
  { value: 1, label: 'S Tier', color: TIER_COLORS[1] },
  { value: 2, label: 'A Tier', color: TIER_COLORS[2] },
  { value: 3, label: 'B Tier', color: TIER_COLORS[3] },
  { value: 4, label: 'C Tier', color: TIER_COLORS[4] },
  { value: 5, label: 'D Tier', color: TIER_COLORS[5] },
  { value: 6, label: 'E Tier', color: TIER_COLORS[6] },
];

function stripTypes(source) {
  return source
    .replace(/^import .*$/m, '')
    .replace(/export const \w+\s*:\s*BodyPart\[\]\s*=\s*/, 'return ')
    .trim();
}

async function loadBodyAsset(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const executable = stripTypes(source);
  return new Function(executable)();
}

export async function loadBodyAssets() {
  const entries = await Promise.all(
    Object.entries(BODY_ASSET_FILES).map(async ([key, filePath]) => [key, await loadBodyAsset(filePath)])
  );

  return Object.fromEntries(entries);
}

export async function loadBrandAssets() {
  const assetFiles = {
    logoDark: path.join(ROOT_DIR, 'pic-assets', 'fortify-logo-frost.png'),
    logoLight: path.join(ROOT_DIR, 'pic-assets', 'fortify-logo.png'),
    appStoreBadge: path.join(ROOT_DIR, 'pic-assets', 'app-store-logo.png'),
    logoBadge: path.join(ROOT_DIR, 'pic-assets', 'fortify-logo-badge-2.png'),
    tiersBackground: path.join(ROOT_DIR, 'pic-assets', 'fortify-tiers.png'),
  };

  const encoded = await Promise.all(
    Object.entries(assetFiles).map(async ([key, filePath]) => {
      const buffer = await fs.readFile(filePath);
      return [key, `data:image/png;base64,${buffer.toString('base64')}`];
    })
  );

  return Object.fromEntries(encoded);
}
