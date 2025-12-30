INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'groin crunch',
  'mWppALS',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","inner thighs"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, lift your legs off the ground, bringing your knees towards your chest.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mWppALS.gif"}',
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
  'seated side crunch (wall)',
  'Y9hNPcN',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on the floor with your back against a wall and your legs extended in front of you.","Step:2 Bend your knees and place your feet flat on the floor, hip-width apart.","Step:3 Place your hands behind your head with your elbows pointing outwards.","Step:4 Engage your abs and lean to one side, bringing your elbow towards your hip.","Step:5 Pause for a moment, then return to the starting position.","Step:6 Repeat on the other side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y9hNPcN.gif"}',
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
  'prisoner half sit-up (male)',
  'mgejmGP',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mgejmGP.gif"}',
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
  'roller reverse crunch',
  'SKXQAx3',
  'intermediate',
  'roller',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your arms extended straight above your head and your legs straight out in front of you.","Step:2 Place the roller between your feet and grip it with your toes.","Step:3 Engaging your abs, lift your legs off the ground and curl your knees towards your chest, rolling the roller towards your body.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position, rolling the roller away from your body.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SKXQAx3.gif"}',
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
  'spell caster',
  'p9cCe2r',
  'intermediate',
  'dumbbell',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in one hand.","Step:2 Bend your knees slightly and hinge forward at the waist, keeping your back straight.","Step:3 Extend your arm with the dumbbell towards the opposite foot, rotating your torso as you do so.","Step:4 Return to the starting position and repeat on the other side.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/p9cCe2r.gif"}',
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
  'seated leg raise',
  'Hgs6Nl1',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Sit on a flat bench with your back straight and your feet flat on the ground.","Step:2 Place your hands on the sides of the bench for support.","Step:3 Keeping your legs straight, slowly raise them up in front of you until they are parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Hgs6Nl1.gif"}',
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
  'band assisted wheel rollerout',
  'zhF9lW4',
  'intermediate',
  'band',
  '{"abs"}',
  '{"lower back"}',
  '{"Step:1 Kneel on the floor and hold the handles of the band with both hands, palms facing down.","Step:2 Place the band on the ground in front of you and position your hands shoulder-width apart.","Step:3 Engage your core and slowly roll the wheel forward, extending your body as far as you can while maintaining control.","Step:4 Pause for a moment at the furthest point, then slowly roll the wheel back towards your knees to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zhF9lW4.gif"}',
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
  'gorilla chin',
  'bmwlYvD',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"forearms","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your knees slightly bent.","Step:2 Grasp a pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang from the bar with your arms fully extended and your palms facing away from you.","Step:4 Engage your core and pull your body up towards the bar, bringing your chin above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bmwlYvD.gif"}',
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
  'assisted motion russian twist',
  'r7cT9YD',
  'intermediate',
  'medicine ball',
  '{"abs"}',
  '{"obliques","lower back"}',
  '{"Step:1 Sit on the ground with your knees bent and feet flat on the floor.","Step:2 Hold the medicine ball with both hands in front of your chest.","Step:3 Lean back slightly, engaging your abs and keeping your back straight.","Step:4 Slowly twist your torso to the right, bringing the medicine ball towards the right side of your body.","Step:5 Pause for a moment, then twist your torso to the left, bringing the medicine ball towards the left side of your body.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/r7cT9YD.gif"}',
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
  'band push sit-up',
  'zFzbBfL',
  'intermediate',
  'band',
  '{"abs"}',
  '{"shoulders","chest"}',
  '{"Step:1 Attach the band securely to a stable anchor point.","Step:2 Lie flat on your back with your knees bent and feet flat on the ground.","Step:3 Hold the band with both hands and extend your arms straight up towards the ceiling.","Step:4 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:5 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zFzbBfL.gif"}',
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
  'band seated twist',
  'S1JXDAG',
  'intermediate',
  'band',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you and your back straight.","Step:2 Wrap the band around your waist and hold the ends with both hands.","Step:3 Engage your abs and slowly twist your torso to one side, keeping your back straight and your feet on the ground.","Step:4 Pause for a moment at the end of the twist, then slowly return to the starting position.","Step:5 Repeat the twist to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S1JXDAG.gif"}',
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
  'lying leg-hip raise',
  '9IxJdtC',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Place your hands under your glutes for support.","Step:3 Engage your core and lift your legs off the ground, raising them towards the ceiling.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9IxJdtC.gif"}',
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
  'janda sit-up',
  '1GPHRyK',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1GPHRyK.gif"}',
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
  'crunch floor',
  'TFqbd8t',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands behind your head with your elbows pointing outwards.","Step:3 Engage your abs and lift your shoulders off the ground, curling forward towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your shoulders back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TFqbd8t.gif"}',
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
  'decline sit-up',
  'QLL2gdc',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"hip flexors","lower back"}',
  '{"Step:1 Lie on a decline bench with your feet secured and your knees bent.","Step:2 Place your hands behind your head or across your chest.","Step:3 Engage your abs and lift your upper body off the bench, curling forward towards your knees.","Step:4 Pause for a moment at the top, then slowly lower your upper body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QLL2gdc.gif"}',
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
  'front lever',
  'PkCN2lv',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"lats","shoulders","forearms"}',
  '{"Step:1 Start by hanging from a pull-up bar with an overhand grip, hands shoulder-width apart.","Step:2 Engage your core and pull your shoulder blades down and back.","Step:3 Bend your knees and tuck them towards your chest.","Step:4 Simultaneously, lift your legs up and extend them straight out in front of you, keeping your body parallel to the ground.","Step:5 Hold this position for as long as you can, aiming for a full front lever position.","Step:6 To release, slowly lower your legs back down and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PkCN2lv.gif"}',
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
  'reverse plank with leg lift',
  'tFToB7l',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"glutes","hamstrings","shoulders"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you and your hands resting on the ground behind you, fingers pointing towards your feet.","Step:2 Press through your hands and lift your hips off the ground, coming into a reverse plank position.","Step:3 Engage your core and lift one leg off the ground, extending it straight up towards the ceiling.","Step:4 Hold for a moment, then lower your leg back down.","Step:5 Repeat with the other leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tFToB7l.gif"}',
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
  'posterior step to overhead reach',
  'ErqK3UL',
  'intermediate',
  'body weight',
  '{"abs"}',
  '{"glutes","hamstrings","quadriceps","shoulders"}',
  '{"Step:1 Stand with your feet hip-width apart and your arms by your sides.","Step:2 Take a step back with your right foot, landing on the ball of your foot.","Step:3 Bend your left knee and lower your body into a lunge position.","Step:4 As you lower into the lunge, simultaneously reach your arms overhead.","Step:5 Pause for a moment at the bottom of the lunge, then return to the starting position by pushing through your left heel and bringing your right foot forward.","Step:6 Repeat the movement on the other side, stepping back with your left foot and bending your right knee.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ErqK3UL.gif"}',
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
  'cable twist',
  'aVs3BR3',
  'intermediate',
  'cable',
  '{"abs"}',
  '{"obliques"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with both hands in front of your chest, keeping your arms slightly bent.","Step:3 Engage your core and twist your torso to the right, pulling the cable across your body.","Step:4 Pause for a moment at the end of the movement, feeling the contraction in your abs and obliques.","Step:5 Slowly return to the starting position, resisting the cable''s pull.","Step:6 Repeat the movement to the left side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/aVs3BR3.gif"}',
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
  'band lying straight leg raise',
  'bbLR7fB',
  'intermediate',
  'band',
  '{"abs"}',
  '{"hip flexors"}',
  '{"Step:1 Lie flat on your back with your legs straight and your feet together.","Step:2 Place the band around the arches of your feet and hold the ends of the band with your hands.","Step:3 Engaging your abs, lift both legs off the ground until they are perpendicular to the floor.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bbLR7fB.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;