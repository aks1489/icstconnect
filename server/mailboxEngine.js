import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

dotenv.config()

// Lazy Supabase client factory
let _supabase = null
export const getSupabaseClient = () => {
    if (!_supabase) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
        if (supabaseUrl && supabaseAnonKey) {
            _supabase = createClient(supabaseUrl, supabaseAnonKey)
        }
    }
    return _supabase
}

// In-memory fallback message cache if Supabase table is pending or inaccessible
export const inMemoryMailbox = new Map()
export const permanentlyDeletedIds = new Set()

export const normId = (id) => (id || '').replace(/^<|>$/g, '').trim().toLowerCase()

export const getTransporter = () => {
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : ''
        }
    })
}

export const getImapClient = () => {
    return new ImapFlow({
        host: process.env.IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_PORT || '993', 10),
        secure: true,
        auth: {
            user: process.env.IMAP_USER || process.env.SMTP_USER,
            pass: (process.env.IMAP_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '')
        },
        logger: false
    })
}

// Cached Gmail special folder paths
export const resolvedFolders = {
    inbox: 'INBOX',
    trash: '[Gmail]/Bin',
    all: '[Gmail]/All Mail',
    sent: '[Gmail]/Sent Mail',
    starred: '[Gmail]/Starred'
}

let foldersDetected = false
export async function detectGmailFolders(client) {
    if (foldersDetected) return resolvedFolders
    try {
        const list = await client.list()
        for (const m of list) {
            if (m.specialUse === '\\Trash') resolvedFolders.trash = m.path
            else if (m.specialUse === '\\All') resolvedFolders.all = m.path
            else if (m.specialUse === '\\Sent') resolvedFolders.sent = m.path
            else if (m.specialUse === '\\Flagged') resolvedFolders.starred = m.path
        }
        foldersDetected = true
    } catch (e) {
        console.warn('[mailboxEngine] Folder detection fallback to defaults:', e.message)
    }
    return resolvedFolders
}

export function htmlToPlainText(html) {
    if (!html) return ''
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
        .trim()
}

/**
 * Helper to find a message inside currently locked mailbox
 */
async function findMessageInMailbox(client, targetMessageId) {
    if (!client.mailbox || (client.mailbox.exists || 0) === 0) return null

    const targetNorm = normId(targetMessageId)
    const uidFromMsgId = targetMessageId?.startsWith('msg-') ? targetMessageId.replace(/^msg-/, '') : null
    const total = client.mailbox.exists || 0
    const range = total > 100 ? `${total - 99}:*` : '1:*'

    for await (const msg of client.fetch(range, { envelope: true, uid: true })) {
        const envNorm = normId(msg.envelope?.messageId)
        if (envNorm === targetNorm || (uidFromMsgId && String(msg.uid) === uidFromMsgId)) {
            return msg
        }
    }
    return null
}

