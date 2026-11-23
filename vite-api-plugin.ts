import type { Plugin } from 'vite'
import dotenv from 'dotenv'
import {
  getTransporter,
  getSupabaseClient,
  performImapSync,
  getMailboxMessages,
  sendMailboxEmail,
  updateMessageAction,
  startBackgroundSync
} from './server/mailboxEngine.js'

dotenv.config()

export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
      // Start background mailbox sync inside Vite dev server
      startBackgroundSync(120000)

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        // Handle CORS preflight
        if (req.method === 'OPTIONS' && url?.startsWith('/api/')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          res.statusCode = 204
          res.end()
          return
        }

        // Helper to read incoming JSON body
        const readJsonBody = async (): Promise<any> => {
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
          }
          const raw = Buffer.concat(chunks).toString('utf-8')
          return raw ? JSON.parse(raw) : {}
        }

        const sendJsonResponse = (status: number, data: any) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = status
          res.end(JSON.stringify(data))
        }

        // ==============================================================================
        // 1. MAILBOX ACTIONS (Read, Star, Trash, Restore, Delete Permanent, Empty Trash)
        // ==============================================================================
        if (req.method === 'POST' && url === '/api/mailbox/action') {
          try {
            const body = await readJsonBody()
            const result = await updateMessageAction(body)
            sendJsonResponse(200, result)
          } catch (err: any) {
            console.error('[Vite Mailbox Action] Error:', err.message)
            sendJsonResponse(500, { success: false, error: err.message || 'Action failed' })
          }
          return
        }

        // ==============================================================================
        // 2. MAILBOX SYNC (IMAP Inbound & Reverse Sync)
        // ==============================================================================
        if ((req.method === 'GET' || req.method === 'POST') && url === '/api/mailbox/sync') {
          try {
            const result = await performImapSync()
            sendJsonResponse(200, {
              success: true,
              message: `Mailbox synchronized. ${result.syncedCount || 0} messages processed.`,
              syncedCount: result.syncedCount,
              lastSyncTimestamp: result.lastSyncTimestamp
            })
          } catch (err: any) {
            console.error('[Vite Mailbox Sync] Error:', err.message)
            sendJsonResponse(500, { success: false, error: err.message || 'Failed to sync mailbox' })
          }
          return
        }

        // ==============================================================================
        // 3. MAILBOX MESSAGES LIST
        // ==============================================================================
        if (req.method === 'GET' && url === '/api/mailbox/messages') {
          try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
            const folder = parsedUrl.searchParams.get('folder') || 'inbox'
            const search = parsedUrl.searchParams.get('search') || ''
            const data = await getMailboxMessages(folder, search)
            sendJsonResponse(200, data)
          } catch (err: any) {
            console.error('[Vite Mailbox Messages] Error:', err.message)
            sendJsonResponse(500, { success: false, error: err.message || 'Failed to fetch messages' })
          }
          return
        }

        // ==============================================================================
        // 4. SEND EMAIL & DIRECT REPLY (Mailbox & Legacy)
        // ==============================================================================
        if (req.method === 'POST' && (url === '/api/mailbox/send' || url === '/api/send-email')) {
          try {
            const body = await readJsonBody()
            const result = await sendMailboxEmail(body)
            sendJsonResponse(200, result)
          } catch (err: any) {
            console.error('[Vite Send Email] Error:', err.message)
            sendJsonResponse(500, { success: false, error: err.message || 'Failed to send email' })
          }
          return
        }

        // ==============================================================================
        // 5. SMTP HEALTH & VERIFICATION
        // ==============================================================================
        if ((req.method === 'GET' || req.method === 'POST') && url === '/api/smtp-verify') {
          try {
            const transporter = getTransporter()
            await transporter.verify()
            sendJsonResponse(200, {
              success: true,
              message: 'SMTP connection verified successfully',
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port: process.env.SMTP_PORT || 465,
              user: process.env.SMTP_USER
            })
          } catch (err: any) {
            console.error('[Vite SMTP Verify] Error:', err.message)
            sendJsonResponse(500, {
              success: false,
              error: err.message || 'SMTP connection failed'
            })
          }
          return
        }

        // ==============================================================================
        // 6. CREATE AUTH USER
        // ==============================================================================
        if (req.method === 'POST' && url === '/api/create-auth-user') {
          try {
            const body = await readJsonBody()
            const { email, password, full_name } = body

            if (!email || !password) {
              sendJsonResponse(400, { success: false, error: 'Missing email or password' })
              return
            }

            const supabase = getSupabaseClient()
            if (!supabase) {
              sendJsonResponse(500, { success: false, error: 'Supabase client not initialized' })
              return
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
              console.error('[Vite Auth] Supabase Auth error:', error.message)
              sendJsonResponse(400, { success: false, error: error.message })
              return
            }

            console.log(`[Vite Auth] Auth user provisioned: ${email} (ID: ${data.user?.id})`)
            sendJsonResponse(200, { success: true, user: data.user })
          } catch (err: any) {
            console.error('[Vite Auth] Server error creating user:', err.message)
            sendJsonResponse(500, { success: false, error: err.message || 'Server error creating user' })
          }
          return
        }

        next()
      })
    }
  }
}
