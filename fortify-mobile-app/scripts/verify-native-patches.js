const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const checks = [
  {
    name: 'expo-linear-gradient iOS image context crash guard',
    file: path.join(projectRoot, 'node_modules/expo-linear-gradient/ios/LinearGradientLayer.swift'),
    snippets: [
      'size.width.isFinite',
      'size.height.isFinite',
      'colors.count == 1',
      'UIGraphicsEndImageContext()',
      'location.isFinite',
    ],
  },
];

const failures = [];

for (const check of checks) {
  let contents;
  try {
    contents = fs.readFileSync(check.file, 'utf8');
  } catch (error) {
    failures.push(`${check.name}: missing file ${path.relative(projectRoot, check.file)}`);
    continue;
  }

  for (const snippet of check.snippets) {
    if (!contents.includes(snippet)) {
      failures.push(`${check.name}: missing "${snippet}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('[verify-native-patches] Required native patches are missing:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error('Run npm install from fortify-mobile-app/ so patch-package applies dependency patches.');
  process.exit(1);
}

console.log('[verify-native-patches] Native dependency patches verified.');
