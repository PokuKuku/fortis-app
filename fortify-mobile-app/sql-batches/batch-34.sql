INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell good morning',
  'XlZ4lAC',
  'intermediate',
  'barbell',
  '{"hamstrings"}',
  '{"lower back"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and the barbell resting on your upper back.","Step:2 Keeping your back straight and your core engaged, hinge forward at the hips, pushing your buttocks back as if you were trying to touch the wall behind you with your glutes.","Step:3 Lower your torso until it is parallel to the ground, feeling a stretch in your hamstrings.","Step:4 Pause for a moment, then return to the starting position by squeezing your glutes and pushing your hips forward.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XlZ4lAC.gif"}',
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
  'exercise ball seated hamstring stretch',
  'yRYyfdA',
  'intermediate',
  'stability ball',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Sit on the stability ball with your feet flat on the ground and your knees bent at a 90-degree angle.","Step:2 Slowly roll the ball forward, walking your feet out until your upper back is resting on the ball and your legs are extended straight in front of you.","Step:3 Place your hands on your hips for support.","Step:4 Engage your core and slowly lower your upper body towards the ground, keeping your back straight and your chest lifted.","Step:5 Stop when you feel a stretch in your hamstrings, and hold the position for 20-30 seconds.","Step:6 Slowly return to the starting position by pushing through your heels and using your hamstrings to pull yourself back up.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/yRYyfdA.gif"}',
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
  'inverse leg curl (on pull-up cable machine)',
  '0rHfvy9',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Adjust the cable machine so that the ankle straps are at the lowest setting.","Step:2 Lie face down on the bench with your legs extended and the ankle straps attached to your feet.","Step:3 Hold onto the handles of the bench for stability.","Step:4 Bend your knees and curl your legs towards your glutes, squeezing your hamstrings.","Step:5 Pause for a moment at the top of the movement, then slowly lower your legs back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0rHfvy9.gif"}',
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
  'self assisted inverse leg curl (on floor)',
  'ZSY3MsL',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Lie flat on your back with your legs extended and your arms by your sides.","Step:2 Bend your knees and place your feet flat on the ground, hip-width apart.","Step:3 Lift your hips off the ground, engaging your glutes and hamstrings.","Step:4 Slowly curl your legs towards your glutes, keeping your hips lifted.","Step:5 Pause for a moment at the top, then slowly extend your legs back to the starting position.","Step:6 Lower your hips back down to the ground.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZSY3MsL.gif"}',
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
  'inverse leg curl (bench support)',
  'ms7tjSG',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Lie face down on a bench with your hips at the edge and your legs extended straight behind you.","Step:2 Hold onto the bench for support.","Step:3 Keeping your upper body still, bend your knees and curl your legs towards your glutes.","Step:4 Pause for a moment at the top, then slowly extend your legs back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ms7tjSG.gif"}',
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
  'self assisted inverse leg curl',
  'E4PwJqI',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Lie face down on a leg curl machine with your legs extended and your ankles hooked under the padded lever.","Step:2 Place your hands on the side handles of the machine for support.","Step:3 Keeping your upper body stationary, exhale and curl your legs upward as far as possible.","Step:4 Hold the contracted position for a brief pause as you squeeze your hamstrings.","Step:5 Slowly lower your legs back to the starting position while inhaling.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/E4PwJqI.gif"}',
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
  'lever lying two-one leg curl',
  'UXpKJoq',
  'intermediate',
  'leverage machine',
  '{"hamstrings"}',
  '{"glutes"}',
  '{"Step:1 Adjust the machine to fit your body and sit on it with your back against the backrest.","Step:2 Place your legs on the lever pad, just above your ankles.","Step:3 Grasp the handles on the sides of the machine for support.","Step:4 Keeping your upper body still, exhale and curl your legs up towards your glutes.","Step:5 Pause for a moment at the top, then inhale and slowly lower your legs back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/UXpKJoq.gif"}',
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
  'power clean',
  'SiWCcTN',
  'intermediate',
  'barbell',
  '{"hamstrings"}',
  '{"glutes","quadriceps","calves"}',
  '{"Step:1 Start with the barbell on the ground in front of you, with your feet shoulder-width apart.","Step:2 Bend down and grip the barbell with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Keep your back straight and chest up as you lift the barbell off the ground, extending your hips and knees.","Step:4 As the barbell reaches your mid-thigh, explosively pull it upwards, shrugging your shoulders and pulling your elbows high and to the sides.","Step:5 As the barbell reaches its highest point, quickly drop underneath it, rotating your elbows around and catching the barbell on your shoulders in a front squat position.","Step:6 Stand up with the barbell, fully extending your hips and knees.","Step:7 Lower the barbell back down to the starting position, keeping control of the weight throughout the movement.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SiWCcTN.gif"}',
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
  'world greatest stretch',
  'DFGXwZr',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","quadriceps","calves"}',
  '{"Step:1 Start in a lunge position with your right foot forward and your left foot back.","Step:2 Place your hands on the ground on either side of your right foot.","Step:3 Lower your left knee to the ground and extend your right leg, keeping your right foot flat on the ground.","Step:4 Rotate your torso to the right, reaching your right arm up towards the ceiling.","Step:5 Hold this position for a few seconds, then return to the starting position.","Step:6 Switch sides and repeat the stretch with your left foot forward."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DFGXwZr.gif"}',
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
  'standing hamstring and calf stretch with strap',
  'xTjr103',
  'intermediate',
  'rope',
  '{"hamstrings"}',
  '{"calves"}',
  '{"Step:1 Stand upright with your feet shoulder-width apart.","Step:2 Hold the strap with both hands and place it around the ball of your foot.","Step:3 Keep your leg straight and slowly lean forward from your hips, keeping your back straight.","Step:4 Feel the stretch in your hamstring and calf muscles.","Step:5 Hold the stretch for 20-30 seconds.","Step:6 Release the stretch and repeat with the other leg.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xTjr103.gif"}',
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
  'single leg platform slide',
  'LNE3wfo',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","quadriceps"}',
  '{"Step:1 Start by standing with one foot on a platform or slide board.","Step:2 Bend your knee slightly and slide the foot on the platform backward, extending your leg.","Step:3 Keep your core engaged and maintain a straight posture throughout the movement.","Step:4 Slowly return to the starting position by sliding your foot back to the initial position.","Step:5 Repeat the movement for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LNE3wfo.gif"}',
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
  'intense barbell straight leg deadlift',
  'oMwyl17',
  'intermediate',
  'barbell',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing forward.","Step:2 Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:3 Bend at your hips and lower the barbell towards the ground, keeping your back straight and your knees slightly bent.","Step:4 Lower the barbell until you feel a stretch in your hamstrings. Maintain intense form throughout.","Step:5 Engage your hamstrings and glutes to lift the barbell back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oMwyl17.gif"}',
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
  'flexible assisted prone hamstring',
  'fBnPpzd',
  'intermediate',
  'assisted',
  '{"hamstrings"}',
  '{"glutes","lower back"}',
  '{"Step:1 Lie face down on a mat or bench with your legs fully extended.","Step:2 (flexible variation) Have a partner or use a resistance band to secure your ankles.","Step:3 Engage your hamstrings and lift your legs towards your glutes, keeping your knees straight.","Step:4 Pause for a moment at the top, then slowly lower your legs back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fBnPpzd.gif"}',
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
  'inverted style inverse leg curl (on pull-up cable machine)',
  'fjjY3N4',
  'intermediate',
  'body weight',
  '{"hamstrings"}',
  '{"glutes","calves"}',
  '{"Step:1 Adjust the cable machine so that the ankle straps are at the lowest setting.","Step:2 Lie face down on the bench with your legs extended and the ankle straps attached to your feet.","Step:3 Hold onto the handles of the bench for stability.","Step:4 Bend your knees and curl your legs towards your glutes, squeezing your hamstrings.","Step:5 Pause for a moment at the top of the movement, then slowly lower your legs back to the starting position.","Step:6 Repeat for the desired number of repetitions. Maintain inverted form throughout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fjjY3N4.gif"}',
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
  'push-up inside leg kick',
  '0br45wL',
  'intermediate',
  'body weight',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together.","Step:2 Lower your body towards the ground by bending your elbows, keeping your back straight and your core engaged.","Step:3 As you push back up, lift one leg off the ground and kick it out to the side, keeping it straight.","Step:4 Lower your leg back down and repeat the push-up, then switch to the other leg.","Step:5 Continue alternating leg kicks with each push-up repetition."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0br45wL.gif"}',
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
  'dumbbell contralateral forward lunge',
  'ecl28tP',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step forward with your right foot, keeping your back straight and core engaged.","Step:3 Lower your body by bending both knees until your right thigh is parallel to the ground.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat with your left leg.","Step:6 Alternate legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ecl28tP.gif"}',
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
  'band stiff leg deadlift',
  'kuMiR2T',
  'intermediate',
  'band',
  '{"glutes"}',
  '{"hamstrings","lower back"}',
  '{"Step:1 Stand with your feet shoulder-width apart and place the band around your ankles.","Step:2 Hold the band with both hands in front of your thighs, palms facing your body.","Step:3 Keeping your back straight and your core engaged, hinge at the hips and slowly lower your upper body towards the ground.","Step:4 As you lower, push your hips back and allow your knees to bend slightly.","Step:5 Lower the band towards the ground, feeling a stretch in your hamstrings.","Step:6 Pause for a moment at the bottom, then engage your glutes and hamstrings to lift your upper body back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kuMiR2T.gif"}',
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
  'kettlebell goblet squat',
  'ZA8b5hc',
  'intermediate',
  'kettlebell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell close to your chest with both hands.","Step:2 Keeping your chest up and core engaged, lower your body down into a squat position by bending at the knees and hips.","Step:3 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:4 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZA8b5hc.gif"}',
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
  'dumbbell single leg squat',
  'H6ybluc',
  'intermediate',
  'dumbbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Extend one leg forward and keep it off the ground throughout the exercise.","Step:3 Bend your standing leg and lower your body down as if sitting back into a chair.","Step:4 Keep your chest up and your back straight.","Step:5 Pause for a moment at the bottom, then push through your heel to return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/H6ybluc.gif"}',
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
  'barbell full squat (back pov)',
  'DhMl549',
  'intermediate',
  'barbell',
  '{"glutes"}',
  '{"quadriceps","hamstrings","calves","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, toes slightly turned out.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you begin to lower your body down.","Step:4 Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.","Step:5 Lower your body until your thighs are parallel to the ground or slightly below.","Step:6 Keep your knees in line with your toes and your weight in your heels.","Step:7 Drive through your heels to stand back up, extending your hips and knees.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DhMl549.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;