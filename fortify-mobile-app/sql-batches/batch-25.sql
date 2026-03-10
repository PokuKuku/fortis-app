INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'smith wide grip bench press',
  'zoOvPcx',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the bench to a comfortable position on the smith machine.","Step:2 Lie down on the bench with your feet flat on the ground.","Step:3 Grasp the barbell with a wide grip, slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows out to the sides.","Step:5 Pause for a moment when the barbell touches your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zoOvPcx.gif"}',
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
  'smith incline reverse-grip press',
  '78VqWQK',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat of the smith machine to a comfortable incline angle.","Step:2 Sit on the machine with your back against the pad and your feet flat on the ground.","Step:3 Grasp the bar with an overhand grip that is slightly wider than shoulder-width apart.","Step:4 Unrack the bar and lower it slowly towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment when the bar is just above your chest.","Step:6 Push the bar back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/78VqWQK.gif"}',
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
  'shoulder tap push-up',
  'qEse6fe',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","core"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your body in a straight line from head to heels.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 As you push back up, lift your right hand off the ground and tap your left shoulder.","Step:4 Return your right hand to the ground and repeat the push-up, this time lifting your left hand and tapping your right shoulder.","Step:5 Continue alternating shoulder taps with each push-up repetition.","Step:6 Maintain a stable core and avoid excessive hip rotation throughout the exercise.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qEse6fe.gif"}',
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
  'cable one arm press on exercise ball',
  'MKIelrR',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a cable handle in one hand and position your arm at chest height, elbow bent.","Step:3 Place your other hand on your hip for stability.","Step:4 Press the cable handle forward, extending your arm fully.","Step:5 Pause for a moment, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MKIelrR.gif"}',
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
  'dynamic chest stretch (male)',
  '3uj0Ozg',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Extend your arms straight out to the sides, parallel to the ground.","Step:3 Slowly bring your arms forward, crossing them in front of your body.","Step:4 Feel the stretch in your chest muscles.","Step:5 Hold the stretch for 10-30 seconds.","Step:6 Return to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3uj0Ozg.gif"}',
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
  'behind head chest stretch',
  'QoHIhPl',
  'intermediate',
  'assisted',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Interlace your fingers behind your head with your elbows pointing outwards.","Step:3 Slowly squeeze your shoulder blades together and push your chest forward.","Step:4 Hold the stretch for 15-30 seconds.","Step:5 Release the stretch and repeat as desired."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QoHIhPl.gif"}',
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
  'medicine ball chest push multiple response',
  '7aolH9D',
  'intermediate',
  'medicine ball',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a medicine ball at chest level.","Step:2 Extend your arms forward, pushing the medicine ball away from your chest.","Step:3 Pause for a moment, then slowly bring the medicine ball back to your chest.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7aolH9D.gif"}',
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
  'smith decline reverse-grip press',
  'MY9P1WA',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the smith machine to a decline position.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Grasp the barbell with a reverse grip, hands slightly wider than shoulder-width apart.","Step:4 Unrack the barbell and lower it towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MY9P1WA.gif"}',
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
  'dumbbell incline fly',
  'ESOd5Pl',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Set an incline bench to a 45-degree angle.","Step:2 Sit on the bench with a dumbbell in each hand, palms facing each other.","Step:3 Lie back on the bench and press the dumbbells up to the starting position, directly above your chest.","Step:4 Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:5 Pause for a moment, then squeeze your chest muscles to bring the dumbbells back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ESOd5Pl.gif"}',
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
  'dumbbell one arm chest fly on exercise ball',
  'Bpkf41o',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand and your feet flat on the ground.","Step:2 Walk your feet forward, rolling the ball until your upper back is supported on the ball and your head, neck, and shoulders are off the ball.","Step:3 Extend your arm with the dumbbell straight up above your chest, palm facing inward.","Step:4 Slowly lower the dumbbell out to the side, keeping a slight bend in your elbow.","Step:5 Pause for a moment when your arm is parallel to the ground.","Step:6 Engage your chest muscles to bring the dumbbell back up to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Bpkf41o.gif"}',
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
  'hyght dumbbell fly',
  'P9ZRyLT',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight up over your chest, with a slight bend in your elbows.","Step:3 Keeping a slight bend in your elbows, lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.","Step:4 Pause for a moment, then reverse the movement and bring the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P9ZRyLT.gif"}',
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
  'smith machine reverse decline close grip bench press',
  'QyO6Uma',
  'intermediate',
  'smith machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the smith machine to a decline position.","Step:2 Lie down on the bench with your feet secured under the foot pads.","Step:3 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.","Step:5 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QyO6Uma.gif"}',
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
  'dumbbell straight arm pullover',
  'i8BdLTK',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"latissimus dorsi","triceps"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet planted firmly on the ground.","Step:2 Hold a dumbbell with both hands and extend your arms straight above your chest.","Step:3 Keeping your arms straight, slowly lower the dumbbell behind your head in an arc-like motion.","Step:4 Pause for a moment, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/i8BdLTK.gif"}',
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
  'barbell decline bench press',
  'GrO65fd',
  'intermediate',
  'barbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your head lower than your hips.","Step:2 Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.","Step:3 Unrack the barbell and lower it slowly towards your chest, keeping your elbows tucked in.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GrO65fd.gif"}',
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
  'chest tap push-up (male)',
  '7E06s6d',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands slightly wider than shoulder-width apart and your body in a straight line.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 As you lower yourself, tap your chest with your right hand.","Step:4 Push yourself back up to the starting position.","Step:5 Repeat the movement, this time tapping your chest with your left hand.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7E06s6d.gif"}',
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
  'cable one arm fly on exercise ball',
  'hHy8tQG',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a cable handle in one hand and extend your arm out to the side, parallel to the ground.","Step:3 Keep your elbow slightly bent and your palm facing forward.","Step:4 Slowly bring your arm across your body, squeezing your chest muscles.","Step:5 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hHy8tQG.gif"}',
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
  'cable cross-over variation',
  '0CXGHya',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the cable pulleys to chest height.","Step:2 Stand in the center of the cable machine with one foot in front of the other.","Step:3 Grasp the handles with your palms facing down and your arms extended out to the sides.","Step:4 Take a step forward, keeping your arms slightly bent.","Step:5 With a slight bend in your elbows, bring your hands together in front of your chest.","Step:6 Pause for a moment, then slowly return your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0CXGHya.gif"}',
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
  'dumbbell lying hammer press',
  '7gdLIXa',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Lie flat on a bench with a dumbbell in each hand, palms facing each other and arms extended straight up.","Step:2 Lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.","Step:3 Press the dumbbells back up to the starting position, fully extending your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7gdLIXa.gif"}',
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
  'chest and front of shoulder stretch',
  'Uto7l43',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"deltoids"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Extend your arms straight out in front of you at shoulder height.","Step:3 Cross your arms in front of your body, with your right arm on top of your left arm.","Step:4 Interlace your fingers and press your palms together.","Step:5 Gently squeeze your shoulder blades together and push your hands forward, feeling a stretch in your chest and front of your shoulders.","Step:6 Hold the stretch for 20-30 seconds, then release.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Uto7l43.gif"}',
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
  'lever incline chest press',
  'jHAnWmT',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the seat and backrest of the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.","Step:4 Push the handles forward and away from your body until your arms are fully extended.","Step:5 Pause for a moment, then slowly bend your elbows and lower the handles back towards your chest.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jHAnWmT.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;