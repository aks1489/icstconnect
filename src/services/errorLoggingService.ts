/**
 * ICST Connect — Structured Error & Diagnostics Logging Service
 * Provides correlation IDs, stack capture, and user diagnostic reporting.
 */

export interface LoggedErrorPayload {
    correlationId: string
    errorCode: string
    message: string
    stack?: string
    componentStack?: string
    url: string
    userId?: string
    userRole?: string
    timestamp: string
    metadata?: Record<string, unknown>
}

export const generateCorrelationId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 7)
    return `CORR-${timestamp}-${random}`.toUpperCase()
}

export const errorLoggingService = {
    logError(error: Error | string, metadata?: Record<string, unknown>, componentStack?: string): LoggedErrorPayload {
        const correlationId = generateCorrelationId()
        const message = typeof error === 'string' ? error : error.message
        const stack = typeof error === 'string' ? undefined : error.stack

        const payload: LoggedErrorPayload = {
            correlationId,
            errorCode: (metadata?.errorCode as string) || 'ICST-SYS-001',
            message,
            stack,
            componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            timestamp: new Date().toISOString(),
            metadata
        }

        // Output structured log to console in development
        console.error('[ICST_ERROR_LOG]', payload)

        // Store latest errors in sessionStorage for user support copy/paste
        try {
            const history = JSON.parse(sessionStorage.getItem('icst_error_log_history') || '[]')
            history.unshift(payload)
            sessionStorage.setItem('icst_error_log_history', JSON.stringify(history.slice(0, 10)))
        } catch {
            // Ignore storage errors
        }

        return payload
    },

    getRecentErrors(): LoggedErrorPayload[] {
        try {
            return JSON.parse(sessionStorage.getItem('icst_error_log_history') || '[]')
        } catch {
            return []
        }
    }
}
