-- ==============================================================================
-- Fix RLS Policies for gallery_images and gallery_categories
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- Supabase Dashboard > SQL Editor > New Query > Paste & Run
--
-- ROOT CAUSE:
-- The original policy on gallery_images and gallery_categories only checked 
-- (role = 'admin'), which blocked 'super_admin' users from uploading or editing photos.
-- This script updates the policies so both 'admin' and 'super_admin' roles have
-- full permissions.
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is active
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy restrictive policies
DROP POLICY IF EXISTS "Allow public read access on gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin write access on gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Admin write for gallery_categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Allow admin and super_admin write access on gallery_categories" ON public.gallery_categories;

DROP POLICY IF EXISTS "Allow public read access on gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin write access on gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admin write for gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow admin and super_admin write access on gallery_images" ON public.gallery_images;

-- 3. Public Read Policies (all users can view the gallery)
CREATE POLICY "Allow public read access on gallery_categories" 
    ON public.gallery_categories FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access on gallery_images" 
    ON public.gallery_images FOR SELECT 
    USING (true);

-- 4. Admin and Super Admin Write Policies for gallery_categories
CREATE POLICY "Allow admin and super_admin write access on gallery_categories" 
    ON public.gallery_categories FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 5. Admin and Super Admin Write Policies for gallery_images
CREATE POLICY "Allow admin and super_admin write access on gallery_images" 
    ON public.gallery_images FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

COMMIT;
