-- DROP existing tables to ensure schema compatibility (Fixing UUID vs TEXT conflict)
-- WARNING: This will delete existing test data.
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;

-- Create Tests Table
CREATE TABLE public.tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    course_id BIGINT, -- Optional link to a course
    course_name TEXT, -- Fallback if not linked to specific ID or just category
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'medium',
    access_type TEXT CHECK (access_type IN ('public', 'private')) DEFAULT 'private',
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- Create Questions Table
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'multiple-choice',
    order_index INTEGER NOT NULL,
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Options Table
CREATE TABLE public.options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL
);

-- Create Test Results Table
CREATE TABLE public.test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if guest
    guest_info JSONB, -- { "name": "..." }
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage FLOAT NOT NULL,
    answers JSONB, -- Record of answers { question_id: option_id }
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Policies for Tests
CREATE POLICY "Public tests are viewable by everyone" ON public.tests
    FOR SELECT USING (access_type = 'public' OR auth.role() = 'authenticated');

CREATE POLICY "Admins and teachers can manage tests" ON public.tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- Policies for Questions & Options
CREATE POLICY "Questions viewable if test is viewable" ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tests
            WHERE tests.id = questions.test_id
            AND (tests.access_type = 'public' OR auth.role() = 'authenticated')
        )
    );

CREATE POLICY "Admins and teachers can manage questions" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

CREATE POLICY "Options viewable if test is viewable" ON public.options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.questions
            JOIN public.tests ON tests.id = questions.test_id
            WHERE questions.id = options.question_id
            AND (tests.access_type = 'public' OR auth.role() = 'authenticated')
        )
    );

CREATE POLICY "Admins and teachers can manage options" ON public.options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- Policies for Results
CREATE POLICY "Users can see their own results" ON public.test_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all results" ON public.test_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

CREATE POLICY "Anyone can insert results" ON public.test_results
    FOR INSERT WITH CHECK (true);
