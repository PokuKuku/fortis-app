INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'hanging straight leg raise with elevated',
  '6vcvsLS',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your legs up in front of you, keeping them straight.","Step:3 Continue lifting until your legs are parallel to the ground or as high as you can comfortably go. Maintain elevated form throughout.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6vcvsLS.gif"}',
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
  'hanging straight twisting leg hip raise with compound',
  'WFucoe6',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your legs straight.","Step:2 Engage your core and lift your legs up towards your chest, keeping them straight. Perform with compound intensity.","Step:3 Once your legs are parallel to the ground, twist your hips to one side, bringing your legs towards that side.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat the movement, but this time twist your hips to the opposite side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WFucoe6.gif"}',
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
  'sit-up with arms on chest with mini',
  'gSO0KpB',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Cross your arms over your chest.","Step:3 Engaging your abs, lift your upper body off the ground towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position. Maintain mini form throughout.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gSO0KpB.gif"}',
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
  'intermediate style kneeling plank tap shoulder (male)',
  'tuIZFDt',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start in a kneeling position with your hands on the ground, shoulder-width apart.","Step:2 Extend your legs behind you, resting on your toes, and lift your body into a plank position.","Step:3 (intermediate variation) Keeping your core engaged and your hips stable, lift one hand off the ground and tap the opposite shoulder.","Step:4 Return the hand to the ground and repeat with the other hand.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tuIZFDt.gif"}',
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
  'supine style band alternating v-up',
  'UI81amT',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engage your abs and lift your legs and upper body off the ground simultaneously, reaching your hands towards your toes.","Step:3 As you lower your legs and upper body back down, switch the position of your legs, crossing one over the other. Focus on supine movement.","Step:4 Repeat the movement, alternating the position of your legs with each repetition.","Step:5 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UI81amT.gif"}',
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
  'gentle prone twist on stability ball',
  '4QqYaJW',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Start by lying face down on a stability ball with your feet shoulder-width apart and your toes touching the ground.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your core muscles and slowly lift your upper body off the ball, keeping your back straight.","Step:4 Rotate your torso to one side, bringing your shoulder towards your hip. Keep your hips and legs stable throughout the movement.","Step:5 Pause for a moment, then return to the starting position.","Step:6 (gentle variation) Repeat the rotation to the other side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4QqYaJW.gif"}',
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
  'band vertical pallof press - seated variation',
  'kLiIFdB',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and wrap the band around a sturdy object at chest height.","Step:2 Hold the band with both hands and step away from the anchor point, creating tension in the band.","Step:3 Position yourself perpendicular to the anchor point, with your side facing the band.","Step:4 Extend your arms straight out in front of you, keeping your hands at chest height.","Step:5 Engage your core and press the band away from your chest, fully extending your arms.","Step:6 Hold the position for a few seconds, then slowly bring the band back towards your chest.","Step:7 Repeat for the desired number of repetitions, then switch sides. Perform with seated intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kLiIFdB.gif"}',
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
  'firm style hanging oblique knee raise',
  'lFBTISi',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your palms facing away from you.","Step:2 Engage your core and lift your knees towards your chest, twisting your torso to the side as you do so.","Step:3 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:4 Repeat on the other side, twisting your torso in the opposite direction.","Step:5 Continue alternating sides for the desired number of repetitions. Emphasize firm control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lFBTISi.gif"}',
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
  'lever seated hip abduction',
  'CHpahtl',
  'intermediate',
  'leverage machine',
  '{"abductors"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Adjust the seat height so that your knees are at a 90-degree angle.","Step:2 Sit on the machine with your back against the backrest and your feet on the footrests.","Step:3 Place your hands on the side handles for stability.","Step:4 Engage your abductors and slowly push your legs apart, away from the midline of your body.","Step:5 Pause for a moment at the end of the movement, then slowly bring your legs back together to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CHpahtl.gif"}',
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
  'resistance band seated hip abduction',
  '0xDpB4L',
  'intermediate',
  'resistance band',
  '{"abductors"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Wrap the resistance band around your thighs, just above your knees.","Step:3 Place your hands on the sides of the chair or bench for support.","Step:4 Engage your abductors (outer thigh muscles) and slowly push your knees apart, against the resistance of the band.","Step:5 Pause for a moment at the end of the movement, then slowly bring your knees back together.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0xDpB4L.gif"}',
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
  'side bridge hip abduction',
  'WL4EmxJ',
  'intermediate',
  'body weight',
  '{"abductors"}',
  '{"glutes","obliques"}',
  '{"Step:1 Lie on your side with your legs extended and stacked on top of each other.","Step:2 Prop yourself up on your forearm, keeping your elbow directly below your shoulder.","Step:3 Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.","Step:4 While keeping your core engaged, lift your top leg as high as possible without rotating your hips.","Step:5 Pause for a moment at the top, then lower your leg back down.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WL4EmxJ.gif"}',
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
  'side hip abduction',
  '7WaDzyL',
  'intermediate',
  'body weight',
  '{"abductors"}',
  '{"glutes","quadriceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your hands on your hips.","Step:2 Shift your weight to one leg and lift the opposite leg out to the side, keeping it straight.","Step:3 Pause for a moment at the top, then slowly lower your leg back down to the starting position.","Step:4 Repeat on the other side.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7WaDzyL.gif"}',
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
  'straight leg outer hip abductor',
  'mQ1tBXn',
  'intermediate',
  'body weight',
  '{"abductors"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie on your side with your legs straight and stacked on top of each other.","Step:2 Place your bottom arm under your head for support.","Step:3 Engage your core and lift your top leg as high as possible without rotating your hips or leaning backward.","Step:4 Pause for a moment at the top, then slowly lower your leg back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mQ1tBXn.gif"}',
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
  'fast style resistance band seated hip abduction',
  'Qj0HRAZ',
  'intermediate',
  'resistance band',
  '{"abductors"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Wrap the resistance band around your thighs, just above your knees.","Step:3 Place your hands on the sides of the chair or bench for support.","Step:4 (fast variation) Engage your abductors (outer thigh muscles) and slowly push your knees apart, against the resistance of the band.","Step:5 Pause for a moment at the end of the movement, then slowly bring your knees back together.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Qj0HRAZ.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;