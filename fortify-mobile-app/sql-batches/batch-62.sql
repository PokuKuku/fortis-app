INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell hammer curl on exercise ball',
  'fY68AyX',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing your body and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbells while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fY68AyX.gif"}',
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
  'cable one arm preacher curl',
  'eHBlPsa',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the cable machine so that the preacher curl pad is at chest height.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the cable handle with an underhand grip and position your upper arm against the preacher curl pad.","Step:4 Keep your back straight and your core engaged.","Step:5 Slowly curl the cable handle towards your shoulder, keeping your upper arm against the pad.","Step:6 Pause for a moment at the top of the movement, squeezing your biceps.","Step:7 Slowly lower the cable handle back to the starting position.","Step:8 Repeat for the desired number of repetitions.","Step:9 Switch arms and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eHBlPsa.gif"}',
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
  'dumbbell incline curl v. 2',
  'RaflbWD',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, palms facing forward and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RaflbWD.gif"}',
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
  'dumbbell one arm standing hammer curl',
  '2sQGZ5b',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2sQGZ5b.gif"}',
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
  'weighted standing curl',
  'M5Y7GPg',
  'intermediate',
  'weighted',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing forward.","Step:2 Keep your elbows close to your torso and exhale as you curl the weights up to shoulder level.","Step:3 Pause for a moment at the top, then inhale as you slowly lower the weights back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/M5Y7GPg.gif"}',
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
  'biceps pull-up',
  'guT8YnS',
  'intermediate',
  'body weight',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Hang from a pull-up bar with your palms facing away from you and your hands shoulder-width apart.","Step:2 Engage your core and pull yourself up by bending your elbows, bringing your chest towards the bar.","Step:3 Pause at the top of the movement, then slowly lower yourself back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/guT8YnS.gif"}',
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
  'barbell alternate biceps curl',
  'Yza7XrQ',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell in each hand, palms facing forward.","Step:2 Keep your upper arms stationary and exhale as you curl the weights while contracting your biceps.","Step:3 Continue to raise the barbells until your biceps are fully contracted and the barbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale as you slowly begin to lower the barbells back to the starting position.","Step:6 Repeat for the desired number of repetitions, alternating arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Yza7XrQ.gif"}',
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
  'barbell preacher curl',
  'qOgPVf6',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your upper arms resting on the pad and your chest against the support.","Step:2 Grasp the barbell with an underhand grip, slightly wider than shoulder-width apart.","Step:3 Keeping your upper arms stationary, exhale and curl the barbell up towards your shoulders.","Step:4 Pause for a moment at the top, squeezing your biceps.","Step:5 Inhale and slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qOgPVf6.gif"}',
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
  'cable seated one arm concentration curl',
  'rZ80Gbp',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the floor and your back straight.","Step:2 Hold a cable handle with one hand and place your elbow on the inside of your thigh, just above the knee.","Step:3 Keep your upper arm stationary and curl the cable handle towards your shoulder while exhaling.","Step:4 Pause for a moment at the top of the movement, squeezing your biceps.","Step:5 Slowly lower the cable handle back to the starting position while inhaling.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rZ80Gbp.gif"}',
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
  'dumbbell standing inner biceps curl v. 2',
  'vKilzz3',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 While holding your upper arms stationary, curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Slowly begin to bring the dumbbells back to the starting position as your breathe in.","Step:7 Repeat for the recommended amount of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vKilzz3.gif"}',
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
  'dumbbell lying wide curl',
  'qm9veZw',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing up and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qm9veZw.gif"}',
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
  'dumbbell seated neutral wrist curl',
  'uJmK7Z1',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing each other.","Step:2 Rest your forearms on your thighs, allowing the dumbbells to hang down.","Step:3 Keeping your wrists in a neutral position, curl the dumbbells up towards your shoulders.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uJmK7Z1.gif"}',
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
  'dumbbell alternate preacher curl',
  'NlfIbzq',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with a dumbbell in each hand, palms facing up.","Step:2 Rest your upper arms on the pad of the preacher bench, allowing your arms to fully extend.","Step:3 Keeping your upper arms stationary, exhale and curl the dumbbell in your right hand as you contract your biceps.","Step:4 Continue to curl the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Pause for a moment, then inhale and slowly lower the dumbbell back to the starting position.","Step:6 Repeat the movement with your left arm.","Step:7 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NlfIbzq.gif"}',
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
  'dumbbell step up single leg balance with bicep curl',
  '76vfTdU',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"quadriceps","glutes","hamstrings"}',
  '{"Step:1 Stand in front of a step or platform with a dumbbell in each hand, palms facing your body.","Step:2 Place your right foot on the step, ensuring your entire foot is in contact with the surface.","Step:3 Engage your core and push through your right heel to lift your body up onto the step, bringing your left knee up towards your chest.","Step:4 At the top of the movement, perform a bicep curl by bending your elbows and bringing the dumbbells towards your shoulders.","Step:5 Lower the dumbbells back down and simultaneously lower your left foot back to the ground.","Step:6 Repeat the movement on the opposite side, stepping up with your left foot and curling the dumbbells.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/76vfTdU.gif"}',
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
  'dumbbell bicep curl lunge with bowling motion',
  '1VpF8db',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing forward.","Step:2 Take a step forward with your right foot, bending your right knee and lowering your body into a lunge position.","Step:3 As you lunge forward, curl the dumbbells up towards your shoulders, keeping your elbows close to your body.","Step:4 At the bottom of the lunge, rotate your torso to the right, as if you were bowling a ball.","Step:5 Reverse the motion, stepping back with your right foot and returning to the starting position while lowering the dumbbells back down.","Step:6 Repeat the lunge and curl motion, this time rotating your torso to the left.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1VpF8db.gif"}',
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
  'dumbbell prone incline curl',
  'mwpPcr1',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the bench to a 45-degree incline.","Step:2 Lie face down on the bench with your chest and stomach resting against it.","Step:3 Hold a dumbbell in each hand with your palms facing down and your arms fully extended.","Step:4 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mwpPcr1.gif"}',
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
  'ez barbell curl',
  '6TG6x2w',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold the ez barbell with an underhand grip, palms facing up.","Step:2 Keep your elbows close to your torso and your upper arms stationary throughout the movement.","Step:3 Exhale as you curl the barbell up towards your shoulders, contracting your biceps.","Step:4 Pause for a moment at the top, then inhale as you slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6TG6x2w.gif"}',
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
  'dumbbell preacher curl over exercise ball',
  'hwygydB',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with an underhand grip, resting your elbow on the exercise ball.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hwygydB.gif"}',
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
  'cable rope hammer preacher curl',
  'PcPe0P5',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a rope attachment to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with a neutral grip (palms facing each other).","Step:4 Position your upper arms against the preacher bench pad, keeping your elbows slightly bent.","Step:5 Keeping your upper arms stationary, exhale and curl the rope towards your shoulders by contracting your biceps.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Inhale and slowly lower the rope back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PcPe0P5.gif"}',
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
  'dumbbell standing one arm reverse curl',
  'DU5Kkj2',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a dumbbell in one hand with an overhand grip.","Step:2 Keep your arm fully extended and close to your body, with your palm facing down.","Step:3 Slowly curl the dumbbell up towards your shoulder, keeping your upper arm stationary.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DU5Kkj2.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;