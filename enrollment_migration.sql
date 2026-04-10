-- Create enrollment applications table
CREATE TABLE public.enrollment_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_id text NOT NULL UNIQUE,
    student_id uuid REFERENCES auth.users(id),
    full_name text NOT NULL,
    phone text NOT NULL,
    email text,
    gender text NOT NULL,
    dob date,
    pincode text NOT NULL,
    state text NOT NULL,
    district text NOT NULL,
    post_office text NOT NULL,
    address text NOT NULL,
    course_id bigint REFERENCES public.courses(id) NOT NULL,
    payment_plan text NOT NULL,
    opt_spoken_english boolean DEFAULT false,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.enrollment_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (guests filling the form)
CREATE POLICY "Allow public insert to enrollment_applications" ON public.enrollment_applications
    FOR INSERT WITH CHECK (true);

-- Allow authenticated admins to view/update applications
-- (Assuming admins have a role='admin' in profiles table)
CREATE POLICY "Allow admins to read enrollment_applications" ON public.enrollment_applications
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admins to update enrollment_applications" ON public.enrollment_applications
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also allow teachers or other administrative roles if necessary
