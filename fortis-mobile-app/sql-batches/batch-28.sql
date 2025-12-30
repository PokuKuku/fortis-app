INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'intensified style kettlebell extended range one arm press on floor',
  'o80Xu9C',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start by lying on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold a kettlebell in one hand, with your palm facing towards your feet.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow locked and your wrist straight.","Step:4 Slowly lower the kettlebell back down to the starting position, maintaining control throughout the movement.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm. Perform with intensified intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o80Xu9C.gif"}',
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
  'side push neck stretch',
  'oQRJYkC',
  'intermediate',
  'body weight',
  '{"levator scapulae"}',
  '{"trapezius","sternocleidomastoid"}',
  '{"Step:1 Stand or sit up straight with your shoulders relaxed.","Step:2 Tilt your head to the right, bringing your right ear towards your right shoulder.","Step:3 Place your right hand on the left side of your head and gently apply pressure to increase the stretch.","Step:4 Hold the stretch for 15-30 seconds.","Step:5 Repeat on the other side, tilting your head to the left and applying pressure with your left hand.","Step:6 Repeat the stretch 2-3 times on each side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oQRJYkC.gif"}',
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
  'neck side stretch',
  'x2chWLO',
  'intermediate',
  'body weight',
  '{"levator scapulae"}',
  '{"trapezius","sternocleidomastoid"}',
  '{"Step:1 Stand or sit up straight with your shoulders relaxed.","Step:2 Tilt your head to one side, bringing your ear towards your shoulder.","Step:3 Hold the stretch for 15-30 seconds.","Step:4 Repeat on the other side.","Step:5 Perform 2-4 sets on each side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x2chWLO.gif"}',
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
  'one arm against wall',
  'ZZTGMKh',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand facing a wall with your feet shoulder-width apart.","Step:2 Extend one arm straight out in front of you and place your palm against the wall.","Step:3 Engage your core and lean your body forward, keeping your arm straight and your back flat.","Step:4 Slowly push against the wall with your palm, activating your lat muscles.","Step:5 Hold the position for a few seconds, then release and repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZZTGMKh.gif"}',
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
  'archer pull up',
  '72BC5Za',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Start by hanging from a pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Engage your core and pull your shoulder blades down and back.","Step:3 As you pull yourself up, bend one arm and bring your elbow towards your side, while keeping the other arm straight.","Step:4 Continue pulling until your chin is above the bar and your bent arm is fully flexed.","Step:5 Lower yourself back down with control, straightening the bent arm and repeating the movement on the other side.","Step:6 Alternate sides with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/72BC5Za.gif"}',
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
  'standing lateral stretch',
  '1jXLYEw',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"shoulders","obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Extend your arms straight out to the sides, parallel to the ground.","Step:3 Slowly lean your upper body to one side, feeling a stretch in your side and lats.","Step:4 Hold the stretch for 15-30 seconds.","Step:5 Return to the starting position and repeat on the other side.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1jXLYEw.gif"}',
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
  'lever front pulldown',
  '7F1DVzn',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your knees under the pads and your feet flat on the ground.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Sit upright with your chest lifted and your shoulders back, maintaining a slight arch in your lower back.","Step:4 Engage your lats and pull the handles down towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7F1DVzn.gif"}',
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
  'side-to-side chin',
  'isAAZWA',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Hang from the bar with your arms fully extended and your body relaxed.","Step:4 Pull yourself up by bending your elbows and bringing your chin towards the bar, while keeping your body straight.","Step:5 Once your chin is above the bar, lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/isAAZWA.gif"}',
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
  'band assisted pull-up',
  'r1XNRYB',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach the band to a pull-up bar or sturdy anchor point.","Step:2 Step onto the band and grip the bar with your palms facing away from you, hands slightly wider than shoulder-width apart.","Step:3 Hang with your arms fully extended, keeping your core engaged and your shoulders down and back.","Step:4 Pull your body up towards the bar by squeezing your shoulder blades together and driving your elbows down towards your hips.","Step:5 Continue pulling until your chin is above the bar, then slowly lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/r1XNRYB.gif"}',
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
  'reverse grip machine lat pulldown',
  'ecpY0rH',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your knees under the pads and your feet flat on the ground.","Step:2 Grasp the handles with an underhand grip, slightly wider than shoulder-width apart.","Step:3 Sit upright with your chest out and shoulders back, maintaining a slight arch in your lower back.","Step:4 Pull the handles down towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ecpY0rH.gif"}',
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
  'exercise ball alternating arm ups',
  'EyLrNC2',
  'intermediate',
  'stability ball',
  '{"lats"}',
  '{"shoulders","core"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing inwards and your arms extended down by your sides.","Step:3 Engage your core and slowly lift one arm up towards your shoulder, keeping your elbow slightly bent.","Step:4 Pause for a moment at the top, then slowly lower your arm back down to the starting position.","Step:5 Repeat the movement with the other arm.","Step:6 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EyLrNC2.gif"}',
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
  'cable lying extension pullover (with rope attachment)',
  'Q2Eu1Ax',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Attach a rope to a cable machine and set the pulley at the highest position.","Step:2 Lie down on a bench with your head towards the cable machine.","Step:3 Hold the rope with both hands and extend your arms straight up above your chest.","Step:4 Keeping your arms straight, slowly lower the rope behind your head while maintaining control.","Step:5 Pause for a moment at the bottom, then slowly raise the rope back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Q2Eu1Ax.gif"}',
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
  'pull-up',
  'lBDjFxJ',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Hang from a pull-up bar with your palms facing away from you and your arms fully extended.","Step:2 Engage your core and squeeze your shoulder blades together.","Step:3 Pull your body up towards the bar by bending your elbows and bringing your chest towards the bar.","Step:4 Pause at the top of the movement, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lBDjFxJ.gif"}',
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
  'seated lower back stretch',
  'QFmz6ch',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Sit on the edge of a chair with your feet flat on the ground.","Step:2 Place your hands on your thighs or on the sides of the chair for support.","Step:3 Slowly lean forward from your hips, keeping your back straight.","Step:4 Feel the stretch in your lower back and hold for 20-30 seconds.","Step:5 Slowly return to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QFmz6ch.gif"}',
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
  'cable pulldown (pro lat bar)',
  'qdRxqCj',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height so that your thighs are parallel to the ground and your feet are flat on the floor.","Step:2 Grasp the lat bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Sit down and lean back slightly, keeping your chest up and your back straight.","Step:4 Pull the bar down towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the bar back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qdRxqCj.gif"}',
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
  'weighted muscle up (on bar)',
  'MCkqdKE',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","triceps","shoulders","forearms"}',
  '{"Step:1 Start by hanging from a pull-up bar with your palms facing away from you and your hands slightly wider than shoulder-width apart.","Step:2 Engage your core and pull your shoulder blades down and back.","Step:3 Bend your elbows and pull your chest towards the bar, keeping your body straight.","Step:4 Once your chest reaches the bar, push down with your hands and drive your elbows back, lifting your body above the bar.","Step:5 Pause at the top of the movement, then slowly lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MCkqdKE.gif"}',
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
  'muscle up',
  'yJUHKTn',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","triceps","shoulders","chest"}',
  '{"Step:1 Start by hanging from a pull-up bar with your palms facing away from you and your arms fully extended.","Step:2 Engage your core and pull your body up towards the bar, leading with your chest.","Step:3 As you reach the top of the movement, transition your grip so that your palms are facing towards you.","Step:4 Continue pulling yourself up until your chest is above the bar and your arms are fully flexed.","Step:5 Reverse the movement by slowly lowering yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yJUHKTn.gif"}',
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
  'cable straight arm pulldown',
  'x69MAlq',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"shoulders","biceps"}',
  '{"Step:1 Attach a straight bar to the high pulley of a cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an overhand grip, keeping your arms straight and your palms facing down.","Step:4 Engage your lats and pull the bar down towards your thighs, keeping your arms straight throughout the movement.","Step:5 Pause for a moment at the bottom, then slowly return the bar to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x69MAlq.gif"}',
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
  'band close-grip pulldown',
  'DptumMx',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach the band to a high anchor point, such as a pull-up bar or sturdy beam.","Step:2 Stand facing the anchor point and grab the band with an underhand grip, hands shoulder-width apart.","Step:3 Step back to create tension in the band, keeping your feet hip-width apart.","Step:4 Engage your core and keep your back straight as you pull the band down towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the band back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DptumMx.gif"}',
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
  'exercise ball lower back stretch (pyramid)',
  'yU7w7CA',
  'intermediate',
  'stability ball',
  '{"lats"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Slowly walk your feet forward, rolling the ball down your back until your lower back is resting on the ball.","Step:3 Place your hands behind your head or cross them over your chest.","Step:4 Engage your core and slowly lower your upper body towards the ground, allowing your lower back to stretch over the ball.","Step:5 Hold the stretch for a few seconds, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yU7w7CA.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;