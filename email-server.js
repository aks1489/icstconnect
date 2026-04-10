import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// Create a server-side Supabase client using the environment context
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const app = express()
app.use(cors())
app.use(express.json())

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
    secure: true, // Typically true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, html } = req.body

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const info = await transporter.sendMail({
            from: `"ICST Connect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        })

        console.log('Message sent: %s', info.messageId)
        res.status(200).json({ success: true, messageId: info.messageId })
    } catch (error) {
        console.error('Error sending email: ', error)
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

app.post('/api/create-auth-user', async (req, res) => {
    try {
        const { email, password, full_name } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' })
        }

        // Executing signUp on the backend avoids signing out the frontend admin!
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
            console.error('Supabase Auth error:', error)
            return res.status(400).json({ error: error.message })
        }

        res.status(200).json({ success: true, user: data.user })
    } catch (error) {
        console.error('Error creating user: ', error)
        res.status(500).json({ error: 'Internal Server Error', details: error.message })
    }
})

const PORT = 5000 // Fixed internal port so frontend can rely on it if configuring locally
app.listen(PORT, () => {
    console.log(`Email Relay Server running on http://localhost:${PORT}`)
})
