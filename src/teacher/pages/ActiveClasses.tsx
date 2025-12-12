import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Course {
    id: number
    course_name: string
    description: string
    icon: string
    color: string
    topics_count?: number
    cleared_topics_count?: number
    enrolled_students?: number
}

export default function ActiveClasses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActiveClasses()
    }, [])

    const fetchActiveClasses = async () => {
        try {
            // 1. Fetch Courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .order('course_name')

            if (coursesError) throw coursesError

            // Mock Data Integration (Real counts would need complex joins or valid subqueries)
            // For now, we will simulate the "Teacher's Classes" aspect by showing all courses
            // In a real app, we'd filter by an 'assignments' table key

            const processedCourses = coursesData.map(course => ({
                ...course,
                topics_count: 12, // Placeholder
                cleared_topics_count: 5, // Placeholder
                enrolled_students: 24 // Placeholder
            }))

            setCourses(processedCourses)
        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your classes...</div>

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Active Classes</h1>
                    <p className="text-slate-500 mt-1">Manage progress and topics for your assigned courses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <div className={`h-24 ${(course.color || '').split(' ')[1] || 'bg-slate-100'} p-6 relative`}>
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-600 shadow-sm">
                                    {course.enrolled_students} Students
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center absolute -bottom-6 left-6">
                                <i className={`bi ${course.icon || 'bi-book'} text-xl ${(course.color || '').split(' ')[0] || 'text-slate-600'}`}></i>
                            </div>
                        </div>

                        <div className="pt-10 px-6 pb-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                {course.course_name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                                {course.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                    <span>Course Progress</span>
                                    <span>{Math.round((course.cleared_topics_count! / course.topics_count!) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${(course.cleared_topics_count! / course.topics_count!) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                    {course.cleared_topics_count} of {course.topics_count} topics cleared
                                </div>
                            </div>

                            <Link
                                to={`/teacher/classes/${course.id}`}
                                className="block w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100"
                            >
                                Manage Topics
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
