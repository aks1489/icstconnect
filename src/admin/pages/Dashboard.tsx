import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
    IconUsers as Users,
    IconBook2 as BookText,
    IconCalendarCheck as CalendarCheck,
    IconCloudDownload as CloudDownload,
    IconUserPlus as UserPlus,
    IconBook as Book,
    IconDiscount as Discount,
    IconChevronRight as ChevronRight,
    IconMail as Mail,
    IconArrowUpRight as ArrowUpRight
} from '@tabler/icons-react'
import { resolveAdminPath } from '../../utils/subdomain'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        classes: 0,
        discountClaims: 0,
        pendingClaims: 0
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
                { count: classesCount },
                { count: discountClaimsCount },
                { count: pendingClaimsCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('classes').select('*', { count: 'exact', head: true }),
                supabase.from('discount_inquiries').select('*', { count: 'exact', head: true }),
                supabase.from('discount_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ])

            setStats({
                students: studentsCount || 0,
                courses: coursesCount || 0,
                classes: classesCount || 0,
                discountClaims: discountClaimsCount || 0,
                pendingClaims: pendingClaimsCount || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                ))}
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total Students',
            value: stats.students,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            textColor: 'text-blue-600 dark:text-blue-400',
            path: resolveAdminPath('/admin/students')
        },
        {
            label: 'Active Courses',
            value: stats.courses,
            icon: BookText,
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            path: resolveAdminPath('/admin/courses')
        },
        {
            label: 'Scheduled Classes',
            value: stats.classes,
            icon: CalendarCheck,
            color: 'from-violet-500 to-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
            textColor: 'text-violet-600 dark:text-violet-400',
            path: resolveAdminPath('/admin/classes')
        },
        {
            label: 'Discount Claims',
            value: stats.discountClaims,
            badge: stats.pendingClaims > 0 ? `${stats.pendingClaims} pending` : undefined,
            badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
            icon: Discount,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            textColor: 'text-amber-600 dark:text-amber-400',
            path: resolveAdminPath('/admin/discount-claims')
        }
    ]

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back to your control center.</p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-sky-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors shadow-lg shadow-slate-900/20">
                    <CloudDownload size={18} />
                    <span>Generate Report</span>
                </button>
            </div>

            {/* Pending Discount Claims Alert Banner */}
            {stats.pendingClaims > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <Discount size={22} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {stats.pendingClaims} New Discount {stats.pendingClaims === 1 ? 'Claim' : 'Claims'} Awaiting Review
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Prospective students have claimed course vouchers that require status updates or follow-up.
                            </p>
                        </div>
                    </div>
                    <Link
                        to={resolveAdminPath('/admin/discount-claims')}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                        <span>Review Claims</span>
                        <ChevronRight size={14} />
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(stat.path)}
                        className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-1 cursor-pointer relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`text-2xl ${stat.textColor}`} size={24} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                {stat.badge ? (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full uppercase tracking-wider">
                                        Realtime
                                    </span>
                                )}
                                <ArrowUpRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" size={16} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate(resolveAdminPath('/admin/students'))}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-200 group text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                                <UserPlus className="text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" size={24} />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 text-center">Manage Students</span>
                        </button>
                        <button
                            onClick={() => navigate(resolveAdminPath('/admin/courses/new'))}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 group text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                                <Book className="text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" size={24} />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 text-center">New Course</span>
                        </button>
                        <button
                            onClick={() => navigate(resolveAdminPath('/admin/discount-claims'))}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-200 group text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors">
                                <Discount className="text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400" size={24} />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 text-center">Discount Claims</span>
                        </button>
                        <button
                            onClick={() => navigate(resolveAdminPath('/admin/mailbox'))}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 group text-left cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                                <Mail className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" size={24} />
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 text-center">Institution Mailbox</span>
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
                            <span className="text-indigo-200">Pending Discount Inquiries</span>
                            <span className="font-semibold text-amber-300">
                                {stats.pendingClaims > 0 ? `${stats.pendingClaims} Action Required` : 'All Caught Up'}
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
