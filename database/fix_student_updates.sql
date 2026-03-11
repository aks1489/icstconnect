-- Enable users to update their own profile
-- This is necessary for students to save their phone, address, etc.

-- 1. Ensure RLS is enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for Self-Update
-- Drop first to avoid conflicts if it exists with wrong definition
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

CREATE POLICY "Enable update for users based on id" ON public.profiles
FOR UPDATE USING (
    auth.uid() = id
);

-- 3. Verify Select Policy (Optional safety)
-- Usually users can read their own profile, ensure this exists if not already covered by "public read"
-- DROP POLICY IF EXISTS "Enable select for users based on id" ON public.profiles;
-- CREATE POLICY "Enable select for users based on id" ON public.profiles
-- FOR SELECT USING (
--     auth.uid() = id
-- );
