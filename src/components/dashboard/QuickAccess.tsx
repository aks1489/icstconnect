import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { STUDENT_ACTIONS, TEACHER_ACTIONS, ADMIN_ACTIONS } from '../../config/navigation'
import type { NavItem } from '../../config/navigation'

export default function QuickAccess() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    // Determine actions based on role
    // Assuming profile.role is available. If not, fallback or infer.
    // Based on previous files, profile usually has role.
    const role = profile?.role || 'student'

    let actions: NavItem[] = []
    if (role === 'admin') actions = ADMIN_ACTIONS
    else if (role === 'teacher') actions = TEACHER_ACTIONS
    else actions = STUDENT_ACTIONS

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const getTimeGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">

                {/* Header Section */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="inline-block p-2 px-4 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            {role} Portal
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {getTimeGreeting()}, <span className="text-indigo-600">{profile?.full_name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-slate-500 text-lg">What would you like to do today?</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in zoom-in duration-500 delay-100">

                    {/* Dynamic Actions */}
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(action.path)}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 group text-left hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <i className={`bi ${action.icon} text-2xl ${action.color}`}></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                {action.label}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {action.description}
                            </p>
                        </button>
                    ))}

                    {/* Profile Action (Always present) */}
                    <button
                        onClick={() => navigate('/profile')} // Assuming /profile or we can use a modal later
                        className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-white transition-all duration-300 group text-left hover:-translate-y-1 md:col-span-2 lg:col-span-1"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <i className="bi bi-person-circle text-2xl text-white"></i>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            Edit Profile
                        </h3>
                        <p className="text-sm text-indigo-100 font-medium">
                            Update your personal details and settings
                        </p>
                    </button>

                </div>

                {/* Footer Controls */}
                <div className="mt-12 flex justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <i className="bi bi-house"></i> Home
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                </div>

            </div>
        </div>
    )
}
