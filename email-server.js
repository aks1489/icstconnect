import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {
    getSupabaseClient,
    getTransporter,
    performImapSync,
    getMailboxMessages,
    sendMailboxEmail,
    updateMessageAction,
    startBackgroundSync
} from './server/mailboxEngine.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

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

// ==============================================================================
// 1. MAILBOX SYNC
// ==============================================================================
app.all('/api/mailbox/sync', async (req, res) => {
    try {
        const result = await performImapSync()
        res.status(200).json({
            success: true,
            message: `Mailbox synchronized. ${result.syncedCount || 0} messages processed.`,
            syncedCount: result.syncedCount,
            lastSyncTimestamp: result.lastSyncTimestamp
        })
    } catch (error) {
        console.error('Mailbox sync error:', error)
        res.status(500).json({ success: false, error: error.message || 'Failed to sync mailbox' })
    }
})

// ==============================================================================
// 2. MAILBOX MESSAGES LIST
// ==============================================================================
app.get('/api/mailbox/messages', async (req, res) => {
    try {
        const folder = req.query.folder || 'inbox'
        const search = req.query.search || ''
        const data = await getMailboxMessages(folder, search)
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch messages' })
    }
})

// ==============================================================================
// 3. SEND EMAIL & DIRECT REPLY
// ==============================================================================
app.post('/api/mailbox/send', async (req, res) => {
    try {
        const result = await sendMailboxEmail(req.body)
        res.status(200).json(result)
    } catch (error) {
        console.error('Error sending mailbox email: ', error)
        res.status(500).json({ success: false, error: error.message || 'Failed to send email' })
    }
})

// Legacy send-email handler
app.post('/api/send-email', async (req, res) => {
    try {
        const result = await sendMailboxEmail(req.body)
        res.status(200).json(result)
    } catch (error) {
        console.error('Error dispatching legacy email: ', error)
        res.status(500).json({ success: false, error: error.message || 'Failed to send email' })
    }
})

// ==============================================================================
// 4. MESSAGE ACTIONS (Read, Star, Trash, Restore, Delete Permanent, Empty Trash)
// ==============================================================================
app.post('/api/mailbox/action', async (req, res) => {
    try {
        const result = await updateMessageAction(req.body)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// ==============================================================================
// 5. AUTH USER CREATION
// ==============================================================================
app.post('/api/create-auth-user', async (req, res) => {
    try {
        const { email, password, full_name } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Missing email or password' })
        }

        const supabase = getSupabaseClient()
        if (!supabase) {
            return res.status(500).json({ success: false, error: 'Supabase client not initialized' })
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

// Initialize background sync
startBackgroundSync(120000)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Email Relay & Mailbox Sync Server running on http://localhost:${PORT}`)
})
