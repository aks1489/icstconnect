import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { STUDENT_ACTIONS } from '../../config/navigation'

interface EnrolledCourse {
    course: {
        id: number
        course_name: string
        icon: string
        color: string
        description: string
    }
    enrolled_at: string
    class?: {
        batch_name: string
        batch_number: number
    }
}

export default function StudentDashboard() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
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
                        course_name,
                        icon,
                        color,
                        description
                    ),
                    class:classes (
                        batch_name,
                        batch_number
                    )
                `)
                .eq('student_id', user!.id)

            if (error) throw error

            setCourses(data as unknown as EnrolledCourse[])
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 shadow-xl shadow-indigo-200 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 opacity-10 rounded-full blur-3xl translate-y-8 -translate-x-8"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back, {profile?.full_name?.split(' ')[0]}! 👋</h1>
                    <p className="text-indigo-100 max-w-xl">
                        You have {courses.length} active courses. Continue where you left off or explore new topics.
                    </p>
                </div>
            </div>

            {/* Quick Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <i className="bi bi-book-fill text-2xl text-blue-600"></i>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{courses.length}</h3>
                        <p className="text-sm text-slate-500 font-medium">Enrolled Courses</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <i className="bi bi-trophy-fill text-2xl text-emerald-600"></i>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">0</h3>
                        <p className="text-sm text-slate-500 font-medium">Completed Tests</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <i className="bi bi-star-fill text-2xl text-amber-600"></i>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">0%</h3>
                        <p className="text-sm text-slate-500 font-medium">Avg. Score</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Courses Section (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Your Courses</h2>
                        <button onClick={() => navigate('/courses')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                            Browse All
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {courses.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                    <i className="bi bi-journal-plus text-3xl text-slate-400"></i>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700">No courses yet</h3>
                                <p className="text-slate-500 text-sm mb-4">Start your learning journey today!</p>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        ) : (
                            courses.map((item) => (
                                <div key={item.course.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group flex gap-5 items-center">
                                    <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center ${(item.course.color || '').split(' ')[0].replace('text-', 'bg-').replace('500', '100') || 'bg-blue-100'}`}>
                                        <i className={`bi ${item.course.icon} text-3xl ${(item.course.color || '').split(' ')[0] || 'text-blue-600'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                {item.course.course_name}
                                            </h3>
                                            {item.class && (
                                                <span className="bg-violet-50 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-violet-100">
                                                    {item.class.batch_name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                                            {item.course.description}
                                        </p>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '0%' }}></div>
                                        </div>
                                    </div>
                                    <button className="flex-shrink-0 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Widget (Right 1/3) */}
                <div className="space-y-6">
                    {/* Quick Navigation Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {STUDENT_ACTIONS.filter(a => a.path !== '/student/dashboard').map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                                >
                                    <div className={`w-10 h-10 rounded-full ${action.color.replace('text-', 'bg-').replace('600', '100')} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <i className={`bi ${action.icon} ${action.color}`}></i>
                                    </div>
                                    <span className="font-semibold text-slate-600 group-hover:text-slate-900">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
