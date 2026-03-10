INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'lever seated squat calf raise on leg press machine',
  'IeDEXTe',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"quadriceps","hamstrings","glutes"}',
  '{"Step:1 Adjust the seat of the leg press machine so that your knees are slightly bent when your feet are on the footplate.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the footplate, shoulder-width apart.","Step:3 Place your toes and the balls of your feet on the footplate, keeping your heels off the edge.","Step:4 Release the safety handles and push the footplate away from you by extending your knees.","Step:5 Once your knees are fully extended, slowly lower your heels by flexing your calves.","Step:6 Pause for a moment at the bottom, then push the footplate back up by extending your calves.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IeDEXTe.gif"}',
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
  'dumbbell seated one leg calf raise',
  'Ia7tumC',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and a dumbbell resting on your right thigh.","Step:2 Extend your left leg straight out in front of you, keeping your foot flexed.","Step:3 Place the ball of your right foot on an elevated surface, such as a step or weight plate.","Step:4 Using your calf muscles, raise your right heel as high as possible.","Step:5 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ia7tumC.gif"}',
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
  'lever donkey calf raise',
  'C9LuR4A',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the leverage machine to the appropriate height for your body.","Step:2 Position yourself facing the machine, with your toes on the foot platform and your heels hanging off the edge.","Step:3 Place your hands on the handles or the support bars for stability.","Step:4 Engage your calves and lift your heels as high as possible, using the balls of your feet.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/C9LuR4A.gif"}',
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
  'calf push stretch with hands against wall',
  'PzNxakt',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Stand facing a wall with your feet hip-width apart.","Step:2 Place your hands against the wall at shoulder height.","Step:3 Step back with one foot, keeping your heel on the ground and your leg straight.","Step:4 Bend your front knee slightly and lean forward, feeling a stretch in your calf.","Step:5 Hold the stretch for 20-30 seconds.","Step:6 Switch legs and repeat the stretch."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PzNxakt.gif"}',
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
  'smith toe raise',
  'Y4QlY8z',
  'intermediate',
  'smith machine',
  '{"calves"}',
  '{"ankles","shins"}',
  '{"Step:1 Adjust the smith machine bar to a height that allows you to comfortably stand with your feet flat on the ground.","Step:2 Position yourself under the bar with your shoulders directly below it and your feet shoulder-width apart.","Step:3 Place the balls of your feet on a raised platform or weight plates, with your heels hanging off the edge.","Step:4 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:5 Engage your core and keep your back straight throughout the exercise.","Step:6 Slowly raise your heels as high as possible, lifting your body weight onto the balls of your feet.","Step:7 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y4QlY8z.gif"}',
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
  'standing calves calf stretch',
  'qOKcgVP',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand facing a wall or sturdy object, about an arm''s length away.","Step:2 Place your hands on the wall or object at shoulder height.","Step:3 Step back with one foot, keeping your heel flat on the ground.","Step:4 Bend your front knee slightly and lean forward, keeping your back leg straight.","Step:5 You should feel a stretch in your calf muscle.","Step:6 Hold the stretch for 20-30 seconds.","Step:7 Repeat on the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qOKcgVP.gif"}',
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
  'assisted lying calves stretch',
  'GxDwDX0',
  'intermediate',
  'assisted',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Lie on your back with your legs extended.","Step:2 Bend one knee and place your foot flat on the ground.","Step:3 Using your hands or a towel, gently pull your toes towards your body, feeling a stretch in your calf.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Release the stretch and repeat on the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GxDwDX0.gif"}',
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
  'one leg donkey calf raise',
  'A2upspL',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing forward.","Step:2 Place your hands on a stable surface for support, such as a wall or a bar.","Step:3 Lift one leg off the ground, keeping your knee slightly bent.","Step:4 Raise your heel as high as possible, using your calf muscles.","Step:5 Pause for a moment at the top, then slowly lower your heel back down.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/A2upspL.gif"}',
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
  'bodyweight standing calf raise',
  'bJYHBIN',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing forward.","Step:2 Place your hands on a wall or stable surface for balance.","Step:3 Slowly raise your heels off the ground, lifting your body weight onto the balls of your feet.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bJYHBIN.gif"}',
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
  'dumbbell standing calf raise',
  'dPmaUaU',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"ankles"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Raise your heels off the ground as high as possible, using your calves.","Step:3 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dPmaUaU.gif"}',
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
  'smith standing leg calf raise',
  '6MaEjVA',
  'intermediate',
  'smith machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the smith machine bar to a height that allows you to stand with your feet flat on the ground and your shoulders under the bar.","Step:2 Position yourself under the bar with your feet shoulder-width apart and your toes pointing forward.","Step:3 Place your hands on the bar for stability.","Step:4 Engage your calves and slowly raise your heels off the ground, lifting your body up onto your toes.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6MaEjVA.gif"}',
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
  'circles knee stretch',
  'X7jbxra',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your hands on your hips.","Step:2 Bend your knees slightly and lift your heels off the ground, balancing on the balls of your feet.","Step:3 Keeping your knees bent, rotate your knees in a circular motion, first clockwise and then counterclockwise.","Step:4 Perform the movement for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/X7jbxra.gif"}',
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
  'one leg floor calf raise',
  '0jp9Rlz',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet hip-width apart and place your hands on a wall or sturdy object for balance.","Step:2 Lift one foot off the ground and balance on the other foot.","Step:3 Slowly raise your heel off the ground, lifting your body up onto the ball of your foot.","Step:4 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0jp9Rlz.gif"}',
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
  'standing calves',
  'XIHEoCG',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing forward.","Step:2 Raise your heels off the ground as high as possible, standing on your toes.","Step:3 Hold the position for a moment, then slowly lower your heels back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XIHEoCG.gif"}',
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
  'smith one leg floor calf raise',
  '9GXrTE6',
  'intermediate',
  'smith machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Position yourself on the floor under the smith machine bar, facing away from the machine.","Step:2 Place the balls of your feet on a raised surface, such as a weight plate or block.","Step:3 Position the smith machine bar across your lower legs, just above your ankles.","Step:4 Hold onto the bar with your hands for stability.","Step:5 Raise your heels off the ground by extending your ankles, lifting your body up.","Step:6 Pause at the top of the movement, then slowly lower your heels back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9GXrTE6.gif"}',
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
  'sled 45в° calf press',
  'qCNVnaU',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Adjust the sled machine to a 45-degree angle.","Step:2 Place your feet on the sled platform with your toes pointing forward.","Step:3 Push the sled platform away from you by extending your ankles and calves.","Step:4 Pause for a moment at the top, then slowly lower the sled platform back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qCNVnaU.gif"}',
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
  'ankle circles',
  'uL9CsKm',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"ankle stabilizers"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Lift one leg off the ground and rotate your ankle in a circular motion.","Step:3 Perform the desired number of circles in one direction, then switch to the other direction.","Step:4 Repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uL9CsKm.gif"}',
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
  'box jump down with one leg stabilization',
  'iPm26QU',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"quadriceps","hamstrings","glutes"}',
  '{"Step:1 Stand in front of a box or platform with your feet shoulder-width apart.","Step:2 Bend your knees and jump onto the box, landing softly with one foot on the box and the other foot hanging off the edge.","Step:3 Stabilize yourself on the box with the foot that is on it, while keeping the other foot off the ground.","Step:4 Hold this position for a few seconds, engaging your calf muscles to maintain balance.","Step:5 Slowly step down with the foot that is on the box, returning to the starting position.","Step:6 Repeat the exercise with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iPm26QU.gif"}',
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
  'lever standing calf raise',
  'ykUOVze',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"soleus","ankle stabilizers"}',
  '{"Step:1 Adjust the machine to your height and stand with your feet shoulder-width apart.","Step:2 Place your shoulders under the pads and hold onto the handles for stability.","Step:3 Raise your heels as high as possible by extending your ankles.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ykUOVze.gif"}',
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
  'cable standing one leg calf raise',
  'fgc9Xdl',
  'intermediate',
  'cable',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Hold onto the cable machine for support.","Step:3 Lift one leg off the ground and balance on the other leg.","Step:4 Slowly raise your heel off the ground, lifting your body up onto your toes.","Step:5 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fgc9Xdl.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;