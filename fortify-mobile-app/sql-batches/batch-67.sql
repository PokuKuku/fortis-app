INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable side bend',
  'wPypxFY',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the cable handle with one hand.","Step:2 Keep your back straight and your core engaged.","Step:3 Slowly bend sideways at the waist, lowering the cable handle towards your knee.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat on the other side.","Step:6 Alternate sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wPypxFY.gif"}',
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
  'roller body saw',
  'XeMvLgE',
  'intermediate',
  'roller',
  '{"abs"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Start in a plank position with your forearms on the roller and your body in a straight line.","Step:2 Engage your core and slowly roll the roller forward, extending your body as far as you can while maintaining control.","Step:3 Pause for a moment at the furthest point, then slowly roll the roller back towards your starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XeMvLgE.gif"}',
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
  'jackknife sit-up',
  'mbkgB44',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms overhead.","Step:2 Engage your core and lift your legs and upper body simultaneously, reaching your hands towards your toes.","Step:3 Pause for a moment at the top, then slowly lower your legs and upper body back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mbkgB44.gif"}',
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
  'barbell standing ab rollerout',
  'xnInPfE',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"shoulders","lower back"}',
  '{"Step:1 Stand upright with your feet shoulder-width apart and hold the barbell with both hands in front of your thighs.","Step:2 Engage your core and slowly roll the barbell down towards the ground, keeping your back straight and your arms extended.","Step:3 Continue rolling the barbell forward until your body is fully extended and your hands are directly above your head.","Step:4 Pause for a moment, then slowly roll the barbell back towards your thighs, maintaining control and keeping your core engaged.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xnInPfE.gif"}',
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
  'weighted overhead crunch (on stability ball)',
  'xmM75XG',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a weight plate or dumbbell with both hands and extend your arms overhead.","Step:3 Engage your abs and slowly curl your torso forward, bringing your chest towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your torso back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xmM75XG.gif"}',
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
  'standing wheel rollerout',
  'KtRomty',
  'intermediate',
  'wheel roller',
  '{"abs"}',
  '{"lower back","shoulders"}',
  '{"Step:1 Start by standing tall with your feet shoulder-width apart and the wheel roller in front of you.","Step:2 Bend at your waist and slowly roll the wheel forward, keeping your back straight and your core engaged.","Step:3 Continue rolling forward until you feel a stretch in your abs and your body is extended as far as possible.","Step:4 Pause for a moment, then slowly roll the wheel back towards your body, returning to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KtRomty.gif"}',
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
  'band bicycle crunch',
  'tZkGYZ9',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors","obliques"}',
  '{"Step:1 Lie flat on your back with your hands behind your head and your knees bent.","Step:2 Lift your feet off the ground and bring your right knee towards your chest while simultaneously twisting your torso to bring your left elbow towards your right knee.","Step:3 Straighten your right leg while bringing your left knee towards your chest and twisting your torso to bring your right elbow towards your left knee.","Step:4 Continue alternating the twisting motion, as if you are pedaling a bicycle, while keeping your core engaged throughout the movement.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tZkGYZ9.gif"}',
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
  'potty squat',
  '75Bgtjy',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"quadriceps","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing slightly outward.","Step:2 Lower your body down by bending your knees and pushing your hips back as if you were sitting on a chair.","Step:3 Keep your chest up and your back straight throughout the movement.","Step:4 Lower yourself until your thighs are parallel to the ground or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/75Bgtjy.gif"}',
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
  'lying elbow to knee',
  'AQIhRjM',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engage your abs and lift your upper body off the ground, bringing your right elbow towards your left knee.","Step:4 At the same time, extend your right leg straight out and lift it off the ground.","Step:5 Pause for a moment, then return to the starting position.","Step:6 Repeat the movement, this time bringing your left elbow towards your right knee and extending your left leg.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AQIhRjM.gif"}',
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
  'cable reverse crunch',
  'RqOtqD7',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Attach a cable to a low pulley and lie down facing up on a mat.","Step:2 Hold the cable with both hands and extend your arms straight up towards the ceiling.","Step:3 Bend your knees and lift your legs up, bringing your thighs towards your chest.","Step:4 While keeping your upper body stable, curl your pelvis up towards your chest, lifting your hips off the mat.","Step:5 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RqOtqD7.gif"}',
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
  'lean planche',
  'LYJodFS',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest","triceps"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your body straight.","Step:2 Engage your core and slowly shift your weight forward, bringing your shoulders past your hands.","Step:3 Keep your elbows slightly bent and your body straight as you lean forward.","Step:4 Hold this position for a few seconds, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LYJodFS.gif"}',
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
  'kettlebell windmill',
  '9Tkqa9O',
  'intermediate',
  'kettlebell',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in your right hand overhead.","Step:2 Rotate your left foot outwards about 45 degrees and keep your right foot pointing forward.","Step:3 Bend your torso to the left side, keeping your right arm extended overhead and your eyes on the kettlebell.","Step:4 Lower your torso as far as you can while keeping your right arm straight and your left arm extended to the side.","Step:5 Pause for a moment, then return to the starting position by pushing through your right foot and engaging your obliques.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9Tkqa9O.gif"}',
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
  'straddle maltese',
  'HfqciZF',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest"}',
  '{"Step:1 Start by hanging from a pair of rings with your arms fully extended and your body in a straight line.","Step:2 Spread your legs wide apart, forming a straddle position.","Step:3 Engage your core and slowly lower your body until your arms are parallel to the ground.","Step:4 Hold this position for a few seconds, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HfqciZF.gif"}',
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
  'butt-ups',
  'qcNN2FN',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands by your sides, palms facing down.","Step:3 Engaging your abs, lift your legs off the ground, bringing your knees towards your chest.","Step:4 At the top of the movement, squeeze your abs and pause for a moment.","Step:5 Slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qcNN2FN.gif"}',
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
  'full planche',
  'YZ4961r',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest","triceps"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your fingers pointing forward.","Step:2 Engage your core and slowly shift your weight forward, lifting your feet off the ground.","Step:3 Continue shifting your weight forward until your body is parallel to the ground, balancing on your hands.","Step:4 Hold this position for as long as you can, maintaining a straight body line.","Step:5 Slowly lower your feet back to the ground and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YZ4961r.gif"}',
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
  'cocoons',
  'SLKj2pX',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SLKj2pX.gif"}',
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
  'side hip (on parallel bars)',
  'jTkSc6o',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Stand between two parallel bars with your feet shoulder-width apart.","Step:2 Place your hands on the bars and lift your body off the ground, supporting your weight on your arms.","Step:3 Engage your abs and slowly lift your legs to the side, keeping them straight.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jTkSc6o.gif"}',
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
  'alternate heel touchers',
  'qaZVsGk',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Extend your arms straight out to the sides, parallel to the ground.","Step:3 Engaging your abs, lift your shoulders off the ground and reach your right hand towards your right heel.","Step:4 Return to the starting position and repeat on the left side, reaching your left hand towards your left heel.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qaZVsGk.gif"}',
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
  'cable tuck reverse crunch',
  'TXtXc84',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Attach a cable to a low pulley and lie down on a mat facing up.","Step:2 Hold the cable with both hands and extend your arms straight up above your chest.","Step:3 Bend your knees and lift your legs up, bringing your knees towards your chest.","Step:4 At the same time, curl your pelvis up towards your chest, lifting your hips off the ground.","Step:5 Pause for a moment at the top, then slowly lower your legs and hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TXtXc84.gif"}',
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
  'weighted decline sit-up',
  'EZeDVzO',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on a decline bench with your feet secured under the foot pads.","Step:2 Place your hands behind your head or across your chest.","Step:3 Engage your abs and slowly lift your upper body off the bench, curling forward until your torso is perpendicular to the ground.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EZeDVzO.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;