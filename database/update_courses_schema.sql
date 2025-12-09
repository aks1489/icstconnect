-- Add UI columns to courses table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'icon') THEN
        ALTER TABLE courses ADD COLUMN icon TEXT DEFAULT 'bi-code-square';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'color') THEN
        ALTER TABLE courses ADD COLUMN color TEXT DEFAULT 'text-indigo-600 bg-indigo-50';
    END IF;
END $$;
