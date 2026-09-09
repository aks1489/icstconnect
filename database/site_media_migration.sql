-- SQL Migration for ICST Central Media Registry
-- In accordance with upgrade.md Section 28

CREATE TABLE IF NOT EXISTS public.site_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    cloudinary_url TEXT NOT NULL,
    public_id TEXT,
    alt_text TEXT NOT NULL,
    placement TEXT NOT NULL,
    theme TEXT DEFAULT 'all', -- 'light', 'dark', 'all'
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default entries
INSERT INTO public.site_media (key, title, cloudinary_url, alt_text, placement, is_active)
VALUES 
(
    'home.hero.background',
    'ICST Main Campus Hero',
    'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop',
    'ICST Institutional Academic Campus',
    'home_hero',
    true
),
(
    'home.scholarship.banner',
    'Annual Merit Scholarship Banner',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop',
    'Students participating in ICST Scholarship Programs',
    'scholarship_page',
    true
),
(
    'login.background',
    'Authentication Backdrop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920&auto=format&fit=crop',
    'Modern tech laboratory with workstations',
    'auth_portal',
    true
)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for site_media" ON public.site_media
    FOR SELECT USING (is_active = true);

CREATE POLICY "Staff admin manage site_media" ON public.site_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );
