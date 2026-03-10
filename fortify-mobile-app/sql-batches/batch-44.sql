INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith standing back wrist curl',
  'hfmQ0Tz',
  'intermediate',
  'smith machine',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Stand facing the smith machine with your feet shoulder-width apart.","Step:2 Grasp the barbell with an overhand grip, hands shoulder-width apart.","Step:3 Keep your back straight and your elbows close to your body.","Step:4 Slowly curl your wrists upwards, bringing the barbell towards your body.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hfmQ0Tz.gif"}',
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
  'dumbbell over bench revers wrist curl',
  '3tAXPQ6',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing down.","Step:2 Rest your forearms on the bench, allowing your wrists to hang off the edge.","Step:3 Slowly curl your wrists upward, bringing the dumbbells towards your body.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3tAXPQ6.gif"}',
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
  'dumbbell one arm reverse wrist curl',
  'BwSNDGt',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"wrist extensors"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground.","Step:2 Hold a dumbbell in one hand with an overhand grip, palm facing down.","Step:3 Rest your forearm on your thigh, with your wrist hanging off the edge.","Step:4 Slowly lower the dumbbell towards the ground by flexing your wrist.","Step:5 Pause for a moment at the bottom, then slowly curl your wrist back up towards your body.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BwSNDGt.gif"}',
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
  'band wrist curl',
  'vUTfFHw',
  'intermediate',
  'band',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground.","Step:2 Hold the band with both hands, palms facing up, and rest your forearms on your thighs.","Step:3 Slowly curl your wrists upward, squeezing your forearms.","Step:4 Pause for a moment at the top, then slowly lower your wrists back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vUTfFHw.gif"}',
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
  'dumbbell one arm wrist curl',
  'q8aHNoF',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground.","Step:2 Hold a dumbbell in one hand with an underhand grip, resting your forearm on your thigh.","Step:3 Allow your wrist to extend, letting the dumbbell roll down towards your fingers.","Step:4 Slowly curl your wrist back up, bringing the dumbbell towards your forearm.","Step:5 Repeat for the desired number of repetitions, then switch to the other hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/q8aHNoF.gif"}',
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
  'cable standing back wrist curl',
  'VhX2JdE',
  'intermediate',
  'cable',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with an overhand grip, palms facing down.","Step:3 Keep your arms straight and your elbows close to your sides.","Step:4 Slowly curl your wrists upward, bringing the cable handle towards your body.","Step:5 Pause for a moment at the top, then slowly lower the cable handle back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VhX2JdE.gif"}',
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
  'dumbbell over bench wrist curl',
  'D1xYJAU',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your forearms resting on the bench and your palms facing up, holding a dumbbell in each hand.","Step:2 Allow your wrists to hang over the edge of the bench.","Step:3 Slowly curl your wrists upward, squeezing your forearms at the top of the movement.","Step:4 Pause for a moment, then slowly lower your wrists back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/D1xYJAU.gif"}',
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
  'weighted standing hand squeeze',
  'bjqbauy',
  'intermediate',
  'weighted',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a weight in each hand.","Step:2 Extend your arms straight in front of you, palms facing each other.","Step:3 Squeeze your hands together as hard as you can, engaging your forearms.","Step:4 Hold the squeeze for a few seconds, then release.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bjqbauy.gif"}',
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
  'kettlebell alternating hang clean',
  'I4tibZG',
  'intermediate',
  'kettlebell',
  '{"forearms"}',
  '{"shoulders","traps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Allow the kettlebells to hang in front of your body with your arms fully extended.","Step:4 In one fluid motion, explosively extend your hips, shrug your shoulders, and pull the kettlebells up towards your shoulders.","Step:5 As the kettlebells reach shoulder height, rotate your wrists and catch the kettlebells in the rack position, with your palms facing inward and the kettlebells resting on the outside of your forearms.","Step:6 Lower the kettlebells back down to the starting position and repeat the movement with the opposite arm.","Step:7 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I4tibZG.gif"}',
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
  'cable reverse wrist curl',
  'eYmsEPR',
  'intermediate',
  'cable',
  '{"forearms"}',
  '{"forearms","wrists"}',
  '{"Step:1 Attach a cable to a low pulley and sit on a bench facing the cable machine.","Step:2 Grasp the cable handle with an overhand grip, palms facing down.","Step:3 Rest your forearms on your thighs, with your wrists hanging off the edge.","Step:4 Keeping your forearms stationary, exhale and curl your wrists upward as far as possible.","Step:5 Pause for a moment at the top, then inhale and slowly lower your wrists back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eYmsEPR.gif"}',
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
  'dumbbell over bench one arm wrist curl',
  'KI1DjNN',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand, palm facing down.","Step:2 Rest your forearm on the bench with your wrist hanging off the edge.","Step:3 Slowly curl your wrist upwards, bringing the dumbbell towards your forearm.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KI1DjNN.gif"}',
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
  'dumbbell lying pronation',
  'mym4hJo',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your chest facing down and your arms extended straight down, holding a dumbbell in each hand.","Step:2 Rotate your palms so they are facing up.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells as you rotate your palms to face down.","Step:4 Inhale and slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mym4hJo.gif"}',
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
  'dumbbell reverse wrist curl',
  'BLCvwr2',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground.","Step:2 Hold a dumbbell in each hand with an overhand grip, palms facing down.","Step:3 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:4 Slowly curl your wrists upward, bringing the dumbbells towards your body.","Step:5 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BLCvwr2.gif"}',
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
  'dumbbell over bench one arm wrist curl - strength variation',
  '7AnZtSv',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand, palm facing down.","Step:2 Rest your forearm on the bench with your wrist hanging off the edge.","Step:3 Slowly curl your wrist upwards, bringing the dumbbell towards your forearm.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position. Maintain strength form throughout.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7AnZtSv.gif"}',
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
  'controlled wrist rollerer',
  'MqNdIbe',
  'intermediate',
  'weighted',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Attach a weight to one end of a rope or bar.","Step:2 Hold the other end of the rope or bar with both hands, palms facing down.","Step:3 Stand with your feet shoulder-width apart and your arms fully extended in front of you.","Step:4 Slowly roll the weight up towards your hands by flexing your wrists.","Step:5 Pause for a moment at the top, then slowly lower the weight back down to the starting position. Perform with controlled intensity.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MqNdIbe.gif"}',
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
  'barbell reverse wrist curl - prone variation',
  'YA2HKGz',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a barbell with an overhand grip, palms facing down.","Step:2 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:3 Slowly curl your wrists upward, bringing the barbell towards your body. Emphasize prone control.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YA2HKGz.gif"}',
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
  'dumbbell one arm shoulder press',
  '84RyJf8',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand at shoulder level, palm facing forward.","Step:2 Press the dumbbell upward until your arm is fully extended overhead.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/84RyJf8.gif"}',
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
  'cable standing shoulder external rotation',
  'FWdVhcW',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"rotator cuff","trapezius"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Hold the cable handle with your arm extended in front of you, parallel to the ground.","Step:3 Keep your elbow slightly bent and your shoulder blades pulled back.","Step:4 Slowly rotate your arm outward, away from your body, while keeping your elbow in the same position.","Step:5 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FWdVhcW.gif"}',
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
  'dumbbell lying external shoulder rotation',
  'bmBf7LN',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"rotator cuff","triceps"}',
  '{"Step:1 Lie on your side on a flat bench with your upper arm against your side and your elbow bent 90 degrees.","Step:2 Hold a dumbbell in your hand with your palm facing down.","Step:3 Keeping your upper arm against your side, slowly rotate your forearm upward as far as possible.","Step:4 Pause for a moment at the top, then slowly lower your forearm back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bmBf7LN.gif"}',
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
  'cable front raise',
  'u2X71Np',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"triceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the cable handle with an overhand grip.","Step:2 Keep your back straight and your core engaged.","Step:3 Raise the cable handle in front of you, keeping your arms straight and your palms facing down.","Step:4 Continue lifting until your arms are parallel to the floor.","Step:5 Pause for a moment at the top, then slowly lower the cable handle back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u2X71Np.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;