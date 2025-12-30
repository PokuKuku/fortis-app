INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'incline leg hip raise (leg straight)',
  'eVxAzgz',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie on an incline bench with your back flat against the bench and your legs extended straight out in front of you.","Step:2 Place your hands on the sides of the bench for support.","Step:3 Engaging your abs, lift your legs off the bench, raising them as high as you can while keeping them straight.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eVxAzgz.gif"}',
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
  'captains chair straight leg raise',
  'weoDEpH',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the captain''s chair with your back against the backrest and your forearms resting on the arm pads.","Step:2 Keep your upper body stable and your back straight.","Step:3 Engage your abs and lift your legs up in front of you, keeping them straight.","Step:4 Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.","Step:5 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/weoDEpH.gif"}',
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
  'hanging straight twisting leg hip raise',
  'Q6bvyen',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your legs straight.","Step:2 Engage your core and lift your legs up towards your chest, keeping them straight.","Step:3 Once your legs are parallel to the ground, twist your hips to one side, bringing your legs towards that side.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat the movement, but this time twist your hips to the opposite side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Q6bvyen.gif"}',
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
  'lever seated crunch (chest pad)',
  'ZnJHhMk',
  'intermediate',
  'leverage machine',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Adjust the seat height and chest pad position according to your comfort.","Step:2 Sit on the machine with your back against the chest pad and your feet flat on the floor.","Step:3 Grasp the handles or side bars for stability.","Step:4 Engage your abs and slowly lean back, allowing the chest pad to move with you.","Step:5 Pause for a moment at the maximum contraction, feeling the tension in your abs.","Step:6 Slowly return to the starting position by contracting your abs and pulling yourself back up.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZnJHhMk.gif"}',
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
  'oblique crunch v. 2',
  'cJgSTmh',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your abs and lift your shoulder blades off the ground, rotating your torso to one side.","Step:4 Pause for a moment, then lower your shoulder blades back down to the starting position.","Step:5 Repeat on the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cJgSTmh.gif"}',
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
  'frog crunch',
  'FFRP97T',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FFRP97T.gif"}',
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
  'barbell sitted alternate leg raise (female)',
  'BCs0G2F',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"hip flexors","quadriceps"}',
  '{"Step:1 Sit on a bench with your back straight and hold a barbell across your thighs.","Step:2 Place your hands on the sides of the bench for support.","Step:3 Keeping your legs straight, lift one leg up as high as possible while keeping it parallel to the ground.","Step:4 Lower the leg back down and repeat with the other leg.","Step:5 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BCs0G2F.gif"}',
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
  'hanging pike',
  'nuBF9MO',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up towards the bar, keeping them straight.","Step:3 Continue lifting until your body forms a ''V'' shape, with your legs parallel to the ground.","Step:4 Hold the position for a moment, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nuBF9MO.gif"}',
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
  'elbow-to-knee',
  'jvp6DiD',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Start by lying flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engage your abs and lift your upper body off the ground, bringing your right elbow towards your left knee.","Step:4 At the same time, bring your left knee towards your right elbow, creating a twisting motion.","Step:5 Pause for a moment at the top, then slowly lower your upper body and extend your legs back to the starting position.","Step:6 Repeat the movement, this time bringing your left elbow towards your right knee and your right knee towards your left elbow.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jvp6DiD.gif"}',
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
  'weighted russian twist v. 2',
  'YIUAtYf',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on the ground with your knees bent and feet flat on the floor.","Step:2 Hold the weight with both hands in front of your chest.","Step:3 Lean back slightly to engage your core muscles.","Step:4 Twist your torso to the right, bringing the weight towards the right side of your body.","Step:5 Pause for a moment, then twist your torso to the left, bringing the weight towards the left side of your body.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YIUAtYf.gif"}',
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
  'twisted leg raise',
  'C0eCeEt',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Place your hands under your glutes for support.","Step:3 Engage your abs and lift both legs off the ground, keeping them straight.","Step:4 As you lift your legs, twist your hips to one side, bringing your legs towards your opposite shoulder.","Step:5 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:6 Repeat the movement, this time twisting your hips to the other side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/C0eCeEt.gif"}',
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
  'cable side bend crunch (bosu ball)',
  'qatbkEd',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a cable handle in one hand.","Step:2 Place the other hand on your hip.","Step:3 Engage your core and slowly bend sideways towards the hand holding the cable, keeping your back straight.","Step:4 Pause for a moment at the bottom of the movement, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qatbkEd.gif"}',
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
  'cable standing crunch (with rope attachment)',
  'XU3ePuv',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach a rope to a cable machine at chest height.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Hold the rope with both hands and bring it behind your head, keeping your elbows bent.","Step:4 Engage your abs and slowly crunch your torso forward, bringing your elbows towards your knees.","Step:5 Pause for a moment at the top of the crunch, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XU3ePuv.gif"}',
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
  'kettlebell advanced windmill',
  'Kal9cQQ',
  'intermediate',
  'kettlebell',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing slightly outward.","Step:2 Hold a kettlebell in your right hand, with your arm extended overhead and your palm facing forward.","Step:3 Rotate your left foot slightly to the right, and shift your weight onto your left leg.","Step:4 Bend your left knee and hinge at the hip, lowering your torso towards the left side.","Step:5 Keep your right arm extended overhead and your eyes on the kettlebell.","Step:6 As you lower your torso, allow your right leg to straighten and your right foot to pivot slightly.","Step:7 Lower your torso until you feel a stretch in your left hamstring and your right arm is pointing towards the ground.","Step:8 Pause for a moment, then engage your core and push through your left heel to return to the starting position.","Step:9 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Kal9cQQ.gif"}',
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
  'quarter sit-up',
  'enxnJcM',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/enxnJcM.gif"}',
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
  'inchworm v. 2',
  'TV87DNB',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","hamstrings"}',
  '{"Step:1 Start in a standing position with your feet hip-width apart.","Step:2 Bend forward at the waist and place your hands on the ground in front of you.","Step:3 Walk your hands forward until you are in a high plank position, with your body in a straight line from head to toe.","Step:4 Keeping your legs straight, walk your feet towards your hands, bringing your hips up towards the ceiling.","Step:5 Continue walking your hands forward, repeating the movement for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TV87DNB.gif"}',
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
  'kneeling plank tap shoulder (male)',
  'h1ezqSu',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start in a kneeling position with your hands on the ground, shoulder-width apart.","Step:2 Extend your legs behind you, resting on your toes, and lift your body into a plank position.","Step:3 Keeping your core engaged and your hips stable, lift one hand off the ground and tap the opposite shoulder.","Step:4 Return the hand to the ground and repeat with the other hand.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/h1ezqSu.gif"}',
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
  'straddle planche',
  'BL3GHeY',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","triceps","chest"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your feet spread wide apart.","Step:2 Engage your core and slowly shift your weight forward, bringing your shoulders over your hands.","Step:3 Bend your elbows and lower your body towards the ground, keeping your elbows close to your sides.","Step:4 Pause for a moment at the bottom, then push through your hands to straighten your arms and lift your body back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BL3GHeY.gif"}',
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
  'kettlebell figure 8',
  'L4ay0PW',
  'intermediate',
  'kettlebell',
  '{"abs"}',
  '{"shoulders","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Pass the kettlebell between your legs, switching hands as it reaches the back of your legs.","Step:4 As the kettlebell comes forward, pass it to the other hand between your legs.","Step:5 Continue passing the kettlebell between your legs in a figure 8 motion.","Step:6 Maintain a steady pace and engage your core throughout the exercise.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/L4ay0PW.gif"}',
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
  'cross body crunch',
  'rbu5UUb',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, lift your upper body off the ground and twist to bring your right elbow towards your left knee.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat on the other side, bringing your left elbow towards your right knee.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rbu5UUb.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;