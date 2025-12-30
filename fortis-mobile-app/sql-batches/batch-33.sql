INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'squared reverse grip machine lat pulldown',
  'AwAIlSo',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your knees under the pads and your feet flat on the ground.","Step:2 Grasp the handles with an underhand grip, slightly wider than shoulder-width apart.","Step:3 Sit upright with your chest out and shoulders back, maintaining a slight arch in your lower back.","Step:4 Pull the handles down towards your chest, squeezing your shoulder blades together. Maintain squared form throughout.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AwAIlSo.gif"}',
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
  'kipping muscle up with triple',
  'znf7t8E',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","triceps","shoulders","core"}',
  '{"Step:1 Start by hanging from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Engage your core and use a swinging motion to generate momentum.","Step:3 As you swing forward, pull your chest towards the bar, using your lats and biceps to initiate the movement. Emphasize triple control.","Step:4 Continue the upward motion until your chest reaches the bar, then transition into a dip position by pushing down on the bar and extending your arms.","Step:5 Lower yourself back down to the starting position by bending your arms and controlling the descent.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/znf7t8E.gif"}',
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
  'side-to-side chin with reverse',
  'BeReYBf',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Hang from the bar with your arms fully extended and your body relaxed.","Step:4 Pull yourself up by bending your elbows and bringing your chin towards the bar, while keeping your body straight. Perform with reverse intensity.","Step:5 Once your chin is above the bar, lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BeReYBf.gif"}',
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
  'cable squat row (with rope attachment) heavy',
  'Y8dOJlH',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Attach a rope to a cable machine at waist height.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 (heavy variation) Bend your knees and lower your body into a squat position, keeping your back straight and chest up.","Step:4 Grasp the rope with an overhand grip, with your hands shoulder-width apart.","Step:5 Engage your core and pull the rope towards your body, squeezing your shoulder blades together.","Step:6 Keep your elbows close to your body and continue pulling until your hands reach your chest.","Step:7 Pause for a moment at the top of the movement, then slowly release the rope and extend your arms back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y8dOJlH.gif"}',
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
  'lever lying leg curl',
  '17lJ1kr',
  'intermediate',
  'leverage machine',
  '{"hamstrings"}',
  '{"calves"}',
  '{"Step:1 Adjust the machine to fit your body and select the desired weight.","Step:2 Lie face down on the machine with your legs straight and your heels against the padded lever.","Step:3 Grasp the handles or the sides of the machine for stability.","Step:4 Keeping your upper body stationary, exhale and curl your legs up as far as possible without lifting your hips off the pad.","Step:5 Hold the contracted position for a brief pause as you squeeze your hamstrings.","Step:6 Inhale and slowly lower the lever back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/17lJ1kr.gif"}',
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
  'lever seated leg curl',
  'Zg3XY7P',
  'intermediate',
  'leverage machine',
  '{"hamstrings"}',
  '{"calves"}',
  '{"Step:1 Adjust the machine to fit your body and sit on it with your back against the backrest.","Step:2 Place your lower legs under the padded lever, just above your ankles.","Step:3 Grasp the handles on the sides of the machine for support.","Step:4 Keeping your upper legs stationary, exhale and curl your legs up as far as possible.","Step:5 Hold the contracted position for a brief pause as you squeeze your hamstrings.","Step:6 Inhale and slowly lower the lever back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Zg3XY7P.gif"}',
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
  'cable assisted inverse leg curl',
  'zHEpuuc',
  'intermediate',
  'cable',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Adjust the cable machine so that the ankle attachment is at the lowest setting.","Step:2 Lie face down on the bench with your legs straight and the ankle attachment secured to your ankles.","Step:3 Hold onto the handles of the bench for stability.","Step:4 Keeping your upper body stationary, exhale and curl your legs up towards your glutes by flexing your knees.","Step:5 Pause for a moment at the top of the movement, squeezing your hamstrings.","Step:6 Inhale and slowly lower your legs back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zHEpuuc.gif"}',
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
  'lever kneeling leg curl',
  'nnmCTLN',
  'intermediate',
  'leverage machine',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Adjust the machine to fit your body and select the desired weight.","Step:2 Kneel on the machine facing downwards, with your knees resting on the pad and your feet secured under the footpads.","Step:3 Grasp the handles or the sides of the machine for stability.","Step:4 Keeping your upper body stationary, exhale and curl your legs up towards your glutes by flexing your knees.","Step:5 Pause for a moment at the top of the movement, squeezing your hamstrings.","Step:6 Inhale and slowly lower your legs back to the starting position, fully extending your knees.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nnmCTLN.gif"}',
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
  'assisted prone hamstring',
  'VedGSby',
  'intermediate',
  'assisted',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Lie face down on a mat or bench with your legs fully extended.","Step:2 Have a partner or use a resistance band to secure your ankles.","Step:3 Engage your hamstrings and lift your legs towards your glutes, keeping your knees straight.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VedGSby.gif"}',
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
  'dumbbell lying femoral',
  'FkBIE6a',
  'intermediate',
  'dumbbell',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Lie flat on your back with your legs extended and a dumbbell resting on your lower abdomen.","Step:2 Bend your knees and bring the dumbbell towards your glutes, keeping your feet flat on the ground.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FkBIE6a.gif"}',
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
  'hamstring stretch',
  '99rWm7w',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Step forward with your right foot and shift your weight onto your right leg.","Step:3 Keeping your back straight, slowly bend forward at the hips, reaching towards your right foot with both hands.","Step:4 Hold the stretch for 20-30 seconds, then return to the starting position.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/99rWm7w.gif"}',
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
  'runners stretch',
  '0mB6wHO',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"calves","quadriceps"}',
  '{"Step:1 Stand with your feet hip-width apart.","Step:2 Take a step forward with your right foot, keeping your left foot planted.","Step:3 Bend your right knee and lower your body down, keeping your left leg straight.","Step:4 Place your hands on your right thigh for support.","Step:5 Hold the stretch for 20-30 seconds, then switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0mB6wHO.gif"}',
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
  'kick out sit',
  'v7p5bYl',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"quadriceps","glutes"}',
  '{"Step:1 Sit on the edge of a bench or chair with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Lean back slightly and place your hands on the edge of the bench or chair for support.","Step:3 Engaging your hamstrings, lift your feet off the ground and extend your legs straight out in front of you.","Step:4 Pause for a moment at the top, then slowly bend your knees and bring your feet back towards your body.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v7p5bYl.gif"}',
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
  'glute-ham raise',
  'Vvwjz6N',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Adjust the glute-ham raise machine to fit your body.","Step:2 Position yourself face down on the machine with your ankles secured.","Step:3 Place your hands on your chest or cross them over your chest.","Step:4 Engage your hamstrings and glutes to lift your upper body up towards the ceiling.","Step:5 Continue lifting until your body is in a straight line from your head to your heels.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Vvwjz6N.gif"}',
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
  'seated wide angle pose sequence',
  'HIgYKAB',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"quadriceps","calves"}',
  '{"Step:1 Sit on the ground with your legs extended in a wide angle.","Step:2 Flex your feet and engage your quadriceps.","Step:3 Place your hands on the ground behind you for support.","Step:4 Keeping your back straight, lean forward from your hips.","Step:5 Continue leaning forward until you feel a stretch in your hamstrings.","Step:6 Hold this position for a few breaths.","Step:7 Slowly release the stretch and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HIgYKAB.gif"}',
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
  'kettlebell hang clean',
  'LHWF7us',
  'intermediate',
  'kettlebell',
  '{"hamstrings"}',
  '{"glutes","quadriceps","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in front of your thighs.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Lower the kettlebell towards the ground, allowing it to swing between your legs.","Step:4 Quickly extend your hips and knees, using the momentum to swing the kettlebell up to shoulder height.","Step:5 As the kettlebell reaches shoulder height, rotate your wrists and catch the kettlebell in the rack position, with your elbow tucked in and the kettlebell resting on your forearm.","Step:6 Lower the kettlebell back down to the starting position between your legs, and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LHWF7us.gif"}',
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
  'reclining big toe pose with rope',
  'K5xgdvI',
  'intermediate',
  'rope',
  '{"hamstrings"}',
  '{"calves","glutes"}',
  '{"Step:1 Lie on your back with your legs extended and your arms by your sides.","Step:2 Loop the rope around the ball of your right foot and hold the ends of the rope with your hands.","Step:3 Slowly raise your right leg towards your chest, keeping your knee straight and your foot flexed.","Step:4 Hold the stretch for a few seconds, then slowly lower your leg back down to the starting position.","Step:5 Repeat with your left leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/K5xgdvI.gif"}',
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
  'leg up hamstring stretch',
  'sU5BrfP',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Lie flat on your back with your legs extended.","Step:2 Bend one knee and bring it towards your chest, holding onto your thigh or shin.","Step:3 Straighten your leg as much as possible while keeping it elevated.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sU5BrfP.gif"}',
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
  'standing single leg curl',
  'C5jncD2',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Stand with your feet hip-width apart and your hands on your hips.","Step:2 Shift your weight onto your left leg and lift your right foot off the ground, bending your knee.","Step:3 Slowly curl your right heel towards your glutes, squeezing your hamstring.","Step:4 Pause for a moment at the top, then slowly lower your right foot back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/C5jncD2.gif"}',
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
  'barbell straight leg deadlift',
  'hrVQWvE',
  'intermediate',
  'barbell',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing forward.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend at your hips and lower the barbell towards the ground, keeping your back straight and your knees slightly bent.","Step:4 Lower the barbell until you feel a stretch in your hamstrings.","Step:5 Engage your hamstrings and glutes to lift the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hrVQWvE.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;