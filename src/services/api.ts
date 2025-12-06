import { supabase } from '../lib/supabase'

export interface Course {
    id: number
    title: string
    duration: string
    image: string
    description: string
    price: string
    category?: string
}

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
    async getCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select('*')

        if (error) throw error
        return data as Course[]
    },

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
