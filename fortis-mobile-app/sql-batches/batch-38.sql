INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell lying lifting (on hip)',
  'SNFfUff',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie flat on your back on a bench with your feet flat on the ground and your knees bent.","Step:2 Hold the barbell with an overhand grip and position it on your hips.","Step:3 Engaging your glutes, lift your hips off the bench until your body forms a straight line from your knees to your shoulders.","Step:4 Pause for a moment at the top, then slowly lower your hips back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SNFfUff.gif"}',
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
  'band squat row',
  'w1NOByi',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","quadriceps","back"}',
  '{"Step:1 Attach the band to a sturdy anchor point at waist height.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Hold the band handles with your palms facing each other and your arms extended in front of you.","Step:4 Bend your knees and lower into a squat position, keeping your back straight and chest lifted.","Step:5 From the squat position, pull the band handles towards your body, squeezing your shoulder blades together.","Step:6 Pause for a moment at the top, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/w1NOByi.gif"}',
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
  'band lying hip internal rotation',
  'vIICElP',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie on your back with your legs straight and a resistance band looped around your feet.","Step:2 Bend your knees and bring them towards your chest, keeping your feet together.","Step:3 Slowly rotate your knees outwards, away from each other, while keeping your feet together.","Step:4 Pause for a moment at the end of the rotation, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vIICElP.gif"}',
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
  'smith front squat (clean grip)',
  'lFhb2Rw',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Set up the smith machine with the barbell at shoulder height.","Step:2 Stand facing the barbell with your feet shoulder-width apart.","Step:3 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Step back and position the barbell on your front shoulders, resting it on your collarbone and deltoids.","Step:5 Keep your chest up, back straight, and core engaged.","Step:6 Lower your body by bending at the knees and hips, as if sitting back into a chair.","Step:7 Continue lowering until your thighs are parallel to the ground or slightly below.","Step:8 Pause for a moment, then push through your heels to return to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/lFhb2Rw.gif"}',
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
  'sled hack squat',
  'Qa55kX1',
  'intermediate',
  'sled machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the sled machine to a comfortable position for your height.","Step:2 Stand with your feet shoulder-width apart on the platform, toes slightly pointed outwards.","Step:3 Hold onto the handles or bars for stability.","Step:4 Lower your body by bending your knees and hips, keeping your back straight and chest up.","Step:5 Continue lowering until your thighs are parallel to the ground or slightly below.","Step:6 Pause for a moment, then push through your heels to raise your body back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Qa55kX1.gif"}',
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
  'smith deadlift',
  'UfePqpx',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"hamstrings","quadriceps","lower back"}',
  '{"Step:1 Set up the smith machine with the bar at hip height.","Step:2 Stand with your feet shoulder-width apart, toes pointing slightly outward.","Step:3 Bend at the hips and knees, keeping your back straight and chest up, and grip the bar with an overhand grip slightly wider than shoulder-width apart.","Step:4 Engage your core and lift the bar by extending your hips and knees, keeping the bar close to your body.","Step:5 Stand up straight, fully extending your hips and knees.","Step:6 Lower the bar back down by bending at the hips and knees, maintaining control and keeping your back straight.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UfePqpx.gif"}',
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
  'exercise ball one legged diagonal kick hamstring curl',
  'GOJKFfO',
  'intermediate',
  'stability ball',
  '{"glutes"}',
  '{"hamstrings","calves"}',
  '{"Step:1 Start by lying on your back with your legs extended and your heels resting on top of the stability ball.","Step:2 Place your arms by your sides for stability.","Step:3 Engage your glutes and core muscles to lift your hips off the ground, creating a straight line from your shoulders to your heels.","Step:4 Bend your right knee and bring it towards your chest, keeping your left leg extended and your foot flexed.","Step:5 Kick your right leg diagonally across your body, extending it fully and engaging your hamstrings.","Step:6 Slowly return your right leg to the starting position, maintaining control and stability.","Step:7 Repeat the movement with your left leg, alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GOJKFfO.gif"}',
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
  'barbell rear lunge v. 2',
  '62Nw60O',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell across your upper back.","Step:2 Take a step backward with your right foot, landing on the ball of your foot.","Step:3 Bend both knees to lower your body until your left thigh is parallel to the ground.","Step:4 Push through your left heel to return to the starting position.","Step:5 Repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/62Nw60O.gif"}',
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
  'jump squat',
  'LIlE5Tn',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 Jump explosively off the ground, extending your hips, knees, and ankles.","Step:4 While in mid-air, quickly bring your arms forward for balance.","Step:5 Land softly on the balls of your feet and immediately go into the next repetition.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LIlE5Tn.gif"}',
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
  'barbell step-up',
  'Kxquu2E',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand in front of a bench or step with a barbell resting on your upper back.","Step:2 Place one foot on the bench or step, ensuring your entire foot is in contact with the surface.","Step:3 Push through your heel and step up onto the bench or step, fully extending your hip and knee.","Step:4 Pause briefly at the top, then lower yourself back down to the starting position.","Step:5 Repeat with the opposite leg.","Step:6 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Kxquu2E.gif"}',
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
  'dumbbell romanian deadlift',
  'rR0LJzx',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.","Step:2 Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing your knees to bend slightly.","Step:3 Lower the dumbbells until you feel a stretch in your hamstrings, then push through your heels and engage your glutes to return to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rR0LJzx.gif"}',
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
  'band bent-over hip extension',
  'wSScovH',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Attach the band to a sturdy anchor point at ankle height.","Step:2 Stand facing away from the anchor point with your feet shoulder-width apart.","Step:3 Step back to create tension in the band, keeping your knees slightly bent.","Step:4 Hinge at the hips and lean forward, maintaining a neutral spine.","Step:5 Extend your right leg straight back, squeezing your glutes at the top.","Step:6 Lower your right leg back down and repeat with the left leg.","Step:7 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/wSScovH.gif"}',
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
  'potty squat with support',
  'b63ZzGe',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointing slightly outward.","Step:2 Hold onto a stable support, such as a chair or wall, for balance.","Step:3 Lower your body down into a squat position by bending your knees and pushing your hips back.","Step:4 Keep your chest up and your back straight throughout the movement.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/b63ZzGe.gif"}',
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
  'one leg squat',
  'C31LMnP',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Extend one leg forward, keeping it off the ground.","Step:3 Bend your standing leg and lower your body down as if sitting back into a chair.","Step:4 Keep your chest up and your back straight.","Step:5 Push through your heel to return to the starting position.","Step:6 Repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/C31LMnP.gif"}',
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
  'lever reverse hyperextension',
  'Krmb3cB',
  'intermediate',
  'leverage machine',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Adjust the leverage machine to fit your body and secure your feet in the foot pads.","Step:2 Lie face down on the machine with your upper body hanging off the edge and your hips resting on the pad.","Step:3 Cross your arms over your chest or place them behind your head.","Step:4 Engage your glutes and hamstrings to lift your legs upward until they are parallel to the ground.","Step:5 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Krmb3cB.gif"}',
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
  'lever horizontal one leg press',
  '9KU9TYF',
  'intermediate',
  'leverage machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat of the machine so that your knees are at a 90-degree angle when your feet are on the footplate.","Step:2 Sit on the machine with your back against the backrest and your feet shoulder-width apart on the footplate.","Step:3 Place your hands on the handles or sides of the machine for stability.","Step:4 Push the footplate away from your body by extending your leg, keeping your back against the backrest.","Step:5 Pause for a moment at the fully extended position, then slowly bend your leg to return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9KU9TYF.gif"}',
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
  'outside leg kick push-up',
  'jNU1gFQ',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Lower your body towards the ground by bending your elbows, keeping your back straight and core engaged.","Step:3 As you push back up, kick one leg out to the side, extending it fully and engaging your glutes.","Step:4 Return your leg to the starting position and repeat the push-up, alternating legs with each repetition.","Step:5 Continue alternating leg kicks and push-ups for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jNU1gFQ.gif"}',
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
  'barbell front squat',
  'zG0zs85',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell in front of your shoulders, resting it on your collarbone and shoulders.","Step:3 Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/zG0zs85.gif"}',
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
  'barbell jefferson squat',
  'pkSoCW9',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and toes slightly turned out.","Step:2 Hold the barbell with an overhand grip, resting it on the front of your body, just below your waist.","Step:3 Step your left foot forward and your right foot back, keeping your feet shoulder-width apart.","Step:4 Bend your knees and lower your body down into a squat position, keeping your back straight and chest up.","Step:5 Push through your heels to stand back up to the starting position.","Step:6 Repeat the movement, alternating your forward and back foot with each repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pkSoCW9.gif"}',
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
  'trap bar deadlift',
  'jQGwmxN',
  'intermediate',
  'trap bar',
  '{"glutes"}',
  '{"hamstrings","quadriceps","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and the trap bar on the ground in front of you.","Step:2 Bend at the hips and knees to lower yourself down and grip the handles of the trap bar with an overhand grip.","Step:3 Keep your back straight and chest up as you begin to lift the trap bar off the ground by extending your hips and knees.","Step:4 As you lift, focus on driving through your heels and squeezing your glutes at the top of the movement.","Step:5 Lower the trap bar back down to the ground by bending at the hips and knees, keeping your back straight throughout the movement.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jQGwmxN.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;