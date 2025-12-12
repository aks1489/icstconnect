import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { STUDENT_ACTIONS } from '../../config/navigation'
import logo from '../../assets/logo.jpg'
import EditProfileModal from '../components/EditProfileModal'

export default function StudentLayout() {
    const { profile, signOut, isProfileComplete } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

    // Guard: Redirect to complete profile if incomplete
    useEffect(() => {
        // Wait for profile to load (profile might be null initially while loading)
        // But useAuth handles loading state, so if we are here, we might have data
        // We actually need to be careful not to redirect prematurely.
        // Assuming AuthContext 'loading' prop handles the initial wait.

        if (profile && !isProfileComplete) {
            navigate('/student/complete-profile')
        }
    }, [profile, isProfileComplete, navigate])

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
        navigate('/')
    }

    const isActive = (path: string) => {
        return location.pathname === path
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />

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
                    bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden w-72'}
                    flex flex-col shadow-xl lg:shadow-none
                `}
            >
                <div className="w-72 flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="ICST Logo"
                                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                            />
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-800">Student Portal</h1>
                                <p className="text-xs text-slate-500">ICST Connect</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
                            Menu
                        </div>
                        {STUDENT_ACTIONS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <i className={`bi ${item.icon} text-lg ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                    <i className="bi bi-chevron-right ml-auto text-xs opacity-50"></i>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="relative group/avatar"
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 border-2 border-white shadow-sm overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile?.full_name?.charAt(0) || 'S'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <i className="bi bi-pencil-fill text-xs"></i>
                                </div>
                            </button>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{profile?.full_name || 'Student'}</p>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium truncate flex items-center gap-1"
                                >
                                    Edit Profile <i className="bi bi-pencil-square"></i>
                                </button>
                            </div>
                        </div>
                        <Link
                            to="/quick-access"
                            className="flex items-center gap-3 w-full p-3 mb-2 rounded-xl text-slate-500 hover:bg-white hover:text-slate-900 transition-all duration-200 group border border-transparent hover:border-slate-200 hover:shadow-sm"
                        >
                            <i className="bi bi-grid text-lg"></i>
                            <span className="font-medium">Quick Access</span>
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group border border-transparent"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
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
                    <span className="font-semibold text-slate-700 lg:hidden">Student Portal</span>
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
