INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'medicine ball supine chest throw',
  'Al3tP0D',
  'intermediate',
  'medicine ball',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on your back on a bench with your knees bent and feet flat on the ground.","Step:2 Hold the medicine ball with both hands, extending your arms straight up above your chest.","Step:3 Lower the medicine ball towards your chest, keeping your elbows close to your body.","Step:4 Explosively push the medicine ball upwards, extending your arms fully and throwing the ball as high as possible.","Step:5 Catch the medicine ball and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Al3tP0D.gif"}',
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
  'cable triceps pushdown (v-bar) (with arm blaster)',
  'OxJk1fg',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a v-bar attachment to the cable machine at the highest setting.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the v-bar with an overhand grip, palms facing down, and your hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Engage your triceps and exhale as you push the v-bar down until your arms are fully extended.","Step:6 Pause for a moment at the bottom of the movement, squeezing your triceps.","Step:7 Inhale as you slowly return the v-bar to the starting position, maintaining control.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OxJk1fg.gif"}',
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
  'barbell close-grip bench press',
  'J6Dx1Mu',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:3 Unrack the barbell and lower it slowly towards your chest, keeping your elbows close to your body.","Step:4 Pause for a moment when the barbell touches your chest.","Step:5 Push the barbell back up to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/J6Dx1Mu.gif"}',
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
  'assisted standing triceps extension (with towel)',
  '7HcfMBP',
  'intermediate',
  'assisted',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a towel with both hands behind your head.","Step:2 Keep your elbows close to your ears and your upper arms stationary.","Step:3 Slowly extend your forearms upward, squeezing your triceps at the top.","Step:4 Pause for a moment, then slowly lower the towel back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7HcfMBP.gif"}',
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
  'exercise ball dip',
  'kprile3',
  'intermediate',
  'stability ball',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Place your hands on the ball beside your hips, fingers pointing forward.","Step:3 Engage your triceps and push through your hands to lift your body off the ball, straightening your arms.","Step:4 Lower your body back down by bending your elbows, keeping them close to your sides.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kprile3.gif"}',
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
  'barbell seated close grip behind neck triceps extension',
  '4CBIBOM',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold the barbell with a close grip behind your neck, palms facing forward.","Step:3 Keep your elbows close to your head and slowly lower the barbell towards the back of your head.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4CBIBOM.gif"}',
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
  'triceps dips floor',
  '7aVz15j',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a chair or bench with your hands next to your hips, fingers pointing forward.","Step:2 Slide your butt off the front of the chair with your legs extended in front of you.","Step:3 Straighten your arms, keeping a little bend in your elbows to keep tension on your triceps and off your elbow joints.","Step:4 Slowly bend your elbows to lower your body toward the floor until your elbows are at about a 90-degree angle.","Step:5 Once you reach the bottom of the movement, press down into the chair to straighten your elbows, returning to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7aVz15j.gif"}',
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
  'medicine ball close grip push up',
  '8K7m2SS',
  'intermediate',
  'medicine ball',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands on the medicine ball, shoulder-width apart.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 Push back up to the starting position, fully extending your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8K7m2SS.gif"}',
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
  'ez barbell incline triceps extension',
  'KyLtiLT',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your back against the pad and hold the ez barbell with an overhand grip.","Step:3 Extend your arms fully overhead, keeping your elbows close to your head.","Step:4 Lower the barbell behind your head by bending your elbows, keeping your upper arms stationary.","Step:5 Pause for a moment, then extend your arms back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KyLtiLT.gif"}',
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
  'cable standing one arm triceps extension',
  'sYCcnon',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with your right hand, palm facing down, and position your arm so that it is fully extended and parallel to the ground.","Step:3 Keep your elbow stationary and close to your body.","Step:4 Slowly bend your elbow, lowering the cable handle towards the back of your head.","Step:5 Pause for a moment at the bottom of the movement, then extend your arm back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides and perform the exercise with your left arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sYCcnon.gif"}',
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
  'ez barbell jm bench press',
  'hnOYgH3',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the ez barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lower the barbell to your chest, keeping your elbows tucked in close to your body.","Step:4 Push the barbell back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hnOYgH3.gif"}',
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
  'barbell lying extension',
  'EMpUwRI',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EMpUwRI.gif"}',
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
  'cable pushdown (with rope attachment)',
  'dU605di',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a rope attachment to a high pulley on a cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.","Step:3 Grasp the rope with an overhand grip, palms facing each other.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Exhale and push the rope downward by extending your elbows until your arms are fully extended.","Step:6 Pause for a moment, then inhale and slowly return to the starting position by allowing your elbows to flex.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dU605di.gif"}',
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
  'cable two arm tricep kickback',
  'vvNjDJS',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold the cable handle in each hand with your palms facing inwards and your arms bent at a 90-degree angle.","Step:3 Keeping your upper arms stationary, extend your forearms backwards until your arms are fully extended.","Step:4 Pause for a moment, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vvNjDJS.gif"}',
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
  'body-up',
  'U6G2gk9',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start by placing your hands on a raised surface, such as a bench or parallel bars, with your palms facing down and fingers pointing forward.","Step:2 Extend your legs out in front of you, keeping your heels on the ground and your body straight.","Step:3 Lower your body by bending your elbows, keeping them close to your sides, until your upper arms are parallel to the ground.","Step:4 Pause for a moment, then push through your palms to straighten your arms and lift your body back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/U6G2gk9.gif"}',
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
  'cable concentration extension (on knee)',
  'Db7eEgw',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your knees bent and feet flat on the ground.","Step:2 Hold the cable handle with your right hand and place your elbow on the inside of your right knee.","Step:3 Extend your arm fully, keeping your elbow stationary and close to your knee.","Step:4 Pause for a moment at the top, then slowly lower your arm back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Db7eEgw.gif"}',
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
  'barbell reverse grip skullcrusher',
  'yRLPCLu',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the barbell with a reverse grip, palms facing towards your face, and your hands shoulder-width apart.","Step:3 Extend your arms straight up over your chest, keeping your elbows in and your wrists straight.","Step:4 Slowly lower the barbell towards your forehead by bending your elbows, keeping your upper arms stationary.","Step:5 Pause for a moment at the bottom, then extend your arms back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yRLPCLu.gif"}',
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
  'exercise ball seated triceps stretch',
  '7ePTw4B',
  'intermediate',
  'stability ball',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand and extend your arm straight up above your head.","Step:3 Bend your elbow and lower the dumbbell behind your head, keeping your upper arm close to your ear.","Step:4 Hold the stretch for a few seconds, then return to the starting position.","Step:5 Repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7ePTw4B.gif"}',
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
  'dumbbell forward lunge triceps extension',
  'XalXcvM',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 Keep your back straight and your chest up.","Step:4 Extend your arms straight overhead, keeping your elbows close to your ears.","Step:5 Lower the dumbbells behind your head by bending your elbows.","Step:6 Pause for a moment, then straighten your arms to return to the starting position.","Step:7 Repeat the movement for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XalXcvM.gif"}',
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
  'dumbbell standing bent over two arm triceps extension',
  '3T12T87',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend forward at the waist, keeping your back straight and your knees slightly bent.","Step:3 Extend your arms straight back, keeping your elbows close to your body.","Step:4 Slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3T12T87.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;