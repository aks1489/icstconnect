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

const normId = (id: string) => (id || '').replace(/^<|>$/g, '').trim().toLowerCase();

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

async function getTrashMailbox(client: ImapFlow): Promise<string> {
  try {
    const mailboxes = await client.list();
    const trash = mailboxes.find((m) => m.specialUse === '\\Trash');
    if (trash) return trash.path;
  } catch {}
  return '[Gmail]/Bin';
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

  // Pre-load existing folders so sync NEVER reverts trashed/starred messages back to inbox
  const existingMap = new Map<string, string>();
  const supabaseInboxRows: Array<{ message_id: string; folder: string }> = [];
  if (supabase) {
    try {
      const { data: existingRows } = await supabase
        .from('institution_emails')
        .select('message_id, folder');
      if (existingRows) {
        existingRows.forEach((r) => {
          existingMap.set(r.message_id, r.folder);
          existingMap.set(normId(r.message_id), r.folder);
          if (r.folder === 'inbox') {
            supabaseInboxRows.push(r);
          }
        });
      }
    } catch (e) {
      console.warn('[mailbox-sync] Supabase pre-load warning:', e);
    }
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
    const trashFolder = await getTrashMailbox(client);
    const lock = await client.getMailboxLock('INBOX');
    let syncedCount = 0;
    const gmailInboxIds = new Set<string>();

    try {
      const mailboxStatus = client.mailbox;
      const totalMessages = (typeof mailboxStatus === 'object' && mailboxStatus && 'exists' in mailboxStatus)
        ? (mailboxStatus.exists as number)
        : 0;

      if (totalMessages > 0) {
        const fetchRange = `${Math.max(1, totalMessages - 49)}:*`;
        const messagesStream = client.fetch(fetchRange, {
          envelope: true,
          source: true,
          flags: true,
          uid: true,
        });

        for await (const msg of messagesStream) {
          try {
            const parsed = await simpleParser(msg.source);
            const messageId = parsed.messageId || msg.envelope?.messageId || `msg-${msg.uid}`;
            const currentNormId = normId(messageId);
            const envNormId = normId(msg.envelope?.messageId || '');

            gmailInboxIds.add(currentNormId);
            if (envNormId) gmailInboxIds.add(envNormId);
            gmailInboxIds.add(String(msg.uid));

            let targetFolder = 'inbox';
            if (existingMap.has(messageId)) {
              targetFolder = existingMap.get(messageId)!;
            } else if (existingMap.has(currentNormId)) {
              targetFolder = existingMap.get(currentNormId)!;
            }

            // If message is in Trash in DB, move it to Gmail Bin/Trash on IMAP and never upsert as inbox
            if (targetFolder === 'trash') {
              try {
                await client.messageMove(String(msg.uid), trashFolder, { uid: true });
                console.log(`[sync] Moved trashed message UID ${msg.uid} to ${trashFolder}`);
              } catch {}
              continue;
            }

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
              folder: targetFolder,
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
              is_starred: targetFolder === 'starred',
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

    // Reverse sync check for Netlify function
    const missingFromInbox = supabaseInboxRows.filter((r) => {
      const nid = normId(r.message_id);
      return !gmailInboxIds.has(nid) && !gmailInboxIds.has(r.message_id);
    });

    if (missingFromInbox.length > 0 && supabase) {
      console.log(`[Netlify reverse-sync] ${missingFromInbox.length} messages missing from Gmail INBOX`);
      for (const missing of missingFromInbox) {
        try {
          await supabase
            .from('institution_emails')
            .update({ folder: 'trash' })
            .eq('message_id', missing.message_id);
        } catch {}
      }
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
