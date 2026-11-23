import { Handler } from '@netlify/functions';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

function htmlToPlainText(html?: string): string {
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

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

  const imapHost = process.env.IMAP_HOST || 'imap.gmail.com';
  const imapPort = parseInt(process.env.IMAP_PORT || '993', 10);
  const imapUser = process.env.IMAP_USER || process.env.SMTP_USER || 'info@icstconnect.in';
  const imapPass = (process.env.IMAP_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!imapUser || !imapPass) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'IMAP credentials not configured on server' }),
    };
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: {
      user: imapUser,
      pass: imapPass,
    },
    logger: false,
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    let syncedCount = 0;

    try {
      const mailboxStatus = client.mailbox;
      const totalMessages = (typeof mailboxStatus === 'object' && mailboxStatus && 'exists' in mailboxStatus)
        ? (mailboxStatus.exists as number)
        : 0;

      if (totalMessages > 0) {
        const fetchRange = `${Math.max(1, totalMessages - 29)}:*`;
        const messagesStream = client.fetch(fetchRange, {
          envelope: true,
          source: true,
          flags: true,
          uid: true,
        });

        for await (const msg of messagesStream) {
          try {
            const parsed = await simpleParser(msg.source);
            const messageId = parsed.messageId || `msg-${msg.uid}-${Date.now()}`;
            const fromAddress = parsed.from?.value?.[0]?.address || 'unknown@domain.com';
            const fromName = parsed.from?.value?.[0]?.name || fromAddress.split('@')[0];
            const toAddress = Array.isArray(parsed.to)
              ? parsed.to.map((t) => t.text).join(', ')
              : (parsed.to?.text || imapUser);

            const subject = parsed.subject || '(No Subject)';
            const bodyHtml = parsed.html || parsed.textAsHtml || `<p>${parsed.text || ''}</p>`;
            const bodyText = parsed.text || htmlToPlainText(parsed.html);
            const snippet = bodyText.slice(0, 160).replace(/\s+/g, ' ').trim();
            const receivedAt = parsed.date || new Date();
            const isRead = msg.flags?.has('\\Seen') || false;

            const emailRecord = {
              message_id: messageId,
              in_reply_to: parsed.inReplyTo || null,
              folder: 'inbox',
              from_name: fromName,
              from_email: fromAddress,
              to_email: toAddress,
              subject,
              snippet,
              body_html: bodyHtml,
              body_text: bodyText,
              has_attachments: (parsed.attachments && parsed.attachments.length > 0) || false,
              attachments: (parsed.attachments || []).map((att) => ({
                filename: att.filename || 'attachment',
                contentType: att.contentType,
                size: att.size,
              })),
              is_read: isRead,
              is_starred: false,
              received_at: receivedAt.toISOString(),
            };

            if (supabase) {
              await supabase
                .from('institution_emails')
                .upsert(emailRecord, { onConflict: 'message_id' });
            }

            syncedCount++;
          } catch (parseErr) {
            console.warn('[mailbox-sync] Error parsing message uid', msg.uid, parseErr);
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        syncedCount,
        message: `Successfully synchronized ${syncedCount} messages from IMAP`,
      }),
    };
  } catch (error) {
    console.error('Mailbox sync error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: (error as Error).message || 'Failed to synchronize mailbox from IMAP',
      }),
    };
  }
};

export { handler };
