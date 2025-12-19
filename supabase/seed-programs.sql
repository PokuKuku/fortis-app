-- =====================================================
-- FORTIS - DEFAULT WORKOUT PROGRAMS SEED DATA
-- =====================================================
-- 3 beginner-friendly workout programs
-- 1. Full Body Strength (3 days/week)
-- 2. Push Pull Legs (6 days/week)
-- 3. Upper/Lower Split (4 days/week)
-- =====================================================

-- =====================================================
-- PROGRAM 1: FULL BODY STRENGTH (3 DAYS/WEEK)
-- =====================================================

DO $$
DECLARE
  program1_id UUID := gen_random_uuid();
  workout1_day1_id UUID := gen_random_uuid();
  workout1_day2_id UUID := gen_random_uuid();
  workout1_day3_id UUID := gen_random_uuid();
BEGIN

-- Insert Full Body Strength Program
INSERT INTO workout_programs (id, name, description, difficulty, duration_weeks, goal, is_default, is_public, created_by)
VALUES (
  program1_id,
  'Full Body Strength',
  'A 3-day per week program focused on building total body strength using compound movements. Perfect for beginners or those with limited training time. Train Monday, Wednesday, Friday with rest days in between.',
  'beginner',
  12,
  'strength',
  TRUE,
  TRUE,
  NULL
);

-- DAY 1: Full Body A
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout1_day1_id,
  program1_id,
  'Day 1: Full Body A',
  'Focus on squat, bench, and rowing movements',
  1
);

-- Day 1 Exercises
INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  -- Barbell Squat
  (workout1_day1_id, (SELECT id FROM exercises WHERE slug = 'barbell-squat'), 1, 3, '5-8', 180, 'Main compound movement - focus on form'),
  -- Barbell Bench Press
  (workout1_day1_id, (SELECT id FROM exercises WHERE slug = 'barbell-bench-press'), 2, 3, '5-8', 180, 'Keep tight form and control the descent'),
  -- Barbell Row
  (workout1_day1_id, (SELECT id FROM exercises WHERE slug = 'barbell-row'), 3, 3, '8-12', 120, 'Pull to lower chest'),
  -- Dumbbell Shoulder Press
  (workout1_day1_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-shoulder-press'), 4, 3, '8-12', 90, 'Controlled movement'),
  -- Plank
  (workout1_day1_id, (SELECT id FROM exercises WHERE slug = 'plank'), 5, 3, '30-60s', 60, 'Hold for time - maintain straight body');

-- DAY 2: Full Body B
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout1_day2_id,
  program1_id,
  'Day 2: Full Body B',
  'Focus on deadlift, overhead press, and pulling movements',
  2
);

-- Day 2 Exercises
INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  -- Barbell Deadlift
  (workout1_day2_id, (SELECT id FROM exercises WHERE slug = 'barbell-deadlift'), 1, 3, '5-8', 180, 'Main compound movement - perfect your form'),
  -- Overhead Press
  (workout1_day2_id, (SELECT id FROM exercises WHERE slug = 'overhead-press'), 2, 3, '5-8', 180, 'Strict press - no leg drive'),
  -- Pull-Ups (or Lat Pulldown)
  (workout1_day2_id, (SELECT id FROM exercises WHERE slug = 'pull-ups'), 3, 3, '6-10', 120, 'Use assistance if needed'),
  -- Romanian Deadlift
  (workout1_day2_id, (SELECT id FROM exercises WHERE slug = 'romanian-deadlift'), 4, 3, '8-12', 90, 'Feel the hamstring stretch'),
  -- Russian Twists
  (workout1_day2_id, (SELECT id FROM exercises WHERE slug = 'russian-twists'), 5, 3, '15-20', 60, 'Control the rotation');

-- DAY 3: Full Body C
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout1_day3_id,
  program1_id,
  'Day 3: Full Body C',
  'Focus on front squat, incline press, and accessory work',
  3
);