// ==============================================================================
// 1. EXECUTE IMAP ACTION (Trash, Restore, Delete Permanent, Empty Trash, Read, Star)
// ==============================================================================
export async function executeImapAction(action, messageId, value = true) {
    let client = null
    const targetNorm = normId(messageId)

    try {
        client = getImapClient()
        await client.connect()
        await detectGmailFolders(client)

        const trashFolder = resolvedFolders.trash || '[Gmail]/Bin'
        const allMailFolder = resolvedFolders.all || '[Gmail]/All Mail'

        if (action === 'trash') {
            let moved = false
            // 1. First look in INBOX
            const inboxLock = await client.getMailboxLock('INBOX')
            try {
                const msg = await findMessageInMailbox(client, messageId)
                if (msg) {
                    try {
                        await client.messageMove(String(msg.uid), trashFolder, { uid: true })
                        console.log(`[mailboxEngine] Moved UID ${msg.uid} from INBOX to ${trashFolder}`)
                        moved = true
                    } catch (moveErr) {
                        // Fallback to alternate trash name if required
                        const altTrash = trashFolder === '[Gmail]/Bin' ? '[Gmail]/Trash' : '[Gmail]/Bin'
                        await client.messageMove(String(msg.uid), altTrash, { uid: true })
                        console.log(`[mailboxEngine] Moved UID ${msg.uid} to alternate ${altTrash}`)
                        moved = true
                    }
                }
            } finally {
                inboxLock.release()
            }

            // 2. If not found in INBOX, check [Gmail]/All Mail
            if (!moved) {
                try {
                    const allLock = await client.getMailboxLock(allMailFolder)
                    try {
                        const msg = await findMessageInMailbox(client, messageId)
                        if (msg) {
                            await client.messageMove(String(msg.uid), trashFolder, { uid: true })
                            console.log(`[mailboxEngine] Moved UID ${msg.uid} from All Mail to ${trashFolder}`)
                        }
                    } finally {
                        allLock.release()
                    }
                } catch (allErr) {
                    console.warn('[mailboxEngine] All Mail check error:', allErr.message)
                }
            }
        } else if (action === 'restore') {
            const trashLock = await client.getMailboxLock(trashFolder)
            try {
                const msg = await findMessageInMailbox(client, messageId)
                if (msg) {
                    await client.messageMove(String(msg.uid), 'INBOX', { uid: true })
                    console.log(`[mailboxEngine] Restored UID ${msg.uid} from ${trashFolder} to INBOX`)
                }
            } finally {
                trashLock.release()
            }
        } else if (action === 'delete_permanent') {
            permanentlyDeletedIds.add(messageId)
            permanentlyDeletedIds.add(targetNorm)

            // Step 1: Delete and expunge from [Gmail]/Bin
            let deletedFromBin = false
            try {
                const binLock = await client.getMailboxLock(trashFolder)
                try {
                    const msg = await findMessageInMailbox(client, messageId)
                    if (msg) {
                        await client.messageDelete(String(msg.uid), { uid: true })
                        console.log(`[mailboxEngine] Expunged UID ${msg.uid} permanently from ${trashFolder}`)
                        deletedFromBin = true
                    }
                } finally {
                    binLock.release()
                }
            } catch (binErr) {
                console.warn('[mailboxEngine] Trash folder check error:', binErr.message)
            }

            // Step 2: Also check INBOX and expunge
            try {
                const inboxLock = await client.getMailboxLock('INBOX')
                try {
                    const msg = await findMessageInMailbox(client, messageId)
                    if (msg) {
                        // Move to trash first to break all labels then expunge
                        try {
                            await client.messageMove(String(msg.uid), trashFolder, { uid: true })
                        } catch {}
                        await client.messageDelete(String(msg.uid), { uid: true })
                        console.log(`[mailboxEngine] Expunged UID ${msg.uid} from INBOX`)
                    }
                } finally {
                    inboxLock.release()
                }
            } catch (inboxErr) {
                console.warn('[mailboxEngine] INBOX purge error:', inboxErr.message)
            }

            // Step 3: Check [Gmail]/All Mail to ensure 100% expunged on Google Workspace
            try {
                const allLock = await client.getMailboxLock(allMailFolder)
                try {
                    const msg = await findMessageInMailbox(client, messageId)
                    if (msg) {
                        await client.messageDelete(String(msg.uid), { uid: true })
                        console.log(`[mailboxEngine] Expunged UID ${msg.uid} from ${allMailFolder}`)
                    }
                } finally {
                    allLock.release()
                }
            } catch (allErr) {
                console.warn('[mailboxEngine] All Mail purge check error:', allErr.message)
            }
        } else if (action === 'empty_trash') {
            // Expunge all messages from [Gmail]/Bin
            try {
                const lock = await client.getMailboxLock(trashFolder)
                try {
                    const total = client.mailbox.exists || 0
                    if (total > 0) {
                        await client.messageDelete('1:*')
                        console.log(`[mailboxEngine] Emptied ${total} messages from ${trashFolder}`)
                    }
                } finally {
                    lock.release()
                }
            } catch (binErr) {
                console.warn('[mailboxEngine] Empty trash error on', trashFolder, binErr.message)
            }
        } else if (action === 'read' || action === 'unread') {
            const isRead = action === 'read' || value !== false
            const lock = await client.getMailboxLock('INBOX')
            try {
                const msg = await findMessageInMailbox(client, messageId)
                if (msg) {
                    if (isRead) {
                        await client.messageFlagsAdd(String(msg.uid), ['\\Seen'], { uid: true })
                    } else {
                        await client.messageFlagsRemove(String(msg.uid), ['\\Seen'], { uid: true })
                    }
                }
            } finally {
                lock.release()
            }
        } else if (action === 'star' || action === 'unstar') {
            const isStarred = action === 'star' || value !== false
            const lock = await client.getMailboxLock('INBOX')
            try {
                const msg = await findMessageInMailbox(client, messageId)
                if (msg) {
                    if (isStarred) {
                        await client.messageFlagsAdd(String(msg.uid), ['\\Flagged'], { uid: true })
                    } else {
                        await client.messageFlagsRemove(String(msg.uid), ['\\Flagged'], { uid: true })
                    }
                }
            } finally {
                lock.release()
            }
        }

        await client.logout()
        return { success: true }
    } catch (e) {
        if (client) {
            try { await client.logout() } catch {}
        }
        console.warn('[mailboxEngine executeImapAction warning]:', e.message)
        return { success: false, error: e.message }
    }
}

