import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { STUDENT_ACTIONS } from '../../config/navigation'
import logo from '../../assets/logo.jpg'
import EditProfileModal from '../components/EditProfileModal'
import ChangePasswordModal from '../../components/auth/ChangePasswordModal'

export default function StudentLayout() {
    const { profile, signOut, isProfileComplete } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
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
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header for Mobile and Desktop Toggle */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden"
                        >
                            <i className="bi bi-list text-2xl"></i>
                        </button>
                        <span className="font-semibold text-slate-700 lg:hidden">Student Portal</span>
                    </div>

                    {/* Top Right Profile Section */}
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 p-1 pl-3 pr-2 rounded-full border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-700 leading-tight">{profile?.full_name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Student</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 border border-white shadow-sm overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile?.full_name?.charAt(0) || 'S'
                                    )}
                                </div>
                                <i className={`bi bi-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 sm:hidden">
                                        <p className="font-bold text-slate-800">{profile?.full_name}</p>
                                        <p className="text-xs text-slate-500">{profile?.email}</p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => { setIsEditProfileOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <i className="bi bi-pencil-square text-lg"></i>
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsChangePasswordOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <i className="bi bi-key text-lg"></i>
                                            Change Password
                                        </button>
                                        <Link
                                            to="/quick-access"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <i className="bi bi-grid text-lg"></i>
                                            Quick Access
                                        </Link>
                                    </div>

                                    <div className="p-2 border-t border-slate-100">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <i className="bi bi-box-arrow-right text-lg"></i>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
