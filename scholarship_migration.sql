-- SQL Migration for ICST Scholarships Module

-- 1. Create Tables
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

CREATE TABLE IF NOT EXISTS public.scholarship_winners (
    id TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS public.scholarship_exam_images (
    id TEXT PRIMARY KEY,
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
ALTER TABLE public.scholarship_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_exam_images ENABLE ROW LEVEL SECURITY;

-- 4. Safely Drop Existing Policies (wrapped in DO block for 100% idempotency)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_settings' AND policyname = 'Public read scholarship_settings') THEN
        DROP POLICY "Public read scholarship_settings" ON public.scholarship_settings;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_settings' AND policyname = 'Admin write scholarship_settings') THEN
        DROP POLICY "Admin write scholarship_settings" ON public.scholarship_settings;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_winners' AND policyname = 'Public read scholarship_winners') THEN
        DROP POLICY "Public read scholarship_winners" ON public.scholarship_winners;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_winners' AND policyname = 'Admin write scholarship_winners') THEN
        DROP POLICY "Admin write scholarship_winners" ON public.scholarship_winners;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_exam_images' AND policyname = 'Public read scholarship_exam_images') THEN
        DROP POLICY "Public read scholarship_exam_images" ON public.scholarship_exam_images;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scholarship_exam_images' AND policyname = 'Admin write scholarship_exam_images') THEN
        DROP POLICY "Admin write scholarship_exam_images" ON public.scholarship_exam_images;
    END IF;
END $$;

-- 5. Create Policies
CREATE POLICY "Public read scholarship_settings" ON public.scholarship_settings FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_winners" ON public.scholarship_winners FOR SELECT USING (true);
CREATE POLICY "Public read scholarship_exam_images" ON public.scholarship_exam_images FOR SELECT USING (true);

CREATE POLICY "Admin write scholarship_settings" ON public.scholarship_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_winners" ON public.scholarship_winners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write scholarship_exam_images" ON public.scholarship_exam_images FOR ALL USING (auth.role() = 'authenticated');
