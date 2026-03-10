INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES (
  'cable kneeling rear delt row (with rope) (male) expanded',
  'eZ79rbI',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"trapezius","rhomboids","biceps"}',
  '{"Step:1 Attach a rope handle to a low cable pulley and kneel down facing the machine.","Step:2 (expanded variation) Grasp the rope with a neutral grip (palms facing each other) and extend your arms fully in front of you.","Step:3 Keeping your back straight and core engaged, pull the rope towards your body by retracting your shoulder blades.","Step:4 Squeeze your shoulder blades together at the end of the movement and hold for a brief pause.","Step:5 Slowly release the tension and return to the starting position.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/eZ79rbI.gif"}',
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
  'lever military press with strength',
  'V7rWsT5',
  'intermediate',
  'leverage machine',
  '{"delts"}',
  '{"triceps","upper chest"}',
  '{"Step:1 Adjust the seat height and position yourself on the machine with your back against the backrest.","Step:2 Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.","Step:3 Push the handles upward until your arms are fully extended, but do not lock your elbows.","Step:4 (strength variation) Pause for a moment at the top, then slowly lower the handles back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/V7rWsT5.gif"}',
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
  'dumbbell iron cross - improved variation',
  '1RIkUHT',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","chest"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides.","Step:2 Raise your arms out to the sides until they are parallel to the ground, forming a T shape with your body. Perform with improved intensity.","Step:3 Pause for a moment, then slowly lower your arms back down to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1RIkUHT.gif"}',
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
  'resistance band seated shoulder press with declined',
  'hTLtkXL',
  'intermediate',
  'resistance band',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Hold the resistance band with both hands, palms facing forward, and bring it up to shoulder level.","Step:3 Press the band overhead, extending your arms fully.","Step:4 Pause for a moment at the top, then slowly lower the band back down to shoulder level. Emphasize declined control.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hTLtkXL.gif"}',
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
  'core barbell upright row v. 2',
  '1oE78pm',
  'intermediate',
  'barbell',
  '{"delts"}',
  '{"traps","biceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.","Step:2 Let the barbell hang in front of your thighs, arms fully extended. Perform with core intensity.","Step:3 Keeping your back straight, exhale and lift the barbell straight up towards your chin, leading with your elbows.","Step:4 Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/1oE78pm.gif"}',
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
  'prone dumbbell upright shoulder external rotation',
  'u1iHcoD',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"rotator cuff","trapezius"}',
  '{"Step:1 Stand with your feet shoulder-width apart and hold a dumbbell in each hand with your palms facing your body.","Step:2 Raise your arms out to the sides until they are parallel to the ground, keeping your elbows slightly bent. Emphasize prone control.","Step:3 Rotate your arms externally, bringing the dumbbells up towards your head while keeping your elbows in the same position.","Step:4 Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/u1iHcoD.gif"}',
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
  'single smith shoulder press',
  'VRBGPHB',
  'intermediate',
  'smith machine',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Adjust the seat height and position yourself on the smith machine with your feet shoulder-width apart.","Step:2 (single variation) Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.","Step:3 Lift the bar off the rack and position it at shoulder level, with your elbows bent and palms facing forward.","Step:4 Press the bar upward until your arms are fully extended overhead.","Step:5 Pause for a moment at the top, then slowly lower the bar back down to shoulder level.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/VRBGPHB.gif"}',
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
  'athletic style battling ropes',
  'hVzPY5j',
  'intermediate',
  'rope',
  '{"delts"}',
  '{"forearms","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold one end of the rope in each hand, with your palms facing each other.","Step:3 Raise your arms to shoulder height, keeping your elbows slightly bent.","Step:4 (athletic variation) Begin making alternating waves with the ropes by rapidly raising and lowering each arm.","Step:5 Continue for the desired duration or number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/hVzPY5j.gif"}',
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
  'kettlebell arnold press - beginner variation',
  'Mr8d4KA',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","upper back"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a kettlebell in each hand at shoulder height with your palms facing towards you.","Step:2 Engage your core and press the kettlebells overhead, rotating your palms to face forward as you extend your arms. Emphasize beginner control.","Step:3 Pause at the top of the movement, then slowly lower the kettlebells back to the starting position.","Step:4 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/Mr8d4KA.gif"}',
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
  'kettlebell seated press with high',
  '89HVjEp',
  'intermediate',
  'kettlebell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Sit on a bench with your back straight and feet flat on the ground.","Step:2 Hold a kettlebell in each hand at shoulder height, palms facing forward.","Step:3 Press the kettlebells overhead, fully extending your arms. Focus on high movement.","Step:4 Lower the kettlebells back to shoulder height.","Step:5 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/89HVjEp.gif"}',
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
  'tough cable one arm lateral raise',
  'myJeTAe',
  'intermediate',
  'cable',
  '{"delts"}',
  '{"traps","triceps"}',
  '{"Step:1 Stand with your feet shoulder-width apart, facing the cable machine.","Step:2 Hold the cable handle with one hand, palm facing down, and stand far enough away from the machine so that there is tension on the cable.","Step:3 Keep your arm straight and slowly raise it out to the side until it is parallel to the ground.","Step:4 Pause for a moment at the top, then slowly lower your arm back down to the starting position. Focus on tough movement.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
  'strength',
  '{"https://static.exercisedb.dev/media/myJeTAe.gif"}',
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
  'horizontal dumbbell standing alternate overhead press',
  'gWcZD4q',
  'intermediate',
  'dumbbell',
  '{"delts"}',
  '{"triceps","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.","Step:2 (horizontal variation) Press one dumbbell overhead, fully extending your arm.","Step:3 Lower the dumbbell back to shoulder level.","Step:4 Repeat with the other arm.","Step:5 Continue alternating arms for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/gWcZD4q.gif"}',
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
  'stationary bike run',
  'H1PESYI',
  'intermediate',
  'stationary bike',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Adjust the seat height and position to ensure proper alignment.","Step:2 Place your feet on the pedals and secure them with the straps if available.","Step:3 Start pedaling at a comfortable pace.","Step:4 Maintain a steady rhythm and increase the resistance as desired.","Step:5 Engage your core muscles to maintain stability and proper posture.","Step:6 Continue pedaling for the desired duration of your workout.","Step:7 Gradually decrease the resistance and slow down before coming to a complete stop.","Step:8 Stretch your legs and cool down after the workout."}',
  'strength',
  '{"https://static.exercisedb.dev/media/H1PESYI.gif"}',
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
  'astride jumps (male)',
  'f9lVSSI',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Bend your knees and lower your body into a squat position.","Step:3 Jump explosively upwards, extending your legs and arms.","Step:4 While in the air, spread your legs apart and bring your arms out to the sides.","Step:5 Land softly with your feet shoulder-width apart, bending your knees to absorb the impact.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/f9lVSSI.gif"}',
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
  'run',
  'oLrKqDH',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing upright with your feet hip-width apart.","Step:2 Engage your core and keep your upper body relaxed.","Step:3 Begin jogging in place, lifting your knees up towards your chest and landing softly on the balls of your feet.","Step:4 Maintain a steady pace and continue jogging for the desired duration or distance.","Step:5 Remember to breathe deeply and maintain good posture throughout the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/oLrKqDH.gif"}',
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
  'short stride run',
  'CcWEoWV',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Find an open space or a treadmill to perform the exercise.","Step:2 Stand tall with your feet hip-width apart.","Step:3 Start jogging in place, lifting your knees high and pumping your arms.","Step:4 After a few seconds, start taking short strides forward, maintaining a quick pace.","Step:5 Continue running with short strides for the desired duration or distance."}',
  'strength',
  '{"https://static.exercisedb.dev/media/CcWEoWV.gif"}',
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
  'ski step',
  '5MRH8H2',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","glutes","calves"}',
  '{"Step:1 Stand with your feet shoulder-width apart.","Step:2 Bend your knees slightly and keep your back straight.","Step:3 Jump to the right, landing on your right foot while swinging your left leg behind your right leg.","Step:4 Immediately jump to the left, landing on your left foot while swinging your right leg behind your left leg.","Step:5 Continue alternating jumps from side to side, mimicking a skiing motion.","Step:6 Repeat for the desired number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/5MRH8H2.gif"}',
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
  'run (equipment)',
  'y5p0H8a',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start by standing upright with your feet hip-width apart.","Step:2 Engage your core and keep your upper body relaxed.","Step:3 Begin jogging in place, lifting your knees up towards your chest and landing softly on the balls of your feet.","Step:4 Maintain a steady pace and continue jogging for the desired duration or distance.","Step:5 Remember to breathe deeply and maintain good posture throughout the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/y5p0H8a.gif"}',
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
  'swing 360',
  'tnaj0mT',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"shoulders","core"}',
  '{"Step:1 Stand with your feet shoulder-width apart and knees slightly bent.","Step:2 Hold your arms straight out in front of you, parallel to the ground.","Step:3 Engage your core and swing your arms in a circular motion, rotating your torso as you do so.","Step:4 Continue the circular motion, swinging your arms and rotating your torso for the desired number of repetitions.","Step:5 Remember to breathe throughout the exercise."}',
  'strength',
  '{"https://static.exercisedb.dev/media/tnaj0mT.gif"}',
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
  'push to run',
  'PrQbjvB',
  'intermediate',
  'body weight',
  '{"cardiovascular system"}',
  '{"quadriceps","hamstrings","calves"}',
  '{"Step:1 Start in a push-up position with your hands shoulder-width apart and your body in a straight line.","Step:2 Lower your chest towards the ground by bending your elbows, keeping your body straight.","Step:3 Push through your hands to extend your arms and return to the starting position.","Step:4 Quickly bring one knee towards your chest, then quickly switch and bring the other knee towards your chest.","Step:5 Continue alternating knees as fast as you can while maintaining good form.","Step:6 Continue for the desired duration or number of repetitions."}',
  'strength',
  '{"https://static.exercisedb.dev/media/PrQbjvB.gif"}',
  false
)
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;