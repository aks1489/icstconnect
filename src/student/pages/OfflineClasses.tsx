import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ClassSession {
    id: number
    title: string
    date: string
    content: string
    status: string
    course: {
        title: string
        icon: string
        color: string
    }
}

export default function OfflineClasses() {
    const { user } = useAuth()
    const [classes, setClasses] = useState<ClassSession[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchClasses()
        }
    }, [user])

    const fetchClasses = async () => {
        try {
            // 1. Get enrolled course IDs
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user!.id)

            if (enrollmentError) throw enrollmentError

            const courseIds = enrollments.map(e => e.course_id)

            if (courseIds.length === 0) {
                setLoading(false)
                return
            }

            // 2. Get classes for those courses
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select(`
                    *,
                    course:courses (
                        title,
                        icon,
                        color
                    )
                `)
                .in('course_id', courseIds)
                .order('date', { ascending: false })

            if (classesError) throw classesError

            setClasses(classesData)
        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading classes...</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Offline Classes</h2>

            {classes.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No classes scheduled yet.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((session) => (
                        <div key={session.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                            <div className={`p-4 ${(session.course.color || '').split(' ')[1] || 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full bg-white/50`}>
                                        {session.course.title}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                    </span>
                                </div>
                                <h3 className="mt-2 text-lg font-semibold text-gray-900">{session.title}</h3>
                                <div className="mt-1 flex items-center text-sm text-gray-600">
                                    <i className="bi bi-calendar-event mr-2"></i>
                                    {new Date(session.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 text-sm line-clamp-3">
                                    {session.content || 'No content description available.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
