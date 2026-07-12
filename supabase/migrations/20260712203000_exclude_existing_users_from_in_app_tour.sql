-- The current in-app tour is for new accounts only. Mark every account that
-- existed before rollout as finished so app reinstalls and new devices cannot
-- enroll an existing user in the tour.
UPDATE profiles
SET
  has_seen_in_app_tour = TRUE,
  in_app_tour_completed_at = COALESCE(
    in_app_tour_completed_at,
    TIMESTAMPTZ '2026-07-12 20:30:00+00'
  ),
  in_app_tour_version = GREATEST(in_app_tour_version, 30)
WHERE created_at < TIMESTAMPTZ '2026-07-12 20:30:00+00'
  AND has_seen_in_app_tour = FALSE;
