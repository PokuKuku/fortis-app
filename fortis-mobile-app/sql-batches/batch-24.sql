INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell incline one arm fly',
  'Gw2HFvW',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the incline bench to a 30-45 degree angle.","Step:2 Sit on the bench with a dumbbell in one hand, resting it on your thigh.","Step:3 Lie back on the bench, keeping your feet flat on the ground.","Step:4 Hold the dumbbell with your arm extended straight up over your chest.","Step:5 Lower the dumbbell out to the side in a wide arc, keeping a slight bend in your elbow.","Step:6 Pause when your arm is parallel to the ground, then reverse the motion to bring the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gw2HFvW.gif"}',
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
  'superman push-up',
  '4GqRrAk',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"core","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Engage your core and lower your body towards the ground, keeping your elbows close to your sides.","Step:3 As you lower your body, simultaneously lift your right arm and left leg off the ground, extending them straight out.","Step:4 Pause for a moment at the top, then lower your arm and leg back down while pushing yourself back up to the starting position.","Step:5 Repeat the movement, this time lifting your left arm and right leg.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4GqRrAk.gif"}',
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
  'cable low fly',
  'FVmZVhk',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Attach the handles to the low pulleys of a cable machine and select an appropriate weight.","Step:2 Stand in the middle of the machine with your feet shoulder-width apart and a slight bend in your knees.","Step:3 Grasp the handles with an overhand grip and extend your arms out to the sides, keeping a slight bend in your elbows.","Step:4 Maintaining control, slowly bring your arms forward in a sweeping motion, crossing them in front of your body.","Step:5 Pause for a moment at the peak of the movement, feeling the stretch in your chest muscles.","Step:6 Reverse the motion and slowly return your arms to the starting position, keeping tension on your chest muscles throughout.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FVmZVhk.gif"}',
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
  'cable incline bench press',
  'Vh0GsK4',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the bench to a 45-degree incline.","Step:2 Attach the cable handles to the high pulleys.","Step:3 Sit on the bench facing the cable machine with your feet flat on the ground.","Step:4 Grasp the handles with an overhand grip and bring them to shoulder height.","Step:5 Push the handles forward and upward until your arms are fully extended.","Step:6 Pause for a moment, then slowly lower the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Vh0GsK4.gif"}',
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
  'dumbbell decline bench press',
  'DwhEmmE',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie down on a decline bench with your feet secured and your head lower than your hips.","Step:2 Hold a dumbbell in each hand and extend your arms straight up above your chest, palms facing forward.","Step:3 Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle.","Step:4 Push the dumbbells back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DwhEmmE.gif"}',
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
  'dumbbell fly',
  'yz9nUhF',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight up over your chest, with a slight bend in your elbows.","Step:3 Keeping a slight bend in your elbows, lower your arms out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 Pause for a moment, then reverse the movement and bring the dumbbells back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yz9nUhF.gif"}',
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
  'cable one arm incline fly on exercise ball',
  'P14Dz9D',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back against an incline bench.","Step:2 Hold a cable handle in one hand with your arm extended and palm facing inward.","Step:3 Keeping a slight bend in your elbow, slowly lower your arm out to the side until your hand is in line with your shoulder.","Step:4 Pause for a moment, then squeeze your chest muscles to bring your arm back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P14Dz9D.gif"}',
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
  'floor fly (with barbell)',
  'neonEDL',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Lie flat on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold a barbell with an overhand grip, arms extended straight up over your chest.","Step:3 Slowly lower the barbell out to the sides, keeping a slight bend in your elbows.","Step:4 Lower the barbell until your arms are parallel to the floor, feeling a stretch in your chest.","Step:5 Pause for a moment, then squeeze your chest muscles to bring the barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/neonEDL.gif"}',
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
  'modified hindu push-up (male)',
  'epOSYUZ',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet hip-width apart.","Step:2 Lower your body towards the ground, bending your elbows and keeping your core engaged.","Step:3 As you lower your body, shift your weight back and lift your hips up towards the ceiling, creating an inverted V shape with your body.","Step:4 Continue to lower your body until your chest is just above the ground, then reverse the movement, pushing your hips back down and extending your arms to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/epOSYUZ.gif"}',
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
  'medicine ball chest push with run release',
  'pX9Elbe',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a medicine ball at chest level.","Step:2 Step forward with your right foot and simultaneously push the medicine ball forward, extending your arms fully.","Step:3 As you push the ball forward, release it and let it roll forward.","Step:4 Quickly run forward and catch the ball before it hits the ground.","Step:5 Once you catch the ball, bring it back to your chest and repeat the movement with your left foot forward.","Step:6 Continue alternating legs and repeating the exercise for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pX9Elbe.gif"}',
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
  'dumbbell incline palm-in press',
  'OVLmUuL',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with a dumbbell in each hand, palms facing each other.","Step:3 Plant your feet firmly on the ground and keep your back straight against the bench.","Step:4 Start with the dumbbells at shoulder level, elbows bent and palms facing each other.","Step:5 Press the dumbbells up and away from your body, extending your arms fully.","Step:6 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OVLmUuL.gif"}',
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
  'dumbbell lying pullover on exercise ball',
  'iK59oEA',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders","back"}',
  '{"Step:1 Sit on an exercise ball and roll forward until your upper back is resting on the ball.","Step:2 Hold a dumbbell with both hands and extend your arms straight up over your chest.","Step:3 Slowly lower the dumbbell behind your head while keeping your arms straight.","Step:4 Pause for a moment, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iK59oEA.gif"}',
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
  'incline push-up',
  'B1EVP9F',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Place your hands on an elevated surface, such as a bench or step, slightly wider than shoulder-width apart.","Step:2 Extend your legs behind you, resting on the balls of your feet, creating a straight line from your head to your heels.","Step:3 Lower your chest towards the elevated surface by bending your elbows, keeping your body in a straight line.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/B1EVP9F.gif"}',
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
  'medicine ball chest pass',
  'aDoFKrE',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding the medicine ball at chest level.","Step:2 Extend your arms forward, pushing the medicine ball away from your chest with force.","Step:3 As you release the ball, follow through with your arms and torso, transferring your weight from your back foot to your front foot.","Step:4 Catch the ball as it rebounds off the wall or partner, and immediately repeat the movement.","Step:5 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aDoFKrE.gif"}',
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
  'dumbbell lying one arm press',
  'zGSIWQi',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in one hand and your feet flat on the ground.","Step:2 Hold the dumbbell at shoulder level with your palm facing forward.","Step:3 Press the dumbbell upward until your arm is fully extended.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zGSIWQi.gif"}',
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
  'push-up plus',
  'pvBMLHA',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your body in a straight line from head to heels.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 Once your chest is just above the ground, push through your hands to extend your arms and lift your upper body up.","Step:4 At the top of the movement, protract your shoulder blades by pushing your upper back towards the ceiling.","Step:5 Pause for a moment, then reverse the movement by retracting your shoulder blades and lowering your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pvBMLHA.gif"}',
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
  'cable one arm incline press on exercise ball',
  '6t00BsF',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back resting against an incline bench.","Step:2 Hold a cable handle in one hand and position your arm at a 90-degree angle with your elbow bent.","Step:3 Press the cable handle forward and upward, extending your arm fully.","Step:4 Pause for a moment at the top, then slowly lower the cable handle back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6t00BsF.gif"}',
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
  'cable upper chest crossovers',
  'j7XMAyn',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Attach the handles to the cables at chest height.","Step:2 Stand in the center of the cable machine with one foot slightly in front of the other.","Step:3 Grasp the handles with your palms facing down and your arms extended out to the sides.","Step:4 Keep a slight bend in your elbows and engage your core.","Step:5 Pull the cables together in front of your chest, crossing them over each other.","Step:6 Squeeze your chest muscles at the peak of the movement.","Step:7 Slowly release the cables back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/j7XMAyn.gif"}',
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
  'cable standing fly',
  'Pr9Rhf4',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Attach the handles to the cables at chest height.","Step:2 Stand with your feet shoulder-width apart, facing away from the cable machine.","Step:3 Grasp the handles with an overhand grip, palms facing forward.","Step:4 Step forward slightly to create tension in the cables.","Step:5 Keep your core engaged and your back straight throughout the exercise.","Step:6 With a slight bend in your elbows, slowly bring your arms forward and together in front of your chest.","Step:7 Squeeze your chest muscles at the peak of the movement.","Step:8 Slowly reverse the movement, returning your arms to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Pr9Rhf4.gif"}',
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
  'wide hand push up',
  'JmMVpR3',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands wider than shoulder-width apart.","Step:2 Keep your body in a straight line from head to toe.","Step:3 Lower your chest towards the ground by bending your elbows, keeping them close to your sides.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JmMVpR3.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;