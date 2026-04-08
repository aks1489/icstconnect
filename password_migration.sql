-- 1. Add the column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT false;

-- 2. Add temporary password tracker
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255);

-- (Optional) If you want all EXISTING students to reset their passwords, you can run:
-- UPDATE public.profiles SET requires_password_change = true WHERE role = 'student';
