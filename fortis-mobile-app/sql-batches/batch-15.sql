INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'hyperextension (on bench)',
  'zkgRrbK',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Adjust the hyperextension bench so that your hips are resting comfortably on the pad and your feet are secured.","Step:2 Cross your arms over your chest or place your hands behind your head.","Step:3 Slowly lower your upper body towards the ground while keeping your back straight.","Step:4 Pause for a moment at the bottom, then raise your upper body back up until it is in line with your legs.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zkgRrbK.gif"}',
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
  'back extension on exercise ball',
  'qLpO4vV',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and lie face down on top of it, with your hips resting on the ball and your feet against a wall or other stable surface.","Step:2 Position your hands behind your head or crossed over your chest.","Step:3 Engage your core and slowly lift your upper body off the ball, extending your back until your body forms a straight line from your head to your heels.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qLpO4vV.gif"}',
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
  'exercise ball back extension with knees off ground',
  'WME869U',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and lie face down on top of it, with your hips resting on the ball and your feet against a wall for stability.","Step:2 Position your hands behind your head or crossed over your chest.","Step:3 Engage your core and slowly lift your upper body off the ball, extending your back until your body forms a straight line from your head to your heels.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WME869U.gif"}',
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
  'standing pelvic tilt',
  'cuKYxhu',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"abdominals"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Place your hands on your hips or let them hang by your sides.","Step:3 Engage your core muscles and tilt your pelvis forward, pushing your lower back towards the wall behind you.","Step:4 Hold the position for a few seconds, then release and return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cuKYxhu.gif"}',
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
  'roller back stretch',
  'isofgzg',
  'intermediate',
  'roller',
  '{"spine"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Start by sitting on the ground with your legs extended in front of you.","Step:2 Place the roller perpendicular to your body, just below your glutes.","Step:3 Slowly roll your body backwards, allowing the roller to move up your back.","Step:4 Continue rolling until the roller reaches your upper back.","Step:5 Pause for a moment, then slowly roll back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/isofgzg.gif"}',
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
  'exercise ball prone leg raise',
  'lCKm4Rs',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"abdominals","glutes"}',
  '{"Step:1 Lie face down on a mat with your legs extended and your toes resting on top of the stability ball.","Step:2 Place your hands on the ground, shoulder-width apart, and engage your core muscles.","Step:3 Keeping your legs straight, slowly lift them off the ground, using your lower back and glutes to raise them as high as possible.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lCKm4Rs.gif"}',
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
  'exercise ball back extension with hands behind head',
  'o1HGDSq',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and lie face down on top of it with your hips resting on the ball.","Step:2 Position your feet against a wall or other stable surface for support.","Step:3 Cross your arms behind your head, with your hands touching the back of your head.","Step:4 Engage your core and slowly lift your upper body off the ball, extending your back until your body forms a straight line from your head to your hips.","Step:5 Pause for a moment at the top of the movement, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/o1HGDSq.gif"}',
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
  'exercise ball back extension with arms extended',
  'PERjVm8',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and lie face down on top of it, with your hips resting on the ball and your feet against a wall for stability.","Step:2 Extend your arms straight out in front of you, with your palms facing down.","Step:3 Engage your core and slowly lift your upper body off the ball, keeping your back straight and your neck in line with your spine.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PERjVm8.gif"}',
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
  'lever back extension',
  'rUXfn3R',
  'intermediate',
  'leverage machine',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Adjust the machine to fit your body size and range of motion.","Step:2 Sit on the machine with your back against the pad and your feet secured.","Step:3 Place your hands on the handles or grip bars.","Step:4 Engage your core and slowly lean forward, allowing your back to round slightly.","Step:5 Pause for a moment at the bottom position, feeling a stretch in your lower back.","Step:6 Using your back muscles, slowly raise your torso back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rUXfn3R.gif"}',
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
  'two toe touch (male)',
  'p195zsJ',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms extended out to the sides.","Step:2 Bend forward at the waist, keeping your back straight and your knees slightly bent.","Step:3 Reach down towards your toes with both hands, keeping your legs straight.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/p195zsJ.gif"}',
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
  'lower back curl',
  'ANbbry2',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie flat on your stomach with your legs extended and your arms by your sides.","Step:2 Engage your glutes and hamstrings, and slowly lift your upper body off the ground, curling your back upwards.","Step:3 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ANbbry2.gif"}',
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
  'upward facing dog',
  '01qpYSe',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"shoulders","chest"}',
  '{"Step:1 Lie face down on the floor with your legs extended behind you.","Step:2 Place your hands on the floor next to your lower ribs, fingers pointing forward.","Step:3 Press your hands firmly into the floor and straighten your arms, lifting your torso and thighs off the ground.","Step:4 Roll your shoulders back and down, opening your chest and lifting your gaze towards the ceiling.","Step:5 Hold this position for a few breaths, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/01qpYSe.gif"}',
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
  'exercise ball back extension with rotation',
  'WVD66ff',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Start by lying face down on the stability ball with your hips resting on the ball and your feet firmly planted on the ground.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your core and slowly lift your upper body off the ball, extending your back until your body forms a straight line from your head to your heels.","Step:4 Pause for a moment at the top, then slowly rotate your torso to one side, keeping your hips and legs stable.","Step:5 Return to the center and repeat the rotation to the other side.","Step:6 Lower your upper body back down to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WVD66ff.gif"}',
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
  'spine stretch',
  'JbC2iaV',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Place your hands on the ground behind you, fingers pointing towards your body.","Step:3 Engage your core and slowly lean back, keeping your back straight.","Step:4 Continue leaning back until you feel a stretch in your spine.","Step:5 Hold the stretch for a few seconds, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/JbC2iaV.gif"}',
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
  'hyperextension',
  'zhMwOwE',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Adjust the hyperextension bench so that your upper thighs are resting on the pad and your feet are secured.","Step:2 Cross your arms over your chest or place your hands behind your head.","Step:3 Lower your upper body towards the ground while keeping your back straight.","Step:4 Pause for a moment at the bottom, then raise your upper body back up until it is in line with your legs.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zhMwOwE.gif"}',
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
  'exercise ball hug',
  'd7z1Y7V',
  'intermediate',
  'stability ball',
  '{"spine"}',
  '{"shoulders","chest"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your back straight.","Step:2 Hold the stability ball with both hands, hugging it close to your chest.","Step:3 Engage your core muscles and slowly lean back, keeping your back straight and your feet planted on the ground.","Step:4 Continue leaning back until you feel a stretch in your back muscles.","Step:5 Hold the position for a few seconds, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/d7z1Y7V.gif"}',
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
  'band straight leg deadlift',
  'KUaoUV8',
  'intermediate',
  'band',
  '{"spine"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your feet.","Step:2 Hold the band with both hands, palms facing your body, and keep your arms straight.","Step:3 Engage your core and maintain a slight bend in your knees.","Step:4 Slowly hinge forward at your hips, keeping your back straight and chest lifted.","Step:5 Lower the band towards the ground while keeping your legs straight.","Step:6 Pause for a moment at the bottom, then squeeze your glutes and hamstrings to return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KUaoUV8.gif"}',
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
  'weighted hyperextension (on stability ball)',
  '8urJS9b',
  'intermediate',
  'weighted',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Position yourself face down on a stability ball with your hips resting on the ball and your feet against a wall for stability.","Step:2 Place your hands behind your head or cross them over your chest.","Step:3 Engage your core and slowly lift your upper body off the ball, extending your back until your body forms a straight line.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/8urJS9b.gif"}',
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
  'improved sphinx',
  'O3INw8V',
  'intermediate',
  'body weight',
  '{"spine"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Lie face down on the ground with your forearms flat on the floor, elbows directly under your shoulders.","Step:2 Engage your core and lift your chest off the ground, keeping your forearms and toes on the floor.","Step:3 Hold this position for a few seconds, making sure to keep your neck in a neutral position.","Step:4 Slowly lower your chest back down to the starting position. Emphasize improved control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O3INw8V.gif"}',
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
  'fast band straight leg deadlift',
  'lRcrlH8',
  'intermediate',
  'band',
  '{"spine"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your feet.","Step:2 Hold the band with both hands, palms facing your body, and keep your arms straight.","Step:3 Engage your core and maintain a slight bend in your knees.","Step:4 Slowly hinge forward at your hips, keeping your back straight and chest lifted.","Step:5 Lower the band towards the ground while keeping your legs straight.","Step:6 Pause for a moment at the bottom, then squeeze your glutes and hamstrings to return to the starting position.","Step:7 Repeat for the desired number of repetitions. Perform with fast intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lRcrlH8.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;