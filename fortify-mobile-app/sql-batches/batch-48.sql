INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell rear fly',
  '8DiFDVA',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Extend your arms straight down towards the ground, palms facing each other.","Step:4 Keeping a slight bend in your elbows, lift your arms out to the sides and squeeze your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8DiFDVA.gif"}',
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
  'dumbbell front raise',
  '3eGE2JC',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"biceps","trapezius"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your thighs.","Step:2 Keeping your arms straight, exhale and lift the dumbbells in front of you until they are at shoulder level.","Step:3 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3eGE2JC.gif"}',
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
  'cable standing cross-over high reverse fly',
  'P5p0j8B',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","rear deltoids"}',
  '{"Step:1 Attach a D-handle to each side of a cable machine at shoulder height.","Step:2 Stand in the middle of the cable machine with your feet shoulder-width apart.","Step:3 Grasp the handles with an overhand grip and extend your arms out to the sides, palms facing forward.","Step:4 Keep a slight bend in your elbows and maintain a straight back throughout the exercise.","Step:5 Engage your shoulder muscles and squeeze your shoulder blades together as you pull the handles towards the front of your body.","Step:6 Pause for a moment at the peak of the movement, then slowly return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P5p0j8B.gif"}',
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
  'dumbbell standing overhead press',
  'A6wtbuL',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.","Step:2 Press the dumbbells upward until your arms are fully extended overhead.","Step:3 Pause for a moment at the top, then slowly lower the dumbbells back down to shoulder level.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/A6wtbuL.gif"}',
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
  'dumbbell standing around world',
  'RSOsp5d',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Extend your arms straight out to the sides at shoulder height, palms facing down.","Step:3 Keeping your arms straight, slowly rotate your arms in a circular motion, bringing the dumbbells in front of your body and then overhead.","Step:4 Continue the circular motion, bringing the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RSOsp5d.gif"}',
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
  'band twisting overhead press',
  'u4bAmKp',
  'intermediate',
  'band',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band under your feet.","Step:2 Hold the band handles at shoulder height with your palms facing forward.","Step:3 Engage your core and press the band overhead, fully extending your arms.","Step:4 As you press, twist your torso to one side, keeping your hips stable.","Step:5 Pause for a moment at the top, then return to the starting position.","Step:6 Repeat the press and twist on the opposite side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u4bAmKp.gif"}',
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
  'dumbbell rear lateral raise (support head)',
  'UzkLrem',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows, until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UzkLrem.gif"}',
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
  'battling ropes',
  'RJa4tCo',
  'intermediate',
  'rope',
  '{"delts"}',
  '{"forearms","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold one end of the rope in each hand, with your palms facing each other.","Step:3 Raise your arms to shoulder height, keeping your elbows slightly bent.","Step:4 Begin making alternating waves with the ropes by rapidly raising and lowering each arm.","Step:5 Continue for the desired duration or number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RJa4tCo.gif"}',
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
  'kettlebell double push press',
  'I4KkPdl',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height.","Step:2 Bend your knees slightly and engage your core.","Step:3 Initiate the movement by explosively extending your hips, knees, and ankles, driving the kettlebells overhead.","Step:4 As the kettlebells reach the top, press them fully overhead, locking out your arms.","Step:5 Lower the kettlebells back to the starting position by bending your elbows and bringing them back down to shoulder height.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I4KkPdl.gif"}',
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
  'dumbbell upright row',
  'ainizkb',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Let the dumbbells hang in front of your thighs, with your arms fully extended.","Step:3 Keeping your back straight and your core engaged, exhale and lift the dumbbells straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ainizkb.gif"}',
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
  'kettlebell double jerk',
  'tznL2Ad',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height.","Step:2 Bend your knees slightly and engage your core.","Step:3 Press the kettlebells overhead, fully extending your arms.","Step:4 Bend your knees and quickly drop into a partial squat.","Step:5 Explosively extend your hips and knees, driving the kettlebells overhead.","Step:6 Lock out your arms and catch the kettlebells overhead with your knees slightly bent.","Step:7 Stand up straight and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tznL2Ad.gif"}',
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
  'band front lateral raise',
  'sTg7iys',
  'intermediate',
  'band',
  '{"delts"}',
  '{"traps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band in front of your thighs with your palms facing down.","Step:2 Keep your arms straight and lift the band up in front of you until your arms are parallel to the ground.","Step:3 Pause for a moment at the top, then slowly lower the band back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sTg7iys.gif"}',
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
  'dumbbell standing alternate raise',
  'SxHteRW',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your body.","Step:2 Keep your back straight and your core engaged.","Step:3 Raise one dumbbell to the side, keeping your arm straight and your palm facing down.","Step:4 Continue lifting until your arm is parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:6 Repeat with the other arm.","Step:7 Alternate between arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SxHteRW.gif"}',
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
  'dumbbell arnold press v. 2',
  'eOrFCnx',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper chest"}',
  '{"Step:1 Sit on a bench with back support and hold a dumbbell in each hand at shoulder level, palms facing your body and elbows bent.","Step:2 Press the dumbbells upward until your arms are fully extended and your palms are facing forward.","Step:3 Rotate your wrists as you lift, so that your palms end up facing forward at the top of the movement.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eOrFCnx.gif"}',
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
  'cable lateral raise',
  'goJ6ezq',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"traps","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and grasp the cable handles with an overhand grip.","Step:2 Keep your arms straight and your core engaged.","Step:3 Raise your arms out to the sides until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/goJ6ezq.gif"}',
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
  'cable forward raise',
  'hvHhCv8',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"triceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Hold the cable handle with an overhand grip, palms facing down, and your arms fully extended in front of you.","Step:3 Keeping your arms straight, raise the cable handle up to shoulder level.","Step:4 Pause for a moment at the top, then slowly lower the cable handle back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hvHhCv8.gif"}',
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
  'dumbbell standing palms in press',
  'UilDHSs',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing inwards.","Step:2 Keeping your core engaged and your back straight, press the dumbbells upwards until your arms are fully extended overhead.","Step:3 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UilDHSs.gif"}',
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
  'rear deltoid stretch',
  'xifhB5W',
  'intermediate',
  'body weight',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Extend your right arm across your chest, placing your left hand on your right elbow.","Step:3 Gently pull your right arm towards your left shoulder, feeling a stretch in your right shoulder.","Step:4 Hold the stretch for 15-30 seconds, then release.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xifhB5W.gif"}',
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
  'dumbbell front raise v. 2',
  'Rr7S3yg',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your thighs.","Step:2 Keep your back straight and engage your core.","Step:3 Slowly lift the dumbbells in front of you, with your arms straight, until they are at shoulder level.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Rr7S3yg.gif"}',
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
  'band front raise',
  'TFA88iB',
  'intermediate',
  'band',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band in front of your thighs with your palms facing down.","Step:2 Keep your arms straight and slowly raise them forward until they are parallel to the ground.","Step:3 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TFA88iB.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;