INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable kneeling triceps extension',
  'KWdF2JI',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope handle to a high pulley and kneel down facing the cable machine.","Step:2 Grasp the rope with a neutral grip (palms facing each other) and bring your hands to the sides of your head.","Step:3 Keep your elbows close to your head and your upper arms stationary throughout the exercise.","Step:4 Extend your forearms by contracting your triceps until your arms are fully extended.","Step:5 Pause for a moment, then slowly return to the starting position by bending your elbows.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/KWdF2JI.gif"}',
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
  'triceps press',
  'fSrPP6B',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Extend your arms straight out in front of you, parallel to the ground.","Step:3 Bend your elbows and lower your body towards the ground, keeping your upper arms close to your sides.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fSrPP6B.gif"}',
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
  'impossible dips',
  '05Cf2v8',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Position yourself between two parallel bars with your arms fully extended and your body suspended in the air.","Step:2 Bend your knees and cross your ankles.","Step:3 Lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:4 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/05Cf2v8.gif"}',
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
  'barbell lying triceps extension double',
  '1TVoin7',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows. Focus on double movement.","Step:4 Pause for a moment at the bottom, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1TVoin7.gif"}',
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
  'rotated dumbbell pronate-grip triceps extension',
  'syUwUKY',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Sit on a bench or chair with your back straight and feet flat on the ground.","Step:2 Hold a dumbbell with both hands, palms facing down, and extend your arms straight up overhead.","Step:3 Keeping your upper arms close to your head and elbows pointing forward, slowly lower the dumbbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions. Focus on rotated movement."}',
  'strength',
  '{"https://static.exercisedb.dev/media/syUwUKY.gif"}',
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
  'dynamic style band side triceps extension',
  'omsF3RN',
  'intermediate',
  'band',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band with both hands, palms facing down.","Step:2 Extend your arms straight out to the sides, keeping them parallel to the ground.","Step:3 Slowly bend your elbows and bring your hands towards your shoulders, keeping your upper arms still.","Step:4 Pause for a moment, then slowly extend your arms back out to the starting position.","Step:5 (dynamic variation) Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/omsF3RN.gif"}',
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
  'exercise ball seated triceps stretch wide',
  'pNIKolI',
  'intermediate',
  'stability ball',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand and extend your arm straight up above your head.","Step:3 Bend your elbow and lower the dumbbell behind your head, keeping your upper arm close to your ear. Maintain wide form throughout.","Step:4 Hold the stretch for a few seconds, then return to the starting position.","Step:5 Repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pNIKolI.gif"}',
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
  'endurance style one arm dip',
  'jvEXp4N',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Stand facing away from a bench or chair, with your feet shoulder-width apart.","Step:2 Place one hand on the bench or chair behind you, fingers pointing towards your body. Maintain endurance form throughout.","Step:3 Extend your legs out in front of you, keeping your heels on the ground.","Step:4 Bend your elbows and lower your body towards the ground, keeping your back close to the bench or chair.","Step:5 Pause for a moment at the bottom, then push through your palms to straighten your arms and return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides and repeat with the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jvEXp4N.gif"}',
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
  'flexible cable triceps pushdown (v-bar)',
  '9tvVVM9',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a v-bar attachment to the cable machine at the highest setting.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the v-bar with an overhand grip, palms facing down, and your hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Engage your triceps and exhale as you push the v-bar down until your arms are fully extended. Perform with flexible intensity.","Step:6 Pause for a moment at the bottom of the movement, squeezing your triceps.","Step:7 Inhale as you slowly return the v-bar to the starting position, maintaining control.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9tvVVM9.gif"}',
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
  'active style cable pushdown',
  'w7obpWd',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.","Step:3 Grasp the bar with an overhand grip, hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary.","Step:5 Exhale and push the bar down until your elbows are fully extended.","Step:6 Pause for a moment, then inhale and slowly return the bar to the starting position. Maintain active form throughout.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/w7obpWd.gif"}',
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
  'ez barbell decline close grip face press - mini variation',
  'TBNaSNs',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie on a decline bench with your head lower than your feet.","Step:2 Grasp the ez barbell with a close grip, palms facing each other.","Step:3 Extend your arms straight up above your chest, keeping your elbows close to your body.","Step:4 Lower the barbell towards your forehead by bending your elbows.","Step:5 Pause for a moment, then press the barbell back up to the starting position. Emphasize mini control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TBNaSNs.gif"}',
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
  'targeted style smith close-grip bench press',
  'C8Crfa4',
  'intermediate',
  'smith machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the bench with your feet flat on the ground.","Step:2 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:3 Lower the barbell towards your chest, keeping your elbows close to your body. Focus on targeted movement.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/C8Crfa4.gif"}',
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
  'prone medicine ball close grip push up',
  'iFsqlCD',
  'intermediate',
  'medicine ball',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands on the medicine ball, shoulder-width apart.","Step:2 Lower your body towards the ground by bending your elbows, keeping them close to your sides.","Step:3 Push back up to the starting position, fully extending your arms.","Step:4 Repeat for the desired number of repetitions. Maintain prone form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iFsqlCD.gif"}',
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
  'triceps dip (between benches) - extreme variation',
  '9ZGnq1w',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Sit on a bench with your hands gripping the edge of the bench, fingers pointing forward.","Step:2 (extreme variation) Slide your butt off the bench, supporting your weight with your hands.","Step:3 Bend your elbows and lower your body towards the ground, keeping your back close to the bench.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9ZGnq1w.gif"}',
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
  'rough cable standing one arm triceps extension',
  'qU8bYp7',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with your right hand, palm facing down, and position your arm so that it is fully extended and parallel to the ground.","Step:3 Keep your elbow stationary and close to your body.","Step:4 Slowly bend your elbow, lowering the cable handle towards the back of your head.","Step:5 Pause for a moment at the bottom of the movement, then extend your arm back to the starting position. Focus on rough movement.","Step:6 Repeat for the desired number of repetitions, then switch sides and perform the exercise with your left arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qU8bYp7.gif"}',
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
  'complete style ez bar lying close grip triceps extension behind head',
  'I6Ca0a7',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold the ez barbell with a close grip, palms facing up, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell behind your head by bending your elbows.","Step:4 Pause for a moment, then extend your arms back up to the starting position. Maintain complete form throughout.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I6Ca0a7.gif"}',
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
  'smith machine incline tricep extension - straight variation',
  '7WcQgkm',
  'intermediate',
  'smith machine',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Adjust the seat of the smith machine so that the bar is at shoulder height.","Step:2 Sit on the bench with your back against the pad and your feet flat on the ground.","Step:3 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Extend your arms fully, lifting the bar off the rack and holding it directly above your chest. Focus on straight movement.","Step:5 Lower the bar slowly towards your forehead, keeping your elbows close to your head.","Step:6 Pause for a moment at the bottom, then push the bar back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7WcQgkm.gif"}',
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
  'push-up on lower arms - resistance variation',
  '1IFV9h3',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a plank position with your forearms on the ground and elbows directly below your shoulders.","Step:2 Engage your core and keep your body in a straight line from head to toe.","Step:3 Lower your chest towards the ground by bending your elbows, keeping them close to your body. Emphasize resistance control.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1IFV9h3.gif"}',
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
  'dynamic style barbell lying back of the head tricep extension',
  'OJFgZJ0',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.","Step:2 Hold a barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.","Step:3 Keeping your upper arms stationary, slowly lower the barbell behind your head by bending your elbows. Maintain dynamic form throughout.","Step:4 Pause for a moment, then extend your arms back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OJFgZJ0.gif"}',
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
  'assisted standing triceps extension (with towel) with horizontal',
  '7R4NIjL',
  'intermediate',
  'assisted',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a towel with both hands behind your head.","Step:2 Keep your elbows close to your ears and your upper arms stationary.","Step:3 (horizontal variation) Slowly extend your forearms upward, squeezing your triceps at the top.","Step:4 Pause for a moment, then slowly lower the towel back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7R4NIjL.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;