INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'one arm dip',
  'FAoIFMw',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Stand facing away from a bench or chair, with your feet shoulder-width apart.","Step:2 Place one hand on the bench or chair behind you, fingers pointing towards your body.","Step:3 Extend your legs out in front of you, keeping your heels on the ground.","Step:4 Bend your elbows and lower your body towards the ground, keeping your back close to the bench or chair.","Step:5 Pause for a moment at the bottom, then push through your palms to straighten your arms and return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides and repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FAoIFMw.gif"}',
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
  'dumbbell close grip press',
  '7jGOBF3',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a flat bench with a dumbbell in each hand, resting on your thighs.","Step:2 Using your thighs to help raise the dumbbells, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.","Step:3 Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position.","Step:4 As you breathe in, slowly lower the dumbbells to your side until they are about level with your chest.","Step:5 As you exhale, use your triceps to lift the dumbbells back to the starting position. Make sure to use only your triceps and do not use your forearms or biceps to help lift the dumbbells.","Step:6 After a second pause at the contracted position, repeat the movement for the prescribed amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7jGOBF3.gif"}',
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
  'barbell incline close grip bench press',
  'gx7s7uF',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie down on the bench with your feet flat on the ground.","Step:3 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows close to your body.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gx7s7uF.gif"}',
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
  'dumbbell seated bent over alternate kickback',
  'x0lwvfq',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing inwards.","Step:2 Bend forward at the waist, keeping your back straight and parallel to the ground.","Step:3 Extend one arm straight back, keeping it close to your body, until your arm is fully extended.","Step:4 Pause for a moment, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat with the other arm.","Step:6 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x0lwvfq.gif"}',
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
  'lever seated dip',
  'BRImeP8',
  'intermediate',
  'leverage machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the seat height so that your feet are flat on the ground and your knees are at a 90-degree angle.","Step:2 Grasp the handles of the leverage machine with your palms facing down and your arms fully extended.","Step:3 Slowly lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:4 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BRImeP8.gif"}',
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
  'dumbbell palms in incline bench press',
  '8eqjhOl',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your back against the backrest and feet flat on the ground.","Step:3 Hold a dumbbell in each hand with an overhand grip, palms facing inwards.","Step:4 Extend your arms straight up above your chest, keeping a slight bend in your elbows.","Step:5 Lower the dumbbells slowly towards your shoulders, keeping your elbows close to your body.","Step:6 Pause for a moment at the bottom, then press the dumbbells back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8eqjhOl.gif"}',
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
  'reverse dip',
  'NZ5Qqkz',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Position yourself between two parallel bars with your arms fully extended and your body straight.","Step:2 Lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:3 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NZ5Qqkz.gif"}',
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
  'dumbbell seated reverse grip one arm overhead tricep extension',
  '5fKX7wi',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell with an underhand grip and extend your arm straight up overhead.","Step:3 Lower the dumbbell behind your head by bending your elbow, keeping your upper arm stationary.","Step:4 Pause for a moment, then extend your arm back up to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5fKX7wi.gif"}',
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
  'triceps dip',
  'X6C6i5Y',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench or chair with your hands gripping the edge, fingers pointing forward.","Step:2 Slide your butt off the bench, supporting your weight with your hands.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/X6C6i5Y.gif"}',
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
  'ez barbell decline close grip face press',
  'DgZQ11d',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie on a decline bench with your head lower than your feet.","Step:2 Grasp the ez barbell with a close grip, palms facing each other.","Step:3 Extend your arms straight up above your chest, keeping your elbows close to your body.","Step:4 Lower the barbell towards your forehead by bending your elbows.","Step:5 Pause for a moment, then press the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DgZQ11d.gif"}',
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
  'dumbbell lying single extension',
  '6MfS53i',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in one hand and your arm fully extended above your chest.","Step:2 Lower the dumbbell in a controlled manner towards your forehead, keeping your upper arm stationary.","Step:3 Pause briefly at the bottom of the movement, then extend your arm back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6MfS53i.gif"}',
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
  'dumbbell incline one arm hammer press',
  'LL1UiTX',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","chest"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in one hand, resting on your thigh.","Step:2 Lean back on the bench and use your thigh to help raise the dumbbell to shoulder height.","Step:3 Rotate your wrist so that your palm is facing inward, towards your body.","Step:4 Press the dumbbell up and away from your body, extending your arm fully.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LL1UiTX.gif"}',
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
  'dumbbell one arm kickback',
  'bQy2Eni',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in your right hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Bring your right elbow up to your side, keeping it bent at a 90-degree angle.","Step:4 Extend your right arm straight back, squeezing your triceps at the top of the movement.","Step:5 Slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bQy2Eni.gif"}',
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
  'dumbbells seated triceps extension',
  'FQXdXzY',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in both hands with an overhand grip, and raise it above your head.","Step:3 Bend your elbows and lower the dumbbell behind your head, keeping your upper arms close to your ears.","Step:4 Extend your arms and raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FQXdXzY.gif"}',
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
  'dumbbell seated kickback',
  'en550rk',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and lean forward from your hips, keeping your back straight.","Step:3 Bring your upper arms close to your sides and keep your elbows bent at a 90-degree angle.","Step:4 Extend your arms straight back, squeezing your triceps at the top of the movement.","Step:5 Pause for a moment, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/en550rk.gif"}',
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
  'exercise ball supine triceps extension',
  'Gm2Uv1z',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a dumbbell with both hands and extend your arms straight up towards the ceiling.","Step:3 Slowly lower the dumbbell behind your head, keeping your elbows close to your ears.","Step:4 Pause for a moment, then raise the dumbbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gm2Uv1z.gif"}',
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
  'ez bar french press on exercise ball',
  'CFN9P8G',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an exercise ball and hold an EZ barbell with an overhand grip.","Step:2 Extend your arms straight up, keeping your elbows close to your head.","Step:3 Slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CFN9P8G.gif"}',
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
  'dumbbell decline one arm hammer press',
  'SHUMp5H',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie on a decline bench with a dumbbell in one hand, resting on your chest.","Step:2 Extend your arm straight up, keeping your elbow slightly bent.","Step:3 Lower the dumbbell down towards your shoulder, keeping your elbow close to your body.","Step:4 Press the dumbbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SHUMp5H.gif"}',
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
  'cable rear drive',
  'c3QQLPi',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Attach a handle to a low pulley cable machine and stand facing away from the machine.","Step:2 Grasp the handle with an overhand grip and extend your arms straight out in front of you.","Step:3 Keeping your elbows stationary, pull the handle back towards your body, squeezing your triceps at the end of the movement.","Step:4 Slowly return the handle to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/c3QQLPi.gif"}',
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
  'handstand push-up',
  'rQxwMxO',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders","chest","core"}',
  '{"Step:1 Find a wall and face away from it, standing a few feet away.","Step:2 Place your hands on the ground shoulder-width apart and kick your feet up against the wall, coming into a handstand position.","Step:3 Bend your elbows and lower your head towards the ground, keeping your body in a straight line.","Step:4 Push through your hands and extend your arms to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rQxwMxO.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;