INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'weighted kneeling step with swing',
  '7uFJuXp',
  'intermediate',
  'weighted',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Start in a kneeling position with your knees hip-width apart and your back straight.","Step:2 Hold a weight in each hand, with your arms extended straight down in front of you.","Step:3 Engage your core and swing the weights up and overhead, keeping your arms straight.","Step:4 Lower the weights back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7uFJuXp.gif"}',
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
  'dumbbell seated shoulder press (parallel grip)',
  'f1jf47L',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing inward.","Step:2 Raise the dumbbells to shoulder height, elbows bent and palms facing forward.","Step:3 Press the dumbbells upward until your arms are fully extended overhead.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/f1jf47L.gif"}',
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
  'dumbbell scott press',
  '5vfAI0I',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing forward.","Step:2 Raise the dumbbells to shoulder height, with your elbows bent and palms facing forward.","Step:3 Press the dumbbells upward until your arms are fully extended.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5vfAI0I.gif"}',
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
  'kettlebell double snatch',
  'M74kdvm',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"trapezius","forearms","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at arm''s length in front of your thighs.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back flat and chest up.","Step:3 In one explosive motion, extend your hips, knees, and ankles, and simultaneously pull the kettlebells up towards your shoulders.","Step:4 As the kettlebells reach shoulder level, rotate your wrists and punch the kettlebells overhead, fully extending your arms.","Step:5 Lower the kettlebells back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/M74kdvm.gif"}',
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
  'dumbbell bench seated press',
  '3d7wHyd',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, resting on your thighs.","Step:2 Lean back and position the dumbbells to the sides of your chest, palms facing forward.","Step:3 Press the dumbbells upward until your arms are fully extended.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3d7wHyd.gif"}',
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
  'dumbbell seated lateral raise v. 2',
  'hrrS0Ed',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","triceps"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and a dumbbell in each hand, resting on your thighs.","Step:2 Keep your back straight and core engaged.","Step:3 Raise the dumbbells to your sides with a slight bend in your elbows, until your arms are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hrrS0Ed.gif"}',
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
  'lever one arm shoulder press',
  '2KGnL6M',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the lever handle with one hand and position your elbow at a 90-degree angle.","Step:3 Press the lever upward until your arm is fully extended overhead.","Step:4 Pause for a moment at the top, then slowly lower the lever back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2KGnL6M.gif"}',
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
  'lever shoulder press',
  '67n3r98',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the backrest.","Step:2 Grasp the handles with an overhand grip and position your hands at shoulder level.","Step:3 Push the handles upward until your arms are fully extended, but do not lock your elbows.","Step:4 Pause for a moment at the top, then slowly lower the handles back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/67n3r98.gif"}',
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
  'dumbbell cuban press v. 2',
  'BqgCRif',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder height with your palms facing down.","Step:2 Keeping your core engaged and your back straight, press the dumbbells straight up overhead until your arms are fully extended.","Step:3 Rotate your wrists so that your palms are facing forward.","Step:4 Lower the dumbbells back down to shoulder height, rotating your wrists back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BqgCRif.gif"}',
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
  'dumbbell side lying one hand raise',
  'fTlkJop',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Lie on your side with your legs extended and your head supported by your arm.","Step:2 Hold a dumbbell in your top hand with your palm facing down.","Step:3 Keeping your arm straight, raise the dumbbell up to shoulder height.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fTlkJop.gif"}',
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
  'barbell seated behind head military press',
  'ngPpyRS',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and bring it down to shoulder level, behind your head.","Step:4 Press the barbell upward until your arms are fully extended.","Step:5 Lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ngPpyRS.gif"}',
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
  'lever military press',
  'CggQhII',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","upper chest"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the backrest.","Step:2 Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.","Step:3 Push the handles upward until your arms are fully extended, but do not lock your elbows.","Step:4 Pause for a moment at the top, then slowly lower the handles back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CggQhII.gif"}',
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
  'kettlebell two arm military press',
  'blBXysN',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder level with your palms facing forward.","Step:2 Engage your core and press the kettlebells overhead, fully extending your arms.","Step:3 Pause for a moment at the top, then slowly lower the kettlebells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/blBXysN.gif"}',
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
  'cable seated shoulder internal rotation',
  'YPoVrBi',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"rotator cuff","triceps"}',
  '{"Step:1 Sit on a bench or chair facing the cable machine with your feet flat on the ground.","Step:2 Hold the cable handle with your arm extended straight out in front of you, parallel to the ground.","Step:3 Keep your elbow slightly bent and your shoulder blades pulled back and down.","Step:4 Slowly rotate your arm inward, bringing the cable handle towards the center of your body.","Step:5 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YPoVrBi.gif"}',
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
  'dumbbell one arm lateral raise with support',
  'Yg7MJAT',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rotator cuff"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand, with your palm facing your body.","Step:2 Place your other hand on a stable surface, such as a bench or wall, for support.","Step:3 Keep your back straight and engage your core.","Step:4 Raise the dumbbell out to the side, keeping your arm straight and your palm facing down.","Step:5 Continue lifting until your arm is parallel to the ground.","Step:6 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Yg7MJAT.gif"}',
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
  'dumbbell standing one arm palm in press',
  'ocYc6Db',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand at shoulder height with your palm facing inwards.","Step:2 Engage your core and keep your back straight.","Step:3 Press the dumbbell upwards until your arm is fully extended.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ocYc6Db.gif"}',
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
  'barbell one arm snatch',
  'xHKN2s8',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","forearms","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing slightly outwards.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend your knees and lower your hips into a squat position, keeping your back straight and chest up.","Step:4 Explosively extend your hips, knees, and ankles, driving the barbell upwards.","Step:5 As the barbell reaches chest level, pull it upwards with your arm, keeping it close to your body.","Step:6 Rotate your elbow under the barbell and extend your arm fully overhead, locking out your elbow.","Step:7 Lower the barbell back down to the starting position in a controlled manner.","Step:8 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xHKN2s8.gif"}',
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
  'dumbbell one arm reverse fly (with support)',
  'e25F58f',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing inwards.","Step:3 Lean forward and place your free hand on the bench for support.","Step:4 Keep your arm slightly bent and raise it out to the side until it is parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower your arm back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/e25F58f.gif"}',
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
  'weighted front raise',
  'e4aFmFY',
  'intermediate',
  'weighted',
  '{"delts"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your thighs.","Step:2 Keeping your arms straight, exhale and lift the dumbbells in front of you until they are at shoulder level.","Step:3 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/e4aFmFY.gif"}',
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
  'kettlebell one arm push press',
  'osdXT3K',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand at shoulder level.","Step:2 Bend your knees slightly and engage your core.","Step:3 Press the kettlebell overhead by extending your arm and fully extending your legs.","Step:4 Lower the kettlebell back to the starting position by bending your knees and bringing the kettlebell back to your shoulder.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/osdXT3K.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;