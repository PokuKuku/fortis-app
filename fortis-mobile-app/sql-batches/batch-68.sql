INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'flexion leg sit up (bent knee)',
  'AR0ig3o',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 At the same time, lift your legs off the ground, bending your knees and bringing them towards your chest.","Step:5 Pause for a moment at the top, then slowly lower your upper body and legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AR0ig3o.gif"}',
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
  'lever seated crunch v. 2',
  'eXFXCY0',
  'intermediate',
  'leverage machine',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Sit on the leverage machine with your back against the pad and your feet secured under the footpads.","Step:2 Place your hands on the handles or the sides of the seat for support.","Step:3 Engage your abs and slowly crunch forward, bringing your chest towards your knees.","Step:4 Pause for a moment at the top of the movement, squeezing your abs.","Step:5 Slowly return to the starting position, allowing your back to round slightly.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eXFXCY0.gif"}',
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
  'twisted leg raise (female)',
  'yT9tk17',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Bend your knees and lift your legs off the ground, bringing them towards your chest.","Step:3 As you lift your legs, twist your hips to one side, bringing your knees towards your opposite shoulder.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat the movement, this time twisting your hips to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yT9tk17.gif"}',
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
  'weighted seated twist (on stability ball)',
  's34Y4LR',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a weight plate or dumbbell with both hands close to your chest.","Step:3 Engage your core and slowly rotate your torso to one side, keeping your hips stable.","Step:4 Pause for a moment at the end of the rotation, then slowly return to the starting position.","Step:5 Repeat the rotation to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s34Y4LR.gif"}',
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
  'flag',
  'pQ0Mx1Z',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Start by gripping a vertical pole with both hands, palms facing each other, and arms fully extended.","Step:2 Engage your core and lift your legs off the ground, keeping them straight.","Step:3 Using your core and upper body strength, raise your legs until they are parallel to the ground.","Step:4 Hold this position for as long as you can, maintaining a straight body line.","Step:5 Slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pQ0Mx1Z.gif"}',
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
  'barbell rollerout from bench',
  'Gxg9lDc',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start by kneeling on the floor with a barbell placed on a bench in front of you.","Step:2 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Keeping your core engaged and your back straight, slowly roll the barbell forward, extending your arms in front of you.","Step:4 Continue rolling the barbell forward until your body is fully extended and your arms are overhead.","Step:5 Pause for a moment at the fully extended position, then slowly roll the barbell back towards your body, returning to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gxg9lDc.gif"}',
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
  'crunch (hands overhead)',
  'kjJ3VoQ',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Extend your arms straight above your head.","Step:3 Engaging your abs, lift your upper body off the ground, curling forward towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kjJ3VoQ.gif"}',
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
  'side bridge v. 2',
  'RKjH6Lt',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","glutes"}',
  '{"Step:1 Lie on your side with your legs extended and stacked on top of each other.","Step:2 Place your forearm on the ground directly below your shoulder, with your elbow bent at a 90-degree angle.","Step:3 Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.","Step:4 Hold this position for the desired amount of time.","Step:5 Lower your hips back down to the starting position.","Step:6 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RKjH6Lt.gif"}',
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
  'otis up',
  'UVL20oz',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UVL20oz.gif"}',
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
  'frog planche',
  'rQhGcin',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest","triceps"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your feet together.","Step:2 Bend your elbows and lower your body towards the ground, keeping your back straight.","Step:3 As you lower your body, lift your feet off the ground and bring your knees towards your chest.","Step:4 Hold this position for a few seconds, then extend your legs back out and push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rQhGcin.gif"}',
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
  'suspended reverse crunch',
  'R1WYG5D',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your knees up towards your chest, curling your pelvis towards your ribcage.","Step:3 Pause for a moment at the top, then slowly lower your knees back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/R1WYG5D.gif"}',
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
  'inchworm',
  'ZgsNQ6d',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","hamstrings"}',
  '{"Step:1 Start in a standing position with your feet hip-width apart.","Step:2 Bend forward at the waist and place your hands on the ground in front of you.","Step:3 Walk your hands forward until you are in a high plank position, with your body in a straight line from head to toe.","Step:4 Pause for a moment, then walk your hands back towards your feet, keeping your legs as straight as possible.","Step:5 Once your hands reach your feet, stand back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZgsNQ6d.gif"}',
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
  'band v-up',
  'H6ETwO9',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engaging your abs, lift your legs and upper body off the ground simultaneously, reaching your hands towards your toes.","Step:3 Pause for a moment at the top, then slowly lower your legs and upper body back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/H6ETwO9.gif"}',
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
  'hanging leg raise',
  'I3tsCnC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up in front of you, keeping them straight.","Step:3 Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I3tsCnC.gif"}',
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
  'bridge - mountain climber (cross body)',
  '9c6T1YX',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"glutes","quadriceps","hamstrings","shoulders","triceps"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line.","Step:2 Engage your core and lift your right foot off the ground, bringing your right knee towards your left elbow.","Step:3 Return your right foot to the starting position and repeat the movement with your left foot towards your right elbow.","Step:4 Continue alternating sides, moving at a controlled pace.","Step:5 Keep your hips level and avoid lifting your hips too high or sagging them too low.","Step:6 Maintain a steady breathing pattern throughout the exercise.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9c6T1YX.gif"}',
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
  'crunch (on stability ball)',
  'MCUhf1F',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Lie back on the ball until your lower back is supported and your upper body is parallel to the floor.","Step:3 Place your hands behind your head or across your chest.","Step:4 Engage your abs and lift your upper body towards your knees, curling your torso forward.","Step:5 Pause for a moment at the top of the movement, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MCUhf1F.gif"}',
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
  'band alternating v-up',
  'ztAa1RK',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engage your abs and lift your legs and upper body off the ground simultaneously, reaching your hands towards your toes.","Step:3 As you lower your legs and upper body back down, switch the position of your legs, crossing one over the other.","Step:4 Repeat the movement, alternating the position of your legs with each repetition.","Step:5 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ztAa1RK.gif"}',
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
  'sit-up with arms on chest',
  '6ZCiYWQ',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Cross your arms over your chest.","Step:3 Engaging your abs, lift your upper body off the ground towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6ZCiYWQ.gif"}',
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
  'lever seated leg raise crunch',
  'PQ2AtC3',
  'intermediate',
  'leverage machine',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the leverage machine with your back against the backrest and your feet on the footrests.","Step:2 Grasp the handles or sidebars for stability.","Step:3 Engage your abs and slowly raise your legs up towards your chest, curling your torso forward at the same time.","Step:4 Pause for a moment at the top, then slowly lower your legs and torso back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PQ2AtC3.gif"}',
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
  'prone twist on stability ball',
  '1IG6gVF',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Start by lying face down on a stability ball with your feet shoulder-width apart and your toes touching the ground.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your core muscles and slowly lift your upper body off the ball, keeping your back straight.","Step:4 Rotate your torso to one side, bringing your shoulder towards your hip. Keep your hips and legs stable throughout the movement.","Step:5 Pause for a moment, then return to the starting position.","Step:6 Repeat the rotation to the other side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1IG6gVF.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;