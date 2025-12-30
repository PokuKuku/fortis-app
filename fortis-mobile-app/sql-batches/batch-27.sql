INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'gentle style dumbbell one leg fly on exercise ball',
  'vocve3e',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in each hand, palms facing each other.","Step:2 Place one foot on the ground and extend the other leg straight out in front of you.","Step:3 Lean forward slightly and bring your arms out to the sides, keeping a slight bend in your elbows.","Step:4 Slowly lower the dumbbells down and out to the sides, feeling a stretch in your chest.","Step:5 (gentle variation) Pause for a moment at the bottom, then squeeze your chest muscles to bring the dumbbells back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vocve3e.gif"}',
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
  'contracted kettlebell extended range one arm press on floor',
  'j6uIfep',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start by lying on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold a kettlebell in one hand, with your palm facing towards your feet.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow locked and your wrist straight.","Step:4 Slowly lower the kettlebell back down to the starting position, maintaining control throughout the movement.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm. Emphasize contracted control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/j6uIfep.gif"}',
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
  'barbell wide reverse grip bench press horizontal',
  '3QgteDK',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a wide reverse grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Lower the barbell slowly towards your chest, keeping your elbows tucked in and your wrists straight. Focus on horizontal movement.","Step:5 Pause for a moment when the barbell touches your chest, then push it back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3QgteDK.gif"}',
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
  'light lever standing chest press',
  'numr601',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your feet flat on the ground.","Step:2 Grasp the handles with an overhand grip and position your hands at chest level. Maintain light form throughout.","Step:3 Push the handles forward until your arms are fully extended, keeping your elbows slightly bent.","Step:4 Pause for a moment, then slowly bring the handles back towards your chest, maintaining control throughout the movement.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/numr601.gif"}',
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
  'incline push-up (on box) - active variation',
  'woLo1QN',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Place your hands on the edge of a box or elevated surface, slightly wider than shoulder-width apart.","Step:2 Extend your legs behind you, resting on the balls of your feet, creating a straight line from your head to your heels.","Step:3 Lower your chest towards the box by bending your elbows, keeping your body in a straight line.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 (active variation) Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/woLo1QN.gif"}',
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
  'balance cable incline fly',
  'drfGhTV',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the cable machine to a low position and attach the handles.","Step:2 Sit on an incline bench with your back against the pad and feet flat on the floor. Perform with balance intensity.","Step:3 Grasp the handles with an overhand grip and extend your arms straight out in front of you.","Step:4 Keeping a slight bend in your elbows, open your arms out to the sides in a controlled motion.","Step:5 Pause for a moment at the fully extended position, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/drfGhTV.gif"}',
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
  'wide-grip chest dip on high parallel bars - low variation',
  'FSF9WOs',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself on the parallel bars with your arms fully extended and your body suspended in the air.","Step:2 Lean forward slightly and lower your body by bending your elbows until your chest is just above the bars.","Step:3 (low variation) Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FSF9WOs.gif"}',
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
  'cable one arm incline press with rigid',
  'QoSZo2Y',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the cable machine to a low pulley position.","Step:2 Sit on an incline bench facing away from the cable machine.","Step:3 Grasp the handle with one hand and bring it up to shoulder height. Emphasize rigid control.","Step:4 Position your feet firmly on the ground and maintain a stable position.","Step:5 Press the handle forward and upward, extending your arm fully.","Step:6 Pause for a moment at the top, then slowly lower the handle back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QoSZo2Y.gif"}',
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
  'incline push up depth jump with complex',
  'EpKrFiv',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Find an elevated surface, such as a bench or step, and place your hands shoulder-width apart on the edge.","Step:2 Step your feet back, keeping your body in a straight line from head to heels.","Step:3 Lower your chest towards the edge of the surface, bending your elbows and keeping your body aligned. Maintain complex form throughout.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Jump off the edge of the surface, landing softly with your knees slightly bent.","Step:6 Repeat the push-up and depth jump for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EpKrFiv.gif"}',
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
  'isolation assisted seated pectoralis major stretch with stability ball',
  'Aj9vWh7',
  'intermediate',
  'assisted',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a stability ball with both hands and extend your arms straight out in front of you.","Step:3 Slowly lower the stability ball towards your chest, feeling a stretch in your pectoral muscles.","Step:4 Hold the stretch for a few seconds, then slowly return to the starting position. Emphasize isolation control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Aj9vWh7.gif"}',
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
  'push-up (wall) with static',
  'qBl14UC',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","deltoids"}',
  '{"Step:1 Stand facing a wall, about arm''s length away.","Step:2 Place your hands on the wall at shoulder height, slightly wider than shoulder-width apart.","Step:3 Step back a few feet, keeping your body straight and your feet hip-width apart.","Step:4 (static variation) Bend your elbows and lower your chest towards the wall, keeping your body in a straight line.","Step:5 Push back up to the starting position, straightening your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qBl14UC.gif"}',
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
  'rough cable decline fly',
  'jCBOdh0',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the cable machine to a decline position.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Hold the handles with your palms facing forward and your arms extended straight out in front of you.","Step:4 Keeping a slight bend in your elbows, open your arms out to the sides in a controlled motion. Perform with rough intensity.","Step:5 Pause for a moment at the fully extended position, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jCBOdh0.gif"}',
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
  'barbell incline bench press seated',
  '9Z23cLE',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 (seated variation) Lie down on the bench with your feet flat on the ground.","Step:3 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9Z23cLE.gif"}',
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
  'dumbbell incline one arm press on exercise ball with extended',
  'qlZUaZ8',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand, feet flat on the ground.","Step:2 Slowly walk your feet forward, rolling the ball until your head, neck, and upper back are supported on the ball. Perform with extended intensity.","Step:3 Hold the dumbbell at shoulder height with your palm facing forward.","Step:4 Press the dumbbell upward until your arm is fully extended.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qlZUaZ8.gif"}',
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
  'push up on bosu ball with improved',
  'P7zSvul',
  'intermediate',
  'bosu ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Place the bosu ball on the ground with the flat side facing up.","Step:2 Position yourself in a push-up position with your hands on the outer edges of the bosu ball.","Step:3 Engage your core and lower your body down towards the bosu ball by bending your elbows. Focus on improved movement.","Step:4 Push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P7zSvul.gif"}',
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
  'deep smith machine reverse decline close grip bench press',
  'Gu2ENkm',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the smith machine to a decline position.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in. Focus on deep movement.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gu2ENkm.gif"}',
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
  'upright smith incline bench press',
  'afv0ZAS',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the bench to a 30-45 degree incline.","Step:2 Sit on the bench with your back flat against the pad and feet firmly on the ground.","Step:3 Grasp the barbell with an overhand grip slightly wider than shoulder-width apart. Perform with upright intensity.","Step:4 Unrack the barbell and lower it slowly towards your upper chest, keeping your elbows slightly tucked in.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/afv0ZAS.gif"}',
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
  'dumbbell one arm fly on exercise ball improved',
  'r4RZKpF',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand and your feet flat on the ground.","Step:2 Walk your feet forward and roll your body down until your upper back is resting on the exercise ball.","Step:3 Extend your arm with the dumbbell straight up above your chest, palm facing inwards.","Step:4 Slowly lower the dumbbell out to the side, keeping a slight bend in your elbow.","Step:5 Pause for a moment, then squeeze your chest muscles to bring the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms. Focus on improved movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/r4RZKpF.gif"}',
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
  'dumbbell around pullover - intensive variation',
  'Xd65M9w',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","latissimus dorsi"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet firmly on the ground.","Step:2 Hold a dumbbell with both hands and extend your arms straight above your chest. Perform with intensive intensity.","Step:3 Keeping your arms straight, slowly lower the dumbbell behind your head in an arc motion.","Step:4 Pause for a moment at the bottom, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Xd65M9w.gif"}',
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
  'chest and front of shoulder stretch micro',
  'iDGtjyi',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"deltoids"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Extend your arms straight out in front of you at shoulder height.","Step:3 Cross your arms in front of your body, with your right arm on top of your left arm.","Step:4 Interlace your fingers and press your palms together.","Step:5 Gently squeeze your shoulder blades together and push your hands forward, feeling a stretch in your chest and front of your shoulders.","Step:6 (micro variation) Hold the stretch for 20-30 seconds, then release.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iDGtjyi.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;