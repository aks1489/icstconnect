import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { TEACHER_ACTIONS } from '../../config/navigation'

export default function TeacherLayout() {
    const { signOut, user, profile } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Initialize based on screen width - default closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024)

    // Handle screen resize to auto-open/close
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true)
            } else {
                setIsSidebarOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    bg-slate-900 text-white transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden w-72'}
                    flex flex-col shadow-2xl
                `}
            >
                <div className="w-72 flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-800 bg-slate-950 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="text-xl font-bold">T</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight">Teacher Portal</h1>
                                <p className="text-xs text-slate-400">ICST Connect</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
                            Menu
                        </div>
                        {TEACHER_ACTIONS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 translate-x-1'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }
                                `}
                            >
                                <i className={`bi ${item.icon} text-lg ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}></i>
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                    <i className="bi bi-chevron-right ml-auto text-xs opacity-50"></i>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                {profile?.full_name?.charAt(0) || 'T'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-slate-200 truncate">{profile?.full_name || 'Teacher'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Link
                            to="/quick-access"
                            className="flex items-center gap-3 w-full p-3 mb-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group"
                        >
                            <i className="bi bi-grid text-lg"></i>
                            <span className="font-medium">Quick Access</span>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <i className="bi bi-box-arrow-right text-lg"></i>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">Sign Out</p>
                                <p className="text-xs opacity-60">End session</p>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header for Mobile and Desktop Toggle */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <i className="bi bi-list text-2xl"></i>
                    </button>
                    <span className="font-semibold text-slate-700 lg:hidden">Teacher Portal</span>
                    <div className="w-8 lg:hidden"></div> {/* Spacer for alignment */}
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
