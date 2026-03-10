INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell standing biceps curl',
  '3s4NnTh',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3s4NnTh.gif"}',
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
  'cable standing pulldown (with rope)',
  'CvPn9WV',
  'intermediate',
  'cable',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Attach a rope to the cable machine at the highest setting.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip, palms facing down.","Step:4 Keep your back straight and core engaged throughout the exercise.","Step:5 Pull the rope down towards your thighs, squeezing your biceps.","Step:6 Pause for a moment at the bottom, then slowly release the rope back up.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CvPn9WV.gif"}',
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
  'dumbbell reverse spider curl',
  '6sMAmNv',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your body and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6sMAmNv.gif"}',
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
  'dumbbell standing one arm curl (over incline bench)',
  'BIb1tGo',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand with your palm facing forward.","Step:2 Place your other hand on an incline bench for support.","Step:3 Keeping your upper arm stationary, exhale and curl the dumbbell towards your shoulder by contracting your biceps.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BIb1tGo.gif"}',
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
  'lever hammer grip preacher curl',
  'OAguZoG',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine.","Step:2 Place your upper arms on the preacher pad, ensuring your chest is pressed against it.","Step:3 Grasp the handles with a hammer grip (palms facing each other).","Step:4 Keeping your upper arms stationary, exhale and curl the handles towards your shoulders.","Step:5 Pause for a moment at the top, squeezing your biceps.","Step:6 Inhale and slowly lower the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OAguZoG.gif"}',
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
  'dumbbell alternate biceps curl (with arm blaster)',
  'CfKsRbG',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing forward.","Step:2 Place the arm blaster on your upper arms, ensuring a secure fit.","Step:3 Keeping your upper arms stationary, exhale and curl one dumbbell up towards your shoulder while contracting your biceps.","Step:4 Continue to raise the dumbbell until your biceps are fully contracted and the dumbbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly lower the dumbbell back to the starting position.","Step:7 Repeat the movement with the opposite arm.","Step:8 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CfKsRbG.gif"}',
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
  'lever preacher curl',
  'b6hQYMb',
  'intermediate',
  'leverage machine',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the leverage machine.","Step:2 Place your upper arms on the pad and grip the handles with an underhand grip.","Step:3 Keep your back straight and your elbows positioned on the pad.","Step:4 Exhale and curl your forearms towards your upper arms, contracting your biceps.","Step:5 Pause for a moment at the top of the movement, squeezing your biceps.","Step:6 Inhale and slowly lower the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/b6hQYMb.gif"}',
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
  'dumbbell biceps curl reverse',
  'nFc4FyV',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing down and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nFc4FyV.gif"}',
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
  'dumbbell biceps curl squat',
  'niXESDw',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing forward.","Step:2 Keeping your back straight and your elbows close to your sides, exhale and curl the dumbbells up towards your shoulders.","Step:3 Pause for a moment at the top, squeezing your biceps.","Step:4 Inhale and slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/niXESDw.gif"}',
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
  'barbell biceps curl (with arm blaster)',
  'aee2Fcj',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing up.","Step:2 Place your upper arms against the arm blaster, keeping your elbows close to your torso.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the barbell until your biceps are fully contracted and the bar is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the barbell back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aee2Fcj.gif"}',
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
  'barbell reverse preacher curl',
  '4LIG9xr',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a preacher bench with your chest against the pad and your arms extended straight down, holding a barbell with an overhand grip.","Step:2 Keeping your upper arms stationary, exhale and curl the barbell upward while contracting your biceps.","Step:3 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4LIG9xr.gif"}',
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
  'dumbbell biceps curl v sit on bosu ball',
  'H1XAdpk',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Sit on a bosu ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a dumbbell in each hand with your palms facing forward and your arms fully extended down by your sides.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/H1XAdpk.gif"}',
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
  'dumbbell lying supine biceps curl',
  'XVzF3iZ',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie flat on a bench with your back and head supported, and your feet flat on the ground.","Step:2 Hold a dumbbell in each hand with your palms facing up and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:4 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XVzF3iZ.gif"}',
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
  'dumbbell seated one arm bicep curl on exercise ball with leg raised',
  '84sESNy',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing up and your arm fully extended.","Step:3 Place your other hand on your hip for stability.","Step:4 Slowly curl the dumbbell towards your shoulder, keeping your upper arm stationary.","Step:5 Pause for a moment at the top of the movement, squeezing your bicep.","Step:6 Slowly lower the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions.","Step:8 Switch arms and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/84sESNy.gif"}',
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
  'dumbbell standing one arm curl over incline bench',
  'EmlJR2y',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand.","Step:2 Place your other hand on an incline bench for support.","Step:3 Keeping your upper arm stationary, curl the dumbbell towards your shoulder by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EmlJR2y.gif"}',
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
  'barbell drag curl',
  'IENzBdA',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing up.","Step:2 Let the barbell hang at arm''s length in front of your thighs.","Step:3 Keeping your upper arms stationary, curl the barbell up towards your chest by contracting your biceps.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IENzBdA.gif"}',
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
  'ez barbell reverse grip curl',
  'Y5X65IB',
  'intermediate',
  'ez barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold the ez barbell with an underhand grip.","Step:2 Keep your elbows close to your torso and your upper arms stationary throughout the exercise.","Step:3 Curl the barbell upwards by contracting your biceps, while exhaling.","Step:4 Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level.","Step:5 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:6 Slowly begin to bring the barbell back to the starting position as you inhale.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y5X65IB.gif"}',
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
  'band concentration curl',
  'kmVVAfu',
  'intermediate',
  'band',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your legs spread apart and your feet flat on the ground.","Step:2 Hold one end of the band in your hand and step on the other end with your foot on the same side.","Step:3 Lean forward slightly and rest your elbow on the inside of your thigh, just above the knee.","Step:4 With your palm facing up, slowly curl your hand towards your shoulder, keeping your upper arm stationary.","Step:5 Pause for a moment at the top, then slowly lower your hand back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kmVVAfu.gif"}',
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
  'dumbbell alternate biceps curl',
  'BU15nH4',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing forward and arms fully extended.","Step:2 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:3 Continue to raise the dumbbells until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly begin to lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions, alternating arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BU15nH4.gif"}',
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
  'barbell standing reverse grip curl',
  'LWuA3aZ',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing up.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps, bringing the barbell as close to your shoulders as possible.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LWuA3aZ.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;