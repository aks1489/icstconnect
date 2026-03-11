-- 1. Ensure columns exist (Idempotent)
alter table public.profiles
add column if not exists phone text,
add column if not exists post_office text,
add column if not exists enrollment_center text;

-- 2. Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS Policy for Admins to UPDATE any profile
-- First drop to ensure we can recreate (or use create if not exists which is complex in postgres specific syntax for policies)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Enable update for admins'
    ) THEN
        CREATE POLICY "Enable update for admins" ON public.profiles
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END
$$;

-- 4. Add RLS Policy for Admins to INSERT/DELETE (Optional but good for management)
-- Insert is usually handled by auth trigger, but explicit insert might be needed.
-- Delete is verified in other scripts, but let's ensure Update is the main focus here.
