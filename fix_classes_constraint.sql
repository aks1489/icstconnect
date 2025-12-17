-- Fix for "null value in column title violates not-null constraint"
-- The table seems to have a legacy 'title' column that is required.
-- We make it nullable so our code (which uses 'batch_name') works.

DO $$ 
BEGIN 
    -- Check if 'title' exists and make it nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'title') THEN
        ALTER TABLE classes ALTER COLUMN title DROP NOT NULL;
    END IF;

    -- Check if 'date' exists and make it nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'date') THEN
        ALTER TABLE classes ALTER COLUMN date DROP NOT NULL;
    END IF;
END $$;
