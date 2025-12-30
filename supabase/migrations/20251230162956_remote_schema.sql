drop extension if exists "pg_net";

drop policy "subscriptions_no_client_delete" on "public"."subscriptions";

drop policy "subscriptions_no_client_insert" on "public"."subscriptions";

drop policy "subscriptions_no_client_update" on "public"."subscriptions";

alter table "public"."exercises" drop constraint "exercises_equipment_check";

alter table "public"."workout_sessions" add constraint "workout_sessions_duration_non_negative" CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))) not valid;

alter table "public"."workout_sessions" validate constraint "workout_sessions_duration_non_negative";

alter table "public"."workout_sets" add constraint "workout_sets_reps_non_negative" CHECK (((reps IS NULL) OR (reps >= 0))) not valid;

alter table "public"."workout_sets" validate constraint "workout_sets_reps_non_negative";

alter table "public"."workout_sets" add constraint "workout_sets_rest_seconds_non_negative" CHECK (((rest_seconds IS NULL) OR (rest_seconds >= 0))) not valid;

alter table "public"."workout_sets" validate constraint "workout_sets_rest_seconds_non_negative";

alter table "public"."workout_sets" add constraint "workout_sets_set_number_positive" CHECK ((set_number > 0)) not valid;

alter table "public"."workout_sets" validate constraint "workout_sets_set_number_positive";

alter table "public"."workout_sets" add constraint "workout_sets_weight_non_negative" CHECK (((weight IS NULL) OR (weight >= (0)::numeric))) not valid;

alter table "public"."workout_sets" validate constraint "workout_sets_weight_non_negative";

alter table "public"."exercises" add constraint "exercises_equipment_check" CHECK (((equipment IS NULL) OR (equipment = ANY (ARRAY['barbell'::text, 'dumbbell'::text, 'cable'::text, 'kettlebell'::text, 'body weight'::text, 'machine'::text, 'band'::text, 'medicine ball'::text, 'ez barbell'::text, 'trap bar'::text, 'smith machine'::text, 'suspension'::text, 'bodyweight'::text, 'resistance band'::text, 'rope'::text, 'weighted'::text, 'stability ball'::text, 'olympic barbell'::text, 'assisted'::text, 'leverage machine'::text, 'skierg machine'::text, 'roller'::text, 'bosu ball'::text, 'upper body ergometer'::text, 'sled machine'::text, 'tire'::text, 'stationary bike'::text, 'stepmill machine'::text, 'elliptical machine'::text, 'hammer'::text, 'wheel roller'::text])))) not valid;

alter table "public"."exercises" validate constraint "exercises_equipment_check";

create or replace view "public"."user_workout_stats" as  SELECT ws.user_id,
    count(DISTINCT ws.id) AS total_workouts,
    count(DISTINCT date(ws.started_at)) AS total_workout_days,
    sum(ws.duration_seconds) AS total_time_seconds,
    avg(ws.duration_seconds) AS avg_workout_duration,
    max(ws.started_at) AS last_workout_date,
    count(DISTINCT wst.exercise_id) AS unique_exercises_performed,
    sum(((wst.reps)::numeric * wst.weight)) AS total_volume
   FROM (public.workout_sessions ws
     LEFT JOIN public.workout_sets wst ON ((ws.id = wst.session_id)))
  WHERE (ws.completed_at IS NOT NULL)
  GROUP BY ws.user_id;


create or replace view "public"."weekly_workout_volume" as  SELECT ws.user_id,
    date_trunc('week'::text, ws.started_at) AS week_start,
    count(DISTINCT ws.id) AS workouts_count,
    sum(wst.volume) AS total_volume,
    sum(ws.duration_seconds) AS total_time_seconds,
    avg(wst.rpe) AS avg_rpe
   FROM (public.workout_sessions ws
     LEFT JOIN public.workout_sets wst ON ((ws.id = wst.session_id)))
  WHERE ((ws.completed_at IS NOT NULL) AND ((wst.completed = true) OR (wst.completed IS NULL)))
  GROUP BY ws.user_id, (date_trunc('week'::text, ws.started_at));



