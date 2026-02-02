-- Adjust chest movement factor for bodyweight volume calculations.

create or replace function bodyweight_movement_factor(primary_muscles text[])
returns numeric
language sql
immutable
as $$
  select case
    when primary_muscles is null or array_length(primary_muscles, 1) is null then 0
    when lower(primary_muscles[1]) ~ 'full[- _]?body|total[- _]?body' then 0.6
    when lower(primary_muscles[1]) in (
      'glutes', 'gluteus', 'gluteus maximus', 'gluteus medius', 'gluteus minimus',
      'quads', 'quadriceps', 'hamstrings', 'hamstring', 'calves', 'calf',
      'adductors', 'adductor', 'abductors', 'abductor'
    ) then 0.7
    when lower(primary_muscles[1]) in (
      'chest', 'pectorals', 'pectoral', 'pec', 'pecs', 'upper chest', 'lower chest', 'serratus anterior'
    ) then 0.4
    when lower(primary_muscles[1]) in (
      'lats', 'latissimus dorsi', 'upper back', 'middle back', 'mid back', 'lower back', 'back',
      'rhomboids', 'traps', 'trapezius', 'erector spinae'
    ) then 0.85
    when lower(primary_muscles[1]) in (
      'front delts', 'front deltoids', 'anterior deltoid',
      'side delts', 'side deltoids', 'lateral deltoid', 'lateral delts',
      'rear delts', 'rear deltoids', 'posterior deltoid',
      'shoulders', 'delts', 'deltoids', 'rotator cuff'
    ) then 0.5
    when lower(primary_muscles[1]) in (
      'biceps', 'bicep', 'biceps brachii', 'brachialis',
      'triceps', 'tricep', 'triceps brachii',
      'forearm', 'forearms', 'wrist flexors', 'wrist extensors', 'grip muscles'
    ) then 0.45
    when lower(primary_muscles[1]) in (
      'abs', 'abdominals', 'abdominal', 'core', 'hip flexors', 'lower abs',
      'obliques', 'oblique'
    ) then 0.35
    else 0
  end;
$$;
