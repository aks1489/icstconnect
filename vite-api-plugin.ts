import type { Plugin } from 'vite'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-plugin',
    configureServer(server) {
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

        // 1. SMTP Connection Verification
        if ((req.method === 'GET' || req.method === 'POST') && url === '/api/smtp-verify') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/json')
          try {
            const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port,
              secure: port === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            })

            await transporter.verify()
            res.statusCode = 200
            res.end(JSON.stringify({
              success: true,
              message: 'SMTP connection verified successfully',
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port,
              user: process.env.SMTP_USER
            }))
          } catch (err: any) {
            console.error('[SMTP Verify] Error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'SMTP connection failed'
            }))
          }
          return
        }

        // 2. Send Email
        if (req.method === 'POST' && url === '/api/send-email') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/json')
          try {
            const body = await readJsonBody()
            const { to, subject, html } = body

            if (!to || !subject || !html) {
              res.statusCode = 400
              res.end(JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }))
              return
            }

            const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port,
              secure: port === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            })

            const senderAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'icstconnect@gmail.com'
            const info = await transporter.sendMail({
              from: `"ICST Connect" <${senderAddress}>`,
              to,
              subject,
              html
            })

            console.log(`[SMTP Relay] Email successfully delivered to: ${to} (MessageId: ${info.messageId})`)
            res.statusCode = 200
            res.end(JSON.stringify({ success: true, messageId: info.messageId }))
          } catch (err: any) {
            console.error('[SMTP Relay] Error dispatching email:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: err.message || 'Failed to send email' }))
          }
          return
        }

        // 3. Create Auth User
        if (req.method === 'POST' && url === '/api/create-auth-user') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/json')
          try {
            const body = await readJsonBody()
            const { email, password, full_name } = body

            if (!email || !password) {
              res.statusCode = 400
              res.end(JSON.stringify({ success: false, error: 'Missing email or password' }))
              return
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL
            const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
            if (!supabaseUrl || !supabaseAnonKey) {
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: 'Supabase URL or Key not set in environment' }))
              return
            }

            const supabase = createClient(supabaseUrl, supabaseAnonKey)
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
              console.error('[Auth Relay] Supabase Auth error:', error.message)
              res.statusCode = 400
              res.end(JSON.stringify({ success: false, error: error.message }))
              return
            }

            console.log(`[Auth Relay] Auth user provisioned: ${email} (ID: ${data.user?.id})`)
            res.statusCode = 200
            res.end(JSON.stringify({ success: true, user: data.user }))
          } catch (err: any) {
            console.error('[Auth Relay] Server error creating user:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: err.message || 'Server error creating user' }))
          }
          return
        }

        next()
      })
    }
  }
}
