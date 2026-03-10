INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith reverse grip bent over row',
  'aaxA3cm',
  'intermediate',
  'smith machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up the smith machine with the bar at hip height.","Step:2 Stand facing the bar with your feet shoulder-width apart.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:5 Pull the bar towards your lower chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower the bar back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aaxA3cm.gif"}',
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
  'smith one arm row',
  'Q4DSJPC',
  'intermediate',
  'smith machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the height of the smith machine bar to waist level.","Step:2 Stand facing the smith machine with your feet shoulder-width apart.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Grasp the bar with one hand using an overhand grip, with your palm facing down.","Step:5 Keep your elbow close to your body and pull the bar towards your waist, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly lower the bar back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Q4DSJPC.gif"}',
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
  'inverted row v. 2',
  'uX3sUBz',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a bar at waist height on a Smith machine or use a suspension trainer.","Step:2 Stand facing the bar or suspension trainer and grab it with an overhand grip, hands shoulder-width apart.","Step:3 Walk your feet forward, leaning back until your body is at a slight angle.","Step:4 Keep your body straight and pull your chest up towards the bar or handles, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uX3sUBz.gif"}',
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
  'lever t bar row',
  'aaXr7ld',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footplate position to ensure proper alignment.","Step:2 Sit on the machine with your chest against the pad and your feet flat on the footplate.","Step:3 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Keep your back straight and engage your core.","Step:5 Pull the handles towards your torso, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak contraction, then slowly release the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aaXr7ld.gif"}',
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
  'dumbbell palm rotational bent over row',
  'wt6rwjk',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Bend forward at the hips, keeping your back straight and your knees slightly bent.","Step:3 Let your arms hang straight down, palms facing your body.","Step:4 Engage your core and pull the dumbbells up towards your chest, keeping your elbows close to your body.","Step:5 As you pull the dumbbells up, rotate your palms so they face away from your body.","Step:6 Squeeze your shoulder blades together at the top of the movement.","Step:7 Slowly lower the dumbbells back down to the starting position, rotating your palms back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wt6rwjk.gif"}',
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
  'lever reverse t-bar row',
  'BgljGjd',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footplate position on the leverage machine.","Step:2 Sit on the machine with your chest against the pad and your feet flat on the footplate.","Step:3 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Keep your back straight and engage your core.","Step:5 Pull the handles towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly release and extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BgljGjd.gif"}',
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
  'lever high row',
  'nZZZy9m',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","rear deltoids"}',
  '{"Step:1 Adjust the seat height and foot platform to a comfortable position.","Step:2 Sit on the machine with your chest against the pad and your feet flat on the foot platform.","Step:3 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Keep your back straight and engage your core.","Step:5 Pull the handles towards your body, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nZZZy9m.gif"}',
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
  'bodyweight standing close-grip one arm row',
  'v2DfH14',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in one hand with a neutral grip.","Step:2 Bend forward at the hips, keeping your back straight and your core engaged.","Step:3 Pull the dumbbell up towards your chest, keeping your elbow close to your body and squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v2DfH14.gif"}',
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
  'cable floor seated wide-grip row',
  'veXwo0D',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the floor with your legs extended and your back straight.","Step:2 Attach a cable handle to a low pulley and position the cable machine behind you.","Step:3 Grasp the handle with a wide overhand grip, palms facing down.","Step:4 Lean back slightly, keeping your back straight and your chest lifted.","Step:5 Pull the handle towards your waist, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly release the handle back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/veXwo0D.gif"}',
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
  'cable seated row',
  'fUBheHs',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the handles with an overhand grip, keeping your back straight and your shoulders relaxed.","Step:3 Pull the handles towards your body, squeezing your shoulder blades together.","Step:4 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fUBheHs.gif"}',
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
  'cable standing row (v-bar)',
  '4f8RXP8',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Grasp the v-bar attachment with an overhand grip, palms facing down.","Step:3 Keep your back straight and your core engaged.","Step:4 Pull the v-bar towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4f8RXP8.gif"}',
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
  'cable seated one arm alternate row',
  'vpp9Ku2',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on a bench facing a cable machine with your feet flat on the ground and knees slightly bent.","Step:2 Grasp the handle with one hand and keep your arm fully extended in front of you.","Step:3 Pull the handle towards your body, retracting your shoulder blade and keeping your elbow close to your side.","Step:4 Pause for a moment at the top of the movement, squeezing your back muscles.","Step:5 Slowly release the handle back to the starting position.","Step:6 Repeat with the other arm.","Step:7 Alternate between arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vpp9Ku2.gif"}',
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
  'bodyweight standing close-grip row',
  'tig3PXb',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Bend forward at the waist, keeping your back straight and your core engaged.","Step:3 Extend your arms straight in front of you, gripping the bar or handles with a close grip.","Step:4 Pull the bar or handles towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top of the movement, then slowly release and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tig3PXb.gif"}',
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
  'back lever',
  'GaSzzuh',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms","core"}',
  '{"Step:1 Start by hanging from a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Engage your core and pull your shoulder blades down and back.","Step:3 Bend your knees and tuck them towards your chest.","Step:4 Slowly lift your legs up, keeping them straight, until your body is parallel to the ground.","Step:5 Hold this position for a few seconds, then slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GaSzzuh.gif"}',
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
  'cable upper row',
  'PQStVXH',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Attach a straight bar to a cable machine at chest height.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:4 Keep your back straight and your core engaged.","Step:5 Pull the bar towards your upper chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement.","Step:7 Slowly release the bar back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PQStVXH.gif"}',
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
  'cable seated wide-grip row',
  'qcY50ZD',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the handle with a wide overhand grip, palms facing down.","Step:3 Keep your back straight and lean slightly forward from the hips.","Step:4 Pull the handle towards your lower chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the contraction.","Step:6 Slowly release the handle back to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qcY50ZD.gif"}',
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
  'upper back stretch',
  'GSDioYu',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"shoulders"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart.","Step:2 Extend your arms straight in front of you, parallel to the ground.","Step:3 Interlace your fingers and rotate your palms away from your body.","Step:4 Slowly raise your arms overhead, keeping them straight and parallel to each other.","Step:5 As you raise your arms, squeeze your shoulder blades together.","Step:6 Hold the stretch for 15-30 seconds, then release and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GSDioYu.gif"}',
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
  'cable rope extension incline bench row',
  'MgKwAAo',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle and attach a cable machine to the low pulley.","Step:2 Attach a rope handle to the cable machine and sit on the incline bench facing the machine.","Step:3 Grab the rope handle with an overhand grip and lean forward, keeping your back straight.","Step:4 Extend your arms fully, pulling the rope towards your upper chest while keeping your elbows close to your body.","Step:5 Squeeze your shoulder blades together at the end of the movement.","Step:6 Slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MgKwAAo.gif"}',
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
  'bodyweight standing one arm row (with towel)',
  'O4oIqQD',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a towel with one hand.","Step:2 Bend forward at the hips, keeping your back straight and your core engaged.","Step:3 Pull the towel towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower the towel back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O4oIqQD.gif"}',
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
  'dumbbell reverse grip incline bench one arm row',
  'ZIViNh1',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Place a dumbbell on the floor next to the bench.","Step:3 Stand facing the bench with your feet shoulder-width apart.","Step:4 Bend at the waist and place your left knee and left hand on the bench for support.","Step:5 Pick up the dumbbell with your right hand using a reverse grip (palm facing down).","Step:6 Keep your back straight and your core engaged.","Step:7 Pull the dumbbell up towards your chest, keeping your elbow close to your body.","Step:8 Squeeze your back muscles at the top of the movement.","Step:9 Lower the dumbbell back down to the starting position in a controlled manner.","Step:10 Repeat for the desired number of repetitions.","Step:11 Switch sides and repeat the exercise with your left arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZIViNh1.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;