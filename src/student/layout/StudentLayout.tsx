import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, List, ChevronDown, Pencil, Key, Grid, LogOut, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    const [showProfileAlert, setShowProfileAlert] = useState(false)
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
        if (profile && !isProfileComplete && location.pathname !== '/student/complete-profile') {
            navigate('/student/complete-profile')
            setShowProfileAlert(true)

            const timer = setTimeout(() => setShowProfileAlert(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [profile, isProfileComplete, navigate, location.pathname])

    const dismissAlert = () => {
        if (showProfileAlert) setShowProfileAlert(false)
    }

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

            {/* Incomplete Profile Alert */}
            <AnimatePresence>
                {showProfileAlert && (
                    <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xl shadow-orange-500/30 rounded-full px-6 py-3 flex items-center gap-3 pointer-events-auto"
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 15, -15, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut"
                                }}
                                className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm"
                            >
                                <AlertCircle size={20} strokeWidth={2.5} className="text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-tight">Action Required</h3>
                                <p className="text-xs text-white/90 font-medium">Please complete your profile to continue</p>
                            </div>
                            <button
                                onClick={() => setShowProfileAlert(false)}
                                className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                <item.icon className={`text-lg ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} size={20} />
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                    <ChevronRight className="ml-auto text-xs opacity-50" size={16} />
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
                            <List className="text-2xl" size={24} />
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
                                <ChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} size={16} />
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
                                            <Pencil className="text-lg" size={18} />
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => { setIsChangePasswordOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <Key className="text-lg" size={18} />
                                            Change Password
                                        </button>
                                        <Link
                                            to="/quick-access"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <Grid className="text-lg" size={18} />
                                            Quick Access
                                        </Link>
                                    </div>

                                    <div className="p-2 border-t border-slate-100">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="text-lg" size={18} />
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
                        <Outlet context={{ dismissAlert }} />
                    </div>
                </main>
            </div>
        </div>
    )
}
