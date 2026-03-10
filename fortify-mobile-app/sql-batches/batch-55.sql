INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell seated one leg calf raise - hammer grip',
  'FxhcxUW',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and a dumbbell resting on your thighs.","Step:2 Place one foot on a raised surface, such as a step or block, with your heel hanging off the edge.","Step:3 Hold the dumbbell with a hammer grip, meaning your palms are facing each other and your fingers are wrapped around the handle.","Step:4 Keeping your core engaged and your back straight, slowly raise your heel as high as possible by pushing through the ball of your foot.","Step:5 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FxhcxUW.gif"}',
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
  'sled one leg calf press on leg press',
  'u0pLNgz',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the seat of the leg press machine so that your knees are slightly bent when your feet are on the sled.","Step:2 Sit on the machine with your back against the backrest and your feet on the sled, shoulder-width apart.","Step:3 Place your toes and the balls of your feet on the sled, keeping your heels off.","Step:4 Push the sled forward by extending your ankles, keeping your knees slightly bent.","Step:5 Pause for a moment at the top, then slowly lower the sled back down by flexing your ankles.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u0pLNgz.gif"}',
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
  'calf stretch with rope',
  '1LVFcEn',
  'intermediate',
  'rope',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Stand facing a wall or sturdy object with your feet hip-width apart.","Step:2 Hold the ends of the rope in each hand and place the middle of the rope around the ball of your right foot.","Step:3 Step back with your left foot, keeping your heel on the ground and your leg straight.","Step:4 Lean forward, keeping your back straight, and gently pull on the rope to stretch your calf.","Step:5 Hold the stretch for 20-30 seconds, then release.","Step:6 Repeat on the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1LVFcEn.gif"}',
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
  'exercise ball on the wall calf raise (tennis ball between knees)',
  'j74M6Zn',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"quadriceps","hamstrings"}',
  '{"Step:1 Stand with your back against a wall and place an exercise ball between your lower back and the wall.","Step:2 Position your feet shoulder-width apart and slightly in front of you.","Step:3 Hold a dumbbell in each hand, with your arms extended by your sides.","Step:4 Place a tennis ball between your knees.","Step:5 Raise your heels off the ground, lifting your body up onto your toes.","Step:6 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/j74M6Zn.gif"}',
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
  'standing calf raise (on a staircase)',
  '6HmFgmx',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand on the edge of a step or a sturdy platform with your heels hanging off and your toes on the step.","Step:2 Hold onto a railing or wall for balance if needed.","Step:3 Slowly raise your heels as high as possible, lifting your body weight onto the balls of your feet.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6HmFgmx.gif"}',
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
  'posterior tibialis stretch',
  'DEEqoI2',
  'intermediate',
  'rope',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Loop the rope around the ball of your foot and hold the ends of the rope with your hands.","Step:3 Gently pull the rope towards you, flexing your foot and stretching your calf muscles.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Release the tension on the rope and relax your foot.","Step:6 Repeat the stretch on the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DEEqoI2.gif"}',
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
  'hack calf raise',
  '2ORFMoR',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the sled machine to a comfortable weight.","Step:2 Stand on the sled machine with your toes on the platform and your heels hanging off.","Step:3 Hold onto the handles for stability.","Step:4 Raise your heels as high as possible by pushing through the balls of your feet.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2ORFMoR.gif"}',
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
  'dumbbell single leg calf raise',
  '1kB3Wmk',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"ankles"}',
  '{"Step:1 Stand on the edge of a step or platform with your heels hanging off and your toes on the step.","Step:2 Hold a dumbbell in one hand and place your other hand on a wall or railing for support.","Step:3 Raise your heel as high as possible, lifting your body up onto your toes.","Step:4 Pause for a moment at the top, then slowly lower your heel back down below the step.","Step:5 Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1kB3Wmk.gif"}',
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
  'band single leg reverse calf raise',
  'QsSQWbf',
  'intermediate',
  'band',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet hip-width apart and place the band around the ball of your foot.","Step:2 Hold onto a stable object for balance.","Step:3 Slowly raise your heel off the ground, lifting your body weight onto the ball of your foot.","Step:4 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QsSQWbf.gif"}',
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
  'lever seated calf raise',
  'bOOdeyc',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"soleus","ankle stabilizers"}',
  '{"Step:1 Adjust the seat height so that your knees are slightly bent and your feet are flat on the footplate.","Step:2 Place your toes on the footplate with your heels hanging off the edge.","Step:3 Grasp the handles or the sides of the seat for stability.","Step:4 Push through the balls of your feet to raise your heels as high as possible.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bOOdeyc.gif"}',
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
  'barbell standing leg calf raise',
  'rGwhJ5o',
  'intermediate',
  'barbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place a barbell across your upper back.","Step:2 Raise your heels off the ground as high as possible, using your calves.","Step:3 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rGwhJ5o.gif"}',
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
  'cable standing calf raise',
  'yl2IYyy',
  'intermediate',
  'cable',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Hold onto the cable machine handles or attach a cable ankle strap to your ankles.","Step:3 Raise your heels off the ground by extending your ankles as high as possible.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yl2IYyy.gif"}',
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
  'sled lying calf press',
  'g376LuL',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the sled machine to a comfortable weight.","Step:2 Sit on the sled machine with your back against the pad and your feet on the platform.","Step:3 Place your toes and the balls of your feet on the edge of the platform, with your heels hanging off.","Step:4 Push the platform away from you by extending your ankles, keeping your knees slightly bent.","Step:5 Continue pushing until your calves are fully contracted.","Step:6 Hold the contraction for a moment, then slowly lower the platform back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/g376LuL.gif"}',
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
  'exercise ball on the wall calf raise (tennis ball between ankles)',
  'FY3UdNT',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Stand facing a wall with your feet shoulder-width apart.","Step:2 Place an exercise ball between the wall and your lower back.","Step:3 Hold a dumbbell in each hand, with your arms extended by your sides.","Step:4 Place a tennis ball between your ankles.","Step:5 Raise your heels off the ground, lifting your body up onto your toes.","Step:6 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FY3UdNT.gif"}',
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
  'exercise ball on the wall calf raise',
  'xo6sENf',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Stand with your back against a wall and place an exercise ball between your lower back and the wall.","Step:2 Position your feet shoulder-width apart, with your toes pointing forward.","Step:3 Hold a dumbbell in each hand, with your arms extended by your sides.","Step:4 Raise your heels off the ground, lifting your body weight onto the balls of your feet.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xo6sENf.gif"}',
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
  'calf stretch with hands against wall',
  'm0tCHqc',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Stand facing a wall with your feet hip-width apart.","Step:2 Place your hands against the wall at shoulder height.","Step:3 Step your right foot back, keeping your heel on the ground and your leg straight.","Step:4 Bend your left knee and lean forward, keeping your back leg straight and your heel on the ground.","Step:5 Hold the stretch for 20-30 seconds.","Step:6 Switch legs and repeat the stretch."}',
  'strength',
  '{"https://static.exercisedb.dev/media/m0tCHqc.gif"}',
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
  'donkey calf raise',
  'u5ESqzH',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your toes on an elevated surface, such as a step or block.","Step:2 Place your hands on a stable support, such as a wall or railing, for balance.","Step:3 Raise your heels as high as possible, lifting your body weight onto the balls of your feet.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u5ESqzH.gif"}',
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
  'smith reverse calf raises',
  'Lsqrgh4',
  'intermediate',
  'smith machine',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Adjust the smith machine bar to a height just below your shoulders.","Step:2 Stand facing the bar with your feet hip-width apart and toes pointing forward.","Step:3 Place the balls of your feet on the edge of a step or platform, with your heels hanging off.","Step:4 Hold onto the bar for support.","Step:5 Raise your heels as high as possible, lifting your body up onto your toes.","Step:6 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Lsqrgh4.gif"}',
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
  'single leg calf raise (on a dumbbell)',
  'fKZgDEO',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet hip-width apart and hold a dumbbell in one hand.","Step:2 Lift one foot off the ground and balance on the other foot.","Step:3 Slowly raise your heel as high as possible, using your calf muscles.","Step:4 Pause for a moment at the top, then slowly lower your heel back down.","Step:5 Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fKZgDEO.gif"}',
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
  'dumbbell seated calf raise',
  'r29jP7S',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and a dumbbell resting on your thighs.","Step:2 Place the balls of your feet on a raised surface such as a step or block, with your heels hanging off the edge.","Step:3 Hold onto the dumbbell for stability.","Step:4 Raise your heels as high as possible, lifting your body weight onto the balls of your feet.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/r29jP7S.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;