// ==============================================================================
// 2. BI-DIRECTIONAL MAILBOX SYNC ENGINE (Inbound & Reverse Sync)
// ==============================================================================
let isSyncRunning = false
let lastSyncTimestamp = Date.now()

export async function performImapSync() {
    if (isSyncRunning) {
        return { success: true, syncedCount: 0, skipped: true, message: 'Sync already in progress' }
    }

    isSyncRunning = true
    let client = null
    let syncedCount = 0
    const supabase = getSupabaseClient()

    try {
        // Fetch existing records from Supabase
        const existingMap = new Map()
        const supabaseInboxRows = []

        if (supabase) {
            try {
                const { data: existingRows } = await supabase
                    .from('institution_emails')
                    .select('message_id, folder, is_starred, is_read')

                if (existingRows) {
                    existingRows.forEach(r => {
                        const nid = normId(r.message_id)
                        existingMap.set(r.message_id, r.folder)
                        existingMap.set(nid, r.folder)
                        if (r.folder === 'inbox') {
                            supabaseInboxRows.push(r)
                        }
                    })
                }
            } catch (dbReadErr) {
                console.warn('[mailboxEngine sync] Supabase existing check error:', dbReadErr.message)
            }
        }

        client = getImapClient()
        await client.connect()
        await detectGmailFolders(client)

        const trashFolder = resolvedFolders.trash || '[Gmail]/Bin'
        const gmailInboxIds = new Set()

        // --------------------------------------------------------------------------
        // Phase 1: Inbound Sync from Gmail INBOX
        // --------------------------------------------------------------------------
        const inboxLock = await client.getMailboxLock('INBOX')
        try {
            const mailboxStatus = client.mailbox
            const totalMessages = mailboxStatus.exists || 0

            if (totalMessages > 0) {
                const fetchRange = `${Math.max(1, totalMessages - 49)}:*`
                const messagesStream = client.fetch(fetchRange, {
                    envelope: true,
                    source: true,
                    flags: true,
                    uid: true
                })

                for await (const msg of messagesStream) {
                    try {
                        const parsed = await simpleParser(msg.source)
                        const messageId = parsed.messageId || msg.envelope?.messageId || `msg-${msg.uid}`
                        const currentNormId = normId(messageId)
                        const envNormId = normId(msg.envelope?.messageId)

                        gmailInboxIds.add(currentNormId)
                        if (envNormId) gmailInboxIds.add(envNormId)
                        gmailInboxIds.add(String(msg.uid))

                        // If permanently deleted, expunge from INBOX and skip
                        if (permanentlyDeletedIds.has(messageId) || permanentlyDeletedIds.has(currentNormId) || permanentlyDeletedIds.has(envNormId)) {
                            try {
                                await client.messageDelete(String(msg.uid), { uid: true })
                                console.log(`[mailboxEngine sync] Purged permanently deleted UID ${msg.uid} from INBOX`)
                            } catch {}
                            continue
                        }

                        // Check if marked as 'trash' in DB -> move to [Gmail]/Bin immediately
                        let targetFolder = 'inbox'
                        if (existingMap.has(messageId)) {
                            targetFolder = existingMap.get(messageId)
                        } else if (existingMap.has(currentNormId)) {
                            targetFolder = existingMap.get(currentNormId)
                        }

                        if (targetFolder === 'trash') {
                            try {
                                await client.messageMove(String(msg.uid), trashFolder, { uid: true })
                                console.log(`[mailboxEngine sync] Moved trashed message UID ${msg.uid} to ${trashFolder}`)
                            } catch {}
                            continue
                        }

                        const fromAddress = parsed.from?.value?.[0]?.address || 'unknown@domain.com'
                        const fromName = parsed.from?.value?.[0]?.name || fromAddress.split('@')[0]
                        const toAddress = Array.isArray(parsed.to)
                            ? parsed.to.map(t => t.text).join(', ')
                            : (parsed.to?.text || process.env.SMTP_USER || 'info@icstconnect.in')

                        const subject = parsed.subject || '(No Subject)'
                        const bodyHtml = parsed.html || parsed.textAsHtml || `<p>${parsed.text || ''}</p>`
                        const bodyText = parsed.text || htmlToPlainText(parsed.html)
                        const snippet = bodyText.slice(0, 160).replace(/\s+/g, ' ').trim()
                        const receivedAt = parsed.date || new Date()
                        const isRead = msg.flags?.has('\\Seen') || false
                        const isStarred = msg.flags?.has('\\Flagged') || targetFolder === 'starred'

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
                            attachments: (parsed.attachments || []).map(att => ({
                                filename: att.filename || 'attachment',
                                contentType: att.contentType,
                                size: att.size
                            })),
                            is_read: isRead,
                            is_starred: isStarred,
                            received_at: receivedAt.toISOString()
                        }

                        if (supabase) {
                            try {
                                await supabase
                                    .from('institution_emails')
                                    .upsert(emailRecord, { onConflict: 'message_id' })
                            } catch (upsertErr) {
                                console.warn('[mailboxEngine sync] Upsert fallback:', upsertErr.message)
                            }
                        }

                        inMemoryMailbox.set(messageId, emailRecord)
                        syncedCount++
                    } catch (parseErr) {
                        console.warn('[mailboxEngine sync] Error parsing message uid', msg.uid, parseErr.message)
                    }
                }
            }
        } finally {
            inboxLock.release()
        }

        // --------------------------------------------------------------------------
        // Phase 2: Reverse Sync (Detecting Messages Deleted from Gmail Web)
        // --------------------------------------------------------------------------
        // If a message was stored in Supabase with folder = 'inbox', but is NO LONGER in Gmail INBOX:
        const missingFromInbox = supabaseInboxRows.filter(r => {
            const nid = normId(r.message_id)
            return !gmailInboxIds.has(nid) && !gmailInboxIds.has(r.message_id)
        })

        if (missingFromInbox.length > 0) {
            console.log(`[mailboxEngine reverse-sync] ${missingFromInbox.length} messages missing from Gmail INBOX. Checking ${trashFolder}...`)

            // Check if they are in [Gmail]/Bin
            const gmailBinIds = new Set()
            try {
                const binLock = await client.getMailboxLock(trashFolder)
                try {
                    const binTotal = client.mailbox.exists || 0
                    if (binTotal > 0) {
                        const binRange = binTotal > 50 ? `${binTotal - 49}:*` : '1:*'
                        for await (const bmsg of client.fetch(binRange, { envelope: true, uid: true })) {
                            if (bmsg.envelope?.messageId) {
                                gmailBinIds.add(normId(bmsg.envelope.messageId))
                            }
                            gmailBinIds.add(String(bmsg.uid))
                        }
                    }
                } finally {
                    binLock.release()
                }
            } catch (binErr) {
                console.warn('[mailboxEngine reverse-sync] Trash folder inspection error:', binErr.message)
            }

            for (const missing of missingFromInbox) {
                const nid = normId(missing.message_id)
                const inBin = gmailBinIds.has(nid) || gmailBinIds.has(missing.message_id)

                if (inBin) {
                    console.log(`[mailboxEngine reverse-sync] Message ${missing.message_id} found in Gmail Bin -> Updating DB folder to 'trash'`)
                    if (supabase) {
                        try {
                            await supabase
                                .from('institution_emails')
                                .update({ folder: 'trash' })
                                .eq('message_id', missing.message_id)
                        } catch {}
                    }
                    if (inMemoryMailbox.has(missing.message_id)) {
                        inMemoryMailbox.get(missing.message_id).folder = 'trash'
                    }
                } else {
                    // Message was removed or deleted from Gmail entirely -> Move to trash in DB
                    console.log(`[mailboxEngine reverse-sync] Message ${missing.message_id} removed from Gmail -> Updating DB folder to 'trash'`)
                    if (supabase) {
                        try {
                            await supabase
                                .from('institution_emails')
                                .update({ folder: 'trash' })
                                .eq('message_id', missing.message_id)
                        } catch {}
                    }
                    if (inMemoryMailbox.has(missing.message_id)) {
                        inMemoryMailbox.get(missing.message_id).folder = 'trash'
                    }
                }
            }
        }

        await client.logout()
        lastSyncTimestamp = Date.now()
        return { success: true, syncedCount, lastSyncTimestamp }
    } catch (err) {
        if (client) {
            try { await client.logout() } catch {}
        }
        throw err
    } finally {
        isSyncRunning = false
    }
}

