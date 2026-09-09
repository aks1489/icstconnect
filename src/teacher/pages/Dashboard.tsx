import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
    IconPresentation as Presentation,
    IconFileText as FileText,
    IconUsers as Users,
    IconPlus as Plus,
    IconCalendarPlus as CalendarPlus,
    IconRotate as RotateCcw,
    IconArrowRight as ArrowRight
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface MetricState {
    value: number
    loading: boolean
    error: string | null
}

export default function TeacherDashboard() {
    const { profile } = useAuth()

    const [classesMetric, setClassesMetric] = useState<MetricState>({
        value: 0,
        loading: true,
        error: null
    })

    const [examsMetric, setExamsMetric] = useState<MetricState>({
        value: 0,
        loading: true,
        error: null
    })

    const [studentsMetric, setStudentsMetric] = useState<MetricState>({
        value: 0,
        loading: true,
        error: null
    })

    // Fetch live active classes
    const fetchClasses = useCallback(async () => {
        setClassesMetric(prev => ({ ...prev, loading: true, error: null }))
        try {
            const { count, error } = await supabase
                .from('classes')
                .select('*', { count: 'exact', head: true })

            if (error) throw error
            setClassesMetric({
                value: count ?? 0,
                loading: false,
                error: null
            })
        } catch (err: unknown) {
            console.error('Error fetching teacher classes:', err)
            setClassesMetric({
                value: 0,
                loading: false,
                error: (err as Error).message || 'Failed to load active classes'
            })
        }
    }, [])

    // Fetch live upcoming exams
    const fetchExams = useCallback(async () => {
        setExamsMetric(prev => ({ ...prev, loading: true, error: null }))
        try {
            const { count, error } = await supabase
                .from('tests')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)

            if (error) throw error
            setExamsMetric({
                value: count ?? 0,
                loading: false,
                error: null
            })
        } catch (err: unknown) {
            console.error('Error fetching teacher exams:', err)
            setExamsMetric({
                value: 0,
                loading: false,
                error: (err as Error).message || 'Failed to load upcoming exams'
            })
        }
    }, [])

    // Fetch live student count
    const fetchStudents = useCallback(async () => {
        setStudentsMetric(prev => ({ ...prev, loading: true, error: null }))
        try {
            const { count, error } = await supabase
                .from('enrollments')
                .select('student_id', { count: 'exact', head: true })

            if (error) throw error
            setStudentsMetric({
                value: count ?? 0,
                loading: false,
                error: null
            })
        } catch (err: unknown) {
            console.error('Error fetching teacher students:', err)
            setStudentsMetric({
                value: 0,
                loading: false,
                error: (err as Error).message || 'Failed to load enrolled students'
            })
        }
    }, [])

    useEffect(() => {
        fetchClasses()
        fetchExams()
        fetchStudents()
    }, [fetchClasses, fetchExams, fetchStudents])

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Hello, {profile?.full_name || 'Teacher'}!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Here is what is happening across your institutional classes today.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Classes Card */}
                <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <Presentation size={24} />
                        </div>
                        {classesMetric.error && (
                            <button
                                onClick={fetchClasses}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Retry loading classes"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                    <div>
                        {classesMetric.loading ? (
                            <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mb-1" />
                        ) : classesMetric.error ? (
                            <div className="text-xs text-rose-500 font-mono mb-1">ICST-TEA-CLS-001</div>
                        ) : (
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {classesMetric.value}
                            </h3>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Classes</p>
                    </div>
                </div>

                {/* Upcoming Exams Card */}
                <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <FileText size={24} />
                        </div>
                        {examsMetric.error && (
                            <button
                                onClick={fetchExams}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Retry loading exams"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                    <div>
                        {examsMetric.loading ? (
                            <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mb-1" />
                        ) : examsMetric.error ? (
                            <div className="text-xs text-rose-500 font-mono mb-1">ICST-TEA-EXM-001</div>
                        ) : (
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {examsMetric.value}
                            </h3>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Examinations</p>
                    </div>
                </div>

                {/* Total Students Card */}
                <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <Users size={24} />
                        </div>
                        {studentsMetric.error && (
                            <button
                                onClick={fetchStudents}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Retry loading students"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                    <div>
                        {studentsMetric.loading ? (
                            <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mb-1" />
                        ) : studentsMetric.error ? (
                            <div className="text-xs text-rose-500 font-mono mb-1">ICST-TEA-STU-001</div>
                        ) : (
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {studentsMetric.value}
                            </h3>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Enrolled Students</p>
                    </div>
                </div>
            </div>

            {/* Operational Quick Actions */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Quick Operational Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/teacher/classes"
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#2572AB] dark:hover:border-[#4C96C2] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#2572AB]/10 dark:bg-[#4C96C2]/15 flex items-center justify-center text-[#2572AB] dark:text-[#4C96C2]">
                                <Plus size={20} />
                            </div>
                            <div>
                                <span className="block font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-[#2572AB] dark:group-hover:text-[#4C96C2] transition-colors">
                                    Manage Active Classes & Progress
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                    View rosters, update course milestones, and record attendance
                                </span>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-[#2572AB] dark:group-hover:text-[#4C96C2] transition-colors shrink-0 ml-2" />
                    </Link>

                    <Link
                        to="/teacher/calendar"
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <CalendarPlus size={20} />
                            </div>
                            <div>
                                <span className="block font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    Academic Schedule & Exams
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                    Review upcoming exam timings and scheduled class slots
                                </span>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
