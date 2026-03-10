INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'band one arm twisting chest press',
  'c16nYGA',
  'intermediate',
  'band',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Attach the band to a sturdy anchor point at chest height.","Step:2 Stand with your side facing the anchor point and grab the band with one hand.","Step:3 Step away from the anchor point to create tension in the band.","Step:4 Position your feet shoulder-width apart and slightly bend your knees.","Step:5 Bring your hand holding the band across your body, towards the opposite shoulder.","Step:6 While maintaining tension in the band, push your hand forward and away from your body, extending your arm.","Step:7 Slowly return to the starting position and repeat for the desired number of repetitions.","Step:8 Switch sides and repeat the exercise with the other hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/c16nYGA.gif"}',
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
  'weighted drop push up',
  'PSlvNMs',
  'intermediate',
  'weighted',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Lower your chest towards the ground, keeping your elbows close to your body.","Step:3 Once your chest is just above the ground, explosively push yourself up, lifting your hands off the ground.","Step:4 As you push up, quickly move your hands out to the sides and slightly forward, allowing your body to drop down towards the ground.","Step:5 Catch yourself with your hands in the wider position and immediately lower your chest towards the ground again.","Step:6 Repeat the push-up motion, dropping down and catching yourself with your hands in the narrower position.","Step:7 Continue alternating between the wider and narrower hand positions for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PSlvNMs.gif"}',
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
  'raise single arm push-up',
  '13TpY4H',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Extend one arm straight out to the side, parallel to the ground.","Step:3 Lower your body towards the ground by bending your elbows, keeping your back straight and core engaged.","Step:4 Push back up to the starting position, using your chest muscles to lift your body.","Step:5 Repeat with the other arm extended."}',
  'strength',
  '{"https://static.exercisedb.dev/media/13TpY4H.gif"}',
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
  'push-up (wall) v. 2',
  'NCmbLCw',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Stand facing a wall, about arm''s length away.","Step:2 Place your hands on the wall at shoulder height, slightly wider than shoulder-width apart.","Step:3 Step back with your feet, keeping them hip-width apart.","Step:4 Engage your core and keep your body in a straight line from head to heels.","Step:5 Bend your elbows and lower your chest towards the wall, keeping your body straight.","Step:6 Pause for a moment, then push yourself back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NCmbLCw.gif"}',
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
  'kneeling push-up (male)',
  'ZOuKWir',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start by kneeling on the ground with your hands shoulder-width apart, fingers pointing forward.","Step:2 Extend your legs behind you, resting on the balls of your feet, so that your body forms a straight line from head to heels.","Step:3 Engage your core and lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:4 Continue lowering until your chest is just above the ground, then push back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZOuKWir.gif"}',
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
  'isometric chest squeeze',
  'HbSG1Pw',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Extend your arms straight out in front of you, parallel to the ground, with your palms facing each other.","Step:3 Squeeze your chest muscles together as hard as you can, while keeping your arms straight.","Step:4 Hold this position for a few seconds, focusing on contracting your chest muscles.","Step:5 Release the squeeze and relax your chest muscles.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HbSG1Pw.gif"}',
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
  'barbell reverse grip incline bench press',
  'DU7I633',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie down on the bench with your feet flat on the ground.","Step:3 Grasp the barbell with a reverse grip, hands slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DU7I633.gif"}',
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
  'kettlebell plyo push-up',
  'ktf3nvW',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a high plank position with your hands on the kettlebells, shoulder-width apart.","Step:2 Lower your chest towards the ground, keeping your elbows close to your body.","Step:3 Push through your hands explosively, lifting your hands off the kettlebells and extending your arms fully.","Step:4 Land softly back on the kettlebells and immediately lower your chest back down for the next repetition.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ktf3nvW.gif"}',
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
  'single arm push-up',
  'MUic5zN',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and one hand placed slightly wider than the other.","Step:2 Engage your core and lower your body towards the ground by bending your elbows, keeping your back straight.","Step:3 As you lower yourself, shift your weight to one side and lift the opposite arm off the ground, extending it straight out to the side.","Step:4 Push through your chest and triceps to raise your body back up to the starting position, while simultaneously lowering your extended arm back to the ground.","Step:5 Repeat the movement, alternating the arm you extend with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MUic5zN.gif"}',
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
  'barbell decline wide-grip press',
  'hl8DUh8',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your head lower than your hips.","Step:2 Grasp the barbell with a wide grip, slightly wider than shoulder-width apart.","Step:3 Lower the barbell to your chest, keeping your elbows out to the sides.","Step:4 Push the barbell back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hl8DUh8.gif"}',
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
  'dumbbell bench press',
  'SpYC0Kp',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Hold a dumbbell in each hand, with your palms facing forward and your arms extended above your chest.","Step:3 Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle.","Step:4 Pause for a moment, then push the dumbbells back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SpYC0Kp.gif"}',
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
  'dumbbell lying one arm press v. 2',
  'K3dIO25',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your back supported and feet flat on the ground.","Step:2 Hold a dumbbell in one hand with your palm facing towards your feet.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow slightly bent.","Step:4 Slowly lower the dumbbell down towards your chest, keeping your elbow close to your body.","Step:5 Pause for a moment at the bottom, then push the dumbbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/K3dIO25.gif"}',
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
  'cable decline one arm press',
  'KHGNa16',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the cable machine to a decline position.","Step:2 Stand facing away from the machine and grab the handle with one hand.","Step:3 Position yourself with your back against the decline bench and your arm extended straight in front of you.","Step:4 Bend your elbow and lower the handle towards your chest while keeping your upper arm stationary.","Step:5 Pause for a moment at the bottom, then push the handle back up to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KHGNa16.gif"}',
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
  'lever incline chest press v. 2',
  'o17Jfkt',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat height and backrest angle on the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.","Step:4 Push the handles forward and away from your body until your arms are fully extended, but without locking your elbows.","Step:5 Pause for a moment at the fully extended position, then slowly bend your elbows and lower the handles back towards your chest.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o17Jfkt.gif"}',
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
  'cable decline fly',
  '7saC5zz',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the cable machine to a decline position.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Hold the handles with your palms facing forward and your arms extended straight out in front of you.","Step:4 Keeping a slight bend in your elbows, open your arms out to the sides in a controlled motion.","Step:5 Pause for a moment at the fully extended position, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7saC5zz.gif"}',
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
  'barbell reverse grip decline bench press',
  'DotAgEF',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your head lower than your hips.","Step:2 Grasp the barbell with a reverse grip, slightly wider than shoulder-width apart.","Step:3 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DotAgEF.gif"}',
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
  'chest stretch with exercise ball',
  'ykA5tU7',
  'intermediate',
  'stability ball',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your back straight.","Step:2 Hold the exercise ball with both hands and extend your arms straight out in front of you.","Step:3 Slowly bring the exercise ball towards your chest, feeling a stretch in your chest muscles.","Step:4 Hold the stretch for a few seconds, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ykA5tU7.gif"}',
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
  'plyo push up',
  'Snj1wSv',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart.","Step:2 Lower your chest towards the ground by bending your elbows, keeping your body in a straight line.","Step:3 Push explosively off the ground, using your chest muscles to propel your upper body off the ground.","Step:4 Land softly with your hands back in the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Snj1wSv.gif"}',
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
  'barbell wide reverse grip bench press',
  '945zpRg',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a wide reverse grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Lower the barbell slowly towards your chest, keeping your elbows tucked in and your wrists straight.","Step:5 Pause for a moment when the barbell touches your chest, then push it back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/945zpRg.gif"}',
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
  'dumbbell one arm fly on exercise ball',
  'Am02iPd',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand and your feet flat on the ground.","Step:2 Walk your feet forward and roll your body down until your upper back is resting on the exercise ball.","Step:3 Extend your arm with the dumbbell straight up above your chest, palm facing inwards.","Step:4 Slowly lower the dumbbell out to the side, keeping a slight bend in your elbow.","Step:5 Pause for a moment, then squeeze your chest muscles to bring the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Am02iPd.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;