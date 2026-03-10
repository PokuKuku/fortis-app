INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'weighted front plank',
  'VBAWRPG',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"shoulders","lower back"}',
  '{"Step:1 Start by lying face down on the floor.","Step:2 Place your forearms on the ground, with your elbows directly under your shoulders.","Step:3 Extend your legs straight out behind you, with your toes on the ground.","Step:4 Engage your core and lift your body off the ground, balancing on your forearms and toes.","Step:5 Keep your body in a straight line from your head to your heels.","Step:6 Hold this position for the desired amount of time.","Step:7 Lower your body back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VBAWRPG.gif"}',
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
  'assisted hanging knee raise',
  '03lzqwk',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core muscles and lift your knees towards your chest, bending at the hips and knees.","Step:3 Pause for a moment at the top of the movement, squeezing your abs.","Step:4 Slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/03lzqwk.gif"}',
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
  'weighted crunch',
  's8nrDXF',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Hold a weight plate or dumbbell on your chest.","Step:3 Engage your abs and lift your upper body off the ground, curling forward until your shoulder blades are off the ground.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s8nrDXF.gif"}',
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
  'tuck crunch',
  'BMMolZ3',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, lift your shoulder blades off the ground and bring your knees towards your chest, simultaneously curling your upper body towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your shoulder blades and extend your legs back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BMMolZ3.gif"}',
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
  'bodyweight incline side plank',
  '5VXmnV5',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Start by lying on your side with your legs extended and stacked on top of each other.","Step:2 Place your forearm on the ground directly below your shoulder, with your elbow bent at a 90-degree angle.","Step:3 Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.","Step:4 Hold this position for the desired amount of time.","Step:5 Lower your hips back down to the ground and repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5VXmnV5.gif"}',
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
  'assisted prone rectus femoris stretch',
  '2Ryn564',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"quadriceps"}',
  '{"Step:1 Lie face down on the ground with your legs straight.","Step:2 Bend your right knee and reach back with your right hand to grab your right foot or ankle.","Step:3 Gently pull your right foot or ankle towards your glutes, feeling a stretch in the front of your right thigh.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Release and repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2Ryn564.gif"}',
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
  'kettlebell double windmill',
  'OaE7CpD',
  'intermediate',
  'kettlebell',
  '{"abs"}',
  '{"shoulders","hamstrings"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in your right hand.","Step:2 Extend your right arm overhead, keeping your eyes on the kettlebell.","Step:3 Rotate your left foot 45 degrees to the left and your right foot 90 degrees to the right.","Step:4 Bend at the waist to the left, keeping your right arm extended overhead.","Step:5 Lower the kettlebell towards the ground, reaching towards your left foot.","Step:6 Pause for a moment, then engage your core and push through your right foot to return to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OaE7CpD.gif"}',
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
  'lever seated crunch',
  'Wgaz7pm',
  'intermediate',
  'leverage machine',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on the leverage machine with your back against the pad and your feet flat on the floor.","Step:2 Grasp the handles or place your hands on the side pads for support.","Step:3 Engage your abs and slowly lean back, allowing the pad to move with you.","Step:4 Once your upper body is at a 45-degree angle, contract your abs and crunch forward, bringing your chest towards your knees.","Step:5 Pause for a moment at the top, then slowly release and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Wgaz7pm.gif"}',
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
  'band horizontal pallof press',
  '9pa4H5m',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques","glutes"}',
  '{"Step:1 Attach the band to a sturdy anchor point at waist height.","Step:2 Stand perpendicular to the anchor point with your feet shoulder-width apart.","Step:3 Grasp the band handle with both hands and step away from the anchor point to create tension in the band.","Step:4 Bring your hands to your chest, keeping your elbows bent and close to your body.","Step:5 Engage your core and maintain a stable stance.","Step:6 Extend your arms straight out in front of you, pushing the band away from your body.","Step:7 Hold the extended position for a few seconds, focusing on maintaining tension in your core.","Step:8 Slowly bring your hands back to your chest, resisting the pull of the band.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9pa4H5m.gif"}',
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
  'pelvic tilt',
  'NKJ8o6x',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands by your sides.","Step:3 Engage your abs and tilt your pelvis upward, pressing your lower back into the ground.","Step:4 Hold this position for a few seconds, focusing on contracting your abs.","Step:5 Release the tilt and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NKJ8o6x.gif"}',
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
  'reverse crunch',
  'nCU1Ekp',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your arms extended along your sides.","Step:2 Bend your knees and lift your feet off the ground, bringing your thighs perpendicular to the floor.","Step:3 Contract your abs and curl your hips off the floor, bringing your knees towards your chest.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nCU1Ekp.gif"}',
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
  'assisted hanging knee raise with throw down',
  '8K0w2yA',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your knees towards your chest, keeping your legs together.","Step:3 Once your knees are at chest level, explosively throw your legs down towards the ground, extending them fully.","Step:4 Allow your legs to swing back up and repeat the movement for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8K0w2yA.gif"}',
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
  'full maltese',
  'YRaCa5Y',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","chest"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and your arms extended straight out to the sides.","Step:2 Slowly lean forward, keeping your arms straight, until your upper body is parallel to the ground.","Step:3 Engage your core and hold this position for a few seconds.","Step:4 Return to the starting position by pushing through your feet and standing back up.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YRaCa5Y.gif"}',
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
  'assisted lying leg raise with lateral throw down',
  'UGhRD1A',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"hip flexors","obliques"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Place your hands under your glutes for support.","Step:3 Engage your abs and lift your legs off the ground, keeping them straight.","Step:4 While keeping your legs together, lower them to one side until they are a few inches above the ground.","Step:5 Pause for a moment, then lift your legs back to the starting position.","Step:6 Repeat the movement to the other side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UGhRD1A.gif"}',
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
  'vertical leg raise (on parallel bars)',
  'ZNgOYQU',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from the parallel bars with your arms fully extended and your body straight.","Step:2 Engage your core and lift your legs up in front of you, keeping them straight.","Step:3 Continue lifting until your legs are parallel to the ground or slightly higher.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZNgOYQU.gif"}',
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
  'side-to-side toe touch (male)',
  'WCAvOfC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms extended to the sides.","Step:2 Bend at the waist to the right, reaching your right hand towards your right foot while keeping your left hand extended to the side.","Step:3 Return to the starting position and then bend at the waist to the left, reaching your left hand towards your left foot while keeping your right hand extended to the side.","Step:4 Repeat the side-to-side bending motion for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WCAvOfC.gif"}',
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
  'assisted lying leg raise with throw down',
  'VX5YKR5',
  'intermediate',
  'assisted',
  '{"abs"}',
  '{"hip flexors","quadriceps"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Place your hands under your glutes for support.","Step:3 Engage your core and lift your legs off the ground, keeping them straight.","Step:4 Raise your legs until they are perpendicular to the ground.","Step:5 Lower your legs back down to the starting position.","Step:6 Simultaneously, throw your legs down towards the ground, keeping them straight.","Step:7 Raise your legs back up to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VX5YKR5.gif"}',
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
  'wind sprints',
  'Qoujh3Q',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Find an open space or a track to perform the exercise.","Step:2 Start by standing with your feet shoulder-width apart.","Step:3 Begin running as fast as you can, pumping your arms and driving your knees up.","Step:4 Continue sprinting for a specific distance or time period.","Step:5 Rest and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Qoujh3Q.gif"}',
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
  'cable twist (up-down)',
  'fhZQPlV',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with both hands in front of your chest, keeping your arms slightly bent.","Step:3 Engage your core and slowly rotate your torso to one side, keeping your hips and legs stable.","Step:4 Pause for a moment at the end of the rotation, then slowly return to the starting position.","Step:5 Repeat the rotation to the opposite side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fhZQPlV.gif"}',
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
  'cable kneeling crunch',
  'WW95auq',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a rope handle to a high pulley and kneel down facing away from the machine.","Step:2 Hold the rope handle with both hands and place it behind your head, keeping your elbows out to the sides.","Step:3 Keeping your hips stationary, flex your waist and crunch your torso down towards your thighs.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WW95auq.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;