-- Day 3 Exercises
INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  -- Front Squat
  (workout1_day3_id, (SELECT id FROM exercises WHERE slug = 'front-squat'), 1, 3, '6-10', 180, 'Keep torso upright'),
  -- Incline Dumbbell Press
  (workout1_day3_id, (SELECT id FROM exercises WHERE slug = 'incline-dumbbell-press'), 2, 3, '8-12', 120, 'Upper chest focus'),
  -- Lat Pulldown
  (workout1_day3_id, (SELECT id FROM exercises WHERE slug = 'lat-pulldown'), 3, 3, '8-12', 90, 'Pull to upper chest'),
  -- Walking Lunges
  (workout1_day3_id, (SELECT id FROM exercises WHERE slug = 'walking-lunges'), 4, 3, '10-12', 90, 'Each leg'),
  -- Hanging Leg Raises
  (workout1_day3_id, (SELECT id FROM exercises WHERE slug = 'hanging-leg-raises'), 5, 3, '10-15', 60, 'Control the movement');

END $$;

-- =====================================================
-- PROGRAM 2: PUSH PULL LEGS (6 DAYS/WEEK)
-- =====================================================

DO $$
DECLARE
  program2_id UUID := gen_random_uuid();
  workout2_push1_id UUID := gen_random_uuid();
  workout2_pull1_id UUID := gen_random_uuid();
  workout2_legs1_id UUID := gen_random_uuid();
  workout2_push2_id UUID := gen_random_uuid();
  workout2_pull2_id UUID := gen_random_uuid();
  workout2_legs2_id UUID := gen_random_uuid();
BEGIN

-- Insert Push Pull Legs Program
INSERT INTO workout_programs (id, name, description, difficulty, duration_weeks, goal, is_default, is_public, created_by)
VALUES (
  program2_id,
  'Push Pull Legs',
  'A 6-day training split that divides workouts by movement patterns. Push (chest, shoulders, triceps), Pull (back, biceps), and Legs. Run twice per week for maximum muscle growth and strength.',
  'intermediate',
  12,
  'hypertrophy',
  TRUE,
  TRUE,
  NULL
);

-- DAY 1: Push A
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_push1_id,
  program2_id,
  'Day 1: Push A',
  'Chest, shoulders, and triceps - strength focus',
  1
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'barbell-bench-press'), 1, 4, '6-8', 180, 'Heavy compound movement'),
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'overhead-press'), 2, 4, '6-8', 180, 'Shoulder strength'),
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'incline-dumbbell-press'), 3, 3, '8-12', 120, 'Upper chest'),
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'lateral-raises'), 4, 3, '12-15', 60, 'Lateral delts'),
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'cable-triceps-pushdown'), 5, 3, '12-15', 60, 'Triceps isolation'),
  (workout2_push1_id, (SELECT id FROM exercises WHERE slug = 'overhead-triceps-extension'), 6, 3, '12-15', 60, 'Long head focus');

-- DAY 2: Pull A
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_pull1_id,
  program2_id,
  'Day 2: Pull A',
  'Back and biceps - strength focus',
  2
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'barbell-deadlift'), 1, 4, '5-8', 180, 'Heavy pulling movement'),
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'pull-ups'), 2, 4, '6-10', 120, 'Weighted if possible'),
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'barbell-row'), 3, 4, '8-12', 120, 'Thick back'),
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'face-pulls'), 4, 3, '15-20', 60, 'Rear delts and upper back'),
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'barbell-curl'), 5, 3, '8-12', 60, 'Biceps mass'),
  (workout2_pull1_id, (SELECT id FROM exercises WHERE slug = 'hammer-curl'), 6, 3, '10-12', 60, 'Brachialis and forearms');

-- DAY 3: Legs A
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_legs1_id,
  program2_id,
  'Day 3: Legs A',
  'Quad-focused leg day',
  3
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'barbell-squat'), 1, 4, '6-10', 180, 'Squat deep'),
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'front-squat'), 2, 3, '8-12', 150, 'Quad emphasis'),
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'leg-press'), 3, 3, '10-15', 120, 'Push through heels'),
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'leg-extension'), 4, 3, '12-15', 60, 'Quad isolation'),
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'leg-curl'), 5, 3, '12-15', 60, 'Hamstring work'),
  (workout2_legs1_id, (SELECT id FROM exercises WHERE slug = 'calf-raises'), 6, 4, '15-20', 60, 'Calf development');

