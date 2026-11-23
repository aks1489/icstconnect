-- ==============================================================================
-- Migration: Institution Mailbox System (ICST Connect)
-- Description: Stores incoming & outgoing emails, threads, attachments and labels
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.institution_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT UNIQUE,
    in_reply_to TEXT,
    thread_id TEXT,
    folder TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'trash', 'starred', 'archive')),
    from_name TEXT,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    cc TEXT,
    bcc TEXT,
    subject TEXT NOT NULL DEFAULT '(No Subject)',
    snippet TEXT,
    body_html TEXT,
    body_text TEXT,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    labels TEXT[] DEFAULT '{}'::text[],
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Efficient indexing for mailbox queries
CREATE INDEX IF NOT EXISTS idx_institution_emails_folder ON public.institution_emails(folder);
CREATE INDEX IF NOT EXISTS idx_institution_emails_is_read ON public.institution_emails(is_read);
CREATE INDEX IF NOT EXISTS idx_institution_emails_is_starred ON public.institution_emails(is_starred);
CREATE INDEX IF NOT EXISTS idx_institution_emails_received_at ON public.institution_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_institution_emails_thread_id ON public.institution_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_institution_emails_from_email ON public.institution_emails(from_email);

-- Enable RLS
ALTER TABLE public.institution_emails ENABLE ROW LEVEL SECURITY;

-- 1. Admins and Super Admins have full access to manage emails
CREATE POLICY "Admins full access to institution emails"
    ON public.institution_emails
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role IN ('admin', 'super_admin')
        )
    );

-- 2. Service role / anon functions can insert during automated server sync
CREATE POLICY "Allow server functions to sync emails"
    ON public.institution_emails
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
