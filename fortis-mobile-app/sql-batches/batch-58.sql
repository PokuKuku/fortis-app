INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell bicep curl with stork stance',
  'uSkDMYl',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing forward.","Step:2 Extend one leg behind you, balancing on the toes of that foot.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uSkDMYl.gif"}',
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
  'dumbbell seated alternate hammer curl on exercise ball',
  'QLRmNeT',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing your body and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl one dumbbell up towards your shoulder while keeping your palm facing your body.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat the movement with the opposite arm.","Step:8 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QLRmNeT.gif"}',
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
  'dumbbell one arm seated hammer curl',
  'jK2hZ6n',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in one hand with a neutral grip (palms facing each other).","Step:3 Rest your elbow on the inside of your thigh, just above the knee.","Step:4 Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder.","Step:5 Pause for a moment at the top, squeezing your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jK2hZ6n.gif"}',
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
  'dumbbell waiter biceps curl',
  'KOpzGBL',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward.","Step:2 Keep your upper arms close to your body and your elbows tucked in.","Step:3 Slowly curl the dumbbells up towards your shoulders, keeping your wrists straight.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KOpzGBL.gif"}',
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
  'lever bicep curl',
  'q6y3OhV',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the handles with an underhand grip, palms facing up, and keep your elbows close to your sides.","Step:3 Exhale and curl the handles upward, contracting your biceps.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Inhale and slowly lower the handles back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/q6y3OhV.gif"}',
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
  'dumbbell over bench one arm neutral wrist curl',
  'IvV6C9M',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with a dumbbell in one hand and your arm extended over the bench, palm facing up.","Step:2 Keep your upper arm stationary and curl the dumbbell towards your shoulder, keeping your wrist in a neutral position.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IvV6C9M.gif"}',
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
  'ez barbell close grip preacher curl',
  'hacCyUv',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher curl bench and place your upper arms on the pad, gripping the ez barbell with an underhand grip.","Step:2 Rest your triceps on the pad and fully extend your arms, keeping your back straight.","Step:3 Slowly curl the barbell towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Lower the barbell back to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hacCyUv.gif"}',
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
  'dumbbell one arm concentration curl (on stability ball)',
  'k5IpyHg',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a dumbbell in one hand with your palm facing up and your arm extended down towards the floor.","Step:3 Rest your elbow on the inside of your thigh, just above the knee.","Step:4 Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder while contracting your biceps.","Step:5 Pause for a moment at the top of the movement, then inhale and slowly lower the dumbbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/k5IpyHg.gif"}',
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
  'dumbbell alternating seated bicep curl on exercise ball',
  'J74XlNf',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing forward and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl one dumbbell while rotating your forearm until your palm is facing your shoulder.","Step:4 Inhale and slowly lower the dumbbell back to the starting position.","Step:5 Repeat the curl with the other arm.","Step:6 Continue alternating curls for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/J74XlNf.gif"}',
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
  'barbell lying preacher curl',
  'SYJ4Bkt',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your chest against the pad and your arms extended over the edge, holding a barbell with an underhand grip.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SYJ4Bkt.gif"}',
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
  'dumbbell incline inner biceps curl',
  'LCtQPn8',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, palms facing each other.","Step:2 Rest your upper arms on the bench, allowing your elbows to hang down and your palms to face forward.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LCtQPn8.gif"}',
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
  'dumbbell one arm reverse spider curl',
  'VdLZ3nB',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in one hand, palm facing down and arm fully extended.","Step:2 Keeping your upper arm stationary, curl the dumbbell towards your shoulder by flexing your elbow.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VdLZ3nB.gif"}',
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
  'band one arm overhead biceps curl',
  'UNAB8ak',
  'intermediate',
  'band',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place one end of the band under your foot.","Step:2 Hold the other end of the band with your arm fully extended overhead, palm facing forward.","Step:3 Keeping your upper arm stationary, curl your forearm towards your shoulder, squeezing your biceps.","Step:4 Pause for a moment at the top, then slowly lower your forearm back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UNAB8ak.gif"}',
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
  'cable overhead curl',
  'wDUqY2u',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary.","Step:5 Exhale and curl the bar down towards your forehead, keeping your upper arms stationary.","Step:6 Pause for a moment at the bottom of the movement, squeezing your biceps.","Step:7 Inhale and slowly return the bar to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wDUqY2u.gif"}',
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
  'cable pulldown bicep curl',
  'QTXKWPh',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to the cable machine at the highest setting.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary.","Step:5 Exhale and slowly curl the bar down towards your thighs, keeping your wrists straight.","Step:6 Pause for a moment at the bottom of the movement, squeezing your biceps.","Step:7 Inhale and slowly return the bar to the starting position, fully extending your arms.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QTXKWPh.gif"}',
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
  'lever reverse grip preacher curl',
  'kj3hy6W',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine.","Step:2 Grasp the handles with an underhand grip, palms facing up.","Step:3 Rest your upper arms on the preacher pad, ensuring your elbows are fully extended.","Step:4 Keeping your upper arms stationary, exhale and curl the handles towards your shoulders.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the handles back to the starting position, fully extending your elbows.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kj3hy6W.gif"}',
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
  'dumbbell one arm standing curl',
  'ffQsyBj',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in one hand, palm facing forward and arm fully extended.","Step:2 Keeping your upper arm stationary, exhale and curl the weight upward while contracting your biceps.","Step:3 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ffQsyBj.gif"}',
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
  'cable one arm reverse preacher curl',
  'ZXnjcOQ',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the cable machine so that the pulley is at the lowest position.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the cable handle with an underhand grip and position your upper arm against the preacher bench pad.","Step:4 Keep your back straight and your core engaged throughout the exercise.","Step:5 Slowly curl your forearm towards your bicep, keeping your upper arm stationary against the pad.","Step:6 Pause for a moment at the top of the movement, squeezing your bicep.","Step:7 Slowly lower the cable handle back to the starting position.","Step:8 Repeat for the desired number of repetitions.","Step:9 Switch arms and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZXnjcOQ.gif"}',
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
  'resistance band seated biceps curl',
  'XFc3vpY',
  'intermediate',
  'resistance band',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Hold the resistance band with an underhand grip, palms facing up, and arms extended down by your sides.","Step:3 Keeping your upper arms stationary, exhale and curl the resistance band up towards your shoulders.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the resistance band back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XFc3vpY.gif"}',
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
  'dumbbell seated bicep curl',
  'xiA6lRr',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.","Step:2 Keep your back straight and your elbows close to your torso.","Step:3 Exhale and curl the dumbbells up towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xiA6lRr.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;