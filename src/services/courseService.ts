import { supabase } from '../lib/supabase'
import type { Course } from '../types/course'

// Icon mapping helper
const getCourseStyle = (title: string): { icon: string, color: string } => {
    const t = title.toLowerCase()
    if (t.includes('python')) return { icon: 'bi-filetype-py', color: 'text-yellow-500 bg-yellow-50' }
    if (t.includes('java')) return { icon: 'bi-filetype-java', color: 'text-red-500 bg-red-50' }
    if (t.includes('react')) return { icon: 'bi-filetype-jsx', color: 'text-blue-500 bg-blue-50' }
    if (t.includes('sql') || t.includes('data')) return { icon: 'bi-database', color: 'text-indigo-500 bg-indigo-50' }
    if (t.includes('web') || t.includes('html')) return { icon: 'bi-globe', color: 'text-cyan-500 bg-cyan-50' }
    if (t.includes('c ')) return { icon: 'bi-c-circle', color: 'text-blue-700 bg-blue-50' } // C Programming matches
    if (t.includes('office') || t.includes('p.p')) return { icon: 'bi-microsoft', color: 'text-orange-500 bg-orange-50' }
    if (t.includes('account') || t.includes('tally')) return { icon: 'bi-calculator', color: 'text-emerald-500 bg-emerald-50' }
    if (t.includes('hardware') || t.includes('net')) return { icon: 'bi-router', color: 'text-slate-500 bg-slate-50' }
    if (t.includes('diploma')) return { icon: 'bi-award', color: 'text-purple-500 bg-purple-50' }

    return { icon: 'bi-code-square', color: 'text-blue-600 bg-blue-50' }
}

export const courseService = {
    async getCourses(): Promise<Course[]> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true })

        if (error) throw error

        // Map Supabase data to UI compatible format
        return (data || []).map((course: any) => {
            const style = getCourseStyle(course.course_name)
            return {
                ...course,
                title: course.course_name,
                description: course.description || (course.syllabus && course.syllabus.length > 0 ? course.syllabus.join(', ') : 'No description available'),
                icon: style.icon,
                color: style.color,
                price: course.fees?.total ? `₹${course.fees.total}` : 'Contact for Price'
            }
        }) as Course[]
    }
}
