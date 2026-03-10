INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'band jack knife sit-up',
  'KCBKjma',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your arms extended overhead, holding the band.","Step:2 Engage your abs and lift your legs and upper body simultaneously, bringing your hands towards your feet.","Step:3 Pause for a moment at the top, then slowly lower your legs and upper body back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KCBKjma.gif"}',
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
  'incline twisting sit-up',
  '9ZGZuOD',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Place your hands behind your head or across your chest.","Step:4 Engage your abs and lift your upper body off the bench, curling forward.","Step:5 As you curl up, twist your torso to one side, bringing your elbow towards the opposite knee.","Step:6 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:7 Repeat the movement, this time twisting your torso to the other side.","Step:8 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9ZGZuOD.gif"}',
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
  'kettlebell bent press',
  'kjE55n5',
  'intermediate',
  'kettlebell',
  '{"abs"}',
  '{"shoulders","triceps","obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in your right hand.","Step:2 Bend your knees slightly and press the kettlebell overhead with your right arm, keeping your elbow locked.","Step:3 Rotate your torso to the left, shifting your weight onto your left foot.","Step:4 Bend your left knee and lower your torso towards the ground, keeping your right arm extended overhead.","Step:5 As you lower, keep your eyes on the kettlebell and your chest lifted.","Step:6 Once your left hand touches the ground, push through your left foot and straighten your left leg, driving your hips forward.","Step:7 As you drive your hips forward, use your core and right arm to press the kettlebell back up to the starting position.","Step:8 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kjE55n5.gif"}',
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
  'cable seated twist',
  'UEjSrKI',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on a cable machine with your feet flat on the ground and your knees slightly bent.","Step:2 Hold the cable handle with both hands and extend your arms straight in front of you.","Step:3 Keeping your core engaged, slowly rotate your torso to one side, pulling the cable across your body.","Step:4 Pause for a moment at the end of the range of motion, then slowly rotate back to the starting position.","Step:5 Repeat on the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UEjSrKI.gif"}',
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
  'front plank with twist',
  'CosupLu',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line from head to toe.","Step:2 Engage your core and glutes to maintain a stable position.","Step:3 Rotate your torso to the right, lifting your right arm and extending it towards the ceiling.","Step:4 Keep your hips and legs stable as you twist.","Step:5 Hold for a moment, then return to the starting position.","Step:6 Repeat the twist on the left side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CosupLu.gif"}',
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
  'crunch (on stability ball, arms straight)',
  'Sn8wxAI',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Lie back on the ball until your lower back is supported and your upper body is parallel to the floor.","Step:3 Place your hands behind your head or cross them over your chest.","Step:4 Engage your abs and lift your upper body off the ball, curling your shoulders towards your hips.","Step:5 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Sn8wxAI.gif"}',
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
  '45° side bend',
  'Hy9D21L',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms extended straight down by your sides.","Step:2 Keeping your back straight and your core engaged, slowly bend your torso to one side, lowering your hand towards your knee.","Step:3 Pause for a moment at the bottom, then slowly return to the starting position.","Step:4 Repeat on the other side.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Hy9D21L.gif"}',
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
  'cable judo flip',
  'MvQPqVW',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques","shoulders"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with both hands at chest level, palms facing down.","Step:3 Engage your core and rotate your torso to the right, pulling the cable across your body.","Step:4 As you rotate, pivot your back foot and allow your hips to rotate naturally.","Step:5 Extend your arms fully and finish the movement by flipping the cable handle over your shoulder.","Step:6 Return to the starting position by reversing the movement, rotating your torso back to the center.","Step:7 Repeat the movement on the opposite side.","Step:8 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MvQPqVW.gif"}',
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
  'smith hip raise',
  'CqhoytW',
  'intermediate',
  'smith machine',
  '{"abs"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Position yourself on the smith machine with your back against the pad and your feet shoulder-width apart.","Step:2 Place your hands on the barbell, slightly wider than shoulder-width apart.","Step:3 Engage your core and glutes, then push through your heels to raise your hips off the ground.","Step:4 Continue lifting until your body forms a straight line from your knees to your shoulders.","Step:5 Hold for a moment at the top, then slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CqhoytW.gif"}',
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
  'curl-up',
  'g2oKspu',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/g2oKspu.gif"}',
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
  'barbell seated twist',
  'dFSNDOA',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on a flat bench with your feet flat on the ground and your knees bent.","Step:2 Hold a barbell with both hands in front of your chest, keeping your elbows slightly bent.","Step:3 Engage your core and slowly twist your torso to one side, keeping your back straight.","Step:4 Pause for a moment at the end of the twist, then slowly rotate back to the starting position.","Step:5 Repeat the twist to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dFSNDOA.gif"}',
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
  'landmine 180',
  'QYysSLV',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"obliques","quadriceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell with both hands in front of your chest.","Step:2 Bend your knees slightly and rotate your torso to the right, swinging the barbell down towards your right hip.","Step:3 As you reach the bottom of the movement, quickly reverse the motion and rotate your torso to the left, swinging the barbell up and across your body towards your left shoulder.","Step:4 Continue this twisting motion, alternating sides, for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QYysSLV.gif"}',
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
  'pull-in (on stability ball)',
  'UQr48Oi',
  'intermediate',
  'stability ball',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Start by sitting on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Place your hands on the sides of the stability ball for support.","Step:3 Engage your abs and slowly roll your hips forward, bringing your knees towards your chest.","Step:4 Pause for a moment at the top of the movement, then slowly extend your legs back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UQr48Oi.gif"}',
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
  'suspended abdominal fallout',
  'X3TCNEU',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Attach a suspension trainer to a high anchor point and adjust the straps to waist height.","Step:2 Stand facing away from the anchor point and hold the handles with your arms extended in front of you.","Step:3 Lean forward at the waist, keeping your body straight and your core engaged.","Step:4 Lower your body as far as you can while maintaining control and tension in your abs.","Step:5 Pause for a moment at the bottom, then slowly raise your body back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/X3TCNEU.gif"}',
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
  'arm slingers hanging bent knee legs',
  'uWpxD4v',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","back"}',
  '{"Step:1 Hang from a pull-up bar with your arms fully extended and your knees bent at a 90-degree angle.","Step:2 Engage your core and lift your knees towards your chest, bringing them as close to your elbows as possible.","Step:3 Slowly lower your legs back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uWpxD4v.gif"}',
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
  'band vertical pallof press',
  'G7PXMlT',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and wrap the band around a sturdy object at chest height.","Step:2 Hold the band with both hands and step away from the anchor point, creating tension in the band.","Step:3 Position yourself perpendicular to the anchor point, with your side facing the band.","Step:4 Extend your arms straight out in front of you, keeping your hands at chest height.","Step:5 Engage your core and press the band away from your chest, fully extending your arms.","Step:6 Hold the position for a few seconds, then slowly bring the band back towards your chest.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G7PXMlT.gif"}',
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
  'weighted russian twist (legs up)',
  'WU9BLIs',
  'intermediate',
  'weighted',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Sit on the ground with your knees bent and feet lifted off the ground, keeping your legs together.","Step:2 Hold the weight with both hands in front of your chest, keeping your elbows slightly bent.","Step:3 Lean back slightly to engage your core muscles.","Step:4 Twist your torso to the right, bringing the weight towards the ground on your right side.","Step:5 Pause for a moment, then twist your torso to the left, bringing the weight towards the ground on your left side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WU9BLIs.gif"}',
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
  'wheel rollerout',
  'NAgVB3t',
  'intermediate',
  'wheel roller',
  '{"abs"}',
  '{"lower back"}',
  '{"Step:1 Kneel on the floor and place the wheel roller in front of you.","Step:2 Place your hands on the handles of the wheel roller and extend your arms straight out in front of you.","Step:3 Engage your core muscles and slowly roll the wheel forward, keeping your back straight and your abs tight.","Step:4 Continue rolling forward until your body is fully extended and your arms are overhead.","Step:5 Pause for a moment, then slowly roll the wheel back towards your knees, maintaining control and keeping your abs engaged.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NAgVB3t.gif"}',
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
  'power point plank',
  'hCjGsRQ',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"shoulders","triceps","glutes"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line from head to toe.","Step:2 Engage your core and squeeze your glutes to maintain a stable position.","Step:3 Lower your body down onto your forearms, one arm at a time, maintaining a straight line from head to toe.","Step:4 Hold this position for the desired amount of time, keeping your core and glutes engaged.","Step:5 To return to the starting position, push through your forearms and lift your body back up into a high plank position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hCjGsRQ.gif"}',
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
  'lunge with twist',
  'K9VL0Jq',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"quadriceps","glutes","hamstrings"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 As you lunge, twist your torso to the right, bringing your left elbow towards your right knee.","Step:4 Pause for a moment, then return to the starting position.","Step:5 Repeat on the other side, stepping forward with your left foot and twisting your torso to the left.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/K9VL0Jq.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;