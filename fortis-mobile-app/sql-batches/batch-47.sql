INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'kettlebell one arm snatch',
  'aXcUyKb',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"trapezius","forearms","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand between your legs.","Step:2 Bend your knees slightly and hinge at the hips, lowering the kettlebell towards the ground.","Step:3 Explosively extend your hips and knees, using the momentum to swing the kettlebell up towards your shoulder.","Step:4 As the kettlebell reaches shoulder height, rotate your hand and punch it straight up overhead, fully extending your arm.","Step:5 Lower the kettlebell back down between your legs and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aXcUyKb.gif"}',
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
  'kettlebell two arm clean',
  '7Ba7bQ2',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"traps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in front of your thighs with both hands, palms facing towards you.","Step:2 Bend your knees slightly and hinge at the hips, lowering the kettlebell towards the ground.","Step:3 Explosively extend your hips and knees, using the momentum to pull the kettlebell up towards your shoulders.","Step:4 As the kettlebell reaches shoulder height, rotate your wrists and catch the kettlebell in the rack position, with your elbows tucked in and the kettlebell resting on the back of your forearm.","Step:5 Lower the kettlebell back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7Ba7bQ2.gif"}',
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
  'dumbbell lying rear lateral raise',
  '53Ttlck',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight down towards the floor, keeping a slight bend in your elbows.","Step:3 Engaging your shoulder muscles, lift your arms out to the sides until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/53Ttlck.gif"}',
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
  'cable alternate shoulder press',
  'KHPZL0b',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the handles of the cable machine with an overhand grip.","Step:2 Position your hands at shoulder height, with your palms facing forward.","Step:3 Keep your core engaged and your back straight.","Step:4 Press one handle up and forward until your arm is fully extended.","Step:5 Pause for a moment at the top, then slowly lower the handle back to the starting position.","Step:6 Repeat with the other arm.","Step:7 Alternate between arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KHPZL0b.gif"}',
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
  'dumbbell incline rear lateral raise',
  'vYk8lqw',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your chest against the backrest and hold a dumbbell in each hand.","Step:3 Extend your arms straight down with your palms facing each other.","Step:4 Keeping a slight bend in your elbows, raise your arms out to the sides until they are parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vYk8lqw.gif"}',
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
  'dumbbell rear lateral raise',
  'v1qBec9',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and core engaged.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows, until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v1qBec9.gif"}',
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
  'kettlebell seated press',
  'BkxB8LW',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a kettlebell in each hand at shoulder height, palms facing forward.","Step:3 Press the kettlebells overhead, fully extending your arms.","Step:4 Lower the kettlebells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BkxB8LW.gif"}',
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
  'dumbbell lateral raise',
  'DsgkuIt',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Step:2 Keep your back straight and engage your core.","Step:3 Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DsgkuIt.gif"}',
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
  'band y-raise',
  'aHDy5O5',
  'intermediate',
  'band',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band in front of your thighs with your palms facing inwards.","Step:2 Keep your arms straight and lift them up and out to the sides, forming a ''Y'' shape with your body.","Step:3 Squeeze your shoulder blades together at the top of the movement.","Step:4 Slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aHDy5O5.gif"}',
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
  'landmine lateral raise',
  'eXMFHww',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold the barbell with an overhand grip, resting it on the front of your shoulders.","Step:3 Keeping your core engaged and back straight, lift the barbell up and away from your body, raising it to shoulder height.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eXMFHww.gif"}',
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
  'cable one arm lateral raise',
  'wEulIzp',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"traps","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with one hand, palm facing down, and stand far enough away from the machine so that there is tension on the cable.","Step:3 Keep your arm straight and slowly raise it out to the side until it is parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arm back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wEulIzp.gif"}',
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
  'kettlebell pirate supper legs',
  'kuXhl0o',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Raise the kettlebell up to shoulder height, keeping your elbow close to your body.","Step:4 Extend your arm fully overhead, straightening your elbow.","Step:5 Lower the kettlebell back down to shoulder height, then return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kuXhl0o.gif"}',
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
  'dumbbell seated alternate shoulder',
  'q7qkONO',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in each hand, palms facing inwards, and raise them to shoulder height.","Step:3 Press one dumbbell up overhead while keeping the other dumbbell at shoulder height.","Step:4 Lower the raised dumbbell back to shoulder height while simultaneously pressing the other dumbbell up overhead.","Step:5 Continue alternating between arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/q7qkONO.gif"}',
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
  'barbell seated bradford rocky press',
  '0dCyly0',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell to shoulder height, keeping your elbows slightly bent and pointing forward.","Step:4 Press the barbell overhead, fully extending your arms.","Step:5 Lower the barbell back to shoulder height and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0dCyly0.gif"}',
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
  'kettlebell one arm clean and jerk',
  'vzAxBtt',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand with an overhand grip.","Step:2 Bend your knees slightly and hinge at the hips, lowering the kettlebell between your legs.","Step:3 Explosively extend your hips, knees, and ankles, using the momentum to swing the kettlebell up to shoulder height.","Step:4 As the kettlebell reaches shoulder height, rotate your wrist and punch your hand straight up, locking out your arm overhead.","Step:5 Lower the kettlebell back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vzAxBtt.gif"}',
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
  'band reverse fly',
  'sTfvVsG',
  'intermediate',
  'band',
  '{"delts"}',
  '{"upper back","trapezius"}',
  '{"Step:1 Attach the band to a stationary object at chest height.","Step:2 Stand with your feet shoulder-width apart and hold the band with both hands in front of you.","Step:3 Keep your arms straight and lift them out to the sides until they are parallel to the ground.","Step:4 Squeeze your shoulder blades together at the top of the movement.","Step:5 Slowly lower your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sTfvVsG.gif"}',
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
  'cable rear delt row (stirrups)',
  'yUdIGNs',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Attach a stirrup handle to a low cable pulley and stand facing the machine.","Step:2 Grasp the handle with your left hand and take a step back with your right foot, positioning your body at a slight angle.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight and your core engaged.","Step:4 With your left arm extended and your palm facing down, pull the handle towards your chest by retracting your shoulder blade.","Step:5 Pause for a moment at the top of the movement, squeezing your shoulder blade.","Step:6 Slowly release the handle back to the starting position and repeat for the desired number of repetitions.","Step:7 Switch sides and repeat the exercise with your right arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yUdIGNs.gif"}',
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
  'dumbbell arnold press',
  'Xy4jlWA',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper chest"}',
  '{"Step:1 Sit on a bench with back support and hold a dumbbell in each hand at shoulder level, palms facing your body and elbows bent.","Step:2 Press the dumbbells upward until your arms are fully extended and your palms are facing forward.","Step:3 Rotate your wrists as you lift, so that your palms are facing forward at the top of the movement.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Xy4jlWA.gif"}',
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
  'weighted round arm',
  'VLYXo8S',
  'intermediate',
  'weighted',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows.","Step:4 Continue lifting your arms until they are parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VLYXo8S.gif"}',
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
  'dumbbell push press',
  'FS63wTN',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level.","Step:2 Bend your knees slightly and dip your body down, then explosively extend your legs and press the dumbbells overhead.","Step:3 Lock out your arms at the top of the movement, then lower the dumbbells back to shoulder level.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FS63wTN.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;