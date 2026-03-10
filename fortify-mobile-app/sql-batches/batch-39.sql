INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'dumbbell bench squat',
  'mnzcrIB',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Place a dumbbell on the ground in front of a bench.","Step:2 Stand facing away from the bench with your feet shoulder-width apart.","Step:3 Bend at the knees and hips to lower yourself down towards the bench, keeping your chest up and back straight.","Step:4 Once your glutes touch the bench, push through your heels to stand back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mnzcrIB.gif"}',
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
  'single leg squat (pistol) male',
  'nqs5HGV',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and arms extended in front of you.","Step:2 Lift your right foot off the ground and extend it forward.","Step:3 Slowly lower your body down by bending your left knee and pushing your hips back.","Step:4 Keep your chest up and your back straight as you lower yourself down.","Step:5 Lower until your left thigh is parallel to the ground, or as low as you can comfortably go.","Step:6 Pause for a moment at the bottom, then push through your left heel to return to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/nqs5HGV.gif"}',
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
  'smith hack squat',
  'ZuPXtCK',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the barbell on the smith machine to an appropriate height for your body.","Step:2 Stand with your feet shoulder-width apart, toes slightly pointed outwards.","Step:3 Position yourself under the barbell, resting it on your upper traps and shoulders.","Step:4 Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:5 Engage your core and keep your chest up as you unrack the barbell.","Step:6 Take a step back and position your feet slightly wider than shoulder-width apart.","Step:7 Bend your knees and lower your body down, keeping your chest up and back straight.","Step:8 Continue descending until your thighs are parallel to the ground or slightly below.","Step:9 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:10 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZuPXtCK.gif"}',
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
  'assisted lying gluteus and piriformis stretch',
  'RQNVT10',
  'intermediate',
  'assisted',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Lie on your back with your legs extended.","Step:2 Bend your right knee and place your right ankle on your left thigh, just above the knee.","Step:3 Grasp your left thigh with both hands and gently pull it towards your chest.","Step:4 Hold the stretch for 20-30 seconds.","Step:5 Release the stretch and repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RQNVT10.gif"}',
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
  'dumbbell plyo squat',
  'S4pwGlc',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 As you reach the bottom of the squat, explode upward, jumping off the ground.","Step:4 While in the air, quickly switch the position of your feet, landing with your opposite foot forward.","Step:5 Immediately lower your body back into a squat position and repeat the jump, switching your feet again.","Step:6 Continue alternating the position of your feet with each jump for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/S4pwGlc.gif"}',
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
  'walking lunge',
  'IZVHb27',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Take a step forward with your right leg, lowering your body into a lunge position.","Step:3 Keep your torso upright and your front knee aligned with your ankle.","Step:4 Push off with your right foot and bring your left foot forward, stepping into a lunge position with your left leg.","Step:5 Continue alternating legs and walking forward, maintaining a controlled and steady pace.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IZVHb27.gif"}',
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
  'seated glute stretch',
  'DeDThfG',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings"}',
  '{"Step:1 Sit on the ground with your legs extended in front of you.","Step:2 Bend your right knee and cross your right ankle over your left thigh.","Step:3 Place your right hand on the ground behind you for support.","Step:4 With your left hand, gently press down on your right knee to deepen the stretch.","Step:5 Hold the stretch for 30 seconds to 1 minute.","Step:6 Switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DeDThfG.gif"}',
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
  'barbell zercher squat',
  'LSTChY9',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and toes slightly turned out.","Step:2 Hold the barbell in the crooks of your elbows, with your hands gripping the bar for stability.","Step:3 Engage your core and keep your chest lifted as you lower your hips back and down into a squat position.","Step:4 Keep your knees in line with your toes and your weight in your heels.","Step:5 Pause for a moment at the bottom of the squat, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LSTChY9.gif"}',
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
  'barbell deadlift',
  'ila4NZS',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and the barbell on the ground in front of you.","Step:2 Bend your knees and hinge at the hips to lower your torso and grip the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Keep your back straight and chest lifted as you drive through your heels to lift the barbell off the ground, extending your hips and knees.","Step:4 As you stand up straight, squeeze your glutes and keep your core engaged.","Step:5 Lower the barbell back down to the ground by bending at the hips and knees, keeping your back straight.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ila4NZS.gif"}',
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
  'cable standing hip extension',
  'Kpajagk',
  'intermediate',
  'cable',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Attach a cable to a low pulley and stand facing away from the machine.","Step:2 Place the cable around your ankle and stand with your feet shoulder-width apart.","Step:3 Keep your core engaged and your back straight throughout the exercise.","Step:4 Slowly extend your leg straight back, squeezing your glutes at the top of the movement.","Step:5 Pause for a moment, then return to the starting position.","Step:6 Repeat for the desired number of repetitions.","Step:7 Switch sides and repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Kpajagk.gif"}',
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
  'lever seated good morning',
  'XsCcxCC',
  'intermediate',
  'leverage machine',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Adjust the seat height so that your hips are slightly higher than your knees.","Step:2 Sit on the machine with your back against the pad and your feet flat on the footrests.","Step:3 Grasp the handles or the sides of the seat for stability.","Step:4 Keeping your back straight, slowly lean forward from your hips until your upper body is parallel to the ground.","Step:5 Pause for a moment, then slowly return to the starting position by pushing through your glutes and hamstrings.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XsCcxCC.gif"}',
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
  'pelvic tilt into bridge',
  'D9qe7CM',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Lie on your back with your knees bent and feet flat on the ground.","Step:2 Place your arms by your sides with your palms facing down.","Step:3 Engage your glutes and core muscles.","Step:4 Tilt your pelvis upward, lifting your hips off the ground.","Step:5 Hold the bridge position for a few seconds.","Step:6 Slowly lower your hips back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/D9qe7CM.gif"}',
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
  'barbell full zercher squat',
  'vR1vold',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and toes slightly turned out.","Step:2 Hold the barbell in the crooks of your elbows, with your hands gripping the barbell for stability.","Step:3 Engage your core and keep your chest lifted as you lower your hips back and down into a squat position.","Step:4 Keep your knees in line with your toes and your weight in your heels.","Step:5 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:6 Drive through your heels to stand back up, squeezing your glutes at the top of the movement.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vR1vold.gif"}',
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
  'dumbbell sumo pull through',
  'BmrwWzo',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"hamstrings","quadriceps","core"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointed outwards.","Step:2 Hold a dumbbell with both hands in front of your body, arms extended.","Step:3 Bend your knees and lower your hips down into a squat position, keeping your back straight.","Step:4 Lower the dumbbell down between your legs, keeping your arms straight.","Step:5 Drive through your heels and extend your hips forward, pulling the dumbbell up and in front of your body.","Step:6 Squeeze your glutes at the top of the movement, then lower the dumbbell back down between your legs.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/BmrwWzo.gif"}',
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
  'smith bent knee good morning',
  '1bQkKZK',
  'intermediate',
  'smith machine',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, toes pointing forward.","Step:2 Place the barbell across your upper back, resting it on your traps.","Step:3 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:4 Lower your torso until it is parallel to the ground, feeling a stretch in your hamstrings.","Step:5 Engage your glutes and hamstrings to raise your torso back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1bQkKZK.gif"}',
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
  'barbell full squat (side pov)',
  'iYzB0Cz',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you begin to lower your body down.","Step:4 Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.","Step:5 Lower your body until your thighs are parallel to the ground or slightly below.","Step:6 Keep your knees in line with your toes and your weight in your heels.","Step:7 Drive through your heels to stand back up, extending your hips and knees.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/iYzB0Cz.gif"}',
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
  'barbell rear lunge',
  'VaP75jl',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and a barbell resting on your upper back.","Step:2 Take a step backward with your right foot, landing on the ball of your foot.","Step:3 Bend both knees to lower your body until your left thigh is parallel to the ground.","Step:4 Push through your left heel to return to the starting position.","Step:5 Repeat with the other leg."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VaP75jl.gif"}',
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
  'glute bridge march',
  'GibBPPg',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"hamstrings","quadriceps"}',
  '{"Step:1 Lie flat on your back with your knees bent and feet flat on the ground.","Step:2 Engage your glutes and lift your hips off the ground, forming a straight line from your knees to your shoulders.","Step:3 While keeping your hips lifted, lift one foot off the ground and bring your knee towards your chest.","Step:4 Lower your foot back to the ground and repeat the movement with the other leg.","Step:5 Continue alternating legs in a marching motion while maintaining the bridge position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GibBPPg.gif"}',
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
  'kettlebell swing',
  'UHJlbu3',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"hamstrings","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes pointed slightly outward.","Step:2 Hold the kettlebell with both hands in front of your body, arms extended.","Step:3 Bend your knees slightly and hinge at the hips, pushing your butt back.","Step:4 Swing the kettlebell back between your legs, keeping your arms straight and maintaining a flat back.","Step:5 Drive your hips forward and swing the kettlebell up to shoulder height, using the momentum generated by your hips.","Step:6 Allow the kettlebell to swing back down between your legs and repeat the movement for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UHJlbu3.gif"}',
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
  'kettlebell lunge pass through',
  'WKMQzCD',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in front of your chest with both hands.","Step:2 Take a step forward with your right foot, lowering your body into a lunge position.","Step:3 As you lunge forward, pass the kettlebell under your right thigh and transfer it to your left hand.","Step:4 Push off with your right foot to return to the starting position, while simultaneously passing the kettlebell back to your right hand.","Step:5 Repeat the lunge on the opposite side, passing the kettlebell under your left thigh.","Step:6 Continue alternating lunges and passing the kettlebell between hands for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/WKMQzCD.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;