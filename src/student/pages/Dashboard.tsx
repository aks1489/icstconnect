import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
    IconBook as Book,
    IconTrophy as Trophy,
    IconStar as Star,
    IconBookUpload as BookPlus,
    IconChevronRight as ChevronRight,
    IconSparkles as Sparkles,
    IconPencil as Pencil,
    IconSchool as GraduationCap
} from '@tabler/icons-react'
import { getIcon } from '../../utils/iconMapper'
import { STUDENT_ACTIONS } from '../../config/navigation'
import UserAvatar from '../../components/common/UserAvatar'
import AvatarPickerModal from '../../components/common/AvatarPickerModal'

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
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)

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

    const firstName = profile?.full_name?.split(' ')[0] || 'Student'

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-inter">
            {/* Header / Student Profile Spotlight Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 dark:from-indigo-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/10 text-white border border-indigo-400/20 dark:border-indigo-800/40">
                {/* Decorative Ambient Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/15 dark:bg-violet-500/10 rounded-full blur-3xl translate-y-8 -translate-x-8 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Avatar + Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                        {/* Interactive Avatar Spotlight */}
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => setIsAvatarPickerOpen(true)}
                            title="Click to choose or roll a new avatar"
                        >
                            <div className="p-1 rounded-3xl bg-white/20 dark:bg-white/10 backdrop-blur-md shadow-lg group-hover:scale-105 group-hover:bg-white/30 transition-all duration-300">
                                <UserAvatar
                                    src={profile?.avatar_url}
                                    name={profile?.full_name}
                                    size="xl"
                                    showStatus
                                    statusColor="bg-emerald-400"
                                    shape="rounded-rect"
                                    editable
                                />
                            </div>
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold tracking-tight shadow-md border border-white/20 whitespace-nowrap opacity-90 group-hover:opacity-100 flex items-center gap-1">
                                <Sparkles size={10} className="text-amber-300" />
                                Roll Avatar
                            </span>
                        </div>

                        {/* Title & Badges */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 dark:bg-white/10 text-white border border-white/20 backdrop-blur-xs">
                                    <GraduationCap size={13} />
                                    ICST Student
                                </span>
                                {profile?.enrollment_center && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/30 text-indigo-100 border border-indigo-400/20">
                                        Center: {profile.enrollment_center}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Welcome Back, {firstName}! 👋
                            </h1>
                            <p className="text-indigo-100/90 dark:text-indigo-200 text-xs sm:text-sm max-w-xl leading-relaxed">
                                You have {courses.length} active {courses.length === 1 ? 'course' : 'courses'}. Track your classes, practice for online assessments, and download your certifications.
                            </p>

                            {/* Quick Avatar Actions */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsAvatarPickerOpen(true)}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition-colors cursor-pointer min-h-[40px] shadow-2xs"
                                >
                                    <Sparkles size={14} className="text-amber-300" />
                                    Change Avatar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/student/complete-profile')}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs border border-white/10 backdrop-blur-xs transition-colors cursor-pointer min-h-[40px]"
                                >
                                    <Pencil size={13} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick ID Card Widget */}
                    <div className="hidden lg:flex flex-col items-end justify-center p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md min-w-[200px]">
                        <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Student Status</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-sm font-bold text-white">Active Enrollment</span>
                        </div>
                        <p className="text-[11px] text-indigo-200/80 mt-1">
                            {profile?.email || user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Overview (3-Column compact on Mobile) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 md:p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 transition-colors">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0">
                        <Book className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">{courses.length}</h3>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Enrolled</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 md:p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 transition-colors">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                        <Trophy className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">0</h3>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Tests</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 md:p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-4 transition-colors">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center flex-shrink-0">
                        <Star className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">0%</h3>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Avg Score</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Courses Section (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Courses</h2>
                        <button
                            onClick={() => navigate('/courses')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                            Browse All Courses →
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {courses.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center transition-colors">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 text-slate-400 dark:text-slate-500">
                                    <BookPlus size={32} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No courses yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4">Start your learning journey today by browsing our accredited syllabus!</p>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                                >
                                    Explore Courses
                                </button>
                            </div>
                        ) : (
                            courses.map((item) => {
                                const IconComponent = getIcon(item.course.icon)
                                return (
                                    <div
                                        key={item.course.id}
                                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all group flex gap-5 items-center"
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center ${(item.course.color || '').split(' ')[0].replace('text-', 'bg-').replace('500', '100') || 'bg-blue-100 dark:bg-blue-950/60'}`}>
                                            <IconComponent className={`text-2xl ${(item.course.color || '').split(' ')[0] || 'text-blue-600 dark:text-blue-400'}`} size={28} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {item.course.course_name}
                                                </h3>
                                                {item.class && (
                                                    <span className="bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-violet-100 dark:border-violet-800">
                                                        {item.class.batch_name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                                                {item.course.description}
                                            </p>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>
                                        <button className="flex-shrink-0 w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Widget (Right 1/3) */}
                <div className="space-y-6">
                    {/* Quick Navigation Widget */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2.5">
                            {STUDENT_ACTIONS.filter(a => a.path !== '/student/dashboard').map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(action.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group text-left cursor-pointer"
                                >
                                    <div className={`w-9 h-9 rounded-full ${action.color.replace('text-', 'bg-').replace('600', '100 dark:bg-slate-800')} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                                        <action.icon className={`${action.color}`} size={18} />
                                    </div>
                                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Avatar Studio Modal */}
            <AvatarPickerModal
                isOpen={isAvatarPickerOpen}
                onClose={() => setIsAvatarPickerOpen(false)}
                currentAvatarUrl={profile?.avatar_url}
                userName={profile?.full_name}
            />
        </div>
    )
}
