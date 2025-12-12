import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { STUDENT_ACTIONS } from '../../config/navigation'

export default function StudentLayout() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const isActive = (path: string) => {
        return location.pathname === path
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
                <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-slate-200">

                    {/* Brand Header */}
                    <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                                I
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                ICST Connect
                            </span>
                        </div>
                    </div>

                    {/* User Profile Summary */}
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                                {profile?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">
                                    {profile?.full_name || 'Student'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    Student Portal
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">
                            Menu
                        </p>
                        {STUDENT_ACTIONS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <i className={`bi ${item.icon} mr-3 text-lg transition-colors ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                    }`}></i>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-slate-100">
                        <Link
                            to="/quick-access"
                            className="flex items-center px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors mb-2"
                        >
                            <i className="bi bi-grid mr-3 text-slate-400"></i>
                            Quick Access
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <i className="bi bi-box-arrow-right mr-3"></i>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Wrapper */}
            <div className="flex flex-col flex-1 md:pl-72 transition-all duration-300">
                {/* Mobile Header (TODO: Add specific mobile toggle if needed, using generic header for now) */}
                <div className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
                    <span className="font-bold text-slate-800">ICST Connect</span>
                    <button className="p-2 text-slate-500">
                        <i className="bi bi-list text-2xl"></i>
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
