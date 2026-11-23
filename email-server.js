import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'

dotenv.config()

// Create a server-side Supabase client using the environment context
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// In-memory fallback message cache if Supabase table is pending creation
const inMemoryMailbox = new Map()

const getTransporter = () => {
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

const getImapClient = () => {
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

// SMTP Health & Connection verification
app.all('/api/smtp-verify', async (req, res) => {
    try {
        const transporter = getTransporter()
        await transporter.verify()
        res.status(200).json({
            success: true,
            message: 'SMTP connection verified successfully',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || '465',
            user: process.env.SMTP_USER
        })
    } catch (error) {
        console.error('SMTP verify error:', error)
        res.status(500).json({ success: false, error: error.message || 'SMTP connection failed' })
    }
})

function htmlToPlainText(html) {
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

// ==============================================================================
// 1. MAILBOX SYNC ENGINE (IMAP Inbound Sync)
// ==============================================================================
app.all('/api/mailbox/sync', async (req, res) => {
    let client = null
    try {
        client = getImapClient()
        await client.connect()

        const lock = await client.getMailboxLock('INBOX')
        let syncedCount = 0
        let newCount = 0

        try {
            const mailboxStatus = client.mailbox
            const totalMessages = mailboxStatus.exists || 0

            if (totalMessages > 0) {
                // Fetch the latest 30 messages
                const fetchRange = `${Math.max(1, totalMessages - 29)}:*`
                const messagesStream = client.fetch(fetchRange, {
                    envelope: true,
                    source: true,
                    flags: true,
                    uid: true
                })

                for await (const msg of messagesStream) {
                    try {
                        const parsed = await simpleParser(msg.source)
                        const messageId = parsed.messageId || `msg-${msg.uid}-${Date.now()}`
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
                            attachments: (parsed.attachments || []).map(att => ({
                                filename: att.filename || 'attachment',
                                contentType: att.contentType,
                                size: att.size
                            })),
                            is_read: isRead,
                            is_starred: false,
                            received_at: receivedAt.toISOString()
                        }

                        // Save to Supabase (if table exists)
                        try {
                            const { error: upsertErr } = await supabase
                                .from('institution_emails')
                                .upsert(emailRecord, { onConflict: 'message_id' })

                            if (upsertErr) {
                                inMemoryMailbox.set(messageId, emailRecord)
                            } else {
                                inMemoryMailbox.set(messageId, emailRecord)
                            }
                        } catch {
                            inMemoryMailbox.set(messageId, emailRecord)
                        }

                        syncedCount++
                    } catch (parseErr) {
                        console.warn('[mailbox-sync] Error parsing message uid', msg.uid, parseErr.message)
                    }
                }
            }
        } finally {
            lock.release()
        }

        await client.logout()

        res.status(200).json({
            success: true,
            message: `Mailbox synchronized successfully. Processed ${syncedCount} messages.`,
            syncedCount
        })
    } catch (error) {
        console.error('Mailbox sync error:', error)
        if (client) {
            try { await client.logout() } catch {}
        }
        res.status(500).json({ success: false, error: error.message || 'Failed to sync mailbox' })
    }
})

// ==============================================================================
// 2. MAILBOX MESSAGES LIST
// ==============================================================================
app.get('/api/mailbox/messages', async (req, res) => {
    try {
        const folder = req.query.folder || 'inbox'
        const search = (req.query.search || '').trim().toLowerCase()

        // 1. Attempt read from Supabase
        let messages = []
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

            if (search) {
                query = query.or(`subject.ilike.%${search}%,from_name.ilike.%${search}%,from_email.ilike.%${search}%,snippet.ilike.%${search}%`)
            }

            const { data, error } = await query.limit(50)
            if (!error && data) {
                messages = data
            }
        } catch {}

        // Fallback to in-memory store if DB query returned nothing
        if (messages.length === 0 && inMemoryMailbox.size > 0) {
            messages = Array.from(inMemoryMailbox.values())
                .filter(m => {
                    if (folder === 'starred') return m.is_starred
                    return m.folder === folder
                })
                .filter(m => {
                    if (!search) return true
                    return (
                        m.subject.toLowerCase().includes(search) ||
                        m.from_name.toLowerCase().includes(search) ||
                        m.from_email.toLowerCase().includes(search) ||
                        (m.snippet && m.snippet.toLowerCase().includes(search))
                    )
                })
                .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
        }

        const unreadCount = messages.filter(m => !m.is_read).length

        res.status(200).json({
            success: true,
            folder,
            total: messages.length,
            unreadCount,
            messages
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch messages' })
    }
})

// ==============================================================================
// 3. SEND EMAIL & DIRECT REPLY
// ==============================================================================
app.post('/api/mailbox/send', async (req, res) => {
    try {
        const { to, subject, html, text, inReplyTo, references } = req.body

        if (!to || !subject || !html) {
            return res.status(400).json({ success: false, error: 'Missing required fields: to, subject, html' })
        }

        const transporter = getTransporter()
        const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'info@icstconnect.in'
        const plainText = text || htmlToPlainText(html)
        const isTransactional = /code|otp|verify|verification|password|reset|security|alert/i.test(subject)

        const headers = {
            'X-Mailer': 'ICST Connect Mailer',
            'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }

        if (inReplyTo) headers['In-Reply-To'] = inReplyTo
        if (references) headers['References'] = references

        if (isTransactional) {
            headers['X-Priority'] = '1'
            headers['X-MSMail-Priority'] = 'High'
            headers['Importance'] = 'high'
            headers['Priority'] = 'urgent'
        } else {
            headers['List-Unsubscribe'] = `<mailto:${senderAddress}?subject=Unsubscribe>`
            headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
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

        // Archive sent email to Database / Memory
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

        try {
            await supabase.from('institution_emails').insert(sentRecord)
        } catch {
            inMemoryMailbox.set(info.messageId, sentRecord)
        }

        res.status(200).json({ success: true, messageId: info.messageId, message: 'Email dispatched successfully' })
    } catch (error) {
        console.error('Error sending mailbox email: ', error)
        res.status(500).json({ success: false, error: error.message || 'Failed to send email' })
    }
})

// Legacy send-email handler
app.post('/api/send-email', async (req, res) => {
    // Re-route to mailbox/send
    req.url = '/api/mailbox/send'
    return app._router.handle(req, res)
})

// ==============================================================================
// 4. MESSAGE ACTIONS (Read, Star, Delete)
// ==============================================================================
app.post('/api/mailbox/action', async (req, res) => {
    try {
        const { messageId, action, value } = req.body
        if (!messageId || !action) {
            return res.status(400).json({ success: false, error: 'messageId and action required' })
        }

        const updateData = {}
        if (action === 'read') updateData.is_read = value !== false
        if (action === 'star') updateData.is_starred = value !== false
        if (action === 'trash') updateData.folder = 'trash'
        if (action === 'restore') updateData.folder = 'inbox'

        try {
            await supabase
                .from('institution_emails')
                .update(updateData)
                .eq('message_id', messageId)
        } catch {}

        if (inMemoryMailbox.has(messageId)) {
            const item = inMemoryMailbox.get(messageId)
            Object.assign(item, updateData)
            inMemoryMailbox.set(messageId, item)
        }

        res.status(200).json({ success: true, message: `Action ${action} updated` })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// Auth creation endpoint
app.post('/api/create-auth-user', async (req, res) => {
    try {
        const { email, password, full_name } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Missing email or password' })
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name
                }
            }
        })

        if (error) {
            return res.status(400).json({ success: false, error: error.message })
        }

        res.status(200).json({ success: true, user: data.user })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Server error creating user' })
    }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Email Relay & Mailbox Sync Server running on http://localhost:${PORT}`)
})
