-- SQL Migration for ICST Scholarships Module
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor) to set up tables, default settings, and RLS policies.

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS public.scholarship_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_enabled BOOLEAN DEFAULT TRUE,
    banner_enabled BOOLEAN DEFAULT TRUE,
    banner_image TEXT DEFAULT 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
    banner_redirect_enabled BOOLEAN DEFAULT TRUE,
    banner_redirect_url TEXT DEFAULT 'https://icst-isms.netlify.app/',
    result_enabled BOOLEAN DEFAULT TRUE,
    result_url TEXT DEFAULT 'https://icst-isms.netlify.app/',
    result_button_text TEXT DEFAULT 'View Scholarship Result',
    homepage_promotion_enabled BOOLEAN DEFAULT TRUE,
    navigation_enabled BOOLEAN DEFAULT TRUE,
    scholarship_page_enabled BOOLEAN DEFAULT TRUE,
    winners_gallery_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Scholarship Campaigns / Exams
CREATE TABLE IF NOT EXISTS public.scholarship_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INT NOT NULL,
    session TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Registered Schools Directory (Reusable across multiple scholarship years)
CREATE TABLE IF NOT EXISTS public.scholarship_schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- School Participation in a Scholarship (linking School with Campaign & Setting Winner Announcement Date & Time)
CREATE TABLE IF NOT EXISTS public.scholarship_school_participations (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT NOT NULL REFERENCES public.scholarship_campaigns(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL REFERENCES public.scholarship_schools(id) ON DELETE CASCADE,
    announcement_date TIMESTAMP WITH TIME ZONE,
    is_announced_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(scholarship_id, school_id)
);

-- Scholarship Position Holders / Winners
CREATE TABLE IF NOT EXISTS public.scholarship_winners (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT,
    school_id TEXT,
    year INT NOT NULL,
    rank INT NOT NULL,
    student_name TEXT NOT NULL,
    school_name TEXT NOT NULL,
    district TEXT,
    marks TEXT NOT NULL,
    photo TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 1,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure foreign columns exist if scholarship_winners already existed
ALTER TABLE public.scholarship_winners ADD COLUMN IF NOT EXISTS scholarship_id TEXT;
ALTER TABLE public.scholarship_winners ADD COLUMN IF NOT EXISTS school_id TEXT;

-- Scholarship Examination Photos / Gallery
CREATE TABLE IF NOT EXISTS public.scholarship_exam_images (
    id TEXT PRIMARY KEY,
    scholarship_id TEXT,
    title TEXT NOT NULL,
    school_name TEXT NOT NULL,
    session TEXT NOT NULL,
    year INT NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Insert Default Settings Row if empty
INSERT INTO public.scholarship_settings (
    master_enabled, banner_enabled, banner_image, banner_redirect_enabled, banner_redirect_url,
    result_enabled, result_url, result_button_text, homepage_promotion_enabled, navigation_enabled,
    scholarship_page_enabled, winners_gallery_enabled
)
SELECT true, true, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80', true, 'https://icst-isms.netlify.app/',
       true, 'https://icst-isms.netlify.app/', 'View Scholarship Result', true, true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.scholarship_settings);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.scholarship_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_school_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_exam_images ENABLE ROW LEVEL SECURITY;

-- 4. Safely Drop Existing Policies (idempotent)
DO $$
BEGIN
    -- Settings
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_settings' AND policyname = 'Public read scholarship_settings') THEN
        DROP POLICY "Public read scholarship_settings" ON public.scholarship_settings;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_settings' AND policyname = 'Admin write scholarship_settings') THEN
        DROP POLICY "Admin write scholarship_settings" ON public.scholarship_settings;
    END IF;

    -- Campaigns
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_campaigns' AND policyname = 'Public read scholarship_campaigns') THEN
        DROP POLICY "Public read scholarship_campaigns" ON public.scholarship_campaigns;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_campaigns' AND policyname = 'Admin write scholarship_campaigns') THEN
        DROP POLICY "Admin write scholarship_campaigns" ON public.scholarship_campaigns;
    END IF;

    -- Schools
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_schools' AND policyname = 'Public read scholarship_schools') THEN
        DROP POLICY "Public read scholarship_schools" ON public.scholarship_schools;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_schools' AND policyname = 'Admin write scholarship_schools') THEN
        DROP POLICY "Admin write scholarship_schools" ON public.scholarship_schools;
    END IF;

    -- Participations
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_school_participations' AND policyname = 'Public read scholarship_school_participations') THEN
        DROP POLICY "Public read scholarship_school_participations" ON public.scholarship_school_participations;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_school_participations' AND policyname = 'Admin write scholarship_school_participations') THEN
        DROP POLICY "Admin write scholarship_school_participations" ON public.scholarship_school_participations;
    END IF;

    -- Winners
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_winners' AND policyname = 'Public read scholarship_winners') THEN
        DROP POLICY "Public read scholarship_winners" ON public.scholarship_winners;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_winners' AND policyname = 'Admin write scholarship_winners') THEN
        DROP POLICY "Admin write scholarship_winners" ON public.scholarship_winners;
    END IF;

    -- Exam Images
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_exam_images' AND policyname = 'Public read scholarship_exam_images') THEN
        DROP POLICY "Public read scholarship_exam_images" ON public.scholarship_exam_images;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_exam_images' AND policyname = 'Admin write scholarship_exam_images') THEN
        DROP POLICY "Admin write scholarship_exam_images" ON public.scholarship_exam_images;
    END IF;
END $$;

-- 5. Create Policies (Public read for all users, write access for authenticated users & admins)
CREATE POLICY "Public read scholarship_settings" ON public.scholarship_settings FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_campaigns" ON public.scholarship_campaigns FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_schools" ON public.scholarship_schools FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_school_participations" ON public.scholarship_school_participations FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_winners" ON public.scholarship_winners FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_exam_images" ON public.scholarship_exam_images FOR SELECT USING (true);

CREATE POLICY "Admin write scholarship_settings" ON public.scholarship_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_campaigns" ON public.scholarship_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_schools" ON public.scholarship_schools FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_school_participations" ON public.scholarship_school_participations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_winners" ON public.scholarship_winners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_exam_images" ON public.scholarship_exam_images FOR ALL USING (auth.role() = 'authenticated');
