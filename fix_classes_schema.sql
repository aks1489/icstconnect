-- Fix for missing batch_number column
-- This script explicitly attempts to add the column in case the previous creation skipped it (if table existed)

DO $$ 
BEGIN 
    -- Check for batch_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'batch_number') THEN
        ALTER TABLE classes ADD COLUMN batch_number INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Check for batch_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'batch_name') THEN
        ALTER TABLE classes ADD COLUMN batch_name TEXT NOT NULL DEFAULT 'Batch 1';
    END IF;

    -- Check for capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'capacity') THEN
        ALTER TABLE classes ADD COLUMN capacity INTEGER NOT NULL DEFAULT 30;
    END IF;

    -- Also check for short_code in courses just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'short_code') THEN
        ALTER TABLE courses ADD COLUMN short_code TEXT;
    END IF;
END $$;
