INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell lying one arm pronated triceps extension',
  'wyaqzOS',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your back and head supported, and your feet flat on the ground.","Step:2 Hold a dumbbell in one hand with your palm facing down, and extend your arm straight up above your shoulder.","Step:3 Keeping your upper arm stationary, slowly lower the dumbbell behind your head by bending your elbow.","Step:4 Pause for a moment at the bottom, then extend your arm back up to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wyaqzOS.gif"}',
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
  'push-up close-grip off dumbbell',
  'KZXAtKQ',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a push-up position with your hands placed close together, directly under your shoulders.","Step:2 Hold a dumbbell in each hand, resting them on the ground.","Step:3 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:4 Push through your palms to extend your arms and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KZXAtKQ.gif"}',
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
  'dumbbell standing one arm extension',
  'BCUR88E',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand.","Step:2 Raise the dumbbell overhead, fully extending your arm.","Step:3 Keep your upper arm close to your head and perpendicular to the ground.","Step:4 Slowly lower the dumbbell behind your head, bending your elbow.","Step:5 Pause for a moment, then raise the dumbbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BCUR88E.gif"}',
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
  'dumbbell standing kickback',
  'UmpPAAe',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Extend your arms straight back, squeezing your triceps at the top of the movement.","Step:4 Pause for a moment, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UmpPAAe.gif"}',
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
  'barbell jm bench press',
  'ZsiqXYa',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lower the barbell to your chest, keeping your elbows tucked in close to your body.","Step:4 Push the barbell back up to the starting position, fully extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZsiqXYa.gif"}',
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
  'dumbbell standing alternating tricep kickback',
  'Gi2BXfK',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Extend your arms straight back, keeping your elbows close to your body.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat with the other arm, alternating sides with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gi2BXfK.gif"}',
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
  'lever triceps extension',
  'Ser9eQp',
  'intermediate',
  'leverage machine',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the handles with an overhand grip and fully extend your arms in front of you.","Step:3 Keeping your upper arms stationary, slowly lower the handles towards your forehead by bending your elbows.","Step:4 Pause for a moment at the bottom, then push the handles back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ser9eQp.gif"}',
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
  'weighted bench dip',
  'MU9HnE7',
  'intermediate',
  'weighted',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a bench with your hands gripping the edge, fingers pointing forward.","Step:2 Slide your butt off the bench, supporting your weight with your hands.","Step:3 Lower your body by bending your elbows until your upper arms are parallel to the floor.","Step:4 Push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MU9HnE7.gif"}',
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
  'dumbbell one arm french press on exercise ball',
  'ziFKQXP',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand with your palm facing up and your elbow bent at a 90-degree angle.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow stationary.","Step:4 Slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ziFKQXP.gif"}',
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
  'barbell incline reverse-grip press',
  '641mIfk',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Lie back on the bench and grasp the barbell with a reverse grip, hands slightly wider than shoulder-width apart.","Step:3 Unrack the barbell and lower it towards your upper chest, keeping your elbows tucked in.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/641mIfk.gif"}',
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
  'bench dip on floor',
  '9RT8oQW',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on the edge of a bench or chair with your hands gripping the edge, fingers pointing forward.","Step:2 Slide your butt off the bench, supporting your weight with your hands.","Step:3 Lower your body by bending your elbows until your upper arms are parallel to the floor.","Step:4 Push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9RT8oQW.gif"}',
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
  'dumbbell one arm triceps extension (on bench)',
  'nAuHPcD',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell in one hand and place your other hand on the bench for support.","Step:3 Raise the dumbbell overhead, keeping your upper arm close to your head and your elbow pointing forward.","Step:4 Lower the dumbbell behind your head by bending your elbow, keeping your upper arm stationary.","Step:5 Extend your arm back up to the starting position, fully straightening your elbow.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nAuHPcD.gif"}',
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
  'barbell reverse close-grip bench press',
  'YqJw82s',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.","Step:2 Grasp the barbell with a reverse grip, hands shoulder-width apart.","Step:3 Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.","Step:4 Slowly lower the barbell down towards your chest, keeping your elbows close to your body.","Step:5 Pause for a moment when the barbell is just above your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YqJw82s.gif"}',
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
  'smith machine decline close grip bench press',
  'yB9SvIF',
  'intermediate',
  'smith machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the bench on the smith machine to a decline position.","Step:2 Lie down on the bench with your feet firmly planted on the ground.","Step:3 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:4 Unrack the barbell and lower it slowly towards your chest, keeping your elbows close to your body.","Step:5 Pause for a moment when the barbell is just above your chest.","Step:6 Push the barbell back up to the starting position, fully extending your arms.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yB9SvIF.gif"}',
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
  'cable reverse grip triceps pushdown (sz-bar) (with arm blaster)',
  'ThKP69G',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to the cable machine at the highest setting.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an underhand grip, palms facing up, and your hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Engage your triceps and slowly push the bar down until your arms are fully extended.","Step:6 Pause for a moment at the bottom, then slowly return the bar to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ThKP69G.gif"}',
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
  'barbell lying triceps extension skull crusher',
  'h8LFzo9',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.","Step:4 Pause for a moment when the barbell is just above your forehead, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/h8LFzo9.gif"}',
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
  'diamond push-up',
  'soIB2rj',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands close together, forming a diamond shape with your thumbs and index fingers.","Step:2 Keep your body in a straight line from head to toe, engaging your core and glutes.","Step:3 Lower your chest towards the diamond shape formed by your hands, keeping your elbows close to your body.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/soIB2rj.gif"}',
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
  'barbell seated overhead triceps extension',
  '5uFK1xr',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a barbell with an overhand grip, hands shoulder-width apart, and raise it overhead.","Step:3 Lower the barbell behind your head by bending your elbows, keeping your upper arms close to your head.","Step:4 Pause for a moment, then extend your arms to raise the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5uFK1xr.gif"}',
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
  'ez bar standing french press',
  '1cTf2Ux',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the ez barbell with an overhand grip.","Step:2 Raise the barbell above your head, fully extending your arms.","Step:3 Keeping your upper arms close to your head, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1cTf2Ux.gif"}',
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
  'ski ergometer',
  'vpQaQkH',
  'intermediate',
  'skierg machine',
  '{"triceps"}',
  '{"shoulders","forearms"}',
  '{"Step:1 Adjust the seat height and footrests to a comfortable position.","Step:2 Grasp the handles with an overhand grip, palms facing down.","Step:3 Sit up straight with your feet flat on the footrests.","Step:4 Extend your arms straight out in front of you, keeping your elbows slightly bent.","Step:5 Engage your triceps and push the handles down towards your thighs.","Step:6 Pause for a moment at the bottom, then slowly return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vpQaQkH.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;