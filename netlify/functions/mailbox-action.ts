import { Handler } from '@netlify/functions';
import { ImapFlow } from 'imapflow';
import { createClient } from '@supabase/supabase-js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const normId = (id: string) => (id || '').replace(/^<|>$/g, '').trim().toLowerCase();

async function getTrashMailbox(client: ImapFlow): Promise<string> {
  try {
    const mailboxes = await client.list();
    const trash = mailboxes.find((m) => m.specialUse === '\\Trash');
    if (trash) return trash.path;
  } catch {}
  return '[Gmail]/Bin';
}

async function executeImapAction(action: string, messageId: string) {
  const imapHost = process.env.IMAP_HOST || 'imap.gmail.com';
  const imapPort = parseInt(process.env.IMAP_PORT || '993', 10);
  const imapUser = process.env.IMAP_USER || process.env.SMTP_USER || 'info@icstconnect.in';
  const imapPass = (process.env.IMAP_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!imapUser || !imapPass) return;

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: { user: imapUser, pass: imapPass },
    logger: false,
  });

  try {
    const targetNorm = normId(messageId);
    await client.connect();
    const trashFolder = await getTrashMailbox(client);

    if (action === 'trash') {
      const lock = await client.getMailboxLock('INBOX');
      try {
        if (client.mailbox && client.mailbox.exists > 0) {
          for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
            if (normId(msg.envelope?.messageId) === targetNorm) {
              await client.messageMove(String(msg.uid), trashFolder, { uid: true });
              break;
            }
          }
        }
      } finally {
        lock.release();
      }
    } else if (action === 'restore') {
      const lock = await client.getMailboxLock(trashFolder);
      try {
        if (client.mailbox && client.mailbox.exists > 0) {
          for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
            if (normId(msg.envelope?.messageId) === targetNorm) {
              await client.messageMove(String(msg.uid), 'INBOX', { uid: true });
              break;
            }
          }
        }
      } finally {
        lock.release();
      }
    } else if (action === 'delete_permanent') {
      let deleted = false;
      const binLock = await client.getMailboxLock(trashFolder);
      try {
        if (client.mailbox && client.mailbox.exists > 0) {
          for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
            if (normId(msg.envelope?.messageId) === targetNorm) {
              await client.messageDelete(String(msg.uid), { uid: true });
              deleted = true;
              break;
            }
          }
        }
      } finally {
        binLock.release();
      }

      // Step 2: Also check INBOX
      if (!deleted) {
        const inboxLock = await client.getMailboxLock('INBOX');
        try {
          if (client.mailbox && client.mailbox.exists > 0) {
            for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
              if (normId(msg.envelope?.messageId) === targetNorm) {
                await client.messageDelete(String(msg.uid), { uid: true });
                deleted = true;
                break;
              }
            }
          }
        } finally {
          inboxLock.release();
        }
      }

      // Step 3: Check [Gmail]/All Mail to ensure 100% expunged on Google Workspace
      try {
        const allLock = await client.getMailboxLock('[Gmail]/All Mail');
        try {
          if (client.mailbox && client.mailbox.exists > 0) {
            for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
              if (normId(msg.envelope?.messageId) === targetNorm) {
                await client.messageDelete(String(msg.uid), { uid: true });
                break;
              }
            }
          }
        } finally {
          allLock.release();
        }
      } catch (allErr: any) {
        console.warn('[Netlify mailbox-action All Mail warning]:', allErr.message);
      }
    } else if (action === 'empty_trash') {
      const lock = await client.getMailboxLock(trashFolder);
      try {
        const total = client.mailbox?.exists || 0;
        if (total > 0) {
          await client.messageDelete('1:*');
        }
      } finally {
        lock.release();
      }
    }

    await client.logout();
  } catch (err: any) {
    if (client) {
      try { await client.logout(); } catch {}
    }
    console.warn('[Netlify mailbox-action IMAP warning]:', err.message);
  }
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

  const { messageId, action, value } = body;
  if (!action) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'action required' }),
    };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

  try {
    if (action === 'delete_permanent') {
      if (!messageId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'messageId required' }),
        };
      }
      if (supabase) {
        await supabase
          .from('institution_emails')
          .delete()
          .eq('message_id', messageId);
      }
      await executeImapAction('delete_permanent', messageId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Message permanently deleted' }),
      };
    }

    if (action === 'empty_trash') {
      if (supabase) {
        await supabase
          .from('institution_emails')
          .delete()
          .eq('folder', 'trash');
      }
      await executeImapAction('empty_trash', 'all');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Trash emptied permanently' }),
      };
    }

    if (!messageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'messageId required' }),
      };
    }

    const updateData: Record<string, any> = {};
    if (action === 'read') updateData.is_read = value !== false;
    if (action === 'star') updateData.is_starred = value !== false;
    if (action === 'trash') updateData.folder = 'trash';
    if (action === 'restore') updateData.folder = 'inbox';

    if (supabase) {
      await supabase
        .from('institution_emails')
        .update(updateData)
        .eq('message_id', messageId);
    }

    if (action === 'trash' || action === 'restore') {
      await executeImapAction(action, messageId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: `Action ${action} updated` }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || 'Action failed' }),
    };
  }
};

export { handler };
