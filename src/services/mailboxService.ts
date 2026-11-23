import { supabase } from '../lib/supabase';

export interface MailboxMessage {
    id?: string;
    message_id: string;
    in_reply_to?: string | null;
    thread_id?: string | null;
    folder: 'inbox' | 'sent' | 'starred' | 'trash';
    from_name: string;
    from_email: string;
    to_email: string;
    subject: string;
    snippet?: string;
    body_html?: string;
    body_text?: string;
    has_attachments?: boolean;
    attachments?: Array<{
        filename: string;
        contentType?: string;
        size?: number;
    }>;
    is_read: boolean;
    is_starred: boolean;
    received_at: string;
}

export interface MailboxResponse {
    success: boolean;
    folder: string;
    total: number;
    unreadCount: number;
    messages: MailboxMessage[];
    error?: string;
}

export interface SendMailboxPayload {
    to: string;
    subject: string;
    html: string;
    text?: string;
    inReplyTo?: string;
    references?: string;
}

export const fetchMailbox = async (folder: string = 'inbox', search: string = ''): Promise<MailboxResponse> => {
    // 1. First attempt: Direct Supabase query (blazing fast, reactive across localhost & production)
    try {
        let query = supabase
            .from('institution_emails')
            .select('*')
            .order('received_at', { ascending: false });

        if (folder === 'starred') {
            query = query.eq('is_starred', true);
        } else {
            query = query.eq('folder', folder);
        }

        if (search) {
            query = query.or(`subject.ilike.%${search}%,from_name.ilike.%${search}%,from_email.ilike.%${search}%,snippet.ilike.%${search}%`);
        }

        const { data, error } = await query.limit(50);

        if (!error && data && data.length >= 0) {
            const { count: unreadCount } = await supabase
                .from('institution_emails')
                .select('*', { count: 'exact', head: true })
                .eq('folder', 'inbox')
                .eq('is_read', false);

            return {
                success: true,
                folder,
                total: data.length,
                unreadCount: unreadCount || 0,
                messages: data as MailboxMessage[],
            };
        }
    } catch (e) {
        console.warn('[mailboxService] Supabase direct query fallback:', e);
    }

    // 2. Secondary fallback: local/serverless API endpoint
    try {
        const queryParams = new URLSearchParams({ folder });
        if (search) queryParams.set('search', search);

        const res = await fetch(`/api/mailbox/messages?${queryParams.toString()}`);
        const data = await res.json();
        return data;
    } catch (err: any) {
        return {
            success: false,
            folder,
            total: 0,
            unreadCount: 0,
            messages: [],
            error: err.message || 'Failed to reach mailbox service',
        };
    }
};

export const syncMailbox = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const res = await fetch('/api/mailbox/sync', { method: 'POST' });
        const data = await res.json();
        return data;
    } catch (err: any) {
        return { success: false, error: err.message || 'Sync network error' };
    }
};

export const sendMailboxMessage = async (payload: SendMailboxPayload): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    try {
        const res = await fetch('/api/mailbox/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        return data;
    } catch (err: any) {
        return { success: false, error: err.message || 'Error dispatching message' };
    }
};

export const updateMailAction = async (
    messageId: string,
    action: 'read' | 'star' | 'trash' | 'restore' | 'delete_permanent' | 'empty_trash',
    value?: boolean
): Promise<{ success: boolean; error?: string }> => {
    // 1. Direct Supabase operation
    try {
        if (action === 'delete_permanent') {
            await supabase
                .from('institution_emails')
                .delete()
                .eq('message_id', messageId);
        } else if (action === 'empty_trash') {
            await supabase
                .from('institution_emails')
                .delete()
                .eq('folder', 'trash');
        } else {
            const updateData: Record<string, any> = {};
            if (action === 'read') updateData.is_read = value !== false;
            if (action === 'star') updateData.is_starred = value !== false;
            if (action === 'trash') updateData.folder = 'trash';
            if (action === 'restore') updateData.folder = 'inbox';

            await supabase
                .from('institution_emails')
                .update(updateData)
                .eq('message_id', messageId);
        }
    } catch (dbErr) {
        console.warn('[mailboxService] Direct update warning:', dbErr);
    }

    // 2. Secondary sync with backend server
    try {
        const res = await fetch('/api/mailbox/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, action, value }),
        });
        return await res.json();
    } catch {
        return { success: true };
    }
};

export const batchMailAction = async (
    messageIds: string[],
    action: 'read' | 'star' | 'trash' | 'restore' | 'delete_permanent',
    value?: boolean
): Promise<{ success: boolean; error?: string }> => {
    if (!messageIds || messageIds.length === 0) return { success: true };
    // 1. Direct Supabase batch execution
    try {
        if (action === 'delete_permanent') {
            await supabase
                .from('institution_emails')
                .delete()
                .in('message_id', messageIds);
        } else {
            const updateData: Record<string, any> = {};
            if (action === 'read') updateData.is_read = value !== false;
            if (action === 'star') updateData.is_starred = value !== false;
            if (action === 'trash') updateData.folder = 'trash';
            if (action === 'restore') updateData.folder = 'inbox';

            await supabase
                .from('institution_emails')
                .update(updateData)
                .in('message_id', messageIds);
        }
    } catch (dbErr) {
        console.warn('[mailboxService] batch direct update warning:', dbErr);
    }

    // 2. Parallel individual sync for server fallback
    try {
        await Promise.allSettled(messageIds.map(id => updateMailAction(id, action, value)));
    } catch {
        // Fallback gracefully
    }
    return { success: true };
};

/**
 * Real-time Postgres subscription to institution_emails table.
 * Automatically notifies callback when any email arrives, changes folder, or updates read/star state.
 */
export const subscribeToMailboxChanges = (onUpdate: (payload: any) => void) => {
    const channel = supabase
        .channel('institution_emails_realtime_' + Math.random().toString(36).substring(2, 7))
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'institution_emails' },
            (payload) => {
                onUpdate(payload);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};
