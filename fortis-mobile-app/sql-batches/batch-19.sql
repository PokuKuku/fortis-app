INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable standing up straight crossovers',
  'UKWTJWR',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Stand in the middle of a cable machine with your feet shoulder-width apart.","Step:2 Hold the handles of the cables with your palms facing down and your arms extended straight out to the sides.","Step:3 Keeping your arms straight, bring your hands together in front of your body, crossing them over each other.","Step:4 Pause for a moment, then slowly return to the starting position, keeping your arms extended.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UKWTJWR.gif"}',
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
  'assisted wide-grip chest dip (kneeling)',
  'PnZJIrk',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the machine to your desired height and secure your knees on the pad.","Step:2 Grasp the handles with a wide grip and keep your elbows slightly bent.","Step:3 Lower your body by bending your elbows until your upper arms are parallel to the floor.","Step:4 Push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PnZJIrk.gif"}',
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
  'chest dip on straight bar',
  'LQFOrMn',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Grab the parallel bars with your palms facing down and your arms fully extended.","Step:2 Bend your knees and cross your ankles.","Step:3 Lower your body by bending your arms until your shoulders are below your elbows.","Step:4 Push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LQFOrMn.gif"}',
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
  'barbell front raise and pullover',
  '33AzZeV',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, palms facing down.","Step:2 Keep your arms straight and raise the barbell in front of you until it reaches shoulder height.","Step:3 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:4 Next, lower the barbell behind your head, keeping your arms straight.","Step:5 Pause for a moment at the bottom, then raise the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/33AzZeV.gif"}',
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
  'full planche push-up',
  'gw9PqGk',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Start in a push-up position with your hands placed slightly wider than shoulder-width apart.","Step:2 Engage your core and lower your body down towards the ground, keeping your elbows close to your sides.","Step:3 As you lower yourself, lean your body forward and lift your feet off the ground, balancing on your hands.","Step:4 Continue to lower your body until your chest is just above the ground.","Step:5 Push through your hands and extend your arms to lift your body back up to the starting position.","Step:6 Maintain a straight line from your head to your heels throughout the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gw9PqGk.gif"}',
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
  'suspended push-up',
  'IaGQCrC',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Find a suspension trainer and adjust it to an appropriate height.","Step:2 Stand facing away from the anchor point and hold the handles with an overhand grip.","Step:3 Walk your feet forward, leaning your body forward until your weight is supported by the suspension trainer.","Step:4 Keep your body straight from head to heels, engage your core, and lower your chest towards the handles.","Step:5 Push through your chest and arms to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IaGQCrC.gif"}',
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
  'dumbbell one arm decline chest press',
  'REGM1dE',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie on a decline bench with a dumbbell in one hand, resting on your chest.","Step:2 Place your feet flat on the ground and keep your back pressed against the bench.","Step:3 Extend your arm and push the dumbbell up towards the ceiling, fully extending your elbow.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/REGM1dE.gif"}',
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
  'cable middle fly',
  'xLYSdtg',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Attach cables to both sides of a cable machine at chest height.","Step:2 Stand in the center of the machine with one foot slightly in front of the other.","Step:3 Grasp the handles with an overhand grip and extend your arms out to the sides.","Step:4 Keep a slight bend in your elbows and maintain a slight forward lean.","Step:5 Engage your chest muscles and bring your arms forward in a sweeping motion.","Step:6 Pause for a moment at the center, then slowly return your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xLYSdtg.gif"}',
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
  'dumbbell incline twisted flyes',
  '1PLE8e9',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, palms facing each other.","Step:2 Lie back on the bench and press the dumbbells up to the starting position, directly above your chest, with your arms extended.","Step:3 Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 As you lower the dumbbells, rotate your wrists so that your palms face forward at the bottom of the movement.","Step:5 Reverse the motion and bring the dumbbells back up to the starting position, squeezing your chest muscles together at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1PLE8e9.gif"}',
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
  'incline push up depth jump',
  'CB8WET1',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Find an elevated surface, such as a bench or step, and place your hands shoulder-width apart on the edge.","Step:2 Step your feet back, keeping your body in a straight line from head to heels.","Step:3 Lower your chest towards the edge of the surface, bending your elbows and keeping your body aligned.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Jump off the edge of the surface, landing softly with your knees slightly bent.","Step:6 Repeat the push-up and depth jump for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CB8WET1.gif"}',
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
  'assisted chest dip (kneeling)',
  'PAgTVaK',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the machine to your desired height and secure your knees on the pad.","Step:2 Grasp the handles with your palms facing down and your arms fully extended.","Step:3 Lower your body by bending your elbows until your upper arms are parallel to the floor.","Step:4 Pause for a moment, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PAgTVaK.gif"}',
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
  'machine inner chest press',
  'wDN97Ca',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back flat against the pad.","Step:2 Grasp the handles with an overhand grip and position your elbows at a 90-degree angle.","Step:3 Push the handles forward until your arms are fully extended, exhaling during the movement.","Step:4 Pause for a moment at the end of the movement, then slowly return to the starting position, inhaling as you do so.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wDN97Ca.gif"}',
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
  'push and pull bodyweight',
  'wXvUZC8',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","deltoids"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your body in a straight line.","Step:2 Lower your chest towards the ground by bending your elbows, keeping your body straight.","Step:3 Push through your palms to extend your arms and return to the starting position.","Step:4 From the push-up position, pull your chest towards the ground by bending your elbows, keeping your body straight.","Step:5 Push through your palms to extend your arms and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wXvUZC8.gif"}',
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
  'roller seated single leg shoulder flexor depresor retractor',
  'CjETvlw',
  'intermediate',
  'roller',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Sit on a flat surface with your legs extended in front of you.","Step:2 Hold the roller with both hands, palms facing down, and place it on your thighs.","Step:3 Lean back slightly and engage your core muscles.","Step:4 Raise the roller up to shoulder level, keeping your arms straight.","Step:5 Slowly lower the roller back down to your thighs.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CjETvlw.gif"}',
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
  'barbell decline pullover',
  '9sgNE2O',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie down on a decline bench with your head lower than your hips and your feet secured.","Step:2 Hold the barbell with a pronated grip (palms facing away from you) and your hands slightly wider than shoulder-width apart.","Step:3 Extend your arms above your chest, keeping a slight bend in your elbows.","Step:4 Lower the barbell in an arc motion behind your head, feeling a stretch in your chest and shoulders.","Step:5 Pause for a moment, then return the barbell to the starting position by reversing the motion.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9sgNE2O.gif"}',
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
  'roller seated shoulder flexor depresor retractor',
  '8coXSYU',
  'intermediate',
  'roller',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Sit on a flat surface with your legs extended in front of you.","Step:2 Hold the roller with both hands, palms facing down, and place it on your thighs.","Step:3 Lean forward slightly and roll the roller away from your body, extending your arms straight in front of you.","Step:4 Pause for a moment, then slowly roll the roller back towards your body, bending your arms and bringing the roller back to your thighs.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8coXSYU.gif"}',
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
  'exercise ball pike push up',
  'sVvXT5J',
  'intermediate',
  'stability ball',
  '{"pectorals"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Start in a push-up position with your hands on the floor and your shins resting on the stability ball.","Step:2 Engage your core and lift your hips up towards the ceiling, rolling the ball towards your hands.","Step:3 Keep your legs straight and your body in a pike position, forming an inverted V shape.","Step:4 Bend your elbows and lower your upper body towards the floor, keeping your head in line with your hands.","Step:5 Push through your hands and extend your arms to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sVvXT5J.gif"}',
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
  'barbell incline bench press',
  '3TZduzM',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie down on the bench with your feet flat on the ground.","Step:3 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3TZduzM.gif"}',
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
  'wide-grip chest dip on high parallel bars',
  'O2K9Vb5',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself on the parallel bars with your arms fully extended and your body suspended in the air.","Step:2 Lean forward slightly and lower your body by bending your elbows until your chest is just above the bars.","Step:3 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O2K9Vb5.gif"}',
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
  'dumbbell decline twist fly',
  'reFHapa',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Lie down on a decline bench with your head lower than your hips.","Step:2 Hold a dumbbell in each hand with your palms facing each other and your arms extended straight up over your chest.","Step:3 Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 As you lower the dumbbells, twist your wrists so that your palms face forward at the bottom of the movement.","Step:5 Reverse the motion and bring the dumbbells back up to the starting position, squeezing your chest muscles at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/reFHapa.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;