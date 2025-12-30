INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES
(
    'jack burpee',
    'mr7pkqP',
    'intermediate',
    'body weight',
    '{"cardiovascular system"}',
    '{"quadriceps","hamstrings","calves","shoulders","triceps","core"}',
    '{"Step:1 Start in a standing position with your feet shoulder-width apart.","Step:2 Lower your body into a squat position, placing your hands on the ground in front of you.","Step:3 Kick your feet back, landing in a push-up position.","Step:4 Perform a push-up, lowering your chest to the ground and then pushing back up.","Step:5 Jump your feet forward, landing in a squat position.","Step:6 Jump up explosively, reaching your arms overhead.","Step:7 Land softly and immediately lower back into the squat position to begin the next repetition."}',
    'strength',
    '{"https://static.exercisedb.dev/media/mr7pkqP.gif"}',
    false
  ),
(
    'mountain climber',
    'RJgzwny',
    'intermediate',
    'body weight',
    '{"cardiovascular system"}',
    '{"core","shoulders","triceps"}',
    '{"Step:1 Start in a high plank position with your hands directly under your shoulders and your body in a straight line.","Step:2 Engage your core and bring your right knee towards your chest, then quickly switch and bring your left knee towards your chest.","Step:3 Continue alternating legs in a running motion, keeping your hips low and your core engaged.","Step:4 Maintain a steady pace and breathe evenly throughout the exercise.","Step:5 Repeat for the desired number of repetitions."}',
    'strength',
    '{"https://static.exercisedb.dev/media/RJgzwny.gif"}',
    false
  ),
(
    'burpee',
    'dK9394r',
    'intermediate',
    'body weight',
    '{"cardiovascular system"}',
    '{"quadriceps","hamstrings","calves","shoulders","chest"}',
    '{"Step:1 Start in a standing position with your feet shoulder-width apart.","Step:2 Lower your body into a squat position by bending your knees and placing your hands on the floor in front of you.","Step:3 Kick your feet back into a push-up position.","Step:4 Perform a push-up, keeping your body in a straight line.","Step:5 Jump your feet back into the squat position.","Step:6 Jump up explosively, reaching your arms overhead.","Step:7 Land softly and immediately lower back into a squat position to begin the next repetition."}',
    'strength',
    '{"https://static.exercisedb.dev/media/dK9394r.gif"}',
    false
  ),
(
    'dumbbell burpee',
    '0JtKWum',
    'intermediate',
    'dumbbell',
    '{"cardiovascular system"}',
    '{"quadriceps","hamstrings","calves","shoulders","triceps","core"}',
    '{"Step:1 Start in a standing position with your feet shoulder-width apart and a dumbbell in each hand.","Step:2 Lower your body into a squat position, placing the dumbbells on the ground in front of you.","Step:3 Kick your feet back into a push-up position, keeping your body in a straight line.","Step:4 Perform a push-up, bending your elbows and lowering your chest towards the ground.","Step:5 Jump your feet back towards your hands, landing in a squat position.","Step:6 Stand up explosively, lifting the dumbbells off the ground and bringing them to your shoulders.","Step:7 Press the dumbbells overhead, fully extending your arms.","Step:8 Lower the dumbbells back to your shoulders and repeat the entire sequence for the desired number of repetitions."}',
    'strength',
    '{"https://static.exercisedb.dev/media/0JtKWum.gif"}',
    false
  ),
(
    'walking high knees lunge',
    'J9zIWig',
    'intermediate',
    'body weight',
    '{"cardiovascular system"}',
    '{"quadriceps","hamstrings","glutes","calves"}',
    '{"Step:1 Stand with your feet hip-width apart.","Step:2 Lift your right knee up towards your chest as high as you can while balancing on your left leg.","Step:3 Step forward with your right foot and lower your body into a lunge position, bending both knees to a 90-degree angle.","Step:4 Push off with your right foot and bring your left knee up towards your chest.","Step:5 Step forward with your left foot and lower your body into a lunge position.","Step:6 Continue alternating legs and lunging forward, keeping your core engaged and maintaining a steady pace.","Step:7 Repeat for the desired number of repetitions."}',
    'strength',
    '{"https://static.exercisedb.dev/media/J9zIWig.gif"}',
    false
  ),
(
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
  ),
(
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