INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'lever narrow grip seated row',
  'IGjKj1v',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footrests to ensure proper form.","Step:2 Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Step:3 Grasp the handles with a narrow grip, palms facing each other.","Step:4 Keep your back straight and lean slightly forward.","Step:5 Pull the handles towards your torso, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement.","Step:7 Slowly release the handles and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IGjKj1v.gif"}',
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
  'resistance band seated straight back row',
  'Nu7jqFE',
  'intermediate',
  'resistance band',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on the floor with your legs extended and loop the resistance band around your feet.","Step:2 Hold the ends of the resistance band with your hands, palms facing each other.","Step:3 Keep your back straight and lean slightly back, engaging your core.","Step:4 Pull the resistance band towards your chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Nu7jqFE.gif"}',
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
  'london bridge',
  'bLyQokI',
  'intermediate',
  'rope',
  '{"upper back"}',
  '{"shoulders","biceps","forearms"}',
  '{"Step:1 Attach the rope to a high anchor point.","Step:2 Stand facing away from the anchor point with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip, palms facing down.","Step:4 Lean forward slightly, keeping your back straight and core engaged.","Step:5 Pull the rope towards your body, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bLyQokI.gif"}',
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
  'ez bar reverse grip bent over row',
  'G8dXpNG',
  'intermediate',
  'ez barbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold the ez barbell with an underhand grip, palms facing up, and hands shoulder-width apart.","Step:3 Bend forward at the hips, keeping your back straight and chest up, until your torso is almost parallel to the floor.","Step:4 Pull the ez barbell towards your lower chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top, then slowly lower the ez barbell back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/G8dXpNG.gif"}',
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
  'band one arm twisting seated row',
  'DKBwJrL',
  'intermediate',
  'band',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Sit on a bench or chair with your feet flat on the ground and your back straight.","Step:2 Hold the band with one hand and extend your arm fully in front of you.","Step:3 Keeping your back straight, pull the band towards your body by bending your elbow and squeezing your shoulder blades together.","Step:4 At the same time, twist your torso towards the side of the pulling arm.","Step:5 Pause for a moment at the top, then slowly release the tension in the band and return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DKBwJrL.gif"}',
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
  'cable rope seated row',
  'SJqRxOt',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the rowing machine with your feet flat on the footrests and knees slightly bent.","Step:2 Grasp the cable ropes with an overhand grip, palms facing each other.","Step:3 Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows.","Step:4 Pull the cable ropes towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SJqRxOt.gif"}',
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
  'cable straight back seated row',
  'Tq6gbK6',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms","shoulders"}',
  '{"Step:1 Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the cable handles with an overhand grip, palms facing down.","Step:3 Keep your back straight and lean slightly forward from the hips.","Step:4 Pull the cable handles towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Tq6gbK6.gif"}',
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
  'dumbbell reverse grip row (female)',
  'Nh3mvOO',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold a dumbbell in each hand with an overhand grip, palms facing your body.","Step:3 Bend forward at the waist, keeping your back straight and your core engaged.","Step:4 Let your arms hang straight down, fully extended, with a slight bend in your elbows.","Step:5 Pull the dumbbells up towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Nh3mvOO.gif"}',
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
  'cable low seated row controlled',
  'WM6TvvW',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the handles with an overhand grip, palms facing down.","Step:3 Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows. Maintain controlled form throughout.","Step:4 Pull the handles towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WM6TvvW.gif"}',
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
  'side cable high row (kneeling)',
  'N6dZN2I',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Attach a straight bar to a cable machine at chest height.","Step:2 Kneel down in front of the cable machine and grab the bar with an overhand grip, hands shoulder-width apart.","Step:3 Sit back on your heels, keeping your back straight and your core engaged.","Step:4 Pull the bar towards your upper abdomen, squeezing your shoulder blades together.","Step:5 Pause for a moment at the top of the movement, then slowly release the bar back to the starting position.","Step:6 Repeat for the desired number of repetitions. Maintain side form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/N6dZN2I.gif"}',
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
  'intense kettlebell two arm row',
  'u3UuCZu',
  'intermediate',
  'kettlebell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart, knees slightly bent, and hold a kettlebell in each hand with your palms facing your body.","Step:2 Bend forward at the hips, keeping your back straight and your core engaged.","Step:3 Pull the kettlebells up towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top, then slowly lower the kettlebells back down to the starting position.","Step:5 Repeat for the desired number of repetitions. Maintain intense form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u3UuCZu.gif"}',
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
  'precision style lever bent-over row with v-bar',
  'KWyEjtI',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and position yourself facing the machine.","Step:2 Grasp the v-bar with an overhand grip, keeping your back straight and your knees slightly bent.","Step:3 Pull the v-bar towards your abdomen, squeezing your shoulder blades together.","Step:4 Pause for a moment at the top of the movement, then slowly release the weight back to the starting position. Emphasize precision control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KWyEjtI.gif"}',
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
  'band one arm standing low row - lateral variation',
  'pgIdT6i',
  'intermediate',
  'band',
  '{"upper back"}',
  '{"biceps","shoulders"}',
  '{"Step:1 Attach the band to a stable anchor point at waist height.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Hold the band with one hand, palm facing inward, and step back to create tension in the band.","Step:4 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:5 Pull the band towards your waist, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly release the band back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides. Emphasize lateral control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pgIdT6i.gif"}',
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
  'cable incline bench row - elite variation',
  'dAJscVq',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","rear deltoids"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle and attach a cable handle to the low pulley.","Step:2 Sit on the bench facing the cable machine with your feet flat on the floor and your knees slightly bent.","Step:3 Grasp the cable handle with an overhand grip and extend your arms fully in front of you. Perform with elite intensity.","Step:4 Lean forward from your hips while keeping your back straight and your core engaged.","Step:5 Pull the cable handle towards your chest by retracting your shoulder blades and bending your elbows.","Step:6 Squeeze your back muscles at the top of the movement, then slowly extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dAJscVq.gif"}',
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
  'pointed cable palm rotational row',
  '9fCHfSc',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach a handle to a cable machine at waist height.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the handle with an overhand grip, palms facing down.","Step:4 Step back to create tension on the cable, keeping your back straight and knees slightly bent. Emphasize pointed control.","Step:5 Pull the handle towards your body, rotating your palms to face upwards as you do so.","Step:6 Squeeze your shoulder blades together at the end of the movement.","Step:7 Slowly release the handle back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9fCHfSc.gif"}',
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
  'stability lever narrow grip seated row',
  '1u36hhy',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footrests to ensure proper form.","Step:2 Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Step:3 Grasp the handles with a narrow grip, palms facing each other.","Step:4 Keep your back straight and lean slightly forward.","Step:5 Pull the handles towards your torso, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement.","Step:7 Slowly release the handles and return to the starting position. Focus on stability movement.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1u36hhy.gif"}',
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
  'smith one arm row linear',
  'w44vFvP',
  'intermediate',
  'smith machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the height of the smith machine bar to waist level.","Step:2 Stand facing the smith machine with your feet shoulder-width apart. Emphasize linear control.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Grasp the bar with one hand using an overhand grip, with your palm facing down.","Step:5 Keep your elbow close to your body and pull the bar towards your waist, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top of the movement, then slowly lower the bar back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/w44vFvP.gif"}',
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
  'cable seated row with reverse',
  'A3P4O0R',
  'intermediate',
  'cable',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.","Step:2 Grasp the handles with an overhand grip, keeping your back straight and your shoulders relaxed.","Step:3 Pull the handles towards your body, squeezing your shoulder blades together. Focus on reverse movement.","Step:4 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/A3P4O0R.gif"}',
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
  'smith bent over row with declined',
  '5lE7XRz',
  'intermediate',
  'smith machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up the smith machine with the bar at hip height.","Step:2 Stand facing the bar with your feet shoulder-width apart.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Grasp the bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:5 Pull the bar towards your lower chest, squeezing your shoulder blades together. Perform with declined intensity.","Step:6 Pause for a moment at the top, then slowly lower the bar back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5lE7XRz.gif"}',
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
  'dumbbell reverse grip row (female) hold',
  'KQfySvS',
  'intermediate',
  'dumbbell',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold a dumbbell in each hand with an overhand grip, palms facing your body. Perform with hold intensity.","Step:3 Bend forward at the waist, keeping your back straight and your core engaged.","Step:4 Let your arms hang straight down, fully extended, with a slight bend in your elbows.","Step:5 Pull the dumbbells up towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KQfySvS.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;