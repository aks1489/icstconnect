-- Run this in your Supabase SQL Editor to fix the "column does not exist" error

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Optional: Update existing records to have 0 progress if null (though DEFAULT handles new ones)
UPDATE enrollments SET progress = 0 WHERE progress IS NULL;