// ==============================================================================
// 3. FETCH MAILBOX MESSAGES (Supabase with Memory Fallback)
// ==============================================================================
export async function getMailboxMessages(folder = 'inbox', search = '') {
    const supabase = getSupabaseClient()
    const cleanSearch = (search || '').trim().toLowerCase()
    let messages = []

    if (supabase) {
        try {
            let query = supabase
                .from('institution_emails')
                .select('*')
                .order('received_at', { ascending: false })

            if (folder === 'starred') {
                query = query.eq('is_starred', true)
            } else {
                query = query.eq('folder', folder)
            }

            if (cleanSearch) {
                query = query.or(`subject.ilike.%${cleanSearch}%,from_name.ilike.%${cleanSearch}%,from_email.ilike.%${cleanSearch}%,snippet.ilike.%${cleanSearch}%`)
            }

            const { data, error } = await query.limit(50)
            if (!error && data) {
                messages = data
            }
        } catch (dbErr) {
            console.warn('[mailboxEngine getMailboxMessages] Supabase read fallback:', dbErr.message)
        }
    }

    if (messages.length === 0 && inMemoryMailbox.size > 0) {
        messages = Array.from(inMemoryMailbox.values())
            .filter(m => {
                if (folder === 'starred') return m.is_starred
                return m.folder === folder
            })
            .filter(m => {
                if (!cleanSearch) return true
                return (
                    (m.subject && m.subject.toLowerCase().includes(cleanSearch)) ||
                    (m.from_name && m.from_name.toLowerCase().includes(cleanSearch)) ||
                    (m.from_email && m.from_email.toLowerCase().includes(cleanSearch)) ||
                    (m.snippet && m.snippet.toLowerCase().includes(cleanSearch))
                )
            })
            .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
    }

    const unreadCount = messages.filter(m => !m.is_read).length

    return {
        success: true,
        folder,
        total: messages.length,
        unreadCount,
        messages
    }
}