-- DAY 4: Push B
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_push2_id,
  program2_id,
  'Day 4: Push B',
  'Chest, shoulders, and triceps - hypertrophy focus',
  4
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-bench-press'), 1, 4, '8-12', 120, 'Dumbbell variation'),
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-shoulder-press'), 2, 4, '8-12', 120, 'Shoulder mass'),
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'cable-crossover'), 3, 3, '12-15', 90, 'Chest stretch'),
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'front-raises'), 4, 3, '12-15', 60, 'Front delts'),
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'close-grip-bench-press'), 5, 3, '8-12', 90, 'Triceps compound'),
  (workout2_push2_id, (SELECT id FROM exercises WHERE slug = 'triceps-dips'), 6, 3, '10-15', 60, 'Bodyweight triceps');

-- DAY 5: Pull B
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_pull2_id,
  program2_id,
  'Day 5: Pull B',
  'Back and biceps - hypertrophy focus',
  5
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 'lat-pulldown'), 1, 4, '8-12', 120, 'Wide grip'),
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 'seated-cable-row'), 2, 4, '10-12', 120, 'Squeeze your back'),
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-row'), 3, 3, '10-12', 90, 'Each arm'),
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 't-bar-row'), 4, 3, '10-12', 90, 'Thick back'),
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-curl'), 5, 3, '10-12', 60, 'Alternating or together'),
  (workout2_pull2_id, (SELECT id FROM exercises WHERE slug = 'preacher-curl'), 6, 3, '10-12', 60, 'Biceps peak');

-- DAY 6: Legs B
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout2_legs2_id,
  program2_id,
  'Day 6: Legs B',
  'Hamstring and glute-focused leg day',
  6
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'romanian-deadlift'), 1, 4, '8-12', 150, 'Feel the hamstrings'),
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'bulgarian-split-squat'), 2, 3, '10-12', 120, 'Each leg'),
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'leg-curl'), 3, 4, '12-15', 90, 'Hamstring isolation'),
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'hip-thrust'), 4, 4, '10-15', 90, 'Glute power'),
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'walking-lunges'), 5, 3, '12-15', 60, 'Each leg'),
  (workout2_legs2_id, (SELECT id FROM exercises WHERE slug = 'calf-raises'), 6, 4, '15-20', 60, 'Calf development');

END $$;

-- =====================================================
-- PROGRAM 3: UPPER/LOWER SPLIT (4 DAYS/WEEK)
-- =====================================================

DO $$
DECLARE
  program3_id UUID := gen_random_uuid();
  workout3_upper1_id UUID := gen_random_uuid();
  workout3_lower1_id UUID := gen_random_uuid();
  workout3_upper2_id UUID := gen_random_uuid();
  workout3_lower2_id UUID := gen_random_uuid();
BEGIN

-- Insert Upper/Lower Split Program
INSERT INTO workout_programs (id, name, description, difficulty, duration_weeks, goal, is_default, is_public, created_by)
VALUES (
  program3_id,
  'Upper/Lower Split',
  'A 4-day training split alternating between upper and lower body workouts. Ideal for building strength and muscle while allowing adequate recovery. Train Monday, Tuesday, Thursday, Friday.',
  'intermediate',
  12,
  'strength',
  TRUE,
  TRUE,
  NULL
);

-- DAY 1: Upper Power
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout3_upper1_id,
  program3_id,
  'Day 1: Upper Power',
  'Heavy compound movements for upper body strength',
  1
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'barbell-bench-press'), 1, 4, '4-6', 180, 'Heavy weight'),
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'barbell-row'), 2, 4, '6-8', 180, 'Pull heavy'),
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'overhead-press'), 3, 3, '6-8', 150, 'Shoulder strength'),
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'pull-ups'), 4, 3, '6-8', 120, 'Weighted if possible'),
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'barbell-curl'), 5, 3, '8-10', 90, 'Arm work'),
  (workout3_upper1_id, (SELECT id FROM exercises WHERE slug = 'close-grip-bench-press'), 6, 3, '8-10', 90, 'Triceps strength');

