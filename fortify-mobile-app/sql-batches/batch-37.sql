INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith squat',
  'jFtipLl',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Set up the smith machine with the barbell at an appropriate height for your squat.","Step:2 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:3 Position yourself under the barbell, resting it on your upper traps and shoulders.","Step:4 Grip the barbell with a wide grip, slightly wider than shoulder-width apart.","Step:5 Engage your core and unrack the barbell, stepping back to clear the rack.","Step:6 Keeping your chest up and back straight, initiate the squat by bending at the hips and knees.","Step:7 Lower your body until your thighs are parallel to the ground or slightly below.","Step:8 Pause for a moment at the bottom, then drive through your heels to return to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jFtipLl.gif"}',
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
  'barbell single leg deadlift',
  'gEyURal',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet hip-width apart, holding a barbell in front of your thighs with an overhand grip.","Step:2 Shift your weight onto your left foot and lift your right foot slightly off the ground.","Step:3 Hinge forward at the hips, keeping your back straight and your right leg extended behind you for balance.","Step:4 Lower the barbell towards the ground, keeping it close to your body and your left leg slightly bent.","Step:5 Pause for a moment at the bottom, then engage your glutes and hamstrings to lift your torso back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gEyURal.gif"}',
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
  'glute bridge two legs on bench (male)',
  'aWedzZX',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Sit on the edge of a bench with your back against it and your feet flat on the ground.","Step:2 Place your hands on the bench beside your hips for support.","Step:3 Engage your glutes and hamstrings, then lift your hips off the bench until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aWedzZX.gif"}',
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
  'weighted lunge with swing',
  '5WiFcYk',
  'intermediate',
  'weighted',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a weight in each hand.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 As you lunge forward, swing the weights forward and upward, keeping your arms straight.","Step:4 Push off with your right foot and return to the starting position, swinging the weights back down.","Step:5 Repeat with your left foot and continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5WiFcYk.gif"}',
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
  'hands reversed clasped circular toe touch (male)',
  'yq3GAJX',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms extended to the sides.","Step:2 Bend forward at the waist, keeping your back straight and your knees slightly bent.","Step:3 Reach down with your hands and clasp them together behind your legs.","Step:4 Slowly raise your hands up and over your head in a circular motion, keeping your legs straight.","Step:5 Continue the circular motion until your hands touch your toes.","Step:6 Reverse the motion and bring your hands back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yq3GAJX.gif"}',
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
  'barbell glute bridge',
  'qKBpF7I',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Start by lying flat on your back on the ground with your knees bent and feet flat on the floor.","Step:2 Place a barbell across your hips, holding it securely with both hands.","Step:3 Engage your glutes and core muscles, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, squeezing your glutes.","Step:5 Slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qKBpF7I.gif"}',
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
  'cable deadlift',
  'eGDudUV',
  'intermediate',
  'cable',
  '{"glutes"}',
  '{"hamstrings","quadriceps","lower back"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Bend at the hips and knees, lowering your torso until your back is parallel to the ground.","Step:3 Grasp the cable handles with an overhand grip, keeping your arms straight and your shoulders back.","Step:4 Engage your glutes and hamstrings to lift the cable handles, extending your hips and standing up straight.","Step:5 Pause for a moment at the top, then slowly lower the cable handles back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eGDudUV.gif"}',
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
  'frankenstein squat',
  'bdWcbaU',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell in front of your body with straight arms.","Step:2 Keeping your back straight, lower your body by bending at the knees and hips, as if sitting back into a chair.","Step:3 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:4 Pause for a moment, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bdWcbaU.gif"}',
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
  'weighted stretch lunge',
  '13VW2VO',
  'intermediate',
  'weighted',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Take a step forward with your right foot, keeping your back straight.","Step:3 Lower your body by bending your knees until your right thigh is parallel to the ground.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat with your left leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/13VW2VO.gif"}',
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
  'flutter kicks',
  'UVo2Qs2',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hip flexors","lower abs"}',
  '{"Step:1 Lie flat on your back with your legs extended and your hands by your sides.","Step:2 Engage your core and lift your legs off the ground about 6 inches.","Step:3 Keeping your legs straight, alternate lifting one leg slightly higher than the other.","Step:4 Continue this fluttering motion for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UVo2Qs2.gif"}',
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
  'barbell glute bridge two legs on bench (male)',
  'qg2PGl6',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Start by sitting on the edge of a bench with your upper back resting against it and your feet flat on the ground, hip-width apart.","Step:2 Place a barbell across your hips, holding it securely with both hands.","Step:3 Engage your glutes and core muscles, then press through your heels to lift your hips off the bench, creating a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, squeezing your glutes.","Step:5 Slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qg2PGl6.gif"}',
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
  'sled 45в° leg press',
  '10Z2DXU',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat and footplate of the sled machine to a comfortable position.","Step:2 Sit on the sled machine with your back against the backrest and your feet shoulder-width apart on the footplate.","Step:3 Grip the handles on the sides of the seat for stability.","Step:4 Push the footplate away from your body by extending your legs, keeping your heels on the footplate.","Step:5 Continue pushing until your legs are almost fully extended, but without locking your knees.","Step:6 Pause for a moment at the top of the movement, then slowly lower the footplate back towards your body by bending your knees.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/10Z2DXU.gif"}',
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
  'weighted squat',
  'JZuApnB',
  'intermediate',
  'weighted',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing slightly outward.","Step:2 Hold a weight in front of your chest or on your shoulders.","Step:3 Engage your core and keep your chest up as you lower your hips down and back, as if sitting into a chair.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Push through your heels to stand back up, squeezing your glutes at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JZuApnB.gif"}',
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
  'lever hip extension v. 2',
  'OPqShYN',
  'intermediate',
  'leverage machine',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Adjust the machine to fit your body and sit on it with your back against the backrest.","Step:2 Place your feet on the footrests and grip the handles for stability.","Step:3 Engage your glutes and hamstrings, then push against the footrests to extend your hips and raise your legs backward.","Step:4 Pause for a moment at the top, then slowly lower your legs back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OPqShYN.gif"}',
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
  'reverse hyper on flat bench',
  'OrETs32',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Lie face down on a flat bench with your hips at the edge and your legs hanging off the bench.","Step:2 Hold onto the bench for stability.","Step:3 Keeping your legs straight, raise them up towards the ceiling as high as you can.","Step:4 Squeeze your glutes at the top of the movement.","Step:5 Slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OrETs32.gif"}',
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
  'iron cross stretch',
  'pZwUsKB',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie flat on your back with your arms extended out to the sides.","Step:2 Raise your legs up towards the ceiling, keeping them straight.","Step:3 Slowly lower your legs to one side, aiming to touch the floor with your feet.","Step:4 Hold the stretch for a few seconds, then return your legs to the starting position.","Step:5 Repeat the stretch on the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pZwUsKB.gif"}',
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
  'dumbbell step-up',
  'aXtJhlg',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand in front of a bench or step with a dumbbell in each hand, palms facing your body.","Step:2 Place your right foot on the bench or step, ensuring your entire foot is in contact with the surface.","Step:3 Push through your right heel and lift your body up onto the bench or step, straightening your right leg.","Step:4 Bring your left foot up onto the bench or step, standing fully upright.","Step:5 Step back down with your left foot, followed by your right foot, returning to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aXtJhlg.gif"}',
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
  'sled 45° leg press (side pov)',
  '2Qh2J1e',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat of the sled machine so that your knees are at a 90-degree angle when your feet are on the footplate.","Step:2 Sit on the sled machine with your back flat against the backrest and your feet shoulder-width apart on the footplate.","Step:3 Grip the handles on the sides of the seat for stability.","Step:4 Push against the footplate to extend your legs, straightening them completely.","Step:5 Pause for a moment at the top, then slowly bend your knees to lower the footplate back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2Qh2J1e.gif"}',
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
  'seated piriformis stretch',
  'QY39eBr',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Bend your right knee and place your right foot on the outside of your left knee.","Step:3 Place your left elbow on the outside of your right knee and gently twist your torso to the right.","Step:4 Hold the stretch for 20-30 seconds, then switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QY39eBr.gif"}',
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
  'barbell full squat',
  'qXTaZnJ',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you begin to lower your body down.","Step:4 Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.","Step:5 Lower yourself until your thighs are parallel to the ground or slightly below.","Step:6 Keep your knees in line with your toes and your weight in your heels.","Step:7 Drive through your heels to stand back up, extending your hips and knees.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qXTaZnJ.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;