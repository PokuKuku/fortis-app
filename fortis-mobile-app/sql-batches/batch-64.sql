INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell curl',
  '25GPyDY',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing forward.","Step:2 Keep your elbows close to your torso and exhale as you curl the weights while contracting your biceps.","Step:3 Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale as you slowly begin to lower the bar back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/25GPyDY.gif"}',
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
  'dumbbell bicep curl on exercise ball with leg raised',
  '2NImIAG',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing forward and your arms fully extended.","Step:3 Slowly curl the dumbbells towards your shoulders, keeping your elbows close to your sides.","Step:4 Pause for a moment at the top of the movement, then slowly lower the dumbbells back to the starting position.","Step:5 While performing the bicep curl, raise one leg off the ground and hold it in the air for the duration of the exercise.","Step:6 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2NImIAG.gif"}',
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
  'dumbbell seated preacher curl',
  '7D5bgLT',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher curl bench with your feet flat on the floor.","Step:2 Hold a dumbbell in one hand with an underhand grip, resting your upper arm against the preacher pad.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7D5bgLT.gif"}',
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
  'dumbbell alternate seated hammer curl',
  '6em2Dxj',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing your torso and arms extended down.","Step:2 Keep your back straight and your elbows close to your torso.","Step:3 Exhale and curl the dumbbell in your right hand towards your shoulder, keeping your upper arm stationary.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Pause for a brief moment, then inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat the movement with your left arm.","Step:7 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6em2Dxj.gif"}',
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
  'ez bar seated close grip concentration curl',
  'Dsfz0Id',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold an EZ barbell with an underhand grip.","Step:2 Rest your elbow on the inside of your thigh, just above the knee.","Step:3 Curl the barbell up towards your shoulder while keeping your upper arm stationary.","Step:4 Squeeze your biceps at the top of the movement, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Dsfz0Id.gif"}',
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
  'dumbbell alternating bicep curl with leg raised on exercise ball',
  'Zwiw7XR',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing forward.","Step:2 Place an exercise ball behind you and position one foot on top of it, keeping your balance.","Step:3 With your arms fully extended and elbows close to your sides, curl one dumbbell towards your shoulder while keeping your upper arm stationary.","Step:4 Lower the dumbbell back down to the starting position and repeat with the other arm.","Step:5 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Zwiw7XR.gif"}',
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
  'ez barbell seated curls',
  'jtFKbt5',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and your back straight.","Step:2 Hold the ez barbell with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:3 Rest your upper arms on your thighs, allowing the ez barbell to hang down in front of you.","Step:4 Keeping your upper arms stationary, exhale and curl the ez barbell upwards towards your shoulders.","Step:5 Pause for a moment at the top, squeezing your biceps.","Step:6 Inhale and slowly lower the ez barbell back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jtFKbt5.gif"}',
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
  'dumbbell biceps curl',
  'NbVPDMW',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NbVPDMW.gif"}',
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
  'cable curl',
  'G08RZcQ',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable attachment with an underhand grip, palms facing up.","Step:3 Keep your elbows close to your sides and your upper arms stationary.","Step:4 Exhale and curl the cable attachment towards your shoulders, contracting your biceps.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the cable attachment back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G08RZcQ.gif"}',
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
  'dumbbell hammer curl',
  'slDvUAU',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 This will be your starting position.","Step:4 Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/slDvUAU.gif"}',
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
  'dumbbell one arm zottman preacher curl',
  'sxY5Biu',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher curl bench and hold a dumbbell in one hand with an underhand grip.","Step:2 Rest your upper arm on the preacher bench pad, allowing your arm to fully extend.","Step:3 Curl the dumbbell up towards your shoulder, keeping your upper arm stationary.","Step:4 At the top of the curl, rotate your wrist so that your palm faces up.","Step:5 Slowly lower the dumbbell back down to the starting position, rotating your wrist back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sxY5Biu.gif"}',
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
  'biceps narrow pull-ups',
  '50BETrz',
  'intermediate',
  'body weight',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.","Step:2 Engage your core and pull yourself up towards the bar, focusing on using your biceps to lift your body.","Step:3 Pause for a moment at the top, then slowly lower yourself back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/50BETrz.gif"}',
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
  'dumbbell cross body hammer curl v. 2',
  'HDYiZcY',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your body.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps, bringing the dumbbells as close to your opposite shoulder as possible.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HDYiZcY.gif"}',
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
  'cable hammer curl (with rope)',
  'HPlPoQA',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand upright with your feet shoulder-width apart and a slight bend in your knees.","Step:2 Hold the cable rope attachment with an underhand grip, palms facing each other, and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the cable rope attachment until your biceps are fully contracted and the rope is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the cable rope attachment back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HPlPoQA.gif"}',
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
  'smith machine bicep curl',
  'zILLZ98',
  'intermediate',
  'smith machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the height of the smith machine bar to be at waist level.","Step:2 Stand facing the smith machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, hands slightly wider than shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary.","Step:5 Exhale and curl the bar up towards your shoulders, contracting your biceps.","Step:6 Pause for a moment at the top of the movement, squeezing your biceps.","Step:7 Inhale and slowly lower the bar back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zILLZ98.gif"}',
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
  'dumbbell high curl',
  'qAmNMJY',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward.","Step:2 Keep your upper arms stationary and curl the dumbbells as high as possible while contracting your biceps.","Step:3 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qAmNMJY.gif"}',
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
  'ez barbell close grip preacher curl - precision variation',
  'M8IolhQ',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher curl bench and place your upper arms on the pad, gripping the ez barbell with an underhand grip.","Step:2 Rest your triceps on the pad and fully extend your arms, keeping your back straight.","Step:3 Slowly curl the barbell towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Lower the barbell back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions. Emphasize precision control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/M8IolhQ.gif"}',
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
  'cable concentration curl tempo',
  '8yBgwBS',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the floor and your knees slightly bent.","Step:2 Hold the cable handle with an underhand grip and rest your elbow against the inside of your thigh. Focus on tempo movement.","Step:3 Keeping your upper arm stationary, exhale and curl the cable handle towards your shoulder while contracting your biceps.","Step:4 Pause for a moment at the top of the movement, then inhale and slowly lower the cable handle back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8yBgwBS.gif"}',
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
  'barbell reverse preacher curl inclined',
  'EqHIIjJ',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your chest against the pad and your arms extended straight down, holding a barbell with an overhand grip.","Step:2 Keeping your upper arms stationary, exhale and curl the barbell upward while contracting your biceps.","Step:3 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level. Perform with inclined intensity.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EqHIIjJ.gif"}',
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
  'lever reverse grip preacher curl with precision',
  '7y9JIMj',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine.","Step:2 Grasp the handles with an underhand grip, palms facing up.","Step:3 Rest your upper arms on the preacher pad, ensuring your elbows are fully extended. Maintain precision form throughout.","Step:4 Keeping your upper arms stationary, exhale and curl the handles towards your shoulders.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the handles back to the starting position, fully extending your elbows.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7y9JIMj.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;