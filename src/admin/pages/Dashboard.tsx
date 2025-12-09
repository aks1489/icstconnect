import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        classes: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [
                { count: studentsCount },
                { count: coursesCount },
                { count: classesCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('classes').select('*', { count: 'exact', head: true })
            ])

            setStats({
                students: studentsCount || 0,
                courses: coursesCount || 0,
                classes: classesCount || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total Students',
            value: stats.students,
            icon: 'bi-people-fill',
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'Active Courses',
            value: stats.courses,
            icon: 'bi-journal-richtext',
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: 'Scheduled Classes',
            value: stats.classes,
            icon: 'bi-calendar-check-fill',
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50',
            textColor: 'text-violet-600'
        }
    ]

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back to your control center.</p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                    <i className="bi bi-cloud-download"></i>
                    <span>Generate Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <i className={`bi ${stat.icon} text-2xl ${stat.textColor}`}></i>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                Realtime
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
                                <i className="bi bi-person-plus text-slate-600 group-hover:text-indigo-600"></i>
                            </div>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-700">Add Student</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
                                <i className="bi bi-book text-slate-600 group-hover:text-emerald-600"></i>
                            </div>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-700">New Course</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-2">System Status</h3>
                    <p className="text-indigo-200 text-sm mb-6">Your system is running smoothly.</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-indigo-200">Database Connection</span>
                            <span className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Connected
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-indigo-200">Last Setup Check</span>
                            <span className="text-white font-mono">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
