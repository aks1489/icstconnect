import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.')
}

const cookieStorage = {
    getItem: (key: string) => {
        if (typeof document === 'undefined') return null
        const cookies = document.cookie.split('; ')
        for (const cookie of cookies) {
            if (cookie.startsWith(`${key}=`)) {
                return decodeURIComponent(cookie.substring(key.length + 1))
            }
        }
        return null
    },
    setItem: (key: string, value: string) => {
        if (typeof document === 'undefined') return
        // Store cookie for 1 year (31536000 seconds)
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
    },
    removeItem: (key: string) => {
        if (typeof document === 'undefined') return
        document.cookie = `${key}=; path=/; max-age=0`
    }
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: cookieStorage,
            storageKey: 'icst-auth-token'
        }
    }
)
