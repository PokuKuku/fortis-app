INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'weighted lunge with swing twisted',
  '9vz4JlC',
  'intermediate',
  'weighted',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a weight in each hand.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 As you lunge forward, swing the weights forward and upward, keeping your arms straight.","Step:4 Push off with your right foot and return to the starting position, swinging the weights back down.","Step:5 (twisted variation) Repeat with your left foot and continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9vz4JlC.gif"}',
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
  'controlled band straight back stiff leg deadlift',
  'PDHE73u',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your upper legs.","Step:2 Hold the band with both hands in front of your thighs, palms facing your body.","Step:3 Keeping your back straight and your knees slightly bent, hinge at the hips and lower the band towards the ground. Focus on controlled movement.","Step:4 Feel the stretch in your hamstrings as you lower the band.","Step:5 Engage your glutes and hamstrings to lift your body back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PDHE73u.gif"}',
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
  'forward lunge (male) with bench',
  'Ql4g5s8',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet hip-width apart and hands on your hips.","Step:2 Take a big step forward with your right foot, lowering your body into a lunge position.","Step:3 Bend your right knee to about 90 degrees, keeping your knee aligned with your ankle.","Step:4 Push off with your right foot and return to the starting position. Focus on bench movement.","Step:5 Repeat with your left leg, alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ql4g5s8.gif"}',
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
  'exercise ball hip flexor stretch pointed',
  'hjWjJEm',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"quadriceps","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and kneel in front of it.","Step:2 Place your right foot on top of the stability ball, with your knee bent at a 90-degree angle.","Step:3 Extend your left leg behind you, keeping it straight.","Step:4 Lean forward, pushing your hips towards the stability ball, until you feel a stretch in your right hip flexor.","Step:5 Hold the stretch for 20-30 seconds, then switch sides and repeat. Emphasize pointed control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hjWjJEm.gif"}',
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
  'rough band hip lift',
  '8IbNZwc',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place a resistance band just above your knees.","Step:3 Engage your glutes and core muscles.","Step:4 Press your heels into the ground and lift your hips off the floor, squeezing your glutes at the top.","Step:5 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions. Focus on rough movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8IbNZwc.gif"}',
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
  'advanced dumbbell stiff leg deadlift',
  '2Ty4idJ',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing a slight bend in your knees. Focus on advanced movement.","Step:3 Lower the dumbbells until you feel a stretch in your hamstrings, then squeeze your glutes and push through your heels to return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2Ty4idJ.gif"}',
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
  'iron cross stretch - deep variation',
  'p5v6rdT',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie flat on your back with your arms extended out to the sides.","Step:2 Raise your legs up towards the ceiling, keeping them straight.","Step:3 Slowly lower your legs to one side, aiming to touch the floor with your feet.","Step:4 Hold the stretch for a few seconds, then return your legs to the starting position.","Step:5 Repeat the stretch on the other side. Maintain deep form throughout.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/p5v6rdT.gif"}',
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
  'one leg squat - expanded variation',
  'cuC7529',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Extend one leg forward, keeping it off the ground.","Step:3 Bend your standing leg and lower your body down as if sitting back into a chair.","Step:4 Keep your chest up and your back straight.","Step:5 Push through your heel to return to the starting position.","Step:6 Repeat with the other leg. Maintain expanded form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cuC7529.gif"}',
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
  'fierce style forward lunge (male)',
  'iqH55N8',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet hip-width apart and hands on your hips.","Step:2 Take a big step forward with your right foot, lowering your body into a lunge position.","Step:3 Bend your right knee to about 90 degrees, keeping your knee aligned with your ankle.","Step:4 Push off with your right foot and return to the starting position.","Step:5 (fierce variation) Repeat with your left leg, alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iqH55N8.gif"}',
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
  'micro style barbell speed squat',
  'qFHvMnv',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you lower your hips back and down, as if sitting into a chair.","Step:4 (micro variation) Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Drive through your heels to stand back up, squeezing your glutes at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qFHvMnv.gif"}',
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
  'barbell high bar squat core',
  'KenZJQV',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Place the barbell on your upper back, resting it on your traps.","Step:3 Engage your core and keep your chest up as you begin to squat down, pushing your hips back and bending your knees. Perform with core intensity.","Step:4 Lower yourself until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Drive through your heels to stand back up, extending your hips and knees.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KenZJQV.gif"}',
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
  'sharp style dumbbell sumo pull through',
  'LFIOery',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointed outwards.","Step:2 Hold a dumbbell with both hands in front of your body, arms extended.","Step:3 Bend your knees and lower your hips down into a squat position, keeping your back straight. Focus on sharp movement.","Step:4 Lower the dumbbell down between your legs, keeping your arms straight.","Step:5 Drive through your heels and extend your hips forward, pulling the dumbbell up and in front of your body.","Step:6 Squeeze your glutes at the top of the movement, then lower the dumbbell back down between your legs.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LFIOery.gif"}',
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
  'sled 45в° leg wide press - blunt variation',
  'p0OCXGb',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a 45-degree angle.","Step:2 Sit on the sled machine with your back against the pad and your feet on the foot platform.","Step:3 Position your feet wider than shoulder-width apart.","Step:4 Push against the foot platform to extend your legs and straighten your knees.","Step:5 Pause for a moment at the end of the movement, then slowly bend your knees to return to the starting position. Maintain blunt form throughout.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/p0OCXGb.gif"}',
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
  'dumbbell lunge with firm',
  'Uywa4S5',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 Keep your back straight and your chest up as you lower your body. Maintain firm form throughout.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat with your left leg.","Step:6 Alternate legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Uywa4S5.gif"}',
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
  'traditional barbell romanian deadlift',
  'o6LqKKP',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing forward.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend at the hips, keeping your back straight and your knees slightly bent.","Step:4 Lower the barbell towards the ground, keeping it close to your body.","Step:5 Feel the stretch in your hamstrings as you lower the barbell.","Step:6 Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.","Step:7 Squeeze your glutes at the top of the movement.","Step:8 Lower the barbell back down to the starting position and repeat for the desired number of repetitions. Focus on traditional movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o6LqKKP.gif"}',
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
  'exercise ball one leg prone lower body rotation fierce',
  'kKYTkjJ',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Lie face down on the stability ball with your hips resting on the ball and your legs extended straight behind you.","Step:2 Place your hands on the ground in front of you for support.","Step:3 Engage your glutes and core muscles to stabilize your body.","Step:4 Slowly lift one leg off the ground, keeping it straight and parallel to the floor.","Step:5 Rotate your leg outward, away from your body, while keeping your hips and upper body stable.","Step:6 Pause for a moment at the end of the rotation, then slowly return your leg to the starting position.","Step:7 Repeat the rotation with the other leg. Focus on fierce movement.","Step:8 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kKYTkjJ.gif"}',
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
  'dumbbell finger curls',
  'mtXengz',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"wrist flexors","wrist extensors"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with an underhand grip, resting your forearm on your thigh, palm facing up.","Step:3 Allow the dumbbell to roll down to your fingertips, then curl it back up by flexing your fingers.","Step:4 Repeat for the desired number of repetitions, then switch to the other hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mtXengz.gif"}',
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
  'barbell wrist curl',
  '82LxxkW',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your forearms resting on your thighs, holding a barbell with an underhand grip.","Step:2 Allow the barbell to roll down to your fingertips, keeping your wrists straight.","Step:3 Slowly curl the barbell up towards your forearms by flexing your wrists.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/82LxxkW.gif"}',
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
  'dumbbell lying pronation on floor',
  '7RWNjiB',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Lie flat on the floor with your face down and your arms extended straight out in front of you, holding a dumbbell in each hand.","Step:2 Rotate your palms so they are facing down towards the floor.","Step:3 Keeping your arms straight, lift the dumbbells off the floor by contracting your forearms.","Step:4 Continue lifting until your forearms are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold for a moment, then slowly lower the dumbbells back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7RWNjiB.gif"}',
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
  'band reverse wrist curl',
  'Ezpnw9d',
  'intermediate',
  'band',
  '{"forearms"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground.","Step:2 Hold the band with an overhand grip, palms facing down, and wrap it around your fingers.","Step:3 Rest your forearms on your thighs, with your wrists hanging off the edge.","Step:4 Slowly curl your wrists upward, squeezing your forearms.","Step:5 Pause for a moment at the top, then slowly lower your wrists back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ezpnw9d.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;