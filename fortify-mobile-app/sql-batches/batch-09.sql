INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell lying close-grip triceps extension',
  'HJ63mSO',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Grasp the barbell with a close grip, hands shoulder-width apart, palms facing up.","Step:3 Extend your arms fully, lifting the barbell above your chest.","Step:4 Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.","Step:5 Pause for a moment at the bottom, then extend your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HJ63mSO.gif"}',
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
  'ez barbell decline triceps extension',
  'CQHoDm0',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie on a decline bench with your head lower than your feet and your feet secured.","Step:2 Hold the ez barbell with an overhand grip, hands shoulder-width apart.","Step:3 Extend your arms fully, keeping your elbows close to your head.","Step:4 Lower the barbell slowly towards your forehead, bending your elbows.","Step:5 Pause for a moment, then extend your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CQHoDm0.gif"}',
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
  'dumbbell seated one arm kickback',
  'VQ3sNCn',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand.","Step:2 Bend your torso forward at the waist, keeping your back straight and parallel to the ground.","Step:3 Extend your arm straight back, keeping your elbow close to your body.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VQ3sNCn.gif"}',
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
  'ez bar lying close grip triceps extension behind head',
  '6CKUx7o',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the ez barbell with a close grip, palms facing up, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6CKUx7o.gif"}',
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
  'band close-grip push-up',
  'ufaxB52',
  'intermediate',
  'band',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Place a band around your upper arms, just above the elbows.","Step:2 Assume a push-up position with your hands directly under your shoulders and your body in a straight line from head to heels.","Step:3 Bend your elbows and lower your chest towards the ground, keeping your elbows close to your sides.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ufaxB52.gif"}',
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
  'dumbbell pronate-grip triceps extension',
  'bpJL2Qs',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell with both hands, palms facing down, and extend your arms straight up overhead.","Step:3 Keeping your upper arms close to your head and elbows pointing forward, slowly lower the dumbbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bpJL2Qs.gif"}',
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
  'weighted triceps dip on high parallel bars',
  'K1vlode',
  'intermediate',
  'weighted',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Position yourself between two parallel bars with your hands gripping the bars and your arms fully extended.","Step:2 Bend your elbows and lower your body until your upper arms are parallel to the ground.","Step:3 Pause for a moment, then push through your palms to straighten your arms and return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/K1vlode.gif"}',
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
  'three bench dip',
  'DQ0cqkT',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a bench with your hands gripping the edge, fingers pointing forward.","Step:2 Slide your butt off the bench, supporting your weight with your hands.","Step:3 Bend your elbows and lower your body until your upper arms are parallel to the ground.","Step:4 Push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DQ0cqkT.gif"}',
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
  'ring dips',
  'ezTvXcr',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start by hanging from the rings with your arms fully extended and your body straight.","Step:2 Lower your body by bending your elbows until your shoulders are below your elbows.","Step:3 Push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ezTvXcr.gif"}',
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
  'dumbbell tate press',
  's5PdDyY',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a flat bench with a dumbbell in each hand, palms facing each other.","Step:2 Raise the dumbbells to shoulder height, then rotate your wrists so that your palms are facing away from you.","Step:3 Press the dumbbells up until your arms are fully extended, then lower them back down to shoulder height.","Step:4 Rotate your wrists back to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s5PdDyY.gif"}',
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
  'bench dip (knees bent)',
  'RrLske5',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench or chair with your hands gripping the edge next to your hips.","Step:2 Slide your butt off the bench and straighten your legs in front of you, keeping your heels on the ground.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RrLske5.gif"}',
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
  'barbell standing overhead triceps extension',
  'dZl9Q27',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip.","Step:2 Raise the barbell overhead, fully extending your arms.","Step:3 Keeping your upper arms close to your head, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then raise the barbell back to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dZl9Q27.gif"}',
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
  'cable rope incline tricep extension',
  'ZujAdR9',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a high pulley and adjust the incline bench to a comfortable angle.","Step:2 Stand facing away from the pulley with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip and extend your arms straight overhead.","Step:4 Keep your elbows close to your head and your upper arms stationary throughout the exercise.","Step:5 Lower the rope behind your head by bending your elbows until your forearms touch your biceps.","Step:6 Pause for a moment, then extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZujAdR9.gif"}',
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
  'smith machine incline tricep extension',
  'o8aOcrz',
  'intermediate',
  'smith machine',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Adjust the seat of the smith machine so that the bar is at shoulder height.","Step:2 Sit on the bench with your back against the pad and your feet flat on the ground.","Step:3 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Extend your arms fully, lifting the bar off the rack and holding it directly above your chest.","Step:5 Lower the bar slowly towards your forehead, keeping your elbows close to your head.","Step:6 Pause for a moment at the bottom, then push the bar back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o8aOcrz.gif"}',
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
  'olympic barbell triceps extension',
  'wu5LXwz',
  'intermediate',
  'olympic barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and holding the barbell with an overhand grip.","Step:2 Raise the barbell above your head, fully extending your arms.","Step:3 Keeping your upper arms close to your head, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wu5LXwz.gif"}',
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
  'dumbbell one arm hammer press on exercise ball',
  'VYmYxK5',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","chest"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing inwards and your elbow bent at a 90-degree angle.","Step:3 Place your other hand on your hip for stability.","Step:4 Press the dumbbell upwards, extending your arm fully.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VYmYxK5.gif"}',
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
  'dumbbell seated triceps extension',
  'kont8Ut',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell with both hands and extend your arms straight up overhead.","Step:3 Bend your elbows and lower the dumbbell behind your head, keeping your upper arms close to your ears.","Step:4 Pause for a moment, then straighten your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kont8Ut.gif"}',
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
  'dumbbell standing triceps extension',
  'PdmaD0N',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand.","Step:2 Raise the dumbbell overhead, keeping your arm straight.","Step:3 Bend your elbow and lower the dumbbell behind your head, keeping your upper arm stationary.","Step:4 Extend your arm back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PdmaD0N.gif"}',
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
  'dumbbell lying alternate extension',
  'NfP83rA',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight up over your chest, keeping a slight bend in your elbows.","Step:3 Lower one dumbbell down towards your head, bending at the elbow, while keeping the other arm extended.","Step:4 Pause for a moment at the bottom, then raise the dumbbell back up to the starting position.","Step:5 Repeat with the other arm, alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NfP83rA.gif"}',
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
  'triceps dip (bench leg)',
  'VuoerH0',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench with your hands gripping the edge, fingers pointing forward.","Step:2 Walk your feet forward, sliding your butt off the bench, and straighten your arms.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Push through your palms to straighten your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VuoerH0.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;