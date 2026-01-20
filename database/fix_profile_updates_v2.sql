-- 1. Ensure columns exist
alter table public.profiles
add column if not exists phone text,
add column if not exists post_office text,
add column if not exists enrollment_center text;

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Update Policy for Admins
-- Drop existing policy if it exists to ensure we have the correct definition
DROP POLICY IF EXISTS "Enable update for admins" ON public.profiles;

-- Create the policy
CREATE POLICY "Enable update for admins" ON public.profiles
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Verify Policy for Select (just in case they need to read it back)
-- Usually "Enable read access for all users" handles this, but let's be safe
-- (Assuming public profiles are readable by all authenticated users)
