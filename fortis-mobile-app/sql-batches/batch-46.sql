INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell lying one arm deltoid rear',
  'gSw59a4',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in one hand, palm facing inwards.","Step:2 Extend your arm straight down towards the floor, keeping it close to your body.","Step:3 Raise your arm up and back, squeezing your shoulder blade towards your spine.","Step:4 Pause for a moment at the top, then slowly lower your arm back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gSw59a4.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'kettlebell seesaw press',
  'UDm6cGl',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height.","Step:2 Press one kettlebell overhead while keeping the other kettlebell at shoulder height.","Step:3 Lower the pressed kettlebell back to shoulder height while simultaneously pressing the other kettlebell overhead.","Step:4 Continue alternating the pressing motion, creating a seesaw-like movement.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UDm6cGl.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable cross-over revers fly',
  'aqvSOQE',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"rhomboids","trapezius"}',
  '{"Step:1 Attach a D-handle to each low pulley cable and stand in the middle of the cable crossover machine.","Step:2 Grasp the handles with a pronated grip (palms facing down) and take a step forward, positioning your feet shoulder-width apart.","Step:3 Bend your knees slightly and lean forward at the waist, keeping your back straight and your abs engaged.","Step:4 With your arms extended out to the sides and slightly bent at the elbows, exhale and squeeze your shoulder blades together as you pull the cables back and upward in a reverse fly motion.","Step:5 Pause for a moment at the peak contraction, then inhale and slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aqvSOQE.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell standing bradford press',
  'dCPESfR',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell in front of your shoulders with an overhand grip.","Step:2 Press the barbell overhead, fully extending your arms.","Step:3 Lower the barbell back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dCPESfR.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell thruster',
  'f7Y9eDZ',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"quadriceps","glutes","hamstrings","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, holding a barbell at shoulder height with an overhand grip.","Step:2 Lower into a squat position by bending your knees and pushing your hips back.","Step:3 As you reach the bottom of the squat, explosively drive through your heels to stand up, simultaneously pressing the barbell overhead.","Step:4 Lower the barbell back to shoulder height as you lower back into the squat position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/f7Y9eDZ.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable upright row',
  'cALKspW',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold the cable attachment with an overhand grip.","Step:2 Keep your back straight and your core engaged throughout the exercise.","Step:3 Pull the cable attachment straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, squeezing your shoulder blades together.","Step:5 Slowly lower the cable attachment back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cALKspW.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell standing alternate overhead press',
  'bBi35y3',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.","Step:2 Press one dumbbell overhead, fully extending your arm.","Step:3 Lower the dumbbell back to shoulder level.","Step:4 Repeat with the other arm.","Step:5 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bBi35y3.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell iron cross',
  'cALkHHX',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides.","Step:2 Raise your arms out to the sides until they are parallel to the ground, forming a T shape with your body.","Step:3 Pause for a moment, then slowly lower your arms back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cALkHHX.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell wide-grip upright row',
  'RgJDRR1',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands wider than shoulder-width apart.","Step:2 Let the barbell hang in front of your thighs, arms fully extended.","Step:3 Keeping your back straight, exhale and lift the barbell straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RgJDRR1.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable seated rear lateral raise',
  'x825CZm',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Sit on a bench facing the cable machine with your feet flat on the ground.","Step:2 Grasp the cable handles with an overhand grip and extend your arms straight in front of you.","Step:3 Keeping your arms straight, slowly raise them out to the sides until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x825CZm.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell rear delt raise',
  'Ln9iTbU',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, palms facing down.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Raise the barbell out to the sides, keeping your arms straight, until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ln9iTbU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith seated shoulder press',
  'xUwnBMT',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height so that the handles are at shoulder level.","Step:2 Sit on the machine with your back against the pad and your feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and lift them off the supports, extending your arms fully.","Step:4 Lower the handles down to shoulder level, keeping your elbows slightly bent.","Step:5 Press the handles up overhead until your arms are fully extended.","Step:6 Pause for a moment at the top, then slowly lower the handles back down to shoulder level.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xUwnBMT.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell raise',
  'c9MnDRp',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Step:2 Keep your back straight and engage your core.","Step:3 Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/c9MnDRp.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell rear delt row',
  'S9zHIvU',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend forward at the hips, keeping your back straight and chest up.","Step:4 Pull the barbell towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S9zHIvU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell seated alternate front raise',
  'gH5fRsC',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in each hand with your palms facing your body and arms extended down by your sides.","Step:3 Keeping your arms straight, raise one dumbbell in front of you until it is parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat with the other arm.","Step:6 Alternate between arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gH5fRsC.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell upright row',
  'UDlhcO8',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Let the barbell hang in front of your thighs, arms fully extended.","Step:3 Keeping your back straight and core engaged, exhale and lift the barbell straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UDlhcO8.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell one arm lateral raise',
  'n5cWCsI',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand with your palm facing your body.","Step:2 Keep your back straight and your core engaged throughout the exercise.","Step:3 Raise the dumbbell to the side, keeping your arm straight and your palm facing down.","Step:4 Continue lifting until your arm is parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/n5cWCsI.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell cuban press',
  'QfAKy1G',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder height with your palms facing down.","Step:2 Keeping your core engaged and your elbows slightly bent, press the dumbbells up and overhead until your arms are fully extended.","Step:3 Rotate your wrists so that your palms are facing forward.","Step:4 Slowly lower the dumbbells back to the starting position, rotating your wrists back to the starting position as you do so.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QfAKy1G.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith rear delt row',
  'nFUwqG6',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the ground.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Keep your back straight and your core engaged as you pull the handles towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top of the movement, then slowly release the handles back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nFUwqG6.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;

INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'kettlebell one arm military press to the side',
  'yCvYdi7',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand at shoulder height.","Step:2 Engage your core and keep your back straight.","Step:3 Press the kettlebell overhead, extending your arm fully.","Step:4 Pause for a moment at the top, then slowly lower the kettlebell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yCvYdi7.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;