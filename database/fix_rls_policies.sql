-- 1. Enable RLS on tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 2. Policies for 'courses'
-- everyone can read courses
CREATE POLICY "Enable read access for all users" ON public.courses
    FOR SELECT USING (true);

-- only admins can modify
CREATE POLICY "Enable insert for admins only" ON public.courses
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Enable update for admins only" ON public.courses
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Enable delete for admins only" ON public.courses
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Policies for 'enrollments'
-- Students view own, Teachers/Admins view all
CREATE POLICY "Students view own enrollments" ON public.enrollments
    FOR SELECT USING (
        student_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- Admins can insert/delete
CREATE POLICY "Admins manage enrollments" ON public.enrollments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can update progress
CREATE POLICY "Teachers update progress" ON public.enrollments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    );

-- 4. Policies for 'classes' (Calendar/Schedule)
-- Authenticated users can read
CREATE POLICY "Authenticated users view classes" ON public.classes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins manage classes
CREATE POLICY "Admins manage classes" ON public.classes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 5. Policies for 'attendance'
CREATE POLICY "View attendance" ON public.attendance
    FOR SELECT USING (
        student_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

CREATE POLICY "Teachers/Admins take attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
    );

-- 6. Fix function search path (Function Search Path Mutable warning)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
