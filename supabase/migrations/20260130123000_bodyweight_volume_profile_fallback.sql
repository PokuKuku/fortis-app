-- Add profile weight_kg fallback for bodyweight volume estimates.

create or replace view weekly_workout_volume as
with latest_bodyweight as (
  select distinct on (user_id)
    user_id,
    case
      when unit = 'kg' then weight
      when unit = 'lb' then weight / 2.20462
      else null
    end as weight_kg
  from user_body_metrics
  where weight is not null
    and weight > 0
  order by user_id, recorded_at desc
),
completed_sessions as (
  select
    ws.id,
    ws.user_id,
    ws.started_at,
    ws.completed_at,
    ws.duration_seconds,
    p.preferred_units,
    p.timezone,
    case
      when lb.weight_kg is not null and lb.weight_kg > 0 then lb.weight_kg
      when p.weight_kg is not null and p.weight_kg > 0 then p.weight_kg
      else null
    end as bodyweight_kg
  from workout_sessions ws
  join profiles p on p.id = ws.user_id
  left join latest_bodyweight lb on lb.user_id = ws.user_id
  where ws.completed_at is not null
),
session_counts as (
  select
    user_id,
    date_trunc('week', started_at at time zone timezone)::date as week_start,
    count(*) as workouts_count,
    sum(coalesce(duration_seconds, 0)) as total_time_seconds
  from completed_sessions
  group by user_id, date_trunc('week', started_at at time zone timezone)::date
),
working_sets as (
  select
    cs.user_id,
    cs.started_at,
    cs.timezone,
    cs.preferred_units,
    cs.bodyweight_kg,
    wst.exercise_id,
    wst.exercise_name_snapshot,
    wst.primary_muscles_snapshot,
    wst.reps,
    wst.weight,
    wst.weight_unit,
    coalesce(wst.is_warmup, false) as is_warmup,
    e.equipment,
    coalesce(wst.primary_muscles_snapshot, e.primary_muscles, '{}'::text[]) as primary_muscles
  from completed_sessions cs
  left join workout_sets wst on wst.session_id = cs.id
  left join exercises e on e.id = wst.exercise_id
  where coalesce(wst.is_warmup, false) = false
    and wst.reps is not null
    and wst.reps > 0
),
normalized as (
  select
    ws.user_id,
    ws.started_at,
    ws.timezone,
    ws.preferred_units,
    ws.reps,
    case
      when ws.weight is not null and ws.weight > 0 then (
        case
          when ws.preferred_units = 'metric' then
            case
              when ws.weight_unit = 'lbs' then ws.weight / 2.20462
              else ws.weight
            end
          else
            case
              when ws.weight_unit = 'kg' then ws.weight * 2.20462
              else ws.weight
            end
        end
      )
      when (
        lower(coalesce(ws.equipment, '')) in ('body only', 'bodyweight', 'body weight', 'assisted', 'suspension')
        or coalesce(ws.exercise_name_snapshot, '') ~* '(^|[^[:alpha:]])(pull[- ]?up|chin[- ]?up|push[- ]?up|dip|plank|sit[- ]?up|crunch|inverted row)($|[^[:alpha:]])'
      ) then
        case
          when ws.bodyweight_kg is not null and ws.bodyweight_kg > 0
            and bodyweight_movement_factor(ws.primary_muscles) > 0 then
            case
              when ws.preferred_units = 'metric' then ws.bodyweight_kg * bodyweight_movement_factor(ws.primary_muscles)
              else ws.bodyweight_kg * 2.20462 * bodyweight_movement_factor(ws.primary_muscles)
            end
          else null
        end
      else null
    end as weight_norm
  from working_sets ws
),
volume_by_week as (
  select
    user_id,
    date_trunc('week', started_at at time zone timezone)::date as week_start,
    sum(
      case
        when weight_norm is null then 0
        else weight_norm * reps
      end
    ) as total_volume
  from normalized
  group by user_id, date_trunc('week', started_at at time zone timezone)::date
)
select
  sc.user_id,
  sc.week_start,
  sc.workouts_count,
  coalesce(vw.total_volume, 0) as total_volume,
  sc.total_time_seconds
from session_counts sc
left join volume_by_week vw
  on vw.user_id = sc.user_id
  and vw.week_start = sc.week_start;

alter view weekly_workout_volume set (security_invoker = on);