// ==============================================================================
// 4. DISPATCH OUTBOUND EMAIL & LOG SENT RECORD
// ==============================================================================
export async function sendMailboxEmail({ to, subject, html, text, inReplyTo, references }) {
    if (!to || !subject || !html) {
        throw new Error('Missing required fields: to, subject, html')
    }

    const transporter = getTransporter()
    const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'info@icstconnect.in'
    const plainText = text || htmlToPlainText(html)
    const isTransactional = /code|otp|verify|verification|password|reset|security|alert/i.test(subject)

    const headers = {}
    if (inReplyTo) {
        headers['In-Reply-To'] = inReplyTo.trim()
        headers['References'] = (references ? `${references} ` : '') + inReplyTo.trim()
    } else if (references) {
        headers['References'] = references.trim()
    }

    if (isTransactional) {
        headers['X-Priority'] = '1'
        headers['X-MSMail-Priority'] = 'High'
        headers['Importance'] = 'high'
        headers['Priority'] = 'urgent'
    }

    const senderName = isTransactional ? 'ICST Connect Security' : 'ICST Chowberia'
    const info = await transporter.sendMail({
        from: `"${senderName}" <${senderAddress}>`,
        to,
        replyTo: senderAddress,
        subject,
        text: plainText,
        html,
        headers
    })

    const sentRecord = {
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
        received_at: new Date().toISOString()
    }

    const supabase = getSupabaseClient()
    if (supabase) {
        try {
            await supabase.from('institution_emails').insert(sentRecord)
        } catch {
            inMemoryMailbox.set(info.messageId, sentRecord)
        }
    } else {
        inMemoryMailbox.set(info.messageId, sentRecord)
    }

    // Trigger instant background sync
    performImapSync().catch(() => {})

    return {
        success: true,
        messageId: info.messageId,
        message: 'Email dispatched successfully'
    }
}

