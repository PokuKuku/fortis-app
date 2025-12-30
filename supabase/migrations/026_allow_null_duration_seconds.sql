-- Migration 026: Allow null duration for logged workouts
-- Preserve NULL duration when completed_at equals started_at, and honor client-provided duration_seconds.

CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    IF NEW.duration_seconds IS NOT NULL THEN
      RETURN NEW;
    END IF;

    IF NEW.completed_at = NEW.started_at THEN
      NEW.duration_seconds = NULL;
    ELSE
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
