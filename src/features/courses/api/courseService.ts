import { supabase } from '../../../lib/supabase'
import type { Course } from '../types'
import { courseImages, fallbackImage } from '../data/courseImages'

export const courseService = {
    async getCourses(): Promise<Course[]> {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true })

        if (error) throw error

        // Map Supabase data to UI compatible format and use local images
        return (data || []).map((course: any) => ({
            ...course,
            title: course.course_name,
            // Description might be null in DB, fallback to generic text or first syllabus item
            description: course.description || (course.syllabus && course.syllabus.length > 0 ? course.syllabus.join(', ') : 'No description available'),
            // Use local image mapping, fallback to DB image (if any), then generic fallback
            image: courseImages[course.course_name] || course.image || fallbackImage,
            price: course.fees?.total ? `₹${course.fees.total}` : 'Contact for Price'
        })) as Course[]
    }
}
