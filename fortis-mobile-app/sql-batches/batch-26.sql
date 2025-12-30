INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'clap push up',
  'wigSg76',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart.","Step:2 Lower your body towards the ground by bending your elbows, keeping your core engaged.","Step:3 Push through your palms explosively to propel your body off the ground.","Step:4 While in mid-air, clap your hands together before landing back in the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wigSg76.gif"}',
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
  'push-up medicine ball',
  'W8KAlkI',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a high plank position with your hands on the medicine ball, shoulder-width apart.","Step:2 Engage your core and lower your body towards the ground by bending your elbows, keeping your back straight.","Step:3 Push through your palms to extend your arms and return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/W8KAlkI.gif"}',
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
  'dumbbell pullover on exercise ball',
  'FSD6PGL',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","latissimus dorsi"}',
  '{"Step:1 Sit on an exercise ball and hold a dumbbell with both hands above your chest, arms extended.","Step:2 Slowly lower the dumbbell behind your head while keeping your arms straight.","Step:3 Pause for a moment, then raise the dumbbell back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/FSD6PGL.gif"}',
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
  'dumbbell incline bench press',
  'ns0SIbU',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your feet flat on the ground and your back pressed firmly against the bench.","Step:3 Hold a dumbbell in each hand, palms facing forward, and lift them to shoulder height.","Step:4 Slowly lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.","Step:5 Push the dumbbells back up to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ns0SIbU.gif"}',
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
  'lever decline chest press',
  'vsVoPHt',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat height and backrest of the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.","Step:4 Push the handles forward and away from your body until your arms are fully extended.","Step:5 Slowly lower the handles back towards your chest, keeping your elbows slightly bent.","Step:6 Pause for a moment at the bottom, then push the handles back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vsVoPHt.gif"}',
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
  'medicine ball chest push single response',
  'jeHtrlO',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding the medicine ball at chest level.","Step:2 Extend your arms forward, pushing the medicine ball away from your chest.","Step:3 Pause for a moment, then slowly bring the medicine ball back to your chest.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jeHtrlO.gif"}',
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
  'dumbbell reverse bench press',
  'UIbGx6H',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your knees bent.","Step:2 Hold a dumbbell in each hand with an overhand grip, palms facing towards your feet.","Step:3 Extend your arms straight up towards the ceiling, keeping a slight bend in your elbows.","Step:4 Slowly lower the dumbbells towards your chest, allowing your elbows to flare out to the sides.","Step:5 Pause for a moment at the bottom, then push the dumbbells back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UIbGx6H.gif"}',
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
  'dumbbell decline one arm fly',
  'NL6YBwN',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Lie down on a decline bench with a dumbbell in one hand, resting it on your thigh.","Step:2 Using your thigh to help raise the dumbbell, lift it up to shoulder width with your palm facing your torso.","Step:3 Rotate your wrist so that the palm of your hand is facing forward.","Step:4 As you breathe in, lower the dumbbell slowly to the side until you feel a stretch in your chest.","Step:5 Exhale and use your chest muscles to bring the dumbbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NL6YBwN.gif"}',
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
  'dumbbell one leg fly on exercise ball',
  'pH2x2jj',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in each hand, palms facing each other.","Step:2 Place one foot on the ground and extend the other leg straight out in front of you.","Step:3 Lean forward slightly and bring your arms out to the sides, keeping a slight bend in your elbows.","Step:4 Slowly lower the dumbbells down and out to the sides, feeling a stretch in your chest.","Step:5 Pause for a moment at the bottom, then squeeze your chest muscles to bring the dumbbells back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pH2x2jj.gif"}',
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
  'cable lying fly',
  'lJJ7Yq8',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Attach the handles to the cables and lie flat on a bench with your feet flat on the ground.","Step:2 Hold the handles with your palms facing each other and your arms extended straight above your chest.","Step:3 Keeping a slight bend in your elbows, lower your arms out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 Pause for a moment, then squeeze your chest muscles to bring your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lJJ7Yq8.gif"}',
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
  'dumbbell one arm pullover on exercise ball',
  'bQHPBU3',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","latissimus dorsi","rhomboids"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a dumbbell with one hand and extend your arm straight up above your chest.","Step:3 Slowly lower the dumbbell behind your head while keeping your arm straight.","Step:4 Pause for a moment, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bQHPBU3.gif"}',
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
  'incline reverse grip push-up',
  'XaaRnRn',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Place your hands on the edge of a bench or elevated surface, slightly wider than shoulder-width apart.","Step:2 Extend your legs behind you, resting on the balls of your feet, creating a straight line from your head to your heels.","Step:3 Lower your chest towards the bench by bending your elbows, keeping them close to your sides.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XaaRnRn.gif"}',
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
  'dumbbell one arm bench fly',
  'o5Jsk92',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a flat bench with a dumbbell in one hand, resting it on top of your thigh.","Step:2 Lie back on the bench, keeping the dumbbell pressed against your thigh.","Step:3 Using your free hand, help lift the dumbbell up to the starting position.","Step:4 Hold the dumbbell directly above your shoulder with your arm extended and palm facing inward.","Step:5 Lower the dumbbell out to the side in a wide arc, keeping a slight bend in your elbow.","Step:6 Pause when your arm is parallel to the ground, then reverse the movement and bring the dumbbell back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o5Jsk92.gif"}',
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
  'dumbbell press on exercise ball',
  'O8o7q4d',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and dumbbells in each hand, resting on your thighs.","Step:2 Slowly walk your feet forward, rolling the exercise ball until your lower back is supported on the ball and your knees are at a 90-degree angle.","Step:3 Raise the dumbbells to shoulder height, palms facing forward.","Step:4 Press the dumbbells upward until your arms are fully extended.","Step:5 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O8o7q4d.gif"}',
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
  'wall style dumbbell pullover hip extension on exercise ball',
  'ookVu2D',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and the dumbbell resting on your thighs.","Step:2 Slowly walk your feet forward, rolling the exercise ball down your back until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell with both hands and extend your arms straight up over your chest, keeping a slight bend in your elbows.","Step:4 Lower the dumbbell behind your head, keeping your arms straight and maintaining control.","Step:5 Pause for a moment, then raise the dumbbell back to the starting position.","Step:6 While keeping your arms extended, lift your hips off the ground, squeezing your glutes and engaging your core.","Step:7 (wall variation) Lower your hips back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ookVu2D.gif"}',
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
  'fierce weighted straight bar dip',
  'F56Xpw3',
  'intermediate',
  'weighted',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself between parallel bars with your arms fully extended and your body straight.","Step:2 Lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:3 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 (fierce variation) Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/F56Xpw3.gif"}',
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
  'dumbbell incline one arm press on exercise ball modified',
  'sJElUUI',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand, feet flat on the ground.","Step:2 Slowly walk your feet forward, rolling the ball until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell at shoulder height with your palm facing forward.","Step:4 Press the dumbbell upward until your arm is fully extended.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position. Emphasize modified control.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sJElUUI.gif"}',
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
  'stretched full planche push-up',
  'mAYqY4M',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Start in a push-up position with your hands placed slightly wider than shoulder-width apart.","Step:2 Engage your core and lower your body down towards the ground, keeping your elbows close to your sides.","Step:3 As you lower yourself, lean your body forward and lift your feet off the ground, balancing on your hands. Perform with stretched intensity.","Step:4 Continue to lower your body until your chest is just above the ground.","Step:5 Push through your hands and extend your arms to lift your body back up to the starting position.","Step:6 Maintain a straight line from your head to your heels throughout the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mAYqY4M.gif"}',
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
  'clock push-up extreme',
  'xOXZJRZ',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 As you lower, rotate your body to the left, extending your left arm straight out to the side. Focus on extreme movement.","Step:4 Push back up to the starting position, while rotating your body to the center.","Step:5 Repeat the push-up, this time rotating your body to the right and extending your right arm out to the side.","Step:6 Continue alternating sides with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xOXZJRZ.gif"}',
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
  'chest stretch with exercise ball partial',
  'W1p7BND',
  'intermediate',
  'stability ball',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your back straight.","Step:2 Hold the exercise ball with both hands and extend your arms straight out in front of you. Focus on partial movement.","Step:3 Slowly bring the exercise ball towards your chest, feeling a stretch in your chest muscles.","Step:4 Hold the stretch for a few seconds, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/W1p7BND.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;