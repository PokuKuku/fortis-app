INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'close-grip push-up (on knees)',
  'v3vLFW0',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start by getting on your hands and knees, with your hands shoulder-width apart and your knees hip-width apart.","Step:2 Lower your upper body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 Pause for a moment when your chest is just above the ground.","Step:4 Push through your palms to straighten your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v3vLFW0.gif"}',
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
  'cable pushdown',
  '3ZflifB',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.","Step:3 Grasp the bar with an overhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary.","Step:5 Exhale and push the bar down until your elbows are fully extended.","Step:6 Pause for a moment, then inhale and slowly return the bar to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3ZflifB.gif"}',
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
  'push-up on lower arms',
  '4Jt8QsQ',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a plank position with your forearms on the ground and elbows directly below your shoulders.","Step:2 Engage your core and keep your body in a straight line from head to toe.","Step:3 Lower your chest towards the ground by bending your elbows, keeping them close to your body.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4Jt8QsQ.gif"}',
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
  'dumbbell incline two arm extension',
  'U7D9Fx3',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, resting on your thighs.","Step:2 Slowly lie back on the bench, keeping the dumbbells close to your chest.","Step:3 Once you are fully lying down, extend your arms straight up towards the ceiling, keeping your elbows slightly bent.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/U7D9Fx3.gif"}',
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
  'dumbbell lying triceps extension',
  'mpKZGWz',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight up over your chest, keeping your elbows close to your body.","Step:3 Lower the dumbbells down towards your forehead, bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mpKZGWz.gif"}',
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
  'dumbbell standing bent over one arm triceps extension',
  'CJwa0vD',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand.","Step:2 Bend forward at the waist, keeping your back straight and parallel to the ground.","Step:3 Extend your arm straight back, keeping your elbow close to your body.","Step:4 Slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CJwa0vD.gif"}',
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
  'barbell lying triceps extension',
  'iZop9xO',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.","Step:4 Pause for a moment at the bottom, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iZop9xO.gif"}',
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
  'lever overhand triceps dip',
  'D5yqP2p',
  'intermediate',
  'leverage machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the machine to the appropriate height and secure your body in position.","Step:2 Grasp the handles with an overhand grip and position your body so that your arms are fully extended.","Step:3 Lower your body by bending your elbows, keeping your upper arms close to your sides.","Step:4 Continue lowering until your upper arms are parallel to the floor.","Step:5 Pause for a moment, then push yourself back up to the starting position by extending your elbows.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/D5yqP2p.gif"}',
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
  'barbell lying close-grip press',
  'EcaV7aL',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a close grip, hands shoulder-width apart, palms facing towards your feet.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Slowly lower the barbell towards your chest, keeping your elbows close to your body.","Step:5 Pause for a moment when the barbell touches your chest, then push it back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EcaV7aL.gif"}',
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
  'dumbbell kickback',
  'W6PxUkg',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Bring your upper arms close to your sides, with your elbows bent at a 90-degree angle.","Step:4 Extend your arms straight back, squeezing your triceps at the top of the movement.","Step:5 Pause for a moment, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/W6PxUkg.gif"}',
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
  'side push-up',
  'wpbD28t',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders","chest","core"}',
  '{"Step:1 Start by lying on your side with your legs extended and stacked on top of each other.","Step:2 Place your bottom hand on the ground directly under your shoulder, fingers pointing forward.","Step:3 Press through your bottom hand to lift your body off the ground, keeping your legs straight and your core engaged.","Step:4 Extend your top arm straight up towards the ceiling, creating a straight line from your head to your heels.","Step:5 Lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wpbD28t.gif"}',
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
  'dumbbell decline triceps extension',
  'OTgkHwR',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie on a decline bench with your head lower than your feet and hold a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms fully, keeping your elbows close to your head.","Step:3 Lower the dumbbells slowly behind your head, bending your elbows.","Step:4 Pause for a moment, then raise the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OTgkHwR.gif"}',
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
  'cable high pulley overhead tricep extension',
  '1xHyxys',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a high pulley and stand facing away from the machine.","Step:2 Grasp the rope with both hands and extend your arms overhead.","Step:3 Keep your elbows close to your head and your upper arms stationary.","Step:4 Slowly lower the rope behind your head by bending your elbows.","Step:5 Pause for a moment, then extend your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1xHyxys.gif"}',
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
  'dumbbell incline triceps extension',
  'OVIKwsd',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, palms facing inwards.","Step:2 Extend your arms fully overhead, keeping your elbows close to your head.","Step:3 Lower the dumbbells behind your head by bending your elbows, keeping your upper arms stationary.","Step:4 Pause for a moment, then raise the dumbbells back to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OVIKwsd.gif"}',
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
  'cable incline triceps extension',
  'Hx1WC8I',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Adjust the cable machine to a low pulley position.","Step:2 Attach a straight bar to the cable.","Step:3 Stand facing away from the machine with your feet shoulder-width apart.","Step:4 Grasp the bar with an overhand grip and extend your arms straight overhead.","Step:5 Lean forward slightly, keeping your back straight and core engaged.","Step:6 Bend your elbows and lower the bar behind your head, keeping your upper arms close to your ears.","Step:7 Pause for a moment, then extend your arms back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Hx1WC8I.gif"}',
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
  'dumbbell seated bent over triceps extension',
  '4ievMJ9',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand.","Step:2 Bend forward at the waist, keeping your back straight and your head up.","Step:3 Extend your arms straight back, keeping your elbows close to your head.","Step:4 Pause for a moment, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4ievMJ9.gif"}',
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
  'barbell lying back of the head tricep extension',
  'yg8Totb',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold a barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yg8Totb.gif"}',
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
  'dumbbell lying elbow press',
  'eOCOwIR',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other and arms extended straight up over your chest.","Step:2 Lower the dumbbells towards your shoulders by bending your elbows, keeping your upper arms stationary.","Step:3 Pause for a moment at the bottom, then press the dumbbells back up to the starting position by extending your elbows.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eOCOwIR.gif"}',
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
  'weighted three bench dips',
  'gtO1ErP',
  'intermediate',
  'weighted',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench with your hands gripping the edge, fingers pointing forward.","Step:2 Walk your feet forward, sliding your butt off the bench and supporting your weight with your arms.","Step:3 Lower your body by bending your elbows, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gtO1ErP.gif"}',
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
  'dumbbell neutral grip bench press',
  'pP8wP2P',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Hold a dumbbell in each hand with a neutral grip (palms facing each other) and your arms extended straight up over your chest.","Step:3 Slowly lower the dumbbells down towards your chest, keeping your elbows close to your body.","Step:4 Pause for a moment at the bottom, then push the dumbbells back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pP8wP2P.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;