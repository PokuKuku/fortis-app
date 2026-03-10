INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'russian twist',
  'XVDdcoj',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on the ground with your knees bent and feet flat on the floor.","Step:2 Lean back slightly while keeping your back straight and your core engaged.","Step:3 Hold your hands together in front of your chest or hold a weight if desired.","Step:4 Lift your feet off the ground, balancing on your sit bones.","Step:5 Twist your torso to the right, bringing your hands or weight towards the right side of your body.","Step:6 Pause for a moment, then twist your torso to the left, bringing your hands or weight towards the left side of your body.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XVDdcoj.gif"}',
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
  'arms overhead full sit-up (male)',
  'NAkmgdx',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Extend your arms overhead, keeping them straight.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is upright.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NAkmgdx.gif"}',
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
  'cable kneeling crunch - gentle variation',
  'CUmLRTA',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a rope handle to a high pulley and kneel down facing away from the machine.","Step:2 Hold the rope handle with both hands and place it behind your head, keeping your elbows out to the sides.","Step:3 Keeping your hips stationary, flex your waist and crunch your torso down towards your thighs.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position. Maintain gentle form throughout.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CUmLRTA.gif"}',
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
  'band alternating v-up with simple',
  '3pqGMQj',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engage your abs and lift your legs and upper body off the ground simultaneously, reaching your hands towards your toes.","Step:3 As you lower your legs and upper body back down, switch the position of your legs, crossing one over the other. Focus on simple movement.","Step:4 Repeat the movement, alternating the position of your legs with each repetition.","Step:5 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3pqGMQj.gif"}',
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
  'hanging pike with intense',
  'gdPIyyO',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up towards the bar, keeping them straight.","Step:3 (intense variation) Continue lifting until your body forms a ''V'' shape, with your legs parallel to the ground.","Step:4 Hold the position for a moment, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gdPIyyO.gif"}',
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
  'blunt cable standing crunch',
  'vN5HB0s',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a cable handle to a high pulley and stand facing away from the machine.","Step:2 Hold the handle with both hands and place it behind your head, keeping your elbows bent.","Step:3 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:4 Keeping your abs engaged, exhale and crunch your torso down towards your knees, bringing your elbows towards your thighs.","Step:5 Pause for a moment at the bottom of the movement, then slowly return to the starting position. Emphasize blunt control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vN5HB0s.gif"}',
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
  'slow leg pull in flat bench',
  'xcLntTC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Sit on a flat bench with your legs extended straight out in front of you.","Step:2 Place your hands on the bench beside your hips for support.","Step:3 Engage your abs and lift your legs off the ground, bringing your knees towards your chest.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions. Maintain slow form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xcLntTC.gif"}',
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
  'suspended abdominal fallout - inclined variation',
  'HZgQPxh',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Attach a suspension trainer to a high anchor point and adjust the straps to waist height.","Step:2 Stand facing away from the anchor point and hold the handles with your arms extended in front of you. Maintain inclined form throughout.","Step:3 Lean forward at the waist, keeping your body straight and your core engaged.","Step:4 Lower your body as far as you can while maintaining control and tension in your abs.","Step:5 Pause for a moment at the bottom, then slowly raise your body back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HZgQPxh.gif"}',
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
  'narrow style band jack knife sit-up',
  '58rdhvL',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engage your abs and lift your legs and upper body simultaneously, bringing your hands towards your feet.","Step:3 Pause for a moment at the top, then slowly lower your legs and upper body back down to the starting position.","Step:4 Repeat for the desired number of repetitions. Focus on narrow movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/58rdhvL.gif"}',
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
  'single style cable standing crunch (with rope attachment)',
  '8gQo5Ss',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a rope to a cable machine at chest height.","Step:2 Stand facing away from the machine with your feet shoulder-width apart. Focus on single movement.","Step:3 Hold the rope with both hands and bring it behind your head, keeping your elbows bent.","Step:4 Engage your abs and slowly crunch your torso forward, bringing your elbows towards your knees.","Step:5 Pause for a moment at the top of the crunch, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8gQo5Ss.gif"}',
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
  'rough band push sit-up',
  'PKlXuJW',
  'intermediate',
  'band',
  '{"abs"}',
  '{"shoulders","chest"}',
  '{"Step:1 Attach the band securely to a stable anchor point.","Step:2 Lie flat on your back with your knees bent and feet flat on the ground.","Step:3 Hold the band with both hands and extend your arms straight up towards the ceiling. Focus on rough movement.","Step:4 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:5 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PKlXuJW.gif"}',
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
  'cable side bend smooth',
  'UOphC6N',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the cable handle with one hand.","Step:2 Keep your back straight and your core engaged.","Step:3 Slowly bend sideways at the waist, lowering the cable handle towards your knee.","Step:4 Pause for a moment, then return to the starting position. Focus on smooth movement.","Step:5 Repeat on the other side.","Step:6 Alternate sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UOphC6N.gif"}',
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
  'cocoons with mega',
  '7i4msxz',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions. Emphasize mega control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7i4msxz.gif"}',
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
  'rounded twisted leg raise (female)',
  '6Wr0F3W',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Bend your knees and lift your legs off the ground, bringing them towards your chest. Emphasize rounded control.","Step:3 As you lift your legs, twist your hips to one side, bringing your knees towards your opposite shoulder.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat the movement, this time twisting your hips to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6Wr0F3W.gif"}',
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
  'hanging pike weak',
  'Sa8mzWc',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up towards the bar, keeping them straight.","Step:3 Continue lifting until your body forms a ''V'' shape, with your legs parallel to the ground. Emphasize weak control.","Step:4 Hold the position for a moment, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Sa8mzWc.gif"}',
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
  'cable judo flip with static',
  'IxsFgRT',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with both hands at chest level, palms facing down.","Step:3 Engage your core and rotate your torso to the right, pulling the cable across your body.","Step:4 As you rotate, pivot your back foot and allow your hips to rotate naturally. Emphasize static control.","Step:5 Extend your arms fully and finish the movement by flipping the cable handle over your shoulder.","Step:6 Return to the starting position by reversing the movement, rotating your torso back to the center.","Step:7 Repeat the movement on the opposite side.","Step:8 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IxsFgRT.gif"}',
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
  'lying leg-hip raise - contracted variation',
  'mpYUPkA',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Place your hands under your glutes for support.","Step:3 Engage your core and lift your legs off the ground, raising them towards the ceiling.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position. Emphasize contracted control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mpYUPkA.gif"}',
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
  'barbell sitted alternate leg raise (female) with intermediate',
  'ntjtCfu',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"hip flexors","quadriceps"}',
  '{"Step:1 Sit on a bench with your back straight and hold a barbell across your thighs.","Step:2 (intermediate variation) Place your hands on the sides of the bench for support.","Step:3 Keeping your legs straight, lift one leg up as high as possible while keeping it parallel to the ground.","Step:4 Lower the leg back down and repeat with the other leg.","Step:5 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ntjtCfu.gif"}',
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
  'push-up to side plank - athletic variation',
  'kk39rUy',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest","triceps"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your body in a straight line.","Step:2 Lower your body towards the ground by bending your elbows, keeping your core engaged.","Step:3 Push back up to the starting position. Emphasize athletic control.","Step:4 Shift your weight onto your left hand and rotate your body to the right, lifting your right arm towards the ceiling.","Step:5 Hold the side plank position for a few seconds, then return to the starting position.","Step:6 Repeat the push-up and side plank on the opposite side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kk39rUy.gif"}',
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
  'band seated twist pure',
  'L68dTQj',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you and your back straight.","Step:2 Wrap the band around your waist and hold the ends with both hands.","Step:3 Engage your abs and slowly twist your torso to one side, keeping your back straight and your feet on the ground.","Step:4 Pause for a moment at the end of the twist, then slowly return to the starting position.","Step:5 (pure variation) Repeat the twist to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/L68dTQj.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;