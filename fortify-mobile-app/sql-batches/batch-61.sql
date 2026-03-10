INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable rope one arm hammer preacher curl',
  '4hATdoB',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a rope handle to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope handle with an underhand grip, palms facing up.","Step:4 Position your upper arm against the preacher bench pad, keeping your elbow slightly bent.","Step:5 Keep your back straight and your core engaged throughout the exercise.","Step:6 Slowly curl the rope handle towards your shoulder, keeping your upper arm stationary.","Step:7 Squeeze your biceps at the top of the movement, then slowly lower the rope handle back to the starting position.","Step:8 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4hATdoB.gif"}',
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
  'cable lying close-grip curl',
  '61GrD55',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a low pulley cable machine.","Step:2 Lie face up on a flat bench with your feet flat on the ground.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Extend your arms fully, keeping your elbows close to your sides.","Step:5 Keeping your upper arms stationary, curl the bar towards your chest by contracting your biceps.","Step:6 Pause for a moment at the top, squeezing your biceps.","Step:7 Slowly lower the bar back to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/61GrD55.gif"}',
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
  'barbell prone incline curl',
  'WLvTAv5',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie face down on the bench with your chest and stomach resting against it.","Step:3 Hold a barbell with an underhand grip, shoulder-width apart.","Step:4 Extend your arms fully, allowing the barbell to hang down towards the floor.","Step:5 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:6 Continue to raise the barbell until your biceps are fully contracted and the bar is at shoulder level.","Step:7 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:8 Inhale and slowly begin to lower the barbell back to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WLvTAv5.gif"}',
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
  'weighted seated bicep curl (on stability ball)',
  'b4b6afT',
  'intermediate',
  'medicine ball',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a medicine ball with an underhand grip, palms facing up, and let your arms hang down by your sides.","Step:3 Keeping your upper arms stationary, exhale and curl the medicine ball up towards your shoulders.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the medicine ball back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/b4b6afT.gif"}',
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
  'cable one arm curl',
  'YTur5nR',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable handle with an underhand grip, palm facing up.","Step:3 Keep your elbow close to your side and slowly curl your forearm up towards your shoulder.","Step:4 Pause for a moment at the top, then slowly lower your forearm back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YTur5nR.gif"}',
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
  'dumbbell preacher curl',
  'jivWf8n',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher curl bench with your upper arms resting on the pad and your chest against it.","Step:2 Hold a dumbbell in each hand with your palms facing up and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jivWf8n.gif"}',
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
  'dumbbell prone incline hammer curl',
  'cWemPG8',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the bench to a 45-degree incline.","Step:2 Lie face down on the bench with a dumbbell in each hand, palms facing each other.","Step:3 Allow your arms to hang straight down towards the floor, keeping your elbows slightly bent.","Step:4 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cWemPG8.gif"}',
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
  'barbell standing concentration curl',
  'vsMcDi9',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell in one hand, palm facing up.","Step:2 Rest your opposite hand on your thigh for support.","Step:3 Keeping your upper arm stationary, exhale and curl the weight up towards your shoulder.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the weight back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vsMcDi9.gif"}',
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
  'cable reverse preacher curl',
  'IwX5NqK',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the cable machine so that the preacher curl pad is at chest height.","Step:2 Sit on the preacher curl bench and place your upper arms on the pad, with your palms facing down and your elbows fully extended.","Step:3 Grab the cable handles with an underhand grip, shoulder-width apart.","Step:4 Keeping your upper arms stationary, exhale and curl the handles towards your shoulders, contracting your biceps.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the handles back to the starting position, fully extending your elbows.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IwX5NqK.gif"}',
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
  'olympic barbell hammer curl',
  'o1ntciW',
  'intermediate',
  'olympic barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold an Olympic barbell with an overhand grip.","Step:2 Let the barbell hang at arm''s length in front of your thighs, with your palms facing your body.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the barbell back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o1ntciW.gif"}',
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
  'dumbbell seated hammer curl',
  'IGtBdNT',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing your torso and arms extended straight down.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IGtBdNT.gif"}',
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
  'dumbbell lying supine curl',
  'KUaZst7',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing up and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KUaZst7.gif"}',
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
  'cable overhead curl on exercise ball',
  'ioTf098',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Sit on an exercise ball and hold the cable handle with an underhand grip.","Step:2 Extend your arms fully overhead, keeping your elbows close to your ears.","Step:3 Slowly curl the cable down towards your forehead, keeping your upper arms stationary.","Step:4 Pause for a moment at the bottom of the movement, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ioTf098.gif"}',
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
  'dumbbell alternate hammer preacher curl',
  'fy7Tgy4',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with a dumbbell in each hand, palms facing your torso and arms fully extended.","Step:2 Keep your upper arms stationary and exhale as you curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fy7Tgy4.gif"}',
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
  'dumbbell standing preacher curl',
  'hq2hyDH',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand upright with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing forward.","Step:2 Rest the back of your upper arms against the preacher bench or an incline bench, with your elbows slightly bent.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hq2hyDH.gif"}',
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
  'cable seated overhead curl',
  'DpWMFP5',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Sit on a bench facing the cable machine with your feet flat on the ground.","Step:2 Grasp the cable attachment with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:3 Keep your upper arms stationary and your elbows close to your sides.","Step:4 Exhale and curl the cable attachment towards your shoulders, contracting your biceps.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the cable attachment back to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DpWMFP5.gif"}',
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
  'dumbbell one arm prone curl',
  'JWjujiY',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in one hand, palm facing down.","Step:2 Extend your arm fully, letting it hang straight down towards the floor.","Step:3 Keeping your upper arm stationary, curl the dumbbell up towards your shoulder by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JWjujiY.gif"}',
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
  'cable drag curl',
  'dXz8zjF',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable attachment with an underhand grip, palms facing up, and arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the cable attachment towards your shoulders by contracting your biceps.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Inhale and slowly lower the cable attachment back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dXz8zjF.gif"}',
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
  'cable two arm curl on incline bench',
  'H9y3Dkr',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an incline bench with your back against the pad and your feet flat on the ground.","Step:2 Grasp the cable handles with an underhand grip, palms facing up, and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the handles towards your shoulders while contracting your biceps.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Inhale and slowly lower the handles back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/H9y3Dkr.gif"}',
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
  'barbell standing wide-grip curl',
  'NdIb5Z1',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an overhand grip, hands wider than shoulder-width apart.","Step:2 Let the barbell hang at arm''s length in front of your thighs, with your palms facing away from your body.","Step:3 Keeping your upper arms stationary, exhale and curl the barbell upward by contracting your biceps.","Step:4 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the barbell back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NdIb5Z1.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;