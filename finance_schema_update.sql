-- Update institution_transactions table
-- Add student_id for linking EMI/Admission payments
-- Add remarks for additional details

ALTER TABLE institution_transactions 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Index for faster lookups by student

-- Fix for student_fees relationship (The error PGRST200 indicates this is missing)
ALTER TABLE student_fees 
DROP CONSTRAINT IF EXISTS student_fees_student_id_fkey;

ALTER TABLE student_fees
ADD CONSTRAINT student_fees_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id);
