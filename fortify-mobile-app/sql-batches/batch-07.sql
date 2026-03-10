INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell twisting bench press',
  'z6TAHoT',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Hold a dumbbell in each hand with an overhand grip, palms facing away from you.","Step:3 Extend your arms straight up over your chest, keeping a slight bend in your elbows.","Step:4 Lower the dumbbells down towards your chest, keeping your elbows close to your body.","Step:5 As you lower the dumbbells, twist your wrists so that your palms face towards you at the bottom of the movement.","Step:6 Pause for a moment at the bottom, then reverse the movement by pressing the dumbbells back up to the starting position.","Step:7 As you press the dumbbells up, twist your wrists back to the starting position with palms facing away from you.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/z6TAHoT.gif"}',
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
  'triceps dip (between benches)',
  'Wgbn9qo',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a bench with your hands gripping the edge of the bench, fingers pointing forward.","Step:2 Slide your butt off the bench, supporting your weight with your hands.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Wgbn9qo.gif"}',
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
  'dumbbell close-grip press',
  'RxayqAZ',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a flat bench with a dumbbell in each hand, resting on your thighs.","Step:2 Using your thighs to help raise the dumbbells, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.","Step:3 Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position.","Step:4 As you breathe in, slowly lower the dumbbells to your side until they are about level with your chest.","Step:5 As you exhale, use your triceps to lift the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RxayqAZ.gif"}',
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
  'elbow dips',
  'LkoAWAE',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench or chair with your hands gripping the edge next to your hips.","Step:2 Slide your hips forward off the bench and straighten your legs, keeping your heels on the ground.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push through your hands to straighten your arms and lift your body back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LkoAWAE.gif"}',
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
  'ez-bar close-grip bench press',
  'da4cXST',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the ez barbell with a close grip, hands shoulder-width apart, palms facing forward.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Slowly lower the barbell towards your chest, keeping your elbows close to your body.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/da4cXST.gif"}',
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
  'barbell pin presses',
  'bndCa3Q',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Set up a barbell on a power rack at chest height.","Step:2 Stand facing the barbell and position yourself underneath it, with your feet shoulder-width apart.","Step:3 Grip the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lift the barbell off the rack and hold it directly above your chest, with your arms fully extended.","Step:5 Lower the barbell down towards your chest, keeping your elbows tucked in close to your body.","Step:6 Pause for a moment when the barbell touches your chest.","Step:7 Push the barbell back up to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bndCa3Q.gif"}',
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
  'cable overhead triceps extension (rope attachment)',
  '2IxROQ1',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a cable machine at a high position.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with both hands, palms facing each other, and bring your hands above your head.","Step:4 Keep your upper arms close to your head and your elbows pointing forward.","Step:5 Slowly lower the rope behind your head by bending your elbows.","Step:6 Pause for a moment, then extend your arms back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2IxROQ1.gif"}',
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
  'dumbbell tricep kickback with stork stance',
  'wOLmCXc',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in your right hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Bring your right elbow up to your side, keeping it bent at a 90-degree angle.","Step:4 Extend your right arm straight back, squeezing your triceps.","Step:5 Pause for a moment, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wOLmCXc.gif"}',
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
  'dumbbell incline hammer press on exercise ball',
  'wkgnGfb',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in each hand, palms facing each other.","Step:2 Walk your feet forward and roll your body down the ball until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbells at shoulder level, elbows bent and pointing out to the sides.","Step:4 Press the dumbbells up and slightly inward, keeping your palms facing each other.","Step:5 Extend your arms fully, squeezing your triceps at the top of the movement.","Step:6 Slowly lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wkgnGfb.gif"}',
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
  'triceps stretch',
  'uOV3Itw',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand or sit upright with your back straight.","Step:2 Extend one arm overhead, bending it at the elbow.","Step:3 Place your opposite hand on the bent elbow and gently pull it towards your head.","Step:4 Hold the stretch for 15-30 seconds, feeling a gentle stretch in your triceps.","Step:5 Release the stretch and repeat on the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uOV3Itw.gif"}',
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
  'dumbbell lying extension (across face)',
  'L2V5Nan',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold a dumbbell with both hands and extend your arms straight up above your chest, palms facing each other.","Step:3 Keeping your upper arms stationary, slowly lower the dumbbell in an arc behind your head until your forearms are parallel to the ground.","Step:4 Pause for a moment, then contract your triceps to bring the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/L2V5Nan.gif"}',
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
  'barbell one arm floor press',
  'vtusOWT',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold the barbell with one hand, palm facing up, and extend your arm straight up over your chest.","Step:3 Slowly lower the barbell towards your chest, keeping your elbow close to your body.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vtusOWT.gif"}',
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
  'weighted tricep dips',
  'bZq4bwK',
  'intermediate',
  'weighted',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench or chair with your hands gripping the edge next to your hips.","Step:2 Slide your butt off the front of the bench with your legs extended in front of you.","Step:3 Keep your back close to the bench and your elbows slightly bent.","Step:4 Lower your body by bending your elbows until your upper arms are parallel to the floor.","Step:5 Push yourself back up to the starting position by straightening your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bZq4bwK.gif"}',
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
  'cable reverse-grip pushdown',
  'VjYliFZ',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Using your triceps, push the bar down until your arms are fully extended and your triceps are contracted.","Step:6 Pause for a moment, then slowly return the bar to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VjYliFZ.gif"}',
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
  'incline close-grip push-up',
  '1YB40kg',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Place your hands on an elevated surface, such as a bench or step, slightly wider than shoulder-width apart.","Step:2 Extend your legs behind you, resting on the balls of your feet, with your body forming a straight line from head to heels.","Step:3 Lower your chest towards the elevated surface by bending your elbows, keeping them close to your sides.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1YB40kg.gif"}',
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
  'dumbbell seated bench extension',
  'JhYSVwT',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell with both hands and extend your arms straight up above your head.","Step:3 Slowly lower the dumbbell behind your head, keeping your elbows close to your ears.","Step:4 Pause for a moment, then raise the dumbbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JhYSVwT.gif"}',
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
  'cable standing reverse grip one arm overhead tricep extension',
  'i11JWU7',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand facing away from the cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with an underhand grip and extend your arm overhead, keeping your elbow close to your head.","Step:3 Keep your upper arm stationary and slowly lower the cable handle behind your head by bending your elbow.","Step:4 Pause for a moment at the bottom, then extend your arm back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/i11JWU7.gif"}',
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
  'narrow push-up on exercise ball',
  '4cWjYEN',
  'intermediate',
  'stability ball',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Place the stability ball on the ground and position yourself in a push-up position with your hands on the ball, slightly narrower than shoulder-width apart.","Step:2 Engage your core and keep your body in a straight line from head to toe.","Step:3 Lower your chest towards the ball by bending your elbows, keeping them close to your body.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4cWjYEN.gif"}',
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
  'stalder press',
  'zd4P4B2',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and your arms extended overhead.","Step:2 Bend your knees slightly and engage your core.","Step:3 Lower your body down into a squat position while keeping your arms extended overhead.","Step:4 As you squat down, press your arms down towards the ground, engaging your triceps.","Step:5 Pause for a moment at the bottom of the squat, then push through your heels to stand back up while simultaneously raising your arms back overhead.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zd4P4B2.gif"}',
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
  'overhead triceps stretch',
  'Z5YStHW',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand or sit upright with your feet shoulder-width apart.","Step:2 Extend one arm overhead, bending at the elbow so that your hand reaches towards the opposite shoulder blade.","Step:3 With your other hand, gently pull the elbow of the extended arm towards the opposite side of your head, feeling a stretch in your triceps.","Step:4 Hold the stretch for 15-30 seconds, then release.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Z5YStHW.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;