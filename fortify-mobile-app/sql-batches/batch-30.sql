INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'side lying floor stretch',
  'jDOKRM5',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"obliques","glutes"}',
  '{"Step:1 Lie on your side with your legs straight and your bottom arm extended straight overhead.","Step:2 Bend your top knee and place your foot on the ground in front of your bottom leg.","Step:3 Reach your top arm over your head and grab onto something stable, like a wall or a piece of furniture.","Step:4 Slowly lift your bottom leg off the ground, keeping it straight, until you feel a stretch in your side.","Step:5 Hold the stretch for 20-30 seconds, then slowly lower your leg back down.","Step:6 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/jDOKRM5.gif"}',
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
  'lever pullover',
  '4U7iLb5',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the seat and handles of the leverage machine to a comfortable position.","Step:2 Sit on the machine with your back against the pad and grasp the handles with an overhand grip.","Step:3 Keep your arms slightly bent and your core engaged.","Step:4 Slowly pull the handles towards your chest, squeezing your lats.","Step:5 Pause for a moment at the peak contraction, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4U7iLb5.gif"}',
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
  'barbell bent arm pullover',
  'cA9FuWG',
  'intermediate',
  'barbell',
  '{"lats"}',
  '{"triceps","chest"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet on the floor.","Step:2 Hold a barbell with a shoulder-width grip and extend your arms straight above your chest.","Step:3 Lower the barbell behind your head while keeping your arms slightly bent.","Step:4 Pause for a moment, then raise the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/cA9FuWG.gif"}',
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
  'assisted pull-up',
  'kiJ4Z2K',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the machine to your desired weight and height settings.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang with your arms fully extended and your feet off the ground.","Step:4 Engage your back muscles and pull your body up towards the handles, keeping your elbows close to your body.","Step:5 Continue pulling until your chin is above the handles.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/kiJ4Z2K.gif"}',
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
  'gironda sternum chin',
  'IL0JUxR',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Stand facing a high bar with your feet shoulder-width apart.","Step:2 Reach up and grab the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang from the bar with your arms fully extended and your body straight.","Step:4 Engage your lats and biceps to pull your chest up towards the bar, leading with your sternum.","Step:5 Pause for a moment at the top, then slowly lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/IL0JUxR.gif"}',
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
  'cable rear pulldown',
  'SpsOSXk',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the cable machine so that the pulley is at the highest position.","Step:2 Sit facing the machine with your feet flat on the ground and your knees slightly bent.","Step:3 Grasp the cable attachment with an overhand grip, hands slightly wider than shoulder-width apart.","Step:4 Lean back slightly, keeping your back straight and your chest up.","Step:5 Pull the cable attachment down towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly release the cable back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/SpsOSXk.gif"}',
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
  'cable incline pushdown',
  '1PK5Uo3',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing away from the machine with your feet shoulder-width apart.","Step:3 Grasp the bar with an overhand grip, hands slightly wider than shoulder-width apart.","Step:4 Lean forward slightly and keep your back straight.","Step:5 Pull the bar down towards your thighs by extending your elbows.","Step:6 Pause for a moment at the bottom, then slowly return the bar to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1PK5Uo3.gif"}',
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
  'shoulder grip pull-up',
  'YtgD7Xq',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with a shoulder-width grip, palms facing away from you.","Step:2 Hang freely with your arms fully extended.","Step:3 Engage your back muscles and pull your body up towards the bar until your chin is above the bar.","Step:4 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YtgD7Xq.gif"}',
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
  'mixed grip chin-up',
  'T8UpLkb',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an underhand grip (palms facing towards you) and your hands slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arms fully extended and your feet off the ground.","Step:3 Engage your back muscles and pull your body up towards the bar, leading with your chest.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/T8UpLkb.gif"}',
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
  'cable lateral pulldown (with rope attachment)',
  'CuaWCmC',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach a rope attachment to the cable machine at a high position.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with an overhand grip, palms facing each other.","Step:4 Keep your back straight and lean slightly back.","Step:5 Pull the rope down towards your sides, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement.","Step:7 Slowly release the tension and allow the rope to return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CuaWCmC.gif"}',
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
  'cable seated high row (v-bar)',
  'pwt0pnM',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Sit on the cable machine with your feet flat on the floor and your knees slightly bent.","Step:2 Grasp the v-bar attachment with an overhand grip, palms facing each other, and your hands shoulder-width apart.","Step:3 Keep your back straight and lean slightly forward from the hips.","Step:4 Pull the v-bar towards your torso by retracting your shoulder blades and squeezing your back muscles.","Step:5 Pause for a moment at the peak of the contraction, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pwt0pnM.gif"}',
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
  'exercise ball lat stretch',
  'sM84pE4',
  'intermediate',
  'stability ball',
  '{"lats"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a dumbbell in one hand and extend your arm straight up overhead.","Step:3 Slowly lean to the opposite side, feeling a stretch in your lat muscle.","Step:4 Hold the stretch for 20-30 seconds, then return to the starting position.","Step:5 Repeat on the other side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/sM84pE4.gif"}',
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
  'weighted close grip chin-up on dip cage',
  'Gk1r408',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Stand in front of the dip cage and grab the parallel bars with an underhand grip, hands shoulder-width apart.","Step:2 Hang from the bars with your arms fully extended, feet off the ground, and body straight.","Step:3 Engage your back muscles and pull your body up towards the bars, keeping your elbows close to your sides.","Step:4 Continue pulling until your chin is above the bars, then pause for a moment.","Step:5 Slowly lower your body back down to the starting position, fully extending your arms.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Gk1r408.gif"}',
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
  'twin handle parallel grip lat pulldown',
  'rkg41Fb',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the seat height and position yourself facing the cable machine.","Step:2 Grasp the handles with an overhand grip, hands shoulder-width apart.","Step:3 Sit down and position your thighs under the thigh pads, keeping your feet flat on the floor.","Step:4 Lean back slightly and keep your chest up, maintaining a neutral spine.","Step:5 Pull the handles down towards your upper chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, feeling the contraction in your lats.","Step:7 Slowly release the handles and return to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rkg41Fb.gif"}',
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
  'muscle-up (on vertical bar)',
  'Af0EW2I',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","triceps","forearms"}',
  '{"Step:1 Start by hanging from a vertical bar with your palms facing away from you and your arms fully extended.","Step:2 Engage your core and pull your body up towards the bar, leading with your chest.","Step:3 As you pull yourself up, lean back slightly and bring your elbows towards your sides.","Step:4 Continue pulling until your chest reaches the bar and your elbows are fully bent.","Step:5 Pause for a moment at the top, then slowly lower yourself back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Af0EW2I.gif"}',
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
  'close grip chin-up',
  'VnfUNW7',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with your palms facing towards you and your hands shoulder-width apart.","Step:2 Hang from the bar with your arms fully extended and your feet off the ground.","Step:3 Engage your back muscles and pull your body up towards the bar, keeping your elbows close to your body.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VnfUNW7.gif"}',
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
  'barbell pullover to press',
  'znLogoF',
  'intermediate',
  'barbell',
  '{"lats"}',
  '{"triceps","chest","shoulders"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet on the ground.","Step:2 Hold the barbell with a pronated grip (palms facing away from you) and extend your arms straight above your chest.","Step:3 Keeping your arms straight, lower the barbell behind your head in an arc-like motion until you feel a stretch in your lats.","Step:4 Pause for a moment, then reverse the motion and press the barbell back to the starting position above your chest.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/znLogoF.gif"}',
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
  'cable cross-over lateral pulldown',
  'OQ1otBN',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Attach a cable handle to each side of a cable machine at shoulder height.","Step:2 Stand in the middle of the machine with your feet shoulder-width apart.","Step:3 Grasp the handles with an overhand grip and step back to create tension in the cables.","Step:4 Lean forward slightly from the hips, keeping your back straight and your chest up.","Step:5 Pull the handles down and across your body, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/OQ1otBN.gif"}',
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
  'band underhand pulldown',
  'k6tUeqS',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach the band to a high anchor point, such as a pull-up bar or sturdy beam.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Grasp the band with an underhand grip, hands slightly wider than shoulder-width apart.","Step:4 Extend your arms fully overhead, keeping your elbows slightly bent.","Step:5 Engage your lats and pull the band down towards your chest, squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/k6tUeqS.gif"}',
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
  'alternate lateral pulldown',
  '4IKbhHV',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids"}',
  '{"Step:1 Sit on the cable machine with your back straight and feet flat on the ground.","Step:2 Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lean back slightly and pull the handles towards your chest, squeezing your shoulder blades together.","Step:4 Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4IKbhHV.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;