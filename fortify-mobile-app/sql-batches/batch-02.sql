INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable palm rotational row',
  'OmQ8w0p',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach a handle to a cable machine at waist height.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the handle with an overhand grip, palms facing down.","Step:4 Step back to create tension on the cable, keeping your back straight and knees slightly bent.","Step:5 Pull the handle towards your body, rotating your palms to face upwards as you do so.","Step:6 Squeeze your shoulder blades together at the end of the movement.","Step:7 Slowly release the handle back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OmQ8w0p.gif"}',
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
  'dumbbell incline row',
  '7vG5o25',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Grab a dumbbell in each hand and sit on the bench with your chest against the incline.","Step:3 Extend your arms fully, allowing the dumbbells to hang straight down from your shoulders.","Step:4 Pull the dumbbells up towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7vG5o25.gif"}',
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
  'cable low seated row',
  'hvV79Si',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the handles with an overhand grip, palms facing down.","Step:3 Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows.","Step:4 Pull the handles towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hvV79Si.gif"}',
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
  'kettlebell two arm row',
  'wf24o8S',
  'intermediate',
  'kettlebell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a kettlebell in each hand with your palms facing your body.","Step:2 Bend forward at the hips, keeping your back straight and your core engaged.","Step:3 Pull the kettlebells up towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower the kettlebells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wf24o8S.gif"}',
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
  'bodyweight squatting row (with towel)',
  'BReCuOn',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a towel in front of you with your palms facing down.","Step:2 Bend your knees and lower your body into a squat position, keeping your back straight and your chest up.","Step:3 As you lower into the squat, simultaneously pull the towel towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the bottom of the squat, then slowly return to the starting position while extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BReCuOn.gif"}',
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
  'lever unilateral row',
  'oROuvrX',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself facing the machine.","Step:2 Grasp the handles with an overhand grip and keep your back straight.","Step:3 Pull the handles towards your body, squeezing your shoulder blades together.","Step:4 Pause for a moment at the peak of the movement, then slowly release and extend your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oROuvrX.gif"}',
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
  'inverted row',
  'bZGHsAZ',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a bar at waist height or use a suspension trainer.","Step:2 Stand facing the bar or suspension trainer, with your feet shoulder-width apart.","Step:3 Grab the bar or handles with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lean back, keeping your body straight and your heels on the ground.","Step:5 Pull your chest towards the bar or handles, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower yourself back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bZGHsAZ.gif"}',
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
  'bodyweight standing row (with towel)',
  'uTv34oq',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a towel in front of you with both hands.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Pull the towel towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly release the tension and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uTv34oq.gif"}',
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
  'dumbbell side plank with rear fly',
  'X6ytgYZ',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"shoulders","core"}',
  '{"Step:1 Start by lying on your side with your legs extended and stacked on top of each other.","Step:2 Place your forearm on the ground directly below your shoulder, keeping your elbow bent at a 90-degree angle.","Step:3 Hold a dumbbell in your top hand, with your arm extended straight down towards the ground.","Step:4 Engage your core and lift your hips off the ground, creating a straight line from your head to your heels.","Step:5 While maintaining the side plank position, lift the dumbbell up towards the ceiling, squeezing your shoulder blades together.","Step:6 Lower the dumbbell back down to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/X6ytgYZ.gif"}',
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
  'chin-ups (narrow parallel grip)',
  'G70mEAJ',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Hang from a pull-up bar with a narrow parallel grip, palms facing towards you.","Step:2 Engage your back muscles and pull your body up towards the bar, keeping your elbows close to your body.","Step:3 Continue pulling until your chin is above the bar.","Step:4 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G70mEAJ.gif"}',
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
  'lever t-bar reverse grip row',
  'FVM1AUZ',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the floor.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Keep your back straight and engage your core.","Step:4 Pull the handles towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top of the movement, then slowly release and extend your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FVM1AUZ.gif"}',
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
  'standing archer',
  'JF8AkMX',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"shoulders","biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Extend your arms straight out in front of you at shoulder height, parallel to the ground.","Step:3 Rotate your torso to the right, keeping your arms extended and your back straight.","Step:4 As you rotate, extend your right arm forward and your left arm back, mimicking the motion of drawing a bowstring.","Step:5 Hold the position for a moment, then return to the starting position.","Step:6 Repeat the motion, this time rotating your torso to the left and extending your left arm forward and your right arm back.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JF8AkMX.gif"}',
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
  'dumbbell bent over row',
  'BJ0Hz5L',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body.","Step:2 Bend forward at the hips, keeping your back straight and your core engaged.","Step:3 Let your arms hang straight down towards the floor, with your elbows slightly bent.","Step:4 Pull the dumbbells up towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BJ0Hz5L.gif"}',
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
  'barbell reverse grip bent over row',
  'SzX3uzM',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold a barbell with an overhand grip, palms facing down, and hands slightly wider than shoulder-width apart.","Step:3 Bend forward at the hips, keeping your back straight and chest up, until your torso is almost parallel to the floor.","Step:4 Pull the barbell towards your lower chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SzX3uzM.gif"}',
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
  'dumbbell reverse grip incline bench two arm row',
  '9pQSkH8',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your chest against the backrest and your feet flat on the ground.","Step:3 Hold a dumbbell in each hand with an underhand grip.","Step:4 Lean forward and let your arms hang straight down, fully extended.","Step:5 Pull the dumbbells up towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9pQSkH8.gif"}',
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
  'cambered bar lying row',
  'R5swFnc',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a barbell on the floor and lie face down on a bench with your chest just off the edge.","Step:2 Reach down and grab the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 With your legs straight and feet on the ground, lift the barbell off the floor by extending your arms.","Step:4 Pull the barbell towards your chest, squeezing your shoulder blades together.","Step:5 Lower the barbell back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/R5swFnc.gif"}',
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
  'bodyweight standing row',
  'wd4ds3s',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Grasp a bar or handles with an overhand grip, palms facing down.","Step:3 Keep your back straight and core engaged.","Step:4 Pull the bar or handles towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top of the movement.","Step:6 Slowly release and extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wd4ds3s.gif"}',
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
  'barbell bent over row',
  'eZyBC3j',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Bend forward at the hips while keeping your back straight and chest up.","Step:3 Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:4 Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.","Step:5 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eZyBC3j.gif"}',
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
  'cable standing twist row (v-bar)',
  'JOZhu2h',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Attach a v-bar attachment to a cable machine at chest height.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the v-bar with an overhand grip, palms facing down.","Step:4 Take a step back to create tension in the cable.","Step:5 Keep your back straight and core engaged throughout the exercise.","Step:6 Pull the v-bar towards your torso by retracting your shoulder blades and bending your elbows.","Step:7 As you pull, twist your torso to one side, squeezing your shoulder blades together.","Step:8 Pause for a moment at the top of the movement, feeling the contraction in your upper back.","Step:9 Slowly release the tension and return to the starting position, untwisting your torso.","Step:10 Repeat the movement for the desired number of repetitions, alternating the twisting direction with each rep."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JOZhu2h.gif"}',
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
  'bodyweight squatting row',
  '3xK09Sk',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding onto a sturdy object or suspension trainer with your arms extended.","Step:2 Lower your body into a squat position, keeping your back straight and your knees behind your toes.","Step:3 From the squat position, pull your body up towards the object or suspension trainer, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3xK09Sk.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;