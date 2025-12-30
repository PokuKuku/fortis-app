INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'kettlebell alternating press',
  '5KLbZWx',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height.","Step:2 Press one kettlebell overhead, fully extending your arm.","Step:3 Lower the kettlebell back to shoulder height.","Step:4 Repeat with the other arm.","Step:5 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5KLbZWx.gif"}',
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
  'cable supine reverse fly',
  'PQcUlDi',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Attach a D-handle to a low pulley cable machine and lie face down on a flat bench.","Step:2 Grasp the D-handle with each hand, palms facing down, and extend your arms straight out in front of you.","Step:3 Keeping your arms straight, raise them out to the sides until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PQcUlDi.gif"}',
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
  'dumbbell upright shoulder external rotation',
  'x306lCW',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"rotator cuff","trapezius"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand with your palms facing your body.","Step:2 Raise your arms out to the sides until they are parallel to the ground, keeping your elbows slightly bent.","Step:3 Rotate your arms externally, bringing the dumbbells up towards your head while keeping your elbows in the same position.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x306lCW.gif"}',
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
  'dumbbell rotation reverse fly',
  'prbWx1D',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing inwards.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows, until they are parallel to the floor.","Step:4 Rotate your arms so that your palms are facing downwards.","Step:5 Slowly lower your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/prbWx1D.gif"}',
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
  'dumbbell incline t-raise',
  'jgbvVJ0',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, palms facing inwards.","Step:2 Lean forward and let your arms hang straight down, perpendicular to the floor.","Step:3 Keeping your arms straight, raise them out to the sides until they are parallel to the floor, forming a ''T'' shape with your body.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jgbvVJ0.gif"}',
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
  'dumbbell single arm overhead carry',
  'mWBtgmb',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","core"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart, holding a dumbbell in one hand.","Step:2 Raise the dumbbell overhead, fully extending your arm.","Step:3 Engage your core and keep your back straight as you walk forward, maintaining the dumbbell overhead.","Step:4 Continue walking for the desired distance or time.","Step:5 Switch hands and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mWBtgmb.gif"}',
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
  'dumbbell full can lateral raise',
  'AQ0mC4Y',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rotator cuff"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your body.","Step:2 Keep your back straight and engage your core.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows, until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AQ0mC4Y.gif"}',
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
  'cable kneeling rear delt row (with rope) (male)',
  'G61cXLk',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Attach a rope handle to a low cable pulley and kneel down facing the machine.","Step:2 Grasp the rope with a neutral grip (palms facing each other) and extend your arms fully in front of you.","Step:3 Keeping your back straight and core engaged, pull the rope towards your body by retracting your shoulder blades.","Step:4 Squeeze your shoulder blades together at the end of the movement and hold for a brief pause.","Step:5 Slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G61cXLk.gif"}',
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
  'dumbbell seated lateral raise',
  'hxyTtWj',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","upper back"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and a dumbbell in each hand, resting on your thighs.","Step:2 Keep your back straight and core engaged.","Step:3 Raise the dumbbells to your sides with a slight bend in your elbows, until your arms are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hxyTtWj.gif"}',
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
  'barbell standing close grip military press',
  'wdRZISl',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell with an overhand grip, hands slightly closer than shoulder-width apart.","Step:2 Lift the barbell to shoulder height, keeping your elbows close to your body.","Step:3 Press the barbell overhead, extending your arms fully.","Step:4 Lower the barbell back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wdRZISl.gif"}',
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
  'band standing rear delt row',
  'tc5dYrf',
  'intermediate',
  'band',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band under your feet.","Step:2 Hold the band handles with your palms facing each other and your arms extended in front of you.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Pull the band towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tc5dYrf.gif"}',
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
  'dumbbell seated bent arm lateral raise',
  'JzQbv7J',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in each hand with your palms facing your body and your arms bent at a 90-degree angle.","Step:3 Keeping your elbows bent, raise your arms out to the sides until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JzQbv7J.gif"}',
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
  'dumbbell lateral to front raise',
  'xMjBKwn',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your body.","Step:2 Keep your back straight and engage your core.","Step:3 Raise your arms out to the sides until they are parallel to the ground, keeping a slight bend in your elbows.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Next, raise your arms in front of you until they are parallel to the ground, again keeping a slight bend in your elbows.","Step:6 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xMjBKwn.gif"}',
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
  'dumbbell incline one arm lateral raise',
  'aTNKZiC',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","triceps"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in one hand, resting it on your thigh.","Step:2 Lean forward and position your upper arm against the inside of your thigh.","Step:3 Raise the dumbbell to the side, keeping your arm slightly bent and your palm facing down.","Step:4 Continue lifting until your arm is parallel to the floor.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aTNKZiC.gif"}',
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
  'dumbbell seated front raise',
  'Ys97II0',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and a dumbbell in each hand, resting on your thighs.","Step:2 Keep your back straight and core engaged.","Step:3 Raise the dumbbells in front of you, with your palms facing down, until they are at shoulder level.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ys97II0.gif"}',
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
  'kettlebell one arm jerk',
  'S37C94C',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand at shoulder height.","Step:2 Bend your knees slightly and engage your core.","Step:3 Press the kettlebell overhead in a straight line, fully extending your arm.","Step:4 As you press the kettlebell overhead, simultaneously dip your knees and quickly straighten them to generate momentum.","Step:5 As the kettlebell reaches its highest point, quickly drop underneath it by bending your knees and hips.","Step:6 Catch the kettlebell with a slight bend in your knees and hips, and your arm fully extended overhead.","Step:7 Stand up straight, fully extending your knees and hips, and stabilize the kettlebell overhead.","Step:8 Lower the kettlebell back to the starting position by bending your knees and hips, and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S37C94C.gif"}',
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
  'lever shoulder press v. 2',
  'vqsbmL0',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Adjust the seat height and backrest of the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the floor.","Step:3 Grasp the handles of the machine with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Push the handles upward and forward until your arms are fully extended, but not locked.","Step:5 Pause for a moment at the top, then slowly lower the handles back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vqsbmL0.gif"}',
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
  'dumbbell reverse fly',
  'EAs3xL9',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Extend your arms straight down in front of you, palms facing each other.","Step:4 Keeping a slight bend in your elbows, raise your arms out to the sides until they are parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EAs3xL9.gif"}',
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
  'dumbbell seated alternate press',
  'QT5Q0nK',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing forward.","Step:2 Raise the dumbbells to shoulder height, with your elbows bent and palms facing forward.","Step:3 Press one dumbbell up overhead, fully extending your arm.","Step:4 Lower the dumbbell back down to shoulder height.","Step:5 Repeat with the other arm.","Step:6 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QT5Q0nK.gif"}',
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
  'cable front shoulder raise',
  'mTT3KLn',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the cable handle with an overhand grip.","Step:2 Keep your back straight and your core engaged.","Step:3 Raise the cable handle in front of you, keeping your arms straight and your palms facing down.","Step:4 Continue lifting until your arms are parallel to the floor.","Step:5 Pause for a moment at the top, then slowly lower the cable handle back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mTT3KLn.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;