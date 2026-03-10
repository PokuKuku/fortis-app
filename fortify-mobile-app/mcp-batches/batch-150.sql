INSERT INTO exercises (name, slug, level, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom)
VALUES
(
    'side bridge hip abduction',
    'WL4EmxJ',
    'intermediate',
    'body weight',
    '{"abductors"}',
    '{"glutes","obliques"}',
    '{"Step:1 Lie on your side with your legs extended and stacked on top of each other.","Step:2 Prop yourself up on your forearm, keeping your elbow directly below your shoulder.","Step:3 Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.","Step:4 While keeping your core engaged, lift your top leg as high as possible without rotating your hips.","Step:5 Pause for a moment at the top, then lower your leg back down.","Step:6 Repeat for the desired number of repetitions, then switch sides."}',
    'strength',
    '{"https://static.exercisedb.dev/media/WL4EmxJ.gif"}',
    false
  ),
(
    'side hip abduction',
    '7WaDzyL',
    'intermediate',
    'body weight',
    '{"abductors"}',
    '{"glutes","quadriceps"}',
    '{"Step:1 Stand with your feet shoulder-width apart and your hands on your hips.","Step:2 Shift your weight to one leg and lift the opposite leg out to the side, keeping it straight.","Step:3 Pause for a moment at the top, then slowly lower your leg back down to the starting position.","Step:4 Repeat on the other side.","Step:5 Continue alternating sides for the desired number of repetitions."}',
    'strength',
    '{"https://static.exercisedb.dev/media/7WaDzyL.gif"}',
    false
  ),
(
    'straight leg outer hip abductor',
    'mQ1tBXn',
    'intermediate',
    'body weight',
    '{"abductors"}',
    '{"glutes","hamstrings"}',
    '{"Step:1 Lie on your side with your legs straight and stacked on top of each other.","Step:2 Place your bottom arm under your head for support.","Step:3 Engage your core and lift your top leg as high as possible without rotating your hips or leaning backward.","Step:4 Pause for a moment at the top, then slowly lower your leg back down to the starting position.","Step:5 Repeat for the desired number of repetitions, then switch sides."}',
    'strength',
    '{"https://static.exercisedb.dev/media/mQ1tBXn.gif"}',
    false
  ),
(
    'fast style resistance band seated hip abduction',
    'Qj0HRAZ',
    'intermediate',
    'resistance band',
    '{"abductors"}',
    '{"glutes","hamstrings"}',
    '{"Step:1 Sit on a chair or bench with your back straight and feet flat on the ground.","Step:2 Wrap the resistance band around your thighs, just above your knees.","Step:3 Place your hands on the sides of the chair or bench for support.","Step:4 (fast variation) Engage your abductors (outer thigh muscles) and slowly push your knees apart, against the resistance of the band.","Step:5 Pause for a moment at the end of the movement, then slowly bring your knees back together.","Step:6 Repeat for the desired number of repetitions."}',
    'strength',
    '{"https://static.exercisedb.dev/media/Qj0HRAZ.gif"}',
    false
  )
ON CONFLICT (slug) WHERE is_custom = false DO UPDATE SET
  name = EXCLUDED.name,
  equipment = EXCLUDED.equipment,
  primary_muscles = EXCLUDED.primary_muscles,
  secondary_muscles = EXCLUDED.secondary_muscles,
  instructions = EXCLUDED.instructions,
  images = EXCLUDED.images;