INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'wall style dumbbell one arm french press on exercise ball',
  'W7yh3Yo',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing up and your elbow bent at a 90-degree angle. Focus on wall movement.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow stationary.","Step:4 Slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/W7yh3Yo.gif"}',
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
  'macro style close-grip push-up',
  'VsopqcV',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands placed close together, directly under your shoulders.","Step:2 Engage your core and lower your body towards the ground, keeping your elbows close to your sides.","Step:3 Push through your palms to extend your arms and return to the starting position. Maintain macro form throughout.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VsopqcV.gif"}',
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
  'cable rope incline tricep extension - reverse variation',
  'vNPJbDA',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a high pulley and adjust the incline bench to a comfortable angle.","Step:2 Stand facing away from the pulley with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip and extend your arms straight overhead.","Step:4 (reverse variation) Keep your elbows close to your head and your upper arms stationary throughout the exercise.","Step:5 Lower the rope behind your head by bending your elbows until your forearms touch your biceps.","Step:6 Pause for a moment, then extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vNPJbDA.gif"}',
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
  'band shrug',
  'trmte8s',
  'intermediate',
  'band',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band under your feet, holding the ends with your hands.","Step:2 Keep your arms straight and relaxed, and let the band hang in front of your thighs.","Step:3 Engage your traps by shrugging your shoulders upward, lifting the band as high as possible.","Step:4 Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/trmte8s.gif"}',
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
  'cable shrug',
  'Eg98Ft9',
  'intermediate',
  'cable',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable handles with an overhand grip and let your arms hang down in front of you.","Step:3 Keeping your arms straight, shrug your shoulders up towards your ears.","Step:4 Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Eg98Ft9.gif"}',
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
  'lever gripless shrug v. 2',
  'cbuFJrn',
  'intermediate',
  'leverage machine',
  '{"traps"}',
  '{"shoulders","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the handles or bars with an overhand grip, keeping your arms straight.","Step:3 Keeping your back straight, lift your shoulders up towards your ears as high as possible.","Step:4 Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cbuFJrn.gif"}',
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
  'scapula dips',
  '7xeukSt',
  'intermediate',
  'body weight',
  '{"traps"}',
  '{"rhomboids","deltoids"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and your arms extended in front of you.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Lower your body by bending your elbows and retracting your shoulder blades, as if you are trying to squeeze a pencil between them.","Step:4 Pause for a moment at the bottom, then push through your hands to extend your elbows and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7xeukSt.gif"}',
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
  'dumbbell decline shrug',
  'cwsAI4G',
  'intermediate',
  'dumbbell',
  '{"traps"}',
  '{"shoulders","rhomboids"}',
  '{"Step:1 Set up a decline bench at a 45-degree angle.","Step:2 Lie face down on the bench with your chest and stomach resting against it.","Step:3 Hold a dumbbell in each hand with your arms fully extended towards the floor.","Step:4 Keeping your arms straight, raise your shoulders towards your ears as high as possible.","Step:5 Hold the contraction for a moment, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cwsAI4G.gif"}',
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
  'kettlebell sumo high pull',
  '8ARQ9Hw',
  'intermediate',
  'kettlebell',
  '{"traps"}',
  '{"shoulders","glutes","hamstrings"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing outwards.","Step:2 Hold a kettlebell with both hands in front of your body, arms extended downwards.","Step:3 Bend your knees and lower your hips into a squat position, keeping your back straight.","Step:4 Drive through your heels and explosively extend your hips and knees, pulling the kettlebell up towards your chin.","Step:5 As you pull the kettlebell up, keep your elbows high and wide, and squeeze your shoulder blades together.","Step:6 Lower the kettlebell back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8ARQ9Hw.gif"}',
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
  'barbell shrug',
  'dG7tG5y',
  'intermediate',
  'barbell',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell in front of you with an overhand grip.","Step:2 Keep your arms straight and your back straight throughout the exercise.","Step:3 Lift your shoulders up towards your ears as high as possible, squeezing your traps at the top.","Step:4 Hold for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dG7tG5y.gif"}',
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
  'lever shrug',
  'ZZKbeMw',
  'intermediate',
  'leverage machine',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine with your back against the pad.","Step:2 Grasp the handles with an overhand grip and keep your arms straight.","Step:3 Keeping your back straight, lift your shoulders up towards your ears as high as possible.","Step:4 Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZZKbeMw.gif"}',
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
  'dumbbell shrug',
  'NJzBsGJ',
  'intermediate',
  'dumbbell',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand with your palms facing your body.","Step:2 Keep your arms straight and let the dumbbells hang by your sides.","Step:3 Raise your shoulders as high as possible, as if you are trying to touch your ears with your shoulders.","Step:4 Hold the contraction for a second, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NJzBsGJ.gif"}',
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
  'lever gripless shrug',
  'f91FwXG',
  'intermediate',
  'leverage machine',
  '{"traps"}',
  '{"shoulders","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine.","Step:2 Grasp the handles with your palms facing inwards and your arms fully extended.","Step:3 Keeping your back straight, exhale and elevate your shoulders as high as possible.","Step:4 Hold the contraction for a brief moment, then inhale and slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/f91FwXG.gif"}',
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
  'smith shrug',
  'OUQ0ZyW',
  'intermediate',
  'smith machine',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Keep your arms straight and your shoulders relaxed.","Step:4 Lift your shoulders up towards your ears, squeezing your traps at the top.","Step:5 Hold for a moment, then slowly lower your shoulders back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OUQ0ZyW.gif"}',
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
  'dumbbell incline shrug',
  'JymLInS',
  'intermediate',
  'dumbbell',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand.","Step:2 Place your feet flat on the ground and let your arms hang straight down with your palms facing your body.","Step:3 Keeping your arms straight, shrug your shoulders up towards your ears as high as possible.","Step:4 Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JymLInS.gif"}',
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
  'dumbbell decline shrug v. 2',
  'bRlbdjK',
  'intermediate',
  'dumbbell',
  '{"traps"}',
  '{"shoulders","rhomboids"}',
  '{"Step:1 Set up a decline bench at a 45-degree angle.","Step:2 Lie face down on the bench with your chest and stomach resting on it.","Step:3 Hold a dumbbell in each hand with your palms facing each other and your arms fully extended.","Step:4 Keeping your arms straight, raise your shoulders as high as possible while squeezing your shoulder blades together.","Step:5 Hold the contraction for a brief pause, then lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bRlbdjK.gif"}',
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
  'scapular pull-up',
  'uTBt1HV',
  'intermediate',
  'body weight',
  '{"traps"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Start by hanging from a pull-up bar with your palms facing away from you and your arms fully extended.","Step:2 Retract your shoulder blades by pulling them down and back.","Step:3 Engage your back muscles and pull your body up towards the bar, focusing on squeezing your shoulder blades together.","Step:4 Pause for a moment at the top of the movement, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uTBt1HV.gif"}',
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
  'smith back shrug',
  'MzNnwx9',
  'intermediate',
  'smith machine',
  '{"traps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Keep your arms straight and allow the barbell to hang in front of your thighs.","Step:4 Lift your shoulders straight up towards your ears, squeezing your traps at the top.","Step:5 Hold for a moment, then lower your shoulders back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MzNnwx9.gif"}',
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
  'dumbbell decline shrug - rigid variation',
  'IH2kr7n',
  'intermediate',
  'dumbbell',
  '{"traps"}',
  '{"shoulders","rhomboids"}',
  '{"Step:1 Set up a decline bench at a 45-degree angle.","Step:2 Lie face down on the bench with your chest and stomach resting against it.","Step:3 (rigid variation) Hold a dumbbell in each hand with your arms fully extended towards the floor.","Step:4 Keeping your arms straight, raise your shoulders towards your ears as high as possible.","Step:5 Hold the contraction for a moment, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IH2kr7n.gif"}',
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
  'sphinx',
  'DIVyqrU',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie face down on the ground with your forearms flat on the floor, elbows directly under your shoulders.","Step:2 Engage your core and lift your chest off the ground, keeping your forearms and toes on the floor.","Step:3 Hold this position for a few seconds, making sure to keep your neck in a neutral position.","Step:4 Slowly lower your chest back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DIVyqrU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;