INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'kneeling jump squat',
  'UgDm3oy',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by kneeling on the ground with your feet hip-width apart and your toes pointing forward.","Step:2 Hold a barbell across your upper back, resting it on your shoulders.","Step:3 Engage your core and glutes, then explosively jump up into the air, extending your hips and knees.","Step:4 As you jump, push through your toes and fully extend your ankles, knees, and hips.","Step:5 Land softly back on the ground, bending your knees to absorb the impact.","Step:6 Immediately go into the next repetition, repeating the jump squat motion."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UgDm3oy.gif"}',
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
  'sled 45в° leg press (back pov)',
  'yn2lLSI',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat of the sled machine so that your knees are at a 45-degree angle.","Step:2 Sit on the sled machine with your back against the backrest and your feet shoulder-width apart on the footplate.","Step:3 Grip the handles on the sides of the seat for stability.","Step:4 Push the footplate away from your body by extending your legs, keeping your heels on the footplate.","Step:5 Pause for a moment at the fully extended position.","Step:6 Slowly bend your knees and lower the footplate back towards your body, controlling the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yn2lLSI.gif"}',
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
  'barbell jump squat',
  '1gFNTZV',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, holding a barbell across your upper back.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 Once you reach the bottom of the squat, explode upwards by jumping off the ground.","Step:4 As you jump, extend your hips, knees, and ankles, pushing through your toes.","Step:5 Land softly back into the squat position and immediately repeat the movement for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1gFNTZV.gif"}',
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
  'barbell lunge',
  't8iSghb',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and a barbell resting on your upper back.","Step:2 Take a step forward with your right foot, keeping your torso upright.","Step:3 Lower your body by bending your right knee until your thigh is parallel to the ground.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat with your left leg, alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/t8iSghb.gif"}',
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
  'barbell front chest squat',
  'IeTIEqg',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell in front of your chest with your hands shoulder-width apart, elbows pointing forward.","Step:3 Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IeTIEqg.gif"}',
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
  'exercise ball one leg prone lower body rotation',
  'M72BExt',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Lie face down on the stability ball with your hips resting on the ball and your legs extended straight behind you.","Step:2 Place your hands on the ground in front of you for support.","Step:3 Engage your glutes and core muscles to stabilize your body.","Step:4 Slowly lift one leg off the ground, keeping it straight and parallel to the floor.","Step:5 Rotate your leg outward, away from your body, while keeping your hips and upper body stable.","Step:6 Pause for a moment at the end of the rotation, then slowly return your leg to the starting position.","Step:7 Repeat the rotation with the other leg.","Step:8 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/M72BExt.gif"}',
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
  'lever deadlift',
  'GUT8I22',
  'intermediate',
  'leverage machine',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Adjust the seat height and foot platform to your desired position.","Step:2 Sit on the machine with your back against the pad and your feet flat on the foot platform.","Step:3 Grasp the handles or the sides of the seat for stability.","Step:4 Engage your glutes and hamstrings, and push through your heels to lift the weight up.","Step:5 Keep your back straight and avoid rounding your shoulders.","Step:6 Extend your hips fully at the top of the movement, squeezing your glutes.","Step:7 Lower the weight back down in a controlled manner, keeping tension on your glutes and hamstrings.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GUT8I22.gif"}',
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
  'barbell low bar squat',
  'bTpEUcm',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and the barbell resting on your upper back.","Step:2 Keeping your chest up and core engaged, slowly lower your body by bending your knees and pushing your hips back.","Step:3 Continue lowering until your thighs are parallel to the ground or slightly below.","Step:4 Pause for a moment, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/bTpEUcm.gif"}',
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
  'band squat',
  'TUZLh71',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, with the band placed just above your knees.","Step:2 Keeping your chest up and core engaged, push your hips back and bend your knees to lower into a squat position.","Step:3 Make sure your knees are tracking over your toes and your weight is in your heels.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TUZLh71.gif"}',
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
  'dumbbell stiff leg deadlift',
  '5eLRITT',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing a slight bend in your knees.","Step:3 Lower the dumbbells until you feel a stretch in your hamstrings, then squeeze your glutes and push through your heels to return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5eLRITT.gif"}',
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
  'cable pull through (with rope)',
  'OM46QHm',
  'intermediate',
  'cable',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand facing away from the cable machine with your feet shoulder-width apart.","Step:2 Grab the rope attachment with both hands and step forward, creating tension in the cable.","Step:3 Bend at the hips and lower your upper body until it is parallel to the ground, keeping your back straight.","Step:4 Engage your glutes and hamstrings to pull your body back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OM46QHm.gif"}',
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
  'barbell speed squat',
  'euI1BwR',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you lower your hips back and down, as if sitting into a chair.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Drive through your heels to stand back up, squeezing your glutes at the top.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/euI1BwR.gif"}',
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
  'dumbbell rear lunge',
  'SSsBDwB',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step backward with your right foot, lowering your body into a lunge position.","Step:3 Bend your left knee and lower your body until your left thigh is parallel to the ground.","Step:4 Pause for a moment, then push through your left heel to return to the starting position.","Step:5 Repeat on the other side, stepping back with your left foot."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SSsBDwB.gif"}',
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
  'tire flip',
  'oZjMu1t',
  'intermediate',
  'tire',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the tire.","Step:2 Bend your knees and hinge at the hips, lowering into a squat position.","Step:3 Reach down and grab the bottom edge of the tire with both hands, fingers facing towards you.","Step:4 Engage your glutes and leg muscles, and explosively drive through your legs to lift the tire off the ground.","Step:5 As the tire flips over, use your upper body strength to guide it and maintain control.","Step:6 Once the tire is fully flipped, quickly step back and reset your stance.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oZjMu1t.gif"}',
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
  'spider crawl push up',
  'P9GFBME',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"core","chest","shoulders"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Bring your right knee towards your right elbow, keeping it off the ground.","Step:3 As you bring your right knee back, simultaneously lower your body towards the ground by bending your elbows.","Step:4 Push back up to the starting position and repeat with your left knee towards your left elbow.","Step:5 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/P9GFBME.gif"}',
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
  'band straight back stiff leg deadlift',
  'lHeUULr',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your upper legs.","Step:2 Hold the band with both hands in front of your thighs, palms facing your body.","Step:3 Keeping your back straight and your knees slightly bent, hinge at the hips and lower the band towards the ground.","Step:4 Feel the stretch in your hamstrings as you lower the band.","Step:5 Engage your glutes and hamstrings to lift your body back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lHeUULr.gif"}',
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
  'barbell seated good morning',
  'd960PgE',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Sit on a bench with your feet flat on the ground and a barbell resting on your upper back.","Step:2 Keep your back straight and your chest up.","Step:3 Slowly hinge forward at the hips, lowering your torso towards the ground.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/d960PgE.gif"}',
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
  'weighted cossack squats (male)',
  'GWoKnIm',
  'intermediate',
  'weighted',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart and toes pointing slightly outward.","Step:2 Hold a weight in front of your chest with both hands.","Step:3 Shift your weight to one side and lower your body by bending the knee of the side you shifted towards, while keeping the other leg straight.","Step:4 Go as low as you can while maintaining balance and keeping your chest up.","Step:5 Push through the heel of the bent leg to return to the starting position.","Step:6 Repeat on the other side, alternating between legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GWoKnIm.gif"}',
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
  'smith sumo squat',
  'dzz6BiV',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Set up the smith machine with the barbell at hip height.","Step:2 Stand with your feet wider than shoulder-width apart, toes pointing outwards.","Step:3 Position yourself under the barbell, resting it on your upper back and shoulders.","Step:4 Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.","Step:5 Lower yourself until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:6 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dzz6BiV.gif"}',
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
  'twist hip lift',
  'AX1kB0o',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"obliques","hamstrings"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place your hands by your sides for support.","Step:3 Engage your glutes and lift your hips off the ground, forming a straight line from your knees to your shoulders.","Step:4 While keeping your hips lifted, twist your lower body to the right side, bringing your knees towards the ground.","Step:5 Return to the starting position and repeat the twist to the left side.","Step:6 Continue alternating twists for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/AX1kB0o.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;