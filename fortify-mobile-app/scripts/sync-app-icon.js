const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const sourceIcon = path.join(repoRoot, 'assets', 'fortify_icon.png');

const iosTargets = [
  path.join(
    repoRoot,
    'ios',
    'FortifyAI',
    'Images.xcassets',
    'AppIcon.appiconset',
    'App-Icon-1024x1024@1x.png'
  ),
];

if (!fs.existsSync(sourceIcon)) {
  console.error(`Missing source icon at ${sourceIcon}`);
  process.exit(1);
}

const copied = [];
const skipped = [];

for (const target of iosTargets) {
  if (!fs.existsSync(target)) {
    skipped.push(target);
    continue;
  }
  fs.copyFileSync(sourceIcon, target);
  copied.push(target);
}

if (copied.length === 0) {
  console.error('No iOS AppIcon targets found to update.');
  process.exit(1);
}

console.log('Updated iOS AppIcon assets from fortify_icon.png:');
for (const target of copied) {
  console.log(`- ${path.relative(repoRoot, target)}`);
}

if (skipped.length > 0) {
  console.log('Skipped missing targets:');
  for (const target of skipped) {
    console.log(`- ${path.relative(repoRoot, target)}`);
  }
}
