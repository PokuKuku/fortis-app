INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell seated curl',
  'TiaZTxx',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and a dumbbell in each hand, palms facing forward.","Step:2 Keep your back straight and your elbows close to your torso.","Step:3 Exhale and curl the dumbbells up towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TiaZTxx.gif"}',
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
  'dumbbell one arm seated bicep curl on exercise ball',
  's999Hdo',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing up and your arm fully extended.","Step:3 Keeping your upper arm stationary, curl the dumbbell towards your shoulder by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s999Hdo.gif"}',
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
  'ez barbell close-grip curl',
  'V4ryaZa',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold the ez barbell with an underhand grip, hands shoulder-width apart.","Step:2 Keep your elbows close to your torso and your upper arms stationary throughout the movement.","Step:3 Curl the barbell up towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/V4ryaZa.gif"}',
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
  'barbell standing wide grip biceps curl',
  'faHKVkK',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an underhand grip, hands wider than shoulder-width apart.","Step:2 Keep your back straight and your elbows close to your torso.","Step:3 Exhale and curl the barbell up towards your shoulders, keeping your upper arms stationary.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/faHKVkK.gif"}',
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
  'cable lying bicep curl',
  'otqIxU4',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a low pulley cable machine.","Step:2 Lie face up on a flat bench with your feet flat on the ground.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Extend your arms fully, keeping your elbows close to your sides.","Step:5 Keeping your upper arms stationary, exhale and curl the bar up towards your shoulders.","Step:6 Pause for a moment at the top, squeezing your biceps.","Step:7 Inhale and slowly lower the bar back to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/otqIxU4.gif"}',
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
  'cable reverse curl',
  'eOG0r6v',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and your knees slightly bent.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Exhale and curl the bar up towards your shoulders, contracting your biceps.","Step:6 Pause for a moment at the top, squeezing your biceps.","Step:7 Inhale and slowly lower the bar back to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eOG0r6v.gif"}',
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
  'dumbbell incline curl',
  'ae9UoXQ',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, palms facing forward.","Step:2 Rest your upper arms on the incline bench and let your elbows hang down, fully extending your arms.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ae9UoXQ.gif"}',
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
  'dumbbell zottman preacher curl',
  'y5U5B9Y',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with a dumbbell in each hand, palms facing up and elbows resting on the pad.","Step:2 Curl the dumbbells up towards your shoulders, keeping your upper arms stationary and your palms facing up.","Step:3 At the top of the curl, rotate your wrists so that your palms are facing down.","Step:4 Slowly lower the dumbbells back down to the starting position, rotating your wrists back to the starting position as you do so.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/y5U5B9Y.gif"}',
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
  'cable standing inner curl',
  'YwnI4ja',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Grasp the cable handle with an underhand grip, palms facing up.","Step:3 Keep your elbows close to your sides and your upper arms stationary.","Step:4 Exhale and curl the cable handle towards your shoulders, contracting your biceps.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the cable handle back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YwnI4ja.gif"}',
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
  'cable close grip curl',
  'BCGQ6J5',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and your knees slightly bent.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Exhale and curl the bar up towards your shoulders, contracting your biceps.","Step:6 Pause for a moment at the top of the movement, squeezing your biceps.","Step:7 Inhale and slowly lower the bar back to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BCGQ6J5.gif"}',
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
  'bodyweight side lying biceps curl',
  'gscGLOU',
  'intermediate',
  'body weight',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie on your side with your legs extended and your head supported by your arm.","Step:2 Hold your upper arm against your side and bend your elbow to curl your forearm towards your shoulder.","Step:3 Pause for a moment at the top, then slowly lower your forearm back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gscGLOU.gif"}',
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
  'dumbbell standing one arm concentration curl',
  '8fgqP5a',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a dumbbell in one hand, palm facing up.","Step:2 Place your free hand on your thigh for support.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell towards your shoulder by contracting your biceps.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8fgqP5a.gif"}',
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
  'ez barbell reverse grip preacher curl',
  'vBNyir7',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your chest against the pad and your feet flat on the floor.","Step:2 Grasp the ez barbell with an underhand grip, hands shoulder-width apart.","Step:3 Rest your upper arms on the pad, allowing your forearms to hang down.","Step:4 Keeping your upper arms stationary, exhale and curl the barbell up towards your shoulders.","Step:5 Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vBNyir7.gif"}',
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
  'dumbbell one arm prone hammer curl',
  'LIGZSTA',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in one hand, palm facing your body and arm fully extended.","Step:2 Keep your upper arm stationary and curl the dumbbell towards your shoulder, contracting your biceps.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LIGZSTA.gif"}',
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
  'dumbbell lunge with bicep curl',
  'Mz6lLcW',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"quadriceps","hamstrings"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing forward.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position. Your right knee should be bent at a 90-degree angle and your left knee should be hovering just above the ground.","Step:3 As you lunge forward, simultaneously curl the dumbbells towards your shoulders, keeping your elbows close to your body.","Step:4 Pause for a moment at the bottom of the lunge, then push through your right heel to return to the starting position, lowering the dumbbells back down to your sides.","Step:5 Repeat the lunge and bicep curl on the opposite side, stepping forward with your left foot.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Mz6lLcW.gif"}',
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
  'ez barbell spider curl',
  '2kattbR',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the ez barbell with an underhand grip, palms facing up.","Step:2 Rest your upper arms on a preacher bench or stability ball, allowing your elbows to hang down.","Step:3 Keeping your upper arms stationary, exhale and curl the barbell up towards your shoulders.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2kattbR.gif"}',
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
  'dumbbell cross body hammer curl',
  'Qyk5J3p',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your body.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps, bringing the dumbbells across your body towards your opposite shoulder.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Qyk5J3p.gif"}',
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
  'dumbbell concentration curl',
  'gvsWLQw',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your legs spread apart and a dumbbell in one hand, resting your elbow on the inside of your thigh.","Step:2 Fully extend your arm and hold the dumbbell with an underhand grip.","Step:3 Keeping your upper arm stationary, exhale and curl the weight up towards your shoulder while contracting your biceps.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gvsWLQw.gif"}',
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
  'cable squatting curl',
  '3XFdb1Z',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a cable handle to the lowest setting on a cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Hold the cable handle with an underhand grip, palms facing up, and arms fully extended.","Step:4 Lower your body into a squat position, keeping your back straight and knees behind your toes.","Step:5 As you squat down, curl the cable handle towards your shoulders, keeping your elbows close to your sides.","Step:6 Pause for a moment at the top of the curl, squeezing your biceps.","Step:7 Slowly lower the cable handle back to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3XFdb1Z.gif"}',
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
  'barbell seated close-grip concentration curl',
  '1V1gj1u',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the floor and hold a barbell with an underhand grip, hands shoulder-width apart.","Step:2 Rest your upper arms against your inner thighs, just above your knees, and let the barbell hang down in front of you.","Step:3 Keeping your upper arms stationary, exhale and curl the barbell up towards your shoulders, contracting your biceps.","Step:4 Hold the contracted position for a brief pause, then inhale and slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1V1gj1u.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;