INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell incline raise',
  'nxW6BkN',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","triceps"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, resting on your thighs.","Step:2 Lean back on the bench and raise the dumbbells to shoulder height, palms facing forward.","Step:3 Keeping your back against the bench, exhale and raise the dumbbells above your head, fully extending your arms.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nxW6BkN.gif"}',
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
  'left hook. boxing',
  'hoXt6wv',
  'intermediate',
  'body weight',
  '{"delts"}',
  '{"biceps","triceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Keep your left hand up to protect your face and your right hand by your chin.","Step:3 Rotate your hips and pivot on your left foot as you extend your left arm forward in a punching motion.","Step:4 Twist your torso and engage your core muscles to generate power in the punch.","Step:5 Snap your arm back to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hoXt6wv.gif"}',
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
  'smith upright row',
  '1DN3iz4',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the smith machine.","Step:2 Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Keep your back straight and your core engaged.","Step:4 Pull the barbell up towards your chin, leading with your elbows.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1DN3iz4.gif"}',
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
  'dumbbell seated shoulder press',
  'znQUdHY',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, resting on your thighs.","Step:2 Raise the dumbbells to shoulder height, palms facing forward.","Step:3 Press the dumbbells upward until your arms are fully extended overhead.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/znQUdHY.gif"}',
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
  'kettlebell arnold press',
  'UM8mgyG',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height with your palms facing towards you.","Step:2 Engage your core and press the kettlebells overhead, rotating your palms to face forward as you extend your arms.","Step:3 Pause at the top of the movement, then slowly lower the kettlebells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UM8mgyG.gif"}',
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
  'dumbbell lying on floor rear delt raise',
  'Ion0XWz',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Lie face down on the floor with a dumbbell in each hand, palms facing each other.","Step:2 Extend your arms straight out in front of you, keeping a slight bend in your elbows.","Step:3 Engaging your shoulder muscles, lift your arms up and out to the sides, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ion0XWz.gif"}',
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
  'cable rear delt row (with rope)',
  'wqNPGCg',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Attach a rope handle to a low pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope handle with an overhand grip, palms facing each other.","Step:4 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:5 Keep your elbows slightly bent and pull the rope towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wqNPGCg.gif"}',
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
  'smith standing behind head military press',
  'ht8xDrP',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height of the smith machine so that the bar is at shoulder level.","Step:2 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:3 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lift the bar off the rack and step back, maintaining a stable stance.","Step:5 Position the bar behind your head, resting on your upper traps.","Step:6 Keep your core engaged and your chest lifted throughout the exercise.","Step:7 Press the bar overhead by extending your arms, fully straightening them.","Step:8 Pause briefly at the top of the movement, then slowly lower the bar back down to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ht8xDrP.gif"}',
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
  'lever shoulder press v. 3',
  'dNFYIU1',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Adjust the seat height and backrest of the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet flat on the floor.","Step:3 Grasp the handles of the machine with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Push the handles upward and forward until your arms are fully extended, but not locked.","Step:5 Pause for a moment at the top, then slowly lower the handles back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dNFYIU1.gif"}',
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
  'dumbbell one arm upright row',
  '6cKQC5E',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in one hand with an overhand grip.","Step:2 Let the dumbbell hang at arm''s length in front of your thighs, with your palm facing your body.","Step:3 Keeping your back straight and your core engaged, exhale and lift the dumbbell straight up towards your chin, leading with your elbow.","Step:4 Pause for a moment at the top, then inhale and slowly lower the dumbbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6cKQC5E.gif"}',
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
  'dumbbell w-press',
  'vmwLyCg',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Sit on a bench with a dumbbell in each hand, palms facing forward.","Step:2 Raise the dumbbells to shoulder height, elbows bent and palms facing forward.","Step:3 Press the dumbbells upward until your arms are fully extended overhead.","Step:4 Lower the dumbbells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vmwLyCg.gif"}',
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
  'cable shoulder press',
  'PzQanLE',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the cable machine so that the handles are at shoulder height.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Grasp the handles with an overhand grip and bring them up to shoulder level, with your elbows bent and pointing outwards.","Step:4 Press the handles upwards until your arms are fully extended overhead.","Step:5 Pause for a moment at the top, then slowly lower the handles back down to shoulder level.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PzQanLE.gif"}',
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
  'dumbbell upright row (back pov)',
  'Iptlv6x',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Let the dumbbells hang in front of your thighs, with your arms fully extended and your palms facing your body.","Step:3 Keeping your back straight and your core engaged, exhale and lift the dumbbells straight up towards your chin, leading with your elbows.","Step:4 Continue lifting until the dumbbells are at shoulder height, with your elbows pointing out to the sides.","Step:5 Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Iptlv6x.gif"}',
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
  'barbell upright row v. 2',
  '83HoW9X',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Let the barbell hang in front of your thighs, arms fully extended.","Step:3 Keeping your back straight, exhale and lift the barbell straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/83HoW9X.gif"}',
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
  'barbell upright row v. 3',
  'fI18Rbc',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Let the barbell hang in front of your thighs, arms fully extended.","Step:3 Keeping your core engaged and back straight, exhale as you lift the barbell straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale as you slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fI18Rbc.gif"}',
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
  'smith standing military press',
  'jjUPrze',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and bring it down to shoulder level, with your palms facing forward.","Step:4 Press the barbell upward until your arms are fully extended overhead.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to shoulder level.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jjUPrze.gif"}',
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
  'kettlebell seated two arm military press',
  'ZEkjZDi',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a kettlebell in each hand at shoulder level with your palms facing forward.","Step:3 Press the kettlebells overhead by extending your arms fully.","Step:4 Pause for a moment at the top, then slowly lower the kettlebells back to shoulder level.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZEkjZDi.gif"}',
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
  'band shoulder press',
  'peAeMR3',
  'intermediate',
  'band',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band under your feet.","Step:2 Hold the band with your palms facing forward and raise your hands to shoulder height, elbows bent.","Step:3 Press the band overhead, fully extending your arms.","Step:4 Pause for a moment at the top, then slowly lower the band back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/peAeMR3.gif"}',
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
  'barbell standing front raise over head',
  'S8mo30S',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a barbell in front of your thighs with an overhand grip.","Step:2 Keep your back straight and engage your core.","Step:3 Slowly raise the barbell in front of you, keeping your arms straight and your palms facing down.","Step:4 Continue lifting until the barbell is slightly above shoulder level.","Step:5 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S8mo30S.gif"}',
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
  'barbell front raise',
  'b2Uoz54',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"biceps","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell in front of your thighs with an overhand grip.","Step:2 Keep your arms straight and lift the barbell forward and upward until it reaches shoulder level.","Step:3 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/b2Uoz54.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;