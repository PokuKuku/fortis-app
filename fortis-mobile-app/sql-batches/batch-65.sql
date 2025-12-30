INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell prone incline curl with intensive',
  'Um8xUAc',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie face down on the bench with your chest and stomach resting against it.","Step:3 Hold a barbell with an underhand grip, shoulder-width apart.","Step:4 Extend your arms fully, allowing the barbell to hang down towards the floor.","Step:5 Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:6 Continue to raise the barbell until your biceps are fully contracted and the bar is at shoulder level.","Step:7 (intensive variation) Hold the contracted position for a brief pause as you squeeze your biceps.","Step:8 Inhale and slowly begin to lower the barbell back to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Um8xUAc.gif"}',
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
  'barbell standing reverse grip curl resistance',
  'AdxxqfF',
  'intermediate',
  'barbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing up.","Step:2 Keep your elbows close to your torso and your upper arms stationary.","Step:3 Exhale and curl the weights while contracting your biceps, bringing the barbell as close to your shoulders as possible.","Step:4 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:5 Inhale and slowly lower the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions. Focus on resistance movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AdxxqfF.gif"}',
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
  'dumbbell step up single leg balance with bicep curl - chair variation',
  'XE93sQZ',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"quadriceps","glutes","hamstrings"}',
  '{"Step:1 Stand in front of a step or platform with a dumbbell in each hand, palms facing your body.","Step:2 Place your right foot on the step, ensuring your entire foot is in contact with the surface.","Step:3 Engage your core and push through your right heel to lift your body up onto the step, bringing your left knee up towards your chest.","Step:4 At the top of the movement, perform a bicep curl by bending your elbows and bringing the dumbbells towards your shoulders.","Step:5 Lower the dumbbells back down and simultaneously lower your left foot back to the ground.","Step:6 (chair variation) Repeat the movement on the opposite side, stepping up with your left foot and curling the dumbbells.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XE93sQZ.gif"}',
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
  'hold style dumbbell alternating seated bicep curl on exercise ball',
  'xmWQIlT',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing forward and your arms fully extended.","Step:3 Keeping your upper arms stationary, exhale and curl one dumbbell while rotating your forearm until your palm is facing your shoulder.","Step:4 (hold variation) Inhale and slowly lower the dumbbell back to the starting position.","Step:5 Repeat the curl with the other arm.","Step:6 Continue alternating curls for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xmWQIlT.gif"}',
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
  'intermediate style dumbbell preacher curl over exercise ball',
  'QQwxa8g',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with an underhand grip, resting your elbow on the exercise ball.","Step:3 (intermediate variation) Keeping your upper arm stationary, exhale and curl the dumbbell up towards your shoulder.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QQwxa8g.gif"}',
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
  'dumbbell one arm prone hammer curl - macro variation',
  'XqYQ9JA',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in one hand, palm facing your body and arm fully extended.","Step:2 Keep your upper arm stationary and curl the dumbbell towards your shoulder, contracting your biceps.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch arms. Focus on macro movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XqYQ9JA.gif"}',
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
  'dumbbell hammer curl with traditional',
  '79AmJsI',
  'intermediate',
  'dumbbell',
  '{"biceps"}',
  '{"forearms"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your torso.","Step:2 Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.","Step:3 This will be your starting position.","Step:4 Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.","Step:5 Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.","Step:6 Hold the contracted position for a brief pause as you squeeze your biceps.","Step:7 Then, inhale and slowly begin to lower the dumbbells back to the starting position.","Step:8 Repeat for the recommended amount of repetitions. Focus on traditional movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/79AmJsI.gif"}',
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
  'side plank hip adduction',
  'VO2qeJg',
  'intermediate',
  'body weight',
  '{"adductors"}',
  '{"obliques","glutes"}',
  '{"Step:1 Start by lying on your side with your legs extended and stacked on top of each other.","Step:2 Prop yourself up on your forearm, keeping your elbow directly below your shoulder.","Step:3 Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.","Step:4 While maintaining the side plank position, lift your top leg towards the ceiling, keeping it straight.","Step:5 Slowly lower your leg back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VO2qeJg.gif"}',
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
  'assisted side lying adductor stretch',
  'hC6oYY5',
  'intermediate',
  'assisted',
  '{"adductors"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Lie on your side with your legs straight and stacked on top of each other.","Step:2 Bend your bottom leg slightly for stability.","Step:3 Place your top foot on a stable surface, such as a bench or step.","Step:4 Keeping your top leg straight, slowly lower it towards the ground, feeling a stretch in your inner thigh.","Step:5 Hold the stretch for 20-30 seconds.","Step:6 Return to the starting position and repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hC6oYY5.gif"}',
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
  'lever seated hip adduction',
  'oHsrypV',
  'intermediate',
  'leverage machine',
  '{"adductors"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the backrest.","Step:2 Place your feet on the footrests and grasp the handles for stability.","Step:3 Engage your adductor muscles and slowly bring your legs together, squeezing your inner thighs.","Step:4 Pause for a moment at the peak contraction, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oHsrypV.gif"}',
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
  'side lying hip adduction (male)',
  'c8f5cSY',
  'intermediate',
  'body weight',
  '{"adductors"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie on your side with your legs straight and stacked on top of each other.","Step:2 Place your bottom arm under your head for support.","Step:3 Engage your adductors and lift your top leg as high as possible without rotating your hips or leaning backward.","Step:4 Pause for a moment at the top, then slowly lower your leg back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/c8f5cSY.gif"}',
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
  'butterfly yoga pose',
  'bWlZvXh',
  'intermediate',
  'body weight',
  '{"adductors"}',
  '{"hamstrings","groin"}',
  '{"Step:1 Sit on the floor with your legs extended in front of you.","Step:2 Bend your knees and bring the soles of your feet together, allowing your knees to fall out to the sides.","Step:3 Hold onto your ankles or feet with your hands.","Step:4 Sit up tall and lengthen your spine.","Step:5 Gently press your knees down towards the floor, feeling a stretch in your inner thighs.","Step:6 Hold this position for a few breaths.","Step:7 To release, slowly bring your knees back up and extend your legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bWlZvXh.gif"}',
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
  'cable hip adduction',
  'hBGWILP',
  'intermediate',
  'cable',
  '{"adductors"}',
  '{"glutes","quadriceps"}',
  '{"Step:1 Attach the ankle cuff to your ankle and stand facing the cable machine.","Step:2 Position yourself far enough away from the machine so that there is tension on the cable.","Step:3 Place your hands on the machine for support.","Step:4 Keeping your leg straight, slowly move your leg across your body towards the midline.","Step:5 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hBGWILP.gif"}',
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
  'barbell press sit-up',
  'wnEscH8',
  'intermediate',
  'barbell',
  '{"abs"}',
  '{"shoulders","chest"}',
  '{"Step:1 Lie flat on your back on a mat with your knees bent and feet flat on the ground.","Step:2 Hold the barbell with an overhand grip, resting it on your chest.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wnEscH8.gif"}',
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
  'dumbbell side bend',
  'IpONWYv',
  'intermediate',
  'dumbbell',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand up straight with your feet shoulder-width apart and hold a dumbbell in one hand, letting it hang down by your side.","Step:2 Keeping your back straight and your core engaged, slowly bend sideways at the waist towards the opposite side of the dumbbell, lowering the weight as far as you comfortably can.","Step:3 Pause for a moment, then slowly return to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IpONWYv.gif"}',
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
  'sledge hammer',
  'REXmfVC',
  'intermediate',
  'hammer',
  '{"abs"}',
  '{"forearms","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the sledge hammer with both hands.","Step:2 Engage your core and keep your back straight.","Step:3 Swing the sledge hammer down towards the ground, using your core and upper body strength.","Step:4 As you swing down, pivot your hips and transfer the force to the hammer.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/REXmfVC.gif"}',
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
  'band standing crunch',
  'Kzg30R7',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Attach the band to a sturdy anchor point at waist height.","Step:2 Stand facing away from the anchor point with your feet shoulder-width apart.","Step:3 Hold the band with both hands and bring it up to your chest, keeping your elbows bent and close to your body.","Step:4 Engage your abs and slowly crunch forward, bringing your chest towards your knees.","Step:5 Pause for a moment at the top of the crunch, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Kzg30R7.gif"}',
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
  'cable seated crunch',
  '8xUv4J7',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on a cable machine with your feet flat on the ground and your knees bent.","Step:2 Hold the cable handle with both hands and position it behind your head.","Step:3 Engage your abs and slowly curl your upper body forward, bringing your chest towards your knees.","Step:4 Pause for a moment at the top, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8xUv4J7.gif"}',
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
  'cable standing lift',
  'qFpAkpP',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with both hands and position it at waist height.","Step:3 Engage your core and maintain a straight back throughout the exercise.","Step:4 Keeping your arms straight, exhale and lift the cable handle up towards your opposite shoulder, rotating your torso.","Step:5 Pause for a moment at the top, then inhale and slowly lower the cable handle back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qFpAkpP.gif"}',
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
  'bottoms-up',
  'CI6baTY',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Bend your knees and bring them towards your chest, keeping your feet off the ground.","Step:3 Engaging your abs, lift your hips off the ground, bringing your knees towards your head.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CI6baTY.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;