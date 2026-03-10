INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'barbell squat jump step rear lunge',
  'RYcV1kH',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart, holding a barbell across your upper back.","Step:2 Lower your body into a squat position by bending your knees and pushing your hips back.","Step:3 Explode upwards, jumping off the ground as high as you can.","Step:4 Land softly on your feet and immediately step back with one leg into a reverse lunge.","Step:5 Lower your body down until your front thigh is parallel to the ground, keeping your back straight.","Step:6 Push through your front heel to return to the starting position.","Step:7 Repeat the jump and lunge sequence on the other leg.","Step:8 Continue alternating legs for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RYcV1kH.gif"}',
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
  'barbell one leg squat',
  'uKyN64F',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell across your upper back.","Step:2 Lift one foot off the ground and extend it forward, keeping it parallel to the ground.","Step:3 Bend your standing leg and lower your body down as if sitting back into a chair, keeping your chest up and your back straight.","Step:4 Lower yourself until your thigh is parallel to the ground, then push through your heel to return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uKyN64F.gif"}',
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
  'barbell squat (on knees)',
  'oR7O9LW',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Start by kneeling on the ground with your knees hip-width apart and your toes pointing forward.","Step:2 Place a barbell across your shoulders, gripping it with an overhand grip and your hands slightly wider than shoulder-width apart.","Step:3 Engage your core and keep your chest lifted as you slowly lower your body down by bending your knees, keeping your back straight.","Step:4 Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oR7O9LW.gif"}',
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
  'barbell side split squat',
  'W31mMjd',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing slightly outward.","Step:2 Hold a barbell across your upper back, resting it on your traps.","Step:3 Engage your core and keep your chest up as you lower your body down into a squat position, bending at the knees and hips.","Step:4 As you lower, push your knees out to the sides and keep your weight on your heels.","Step:5 Lower until your thighs are parallel to the ground, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/W31mMjd.gif"}',
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
  'snatch pull',
  'dG5Smob',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"hamstrings","glutes","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and the barbell on the ground in front of you.","Step:2 Bend your knees and hinge at the hips to lower into a squat position, gripping the barbell with an overhand grip.","Step:3 Keep your back straight and chest up as you drive through your heels to lift the barbell off the ground, extending your hips and knees.","Step:4 As the barbell reaches hip level, explosively pull it upwards, shrugging your shoulders and pulling your elbows high and to the sides.","Step:5 As the barbell reaches its highest point, quickly drop underneath it, pulling yourself into a deep squat position.","Step:6 Catch the barbell overhead with your arms fully extended and your knees bent.","Step:7 Stand up by extending your hips and knees, keeping the barbell overhead.","Step:8 Lower the barbell back down to the starting position by reversing the movement.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/dG5Smob.gif"}',
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
  'band single leg split squat',
  'y8bYM8w',
  'intermediate',
  'band',
  '{"quads"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Stand with your feet hip-width apart and place a resistance band around your ankles.","Step:2 Take a big step forward with your right foot and a smaller step back with your left foot.","Step:3 Bend your knees and lower your body until your right thigh is parallel to the ground, keeping your left knee slightly above the ground.","Step:4 Push through your right heel to return to the starting position.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/y8bYM8w.gif"}',
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
  'squat jerk',
  'IMRsOCn',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves","core"}',
  '{"Step:1 Start with the barbell resting on your shoulders, with your feet shoulder-width apart.","Step:2 Lower your body into a squat position, keeping your chest up and your knees tracking over your toes.","Step:3 As you reach the bottom of the squat, explosively drive through your legs and push the barbell overhead.","Step:4 As the barbell reaches its peak, quickly drop into a split position, with one foot forward and one foot back.","Step:5 Catch the barbell overhead with your arms fully extended and your back knee slightly touching the ground.","Step:6 Stand up from the split position, bringing your feet back together.","Step:7 Lower the barbell back to your shoulders and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IMRsOCn.gif"}',
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
  'dumbbell single leg split squat',
  'qx4fgX7',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand.","Step:2 Take a step forward with one foot and position your feet so that your front foot is flat on the ground and your back foot is elevated on a bench or step.","Step:3 Lower your body by bending your front knee and hip, keeping your back knee slightly bent and your back heel off the ground.","Step:4 Continue lowering until your front thigh is parallel to the ground, then push through your front heel to return to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/qx4fgX7.gif"}',
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
  'quick feet v. 2',
  'mweqJin',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","hamstrings"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your arms by your sides.","Step:2 Begin by rapidly moving your feet up and down, as if you were running in place.","Step:3 Keep your movements quick and light, focusing on staying on the balls of your feet.","Step:4 Continue for the desired duration or number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/mweqJin.gif"}',
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
  'split squats',
  '9E25EOx',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Take a step forward with one foot and place it about two feet in front of the other foot.","Step:3 Lower your body by bending your knees and hips, keeping your back straight.","Step:4 Continue lowering until your front thigh is parallel to the ground, and your back knee is hovering just above the ground.","Step:5 Pause for a moment, then push through your front heel to return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9E25EOx.gif"}',
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
  'barbell bench front squat',
  'Y7YcmIJ',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"hamstrings","glutes","calves"}',
  '{"Step:1 Start by standing with your feet shoulder-width apart and the barbell resting on your upper chest, just below your collarbone.","Step:2 Hold the barbell with an overhand grip, keeping your elbows up and your upper arms parallel to the ground.","Step:3 Lower your body down into a squat position by bending at the knees and hips, keeping your back straight and your chest up.","Step:4 Pause for a moment at the bottom of the squat, then push through your heels to return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y7YcmIJ.gif"}',
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
  'barbell side split squat v. 2',
  'HUEqZ1y',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing slightly outwards.","Step:2 Hold a barbell across your upper back, resting it on your shoulders.","Step:3 Take a big step to the side with your right foot, keeping your left foot planted.","Step:4 Bend your right knee and lower your body down into a squat position, keeping your chest up and your back straight.","Step:5 Push through your right heel to return to the starting position.","Step:6 Repeat on the other side, stepping out with your left foot.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HUEqZ1y.gif"}',
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
  'weighted sissy squat',
  '0lQnxMZ',
  'intermediate',
  'weighted',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart and your toes pointing slightly outward.","Step:2 Hold a weight in front of your chest with both hands, or place a barbell across your upper back.","Step:3 Keeping your chest up and your core engaged, slowly lower your body down by bending at the knees and hips.","Step:4 Continue lowering until your thighs are parallel to the ground or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0lQnxMZ.gif"}',
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
  'dumbbell step-up lunge',
  'gFyFj9z',
  'intermediate',
  'dumbbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand in front of a step or platform with a dumbbell in each hand, palms facing your sides.","Step:2 Place your right foot on the step, ensuring your entire foot is on the surface.","Step:3 Push through your right heel and lift your body up onto the step, bringing your left foot up as well.","Step:4 Once both feet are on the step, lower your left foot back down to the starting position, keeping your right foot on the step.","Step:5 Repeat the movement, alternating which foot you step up with each time.","Step:6 Continue for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gFyFj9z.gif"}',
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
  'barbell wide squat',
  's7HX1BY',
  'intermediate',
  'barbell',
  '{"quads"}',
  '{"glutes","hamstrings","calves"}',
  '{"Step:1 Stand with your feet wider than shoulder-width apart, toes pointing slightly outward.","Step:2 Hold the barbell across your upper back, resting it on your traps or rear delts.","Step:3 Engage your core and keep your chest up as you lower your body down into a squat, pushing your hips back and bending your knees.","Step:4 Lower until your thighs are parallel to the ground, or as low as you can comfortably go.","Step:5 Pause for a moment at the bottom, then push through your heels to return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/s7HX1BY.gif"}',
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
  'forward jump',
  'uZKq7lo',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","hamstrings","glutes"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Bend your knees and lower your body into a squat position.","Step:3 Swing your arms back for momentum.","Step:4 Jump forward explosively, extending your hips, knees, and ankles.","Step:5 Land softly on the balls of your feet and immediately go into the next jump.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/uZKq7lo.gif"}',
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
  'resistance band leg extension',
  'Y1MsI1l',
  'intermediate',
  'resistance band',
  '{"quads"}',
  '{"hamstrings"}',
  '{"Step:1 Attach the resistance band to a sturdy anchor point and secure it around your ankle.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Keeping your core engaged and your upper body stable, extend your leg straight out in front of you.","Step:4 Pause for a moment at the top, then slowly return your leg to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Y1MsI1l.gif"}',
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
  'balance board',
  'xAySMB0',
  'intermediate',
  'body weight',
  '{"quads"}',
  '{"calves","hamstrings","glutes"}',
  '{"Step:1 Place the balance board on a flat surface.","Step:2 Step onto the balance board with one foot, ensuring it is centered.","Step:3 Slowly shift your weight onto the foot on the balance board, keeping your core engaged.","Step:4 Maintain your balance and stability as you hold the position for a desired amount of time.","Step:5 Repeat the exercise with the other foot."}',
  'strength',
  '{"https://static.exercisedb.dev/media/xAySMB0.gif"}',
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
  'band one arm single leg split squat',
  'arsYEd3',
  'intermediate',
  'band',
  '{"quads"}',
  '{"glutes","hamstrings"}',
  '{"Step:1 Stand with your feet hip-width apart and place a resistance band around your ankles.","Step:2 Extend one leg forward and rest the top of your foot on a bench or step behind you.","Step:3 Hold onto a support with one hand for balance.","Step:4 Bend your standing leg and lower your body down into a squat position, keeping your knee in line with your toes.","Step:5 Push through your heel to return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch legs."}',
  'strength',
  '{"https://static.exercisedb.dev/media/arsYEd3.gif"}',
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
  'lever leg extension',
  'my33uHU',
  'intermediate',
  'leverage machine',
  '{"quads"}',
  '{"hamstrings"}',
  '{"Step:1 Adjust the seat height and backrest of the machine to fit your body.","Step:2 Sit on the machine with your back against the backrest and your feet on the footpad.","Step:3 Grasp the handles or sidebars for stability.","Step:4 Extend your legs forward by straightening your knees, lifting the weight.","Step:5 Pause for a moment at the top, then slowly lower the weight back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/my33uHU.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;