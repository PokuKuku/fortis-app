INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell seated overhead press',
  'kTbSH9h',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the barbell off the rack and bring it to shoulder level, with your elbows bent and palms facing forward.","Step:4 Press the barbell overhead by extending your arms fully.","Step:5 Pause for a moment at the top, then slowly lower the barbell back to shoulder level.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kTbSH9h.gif"}',
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
  'smith shoulder press',
  '903mzG8',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height and position yourself on the smith machine with your feet shoulder-width apart.","Step:2 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the bar off the rack and position it at shoulder level, with your elbows bent and palms facing forward.","Step:4 Press the bar upward until your arms are fully extended overhead.","Step:5 Pause for a moment at the top, then slowly lower the bar back down to shoulder level.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/903mzG8.gif"}',
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
  'dumbbell standing front raise above head',
  'laVRfDf',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Keep your arms straight and lift the dumbbells in front of you, raising them above your head.","Step:3 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/laVRfDf.gif"}',
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
  'barbell standing wide military press',
  'Kyd9Rz5',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell with an overhand grip, slightly wider than shoulder-width.","Step:2 Lift the barbell to shoulder height, keeping your elbows slightly in front of the bar.","Step:3 Press the barbell overhead, extending your arms fully.","Step:4 Lower the barbell back to shoulder height and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Kyd9Rz5.gif"}',
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
  'lever seated reverse fly',
  'myfUsKf',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the floor.","Step:2 Grasp the handles with an overhand grip and keep your arms slightly bent.","Step:3 Exhale and squeeze your shoulder blades together as you pull the handles back and outward, away from your body.","Step:4 Pause for a moment at the peak contraction, then inhale and slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/myfUsKf.gif"}',
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
  'dumbbell rear delt row_shoulder',
  'EKXOMEh',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold a dumbbell in each hand with your palms facing your body.","Step:3 Bend forward at the waist, keeping your back straight and your core engaged.","Step:4 Extend your arms straight down towards the floor, with a slight bend in your elbows.","Step:5 Raise the dumbbells out to the sides, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/EKXOMEh.gif"}',
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
  'lever seated reverse fly (parallel grip)',
  'xiHiJcA',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the floor.","Step:2 Grasp the handles with a parallel grip, palms facing each other, and keep your arms slightly bent.","Step:3 Exhale and squeeze your shoulder blades together as you pull the handles back and outward, away from your body.","Step:4 Pause for a moment at the peak contraction, then inhale and slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xiHiJcA.gif"}',
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
  'barbell skier',
  '4Leypho',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell in front of your thighs with an overhand grip.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight and chest up.","Step:3 Simultaneously lift the barbell up towards your shoulders while jumping slightly off the ground.","Step:4 As you reach the top of the movement, quickly reverse the motion and lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4Leypho.gif"}',
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
  'smith behind neck press',
  'Gpn4ADc',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height of the smith machine so that the bar is at shoulder level.","Step:2 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:3 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lift the bar off the rack and step back, maintaining a stable stance.","Step:5 Lower the bar down to the back of your neck, keeping your elbows pointing forward.","Step:6 Press the bar up overhead until your arms are fully extended.","Step:7 Pause for a moment at the top, then slowly lower the bar back down to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gpn4ADc.gif"}',
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
  'lever lateral raise',
  'dRTfGZT',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"traps","upper back"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the pad.","Step:2 Grasp the handles with an overhand grip and keep your arms straight.","Step:3 Exhale and raise your arms out to the sides until they are parallel to the floor.","Step:4 Pause for a moment at the top, then inhale and slowly lower your arms back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dRTfGZT.gif"}',
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
  'dumbbell rear delt raise',
  'mu5Guxt',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"trapezius","rhomboids"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Raise your arms out to the sides, keeping a slight bend in your elbows, until they are parallel to the floor.","Step:4 Pause for a moment at the top, then slowly lower your arms back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mu5Guxt.gif"}',
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
  'dumbbell one arm shoulder press v. 2',
  '1TkiAFK',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand at shoulder level, palm facing forward.","Step:2 Engage your core and press the dumbbell straight up overhead, fully extending your arm.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back to shoulder level.","Step:4 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1TkiAFK.gif"}',
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
  'standing behind neck press',
  'xDh0lJr',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the barbell behind your neck with an overhand grip.","Step:2 Keep your back straight and core engaged.","Step:3 Press the barbell overhead by extending your arms, fully extending your elbows.","Step:4 Pause for a moment at the top, then slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xDh0lJr.gif"}',
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
  'cable standing rear delt row (with rope)',
  'ZfyAGhK',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Hold the cable attachment with both hands, palms facing each other, and step back to create tension in the cable.","Step:3 Keep your back straight and your core engaged.","Step:4 Pull the cable towards your body, squeezing your shoulder blades together.","Step:5 Pause for a moment at the peak of the movement, then slowly release the cable back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZfyAGhK.gif"}',
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
  'ez barbell anti gravity press',
  'fprd84i',
  'intermediate',
  'ez barbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and holding the ez barbell with an overhand grip.","Step:2 Raise the barbell to shoulder height, keeping your elbows slightly bent and your palms facing forward.","Step:3 Press the barbell overhead, extending your arms fully.","Step:4 Lower the barbell back to shoulder height and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fprd84i.gif"}',
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
  'kettlebell thruster',
  'yWxMvB5',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"quadriceps","glutes","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, holding a kettlebell in front of your chest with both hands, palms facing each other.","Step:2 Lower into a squat position by bending your knees and pushing your hips back, keeping your chest up and your back straight.","Step:3 As you reach the bottom of the squat, explosively drive through your heels to stand up, simultaneously pressing the kettlebell overhead.","Step:4 Lock out your arms at the top of the movement, fully extending your elbows.","Step:5 Lower the kettlebell back to the starting position by reversing the movement, bending your elbows and lowering the weight back to your chest.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yWxMvB5.gif"}',
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
  'resistance band seated shoulder press',
  'S93zLTG',
  'intermediate',
  'resistance band',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Hold the resistance band with both hands, palms facing forward, and bring it up to shoulder level.","Step:3 Press the band overhead, extending your arms fully.","Step:4 Pause for a moment at the top, then slowly lower the band back down to shoulder level.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S93zLTG.gif"}',
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
  'dumbbell lying one arm rear lateral raise',
  'KwFGiEP',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"traps","rhomboids"}',
  '{"Step:1 Lie face down on a flat bench with a dumbbell in one hand, hanging towards the floor.","Step:2 Keep your arm straight and lift the dumbbell out to the side, away from your body.","Step:3 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:4 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KwFGiEP.gif"}',
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
  'dumbbell alternate side press',
  'izMnLqz',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder height.","Step:2 Press one dumbbell overhead while keeping the other dumbbell at shoulder height.","Step:3 Lower the pressed dumbbell back to shoulder height while pressing the other dumbbell overhead.","Step:4 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/izMnLqz.gif"}',
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
  'inverted style smith seated shoulder press',
  'MRaFiZP',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height so that the handles are at shoulder level.","Step:2 Sit on the machine with your back against the pad and your feet flat on the floor.","Step:3 Grasp the handles with an overhand grip and lift them off the supports, extending your arms fully.","Step:4 Lower the handles down to shoulder level, keeping your elbows slightly bent.","Step:5 Press the handles up overhead until your arms are fully extended.","Step:6 Pause for a moment at the top, then slowly lower the handles back down to shoulder level. Maintain inverted form throughout.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MRaFiZP.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;