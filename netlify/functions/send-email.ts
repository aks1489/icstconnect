import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function htmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    };
  }

  let body: any = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
    };
  }

  const { to, subject, html, text, inReplyTo, references } = body;

  if (!to || !subject || !html) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
    };
  }

  try {
    const port = Number(process.env.SMTP_PORT) || 465;
    const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'info@icstconnect.in';
    const plainText = text || htmlToPlainText(html);
    const isTransactional = /code|otp|verify|verification|password|reset|security|alert/i.test(subject);
    const senderName = isTransactional ? 'ICST Connect Security' : 'ICST Chowberia';

    const emailHeaders: Record<string, string> = {
      'X-Mailer': 'ICST Connect Mailer',
      'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      'List-Unsubscribe': `<mailto:${senderAddress}?subject=Unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
    if (inReplyTo) emailHeaders['In-Reply-To'] = inReplyTo;
    if (references) emailHeaders['References'] = references;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '',
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderAddress}>`,
      to,
      replyTo: senderAddress,
      subject,
      text: plainText,
      html,
      headers: emailHeaders,
    });

    // Persist sent email to Supabase for the institution mailbox
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.from('institution_emails').insert({
          message_id: info.messageId,
          in_reply_to: inReplyTo || null,
          folder: 'sent',
          from_name: senderName,
          from_email: senderAddress,
          to_email: to,
          subject,
          snippet: plainText.slice(0, 160).replace(/\s+/g, ' ').trim(),
          body_html: html,
          body_text: plainText,
          has_attachments: false,
          attachments: [],
          is_read: true,
          is_starred: false,
          received_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn('[send-email] Supabase logging warning:', dbErr);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, messageId: info.messageId, message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: (error as Error).message || 'Failed to send email' }),
    };
  }
};

export { handler };
