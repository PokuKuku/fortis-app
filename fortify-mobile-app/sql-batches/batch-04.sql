INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'front lever reps',
  'hbY9wqG',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"core","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with an overhand grip, palms facing away from you.","Step:2 Engage your core and pull your shoulder blades down and back.","Step:3 Keeping your body straight, lift your legs up until they are parallel to the ground.","Step:4 Hold this position for as long as you can, aiming for 10-20 seconds.","Step:5 Slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hbY9wqG.gif"}',
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
  'rope climb',
  'yaAxcQr',
  'intermediate',
  'rope',
  '{"upper back"}',
  '{"forearms","biceps","shoulders"}',
  '{"Step:1 Stand facing the rope with your feet shoulder-width apart.","Step:2 Grab the rope with both hands, palms facing towards you.","Step:3 Bend your knees slightly and engage your core.","Step:4 Begin pulling yourself up the rope by alternating hand-over-hand movements.","Step:5 Use your legs to assist in the upward movement.","Step:6 Continue climbing until you reach the desired height or the top of the rope.","Step:7 To descend, reverse the hand-over-hand movement while controlling your descent.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yaAxcQr.gif"}',
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
  'suspended row',
  '4OaumBr',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Set up a suspension trainer at an appropriate height.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Hold the handles with an overhand grip, palms facing each other.","Step:4 Lean back, keeping your body straight and your heels on the ground.","Step:5 Pull your chest towards the handles, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower yourself back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4OaumBr.gif"}',
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
  'barbell pendlay row',
  'r0z6xzQ',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Bend forward at the hips, keeping your back straight and your chest up.","Step:3 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Pull the barbell towards your upper abdomen, squeezing your shoulder blades together.","Step:5 Lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/r0z6xzQ.gif"}',
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
  'barbell one arm bent over row',
  'Jsgsc27',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a barbell with one hand using an overhand grip.","Step:2 Bend forward at the hips, keeping your back straight and your head in a neutral position.","Step:3 Pull the barbell up towards your chest, keeping your elbow close to your body and squeezing your shoulder blades together.","Step:4 Lower the barbell back down to the starting position in a controlled manner.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Jsgsc27.gif"}',
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
  'lever one arm lateral high row',
  'OIFMAp1',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself facing the machine.","Step:2 Grasp the handle with one hand and keep your back straight.","Step:3 Pull the handle towards your body, keeping your elbow close to your side.","Step:4 Squeeze your back muscles at the top of the movement.","Step:5 Slowly release the handle back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OIFMAp1.gif"}',
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
  'skin the cat',
  'MSfvriJ',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"shoulders","core"}',
  '{"Step:1 Start by hanging from a bar with your arms fully extended and your body relaxed.","Step:2 Engage your core and lift your legs up, bringing your knees towards your chest.","Step:3 Continue to lift your legs up and over your head, allowing your body to pass through the arms.","Step:4 Once your legs are fully extended over your head, begin to lower them back down towards the starting position.","Step:5 As you lower your legs, allow your body to pass back through the arms until you are hanging with your arms fully extended again.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MSfvriJ.gif"}',
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
  'inverted row on bench',
  'Mxa7Cr8',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a bench at a height that allows your body to hang freely underneath it.","Step:2 Lie face up on the ground with your head towards the bench.","Step:3 Reach up and grab the bench with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Position your body so that your heels are on the ground and your arms are fully extended.","Step:5 Engage your core and squeeze your shoulder blades together as you pull your chest up towards the bench.","Step:6 Pause for a moment at the top of the movement, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Mxa7Cr8.gif"}',
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
  'cable decline seated wide-grip row',
  'kesXOpB',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the decline bench facing the cable machine with your feet securely placed on the footrests.","Step:2 Grasp the cable attachment with a wide overhand grip, palms facing down.","Step:3 Lean back slightly, keeping your back straight and your core engaged.","Step:4 Pull the cable towards your lower chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the contraction, then slowly release the cable back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kesXOpB.gif"}',
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
  'medicine ball overhead slam',
  'oHg8eop',
  'intermediate',
  'medicine ball',
  '{"upper back"}',
  '{"shoulders","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a medicine ball with both hands above your head.","Step:2 Engage your core and keep your back straight.","Step:3 Bend your knees slightly and forcefully slam the medicine ball down to the ground in front of you.","Step:4 As you slam the ball down, use your entire body to generate power, including your shoulders and core.","Step:5 Catch the ball on the bounce and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oHg8eop.gif"}',
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
  'kettlebell one arm row',
  'g9AsZ8P',
  'intermediate',
  'kettlebell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and your core engaged.","Step:3 Pull the kettlebell up towards your chest, keeping your elbow close to your body and squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower the kettlebell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides and repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/g9AsZ8P.gif"}',
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
  'cable high row (kneeling)',
  'ZSJNetl',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Attach a straight bar to a cable machine at chest height.","Step:2 Kneel down in front of the cable machine and grab the bar with an overhand grip, hands shoulder-width apart.","Step:3 Sit back on your heels, keeping your back straight and your core engaged.","Step:4 Pull the bar towards your upper abdomen, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top of the movement, then slowly release the bar back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZSJNetl.gif"}',
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
  'dumbbell incline y-raise',
  'PbzNu7c',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"shoulders","rear deltoids"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, palms facing inwards.","Step:2 Lean forward slightly and let your arms hang straight down, keeping a slight bend in your elbows.","Step:3 Raise your arms out to the sides and up in a Y shape until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PbzNu7c.gif"}',
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
  'lever bent-over row with v-bar',
  'LuBEORI',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself facing the machine.","Step:2 Grasp the v-bar with an overhand grip, keeping your back straight and your knees slightly bent.","Step:3 Pull the v-bar towards your abdomen, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top of the movement, then slowly release the weight back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LuBEORI.gif"}',
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
  'cable one arm bent over row',
  'EIsE3u8',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Grasp the cable handle with one hand, palm facing inward, and extend your arm fully.","Step:4 Pull the cable handle towards your body, keeping your elbow close to your side, until your hand reaches your lower chest.","Step:5 Pause for a moment, then slowly extend your arm back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EIsE3u8.gif"}',
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
  'inverted row with straps',
  'jdiExfW',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a suspension trainer or straps at chest height.","Step:2 Stand facing the anchor point and grab the handles with an overhand grip.","Step:3 Walk your feet forward, leaning back until your body is at an angle.","Step:4 Keep your body straight and engage your core.","Step:5 Pull your chest towards the handles, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower yourself back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jdiExfW.gif"}',
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
  'elbow lift - reverse push-up',
  'wbUYILZ',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start by lying face down on the ground with your legs extended and your hands placed directly under your shoulders.","Step:2 Engage your core and press through your palms to lift your upper body off the ground, keeping your elbows close to your sides.","Step:3 Pause at the top for a moment, squeezing your upper back muscles.","Step:4 Slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wbUYILZ.gif"}',
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
  'lever seated row',
  '7I6LNUG',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footrests to a comfortable position.","Step:2 Sit on the machine with your chest against the pad and your feet on the footrests.","Step:3 Grasp the handles with an overhand grip, shoulder-width apart.","Step:4 Keep your back straight and your core engaged.","Step:5 Pull the handles towards your body, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement.","Step:7 Slowly release the handles and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7I6LNUG.gif"}',
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
  'cable incline bench row',
  'yaMIo4D',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","rear deltoids"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle and attach a cable handle to the low pulley.","Step:2 Sit on the bench facing the cable machine with your feet flat on the floor and your knees slightly bent.","Step:3 Grasp the cable handle with an overhand grip and extend your arms fully in front of you.","Step:4 Lean forward from your hips while keeping your back straight and your core engaged.","Step:5 Pull the cable handle towards your chest by retracting your shoulder blades and bending your elbows.","Step:6 Squeeze your back muscles at the top of the movement, then slowly extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yaMIo4D.gif"}',
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
  'lever bent over row',
  'X3cqyXz',
  'intermediate',
  'barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend forward at the hips, keeping your back straight and chest up.","Step:4 Pull the barbell towards your lower chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/X3cqyXz.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;