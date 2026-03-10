INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'arms apart circular toe touch (male)',
  'RtyAsy1',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and arms extended to the sides.","Step:2 Keeping your legs straight, bend forward at the waist and reach down towards your toes with your right hand.","Step:3 As you reach down, simultaneously lift your left leg straight up behind you, maintaining balance.","Step:4 Return to the starting position and repeat the movement with your left hand reaching towards your toes and your right leg lifting up behind you.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RtyAsy1.gif"}',
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
  'dumbbell straight leg deadlift',
  'oom75KC',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing your torso to lean forward.","Step:3 Continue lowering the dumbbells until you feel a stretch in your hamstrings, keeping your knees slightly bent.","Step:4 Pause for a moment at the bottom, then engage your glutes and hamstrings to lift your torso back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oom75KC.gif"}',
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
  'dumbbell single leg deadlift with stepbox support',
  'daBmy1Y',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet hip-width apart, holding a dumbbell in your right hand.","Step:2 Place your left foot on a stepbox or elevated surface behind you.","Step:3 Keeping your back straight and core engaged, hinge forward at the hips, lowering the dumbbell towards the ground.","Step:4 As you lower the dumbbell, simultaneously lift your left leg behind you, maintaining a straight line from head to heel.","Step:5 Lower the dumbbell until you feel a stretch in your right hamstring, then return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/daBmy1Y.gif"}',
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
  'band step-up',
  'd5bTEPV',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Place a band around your thighs, just above your knees.","Step:2 Stand facing a step or platform with your feet hip-width apart.","Step:3 Step up onto the platform with your right foot, pushing through your heel.","Step:4 Extend your left leg behind you, keeping it straight.","Step:5 Lower your left foot back down to the ground.","Step:6 Repeat with your left foot stepping up onto the platform.","Step:7 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/d5bTEPV.gif"}',
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
  'dumbbell single leg deadlift',
  'gKozT8X',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet hip-width apart, holding a dumbbell in your right hand.","Step:2 Shift your weight onto your left leg and lift your right foot slightly off the ground.","Step:3 Keeping your back straight, hinge forward at the hips and lower the dumbbell towards the ground.","Step:4 At the same time, extend your right leg straight behind you, maintaining a slight bend in your left knee.","Step:5 Lower the dumbbell until your torso and right leg are parallel to the ground.","Step:6 Pause for a moment, then engage your glutes and hamstrings to return to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gKozT8X.gif"}',
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
  'reverse hyper extension (on stability ball)',
  'vM5YS2g',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Lie face down on a stability ball with your hips resting on the ball and your legs extended straight behind you.","Step:2 Place your hands on the ground in front of you for stability.","Step:3 Engaging your glutes and hamstrings, lift your legs up towards the ceiling as high as you can.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vM5YS2g.gif"}',
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
  'barbell stiff leg good morning',
  'JrOHAZc',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Hold the barbell across your upper back, resting it on your traps.","Step:3 Keeping your back straight, hinge forward at the hips, pushing your glutes back.","Step:4 Lower your torso until it is parallel to the ground, feeling a stretch in your hamstrings.","Step:5 Engage your glutes and hamstrings to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JrOHAZc.gif"}',
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
  'barbell romanian deadlift',
  'wQ2c4XD',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing forward.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend at the hips, keeping your back straight and your knees slightly bent.","Step:4 Lower the barbell towards the ground, keeping it close to your body.","Step:5 Feel the stretch in your hamstrings as you lower the barbell.","Step:6 Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.","Step:7 Squeeze your glutes at the top of the movement.","Step:8 Lower the barbell back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wQ2c4XD.gif"}',
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
  'kettlebell turkish get up (squat style)',
  'Ha7SZ3y',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","core"}',
  '{"Step:1 Start by lying on your back with your legs extended and the kettlebell held in your right hand, arm fully extended above your shoulder.","Step:2 Bend your right knee and place your right foot flat on the ground, keeping your left leg extended.","Step:3 Pressing through your right foot, lift your hips off the ground, coming into a bridge position.","Step:4 Slide your left leg underneath your body, bending your left knee and placing your left foot flat on the ground.","Step:5 Rotate your torso to the left, bringing your left hand to the ground for support.","Step:6 Pressing through your right foot and left hand, lift your torso off the ground, coming into a kneeling position.","Step:7 From the kneeling position, stand up, keeping the kettlebell extended overhead.","Step:8 Reverse the movement to return to the starting position.","Step:9 Repeat the exercise on the other side, starting with the kettlebell in your left hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ha7SZ3y.gif"}',
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
  'barbell high bar squat',
  'Gnfo4FM',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Place the barbell on your upper back, resting it on your traps.","Step:3 Engage your core and keep your chest up as you begin to squat down, pushing your hips back and bending your knees.","Step:4 Lower yourself until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Drive through your heels to stand back up, extending your hips and knees.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gnfo4FM.gif"}',
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
  'kettlebell front squat',
  'DB0n8AG',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the kettlebell with both hands in front of your chest, close to your body.","Step:3 Engage your core and keep your chest up as you lower your hips down and back, as if sitting into a chair.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Drive through your heels to stand back up, squeezing your glutes at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DB0n8AG.gif"}',
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
  'assisted lying glutes stretch',
  'yn0LjwL',
  'intermediate',
  'assisted',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Lie on your back with your legs extended.","Step:2 Bend your right knee and place your right ankle on your left thigh, just above the knee.","Step:3 Grasp your left thigh with both hands and gently pull it towards your chest.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Release and repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yn0LjwL.gif"}',
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
  'dumbbell deadlift',
  'nUwVh7b',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing forward.","Step:2 Hold a dumbbell in each hand, palms facing your body, arms extended downwards.","Step:3 Bend at your hips and knees, lowering the dumbbells towards the ground while keeping your back straight.","Step:4 Push through your heels and extend your hips and knees, lifting the dumbbells back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nUwVh7b.gif"}',
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
  'dumbbell one arm snatch',
  '6pTkI99',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Lower the dumbbell towards the ground, keeping it close to your body.","Step:4 Explosively extend your hips, knees, and ankles, driving the dumbbell upwards in a straight line.","Step:5 As the dumbbell reaches shoulder height, quickly rotate your hand and punch it overhead, fully extending your arm.","Step:6 Catch the dumbbell overhead with a slight bend in your knees and hips.","Step:7 Lower the dumbbell back down to the starting position in a controlled manner.","Step:8 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6pTkI99.gif"}',
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
  'sled 45в° leg wide press',
  'tj41Nu6',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a 45-degree angle.","Step:2 Sit on the sled machine with your back against the pad and your feet on the foot platform.","Step:3 Position your feet wider than shoulder-width apart.","Step:4 Push against the foot platform to extend your legs and straighten your knees.","Step:5 Pause for a moment at the end of the movement, then slowly bend your knees to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tj41Nu6.gif"}',
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
  'single leg bridge with outstretched leg',
  'rmEukuS',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Extend one leg straight out in front of you.","Step:3 Engage your glutes and lift your hips off the ground, forming a straight line from your knees to your shoulders.","Step:4 Hold for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rmEukuS.gif"}',
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
  'barbell sumo deadlift',
  'KgI0tqW',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","lower back"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing outwards.","Step:2 Place a barbell on the ground in front of you, centered between your feet.","Step:3 Bend your knees and lower your hips, keeping your back straight and chest up, to grip the barbell with an overhand grip.","Step:4 Engage your core and drive through your heels to lift the barbell off the ground, extending your hips and knees simultaneously.","Step:5 As you lift, keep your chest up and back straight, and push your hips forward to fully engage your glutes.","Step:6 Pause for a moment at the top, then slowly lower the barbell back down to the starting position, maintaining control throughout the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KgI0tqW.gif"}',
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
  'curtsey squat',
  'gUjqdei',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Take a step diagonally behind and across your body with your right foot, crossing it behind your left leg.","Step:3 Bend both knees as if you were curtsying, lowering your body towards the ground.","Step:4 Keep your torso upright and your weight on your front foot.","Step:5 Push through your front foot to return to the starting position.","Step:6 Repeat on the other side, stepping diagonally behind and across your body with your left foot."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gUjqdei.gif"}',
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
  'band hip lift',
  'E4R8Hz1',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place a resistance band just above your knees.","Step:3 Engage your glutes and core muscles.","Step:4 Press your heels into the ground and lift your hips off the floor, squeezing your glutes at the top.","Step:5 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/E4R8Hz1.gif"}',
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
  'resistance band hip thrusts on knees (female)',
  'Pjbc0Kt',
  'intermediate',
  'resistance band',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Start by kneeling on the ground with your knees hip-width apart and your feet flexed.","Step:2 Wrap the resistance band around your thighs, just above your knees.","Step:3 Place your hands on your hips or extend them out in front of you for balance.","Step:4 Engage your glutes and core muscles.","Step:5 Push your hips forward and squeeze your glutes as you lift your knees off the ground, extending your hips until your thighs are parallel to the ground.","Step:6 Hold the position for a moment, then slowly lower your knees back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Pjbc0Kt.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;