-- DAY 2: Lower Power
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout3_lower1_id,
  program3_id,
  'Day 2: Lower Power',
  'Heavy compound movements for lower body strength',
  2
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'barbell-squat'), 1, 4, '4-6', 180, 'Heavy squats'),
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'barbell-deadlift'), 2, 3, '5-8', 180, 'Heavy deadlifts'),
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'leg-press'), 3, 3, '8-12', 120, 'Push through heels'),
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'leg-curl'), 4, 3, '10-12', 90, 'Hamstrings'),
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'calf-raises'), 5, 4, '12-15', 60, 'Calves'),
  (workout3_lower1_id, (SELECT id FROM exercises WHERE slug = 'plank'), 6, 3, '45-60s', 60, 'Core stability');

-- DAY 3: Upper Hypertrophy
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout3_upper2_id,
  program3_id,
  'Day 3: Upper Hypertrophy',
  'Higher volume upper body work for muscle growth',
  3
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'incline-dumbbell-press'), 1, 4, '8-12', 120, 'Upper chest'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'seated-cable-row'), 2, 4, '10-12', 90, 'Back thickness'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-shoulder-press'), 3, 3, '10-12', 90, 'Shoulder mass'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'lat-pulldown'), 4, 3, '10-12', 90, 'Lats'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'lateral-raises'), 5, 3, '12-15', 60, 'Side delts'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'dumbbell-curl'), 6, 3, '10-12', 60, 'Biceps'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'cable-triceps-pushdown'), 7, 3, '12-15', 60, 'Triceps'),
  (workout3_upper2_id, (SELECT id FROM exercises WHERE slug = 'face-pulls'), 8, 3, '15-20', 60, 'Rear delts');

-- DAY 4: Lower Hypertrophy
INSERT INTO program_workouts (id, program_id, name, description, day_number)
VALUES (
  workout3_lower2_id,
  program3_id,
  'Day 4: Lower Hypertrophy',
  'Higher volume lower body work for muscle growth',
  4
);

INSERT INTO program_exercises (program_workout_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
VALUES
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'front-squat'), 1, 4, '8-10', 150, 'Quad focus'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'romanian-deadlift'), 2, 4, '10-12', 120, 'Hamstrings'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'bulgarian-split-squat'), 3, 3, '10-12', 90, 'Each leg'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'leg-extension'), 4, 3, '12-15', 60, 'Quad isolation'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'leg-curl'), 5, 3, '12-15', 60, 'Hamstring isolation'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'hip-thrust'), 6, 3, '12-15', 90, 'Glutes'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'calf-raises'), 7, 4, '15-20', 60, 'Calves'),
  (workout3_lower2_id, (SELECT id FROM exercises WHERE slug = 'hanging-leg-raises'), 8, 3, '12-15', 60, 'Lower abs');

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count programs
SELECT COUNT(*) as total_programs FROM workout_programs WHERE is_default = TRUE;

-- Count workouts per program
SELECT
  wp.name as program_name,
  COUNT(pw.id) as workout_count
FROM workout_programs wp
LEFT JOIN program_workouts pw ON wp.id = pw.program_id
WHERE wp.is_default = TRUE
GROUP BY wp.name;

-- Count exercises per workout
SELECT
  wp.name as program_name,
  pw.name as workout_name,
  COUNT(pe.id) as exercise_count
FROM workout_programs wp
JOIN program_workouts pw ON wp.id = pw.program_id
JOIN program_exercises pe ON pw.id = pe.program_workout_id
WHERE wp.is_default = TRUE
GROUP BY wp.name, pw.name
ORDER BY wp.name, pw.day_number;
