/*
  SQL Command to Setup Admin Profile (ROBUST VERSION)
  ---------------------------------------------------
  
  Instructions:
  1. Open your Supabase Dashboard.
  2. Go to the "SQL Editor" tab (icon looks like `>_`).
  3. Click "New Query".
  4. Paste the code below and click "Run".
*/

-- 1. Create a function to safely promote the user
DO $$
DECLARE
  target_email TEXT := 'akash.sarkar1489@gmail.com'; -- <--- Confirmed Email
  target_user_id UUID;
BEGIN
  -- Find the user ID from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    -- Upsert the profile (Insert if missing, Update if exists)
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (target_user_id, target_email, 'Admin User', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
    
    RAISE NOTICE 'User % has been successfully promoted to admin.', target_email;
  ELSE
    RAISE NOTICE 'User % not found in auth.users. Please sign up first.', target_email;
  END IF;
END $$;

-- 2. Verify the result
SELECT * FROM public.profiles WHERE role = 'admin';
