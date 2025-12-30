INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'bent knee lying twist (male)',
  '6sYyrRX',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"obliques","hip flexors"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Extend your arms out to the sides, perpendicular to your body.","Step:3 Keeping your knees together, slowly lower them to one side, aiming to touch the ground with your knees.","Step:4 Pause for a moment, then engage your core and slowly lift your knees back to the starting position.","Step:5 Repeat the movement to the other side.","Step:6 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6sYyrRX.gif"}',
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
  'smith low bar squat',
  'RGLscZM',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Set up the smith machine with the barbell at a height that allows you to comfortably rest it on your upper back.","Step:2 Stand with your feet shoulder-width apart, toes slightly turned outwards.","Step:3 Step under the bar and position it across your upper back, resting it on your traps.","Step:4 Grip the bar with your hands slightly wider than shoulder-width apart.","Step:5 Unrack the bar by straightening your legs and stepping back from the rack.","Step:6 Take a deep breath and brace your core.","Step:7 Initiate the squat by pushing your hips back and bending your knees.","Step:8 Lower your body until your thighs are parallel to the ground or slightly below.","Step:9 Keep your chest up and your back straight throughout the movement.","Step:10 Drive through your heels to stand back up, extending your hips and knees.","Step:11 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RGLscZM.gif"}',
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
  'hug keens to chest',
  'znP9SIh',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart.","Step:2 Bend your knees and lower your body down into a squat position.","Step:3 As you squat down, bring your knees up towards your chest and hug them with your arms.","Step:4 Hold this position for a moment, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/znP9SIh.gif"}',
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
  'basic toe touch (male)',
  'BbfB8Gb',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms by your sides.","Step:2 Bend forward at the waist, keeping your back straight and your knees slightly bent.","Step:3 Reach down towards your toes with your hands, keeping your legs as straight as possible.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BbfB8Gb.gif"}',
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
  'dumbbell squat',
  'HsvHqgf',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides.","Step:2 Keeping your chest up and core engaged, lower your body down by bending at the knees and hips, as if sitting back into a chair.","Step:3 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HsvHqgf.gif"}',
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
  'band pull through',
  'VtTbiP3',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Attach a resistance band to a sturdy anchor point at ground level.","Step:2 Stand facing away from the anchor point with your feet shoulder-width apart.","Step:3 Step forward to create tension in the band, keeping your knees slightly bent.","Step:4 Hinge at the hips and push your glutes back, maintaining a slight bend in your knees.","Step:5 Lower your torso until it is parallel to the ground, feeling a stretch in your hamstrings.","Step:6 Drive your hips forward and squeeze your glutes to return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VtTbiP3.gif"}',
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
  'rear decline bridge',
  'UpAlold',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Lie on your back with your feet flat on the ground and your knees bent.","Step:2 Place your arms by your sides with your palms facing down.","Step:3 Engage your glutes and hamstrings, and lift your hips off the ground until your body forms a straight line from your knees to your shoulders.","Step:4 Hold this position for a few seconds, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UpAlold.gif"}',
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
  'barbell one arm side deadlift',
  '2DxtqHL',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a barbell in one hand with an overhand grip.","Step:2 Keep your back straight and your core engaged.","Step:3 Bend at the hips and lower the barbell towards the outside of your leg, keeping your arm straight and your chest up.","Step:4 Lower the barbell as far as you can while maintaining good form.","Step:5 Pause for a moment, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2DxtqHL.gif"}',
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
  'kettlebell pistol squat',
  '5bpPTHv',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in front of your chest with both hands.","Step:2 Lift your left foot off the ground and extend it forward, keeping it parallel to the ground.","Step:3 Slowly lower your body down into a squat position, keeping your right foot flat on the ground and your left leg extended.","Step:4 Pause for a moment at the bottom of the squat, then push through your right heel to return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5bpPTHv.gif"}',
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
  'barbell hack squat',
  '5VCj6iH',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and your toes slightly turned out.","Step:2 Hold the barbell behind your legs, resting it on your upper thighs.","Step:3 Lower your body by bending at the knees and hips, keeping your back straight and your chest up.","Step:4 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5VCj6iH.gif"}',
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
  'band seated hip internal rotation',
  '9gbyYKk',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Place a resistance band around your thighs, just above your knees.","Step:3 Keep your knees bent at a 90-degree angle and your feet shoulder-width apart.","Step:4 Engage your glutes and slowly rotate your knees outward, pushing against the resistance of the band.","Step:5 Pause for a moment at the end of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9gbyYKk.gif"}',
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
  'barbell clean-grip front squat',
  'qi996YS',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and the barbell resting on your upper chest, with your elbows pointing forward.","Step:2 Lower your body by bending your knees and pushing your hips back, as if you are sitting back into a chair.","Step:3 Keep your chest up and your back straight as you lower down, making sure your knees do not go past your toes.","Step:4 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to stand back up, extending your hips and knees.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qi996YS.gif"}',
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
  'lunge with jump',
  'PM1PZjg',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 Push off with your right foot and jump into the air, switching the position of your feet mid-air.","Step:4 Land softly with your left foot forward and immediately lower your body into a lunge position.","Step:5 Continue alternating between lunges and jumps for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PM1PZjg.gif"}',
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
  'sled 45 degrees one leg press',
  'WWD6FzI',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a 45-degree angle.","Step:2 Sit on the sled machine with your back against the pad and your feet on the footplate.","Step:3 Place one foot on the footplate and extend your leg, pushing the sled away from you.","Step:4 Slowly bend your knee and lower the sled back to the starting position.","Step:5 Repeat with the other leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WWD6FzI.gif"}',
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
  'sled lying squat',
  '9n2149Z',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a comfortable weight.","Step:2 Lie on your back on the sled machine with your feet on the footplate.","Step:3 Position your feet shoulder-width apart and slightly angled outwards.","Step:4 Grip the handles of the sled machine for stability.","Step:5 Engage your glutes and core muscles.","Step:6 Push through your heels and extend your legs to lift the sled.","Step:7 Lower the sled back down by bending your knees and hips.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9n2149Z.gif"}',
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
  'march sit (wall)',
  'sVQCCeG',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your back against a wall and your feet hip-width apart.","Step:2 Slowly slide your back down the wall until your knees are bent at a 90-degree angle.","Step:3 Lift your right foot off the ground and bring your knee towards your chest.","Step:4 Lower your right foot back down and lift your left foot off the ground, bringing your knee towards your chest.","Step:5 Continue alternating between lifting your right and left foot for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sVQCCeG.gif"}',
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
  'bench hip extension',
  'u27Kcdz',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on a bench with your back against the bench and your feet flat on the ground.","Step:2 Place your hands on the bench for support.","Step:3 Engage your glutes and hamstrings, then lift your hips off the bench until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u27Kcdz.gif"}',
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
  'smith sprint lunge',
  'HsjbB1z',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Set up the smith machine with the barbell at hip height.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Step back with your right foot and place it on the barbell, resting the top of your foot on the bar.","Step:4 Bend your left knee and lower your body into a lunge position, keeping your back straight.","Step:5 Push through your left heel to return to the starting position.","Step:6 Repeat on the other side, stepping back with your left foot.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HsjbB1z.gif"}',
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
  'bodyweight drop jump squat',
  'wfotm7S',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 Jump up explosively, extending your hips, knees, and ankles.","Step:4 While in mid-air, quickly bring your feet together.","Step:5 Land softly on the balls of your feet and immediately drop back into a squat position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wfotm7S.gif"}',
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
  'dumbbell lunge',
  'RRWFUcw',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 Keep your back straight and your chest up as you lower your body.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat with your left leg.","Step:6 Alternate legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RRWFUcw.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;