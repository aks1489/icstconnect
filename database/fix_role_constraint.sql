-- ==========================================
-- FINAL FIX: VIOLATED CONSTRAINT
-- ==========================================
-- ROOT CAUSE FOUND: The database had a strict rule ("Check Constraint")
-- that only allowed specific roles (probably 'student' or 'admin').
-- It was rejecting 'teacher' and crashing the system.
--
-- THIS SCRIPT:
-- 1. Updates the rule to ALLOW 'teacher'.
-- 2. Manually fixes your "Demo" user.
-- 3. Restores the System to Normal (Removes Debug Mode).
-- ==========================================

BEGIN;

-- 1. FIX THE RULE (Constraint)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'admin', 'teacher')); 
-- Now it explicitly allows 'teacher'

-- 2. REPAIR THE MISSING USER (The one that failed)
INSERT INTO public.profiles (id, email, full_name, role, teacher_id)
VALUES (
  '8a4ef45d-6a25-4a4f-b71a-f43f964669be', 
  'vimid24932@roastic.com', 
  'demo', 
  'teacher', 
  'T-582590'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'teacher', teacher_id = 'T-582590'; -- Just in case

-- 3. RESTORE THE TRIGGER (Standard Mode)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, teacher_id, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'teacher_id',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
