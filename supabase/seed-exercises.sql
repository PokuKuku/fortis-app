-- =====================================================
-- FORTIS - EXERCISE LIBRARY SEED DATA
-- =====================================================
-- 50 most common and essential strength training exercises
-- Curated to cover all major muscle groups and movement patterns
-- =====================================================

-- Insert 50 essential exercises
INSERT INTO exercises (id, name, slug, force, level, mechanic, equipment, primary_muscles, secondary_muscles, instructions, category, images, is_custom, created_by) VALUES

-- CHEST EXERCISES (8)
(
  'fd7bde0d-966e-4e45-998c-e2ee547b6808',
  'Barbell Bench Press',
  'barbell-bench-press',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Lie back on a flat bench with a barbell rack. Using a medium-width grip, lift the bar from the rack and hold it straight over your chest with arms locked.',
    'From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.',
    'After a brief pause, push the bar back to the starting position as you breathe out.',
    'Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'powerlifting',
  ARRAY['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b'],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Dumbbell Bench Press',
  'dumbbell-bench-press',
  'push',
  'intermediate',
  'compound',
  'dumbbell',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs.',
    'Using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.',
    'Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you.',
    'Push the dumbbells up with your chest and lock your arms at the top of the lift. Squeeze your chest.',
    'Lower the weight slowly to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  'd36f3ccd-de7c-43ba-a780-043bdc0e0b37',
  'Incline Dumbbell Press',
  'incline-dumbbell-press',
  'push',
  'intermediate',
  'compound',
  'dumbbell',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Lie back on an incline bench set to 30-45 degrees with a dumbbell in each hand.',
    'Hold the dumbbells at shoulder level with palms facing forward.',
    'Press the dumbbells up until your arms are extended, keeping them shoulder-width apart.',
    'Lower the dumbbells back down to shoulder level in a controlled manner.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Dumbbell Flyes',
  'dumbbell-flyes',
  'pull',
  'intermediate',
  'isolation',
  'dumbbell',
  ARRAY['chest'],
  ARRAY['shoulders'],
  ARRAY[
    'Lie down on a flat bench with a dumbbell on each hand resting on top of your thighs.',
    'Once you are laying down, move the dumbbells in front of you at shoulder width with palms facing each other.',
    'With a slight bend on your elbows, lower your arms out at both sides in a wide arc until you feel a stretch on your chest.',
    'Bring your arms back to the starting position and squeeze your chest muscles.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Push-Ups',
  'push-ups',
  'push',
  'beginner',
  'compound',
  'body only',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.',
    'Lower yourself downward until your chest almost touches the floor as you inhale.',
    'Now breathe out and press your upper body back up to the starting position while squeezing your chest.',
    'After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Cable Crossover',
  'cable-crossover',
  'push',
  'intermediate',
  'isolation',
  'cable',
  ARRAY['chest'],
  ARRAY['shoulders'],
  ARRAY[
    'Set the pulleys at the highest position. Select the desired weight and grasp one handle in each hand.',
    'Step forward in front of the machine and take a split stance with one foot forward.',
    'With a slight bend in your elbows, extend your arms out to your sides maintaining the bend.',
    'Pull your hands toward each other in wide arcs in front of you, keeping your arms extended.',
    'Return to the starting position following the same path.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Chest Dips',
  'chest-dips',
  'push',
  'intermediate',
  'compound',
  'body only',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Hold your body at arms length above the bars with arms straight.',
    'Lean forward as far as possible and lower yourself slowly while flaring your elbows out.',
    'Once you feel a stretch in your chest, use your chest to bring your body back to the starting position.',
    'Squeeze at the top and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Decline Bench Press',
  'decline-bench-press',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['chest'],
  ARRAY['shoulders', 'triceps'],
  ARRAY[
    'Secure your legs at the end of the decline bench and lie down with a barbell.',
    'Using a medium width grip, lift the bar from the rack and hold it straight over you with your arms locked.',
    'As you breathe in, come down slowly until you feel the bar on your lower chest.',
    'After a second pause, bring the bar back to the starting position as you breathe out.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- BACK EXERCISES (9)
(
  gen_random_uuid(),
  'Barbell Deadlift',
  'barbell-deadlift',
  'pull',
  'expert',
  'compound',
  'barbell',
  ARRAY['lower back'],
  ARRAY['glutes', 'hamstrings', 'lats', 'traps'],
  ARRAY[
    'Stand with your mid-foot under the barbell with feet hip-width apart.',
    'Bend over and grab the bar with a shoulder-width grip.',
    'Bend your knees until your shins touch the bar, keeping your back straight.',
    'Lift your chest up and straighten your lower back.',
    'Take a big breath, hold it, and stand up with the weight.',
    'Return the weight to the floor by moving your hips back while bending your legs.'
  ],
  'powerlifting',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Pull-Ups',
  'pull-ups',
  'pull',
  'intermediate',
  'compound',
  'body only',
  ARRAY['lats'],
  ARRAY['biceps', 'middle back'],
  ARRAY[
    'Grab the pull-up bar with palms facing forward, hands shoulder-width apart.',
    'Hang with your arms fully extended.',
    'Pull yourself up by pulling your elbows toward the floor.',
    'Continue until your chin passes the bar.',
    'Lower yourself until your arms are fully extended again.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  'adec1956-ab7d-427c-8915-c02bd37d7340',
  'Barbell Row',
  'barbell-row',
  'pull',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['middle back'],
  ARRAY['lats', 'biceps'],
  ARRAY[
    'Stand with your mid-foot under the barbell.',
    'Bend over and grab the bar with a shoulder-width grip.',
    'Unlock your knees while keeping your hips high.',
    'Lift your chest and straighten your back.',
    'Pull the bar against your lower chest.',
    'Return the bar to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '7d6c217e-766f-4db0-b828-56fff447c05b',
  'Lat Pulldown',
  'lat-pulldown',
  'pull',
  'intermediate',
  'compound',
  'cable',
  ARRAY['lats'],
  ARRAY['biceps', 'shoulders'],
  ARRAY[
    'Sit down on a pull-down machine with a wide bar attached to the top pulley.',
    'Grab the bar with the palms facing forward using a wide grip.',
    'Bring your torso back around 30 degrees creating a curvature on your lower back.',
    'Pull the bar down until it touches your upper chest by drawing the shoulders and upper arms down and back.',
    'Squeeze your back muscles and slowly raise the bar back to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '7104f0f6-5b36-462e-bfc9-68a4090e201e',
  'Seated Cable Row',
  'seated-cable-row',
  'pull',
  'intermediate',
  'compound',
  'cable',
  ARRAY['middle back'],
  ARRAY['lats', 'biceps'],
  ARRAY[
    'Sit on a low pulley row machine with your feet on the platform and knees slightly bent.',
    'Lean over and grab the V-bar handles.',
    'With arms extended, pull back until your torso is at a 90-degree angle from your legs.',
    'Pull the handles back towards your torso keeping your torso stationary until your hands touch your abs.',
    'Slowly return to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Dumbbell Row',
  'dumbbell-row',
  'pull',
  'intermediate',
  'compound',
  'dumbbell',
  ARRAY['middle back'],
  ARRAY['lats', 'biceps'],
  ARRAY[
    'Place a dumbbell on each side of a flat bench.',
    'Place your right leg on top of the bench, bend your torso forward, and support yourself with your right hand.',
    'Use your left hand to pick up the dumbbell with a neutral grip.',
    'Pull the dumbbell straight up to the side of your chest, keeping your upper arm close to your side.',
    'Lower the dumbbell back down and repeat.',
    'Switch sides after completing the set.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'T-Bar Row',
  't-bar-row',
  't-bar-row',
  'pull',
  'intermediate',
  'compound',
  'other',
  ARRAY['middle back'],
  ARRAY['lats', 'biceps', 'shoulders'],
  ARRAY[
    'Load the bar and straddle it with one foot on either side.',
    'Bend at the hips to grasp the bar, keeping your back straight.',
    'Pull the weight up toward your lower chest, keeping your elbows close to your body.',
    'Pause at the top and squeeze your back muscles.',
    'Lower the weight back down in a controlled manner and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Face Pulls',
  'face-pulls',
  'pull',
  'intermediate',
  'isolation',
  'cable',
  ARRAY['shoulders'],
  ARRAY['traps', 'middle back'],
  ARRAY[
    'Set a rope attachment on a cable station at upper chest height.',
    'Grasp the rope with both hands with palms facing each other.',
    'Step back to create tension in the cable.',
    'Pull the rope towards your face, separating your hands as you do so.',
    'Focus on pulling with your rear delts and upper back.',
    'Return to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Hyperextensions',
  'hyperextensions',
  'pull',
  'intermediate',
  'compound',
  'body only',
  ARRAY['lower back'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Position yourself on a hyperextension bench with your ankles secured and upper thighs on the pad.',
    'With your body straight, cross your arms in front of you.',
    'Bend forward at the waist as far as you can while keeping your back flat.',
    'Slowly raise your torso back to the initial position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- LEGS EXERCISES (10)
(
  '10528626-e222-47ad-ac5b-06f4e36340a3',
  'Barbell Squat',
  'barbell-squat',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings', 'lower back'],
  ARRAY[
    'Set up a barbell on a rack at chest height. Step under the bar and position it on your upper back.',
    'Grasp the bar with both hands and lift it off the rack by straightening your legs.',
    'Step back and position your feet shoulder-width apart with toes slightly pointed out.',
    'Lower your body by bending your knees and hips, keeping your back straight.',
    'Continue down until your thighs are parallel to the floor.',
    'Push through your heels to return to the starting position.'
  ],
  'powerlifting',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Front Squat',
  'front-squat',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Set a barbell at chest height in a rack.',
    'Step up to the bar and position it across your front deltoids and clavicles.',
    'Cross your arms over the bar or use a clean grip to secure it.',
    'Lift the bar off the rack and step back, feet shoulder-width apart.',
    'Lower yourself by bending at the knees and hips, keeping your torso upright.',
    'Return to the starting position by driving through your heels.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '201f53ed-d0d7-4e4b-97ef-498f96acd3b1',
  'Romanian Deadlift',
  'romanian-deadlift',
  'pull',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['hamstrings'],
  ARRAY['glutes', 'lower back'],
  ARRAY[
    'Stand holding a barbell at hip level with a pronated grip.',
    'Lower the bar by moving your hips back as far as you can.',
    'Keep the bar close to your body, your head looking forward, and your shoulders back.',
    'Once you feel a stretch in your hamstrings, drive your hips forward to return to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '556be4e9-45be-4f4a-ad8b-d4eb0f3b9354',
  'Leg Press',
  'leg-press',
  'push',
  'beginner',
  'compound',
  'machine',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Sit on a leg press machine and place your feet on the platform shoulder-width apart.',
    'Lower the safety bars and press the platform up until your legs are fully extended.',
    'Lower the platform by bending your knees until they are at 90 degrees.',
    'Push the platform back up to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  'dae998d9-3882-4eb2-bf2b-6d7f207459ba',
  'Leg Curl',
  'leg-curl',
  'pull',
  'beginner',
  'isolation',
  'machine',
  ARRAY['hamstrings'],
  ARRAY['calves'],
  ARRAY[
    'Adjust the machine lever to fit your height and lie face down on the leg curl machine.',
    'Place the back of your lower legs under the padded lever.',
    'Keep your torso flat on the bench and ensure your legs are fully stretched.',
    'Curl your legs up as far as possible without lifting your upper legs from the pad.',
    'Slowly return to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '69126ffd-b3e5-4333-ba39-c84fdfaaf4bc',
  'Leg Extension',
  'leg-extension',
  'push',
  'beginner',
  'isolation',
  'machine',
  ARRAY['quadriceps'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Sit on a leg extension machine and place your feet under the pad.',
    'Adjust the pad so it rests on your lower shins.',
    'Grasp the handles and extend your legs until they are straight.',
    'Pause at the top and squeeze your quadriceps.',
    'Lower the weight back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '3611ff7b-1745-485d-b344-ab1009661816',
  'Bulgarian Split Squat',
  'bulgarian-split-squat',
  'push',
  'intermediate',
  'compound',
  'dumbbell',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Stand with one foot elevated on a bench behind you, holding dumbbells at your sides.',
    'Lower your body by bending your front knee until your thigh is parallel to the ground.',
    'Keep your torso upright and your front knee in line with your foot.',
    'Push through your front heel to return to the starting position.',
    'Complete all reps on one leg before switching to the other.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Walking Lunges',
  'walking-lunges',
  'push',
  'beginner',
  'compound',
  'body only',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Stand with your torso upright holding dumbbells at your sides.',
    'Step forward with your right leg and lower your body until your front thigh is parallel to the floor.',
    'Your rear knee should nearly touch the ground.',
    'Push off your front foot and bring your rear leg forward to step into the next lunge.',
    'Continue alternating legs as you move forward.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Goblet Squat',
  'goblet-squat',
  'push',
  'beginner',
  'compound',
  'dumbbell',
  ARRAY['quadriceps'],
  ARRAY['glutes', 'hamstrings'],
  ARRAY[
    'Hold a dumbbell vertically in front of your chest with both hands under the top weight plate.',
    'Stand with your feet slightly wider than shoulder-width apart, toes pointed out.',
    'Lower your body by bending at the knees and hips.',
    'Keep your chest up and back straight as you descend.',
    'Push through your heels to return to the starting position.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  'b2507e15-b06a-4835-bdc2-18fec9745ce1',
  'Calf Raises',
  'calf-raises',
  'push',
  'beginner',
  'isolation',
  'machine',
  ARRAY['calves'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Stand on a calf raise machine with your toes on the platform and heels hanging off.',
    'Place the padded lever on your shoulders.',
    'Raise your heels by extending your ankles as high as possible.',
    'Pause at the top and squeeze your calves.',
    'Lower your heels back down to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- SHOULDERS EXERCISES (6)
(
  '90f70cb5-a10c-48f7-b437-fd31f308f421',
  'Overhead Press',
  'overhead-press',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['shoulders'],
  ARRAY['triceps'],
  ARRAY[
    'Stand with a barbell at shoulder height in a rack.',
    'Grip the bar with hands just outside shoulder width.',
    'Unrack the bar and hold it at shoulder level.',
    'Press the bar straight up overhead until your arms are fully extended.',
    'Lower the bar back to shoulder level with control.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '61792bdb-aaba-43c8-96cf-b039c1bd9b95',
  'Dumbbell Shoulder Press',
  'dumbbell-shoulder-press',
  'push',
  'beginner',
  'compound',
  'dumbbell',
  ARRAY['shoulders'],
  ARRAY['triceps'],
  ARRAY[
    'Sit on a bench with back support and hold a dumbbell in each hand at shoulder level.',
    'Your palms should be facing forward.',
    'Press the dumbbells up until your arms are fully extended.',
    'Pause at the top.',
    'Lower the dumbbells back to shoulder level and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '18d654bb-e732-4f48-a402-ac0477920fc1',
  'Lateral Raises',
  'lateral-raises',
  'pull',
  'beginner',
  'isolation',
  'dumbbell',
  ARRAY['shoulders'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Stand with a dumbbell in each hand at your sides.',
    'Raise the dumbbells to your sides with a slight bend in your elbows.',
    'Lift until your arms are parallel to the floor.',
    'Pause at the top.',
    'Lower the dumbbells back to the starting position with control.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Front Raises',
  'front-raises',
  'pull',
  'beginner',
  'isolation',
  'dumbbell',
  ARRAY['shoulders'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Stand with a dumbbell in each hand in front of your thighs.',
    'Keep your arms straight with a slight bend in your elbows.',
    'Raise one dumbbell in front of you until your arm is parallel to the floor.',
    'Pause at the top.',
    'Lower the dumbbell back down and repeat with the other arm.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Rear Delt Flyes',
  'rear-delt-flyes',
  'pull',
  'intermediate',
  'isolation',
  'dumbbell',
  ARRAY['shoulders'],
  ARRAY['middle back'],
  ARRAY[
    'Bend over at the waist with a dumbbell in each hand hanging down.',
    'Keep your back straight and your knees slightly bent.',
    'Raise the dumbbells out to your sides, squeezing your shoulder blades together.',
    'Pause at the top.',
    'Lower the dumbbells back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Upright Row',
  'upright-row',
  'pull',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['shoulders'],
  ARRAY['traps'],
  ARRAY[
    'Stand with a barbell in front of you, hands close together.',
    'Lift the bar straight up along your body toward your chin.',
    'Keep the bar close to your body and your elbows higher than your wrists.',
    'Pause at the top when the bar reaches chest height.',
    'Lower the bar back down with control and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- ARMS - BICEPS (4)
(
  'e90f7dd6-bb54-406b-8f3f-153a89a12186',
  'Barbell Curl',
  'barbell-curl',
  'pull',
  'beginner',
  'isolation',
  'barbell',
  ARRAY['biceps'],
  ARRAY['forearms'],
  ARRAY[
    'Stand up with your torso upright while holding a barbell at shoulder width with an underhand grip.',
    'Keep your elbows close to your torso.',
    'Curl the weights while contracting your biceps as you breathe out.',
    'Continue the movement until your biceps are fully contracted and the bar is at shoulder level.',
    'Slowly bring the bar back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  'ce22ba14-303d-450f-9125-a6ae66557fe4',
  'Dumbbell Curl',
  'dumbbell-curl',
  'pull',
  'beginner',
  'isolation',
  'dumbbell',
  ARRAY['biceps'],
  ARRAY['forearms'],
  ARRAY[
    'Stand with a dumbbell in each hand, arms fully extended and palms facing forward.',
    'Keep your elbows close to your torso.',
    'Curl the weights while contracting your biceps.',
    'Continue to curl until the dumbbells are at shoulder level.',
    'Lower the dumbbells back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Hammer Curl',
  'hammer-curl',
  'pull',
  'beginner',
  'isolation',
  'dumbbell',
  ARRAY['biceps'],
  ARRAY['forearms'],
  ARRAY[
    'Stand with a dumbbell in each hand with arms extended and palms facing your torso.',
    'Keep your elbows close to your torso.',
    'Curl the weights while keeping your palms facing each other.',
    'Continue to curl until the dumbbells are at shoulder level.',
    'Lower the dumbbells back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Preacher Curl',
  'preacher-curl',
  'pull',
  'intermediate',
  'isolation',
  'barbell',
  ARRAY['biceps'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Sit at a preacher bench and hold a barbell with an underhand grip.',
    'Rest your upper arms on the preacher pad with arms fully extended.',
    'Curl the bar up toward your shoulders.',
    'Squeeze your biceps at the top.',
    'Lower the bar back down to the starting position with control and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- ARMS - TRICEPS (4)
(
  '3631f8d8-d5d2-482b-b251-31f152397548',
  'Close-Grip Bench Press',
  'close-grip-bench-press',
  'push',
  'intermediate',
  'compound',
  'barbell',
  ARRAY['triceps'],
  ARRAY['chest', 'shoulders'],
  ARRAY[
    'Lie on a flat bench and grip the barbell with hands closer than shoulder width.',
    'Lift the bar from the rack and hold it above your chest with arms extended.',
    'Lower the bar to your chest, keeping your elbows close to your body.',
    'Press the bar back up to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Triceps Dips',
  'triceps-dips',
  'push',
  'intermediate',
  'compound',
  'body only',
  ARRAY['triceps'],
  ARRAY['chest', 'shoulders'],
  ARRAY[
    'Hold your body at arms length above the bars.',
    'Keep your elbows close to your body and your torso upright.',
    'Lower yourself by bending your elbows until your upper arms are parallel to the floor.',
    'Push yourself back up to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '4cc0b407-cca2-4ed7-954f-c29a5cc0fe7b',
  'Overhead Triceps Extension',
  'overhead-triceps-extension',
  'push',
  'beginner',
  'isolation',
  'dumbbell',
  ARRAY['triceps'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Stand with feet shoulder-width apart holding a dumbbell with both hands.',
    'Raise the dumbbell overhead with arms fully extended.',
    'Lower the dumbbell behind your head by bending your elbows.',
    'Keep your upper arms stationary and close to your head.',
    'Extend your arms back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Cable Triceps Pushdown',
  'cable-triceps-pushdown',
  'push',
  'beginner',
  'isolation',
  'cable',
  ARRAY['triceps'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Attach a straight or angled bar to a high pulley.',
    'Grasp the bar with an overhand grip and stand upright.',
    'Keep your elbows close to your body.',
    'Push the bar down until your arms are fully extended.',
    'Return to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- CORE/ABS (5)
(
  '15778a2c-bc6a-4d83-9999-359cc47b4d12',
  'Plank',
  'plank',
  'static',
  'beginner',
  'compound',
  'body only',
  ARRAY['abdominals'],
  ARRAY['lower back'],
  ARRAY[
    'Get into a prone position on the floor, supporting your weight on your forearms and toes.',
    'Keep your body in a straight line from head to heels.',
    'Brace your core and hold this position.',
    'Avoid letting your hips sag or rise.',
    'Hold for the recommended amount of time.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Russian Twists',
  'russian-twists',
  'pull',
  'intermediate',
  'compound',
  'body only',
  ARRAY['abdominals'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Sit on the floor with your knees bent and feet elevated.',
    'Lean back slightly and hold your hands together in front of your chest.',
    'Twist your torso to the right, bringing your hands beside your hip.',
    'Reverse the motion and twist to the left.',
    'Continue alternating sides in a controlled manner.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Cable Crunches',
  'cable-crunches',
  'pull',
  'intermediate',
  'isolation',
  'cable',
  ARRAY['abdominals'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Kneel below a high pulley that has a rope attachment.',
    'Grasp the cable rope attachment and lower it until your hands are by your face.',
    'Flex your hips slightly and keep them stationary.',
    'Crunch down by contracting your abs, bringing your elbows toward your knees.',
    'Pause at the bottom and slowly return to the starting position.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  '288aaa4c-cfcc-4f0d-87bc-6abab8a89479',
  'Hanging Leg Raises',
  'hanging-leg-raises',
  'pull',
  'intermediate',
  'compound',
  'body only',
  ARRAY['abdominals'],
  ARRAY['hip flexors'],
  ARRAY[
    'Hang from a pull-up bar with arms fully extended.',
    'Keep your legs straight or slightly bent.',
    'Raise your legs by flexing your hips and abs until they are parallel to the floor.',
    'Pause at the top.',
    'Lower your legs back to the starting position with control.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Ab Wheel Rollout',
  'ab-wheel-rollout',
  'pull',
  'expert',
  'compound',
  'other',
  ARRAY['abdominals'],
  ARRAY['lower back', 'shoulders'],
  ARRAY[
    'Kneel on the floor holding an ab wheel with both hands.',
    'Roll the wheel forward, extending your body into a straight position.',
    'Go as far as you can without touching the ground with your body.',
    'Pause briefly.',
    'Pull yourself back to the starting position by contracting your abs.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- TRAPS (1)
(
  gen_random_uuid(),
  'Barbell Shrugs',
  'barbell-shrugs',
  'pull',
  'beginner',
  'isolation',
  'barbell',
  ARRAY['traps'],
  ARRAY[]::TEXT[],
  ARRAY[
    'Stand upright holding a barbell in front of you with an overhand grip.',
    'Keep your arms extended and your feet shoulder-width apart.',
    'Raise your shoulders as high as possible.',
    'Hold the contraction at the top for a second.',
    'Lower the barbell back to the starting position.',
    'Repeat for the recommended amount of repetitions.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),

-- GLUTES (2)
(
  '7ff3e1a1-fda8-4800-9063-aee09358e6ce',
  'Hip Thrust',
  'hip-thrust',
  'push',
  'beginner',
  'compound',
  'barbell',
  ARRAY['glutes'],
  ARRAY['hamstrings'],
  ARRAY[
    'Sit on the ground with your back against a bench and a loaded barbell over your legs.',
    'Roll the bar over your hips and lean back against the bench.',
    'Drive through your feet and extend your hips vertically.',
    'Your weight should be supported by your shoulders and feet.',
    'Squeeze your glutes at the top.',
    'Lower your hips back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
),
(
  gen_random_uuid(),
  'Glute Bridge',
  'glute-bridge',
  'push',
  'beginner',
  'isolation',
  'body only',
  ARRAY['glutes'],
  ARRAY['hamstrings'],
  ARRAY[
    'Lie on your back with knees bent and feet flat on the floor.',
    'Place your arms at your sides with palms down.',
    'Lift your hips off the ground until your knees, hips, and shoulders form a straight line.',
    'Squeeze your glutes at the top.',
    'Hold for a second.',
    'Lower your hips back to the starting position and repeat.'
  ],
  'strength',
  ARRAY[]::TEXT[],
  FALSE,
  NULL
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Count exercises by muscle group
SELECT
  unnest(primary_muscles) as muscle_group,
  COUNT(*) as exercise_count
FROM exercises
WHERE is_custom = FALSE
GROUP BY muscle_group
ORDER BY exercise_count DESC;
