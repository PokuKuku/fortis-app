INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell incline one arm press on exercise ball',
  'Bg5JKSH',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand, feet flat on the ground.","Step:2 Slowly walk your feet forward, rolling the ball until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell at shoulder height with your palm facing forward.","Step:4 Press the dumbbell upward until your arm is fully extended.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Bg5JKSH.gif"}',
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
  'barbell wide bench press',
  'JsKq9so',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a wide grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Lower the barbell slowly towards your chest, keeping your elbows slightly flared out.","Step:5 Pause for a moment when the barbell touches your chest, then push it back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JsKq9so.gif"}',
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
  'dumbbell decline fly',
  'xXm4nYq',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your head lower than your hips.","Step:2 Hold a dumbbell in each hand with your palms facing each other and your arms extended above your chest.","Step:3 Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 Pause for a moment, then squeeze your chest muscles to bring the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xXm4nYq.gif"}',
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
  'incline push-up (on box)',
  'F7vjXqT',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Place your hands on the edge of a box or elevated surface, slightly wider than shoulder-width apart.","Step:2 Extend your legs behind you, resting on the balls of your feet, creating a straight line from your head to your heels.","Step:3 Lower your chest towards the box by bending your elbows, keeping your body in a straight line.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/F7vjXqT.gif"}',
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
  'lever seated fly',
  'v3xmPAR',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"deltoids","trapezius"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the handles with a pronated grip and keep your elbows slightly bent.","Step:3 Exhale and push the handles forward, bringing them together in front of your chest.","Step:4 Pause for a moment, squeezing your chest muscles.","Step:5 Inhale and slowly return to the starting position, allowing your chest muscles to stretch.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/v3xmPAR.gif"}',
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
  'dumbbell incline hammer press',
  'PG1kcIb',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, resting on your thighs.","Step:2 Lie back on the bench and position the dumbbells at shoulder level with your palms facing each other.","Step:3 Press the dumbbells up and away from your body until your arms are fully extended.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PG1kcIb.gif"}',
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
  'dumbbell fly on exercise ball',
  'Lt3iWnf',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball and hold a dumbbell in each hand.","Step:2 Walk your feet forward and roll your body down until your head, neck, and upper back are supported by the ball.","Step:3 Extend your arms straight up above your chest, palms facing each other.","Step:4 Bend your elbows slightly and lower your arms out to the sides in a wide arc until you feel a stretch in your chest.","Step:5 Pause for a moment, then reverse the movement and squeeze your chest muscles as you bring the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Lt3iWnf.gif"}',
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
  'dumbbell incline fly on exercise ball',
  'HYe1ZqR',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on an exercise ball and roll forward until your upper back is resting on the incline bench.","Step:3 Hold a dumbbell in each hand with your palms facing each other and your arms extended above your chest.","Step:4 Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:5 Pause for a moment, then squeeze your chest muscles to bring the dumbbells back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HYe1ZqR.gif"}',
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
  'cable one arm lateral bent-over',
  'dB07vDu',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","trapezius"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing a cable machine.","Step:2 Grasp the handle with one hand and step back to create tension on the cable.","Step:3 Bend forward at the waist, keeping your back straight and your core engaged.","Step:4 Extend your arm out to the side, parallel to the ground, with a slight bend in your elbow.","Step:5 Slowly bring your arm back to the starting position, maintaining control throughout the movement.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dB07vDu.gif"}',
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
  'smith wide grip decline bench press',
  'wi2H9QX',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the decline bench to the desired angle.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Grasp the barbell with a wide grip, slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows pointed outwards.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wi2H9QX.gif"}',
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
  'medicine ball chest push from 3 point stance',
  'dCJnuVq',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start in a 3 point stance with one hand on the medicine ball and the other hand on the ground.","Step:2 Extend your legs and position your body in a straight line.","Step:3 Lower your chest towards the ground while keeping your back straight.","Step:4 Push the medicine ball away from your body, extending your arm fully.","Step:5 Return to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dCJnuVq.gif"}',
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
  'decline push-up',
  'i5cEhka',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Place your hands on the ground slightly wider than shoulder-width apart, with your feet elevated on a stable surface.","Step:2 Keep your body in a straight line from head to toe, engaging your core muscles.","Step:3 Lower your chest towards the ground by bending your elbows, keeping them close to your body.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/i5cEhka.gif"}',
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
  'dumbbell decline hammer press',
  '1qrWgZ2',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your head lower than your hips.","Step:2 Hold a dumbbell in each hand with your palms facing each other and your arms extended above your chest.","Step:3 Lower the dumbbells to the sides of your chest, keeping your elbows slightly bent.","Step:4 Press the dumbbells back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1qrWgZ2.gif"}',
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
  'cable bench press',
  '7xI5MXA',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the cable machine to chest height and attach the handles.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Grasp the handles with an overhand grip and step forward to create tension in the cables.","Step:4 Position your feet firmly on the ground and engage your core.","Step:5 Bend your elbows and bring your hands to shoulder level, keeping your elbows at a 90-degree angle.","Step:6 Push the handles forward, extending your arms fully in front of you.","Step:7 Pause for a moment, then slowly reverse the movement, bringing your hands back to shoulder level.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7xI5MXA.gif"}',
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
  'smith bench press',
  'trqKQv2',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the height of the smith machine bar to chest level.","Step:2 Lie flat on the bench with your feet firmly planted on the ground.","Step:3 Grip the bar with an overhand grip slightly wider than shoulder-width apart.","Step:4 Unrack the bar and lower it towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment when the bar touches your chest.","Step:6 Push the bar back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/trqKQv2.gif"}',
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
  'dumbbell pullover hip extension on exercise ball',
  'lI7easp',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and the dumbbell resting on your thighs.","Step:2 Slowly walk your feet forward, rolling the exercise ball down your back until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell with both hands and extend your arms straight up over your chest, keeping a slight bend in your elbows.","Step:4 Lower the dumbbell behind your head, keeping your arms straight and maintaining control.","Step:5 Pause for a moment, then raise the dumbbell back to the starting position.","Step:6 While keeping your arms extended, lift your hips off the ground, squeezing your glutes and engaging your core.","Step:7 Lower your hips back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lI7easp.gif"}',
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
  'resistance band seated chest press',
  '4x5Okof',
  'intermediate',
  'resistance band',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Hold the resistance band handles in each hand, with your palms facing down and elbows bent at a 90-degree angle.","Step:3 Extend your arms forward, pushing the resistance band away from your chest.","Step:4 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4x5Okof.gif"}',
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
  'barbell bench press',
  'EIeI8Vf',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Lower the barbell slowly towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position by extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EIeI8Vf.gif"}',
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
  'smith reverse-grip press',
  'zK8Fu1W',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the height of the smith machine bar to chest level.","Step:2 Stand facing the bar with your feet shoulder-width apart.","Step:3 Grasp the bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:4 Step back and position yourself with a slight bend in your knees.","Step:5 Keep your chest up and core engaged throughout the exercise.","Step:6 Lower the bar towards your chest, keeping your elbows tucked in.","Step:7 Pause for a moment at the bottom, then push the bar back up to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zK8Fu1W.gif"}',
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
  'smith decline bench press',
  'ETZfAbZ',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the decline bench to the desired angle.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ETZfAbZ.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;