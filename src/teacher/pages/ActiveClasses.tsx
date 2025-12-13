import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export interface Student {
    id: string
    full_name: string
    avatar_url: string
    enrollments: {
        course_id: number
        progress: number
        course: {
            id: number
            course_name: string
            icon: string
            color: string
        }
    }[]
}

export default function ActiveClasses() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActiveClasses()
    }, [])

    const fetchActiveClasses = async () => {
        try {
            // Fetch students who have enrollments
            const { data: enrollments, error } = await supabase
                .from('enrollments')
                .select(`
                    progress,
                    course:courses (
                        id,
                        course_name,
                        icon,
                        color
                    ),
                    student:profiles!enrollments_student_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .order('enrolled_at', { ascending: false })

            if (error) throw error

            const activeStudents = enrollments?.map((e: any) => ({
                id: e.student.id,
                full_name: e.student.full_name,
                avatar_url: e.student.avatar_url,
                enrollment: {
                    course_id: e.course.id,
                    progress: e.progress,
                    course: e.course
                }
            })) || []

            setStudents(activeStudents)

        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center bg-slate-50 rounded-xl">Loading active classes...</div>

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Active Classes</h1>
                    <p className="text-slate-500">Manage student progress and track performance</p>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <i className="bi bi-people text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No active classes</h3>
                    <p className="text-slate-500">As students enroll in courses, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((item: any, index) => (
                        <Link
                            to={`/teacher/classes/${item.id}/${item.enrollment.course_id}`}
                            key={`${item.id}-${item.enrollment.course_id}-${index}`}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group"
                        >
                            <div className={`h-24 ${(item.enrollment.course.color || '').split(' ')[1] || 'bg-slate-100'} relative p-6`}>
                                <div className="absolute -bottom-6 left-6 flex items-end">
                                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm">
                                        <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {item.avatar_url ? (
                                                <img src={item.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-indigo-600 font-bold text-sm">{item.full_name?.charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm text-slate-700 flex items-center gap-1">
                                        <i className={`bi ${item.enrollment.course.icon}`}></i>
                                        {item.enrollment.course.course_name}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-8 px-6 pb-6">
                                <h3 className="font-bold text-slate-800 mb-1">{item.full_name}</h3>
                                <p className="text-xs text-slate-500 mb-4">Click to manage progress</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                                        <span>Progress</span>
                                        <span>{item.enrollment.progress || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                                            style={{ width: `${item.enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
