import { supabase } from '../lib/supabase'
import type { Course, Module } from '../types/course'
import { getEnrichedCourseData, COURSE_ENRICHMENT_CATALOG } from '../data/courseEnrichment'

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


// Helper to generate tags based on content
const generateTags = (title: string, desc: string): string[] => {
    const tags = new Set<string>()
    const text = `${title} ${desc}`.toLowerCase()

    const keywords = [
        { key: 'python', tag: 'Python' },
        { key: 'java', tag: 'Java' },
        { key: 'react', tag: 'React' },
        { key: 'node', tag: 'Node.js' },
        { key: 'sql', tag: 'SQL' },
        { key: 'database', tag: 'Database' },
        { key: 'html', tag: 'HTML' },
        { key: 'css', tag: 'CSS' },
        { key: 'web', tag: 'Web Dev' },
        { key: 'c++', tag: 'C++' },
        { key: 'c#', tag: 'C#' },
        { key: 'c ', tag: 'C Language' },
        { key: 'office', tag: 'MS Office' },
        { key: 'excel', tag: 'Excel' },
        { key: 'tally', tag: 'Tally' },
        { key: 'accounting', tag: 'Accounting' },
        { key: 'gst', tag: 'GST' },
        { key: 'hardware', tag: 'Hardware' },
        { key: 'network', tag: 'Networking' },
        { key: 'cyber', tag: 'Cyber Security' },
        { key: 'ethical hacking', tag: 'Ethical Hacking' },
        { key: 'data entry', tag: 'Data Entry' },
        { key: 'typing', tag: 'Typing' },
        { key: 'dtp', tag: 'DTP' },
        { key: 'photoshop', tag: 'Photoshop' },
        { key: 'dita', tag: 'DITA' },
        { key: 'adca', tag: 'ADCA' },
        { key: 'dca', tag: 'DCA' },
        { key: 'kids', tag: 'Kids Coding' },
        { key: 'school', tag: 'School Computer' },
        { key: 'diploma', tag: 'Diploma' },
        { key: 'design', tag: 'Design' }
    ]

    keywords.forEach(({ key, tag }) => {
        if (text.includes(key)) tags.add(tag)
    })

    return Array.from(tags)
}

export const courseService = {
    async getCourses(): Promise<Course[]> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true })

        if (error) throw error

        // Map Supabase data to UI compatible format, applying SEO enrichment
        return (data || []).map((course: any) => {
            const enriched = getEnrichedCourseData(course)
            const style = getCourseStyle(enriched.course_name)

            // Resolve rich tags from database, enrichment catalog, or generator
            const tags = (enriched.tags && enriched.tags.length > 0)
                ? enriched.tags
                : (COURSE_ENRICHMENT_CATALOG[enriched.id]?.tags || generateTags(enriched.course_name, enriched.description || ''))

            return {
                ...enriched,
                title: enriched.course_name,
                description: enriched.description || (enriched.syllabus && enriched.syllabus.length > 0 ? enriched.syllabus.join(', ') : 'No description available'),
                icon: style.icon,
                color: style.color,
                price: enriched.fees?.total ? `₹${enriched.fees.total}` : 'Contact for Price',
                tags: tags
            }
        }) as Course[]
    },

    async getCourseById(id: number | string): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        if (!data) return null

        const enriched = getEnrichedCourseData(data)
        const style = getCourseStyle(enriched.course_name)
        const tags = (enriched.tags && enriched.tags.length > 0)
            ? enriched.tags
            : (COURSE_ENRICHMENT_CATALOG[enriched.id]?.tags || generateTags(enriched.course_name, enriched.description || ''))

        return {
            ...enriched,
            title: enriched.course_name,
            description: enriched.description || (enriched.syllabus && enriched.syllabus.length > 0 ? enriched.syllabus.join(', ') : 'No description available'),
            icon: style.icon,
            color: style.color,
            price: enriched.fees?.total ? `₹${enriched.fees.total}` : 'Contact for Price',
            tags: tags
        } as Course
    },

    async getCourseStructure(courseId: number): Promise<Module[]> {
        // 1. Fetch Modules
        const { data: modulesData, error: modulesError } = await supabase
            .from('course_modules')
            .select('*')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true })

        if (modulesError) throw modulesError

        if (!modulesData || modulesData.length === 0) {
            return []
        }

        // 2. Fetch Topics for these modules
        const moduleIds = modulesData.map((m: any) => m.id)
        const { data: topicsData, error: topicsError } = await supabase
            .from('course_topics')
            .select('*')
            .in('module_id', moduleIds)
            .order('sort_order', { ascending: true })

        if (topicsError) throw topicsError

        // 3. Merge Topics into Modules
        return modulesData.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            sort_order: m.sort_order,
            topics: topicsData?.filter((t: any) => t.module_id === m.id).map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                sort_order: t.sort_order
            })) || []
        }))
    }
}
