import { supabase } from '../lib/supabase'

export interface AuditLogEntry {
    id?: string
    user_id?: string | null
    user_email?: string | null
    user_role?: string | null
    action: string
    resource_type: string
    resource_id?: string | null
    details?: Record<string, unknown>
    ip_address?: string | null
    user_agent?: string | null
    created_at?: string
}

export const auditService = {
    async logAction(entry: AuditLogEntry): Promise<void> {
        try {
            const user = (await supabase.auth.getUser()).data.user
            const payload = {
                ...entry,
                user_id: entry.user_id || user?.id || null,
                user_email: entry.user_email || user?.email || null,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                created_at: new Date().toISOString()
            }

            await supabase.from('audit_logs').insert([payload])
        } catch (err) {
            console.warn('[AUDIT_LOG_ERROR] Failed to persist audit log:', err)
        }
    },

    async getRecentLogs(limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.warn('Failed to fetch audit logs:', error)
            return []
        }

        return data as AuditLogEntry[]
    }
}
