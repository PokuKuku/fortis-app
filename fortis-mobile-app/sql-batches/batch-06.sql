INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'lever narrow grip seated row - strength variation',
  'iCPqbki',
  'intermediate',
  'leverage machine',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the seat height and footrests to ensure proper form.","Step:2 Sit on the machine with your feet flat on the footrests and your knees slightly bent.","Step:3 Grasp the handles with a narrow grip, palms facing each other.","Step:4 Keep your back straight and lean slightly forward.","Step:5 Pull the handles towards your torso, squeezing your shoulder blades together.","Step:6 Pause for a moment at the peak of the movement. Maintain strength form throughout.","Step:7 Slowly release the handles and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iCPqbki.gif"}',
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
  'extended style inverted row',
  '1YUWDNZ',
  'intermediate',
  'body weight',
  '{"upper back"}',
  '{"biceps","forearms"}',
  '{"Step:1 Set up a bar at waist height or use a suspension trainer.","Step:2 Stand facing the bar or suspension trainer, with your feet shoulder-width apart.","Step:3 Grab the bar or handles with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lean back, keeping your body straight and your heels on the ground.","Step:5 Pull your chest towards the bar or handles, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly lower yourself back to the starting position.","Step:7 Repeat for the desired number of repetitions. Perform with extended intensity."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1YUWDNZ.gif"}',
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
  'barbell decline close grip to skull press',
  'LMGXZn8',
  'intermediate',
  'barbell',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Lie on a decline bench with your head lower than your feet and hold a barbell with a close grip.","Step:2 Lower the barbell towards your forehead by bending your elbows, keeping your upper arms stationary.","Step:3 Pause for a moment, then extend your arms to press the barbell back up to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LMGXZn8.gif"}',
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
  'close-grip push-up',
  'x6KpKpq',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Start in a high plank position with your hands placed close together, directly under your shoulders.","Step:2 Engage your core and lower your body towards the ground, keeping your elbows close to your sides.","Step:3 Push through your palms to extend your arms and return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/x6KpKpq.gif"}',
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
  'band side triceps extension',
  'obe5LMq',
  'intermediate',
  'band',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the band with both hands, palms facing down.","Step:2 Extend your arms straight out to the sides, keeping them parallel to the ground.","Step:3 Slowly bend your elbows and bring your hands towards your shoulders, keeping your upper arms still.","Step:4 Pause for a moment, then slowly extend your arms back out to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/obe5LMq.gif"}',
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
  'cable one arm tricep pushdown',
  'qRZ5S1N',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Stand facing a cable machine with a straight bar attachment at chest height.","Step:2 Grasp the bar with an overhand grip and step back to create tension in the cable.","Step:3 Position your feet shoulder-width apart and slightly bend your knees.","Step:4 Keep your back straight and core engaged throughout the exercise.","Step:5 Start with your arm fully extended and perpendicular to the floor.","Step:6 Keeping your upper arm stationary, exhale and push the bar down until your arm is fully extended.","Step:7 Pause for a moment, then inhale and slowly return to the starting position.","Step:8 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qRZ5S1N.gif"}',
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
  'handstand',
  'XooAdhl',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders","core"}',
  '{"Step:1 Find an open space with enough room to perform a handstand.","Step:2 Place your hands on the ground shoulder-width apart, fingers pointing forward.","Step:3 Kick your legs up towards the wall, using your core and shoulders to maintain balance.","Step:4 Once in a handstand position, engage your triceps to support your body weight.","Step:5 Hold the handstand for as long as you can maintain balance.","Step:6 To come down, slowly lower your legs back to the ground.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XooAdhl.gif"}',
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
  'ez barbell seated triceps extension',
  'iaapw0g',
  'intermediate',
  'ez barbell',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold the ez barbell with an overhand grip, hands shoulder-width apart.","Step:3 Raise the barbell overhead, fully extending your arms.","Step:4 Keeping your upper arms stationary, lower the barbell behind your head by bending your elbows.","Step:5 Pause for a moment, then raise the barbell back to the starting position by extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iaapw0g.gif"}',
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
  'smith close-grip bench press',
  'WcHl7ru',
  'intermediate',
  'smith machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the bench with your feet flat on the ground.","Step:2 Grasp the barbell with a close grip, slightly narrower than shoulder-width apart.","Step:3 Lower the barbell towards your chest, keeping your elbows close to your body.","Step:4 Pause for a moment at the bottom, then push the barbell back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WcHl7ru.gif"}',
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
  'cable lying triceps extension v. 2',
  'uxJcFUU',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope handle to a low pulley cable machine.","Step:2 Lie down on a flat bench facing up, with your head towards the cable machine.","Step:3 Grasp the rope handle with both hands, palms facing each other, and extend your arms straight up over your chest.","Step:4 Keeping your upper arms stationary, slowly lower the rope handle towards your forehead by bending your elbows.","Step:5 Pause for a moment at the bottom, then extend your arms back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uxJcFUU.gif"}',
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
  'cable rope lying on floor tricep extension',
  'U3ffHlY',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a cable machine and set it to the lowest position.","Step:2 Lie on the floor facing up, with your head towards the cable machine.","Step:3 Hold the rope with both hands, palms facing each other, and extend your arms straight up towards the ceiling.","Step:4 Keep your upper arms stationary and slowly lower the rope towards your forehead, bending your elbows.","Step:5 Pause for a moment, then extend your arms back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/U3ffHlY.gif"}',
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
  'cable alternate triceps extension',
  'Gchi5Tr',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand facing the cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with your right hand and bring your arm up so that your upper arm is parallel to the ground and your elbow is bent at a 90-degree angle.","Step:3 Keep your upper arm stationary and extend your forearm backward, fully straightening your arm.","Step:4 Pause for a moment, then slowly return to the starting position.","Step:5 Repeat with your left arm.","Step:6 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gchi5Tr.gif"}',
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
  'cable rope high pulley overhead tricep extension',
  'NN8nSNT',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Attach a rope to a high pulley and adjust the weight accordingly.","Step:2 Stand facing away from the pulley machine with your feet shoulder-width apart.","Step:3 Grasp the rope with both hands, palms facing down, and bring your hands above your head.","Step:4 Keep your upper arms close to your head and perpendicular to the floor.","Step:5 Slowly lower the rope behind your head by bending your elbows.","Step:6 Pause for a moment, then extend your arms back to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NN8nSNT.gif"}',
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
  'dumbbell incline one arm hammer press on exercise ball',
  'jDnrkar',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","chest"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand.","Step:2 Walk your feet forward and roll your body down until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell with your palm facing inward and your elbow bent at a 90-degree angle.","Step:4 Press the dumbbell up towards the ceiling, straightening your arm.","Step:5 Lower the dumbbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jDnrkar.gif"}',
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
  'bodyweight kneeling triceps extension',
  's0HKO2I',
  'intermediate',
  'body weight',
  '{"triceps"}',
  '{"shoulders","chest"}',
  '{"Step:1 Kneel down on the ground with your knees hip-width apart.","Step:2 Place your hands on the ground in front of you, shoulder-width apart, fingers pointing forward.","Step:3 Extend your legs straight behind you, balancing on your toes and hands, forming a straight line from head to heels.","Step:4 Bend your elbows and lower your upper body towards the ground, keeping your elbows close to your sides.","Step:5 Pause for a moment at the bottom, then push through your hands to straighten your arms and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s0HKO2I.gif"}',
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
  'cable triceps pushdown (v-bar)',
  'gAwDzB3',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Attach a v-bar attachment to the cable machine at the highest setting.","Step:2 Stand facing the cable machine with your feet shoulder-width apart.","Step:3 Grasp the v-bar with an overhand grip, palms facing down, and your hands shoulder-width apart.","Step:4 Keep your elbows close to your sides and your upper arms stationary throughout the exercise.","Step:5 Engage your triceps and exhale as you push the v-bar down until your arms are fully extended.","Step:6 Pause for a moment at the bottom of the movement, squeezing your triceps.","Step:7 Inhale as you slowly return the v-bar to the starting position, maintaining control.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gAwDzB3.gif"}',
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
  'cable kickback',
  'HEJ6DIX',
  'intermediate',
  'cable',
  '{"triceps"}',
  '{"shoulders"}',
  '{"Step:1 Stand facing a cable machine with your feet shoulder-width apart.","Step:2 Hold the cable handle with your right hand and step back to create tension in the cable.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Keep your upper arm close to your body and your elbow bent at a 90-degree angle.","Step:5 Extend your forearm backward, straightening your arm fully.","Step:6 Pause for a moment, then slowly return to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HEJ6DIX.gif"}',
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
  'dumbbell kickbacks on exercise ball',
  'cAvTaSg',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"shoulders","back"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in each hand with your palms facing inwards and your arms bent at a 90-degree angle.","Step:3 Extend your arms straight back, squeezing your triceps at the top of the movement.","Step:4 Pause for a moment, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cAvTaSg.gif"}',
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
  'dumbbell lying one arm supinated triceps extension',
  'zZlORz6',
  'intermediate',
  'dumbbell',
  '{"triceps"}',
  '{"forearms"}',
  '{"Step:1 Lie flat on a bench with your back and head supported, and your feet flat on the ground.","Step:2 Hold a dumbbell in one hand with an underhand grip, and extend your arm straight up above your shoulder.","Step:3 Keeping your upper arm stationary, slowly lower the dumbbell behind your head by bending your elbow.","Step:4 Pause for a moment at the bottom, then extend your arm back up to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zZlORz6.gif"}',
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
  'assisted triceps dip (kneeling)',
  'J60bN17',
  'intermediate',
  'leverage machine',
  '{"triceps"}',
  '{"chest","shoulders"}',
  '{"Step:1 Adjust the machine to your desired weight and height.","Step:2 Kneel down on the pad facing the machine, with your hands gripping the handles.","Step:3 Lower your body by bending your elbows, keeping your back straight and close to the machine.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/J60bN17.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;