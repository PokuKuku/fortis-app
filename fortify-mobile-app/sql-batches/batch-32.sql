INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'lever one arm lateral wide pulldown',
  'tTuZSDT',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the floor.","Step:2 Grasp the handle with an overhand grip and fully extend your arm, keeping a slight bend in your elbow.","Step:3 Pull the handle down and across your body towards your opposite hip, squeezing your lat muscle at the bottom of the movement.","Step:4 Slowly return the handle to the starting position, fully extending your arm.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tTuZSDT.gif"}',
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
  'cable pulldown',
  'RVwzP10',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the cable pulldown machine so that the seat is at a comfortable height and the knee pad is secured.","Step:2 Sit on the seat with your back straight and your feet flat on the ground.","Step:3 Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lean back slightly and engage your core.","Step:5 Pull the cable bar down towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RVwzP10.gif"}',
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
  'cable squat row (with rope attachment)',
  'f7fnAIB',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Attach a rope to a cable machine at waist height.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Bend your knees and lower your body into a squat position, keeping your back straight and chest up.","Step:4 Grasp the rope with an overhand grip, with your hands shoulder-width apart.","Step:5 Engage your core and pull the rope towards your body, squeezing your shoulder blades together.","Step:6 Keep your elbows close to your body and continue pulling until your hands reach your chest.","Step:7 Pause for a moment at the top of the movement, then slowly release the rope and extend your arms back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/f7fnAIB.gif"}',
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
  'l-pull-up',
  'd1GgzTU',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang with your arms fully extended and your body straight.","Step:3 Engage your lats and biceps to pull your body up towards the bar, keeping your elbows close to your body.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/d1GgzTU.gif"}',
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
  'macro style weighted one hand pull up',
  'G1qWW6M',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arm fully extended and your body straight. Perform with macro intensity.","Step:3 Engage your core and pull your body up towards the bar by bending your elbow and squeezing your back muscles.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G1qWW6M.gif"}',
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
  'cable twisting pull with intensified',
  '3nvEbbF',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"shoulders","biceps"}',
  '{"Step:1 Attach a cable handle to a low pulley and stand facing the machine.","Step:2 Grasp the handle with your left hand and step away from the machine, extending your arm fully.","Step:3 Position your feet shoulder-width apart, with your knees slightly bent.","Step:4 Keep your back straight and your core engaged throughout the exercise.","Step:5 Pull the handle towards your body, rotating your torso to the right as you do so.","Step:6 Squeeze your back muscles at the end of the movement.","Step:7 Slowly return to the starting position, keeping tension on the cable.","Step:8 (intensified variation) Repeat for the desired number of repetitions, then switch sides and perform with your right hand."}',
  'strength',
  '{"https://static.exercisedb.dev/media/3nvEbbF.gif"}',
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
  'band underhand pulldown with classic',
  '0I5fUyn',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach the band to a high anchor point, such as a pull-up bar or sturdy beam.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Grasp the band with an underhand grip, hands slightly wider than shoulder-width apart. Emphasize classic control.","Step:4 Extend your arms fully overhead, keeping your elbows slightly bent.","Step:5 Engage your lats and pull the band down towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0I5fUyn.gif"}',
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
  'pure chin-up',
  'IU4QNJ6',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.","Step:2 Engage your core and pull your body up towards the bar, leading with your chest. Emphasize pure control.","Step:3 Continue pulling until your chin is above the bar.","Step:4 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IU4QNJ6.gif"}',
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
  'barbell bent arm pullover - powerful variation',
  'EnPivTL',
  'intermediate',
  'barbell',
  '{"lats"}',
  '{"triceps","chest"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet on the floor.","Step:2 Hold a barbell with a shoulder-width grip and extend your arms straight above your chest.","Step:3 Lower the barbell behind your head while keeping your arms slightly bent.","Step:4 Pause for a moment, then raise the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions. Focus on powerful movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EnPivTL.gif"}',
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
  'stability style band kneeling one arm pulldown',
  'JxrY9mC',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","rhomboids"}',
  '{"Step:1 Attach the band to a sturdy anchor point above your head.","Step:2 Kneel down and hold the band with one hand, palm facing down.","Step:3 Extend your arm fully overhead, keeping your elbow slightly bent.","Step:4 Engage your lat muscles and pull the band down towards your side, bringing your elbow towards your ribcage.","Step:5 Pause for a moment at the bottom, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides. Perform with stability intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JxrY9mC.gif"}',
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
  'exercise ball alternating arm ups with fast',
  'b5uBMv2',
  'intermediate',
  'stability ball',
  '{"lats"}',
  '{"shoulders","core"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing inwards and your arms extended down by your sides.","Step:3 Engage your core and slowly lift one arm up towards your shoulder, keeping your elbow slightly bent. Perform with fast intensity.","Step:4 Pause for a moment at the top, then slowly lower your arm back down to the starting position.","Step:5 Repeat the movement with the other arm.","Step:6 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/b5uBMv2.gif"}',
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
  'one arm against wall compressed',
  'Rsxr3xl',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand facing a wall with your feet shoulder-width apart.","Step:2 Extend one arm straight out in front of you and place your palm against the wall.","Step:3 Engage your core and lean your body forward, keeping your arm straight and your back flat. Maintain compressed form throughout.","Step:4 Slowly push against the wall with your palm, activating your lat muscles.","Step:5 Hold the position for a few seconds, then release and repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Rsxr3xl.gif"}',
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
  'weighted one hand pull up fast',
  'J1vH2X0',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arm fully extended and your body straight.","Step:3 Engage your core and pull your body up towards the bar by bending your elbow and squeezing your back muscles.","Step:4 Continue pulling until your chin is above the bar.","Step:5 (fast variation) Lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/J1vH2X0.gif"}',
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
  'chin-up diagonal',
  'dVeWXf2',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.","Step:2 Engage your core and pull your body up towards the bar, leading with your chest.","Step:3 Continue pulling until your chin is above the bar.","Step:4 (diagonal variation) Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dVeWXf2.gif"}',
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
  'twisted side-to-side chin',
  'ninBEOY',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Hang from the bar with your arms fully extended and your body relaxed.","Step:4 Pull yourself up by bending your elbows and bringing your chin towards the bar, while keeping your body straight.","Step:5 Once your chin is above the bar, lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions. Perform with twisted intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ninBEOY.gif"}',
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
  'gentle style cable pulldown (pro lat bar)',
  '0MlxeMn',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height so that your thighs are parallel to the ground and your feet are flat on the floor.","Step:2 Grasp the lat bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Sit down and lean back slightly, keeping your chest up and your back straight.","Step:4 Pull the bar down towards your chest, squeezing your shoulder blades together. Maintain gentle form throughout.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the bar back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0MlxeMn.gif"}',
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
  'assisted standing chin-up with focused',
  'LlSe9IK',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the machine to your desired assistance level.","Step:2 (focused variation) Stand on the foot platform and grip the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Keep your chest up and shoulders back, engage your core, and slightly bend your knees.","Step:4 Pull your body up by flexing your elbows and driving your elbows down towards your sides.","Step:5 Continue pulling until your chin is above the bar.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LlSe9IK.gif"}',
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
  'assisted pull-up inclined',
  '5ipN0iE',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the machine to your desired weight and height settings.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang with your arms fully extended and your feet off the ground.","Step:4 Engage your back muscles and pull your body up towards the handles, keeping your elbows close to your body.","Step:5 Continue pulling until your chin is above the handles.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions. Maintain inclined form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5ipN0iE.gif"}',
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
  'lever assisted chin-up with twisted',
  'N3EirIW',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the leverage machine to your desired resistance level.","Step:2 Stand on the foot platform and grip the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang with your arms fully extended, keeping your body straight.","Step:4 (twisted variation) Engage your back muscles and pull your body up towards the handles, leading with your chest.","Step:5 Continue pulling until your chin is above the handles.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/N3EirIW.gif"}',
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
  'cable lateral pulldown (with rope attachment) core',
  'nFHk9fU',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach a rope attachment to the cable machine at a high position.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip, palms facing each other.","Step:4 Keep your back straight and lean slightly back.","Step:5 Pull the rope down towards your sides, squeezing your shoulder blades together. Emphasize core control.","Step:6 Pause for a moment at the bottom of the movement.","Step:7 Slowly release the tension and allow the rope to return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nFHk9fU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;