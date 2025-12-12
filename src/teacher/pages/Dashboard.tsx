import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function TeacherDashboard() {
    const { profile } = useAuth()
    const [stats, setStats] = useState({
        activeClasses: 0,
        upcomingExams: 0,
        students: 0
    })

    // Mock stats for now, replace with Supabase fetch later
    useEffect(() => {
        // TODO: Fetch real stats from database
        setStats({
            activeClasses: 5,
            upcomingExams: 2,
            students: 120
        })
    }, [])

    const statCards = [
        {
            label: 'Active Classes',
            value: stats.activeClasses,
            icon: 'bi-easel-fill',
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: 'Upcoming Exams',
            value: stats.upcomingExams,
            icon: 'bi-file-earmark-text-fill',
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            label: 'Total Students',
            value: stats.students,
            icon: 'bi-people-fill',
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600'
        }
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Hello, {profile?.full_name || 'Teacher'}!</h1>
                <p className="text-slate-500 mt-1">Here's what's happening in your classes today.</p>
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
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Placeholder */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <i className="bi bi-plus-lg text-slate-600 group-hover:text-emerald-600"></i>
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Update specific Course Progress</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-colors group text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                            <i className="bi bi-calendar-plus text-slate-600 group-hover:text-amber-600"></i>
                        </div>
                        <span className="font-semibold text-slate-700 group-hover:text-amber-700">Schedule Extra Class</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
