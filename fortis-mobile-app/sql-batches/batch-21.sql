INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'chest dip',
  '9WTm7dq',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself on parallel bars with your arms fully extended and your body straight.","Step:2 Lower your body by bending your elbows until your shoulders are below your elbows.","Step:3 Push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9WTm7dq.gif"}',
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
  'weighted svend press',
  'I1OBLnn',
  'intermediate',
  'weighted',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a weight plate in front of your chest with both hands.","Step:2 Keep your elbows slightly bent and your palms facing each other.","Step:3 Press the weight plate straight out in front of you, fully extending your arms.","Step:4 Pause for a moment at the end of the movement, then slowly bring the weight plate back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/I1OBLnn.gif"}',
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
  'dumbbell incline one arm press',
  'rDAiRf9',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in one hand, resting on your thigh.","Step:2 Lie back on the bench and position the dumbbell at shoulder level, palm facing forward.","Step:3 Press the dumbbell upward and slightly inward, extending your arm fully.","Step:4 Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rDAiRf9.gif"}',
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
  'push-up (on stability ball)',
  'tgryw5Y',
  'intermediate',
  'stability ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Place the stability ball on the ground and position yourself facing down with your hands on the ball, shoulder-width apart.","Step:2 Extend your legs straight out behind you, balancing on your toes.","Step:3 Engage your core and lower your chest towards the ball by bending your elbows, keeping your body in a straight line.","Step:4 Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tgryw5Y.gif"}',
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
  'korean dips',
  'rWoBmi5',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Position yourself between two parallel bars with your arms extended and supporting your body weight.","Step:2 Lower your body by bending your elbows until your upper arms are parallel to the ground.","Step:3 Pause for a moment, then push yourself back up to the starting position by straightening your arms.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rWoBmi5.gif"}',
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
  'dumbbell pullover',
  '9XjtHvS',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"latissimus dorsi","triceps"}',
  '{"Step:1 Lie flat on a bench with your head at one end and your feet on the floor.","Step:2 Hold a dumbbell with both hands and extend your arms straight above your chest.","Step:3 Keeping a slight bend in your elbows, slowly lower the dumbbell behind your head until you feel a stretch in your chest and shoulders.","Step:4 Pause for a moment, then raise the dumbbell back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/9XjtHvS.gif"}',
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
  'chest dip (on dip-pull-up cage)',
  'XgWyAiA',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the dip bars to a height that allows you to comfortably grip them.","Step:2 Stand between the bars and place your hands on each bar, slightly wider than shoulder-width apart.","Step:3 Jump up and straighten your arms, supporting your body weight on the bars.","Step:4 Bend your knees and cross your ankles behind you.","Step:5 Lower your body by bending your elbows, keeping your chest up and your shoulders down.","Step:6 Continue lowering until your shoulders are below your elbows or until you feel a stretch in your chest.","Step:7 Push through your palms and extend your elbows to raise your body back up to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/XgWyAiA.gif"}',
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
  'dumbbell one arm incline chest press',
  'PDaMuyV',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Adjust the incline bench to a 45-degree angle.","Step:2 Sit on the bench with your back against the pad and feet flat on the ground.","Step:3 Hold a dumbbell in one hand with an overhand grip, resting it on your shoulder.","Step:4 Push the dumbbell up and away from your body, extending your arm fully.","Step:5 Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PDaMuyV.gif"}',
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
  'dumbbell incline alternate press',
  'TVdivgY',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an incline bench with a dumbbell in each hand, resting on your thighs.","Step:2 Lean back on the bench and use your thighs to help raise the dumbbells to shoulder height, palms facing forward.","Step:3 Once at shoulder height, rotate your wrists so that the palms of your hands are facing forward.","Step:4 Push the dumbbells up with your chest and shoulders, extending your arms fully.","Step:5 Lower the dumbbells back down to the starting position, keeping your elbows slightly bent.","Step:6 Repeat for the desired number of repetitions, alternating arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/TVdivgY.gif"}',
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
  'assisted seated pectoralis major stretch with stability ball',
  'RoV1Rfa',
  'intermediate',
  'assisted',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on a stability ball with your feet flat on the ground and your back straight.","Step:2 Hold a stability ball with both hands and extend your arms straight out in front of you.","Step:3 Slowly lower the stability ball towards your chest, feeling a stretch in your pectoral muscles.","Step:4 Hold the stretch for a few seconds, then slowly return to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/RoV1Rfa.gif"}',
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
  'push-up (bosu ball)',
  '2kr2lWy',
  'intermediate',
  'bosu ball',
  '{"pectorals"}',
  '{"triceps","shoulders","core"}',
  '{"Step:1 Place the bosu ball on the ground with the flat side facing up.","Step:2 Position yourself in a push-up position with your hands on the outer edges of the bosu ball.","Step:3 Engage your core and lower your body down towards the bosu ball by bending your elbows.","Step:4 Push yourself back up to the starting position by extending your arms.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2kr2lWy.gif"}',
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
  'kettlebell alternating press on floor',
  '7w6i0vE',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Start by lying on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold a kettlebell in each hand, with your palms facing towards your feet and your arms extended straight up towards the ceiling.","Step:3 Lower one kettlebell down towards your shoulder while keeping the other kettlebell extended straight up.","Step:4 Press the lowered kettlebell back up to the starting position while simultaneously lowering the other kettlebell down towards your shoulder.","Step:5 Continue alternating the press motion with each kettlebell for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/7w6i0vE.gif"}',
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
  'cable decline press',
  '2Pya1cP',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Adjust the cable machine to a decline position.","Step:2 Sit on the decline bench facing the cable machine.","Step:3 Grasp the handles with an overhand grip and position them at chest level.","Step:4 Keep your feet flat on the ground and your back firmly against the bench.","Step:5 Exhale and push the handles away from your body, extending your arms fully.","Step:6 Pause for a moment at the end of the movement, squeezing your chest muscles.","Step:7 Inhale and slowly return the handles back to the starting position.","Step:8 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/2Pya1cP.gif"}',
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
  'isometric wipers',
  '11wrviz',
  'intermediate',
  'body weight',
  '{"pectorals"}',
  '{"shoulders","triceps","core"}',
  '{"Step:1 Start by lying flat on your back on a mat or bench.","Step:2 Extend your arms straight out to the sides, perpendicular to your body.","Step:3 Engage your core and lift both legs off the ground, keeping them together and straight.","Step:4 Slowly lower your legs to one side, aiming to touch the ground with your feet while maintaining control.","Step:5 Pause for a moment, then use your core to lift your legs back to the starting position.","Step:6 Repeat the movement, this time lowering your legs to the opposite side.","Step:7 Continue alternating sides for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/11wrviz.gif"}',
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
  'dumbbell incline breeding',
  'B3Rxp6L',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Set up an incline bench at a 45-degree angle.","Step:2 Sit on the bench with your back against the pad and feet flat on the ground.","Step:3 Hold a dumbbell in each hand with an overhand grip, palms facing forward.","Step:4 Start with your arms fully extended, perpendicular to the ground.","Step:5 Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle.","Step:6 Pause for a moment at the bottom, then push the dumbbells back up to the starting position.","Step:7 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/B3Rxp6L.gif"}',
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
  'cable press on exercise ball',
  'vAwm6rK',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Sit on an exercise ball with your feet flat on the ground and your knees at a 90-degree angle.","Step:2 Hold the cable handles at chest height with your palms facing down and your elbows bent.","Step:3 Engage your core and press the cable handles forward until your arms are fully extended.","Step:4 Pause for a moment, then slowly release the tension and bring the cable handles back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/vAwm6rK.gif"}',
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
  'kettlebell extended range one arm press on floor',
  'rseLfH3',
  'intermediate',
  'kettlebell',
  '{"pectorals"}',
  '{"triceps","shoulders"}',
  '{"Step:1 Start by lying on your back on the floor with your knees bent and feet flat on the ground.","Step:2 Hold a kettlebell in one hand, with your palm facing towards your feet.","Step:3 Extend your arm straight up towards the ceiling, keeping your elbow locked and your wrist straight.","Step:4 Slowly lower the kettlebell back down to the starting position, maintaining control throughout the movement.","Step:5 Repeat for the desired number of repetitions, then switch to the other arm."}',
  'strength',
  '{"https://static.exercisedb.dev/media/rseLfH3.gif"}',
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
  'dumbbell incline one arm fly on exercise ball',
  'LLNh6q5',
  'intermediate',
  'dumbbell',
  '{"pectorals"}',
  '{"shoulders"}',
  '{"Step:1 Sit on an exercise ball with a dumbbell in one hand.","Step:2 Walk your feet forward and roll your body down until your head, neck, and upper back are supported on the ball.","Step:3 Hold the dumbbell with your arm extended straight up over your chest, palm facing inwards.","Step:4 Slowly lower the dumbbell out to the side, keeping a slight bend in your elbow.","Step:5 Pause for a moment when your arm is parallel to the ground.","Step:6 Engage your chest muscles to bring the dumbbell back up to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch arms."}',
  'strength',
  '{"https://static.exercisedb.dev/media/LLNh6q5.gif"}',
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
  'cable one arm decline chest fly',
  'w4dLzSx',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"shoulders","triceps"}',
  '{"Step:1 Attach a D-handle to a low pulley cable machine and set the bench to a decline angle.","Step:2 Lie down on the bench with your head towards the machine and grab the handle with your right hand.","Step:3 Extend your arm straight up above your chest, keeping a slight bend in your elbow.","Step:4 With a controlled motion, lower your arm out to the side until your hand is in line with your shoulder.","Step:5 Pause for a moment, then reverse the motion and bring your arm back to the starting position.","Step:6 Repeat for the desired number of repetitions, then switch to your left arm and repeat the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/w4dLzSx.gif"}',
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
  'cable one arm incline press',
  'GKEH6jj',
  'intermediate',
  'cable',
  '{"pectorals"}',
  '{"deltoids","triceps"}',
  '{"Step:1 Adjust the cable machine to a low pulley position.","Step:2 Sit on an incline bench facing away from the cable machine.","Step:3 Grasp the handle with one hand and bring it up to shoulder height.","Step:4 Position your feet firmly on the ground and maintain a stable position.","Step:5 Press the handle forward and upward, extending your arm fully.","Step:6 Pause for a moment at the top, then slowly lower the handle back to the starting position.","Step:7 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/GKEH6jj.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;