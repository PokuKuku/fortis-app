-- Remove deprecated insight feedback storage now that in-product feedback capture is retired.

DROP TABLE IF EXISTS training_insight_feedback;
