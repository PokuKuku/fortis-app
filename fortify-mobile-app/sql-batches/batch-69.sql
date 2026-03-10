INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'air bike',
  '1ZFqTDN',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your hands placed behind your head.","Step:2 Lift your legs off the ground and bend your knees at a 90-degree angle.","Step:3 Bring your right elbow towards your left knee while simultaneously straightening your right leg.","Step:4 Return to the starting position and repeat the movement on the opposite side, bringing your left elbow towards your right knee while straightening your left leg.","Step:5 Continue alternating sides in a pedaling motion for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1ZFqTDN.gif"}',
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
  'band standing twisting crunch',
  'euq4pwp',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your upper back, crossing it in front of your chest.","Step:2 Hold the ends of the band with your hands, keeping your elbows bent and close to your sides.","Step:3 Engage your abs and twist your torso to one side, bringing your elbow towards the opposite knee.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat on the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/euq4pwp.gif"}',
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
  'sit-up v. 2',
  'Bn6TXyO',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Bn6TXyO.gif"}',
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
  'hip raise (bent knee)',
  '196HJGw',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands by your sides, palms facing down.","Step:3 Engage your core and glutes, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/196HJGw.gif"}',
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
  'leg pull in flat bench',
  'OyoZ3Pu',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Sit on a flat bench with your legs extended straight out in front of you.","Step:2 Place your hands on the bench beside your hips for support.","Step:3 Engage your abs and lift your legs off the ground, bringing your knees towards your chest.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OyoZ3Pu.gif"}',
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
  'cable russian twists (on stability ball)',
  'd9Xaxq6',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold the cable handle with both hands and extend your arms straight out in front of you.","Step:3 Lean back slightly while keeping your back straight and your core engaged.","Step:4 Twist your torso to the right, bringing the cable handle towards your right hip.","Step:5 Pause for a moment, then twist your torso to the left, bringing the cable handle towards your left hip.","Step:6 Continue alternating twists for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/d9Xaxq6.gif"}',
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
  'hanging oblique knee raise',
  'BaE7O6U',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your knees towards your chest, twisting your torso to the side as you do so.","Step:3 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:4 Repeat on the other side, twisting your torso in the opposite direction.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BaE7O6U.gif"}',
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
  'dead bug',
  'iny3m5y',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your arms extended towards the ceiling.","Step:2 Bend your knees and lift your legs off the ground, creating a 90-degree angle at your hips and knees.","Step:3 Engage your core and lower back to press your lower back into the ground.","Step:4 Slowly lower your right arm and left leg towards the ground, keeping them straight and hovering just above the floor.","Step:5 Pause for a moment, then return to the starting position.","Step:6 Repeat the movement with your left arm and right leg.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iny3m5y.gif"}',
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
  'v-sit on floor',
  'ZuXu4Eq',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the floor with your legs extended in front of you.","Step:2 Lean back slightly and lift your legs off the ground, keeping them straight.","Step:3 Simultaneously, lift your upper body off the ground and reach your arms towards your legs.","Step:4 Hold this position for a few seconds, then slowly lower your upper body and legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZuXu4Eq.gif"}',
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
  'band kneeling twisting crunch',
  '225x2Vd',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach the band to a sturdy anchor point at waist height.","Step:2 Kneel down facing away from the anchor point and hold the band with both hands, keeping your elbows bent and close to your sides.","Step:3 Engage your abs and slowly twist your torso to one side, bringing your hands towards your opposite hip.","Step:4 Pause for a moment, then slowly return to the starting position.","Step:5 Repeat on the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/225x2Vd.gif"}',
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
  'spine twist',
  '2jl9K55',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Bend your knees and place your feet flat on the ground, hip-width apart.","Step:3 Place your hands behind your head with your elbows pointing outwards.","Step:4 Engage your abs and slowly twist your torso to the right, bringing your right elbow towards your left knee.","Step:5 Pause for a moment at the end of the twist, then slowly return to the starting position.","Step:6 Repeat the twist to the left side, bringing your left elbow towards your right knee.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2jl9K55.gif"}',
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
  'l-sit on floor',
  'UpWmA5E',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the floor with your legs extended in front of you.","Step:2 Place your hands on the floor beside your hips, fingers pointing forward.","Step:3 Engage your core and lift your legs off the ground, keeping them straight.","Step:4 Try to bring your legs parallel to the floor, forming an ''L'' shape with your body.","Step:5 Hold this position for as long as you can.","Step:6 Slowly lower your legs back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UpWmA5E.gif"}',
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
  'one arm slam (with medicine ball)',
  'jCrtE9b',
  'intermediate',
  'medicine ball',
  '{"abs"}',
  '{"shoulders","back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding the medicine ball with one hand in front of your waist.","Step:2 Bend your knees slightly and engage your core.","Step:3 Raise the medicine ball above your head, fully extending your arm.","Step:4 Forcefully slam the medicine ball down to the ground, using your core and shoulders to generate power.","Step:5 Catch the medicine ball on the bounce and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jCrtE9b.gif"}',
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
  'cable standing crunch',
  'jpgqxiS',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a cable handle to a high pulley and stand facing away from the machine.","Step:2 Hold the handle with both hands and place it behind your head, keeping your elbows bent.","Step:3 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:4 Keeping your abs engaged, exhale and crunch your torso down towards your knees, bringing your elbows towards your thighs.","Step:5 Pause for a moment at the bottom of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jpgqxiS.gif"}',
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
  'hanging straight leg raise',
  '4Ml7QFO',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up in front of you, keeping them straight.","Step:3 Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4Ml7QFO.gif"}',
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
  'assisted sit-up',
  'aumB2IV',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the edge of a bench or have someone hold your feet down.","Step:2 Lie flat on your back with your knees bent and feet flat on the ground.","Step:3 Place your hands behind your head with your elbows pointing outwards.","Step:4 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:5 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aumB2IV.gif"}',
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
  'crab twist toe touch',
  'xgsGFVM',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Start by sitting on the ground with your knees bent and feet flat on the floor.","Step:2 Place your hands behind you, fingers pointing towards your feet, and lift your hips off the ground.","Step:3 Extend one leg straight out in front of you while simultaneously reaching your opposite hand towards your toes.","Step:4 Return to the starting position and repeat on the other side.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xgsGFVM.gif"}',
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
  'knee touch crunch',
  'dTg95eZ',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, lift your shoulder blades off the ground and reach your right hand towards your left knee.","Step:4 Return to the starting position and repeat, this time reaching your left hand towards your right knee.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dTg95eZ.gif"}',
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
  'cable side crunch',
  'q2ADGqV',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a cable handle to a low pulley and stand sideways to the machine.","Step:2 Grasp the handle with the hand furthest from the machine and place your other hand on your hip.","Step:3 Keep your feet shoulder-width apart and your knees slightly bent.","Step:4 With your abs engaged, bend sideways at the waist, bringing your elbow down towards your hip.","Step:5 Pause for a moment at the bottom, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/q2ADGqV.gif"}',
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
  'stability ball crunch (full range hands behind head)',
  'Gn5FwYT',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly curl your upper body forward, bringing your chest towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your upper body back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gn5FwYT.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;