// ==============================================================================
// 5. UPDATE MESSAGE ACTION (Database & IMAP Sync)
// ==============================================================================
export async function updateMessageAction({ messageId, action, value }) {
    if (!action) throw new Error('action required')

    const supabase = getSupabaseClient()

    if (action === 'delete_permanent') {
        if (!messageId) throw new Error('messageId required')

        permanentlyDeletedIds.add(messageId)
        permanentlyDeletedIds.add(normId(messageId))

        if (supabase) {
            try {
                await supabase
                    .from('institution_emails')
                    .delete()
                    .eq('message_id', messageId)
            } catch (err) {
                console.warn('[mailboxEngine delete_permanent DB error]:', err.message)
            }
        }
        inMemoryMailbox.delete(messageId)

        // Trigger Google Workspace IMAP permanent expunge
        executeImapAction('delete_permanent', messageId).catch(err => {
            console.warn('[mailboxEngine executeImapAction delete_permanent warning]:', err.message)
        })

        return { success: true, message: 'Message permanently deleted' }
    }

    if (action === 'empty_trash') {
        if (supabase) {
            try {
                const { data: trashedRows } = await supabase
                    .from('institution_emails')
                    .select('message_id')
                    .eq('folder', 'trash')
                if (trashedRows) {
                    trashedRows.forEach(r => {
                        permanentlyDeletedIds.add(r.message_id)
                        permanentlyDeletedIds.add(normId(r.message_id))
                    })
                }
                await supabase
                    .from('institution_emails')
                    .delete()
                    .eq('folder', 'trash')
            } catch (err) {
                console.warn('[mailboxEngine empty_trash DB error]:', err.message)
            }
        }

        for (const [id, msg] of inMemoryMailbox.entries()) {
            if (msg.folder === 'trash') {
                permanentlyDeletedIds.add(id)
                permanentlyDeletedIds.add(normId(id))
                inMemoryMailbox.delete(id)
            }
        }

        executeImapAction('empty_trash').catch(err => {
            console.warn('[mailboxEngine executeImapAction empty_trash warning]:', err.message)
        })

        return { success: true, message: 'Trash emptied permanently' }
    }

    if (!messageId) throw new Error('messageId required')

    const updateData = {}
    if (action === 'read') updateData.is_read = value !== false
    if (action === 'star') updateData.is_starred = value !== false
    if (action === 'trash') updateData.folder = 'trash'
    if (action === 'restore') updateData.folder = 'inbox'

    if (supabase) {
        try {
            await supabase
                .from('institution_emails')
                .update(updateData)
                .eq('message_id', messageId)
        } catch (err) {
            console.warn('[mailboxEngine DB update error]:', err.message)
        }
    }

    if (inMemoryMailbox.has(messageId)) {
        const item = inMemoryMailbox.get(messageId)
        Object.assign(item, updateData)
        inMemoryMailbox.set(messageId, item)
    }

    // Execute IMAP action in background
    executeImapAction(action, messageId, value).catch(err => {
        console.warn(`[mailboxEngine action ${action} IMAP warning]:`, err.message)
    })

    return { success: true, message: `Action ${action} updated` }
}

// ==============================================================================
// 6. BACKGROUND SYNC CONTROLLER
// ==============================================================================
let backgroundSyncTimer = null

export function startBackgroundSync(intervalMs = 120000) {
    if (backgroundSyncTimer) return

    // Startup initial sync after 3 seconds
    setTimeout(() => {
        performImapSync().catch(err => console.warn('[mailboxEngine] Initial sync warning:', err.message))
    }, 3000)

    // Periodic sync
    backgroundSyncTimer = setInterval(() => {
        performImapSync().catch(() => {})
    }, intervalMs)

    console.log(`[mailboxEngine] Background sync scheduled every ${intervalMs / 1000} seconds`)
}
