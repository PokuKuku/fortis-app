INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'roller side lat stretch',
  'c3Pfhti',
  'intermediate',
  'roller',
  '{"lats"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold the roller with both hands in front of your body.","Step:2 Bend your knees slightly and hinge forward at the hips, keeping your back straight.","Step:3 Extend your arms forward and roll the roller down towards your feet, feeling a stretch in your lats.","Step:4 Hold the stretch for a few seconds, then slowly roll the roller back up to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/c3Pfhti.gif"}',
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
  'band fixed back underhand pulldown',
  'ZH68exZ',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Attach the band to a sturdy anchor point above your head.","Step:2 Stand facing the anchor point with your feet shoulder-width apart.","Step:3 Grasp the band with an underhand grip, hands slightly wider than shoulder-width apart.","Step:4 Step back to create tension in the band, keeping your arms fully extended.","Step:5 Engage your core and squeeze your shoulder blades together.","Step:6 Pull the band down towards your chest, leading with your elbows.","Step:7 Pause for a moment at the bottom of the movement, feeling the contraction in your lats.","Step:8 Slowly release the tension in the band and return to the starting position.","Step:9 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZH68exZ.gif"}',
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
  'cable lat pulldown full range of motion',
  'LEprlgG',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Sit on the lat pulldown machine with your knees positioned under the pads.","Step:2 Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.","Step:4 Pull the bar down towards your upper chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LEprlgG.gif"}',
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
  'weighted pull-up',
  'HMzLjXx',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arms fully extended and your body straight.","Step:3 Engage your back muscles and pull your body up towards the bar, keeping your elbows close to your body.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/HMzLjXx.gif"}',
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
  'cable wide grip rear pulldown behind neck',
  'CmEr4pM',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the cable machine so that the pulldown bar is at a height above your head.","Step:2 Sit down on the seat and grab the pulldown bar with a wide overhand grip.","Step:3 Keep your back straight and your chest up as you lean back slightly.","Step:4 Pull the bar down towards your upper chest, squeezing your shoulder blades together.","Step:5 Pause for a moment at the bottom of the movement, then slowly release the bar back up to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CmEr4pM.gif"}',
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
  'cable thibaudeau kayak row',
  'ZgwWBoC',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Attach a cable handle to a low pulley and sit facing the machine with your feet flat on the floor.","Step:2 Grasp the handle with your right hand and extend your arm fully, keeping a slight bend in your elbow.","Step:3 Lean forward from your hips, keeping your back straight and your abs engaged.","Step:4 Pull the handle towards your torso by retracting your shoulder blade and bending your elbow, keeping your arm close to your body.","Step:5 Squeeze your back muscles at the top of the movement, then slowly return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides and perform with your left arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/ZgwWBoC.gif"}',
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
  'exercise ball lying side lat stretch',
  'rTbyBYV',
  'intermediate',
  'stability ball',
  '{"lats"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Lie on your side with your legs extended and your head supported by the stability ball.","Step:2 Place your top arm on the ball for stability.","Step:3 Reach your top arm overhead and allow your torso to rotate slightly.","Step:4 Feel the stretch in your lat muscles on the side of your body.","Step:5 Hold the stretch for 20-30 seconds, then switch sides and repeat."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rTbyBYV.gif"}',
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
  'cable lateral pulldown with v-bar',
  '4c9BhzB',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Sit down on the cable pulldown machine and grab the v-bar attachment with an overhand grip.","Step:2 Adjust the knee pad so that your thighs are secured under it.","Step:3 Keep your back straight and lean back slightly.","Step:4 Pull the v-bar down towards your upper chest while keeping your elbows close to your body.","Step:5 Squeeze your back muscles at the bottom of the movement.","Step:6 Slowly return the v-bar to the starting position and repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/4c9BhzB.gif"}',
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
  'cable bar lateral pulldown',
  'eYnzaCm',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","rhomboids","rear deltoids"}',
  '{"Step:1 Adjust the cable pulley to a high position and attach a straight bar.","Step:2 Sit facing the cable machine with your feet flat on the ground and your knees slightly bent.","Step:3 Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:4 Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.","Step:5 Pull the bar down towards your chest, leading with your elbows and squeezing your shoulder blades together.","Step:6 Pause for a moment at the bottom of the movement, then slowly return the bar to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eYnzaCm.gif"}',
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
  'barbell decline wide-grip pullover',
  'Hj4FOCd',
  'intermediate',
  'barbell',
  '{"lats"}',
  '{"triceps","chest"}',
  '{"Step:1 Lie on a decline bench with your head lower than your hips and your feet secured.","Step:2 Hold a barbell with a wide grip and extend your arms straight above your chest.","Step:3 Lower the barbell behind your head in a controlled manner, keeping your arms straight.","Step:4 Pause for a moment, then raise the barbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Hj4FOCd.gif"}',
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
  'pull up (neutral grip)',
  '0V2YQjW',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Hang from a pull-up bar with a neutral grip (palms facing each other) and your arms fully extended.","Step:2 Engage your core and squeeze your shoulder blades together.","Step:3 Pull your body up towards the bar by bending your elbows and driving your elbows down towards your hips.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/0V2YQjW.gif"}',
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
  'band kneeling one arm pulldown',
  'pmnrOp0',
  'intermediate',
  'band',
  '{"lats"}',
  '{"biceps","rhomboids"}',
  '{"Step:1 Attach the band to a sturdy anchor point above your head.","Step:2 Kneel down and hold the band with one hand, palm facing down.","Step:3 Extend your arm fully overhead, keeping your elbow slightly bent.","Step:4 Engage your lat muscles and pull the band down towards your side, bringing your elbow towards your ribcage.","Step:5 Pause for a moment at the bottom, then slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/pmnrOp0.gif"}',
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
  'weighted one hand pull up',
  'fXfqg1E',
  'intermediate',
  'weighted',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arm fully extended and your body straight.","Step:3 Engage your core and pull your body up towards the bar by bending your elbow and squeezing your back muscles.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Lower your body back down to the starting position with control.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/fXfqg1E.gif"}',
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
  'lever assisted chin-up',
  'MaMuGH6',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the leverage machine to your desired resistance level.","Step:2 Stand on the foot platform and grip the handles with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Hang with your arms fully extended, keeping your body straight.","Step:4 Engage your back muscles and pull your body up towards the handles, leading with your chest.","Step:5 Continue pulling until your chin is above the handles.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/MaMuGH6.gif"}',
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
  'reverse grip pull-up',
  'YAk5dIw',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an underhand grip, hands shoulder-width apart.","Step:2 Hang from the bar with your arms fully extended and your body straight.","Step:3 Engage your back muscles and pull your body up towards the bar, leading with your chest.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/YAk5dIw.gif"}',
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
  'cable pushdown (straight arm) v. 2',
  'PskORrA',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Attach a straight bar to a high pulley cable machine.","Step:2 Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.","Step:3 Grasp the bar with an overhand grip, keeping your arms straight and your palms facing down.","Step:4 Engage your core and keep your back straight as you exhale and push the bar down towards your thighs.","Step:5 Pause for a moment at the bottom, then slowly return the bar to the starting position while inhaling.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PskORrA.gif"}',
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
  'assisted parallel close grip pull-up',
  'vrhHa6D',
  'intermediate',
  'leverage machine',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Adjust the machine to your desired weight and height.","Step:2 Place your hands on the parallel bars with a close grip, palms facing each other.","Step:3 Hang from the bars with your arms fully extended and your feet off the ground.","Step:4 Engage your back muscles and pull your body up towards the bars, keeping your elbows close to your body.","Step:5 Continue pulling until your chin is above the bars.","Step:6 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vrhHa6D.gif"}',
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
  'cable straight arm pulldown (with rope)',
  'DT14T9T',
  'intermediate',
  'cable',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Attach a rope to the cable machine at the highest setting.","Step:2 Stand facing the machine with your feet shoulder-width apart.","Step:3 Grasp the rope with both hands, palms facing down.","Step:4 Extend your arms fully in front of you, keeping your elbows slightly bent.","Step:5 Engage your lats and slowly pull the rope down towards your thighs, keeping your arms straight.","Step:6 Pause for a moment at the bottom, then slowly release the tension and return to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/DT14T9T.gif"}',
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
  'back pec stretch',
  'chfnQnM',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"shoulders","chest"}',
  '{"Step:1 Stand tall with your feet shoulder-width apart.","Step:2 Extend your arms straight out in front of you, parallel to the ground.","Step:3 Cross your arms in front of your body, with your right arm over your left arm.","Step:4 Interlock your fingers and rotate your palms away from your body.","Step:5 Slowly raise your arms up and away from your body, feeling a stretch in your back and chest.","Step:6 Hold the stretch for 15-30 seconds, then release.","Step:7 Repeat on the opposite side."}',
  'strength',
  '{"https://static.exercisedb.dev/media/chfnQnM.gif"}',
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
  'rear pull-up',
  'CbFSYC1',
  'intermediate',
  'body weight',
  '{"lats"}',
  '{"biceps","forearms"}',
  '{"Step:1 Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.","Step:2 Hang from the bar with your arms fully extended and your body straight.","Step:3 Engage your back muscles and pull your body up towards the bar, keeping your elbows close to your body.","Step:4 Continue pulling until your chin is above the bar.","Step:5 Pause for a moment at the top, then slowly lower your body back down to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CbFSYC1.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;