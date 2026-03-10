INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'push-up (wall)',
  'LEH9jxP',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","deltoids"}',
  '{"Step:1 Stand facing a wall, about arm''s length away.","Step:2 Place your hands on the wall at shoulder height, slightly wider than shoulder-width apart.","Step:3 Step back a few feet, keeping your body straight and your feet hip-width apart.","Step:4 Bend your elbows and lower your chest towards the wall, keeping your body in a straight line.","Step:5 Push back up to the starting position, straightening your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LEH9jxP.gif"}',
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
  'dumbbell incline press on exercise ball',
  'bfiHMpI',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in each hand, palms facing forward.","Step:2 Slowly walk your feet forward, rolling your body down the ball until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbells at shoulder level, elbows bent and pointing out to the sides.","Step:4 Press the dumbbells upward, extending your arms fully.","Step:5 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bfiHMpI.gif"}',
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
  'push up on bosu ball',
  'wVompEp',
  'intermediate',
  'bosu ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Place the bosu ball on the ground with the flat side facing up.","Step:2 Position yourself in a push-up position with your hands on the outer edges of the bosu ball.","Step:3 Engage your core and lower your body down towards the bosu ball by bending your elbows.","Step:4 Push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wVompEp.gif"}',
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
  'cable seated chest press',
  'nIR4Rwl',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the seat height and cable handles to a comfortable position.","Step:2 Sit on the bench with your back straight and feet flat on the floor.","Step:3 Grasp the cable handles with an overhand grip at shoulder height.","Step:4 Push the handles forward and away from your body, extending your arms fully.","Step:5 Pause for a moment, then slowly bring the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nIR4Rwl.gif"}',
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
  'kettlebell one arm floor press',
  'rg59QCH',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold the kettlebell in one hand with your palm facing towards your feet and your arm extended straight up towards the ceiling.","Step:3 Slowly lower the kettlebell towards your chest by bending your elbow, keeping your upper arm close to your body.","Step:4 Pause for a moment when the kettlebell is just above your chest, then push it back up to the starting position by extending your elbow.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rg59QCH.gif"}',
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
  'smith incline bench press',
  '5v7KYld',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the bench to a 30-45 degree incline.","Step:2 Sit on the bench with your back flat against the pad and feet firmly on the ground.","Step:3 Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your upper chest, keeping your elbows slightly tucked in.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5v7KYld.gif"}',
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
  'push-up',
  'I4hDWkc',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","deltoids","core"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Engage your core and lower your body towards the ground by bending your elbows, keeping your body in a straight line.","Step:3 Pause for a moment when your chest is just above the ground, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I4hDWkc.gif"}',
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
  'cable incline fly',
  'tBWXbIT',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the cable machine to a low position and attach the handles.","Step:2 Sit on an incline bench with your back against the pad and feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and extend your arms straight out in front of you.","Step:4 Keeping a slight bend in your elbows, open your arms out to the sides in a controlled motion.","Step:5 Pause for a moment at the fully extended position, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tBWXbIT.gif"}',
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
  'deep push up',
  'vptOQ4N',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your body in a straight line.","Step:2 Lower your chest towards the ground by bending your elbows, keeping them close to your body.","Step:3 Push through your palms to extend your arms and return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vptOQ4N.gif"}',
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
  'hands bike',
  'pAIWRGu',
  'intermediate',
  'upper body ergometer',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat height and handlebar position to a comfortable level.","Step:2 Sit on the ergometer with your back straight and feet on the pedals.","Step:3 Grasp the handles with your hands and position your arms at a 90-degree angle.","Step:4 Start pedaling with your hands, pushing and pulling the handles in a controlled motion.","Step:5 Continue pedaling for the desired duration or number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pAIWRGu.gif"}',
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
  'drop push up',
  'Q497lAE',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart.","Step:2 Lower your chest towards the ground, keeping your elbows close to your body.","Step:3 Once your chest is just above the ground, quickly drop your knees to the ground.","Step:4 Push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Q497lAE.gif"}',
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
  'barbell guillotine bench press',
  'GXoaSgn',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lower the barbell slowly towards your neck, keeping your elbows pointed outwards.","Step:4 Pause for a moment when the barbell is just above your neck.","Step:5 Push the barbell back up to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GXoaSgn.gif"}',
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
  'clock push-up',
  'CMAxnsG',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 As you lower, rotate your body to the left, extending your left arm straight out to the side.","Step:4 Push back up to the starting position, while rotating your body to the center.","Step:5 Repeat the push-up, this time rotating your body to the right and extending your right arm out to the side.","Step:6 Continue alternating sides with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CMAxnsG.gif"}',
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
  'band bench press',
  'khlHMqs',
  'intermediate',
  'band',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the band handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Extend your arms fully, pushing the bands away from your chest.","Step:4 Slowly lower the bands back down to your chest, keeping your elbows at a 90-degree angle.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/khlHMqs.gif"}',
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
  'dumbbell one arm press on exercise ball',
  'QZFv5ui',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Hold a dumbbell in one hand and position it at shoulder height, with your elbow bent and palm facing forward.","Step:3 Slowly press the dumbbell upward until your arm is fully extended, while keeping your core engaged and maintaining balance on the exercise ball.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QZFv5ui.gif"}',
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
  'weighted straight bar dip',
  'Ff18ItA',
  'intermediate',
  'weighted',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself between parallel bars with your arms fully extended and your body straight.","Step:2 Lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:3 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ff18ItA.gif"}',
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
  'dumbbell one arm reverse grip press',
  'Ze7MoIb',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Sit on a flat bench with a dumbbell in one hand, palm facing towards your body.","Step:2 Place your feet flat on the ground and keep your back straight.","Step:3 Raise the dumbbell to shoulder height, keeping your elbow close to your body.","Step:4 Press the dumbbell upwards until your arm is fully extended.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ze7MoIb.gif"}',
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
  'dumbbell around pullover',
  'vi8EhoE',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","latissimus dorsi"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet firmly on the ground.","Step:2 Hold a dumbbell with both hands and extend your arms straight above your chest.","Step:3 Keeping your arms straight, slowly lower the dumbbell behind your head in an arc motion.","Step:4 Pause for a moment at the bottom, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vi8EhoE.gif"}',
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
  'lever standing chest press',
  'WbNq5Xu',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your feet flat on the ground.","Step:2 Grasp the handles with an overhand grip and position your hands at chest level.","Step:3 Push the handles forward until your arms are fully extended, keeping your elbows slightly bent.","Step:4 Pause for a moment, then slowly bring the handles back towards your chest, maintaining control throughout the movement.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WbNq5Xu.gif"}',
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
  'archer push up',
  'A9qxk2F',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart.","Step:2 Extend one arm straight out to the side, parallel to the ground.","Step:3 Lower your body by bending your elbows, keeping your back straight and core engaged.","Step:4 Push back up to the starting position.","Step:5 Repeat on the other side, extending the opposite arm out to the side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/A9qxk2F.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;