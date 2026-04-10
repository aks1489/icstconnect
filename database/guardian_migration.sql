-- Rename 'father_name' to 'guardian_name' in the profiles table to preserve all previously captured data.
ALTER TABLE public.profiles RENAME COLUMN father_name TO guardian_name;

-- Inject a fresh 'guardian_name' column into enrollment_applications.
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255);
