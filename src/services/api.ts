import { supabase } from '../lib/supabase'

export interface Notification {
    id: number
    title: string
    date: string
    message: string
    icon: string
    color: string
    bgColor: string
}

export interface Test {
    id: string
    title: string
    description: string
    duration: string
    questions: number
    difficulty: string
    icon: string
    color: string
}

export const api = {
    async getNotifications() {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('date', { ascending: false })

        if (error) throw error
        return data as Notification[]
    },

    async getTests() {
        const { data, error } = await supabase
            .from('tests')
            .select('*')

        if (error) throw error
        return data as Test[]
    }
}
