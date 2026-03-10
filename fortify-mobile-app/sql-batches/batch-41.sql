INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell narrow stance squat',
  'elhhVgj',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and toes pointing slightly outward.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you slowly lower your body by bending your knees and pushing your hips back.","Step:4 Continue lowering until your thighs are parallel to the ground or slightly below.","Step:5 Pause for a moment, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/elhhVgj.gif"}',
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
  'smith full squat',
  'NNoHCEA',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Set up the smith machine with the barbell at shoulder height.","Step:2 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:3 Step under the bar and position it across your upper back, resting on your traps.","Step:4 Grip the bar with your hands slightly wider than shoulder-width apart.","Step:5 Unrack the bar and take a step back, maintaining a stable stance.","Step:6 Keeping your chest up and core engaged, initiate the squat by pushing your hips back and bending your knees.","Step:7 Lower your body until your thighs are parallel to the ground, or as low as your flexibility allows.","Step:8 Pause for a moment at the bottom, then drive through your heels to return to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/NNoHCEA.gif"}',
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
  'monster walk',
  'O95afRA',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Place a resistance band around your ankles.","Step:2 Stand with your feet shoulder-width apart and slightly bend your knees.","Step:3 Take a step to the side with your right foot, maintaining tension on the resistance band.","Step:4 Follow with your left foot, stepping to the side to return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/O95afRA.gif"}',
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
  'roller hip stretch',
  'oMypNrz',
  'intermediate',
  'roller',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Start by sitting on the ground with your legs extended in front of you.","Step:2 Place the roller under your glutes, just above your knees.","Step:3 Lean back and place your hands on the ground behind you for support.","Step:4 Engage your glutes and slowly roll the roller forward, bending your knees and bringing them towards your chest.","Step:5 Pause for a moment at the end of the movement, feeling a stretch in your glutes.","Step:6 Slowly roll the roller back to the starting position, extending your legs.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oMypNrz.gif"}',
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
  'exercise ball hip flexor stretch',
  '2LQkNPW',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"quadriceps","hamstrings"}',
  '{"Step:1 Place the stability ball on the ground and kneel in front of it.","Step:2 Place your right foot on top of the stability ball, with your knee bent at a 90-degree angle.","Step:3 Extend your left leg behind you, keeping it straight.","Step:4 Lean forward, pushing your hips towards the stability ball, until you feel a stretch in your right hip flexor.","Step:5 Hold the stretch for 20-30 seconds, then switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2LQkNPW.gif"}',
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
  'forward lunge (male)',
  'kMzUs9Y',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet hip-width apart and hands on your hips.","Step:2 Take a big step forward with your right foot, lowering your body into a lunge position.","Step:3 Bend your right knee to about 90 degrees, keeping your knee aligned with your ankle.","Step:4 Push off with your right foot and return to the starting position.","Step:5 Repeat with your left leg, alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kMzUs9Y.gif"}',
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
  'pike-to-cobra push-up',
  'XPUDTt7',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"core","shoulders","triceps"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Engage your core and lift your hips up towards the ceiling, forming an inverted V shape with your body.","Step:3 Lower your upper body towards the ground by bending your elbows, keeping them close to your body.","Step:4 As you lower down, shift your weight forward and transition into a cobra pose by straightening your arms and lifting your chest up.","Step:5 Reverse the movement by bending your elbows and lowering your chest back down towards the ground.","Step:6 Push through your hands to return to the inverted V position.","Step:7 Continue the movement by lowering your hips back down towards the ground, returning to the starting push-up position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XPUDTt7.gif"}',
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
  'roller hip lat stretch',
  '0L2KwtI',
  'intermediate',
  'roller',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Start by kneeling on the ground with the roller positioned under your hips.","Step:2 Place your hands on the roller for support.","Step:3 Slowly roll the roller forward, extending your hips and stretching your glutes.","Step:4 Hold the stretch for a few seconds, then roll back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0L2KwtI.gif"}',
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
  'dumbbell clean',
  '7Hg55JG',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Bend your knees and lower your hips into a squat position, keeping your back straight and chest up.","Step:3 Explosively extend your hips and knees, driving through your heels to jump off the ground.","Step:4 As you jump, shrug your shoulders and pull the dumbbells up towards your shoulders, keeping them close to your body.","Step:5 Catch the dumbbells at shoulder height, with your elbows pointing forward and your palms facing up.","Step:6 Lower the dumbbells back down to the starting position by reversing the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7Hg55JG.gif"}',
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
  'barbell lateral lunge',
  'py1HSzx',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a barbell across your upper back.","Step:2 Take a big step to the side with your right foot, keeping your left foot planted.","Step:3 Bend your right knee and lower your body down into a lunge position, keeping your left leg straight.","Step:4 Push off with your right foot and return to the starting position.","Step:5 Repeat on the other side, stepping with your left foot."}',
  'strength',
  '{"https://static.exercisedb.dev/media/py1HSzx.gif"}',
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
  'jump squat v. 2',
  'TDYiji6',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 Jump explosively, extending your hips and knees fully.","Step:4 Land softly on the balls of your feet and immediately lower your body back into a squat position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TDYiji6.gif"}',
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
  'sled closer hack squat',
  'gf3ZjB9',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a comfortable weight and position yourself with your back against the pad.","Step:2 Place your feet shoulder-width apart on the platform, toes slightly pointed outwards.","Step:3 Grip the handles on the sides of the machine for stability.","Step:4 Engage your core and slowly lower your body by bending your knees and hips, keeping your back straight.","Step:5 Continue lowering until your thighs are parallel to the ground or slightly below.","Step:6 Pause for a moment at the bottom, then push through your heels to extend your legs and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gf3ZjB9.gif"}',
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
  'rocking frog stretch',
  '2Dk4xQV',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Start by kneeling on the ground with your knees hip-width apart.","Step:2 Place your hands on the ground in front of you for support.","Step:3 Slowly lean forward, shifting your weight onto your hands and extending your legs behind you.","Step:4 Keep your back straight and engage your glutes as you push your hips back and up towards the ceiling.","Step:5 Hold this position for a few seconds, feeling a stretch in your glutes.","Step:6 Slowly return to the starting position by bending your knees and lowering your hips back down.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2Dk4xQV.gif"}',
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
  'hands clasped circular toe touch (male)',
  'B5xca8s',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your hands clasped together in front of your chest.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Lower your hands towards your toes in a circular motion, reaching as far as you can without straining.","Step:4 Pause for a moment at the bottom, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/B5xca8s.gif"}',
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
  'smith leg press',
  '7zdxRTl',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat and footplate of the smith machine to a comfortable position.","Step:2 Sit on the machine with your back against the backrest and your feet shoulder-width apart on the footplate.","Step:3 Grasp the handles or sides of the machine for stability.","Step:4 Push the footplate away from you by extending your legs, keeping your back against the backrest.","Step:5 Pause for a moment at the fully extended position.","Step:6 Slowly bend your knees and lower the footplate back towards you, returning to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7zdxRTl.gif"}',
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
  'swimmer kicks v. 2 (male)',
  'SP3hUez',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps","calves"}',
  '{"Step:1 Lie face down on a mat with your arms extended overhead.","Step:2 Engage your core and lift your chest and legs off the ground simultaneously.","Step:3 Kick your legs up and down in a fluttering motion, as if you were swimming.","Step:4 Continue kicking for the desired number of repetitions.","Step:5 Lower your chest and legs back down to the starting position."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SP3hUez.gif"}',
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
  'barbell rack pull',
  'za9Ni4z',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Set up a barbell on a rack at knee height.","Step:2 Stand with your feet shoulder-width apart, toes pointing slightly outwards.","Step:3 Bend at the hips and knees to lower yourself down and grip the barbell with an overhand grip, hands shoulder-width apart.","Step:4 Engage your core and lift the barbell by extending your hips and knees, pulling your shoulders back and squeezing your glutes at the top.","Step:5 Lower the barbell back down to the starting position by bending at the hips and knees.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/za9Ni4z.gif"}',
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
  'low glute bridge on floor',
  'u0cNiij',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Place your arms by your sides, palms facing down.","Step:3 Engage your glutes and core, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, squeezing your glutes.","Step:5 Slowly lower your hips back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u0cNiij.gif"}',
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
  'inclined style pelvic tilt into bridge',
  'vpleANJ',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place your arms by your sides with your palms facing down.","Step:3 Engage your glutes and core muscles.","Step:4 Tilt your pelvis upward, lifting your hips off the ground. Emphasize inclined control.","Step:5 Hold the bridge position for a few seconds.","Step:6 Slowly lower your hips back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vpleANJ.gif"}',
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
  'sled 45 degrees one leg press pointed',
  '4H86mXM',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a 45-degree angle.","Step:2 Sit on the sled machine with your back against the pad and your feet on the footplate. Perform with pointed intensity.","Step:3 Place one foot on the footplate and extend your leg, pushing the sled away from you.","Step:4 Slowly bend your knee and lower the sled back to the starting position.","Step:5 Repeat with the other leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4H86mXM.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;