INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'band single leg calf raise',
  '9JprnPh',
  'intermediate',
  'band',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet hip-width apart and place the band around the ball of your left foot.","Step:2 Hold onto a stable object for balance if needed.","Step:3 Slowly raise your left heel off the ground, lifting your body weight onto the ball of your foot.","Step:4 Pause for a moment at the top, then slowly lower your left heel back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the right leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9JprnPh.gif"}',
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
  'lever seated calf press',
  'Ie9UGty',
  'intermediate',
  'leverage machine',
  '{"calves"}',
  '{"soleus","hamstrings"}',
  '{"Step:1 Adjust the seat of the machine so that your shoulders are aligned with the lever pad.","Step:2 Place your toes on the lower portion of the platform and position your knees under the lever pad.","Step:3 Grasp the handles on the sides of the seat for stability.","Step:4 Press the lever pad down by extending your ankles, lifting your heels as high as possible.","Step:5 Pause for a moment at the top of the movement, then slowly lower your heels back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ie9UGty.gif"}',
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
  'calf push stretch with hands against wall elite',
  'vobtVkm',
  'intermediate',
  'body weight',
  '{"calves"}',
  '{"hamstrings"}',
  '{"Step:1 Stand facing a wall with your feet hip-width apart.","Step:2 Place your hands against the wall at shoulder height.","Step:3 Step back with one foot, keeping your heel on the ground and your leg straight.","Step:4 Bend your front knee slightly and lean forward, feeling a stretch in your calf.","Step:5 Hold the stretch for 20-30 seconds.","Step:6 Switch legs and repeat the stretch. Focus on elite movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vobtVkm.gif"}',
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
  'triple style sled one leg calf press on leg press',
  'Dx2RIva',
  'intermediate',
  'sled machine',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the seat of the leg press machine so that your knees are slightly bent when your feet are on the sled.","Step:2 Sit on the machine with your back against the backrest and your feet on the sled, shoulder-width apart.","Step:3 Place your toes and the balls of your feet on the sled, keeping your heels off.","Step:4 Push the sled forward by extending your ankles, keeping your knees slightly bent.","Step:5 Pause for a moment at the top, then slowly lower the sled back down by flexing your ankles.","Step:6 Repeat for the desired number of repetitions. Perform with triple intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Dx2RIva.gif"}',
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
  'dumbbell seated one leg calf raise - hammer grip deep',
  'UoX77uR',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and a dumbbell resting on your thighs.","Step:2 Place one foot on a raised surface, such as a step or block, with your heel hanging off the edge.","Step:3 Hold the dumbbell with a hammer grip, meaning your palms are facing each other and your fingers are wrapped around the handle.","Step:4 Keeping your core engaged and your back straight, slowly raise your heel as high as possible by pushing through the ball of your foot.","Step:5 Pause for a moment at the top, then slowly lower your heel back down to the starting position.","Step:6 (deep variation) Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UoX77uR.gif"}',
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
  'targeted style single leg calf raise (on a dumbbell)',
  'DICPHtq',
  'intermediate',
  'dumbbell',
  '{"calves"}',
  '{"ankles","feet"}',
  '{"Step:1 Stand with your feet hip-width apart and hold a dumbbell in one hand.","Step:2 Lift one foot off the ground and balance on the other foot.","Step:3 Slowly raise your heel as high as possible, using your calf muscles. Emphasize targeted control.","Step:4 Pause for a moment at the top, then slowly lower your heel back down.","Step:5 Repeat for the desired number of repetitions, then switch to the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DICPHtq.gif"}',
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
  'kettlebell double alternating hang clean',
  'a4F9Oyc',
  'intermediate',
  'kettlebell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Allow the kettlebells to hang straight down in front of your body.","Step:4 In one fluid motion, explosively extend your hips and knees while shrugging your shoulders.","Step:5 As the kettlebells rise, pull them up towards your shoulders, keeping your elbows high and out to the sides.","Step:6 Catch the kettlebells at shoulder height, with your palms facing inward and your elbows pointing forward.","Step:7 Lower the kettlebells back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/a4F9Oyc.gif"}',
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
  'cable reverse one arm curl',
  'gVlnLIJ',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable handle with an underhand grip, palm facing down.","Step:3 Keep your elbow close to your side and slowly curl your forearm up towards your shoulder.","Step:4 Pause for a moment at the top, then slowly lower your forearm back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gVlnLIJ.gif"}',
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
  'dumbbell incline biceps curl',
  'F3xgbjF',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, palms facing forward, and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/F3xgbjF.gif"}',
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
  'dumbbell seated inner biceps curl',
  'KXyoEtA',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.","Step:2 Rest your upper arms on your thighs, allowing the dumbbells to hang down.","Step:3 Keeping your upper arms stationary, curl the dumbbells up towards your shoulders by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KXyoEtA.gif"}',
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
  'dumbbell seated biceps curl to shoulder press',
  'OeL23VY',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in each hand with your palms facing forward and arms fully extended.","Step:3 Keeping your elbows close to your sides, curl the dumbbells up towards your shoulders.","Step:4 Once your forearms are vertical, rotate your wrists so that your palms are facing forward.","Step:5 Press the dumbbells overhead until your arms are fully extended.","Step:6 Lower the dumbbells back down to the starting position by reversing the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OeL23VY.gif"}',
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
  'dumbbell hammer curls (with arm blaster)',
  'GNhAeJ0',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 This will be your starting position.","Step:4 Now, while holding your upper arm stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GNhAeJ0.gif"}',
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
  'lever preacher curl v. 2',
  'ye84CTU',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your upper arms resting on the pad and your chest against the support.","Step:2 Grasp the handles with an underhand grip, slightly wider than shoulder-width apart.","Step:3 Keep your upper arms stationary and exhale as you curl the handles towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Inhale as you slowly lower the handles back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ye84CTU.gif"}',
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
  'dumbbell one arm reverse preacher curl',
  'bWxq4op',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your chest against the pad and your arm extended over the edge of the bench, holding a dumbbell with an underhand grip.","Step:2 Lower the dumbbell slowly until your arm is fully extended.","Step:3 Curl the dumbbell back up towards your shoulder, keeping your upper arm stationary.","Step:4 Squeeze your biceps at the top of the movement, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bWxq4op.gif"}',
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
  'dumbbell peacher hammer curl',
  'F1KxjBa',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 This will be your starting position.","Step:4 Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/F1KxjBa.gif"}',
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
  'dumbbell seated revers grip concentration curl',
  'lyKCLmK',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in one hand, palm facing up.","Step:2 Rest your elbow on the inside of your thigh, just above the knee.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell towards your shoulder.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lyKCLmK.gif"}',
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
  'barbell standing close grip curl',
  '4dUn2iv',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, hands close together.","Step:2 Keep your elbows close to your torso and your upper arms stationary throughout the movement.","Step:3 Exhale as you curl the weights while contracting your biceps. Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale as you slowly begin to bring the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4dUn2iv.gif"}',
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
  'ez-barbell standing wide grip biceps curl',
  'OVTZ65k',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold the ez barbell with an underhand grip, hands wider than shoulder-width apart.","Step:2 Keep your elbows close to your torso and your upper arms stationary throughout the movement.","Step:3 Curl the barbell up towards your shoulders by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OVTZ65k.gif"}',
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
  'dumbbell zottman curl',
  'kXaIn5A',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your body.","Step:2 Keep your elbows close to your torso and rotate your palms to face forward.","Step:3 Curl the dumbbells up to your shoulders while keeping your upper arms stationary.","Step:4 At the top of the movement, rotate your wrists so that your palms are facing away from your body.","Step:5 Slowly lower the dumbbells back to the starting position, rotating your palms back to facing your body.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kXaIn5A.gif"}',
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
  'dumbbell kneeling bicep curl exercise ball',
  '2JCuFTU',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Kneel on the floor with an exercise ball in front of you.","Step:2 Place your elbows on top of the exercise ball, holding a dumbbell in each hand with your palms facing up.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2JCuFTU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;