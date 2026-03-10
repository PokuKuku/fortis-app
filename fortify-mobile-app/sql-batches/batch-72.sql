INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'weighted side bend (on stability ball)',
  '6bOA1Oi',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on a stability ball with your feet shoulder-width apart and flat on the ground.","Step:2 Hold a weight in one hand and place your other hand on your hip.","Step:3 Engage your core and slowly bend sideways towards the weighted side, keeping your back straight.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6bOA1Oi.gif"}',
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
  'barbell rollerout',
  '7M66AVi',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"lower back"}',
  '{"Step:1 Kneel on the floor and hold a barbell with both hands, shoulder-width apart.","Step:2 Roll the barbell forward, extending your arms and keeping your core engaged.","Step:3 Continue rolling forward until your body is fully extended and your arms are overhead.","Step:4 Pause for a moment, then slowly roll the barbell back towards your knees, maintaining control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7M66AVi.gif"}',
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
  'push-up to side plank',
  'KhHJ338',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest","triceps"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your body in a straight line.","Step:2 Lower your body towards the ground by bending your elbows, keeping your core engaged.","Step:3 Push back up to the starting position.","Step:4 Shift your weight onto your left hand and rotate your body to the right, lifting your right arm towards the ceiling.","Step:5 Hold the side plank position for a few seconds, then return to the starting position.","Step:6 Repeat the push-up and side plank on the opposite side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KhHJ338.gif"}',
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
  'weighted hanging leg-hip raise',
  'QOA0FD0',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up in front of you, keeping them straight.","Step:3 Continue lifting until your legs are parallel to the ground or slightly higher.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QOA0FD0.gif"}',
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
  'decline crunch',
  '9Ap7miY',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your knees bent at a 90-degree angle.","Step:2 Place your hands behind your head or across your chest.","Step:3 Engage your abs and lift your upper body towards your knees, curling your torso.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9Ap7miY.gif"}',
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
  'oblique crunches floor',
  'QUDd8WS',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the floor.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your abs and lift your shoulder blades off the floor, rotating your torso to one side.","Step:4 Pause for a moment, then lower your shoulder blades back down to the floor.","Step:5 Repeat on the other side, alternating sides with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QUDd8WS.gif"}',
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
  'barbell side bent v. 2',
  'i4JkUaL',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with both hands, palms facing down.","Step:2 Keep your back straight and core engaged throughout the exercise.","Step:3 Slowly bend your torso to the right side, lowering the barbell towards your right knee.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat the movement on the left side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/i4JkUaL.gif"}',
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
  'hanging straight leg hip raise',
  'pj0X0tF',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up in front of you until they are parallel to the ground.","Step:3 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pj0X0tF.gif"}',
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
  'lying leg raise flat bench',
  'WhuFnR7',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on a flat bench with your back pressed against it.","Step:2 Place your hands under your glutes for support.","Step:3 Keep your legs straight and together, and lift them up towards the ceiling.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WhuFnR7.gif"}',
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
  'barbell sitted alternate leg raise',
  'G7xoEzr',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on a bench with your back straight and hold a barbell across your thighs.","Step:2 Keeping your legs straight, lift one leg up as high as possible while keeping the other leg on the ground.","Step:3 Lower the raised leg back down and repeat with the other leg.","Step:4 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G7xoEzr.gif"}',
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
  'half sit-up (male)',
  'iQ241UP',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iQ241UP.gif"}',
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
  'hanging leg hip raise',
  'VEcJRo2',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up by flexing your hips and knees until your thighs are parallel to the ground.","Step:3 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VEcJRo2.gif"}',
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
  'shoulder tap',
  'yRpV5TC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line.","Step:2 Engage your core and lift your right hand off the ground, reaching across to tap your left shoulder.","Step:3 Place your right hand back on the ground and repeat with your left hand tapping your right shoulder.","Step:4 Continue alternating shoulder taps while keeping your hips and torso stable.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yRpV5TC.gif"}',
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
  'negative crunch',
  'szIn2UK',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/szIn2UK.gif"}',
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
  '3/4 sit-up',
  '2gPfomN',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2gPfomN.gif"}',
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
  'flexion leg sit up (straight arm)',
  'KZn52RC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","quadriceps"}',
  '{"Step:1 Lie flat on your back with your legs extended and arms straight above your head.","Step:2 Engaging your abs, lift your upper body off the ground while simultaneously lifting your legs towards your chest.","Step:3 Reach your hands towards your toes as you lift your upper body and legs.","Step:4 Pause for a moment at the top, then slowly lower your upper body and legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KZn52RC.gif"}',
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
  'weighted russian twist',
  'fZFZ704',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on the ground with your knees bent and your feet flat on the floor.","Step:2 Hold a weight or medicine ball with both hands in front of your chest.","Step:3 Lean back slightly, keeping your back straight and your core engaged.","Step:4 Slowly twist your torso to the right, bringing the weight or medicine ball towards the floor on your right side.","Step:5 Pause for a moment, then twist your torso to the left, bringing the weight or medicine ball towards the floor on your left side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fZFZ704.gif"}',
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
  'arm slingers hanging straight legs',
  'PXTIwgu',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","back"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your legs straight down.","Step:2 Engage your core and lift your legs up in front of you until they are parallel to the ground.","Step:3 Hold for a moment at the top, then slowly lower your legs back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PXTIwgu.gif"}',
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
  'barbell standing twist',
  'yQe5HpE',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell in front of your chest with both hands, palms facing down.","Step:2 Engage your core and keep your back straight throughout the exercise.","Step:3 Slowly twist your torso to the right, pivoting on your feet and hips, while keeping your lower body stable.","Step:4 Pause for a moment at the end of the twist, then slowly return to the starting position.","Step:5 Repeat the twist to the left side.","Step:6 Continue alternating twists for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yQe5HpE.gif"}',
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
  'lever kneeling twist',
  'sZOR9EV',
  'intermediate',
  'leverage machine',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your knees resting on the pads and your upper body facing forward.","Step:2 Grasp the handles or the sides of the machine for stability.","Step:3 Keeping your core engaged, twist your torso to one side as far as comfortably possible.","Step:4 Pause for a moment, then slowly return to the starting position.","Step:5 Repeat the twist to the opposite side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sZOR9EV.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;