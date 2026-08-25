-- SQL Migration for ICST Super Admin, Permissions & Audit Logging
-- As specified in Master Engineering Instructions Section 12, 13, 14, 15

-- 1. Create custom admin permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, permission)
);

-- 2. Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL, -- e.g. 'STUDENT_REGISTER', 'ROLE_ELEVATE', 'FEE_UPDATE', 'BATCH_CREATE'
    resource_type TEXT NOT NULL, -- 'student', 'teacher', 'course', 'finance', 'scholarship', 'permission'
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create external ecosystem sites registry table (Section 17)
CREATE TABLE IF NOT EXISTS public.ecosystem_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'student_tool', -- 'student_tool', 'faculty_tool', 'public_portal'
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 1,
    icon_name TEXT DEFAULT 'IconWorld',
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Seed default ecosystem site (Job Portal Simulator)
INSERT INTO public.ecosystem_sites (name, code, url, description, category, is_active, display_order, icon_name, badge)
VALUES (
    'ICST Job Portal Simulator',
    'job_portal_simulator',
    'https://icst-job-portal-simulator.netlify.app/',
    'Interactive career & employment assessment simulation platform for ICST diploma students.',
    'student_tool',
    true,
    1,
    'IconBriefcase',
    'Recommended'
)
ON CONFLICT (code) DO UPDATE SET
    url = EXCLUDED.url,
    description = EXCLUDED.description;

-- 5. Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_sites ENABLE ROW LEVEL SECURITY;

-- 6. Policies for ecosystem_sites
CREATE POLICY "Public read for ecosystem_sites" ON public.ecosystem_sites
    FOR SELECT USING (true);

CREATE POLICY "Admin write for ecosystem_sites" ON public.ecosystem_sites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
        )
    );

-- 7. Policies for audit_logs
CREATE POLICY "Super Admins can read audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'super_admin' OR profiles.role = 'admin')
        )
    );

CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Policies for admin_permissions
CREATE POLICY "Super Admins can manage permissions" ON public.admin_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Admins can view their own permissions" ON public.admin_permissions
    FOR SELECT USING (auth.uid() = user_id);
