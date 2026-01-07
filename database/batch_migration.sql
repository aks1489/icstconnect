-- Add class_id to class_schedules to link weekly rules to a specific batch
ALTER TABLE class_schedules 
ADD COLUMN IF NOT EXISTS class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE;

-- Add class_id to calendar_events to link specific one-off events (Extra Classes) to a batch
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS class_id BIGINT REFERENCES classes(id) ON DELETE CASCADE;

-- Optional: Drop course_id if we want strictness, but keeping it as redundant/helper is often safer for queries.
-- We will just make sure to query by class_id primarily.
