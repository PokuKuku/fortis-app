INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'squat to overhead reach',
  'QChZi3x',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"glutes","hamstrings","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and toes slightly turned out.","Step:2 Lower your body down into a squat position by bending your knees and pushing your hips back.","Step:3 As you come up from the squat, extend your arms overhead, reaching towards the ceiling.","Step:4 Return to the starting position by lowering your arms and bending your knees to squat down again.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QChZi3x.gif"}',
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
  'sissy squat',
  'xdYPUtE',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing slightly outward.","Step:2 Hold onto a stable object for balance if needed.","Step:3 Slowly lower your body by bending your knees and leaning back, keeping your torso upright.","Step:4 Continue lowering until your thighs are parallel to the ground or as far as you can comfortably go.","Step:5 Pause for a moment, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xdYPUtE.gif"}',
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
  'dumbbell goblet squat',
  'yn8yg1r',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell vertically against your chest with both hands.","Step:2 Keeping your chest up and core engaged, lower your body down into a squat position by pushing your hips back and bending your knees.","Step:3 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yn8yg1r.gif"}',
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
  'lever alternate leg press',
  'V07qpXy',
  'intermediate',
  'leverage machine',
  '{"quads"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Adjust the seat and foot platform of the leverage machine to your desired position.","Step:2 Sit on the machine with your back against the backrest and your feet on the foot platform.","Step:3 Place your hands on the handles or sides of the machine for stability.","Step:4 Push one foot against the foot platform, extending your leg until it is almost fully straight.","Step:5 Pause for a moment, then slowly bend your leg and return to the starting position.","Step:6 Repeat with the other leg.","Step:7 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/V07qpXy.gif"}',
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
  'barbell single leg split squat',
  'gGNQmVt',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a barbell across your upper back.","Step:2 Take a large step forward with one leg, keeping your torso upright.","Step:3 Lower your body by bending your front knee and hip, while keeping your back leg straight.","Step:4 Continue lowering until your front thigh is parallel to the ground.","Step:5 Pause for a moment, then push through your front heel to return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gGNQmVt.gif"}',
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
  'all fours squad stretch',
  'qBcKorM',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Start on all fours with your hands directly under your shoulders and your knees directly under your hips.","Step:2 Extend one leg straight back, keeping your knee bent and your foot flexed.","Step:3 Slowly lower your hips towards the ground, feeling a stretch in your quads.","Step:4 Hold this position for 20-30 seconds.","Step:5 Switch legs and repeat the stretch on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qBcKorM.gif"}',
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
  'farmers walk',
  'qPEzJjA',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"calves","forearms","core"}',
  '{"Step:1 Stand up straight with a dumbbell in each hand, palms facing your sides.","Step:2 Keep your back straight and your shoulders back.","Step:3 Take small, controlled steps forward, maintaining an upright posture.","Step:4 Continue walking for the desired distance or time.","Step:5 To finish, stop walking and carefully lower the dumbbells to your sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qPEzJjA.gif"}',
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
  'dumbbell step-up split squat',
  'QjE2DcA',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand in front of a bench or step with a dumbbell in each hand, palms facing your body.","Step:2 Place your right foot on the bench or step, ensuring your entire foot is in contact with the surface.","Step:3 Step up onto the bench or step with your right foot, pushing through your heel to lift your body up.","Step:4 As you step up, simultaneously lift your left knee towards your chest.","Step:5 Pause at the top of the movement, then slowly lower your left foot back to the ground while keeping your right foot on the bench or step.","Step:6 Repeat the movement with your left foot on the bench or step.","Step:7 Continue alternating between your right and left foot for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/QjE2DcA.gif"}',
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
  'quads',
  '6YUfHPL',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Lower your body by bending your knees and pushing your hips back as if sitting on a chair.","Step:3 Keep your chest up and your back straight.","Step:4 Lower yourself until your thighs are parallel to the ground.","Step:5 Push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/6YUfHPL.gif"}',
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
  'backward jump',
  'SaDOwk7',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","glutes","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Bend your knees slightly and jump backwards, pushing off with both feet.","Step:3 Land softly on the balls of your feet, bending your knees to absorb the impact.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SaDOwk7.gif"}',
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
  'resistance band leg extension declined',
  'Ul5OFSV',
  'intermediate',
  'resistance band',
  '{"quads"}',
  '{"hamstrings"}',
  '{"Step:1 Attach the resistance band to a sturdy anchor point and secure it around your ankle.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Keeping your core engaged and your upper body stable, extend your leg straight out in front of you.","Step:4 Pause for a moment at the top, then slowly return your leg to the starting position. Focus on declined movement.","Step:5 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Ul5OFSV.gif"}',
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
  'quick feet v. 2 with bent',
  'IBj3nsn',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","hamstrings"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms by your sides.","Step:2 Begin by rapidly moving your feet up and down, as if you were running in place.","Step:3 Keep your movements quick and light, focusing on staying on the balls of your feet.","Step:4 Continue for the desired duration or number of repetitions. Emphasize bent control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IBj3nsn.gif"}',
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
  'sissy squat isolation',
  'DoEYq4s',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing slightly outward.","Step:2 Hold onto a stable object for balance if needed.","Step:3 Slowly lower your body by bending your knees and leaning back, keeping your torso upright.","Step:4 Continue lowering until your thighs are parallel to the ground or as far as you can comfortably go.","Step:5 Pause for a moment, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions. Emphasize isolation control."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DoEYq4s.gif"}',
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
  'chair leg extended stretch with modified',
  'fF6GKVh',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","calves"}',
  '{"Step:1 Sit on the edge of a chair with your back straight and feet flat on the ground.","Step:2 Extend one leg straight out in front of you, keeping your heel on the ground.","Step:3 Lean forward slightly, feeling a stretch in your quadriceps.","Step:4 Hold this position for 20-30 seconds. Focus on modified movement.","Step:5 Switch legs and repeat the stretch."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fF6GKVh.gif"}',
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
  'all fours squad stretch - elevated variation',
  'LzX8YEz',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Start on all fours with your hands directly under your shoulders and your knees directly under your hips.","Step:2 Extend one leg straight back, keeping your knee bent and your foot flexed. Maintain elevated form throughout.","Step:3 Slowly lower your hips towards the ground, feeling a stretch in your quads.","Step:4 Hold this position for 20-30 seconds.","Step:5 Switch legs and repeat the stretch on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LzX8YEz.gif"}',
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
  'fluid dumbbell step-up lunge',
  '7858za8',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand in front of a step or platform with a dumbbell in each hand, palms facing your sides.","Step:2 Place your right foot on the step, ensuring your entire foot is on the surface.","Step:3 Push through your right heel and lift your body up onto the step, bringing your left foot up as well.","Step:4 (fluid variation) Once both feet are on the step, lower your left foot back down to the starting position, keeping your right foot on the step.","Step:5 Repeat the movement, alternating which foot you step up with each time.","Step:6 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7858za8.gif"}',
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
  'quads complex',
  'MDFxU4b',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Lower your body by bending your knees and pushing your hips back as if sitting on a chair.","Step:3 Keep your chest up and your back straight.","Step:4 Lower yourself until your thighs are parallel to the ground.","Step:5 Push through your heels to return to the starting position. Emphasize complex control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MDFxU4b.gif"}',
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
  'barbell squat (on knees) with pure',
  'echClj7',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Start by kneeling on the ground with your knees hip-width apart and your toes pointing forward.","Step:2 Place a barbell across your shoulders, gripping it with an overhand grip and your hands slightly wider than shoulder-width apart.","Step:3 Engage your core and keep your chest lifted as you slowly lower your body down by bending your knees, keeping your back straight. Perform with pure intensity.","Step:4 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/echClj7.gif"}',
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
  'cable incline fly (on stability ball)',
  '27NNGFr',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Set up a stability ball at an incline angle.","Step:2 Attach the cable handles to the high pulleys of a cable machine.","Step:3 Sit on the stability ball facing away from the machine, with your feet firmly planted on the ground.","Step:4 Grasp the cable handles with an overhand grip, palms facing forward.","Step:5 Lean forward slightly, keeping your back straight and core engaged.","Step:6 With a controlled motion, bring your arms out to the sides, keeping a slight bend in your elbows.","Step:7 Continue the motion until your arms are parallel to the ground.","Step:8 Pause for a moment, then slowly return to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/27NNGFr.gif"}',
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
  'lever chest press',
  'DOoWcnA',
  'intermediate',
  'leverage machine',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back flat against the pad.","Step:2 Grasp the handles with an overhand grip and position your elbows at a 90-degree angle.","Step:3 Push the handles forward until your arms are fully extended, exhaling during the movement.","Step:4 Pause briefly at the end of the movement, then slowly return to the starting position, inhaling as you do so.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DOoWcnA.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;