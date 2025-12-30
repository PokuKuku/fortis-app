INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell wrist curl v. 2',
  '6kSxYnw',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your knees bent.","Step:2 Hold a barbell with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:3 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:4 Slowly curl your wrists upward, bringing the barbell towards your forearms.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6kSxYnw.gif"}',
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
  'lever gripper hands',
  'mKwcrHn',
  'intermediate',
  'leverage machine',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Adjust the seat height and grip the handles of the leverage machine.","Step:2 Keep your back straight and your feet flat on the ground.","Step:3 Exhale and squeeze the handles, contracting your forearms.","Step:4 Hold the contraction for a second, then slowly release and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mKwcrHn.gif"}',
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
  'barbell palms down wrist curl over a bench',
  'yzYH9pI',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your forearms resting on your thighs, palms facing down.","Step:2 Hold a barbell with an overhand grip, hands shoulder-width apart.","Step:3 Lower the barbell towards the ground by flexing your wrists, keeping your forearms stationary.","Step:4 Pause for a moment at the bottom, then slowly raise the barbell back up by extending your wrists.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yzYH9pI.gif"}',
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
  'dumbbell one arm seated neutral wrist curl',
  'YtaCTYl',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand, palm facing up.","Step:2 Rest your forearm on your thigh, allowing your wrist to hang off the edge.","Step:3 Keeping your forearm stationary, curl your wrist upward as far as possible.","Step:4 Pause for a moment at the top, then slowly lower your wrist back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YtaCTYl.gif"}',
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
  'dumbbell lying supination on floor',
  'rEhi2o5',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Lie flat on your back on the floor with your legs extended and your arms by your sides, holding a dumbbell in each hand.","Step:2 Rotate your palms to face up, keeping your elbows close to your sides.","Step:3 Slowly curl the dumbbells towards your shoulders, squeezing your forearms.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rEhi2o5.gif"}',
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
  'barbell standing back wrist curl',
  '2qTvJAZ',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an overhand grip.","Step:2 Rest the barbell on the back of your hands with your palms facing down and your fingers pointing towards your body.","Step:3 Keeping your upper arms stationary, exhale and curl your wrists upwards as far as possible.","Step:4 Hold the contracted position for a brief pause, then inhale and slowly lower the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2qTvJAZ.gif"}',
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
  'barbell palms up wrist curl over a bench',
  'SJAA2IQ',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a barbell with an underhand grip, palms facing up.","Step:2 Rest your forearms on the bench, allowing your wrists to hang off the edge.","Step:3 Keeping your forearms stationary, exhale and curl your wrists upwards as far as possible.","Step:4 Hold the contracted position for a brief pause, then inhale and slowly lower the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SJAA2IQ.gif"}',
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
  'barbell reverse wrist curl',
  'LsZkfU6',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a barbell with an overhand grip, palms facing down.","Step:2 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:3 Slowly curl your wrists upward, bringing the barbell towards your body.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LsZkfU6.gif"}',
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
  'cable wrist curl',
  'LrV4s90',
  'intermediate',
  'cable',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Attach a straight bar to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:4 Rest your forearms on a bench or pad, with your wrists hanging off the edge.","Step:5 Keeping your forearms stationary, exhale and curl your wrists upward as far as possible.","Step:6 Pause for a moment at the top, then inhale and slowly lower the bar back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LrV4s90.gif"}',
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
  'dumbbell seated palms up wrist curl',
  '2dImyQ8',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.","Step:2 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:3 Slowly curl your wrists upward, squeezing your forearms at the top of the movement.","Step:4 Pause for a moment, then lower your wrists back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2dImyQ8.gif"}',
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
  'barbell revers wrist curl v. 2',
  'qDnGfDb',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your knees bent.","Step:2 Hold a barbell with an overhand grip, palms facing down, and your hands shoulder-width apart.","Step:3 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:4 Keeping your forearms stationary, exhale and curl your wrists upward as far as possible.","Step:5 Hold the contracted position for a brief pause, then inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qDnGfDb.gif"}',
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
  'side wrist pull stretch',
  'UtmIqcI',
  'intermediate',
  'body weight',
  '{"forearms"}',
  '{"wrists","hands"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms extended in front of you.","Step:2 Extend your right arm out to the side, parallel to the ground, with your palm facing down.","Step:3 With your left hand, grab your right hand and gently pull it towards your body, feeling a stretch in your right forearm.","Step:4 Hold the stretch for 15-30 seconds, then release.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UtmIqcI.gif"}',
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
  'dumbbell lying supination',
  'M2Pm3zj',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground.","Step:2 Hold a dumbbell in each hand with your palms facing up and your arms fully extended.","Step:3 Keeping your upper arms stationary, curl the dumbbells towards your shoulders by contracting your forearms.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/M2Pm3zj.gif"}',
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
  'wrist rollerer',
  'bd5b860',
  'intermediate',
  'weighted',
  '{"forearms"}',
  '{"biceps","triceps"}',
  '{"Step:1 Attach a weight to one end of a rope or bar.","Step:2 Hold the other end of the rope or bar with both hands, palms facing down.","Step:3 Stand with your feet shoulder-width apart and your arms fully extended in front of you.","Step:4 Slowly roll the weight up towards your hands by flexing your wrists.","Step:5 Pause for a moment at the top, then slowly lower the weight back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bd5b860.gif"}',
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
  'modified push up to lower arms',
  'arvaszz',
  'intermediate',
  'body weight',
  '{"forearms"}',
  '{"triceps","chest","shoulders"}',
  '{"Step:1 Start in a push-up position with your hands directly under your shoulders and your body in a straight line.","Step:2 Lower your body down towards the ground by bending your elbows, keeping them close to your sides.","Step:3 Once your elbows are at a 90-degree angle, lower your forearms to the ground, keeping your elbows directly under your shoulders.","Step:4 Pause for a moment, then push through your palms to lift your forearms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/arvaszz.gif"}',
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
  'dumbbell seated one arm rotate',
  '7f2jsqP',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"shoulders","biceps"}',
  '{"Step:1 Sit on a bench with your back straight and hold a dumbbell in one hand, resting it on your thigh.","Step:2 Raise the dumbbell up to shoulder height, keeping your elbow close to your body.","Step:3 Rotate your forearm outward, away from your body, while keeping your upper arm stationary.","Step:4 Pause for a moment at the top, then slowly rotate your forearm back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7f2jsqP.gif"}',
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
  'dumbbell over bench one arm reverse wrist curl',
  '4Jc36XM',
  'intermediate',
  'dumbbell',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand, palm facing down.","Step:2 Rest your forearm on the bench with your wrist hanging off the edge.","Step:3 Slowly curl your wrist upwards, bringing the dumbbell towards your forearm.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4Jc36XM.gif"}',
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
  'smith seated wrist curl',
  'B6dAO1t',
  'intermediate',
  'smith machine',
  '{"forearms"}',
  '{"biceps","brachialis"}',
  '{"Step:1 Sit on a bench in front of a Smith machine with your feet flat on the ground.","Step:2 Grasp the barbell with an underhand grip, hands shoulder-width apart.","Step:3 Rest your forearms on your thighs, allowing your wrists to hang off.","Step:4 Slowly curl your wrists upward, bringing the barbell towards your forearms.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/B6dAO1t.gif"}',
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
  'finger curls',
  'awG04cF',
  'intermediate',
  'barbell',
  '{"forearms"}',
  '{"wrist flexors","grip muscles"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a barbell with an underhand grip, palms facing up.","Step:2 Rest your forearms on your thighs, allowing your wrists to hang off the edge.","Step:3 Slowly curl your fingers towards your palms, squeezing the barbell tightly.","Step:4 Hold the contraction for a moment, then slowly release your fingers back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/awG04cF.gif"}',
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
  'wrist circles',
  '2zNKRUB',
  'intermediate',
  'body weight',
  '{"forearms"}',
  '{"hands","wrists"}',
  '{"Step:1 Extend your arms straight out in front of you.","Step:2 Make a fist with both hands.","Step:3 Rotate your wrists in a circular motion, keeping your arms still.","Step:4 Continue the wrist circles for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2zNKRUB.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;