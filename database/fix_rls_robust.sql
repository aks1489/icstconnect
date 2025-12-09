-- Robust Fix for RLS Policies
-- This script drops existing policies before creating new ones to avoid "already exists" errors.

-- 1. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
-- (Add course_topics if needed)
-- ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;

-- 2. Policies for 'courses'
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
CREATE POLICY "Enable read access for all users" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for admins only" ON public.courses;
CREATE POLICY "Enable insert for admins only" ON public.courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Enable update for admins only" ON public.courses;
CREATE POLICY "Enable update for admins only" ON public.courses FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Enable delete for admins only" ON public.courses;
CREATE POLICY "Enable delete for admins only" ON public.courses FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Policies for 'enrollments'
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments" ON public.enrollments FOR SELECT USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Teachers update progress" ON public.enrollments;
CREATE POLICY "Teachers update progress" ON public.enrollments FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- 4. Policies for 'classes'
DROP POLICY IF EXISTS "Authenticated users view classes" ON public.classes;
CREATE POLICY "Authenticated users view classes" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage classes" ON public.classes;
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Policies for 'attendance'
DROP POLICY IF EXISTS "View attendance" ON public.attendance;
CREATE POLICY "View attendance" ON public.attendance FOR SELECT USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

DROP POLICY IF EXISTS "Teachers/Admins take attendance" ON public.attendance;
CREATE POLICY "Teachers/Admins take attendance" ON public.attendance FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- 6. Policies for 'course_topics' (Addressing your error)
-- Only creating if the table exists (commented out safety, but assuming it exists based on error)
DROP POLICY IF EXISTS "Public read for course_topics" ON public.course_topics;
CREATE POLICY "Public read for course_topics" ON public.course_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage course_topics" ON public.course_topics;
CREATE POLICY "Admin manage course_topics" ON public.course_topics FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Fix function security
ALTER FUNCTION public.handle_new_user() SET search_path = public;
