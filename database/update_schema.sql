-- Add progress column to enrollments table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress') THEN
        ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;
