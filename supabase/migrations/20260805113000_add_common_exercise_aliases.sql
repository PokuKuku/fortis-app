-- Add high-confidence colloquial gym names to their visible ExerciseDB records.
WITH alias_updates(name, new_aliases) AS (
  VALUES
    ('dumbbell single leg split squat', ARRAY['bulgarian split squat', 'rear foot elevated split squat', 'rfess']::TEXT[]),
    ('barbell romanian deadlift', ARRAY['rdl']::TEXT[]),
    ('glute-ham raise', ARRAY['ghr', 'glute ham raise']::TEXT[]),
    ('dumbbell bench press', ARRAY['db bench']::TEXT[]),
    ('dumbbell seated shoulder press', ARRAY['db shoulder press']::TEXT[]),
    ('dumbbell one arm bent-over row', ARRAY['db row', 'single arm dumbbell row', 'one arm dumbbell row']::TEXT[]),
    ('dumbbell biceps curl', ARRAY['db curl', 'dumbbell curl']::TEXT[]),
    ('trap bar deadlift', ARRAY['hex bar deadlift', 'hex deadlift']::TEXT[]),
    ('lever t bar row', ARRAY['landmine row', 'tbar row', 't-bar row']::TEXT[]),
    ('inverted row with straps', ARRAY['trx row', 'ring row', 'suspension row']::TEXT[]),
    ('lever seated row', ARRAY['hammer strength row', 'iso row', 'iso lateral row', 'iso-lateral row']::TEXT[]),
    ('pull-up', ARRAY['pullup']::TEXT[]),
    ('chin-up', ARRAY['chinup']::TEXT[]),
    ('assisted pull-up', ARRAY['assisted pullup', 'machine pull-up']::TEXT[]),
    ('lever seated leg curl', ARRAY['hamstring curl', 'machine leg curl']::TEXT[]),
    ('cable triceps pushdown (v-bar)', ARRAY['triceps pressdown', 'pressdown']::TEXT[]),
    ('lever seated hip abduction', ARRAY['hip abductor machine', 'hip abduction machine', 'glute med machine']::TEXT[]),
    ('lever seated hip adduction', ARRAY['hip adductor machine', 'hip adduction machine', 'adductor machine']::TEXT[]),
    ('3/4 sit-up', ARRAY['situp']::TEXT[]),
    ('wheel rollout', ARRAY['ab wheel', 'ab wheel rollout', 'ab rollout']::TEXT[]),
    ('farmers walk', ARRAY['farmer''s walk', 'farmer carry', 'farmer''s carry']::TEXT[]),
    ('stationary bike run v. 3', ARRAY['cycling', 'stationary bike', 'exercise bike']::TEXT[])
)
UPDATE exercises AS exercise
SET aliases = ARRAY(
  SELECT DISTINCT alias
  FROM unnest(COALESCE(exercise.aliases, '{}'::TEXT[]) || alias_updates.new_aliases) AS alias
)
FROM alias_updates
WHERE LOWER(exercise.name) = alias_updates.name;
