/**
 * Curate ~300 most common exercises from the full database
 *
 * Strategy:
 * 1. Priority keywords for essential exercises (bench press, squat, deadlift, etc.)
 * 2. Ensure coverage across all major muscle groups
 * 3. Include all equipment types proportionally
 * 4. Deduplicate by name
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

console.log(`Total unique exercises: ${exercises.length}`);

// Priority keywords - these exercises are must-haves
const priorityKeywords = [
  // Compound lifts
  'bench press', 'squat', 'deadlift', 'overhead press', 'shoulder press',
  'barbell row', 'bent over row', 'pull-up', 'pullup', 'chin-up', 'chinup',
  'dip', 'push-up', 'pushup', 'lunge', 'hip thrust',

  // Back exercises
  'lat pulldown', 'seated row', 'cable row', 't-bar row', 'face pull',
  'shrug', 'back extension', 'hyperextension',

  // Chest exercises
  'chest fly', 'chest press', 'incline press', 'decline press', 'pec deck',
  'cable crossover', 'dumbbell fly',

  // Shoulder exercises
  'lateral raise', 'front raise', 'rear delt', 'arnold press', 'upright row',

  // Arm exercises
  'bicep curl', 'hammer curl', 'preacher curl', 'concentration curl',
  'tricep extension', 'tricep pushdown', 'skull crusher', 'close grip',
  'wrist curl', 'reverse curl',

  // Leg exercises
  'leg press', 'leg curl', 'leg extension', 'calf raise', 'romanian deadlift',
  'stiff leg', 'goblet squat', 'front squat', 'hack squat', 'step up',
  'glute bridge', 'hip abduction', 'hip adduction', 'sissy squat',

  // Core exercises
  'crunch', 'sit-up', 'situp', 'plank', 'russian twist', 'leg raise',
  'hanging knee', 'ab wheel', 'cable crunch', 'mountain climber',
  'dead bug', 'bird dog', 'hollow body',

  // Cardio/Functional
  'burpee', 'jumping jack', 'box jump', 'kettlebell swing', 'clean and press',
  'thruster', 'wall ball', 'battle rope', 'rowing', 'farmer'
];

// Score each exercise based on keyword matches
function scoreExercise(exercise) {
  const name = exercise.name.toLowerCase();
  let score = 0;

  for (const keyword of priorityKeywords) {
    if (name.includes(keyword)) {
      score += 10;
    }
  }

  // Bonus for common equipment types
  const commonEquipment = ['barbell', 'dumbbell', 'cable', 'body weight', 'kettlebell', 'machine'];
  if (commonEquipment.some(eq => exercise.equipment?.includes(eq))) {
    score += 2;
  }

  // Slight penalty for very long/specific names (usually variations)
  if (name.split(' ').length > 5) {
    score -= 1;
  }

  return score;
}

// Score all exercises
const scoredExercises = exercises.map(e => ({
  ...e,
  score: scoreExercise(e)
}));

// Sort by score descending
scoredExercises.sort((a, b) => b.score - a.score);

// Target distribution by muscle group (approximate percentages)
const muscleTargets = {
  'pectorals': 25,    // chest
  'lats': 20,         // back
  'upper back': 15,   // upper back
  'delts': 20,        // shoulders
  'biceps': 20,       // arms
  'triceps': 20,      // arms
  'quads': 20,        // legs
  'glutes': 15,       // legs
  'hamstrings': 10,   // legs
  'calves': 8,        // legs
  'abs': 25,          // core
  'forearms': 8,      // arms
  'traps': 8,         // back
  'adductors': 4,     // legs
  'abductors': 4,     // legs
  'cardiovascular system': 8  // cardio
};

// Select exercises ensuring muscle group coverage
const selected = new Set();
const muscleCount = {};

// First, add all high-score exercises (score >= 10)
for (const exercise of scoredExercises) {
  if (exercise.score >= 10 && selected.size < 200) {
    selected.add(exercise);
    for (const muscle of exercise.primary_muscles || []) {
      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
    }
  }
}

console.log(`After priority selection: ${selected.size} exercises`);

// Fill in gaps for underrepresented muscle groups
for (const [muscle, target] of Object.entries(muscleTargets)) {
  const current = muscleCount[muscle] || 0;
  if (current < target) {
    // Find exercises targeting this muscle that aren't selected yet
    const candidates = scoredExercises.filter(e =>
      !selected.has(e) &&
      (e.primary_muscles || []).includes(muscle)
    );

    // Add top candidates until we hit target or run out
    for (const exercise of candidates) {
      if ((muscleCount[muscle] || 0) >= target) break;
      if (selected.size >= 320) break; // Leave some room

      selected.add(exercise);
      for (const m of exercise.primary_muscles || []) {
        muscleCount[m] = (muscleCount[m] || 0) + 1;
      }
    }
  }
}

console.log(`After filling gaps: ${selected.size} exercises`);

// If we still need more, add remaining high-scored exercises
if (selected.size < 300) {
  for (const exercise of scoredExercises) {
    if (selected.size >= 300) break;
    if (!selected.has(exercise)) {
      selected.add(exercise);
    }
  }
}

// Convert to array and remove the score property
const curated = Array.from(selected).map(({ score, ...rest }) => rest);

console.log(`\nFinal curated count: ${curated.length}`);

// Report muscle group coverage
console.log('\nMuscle group coverage:');
const finalMuscleCount = {};
for (const exercise of curated) {
  for (const muscle of exercise.primary_muscles || []) {
    finalMuscleCount[muscle] = (finalMuscleCount[muscle] || 0) + 1;
  }
}
for (const [muscle, count] of Object.entries(finalMuscleCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${muscle}: ${count}`);
}

// Report equipment coverage
console.log('\nEquipment coverage:');
const equipmentCount = {};
for (const exercise of curated) {
  equipmentCount[exercise.equipment] = (equipmentCount[exercise.equipment] || 0) + 1;
}
for (const [equip, count] of Object.entries(equipmentCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${equip}: ${count}`);
}

// Write output
const outputPath = path.join(__dirname, '..', 'curated-exercises.json');
fs.writeFileSync(outputPath, JSON.stringify(curated, null, 2));
console.log(`\nWritten to: ${outputPath}`);
