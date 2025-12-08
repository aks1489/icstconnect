import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface EnrolledCourse {
    course: {
        id: number
        title: string
        icon: string
        color: string
        description: string
    }
    enrolled_at: string
}

export default function StudentDashboard() {
    const { user, profile } = useAuth()
    const [courses, setCourses] = useState<EnrolledCourse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchEnrolledCourses()
        }
    }, [user])

    const fetchEnrolledCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    enrolled_at,
                    course:courses (
                        id,
                        title,
                        icon,
                        color,
                        description
                    )
                `)
                .eq('student_id', user!.id)

            if (error) throw error

            // Cast the data to match our interface, handling the potential array/object mismatch from Supabase types
            setCourses(data as unknown as EnrolledCourse[])
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading dashboard...</div>
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name || 'Student'}!</h1>
                <p className="text-gray-600 mt-2">Here are your enrolled courses.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.length === 0 ? (
                    <div className="col-span-full bg-white p-6 rounded-lg shadow text-center text-gray-500">
                        You are not enrolled in any courses yet.
                    </div>
                ) : (
                    courses.map((item) => (
                        <div key={item.course.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                            <div className={`p-6 ${item.course.color.split(' ')[1] || 'bg-gray-50'}`}>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.course.color.split(' ')[0].replace('text-', 'bg-').replace('500', '100') || 'bg-blue-100'}`}>
                                    <i className={`bi ${item.course.icon} text-2xl ${item.course.color.split(' ')[0] || 'text-blue-600'}`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{item.course.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">Enrolled on {new Date(item.enrolled_at).toLocaleDateString()}</p>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {item.course.description}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Progress</span>
                                    <span>0%</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
