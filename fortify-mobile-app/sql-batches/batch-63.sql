INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'biceps leg concentration curl',
  'sJFIDIp',
  'intermediate',
  'body weight',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your legs spread apart and your feet flat on the ground.","Step:2 Hold a dumbbell in one hand and place your elbow on the inside of your thigh, just above the knee.","Step:3 With your palm facing up, curl the dumbbell towards your shoulder while keeping your upper arm stationary.","Step:4 Squeeze your biceps at the top of the movement, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sJFIDIp.gif"}',
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
  'dumbbell hammer curl v. 2',
  '2NpxjC1',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 This will be your starting position.","Step:4 Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2NpxjC1.gif"}',
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
  'cable preacher curl',
  'P2lNrGL',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the cable machine so that the preacher curl pad is at chest height.","Step:2 Sit on the preacher curl bench and place your upper arms on the pad, gripping the cable attachment with an underhand grip.","Step:3 Keep your back straight and your elbows tucked in at your sides.","Step:4 Slowly curl the cable attachment up towards your shoulders, squeezing your biceps at the top of the movement.","Step:5 Pause for a moment, then slowly lower the cable attachment back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P2lNrGL.gif"}',
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
  'dumbbell revers grip biceps curl',
  'e4ojVhP',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing down and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/e4ojVhP.gif"}',
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
  'kettlebell bottoms up clean from the hang position',
  '4KJEpzb',
  'intermediate',
  'kettlebell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in one hand with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Allow the kettlebell to hang down between your legs, with your arm fully extended.","Step:4 In one fluid motion, explosively extend your hips and knees while pulling the kettlebell up towards your shoulder.","Step:5 As the kettlebell reaches shoulder height, rotate your wrist so that the bottom of the kettlebell is facing up.","Step:6 Catch the kettlebell at shoulder height with your elbow bent and your palm facing up.","Step:7 Lower the kettlebell back down to the starting position by reversing the movement.","Step:8 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4KJEpzb.gif"}',
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
  'dumbbell standing zottman preacher curl',
  'P2nRiUa',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward.","Step:2 Place your upper arms against the preacher bench and keep your elbows slightly bent.","Step:3 Curl the dumbbells up towards your shoulders while keeping your upper arms stationary.","Step:4 At the top of the movement, rotate your wrists so that your palms are facing downward.","Step:5 Slowly lower the dumbbells back to the starting position, rotating your wrists back to the starting position as well.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P2nRiUa.gif"}',
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
  'dumbbell reverse preacher curl',
  'O8Aq69u',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your upper arms resting on the pad and your chest against the support.","Step:2 Hold a dumbbell in each hand with an underhand grip, palms facing up.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells as you contract your biceps.","Step:4 Continue to curl the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O8Aq69u.gif"}',
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
  'dumbbell standing concentration curl',
  '7inpWch',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand, with your arm fully extended and palm facing inwards.","Step:2 Place your opposite hand on your thigh for support.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell towards your shoulder by contracting your biceps.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7inpWch.gif"}',
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
  'dumbbell standing reverse curl',
  '0IgNjSM',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps. Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:3 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:4 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0IgNjSM.gif"}',
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
  'cable seated curl',
  '8oYqOt9',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a cable machine with your feet flat on the ground and your back straight.","Step:2 Grasp the cable attachment with an underhand grip, palms facing up, and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the cable attachment towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Inhale and slowly lower the cable attachment back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8oYqOt9.gif"}',
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
  'dumbbell incline hammer curl',
  'ByX0WxV',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, palms facing your torso and arms fully extended.","Step:2 Keep your back against the bench and your feet flat on the floor.","Step:3 While keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ByX0WxV.gif"}',
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
  'barbell reverse curl',
  'xNrS20v',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an overhand grip, palms facing down.","Step:2 Keep your upper arms stationary and exhale as you curl the barbell upward, contracting your biceps.","Step:3 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale as you slowly lower the barbell back to the starting position, keeping your upper arms stationary.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xNrS20v.gif"}',
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
  'dumbbell over bench neutral wrist curl',
  'BKa8dmT',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.","Step:2 Rest your forearms on the bench, allowing your wrists to hang off the edge.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells up towards your shoulders.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BKa8dmT.gif"}',
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
  'dumbbell seated biceps curl (on stability ball)',
  'WgJnBH5',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing forward and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WgJnBH5.gif"}',
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
  'dumbbell biceps curl (with arm blaster)',
  'nlJsbkW',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nlJsbkW.gif"}',
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
  'cable concentration curl',
  'NvfE43H',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the floor and your knees slightly bent.","Step:2 Hold the cable handle with an underhand grip and rest your elbow against the inside of your thigh.","Step:3 Keeping your upper arm stationary, exhale and curl the cable handle towards your shoulder while contracting your biceps.","Step:4 Pause for a moment at the top of the movement, then inhale and slowly lower the cable handle back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NvfE43H.gif"}',
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
  'band alternating biceps curl',
  '3omWx6P',
  'intermediate',
  'band',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band with an underhand grip, palms facing up.","Step:2 Keep your elbows close to your sides and slowly curl one arm up towards your shoulder, squeezing your biceps at the top.","Step:3 Lower the arm back down to the starting position and repeat with the other arm.","Step:4 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3omWx6P.gif"}',
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
  'ez-bar biceps curl (with arm blaster)',
  'tJ5nYqo',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold the ez barbell with an underhand grip, palms facing up.","Step:2 Place your upper arms against the arm blaster, keeping them stationary throughout the exercise.","Step:3 Keeping your elbows close to your body, exhale and curl the barbell up towards your shoulders.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tJ5nYqo.gif"}',
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
  'dumbbell standing alternate hammer curl and press',
  'LeaZOIz',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your body.","Step:2 Keep your elbows close to your torso and your back straight.","Step:3 Exhale and curl the dumbbell in your right hand towards your shoulder, keeping your upper arm stationary.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat the curl with your left hand.","Step:7 After completing the curl with your left hand, exhale and press the dumbbell in your right hand overhead.","Step:8 Extend your arm fully and hold for a moment at the top.","Step:9 Inhale and slowly lower the dumbbell back to the starting position.","Step:10 Repeat the press with your left hand.","Step:11 Continue alternating between curls and presses for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LeaZOIz.gif"}',
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
  'dumbbell one arm hammer preacher curl',
  '4dF3maG',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with a dumbbell in one hand and your upper arm resting on the pad.","Step:2 Hold the dumbbell with a neutral grip (palms facing your body).","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4dF3maG.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;