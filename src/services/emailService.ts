export interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    message?: string;
    error?: string;
}

export interface SmtpVerifyResult {
    success: boolean;
    message?: string;
    host?: string;
    port?: number;
    user?: string;
    error?: string;
}

/**
 * Universal email dispatcher for ICST Connect.
 * Uses relative `/api/send-email` which routes to:
 * - Vite dev server API middleware (in local dev & LAN)
 * - Netlify serverless function (in production)
 */
export const sendEmail = async ({ to, subject, html }: SendEmailPayload): Promise<SendEmailResult> => {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
            const errorMsg = data.error || data.message || `HTTP ${response.status}: Failed to send email`;
            console.error('[emailService] Dispatch error:', errorMsg);
            return { success: false, error: errorMsg };
        }

        return {
            success: true,
            messageId: data.messageId,
            message: data.message || 'Email sent successfully'
        };
    } catch (error: any) {
        console.error('[emailService] Network error:', error);
        return {
            success: false,
            error: error.message || 'Network error connecting to email service'
        };
    }
};

/**
 * Verifies live SMTP credentials and server connectivity.
 */
export const verifySmtpConnection = async (): Promise<SmtpVerifyResult> => {
    try {
        const response = await fetch('/api/smtp-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
            return {
                success: false,
                error: data.error || `HTTP ${response.status}: SMTP verification failed`
            };
        }

        return {
            success: true,
            message: data.message || 'SMTP verified successfully',
            host: data.host,
            port: data.port,
            user: data.user
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Unable to reach SMTP relay endpoint'
        };
    }
};

/**
 * Backward compatibility alias for legacy call sites.
 */
export const sendCustomEmail = sendEmail;
