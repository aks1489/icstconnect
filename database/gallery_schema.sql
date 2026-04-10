-- ==============================================================================
-- Gallery Schema Update
-- ==============================================================================
-- Adds tables to support the dynamic Image Gallery with custom styling and tagging.
-- Run this in your Supabase SQL Editor.

-- 1. Create Gallery Categories Table
CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    layout_style TEXT DEFAULT 'collage' CHECK (layout_style IN ('curve_road', 'collage', 'scatter_3d', 'bento_flow')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Categories
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access to Categories
CREATE POLICY "Allow public read access on gallery_categories" 
    ON public.gallery_categories FOR SELECT 
    USING (true);

-- Allow Admin Write Access to Categories (Assuming typical Role 'admin', adjust if needed)
CREATE POLICY "Allow admin write access on gallery_categories" 
    ON public.gallery_categories FOR ALL 
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Insert Default Categories
INSERT INTO public.gallery_categories (name, layout_style) VALUES
    ('All', 'bento_flow'), -- 'All' is a special aggregator, but having it here doesn't hurt.
    ('Campus', 'bento_flow'),
    ('Events', 'curve_road'),
    ('Students', 'collage')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cloudinary_url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    categories UUID[] DEFAULT '{}', -- Array of category IDs
    event_name TEXT,
    event_date DATE,
    group_cover BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb, -- Array of object: { x: number, y: number, label: text, description: text }
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for Images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access to Images
CREATE POLICY "Allow public read access on gallery_images" 
    ON public.gallery_images FOR SELECT 
    USING (true);

-- Allow Admin Write Access to Images
CREATE POLICY "Allow admin write access on gallery_images" 
    ON public.gallery_images FOR ALL 
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
