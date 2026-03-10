INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'walking high knees lunge',
  'J9zIWig',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","glutes","calves"}',
  '{"Step:1 Stand with your feet hip-width apart.","Step:2 Lift your right knee up towards your chest as high as you can while balancing on your left leg.","Step:3 Step forward with your right foot and lower your body into a lunge position, bending both knees to a 90-degree angle.","Step:4 Push off with your right foot and bring your left knee up towards your chest.","Step:5 Step forward with your left foot and lower your body into a lunge position.","Step:6 Continue alternating legs and lunging forward, keeping your core engaged and maintaining a steady pace.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/J9zIWig.gif"}',
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
  'half knee bends (male) with blunt',
  'v6EKk0O',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Bend your knees and lower your body down as if you were sitting back into a chair. Emphasize blunt control.","Step:3 Keep your chest up and your weight in your heels.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v6EKk0O.gif"}',
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
  'alternating bear crawl',
  'gTGciXz',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"core","shoulders","triceps"}',
  '{"Step:1 Start on all fours with your hands directly under your shoulders and your knees directly under your hips.","Step:2 Lift your knees slightly off the ground, keeping your back flat and your core engaged.","Step:3 Move your right hand and left foot forward simultaneously, followed by your left hand and right foot.","Step:4 Continue crawling forward, alternating your hand and foot movements.","Step:5 Maintain a steady pace and keep your core tight throughout the exercise.","Step:6 (alternating variation) Continue for the desired distance or time."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gTGciXz.gif"}',
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
  'pulse style walk elliptical cross trainer',
  'PCUYOMs',
  'intermediate',
  'elliptical machine',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","glutes","calves"}',
  '{"Step:1 Adjust the resistance level and incline of the elliptical machine to your desired settings.","Step:2 Step onto the pedals of the machine and grip the handles lightly.","Step:3 Begin by pushing down with your feet and pulling the handles towards your body.","Step:4 Continue this motion, alternating between pushing and pulling, to simulate a walking or running motion.","Step:5 Maintain a steady pace and keep your core engaged throughout the exercise. Emphasize pulse control.","Step:6 Continue for the desired duration of your cardio workout.","Step:7 Gradually decrease the intensity and speed of the machine before stepping off."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PCUYOMs.gif"}',
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
  'walk elliptical cross trainer - expanded variation',
  'pFuK3by',
  'intermediate',
  'elliptical machine',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","glutes","calves"}',
  '{"Step:1 Adjust the resistance level and incline of the elliptical machine to your desired settings.","Step:2 Step onto the pedals of the machine and grip the handles lightly.","Step:3 Begin by pushing down with your feet and pulling the handles towards your body.","Step:4 Continue this motion, alternating between pushing and pulling, to simulate a walking or running motion. Emphasize expanded control.","Step:5 Maintain a steady pace and keep your core engaged throughout the exercise.","Step:6 Continue for the desired duration of your cardio workout.","Step:7 Gradually decrease the intensity and speed of the machine before stepping off."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pFuK3by.gif"}',
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
  'lever rotary calf',
  'MrgP9L6',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"soleus","ankle stabilizers"}',
  '{"Step:1 Adjust the seat height so that your knees are slightly bent and your feet are flat on the footplate.","Step:2 Place your toes on the footplate, with your heels hanging off the edge.","Step:3 Grasp the handles or the sides of the machine for stability.","Step:4 Push through the balls of your feet, raising your heels as high as possible.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MrgP9L6.gif"}',
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
  'dumbbell seated one leg calf raise - palm up',
  'VW88JNd',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Sit on a bench or chair with your back straight and your feet flat on the ground.","Step:2 Hold a dumbbell in one hand and place it on top of your thigh, palm facing up.","Step:3 Lift one leg off the ground and extend it in front of you, keeping your knee slightly bent.","Step:4 Raise your heel as high as possible by pushing through the ball of your foot.","Step:5 Pause for a moment at the top, then slowly lower your heel back down.","Step:6 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VW88JNd.gif"}',
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
  'barbell standing rocking leg calf raise',
  '6HiHHe0',
  'intermediate',
  'barbell',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell across your upper back.","Step:2 Raise your heels off the ground as high as possible, balancing on the balls of your feet.","Step:3 Slowly lower your heels back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6HiHHe0.gif"}',
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
  'barbell seated calf raise',
  'ipvgBnC',
  'intermediate',
  'barbell',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on a bench with your feet flat on the floor and a barbell resting on your thighs.","Step:2 Place the balls of your feet on a raised platform, such as a block or step.","Step:3 Lower your heels as far as possible, feeling a stretch in your calves.","Step:4 Raise your heels as high as possible, contracting your calves.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ipvgBnC.gif"}',
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
  'seated calf stretch (male)',
  '17bqEXD',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on the edge of a chair or bench with your feet flat on the ground.","Step:2 Extend one leg straight out in front of you, keeping your heel on the ground.","Step:3 Lean forward slightly, feeling a stretch in your calf muscle.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Switch legs and repeat the stretch."}',
  'strength',
  '{"https://static.exercisedb.dev/media/17bqEXD.gif"}',
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
  'barbell standing calf raise',
  '8ozhUIZ',
  'intermediate',
  'barbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place a barbell across your upper back.","Step:2 Raise your heels off the ground as high as possible, using only your toes.","Step:3 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8ozhUIZ.gif"}',
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
  'barbell floor calf raise',
  '2IHEa2T',
  'intermediate',
  'barbell',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Place a barbell on the floor in front of you.","Step:2 Stand with the balls of your feet on the edge of the barbell, with your heels hanging off.","Step:3 Hold onto a stable object for balance if needed.","Step:4 Raise your heels as high as possible, using your calves to lift your body.","Step:5 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2IHEa2T.gif"}',
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
  'weighted donkey calf raise',
  'LmaFNZS',
  'intermediate',
  'weighted',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand on a raised platform with your toes on the edge and your heels hanging off.","Step:2 Hold onto a stable object for support.","Step:3 Raise your heels as high as possible by extending your ankles.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LmaFNZS.gif"}',
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
  'band two legs calf raise - (band under both legs) v. 2',
  'jl6uxZV',
  'intermediate',
  'band',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place a resistance band under both feet.","Step:2 Hold the ends of the band with your hands for stability.","Step:3 Raise your heels off the ground as high as possible, using your calves.","Step:4 Pause for a moment at the top, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jl6uxZV.gif"}',
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
  'hack one leg calf raise',
  'AxFoqAD',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the sled machine to an appropriate weight.","Step:2 Stand on the sled machine with one foot, keeping the other foot off the ground.","Step:3 Hold onto the handles for stability.","Step:4 Raise your heel as high as possible, lifting your body up on the ball of your foot.","Step:5 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:6 Repeat for the desired number of repetitions.","Step:7 Switch legs and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AxFoqAD.gif"}',
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
  'lever calf press',
  '7B4F5nZ',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Adjust the seat of the leverage machine so that your shoulders are aligned with the lever pad.","Step:2 Place your toes on the lever pad, with your heels hanging off the edge.","Step:3 Grasp the handles or side supports for stability.","Step:4 Push the lever pad down by extending your ankles, contracting your calf muscles.","Step:5 Pause for a moment at the bottom of the movement.","Step:6 Slowly return to the starting position by allowing your heels to rise back up.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7B4F5nZ.gif"}',
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
  'sled forward angled calf raise',
  'XDOiFns',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the sled machine to a comfortable weight and position yourself on the machine with your toes on the platform and your heels hanging off.","Step:2 Place your hands on the handles or the sides of the machine for support.","Step:3 Engage your calves and slowly raise your heels as high as possible, pushing against the resistance of the sled.","Step:4 Pause for a moment at the top of the movement, then slowly lower your heels back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XDOiFns.gif"}',
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
  'peroneals stretch',
  'XhfS1DZ',
  'intermediate',
  'rope',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Loop the rope around the ball of your foot and hold the ends of the rope with your hands.","Step:3 Gently pull the rope towards you, flexing your foot and stretching your calf muscles.","Step:4 Hold the stretch for 15-30 seconds.","Step:5 Release the tension on the rope and repeat the stretch on the other leg.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XhfS1DZ.gif"}',
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
  'sled calf press on leg press',
  'ykHcWme',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Adjust the seat of the leg press machine so that your knees are slightly bent when your feet are on the sled.","Step:2 Place your feet shoulder-width apart on the sled, with your toes pointing forward.","Step:3 Release the safety handles and push the sled away from you by extending your knees and ankles.","Step:4 Pause for a moment at the top of the movement, then slowly lower the sled back down by bending your knees and ankles.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ykHcWme.gif"}',
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
  'smith seated one leg calf raise',
  '0S75mYG',
  'intermediate',
  'smith machine',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on the machine with your back against the pad and your feet on the footrest.","Step:2 Place one leg on the footrest and keep the other leg off the footrest.","Step:3 Using your calf muscles, raise your heel as high as possible.","Step:4 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0S75mYG.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;