create or replace view exercise_exposures as
with latest_bodyweight as (
  select distinct on (user_id)
    user_id,
    case
      when unit = 'kg' then weight
      when unit = 'lb' then weight / 2.20462
      else null
    end as weight_kg
  from user_body_metrics
  where weight is not null
    and weight > 0
  order by user_id, recorded_at desc
),
completed_sessions as (
  select
    ws.id,
    ws.user_id,
    ws.started_at,
    p.preferred_units,
    p.timezone,
    case
      when lb.weight_kg is not null and lb.weight_kg > 0 then lb.weight_kg
      when p.weight_kg is not null and p.weight_kg > 0 then p.weight_kg
      else null
    end as bodyweight_kg
  from workout_sessions ws
  join profiles p on p.id = ws.user_id
  left join latest_bodyweight lb on lb.user_id = ws.user_id
  where ws.completed_at is not null
),
working_sets as (
  select
    cs.user_id,
    cs.id as session_id,
    cs.started_at,
    cs.timezone,
    cs.preferred_units,
    cs.bodyweight_kg,
    wst.exercise_id,
    wst.exercise_name_snapshot,
    wst.primary_muscles_snapshot,
    wst.reps,
    wst.weight,
    wst.weight_unit,
    coalesce(wst.is_warmup, false) as is_warmup,
    e.equipment,
    coalesce(wst.primary_muscles_snapshot, e.primary_muscles, '{}'::text[]) as primary_muscles
  from completed_sessions cs
  join workout_sets wst on wst.session_id = cs.id
  left join exercises e on e.id = wst.exercise_id
  where coalesce(wst.is_warmup, false) = false
    and wst.reps is not null
    and wst.reps > 0
),
normalized as (
  select
    ws.user_id,
    ws.session_id,
    ws.exercise_id,
    ws.started_at,
    ws.timezone,
    ws.reps,
    case
      when ws.weight is not null and ws.weight > 0 then (
        case
          when ws.preferred_units = 'metric' then
            case
              when ws.weight_unit = 'lbs' then ws.weight / 2.20462
              else ws.weight
            end
          else
            case
              when ws.weight_unit = 'kg' then ws.weight * 2.20462
              else ws.weight
            end
        end
      )
      when (
        lower(coalesce(ws.equipment, '')) in ('body only', 'bodyweight', 'body weight', 'assisted', 'suspension')
        or coalesce(ws.exercise_name_snapshot, '') ~* '(^|[^[:alpha:]])(pull[- ]?up|chin[- ]?up|push[- ]?up|dip|plank|sit[- ]?up|crunch|inverted row)($|[^[:alpha:]])'
      ) then
        case
          when ws.bodyweight_kg is not null and ws.bodyweight_kg > 0
            and bodyweight_movement_factor(ws.primary_muscles) > 0 then
            case
              when ws.preferred_units = 'metric' then ws.bodyweight_kg * bodyweight_movement_factor(ws.primary_muscles)
              else ws.bodyweight_kg * 2.20462 * bodyweight_movement_factor(ws.primary_muscles)
            end
          else null
        end
      else null
    end as weight_norm,
    least(ws.reps, 12) as reps_clamped
  from working_sets ws
),
per_exposure as (
  select
    user_id,
    exercise_id,
    session_id,
    started_at as exposure_at,
    date_trunc('week', started_at at time zone timezone)::date as week_start,
    sum(
      case
        when weight_norm is null then 0
        else weight_norm * reps
      end
    ) as total_volume,
    max(
      case
        when weight_norm is null then null
        else weight_norm * (1 + reps_clamped / 30.0)
      end
    ) as best_e1rm,
    count(*) as working_sets
  from normalized
  group by user_id, exercise_id, session_id, started_at, timezone
)
select
  user_id,
  exercise_id,
  session_id,
  exposure_at,
  week_start,
  total_volume,
  best_e1rm,
  working_sets
from per_exposure;

alter view exercise_exposures set (security_invoker = on);

create or replace view exercise_weekly_agg as
select
  user_id,
  exercise_id,
  week_start,
  count(*) as exposures,
  sum(working_sets) as working_sets,
  sum(total_volume) as total_volume,
  max(best_e1rm) as best_e1rm
from exercise_exposures
group by user_id, exercise_id, week_start;

alter view exercise_weekly_agg set (security_invoker = on);
