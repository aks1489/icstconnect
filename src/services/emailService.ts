
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const sendCustomEmail = async ({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email');
        }

        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: (error as Error).message };
    }
};
