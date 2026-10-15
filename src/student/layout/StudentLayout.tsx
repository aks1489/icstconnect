import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { IconChevronRight as ChevronRight, IconList as List, IconChevronDown as ChevronDown, IconPencil as Pencil, IconKey as Key, IconLayoutGrid as Grid, IconLogout as LogOut, IconAlertCircle as AlertCircle, IconHome as Home, IconBook as Book, IconPhoto as ImageIcon, IconDeviceDesktop as MonitorPlay, IconKeyboard as Keyboard, IconSparkles as Sparkles } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { STUDENT_ACTIONS } from '../../config/navigation'
import logo from '../../assets/logo.jpg'
import EditProfileModal from '../components/EditProfileModal'
import ChangePasswordModal from '../../components/auth/ChangePasswordModal'
import AvatarPickerModal from '../../components/common/AvatarPickerModal'
import UserAvatar from '../../components/common/UserAvatar'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { SEOHead } from '../../components/common/SEOHead'

export default function StudentLayout() {
    const { profile, signOut, isProfileComplete, hasPerm } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)
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
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-inter">
            <SEOHead
                title="Student Portal - ICST Connect"
                description="ICST Connect Student Portal - Access classes, exams, fees, and learning resources."
                canonical="/student"
                noindex={true}
            />
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
                    bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden w-72'}
                    flex flex-col shadow-xl lg:shadow-none
                `}
            >
                <div className="w-72 flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="ICST Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-xl object-cover shadow-sm"
                            />
                            <div>
                                <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white block">Student Portal</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">ICST Connect</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Profile Card in Sidebar */}
                    <div className="mx-4 mt-4 mb-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/95 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div
                                className="cursor-pointer group relative shrink-0"
                                onClick={() => setIsAvatarPickerOpen(true)}
                                title="Click to customize or roll avatar"
                            >
                                <UserAvatar
                                    src={profile?.avatar_url}
                                    name={profile?.full_name}
                                    size="md"
                                    showStatus
                                    statusColor="bg-emerald-500"
                                    editable
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {profile?.full_name || 'Student'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Student
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsAvatarPickerOpen(true)}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <Sparkles size={12} />
                                Change Avatar
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditProfileOpen(true)}
                                className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <Pencil size={11} />
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">
                            Menu
                        </div>
                        {STUDENT_ACTIONS.filter(item => !item.requiredPermission || hasPerm(item.requiredPermission)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-100 dark:shadow-none font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className={`text-lg ${isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} size={20} />
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                    <ChevronRight className="ml-auto text-xs opacity-50" size={16} />
                                )}
                            </Link>
                        ))}

                        <div className="mt-8 mb-4">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 mb-6"></div>
                            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-4">
                                Main Website
                            </div>
                            <div className="space-y-1">
                                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
                                    <Home className="text-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
                                    <span className="font-medium">Home Page</span>
                                </Link>
                                <Link to="/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
                                    <Book className="text-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
                                    <span className="font-medium">All Courses</span>
                                </Link>
                                <Link to="/online-test" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
                                    <MonitorPlay className="text-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
                                    <span className="font-medium">Online Tests</span>
                                </Link>
                                <Link to="/typing-practice" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
                                    <Keyboard className="text-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
                                    <span className="font-medium">Typing Portal</span>
                                </Link>
                                <Link to="/gallery" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
                                    <ImageIcon className="text-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={20} />
                                    <span className="font-medium">Gallery</span>
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header for Mobile and Desktop Toggle */}
                <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-20 transition-colors">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 lg:hidden cursor-pointer"
                        >
                            <List className="text-2xl" size={24} />
                        </button>
                        <span className="font-bold text-slate-800 dark:text-slate-100 lg:hidden">Student Portal</span>
                    </div>

                    {/* Top Right Profile & Theme Section */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <ThemeToggle />

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2.5 p-1 pl-2.5 pr-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xs transition-all group cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                        {profile?.full_name || 'Student'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                                        Student
                                    </p>
                                </div>
                                <UserAvatar
                                    src={profile?.avatar_url}
                                    name={profile?.full_name}
                                    size="sm"
                                    showStatus
                                />
                                <ChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                                        <UserAvatar
                                            src={profile?.avatar_url}
                                            name={profile?.full_name}
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                                                {profile?.full_name || 'Student'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {profile?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => { setIsAvatarPickerOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                        >
                                            <Sparkles size={16} />
                                            Choose / Roll Avatar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditProfileOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <Pencil size={16} />
                                            Edit Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsChangePasswordOpen(true); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <Key size={16} />
                                            Change Password
                                        </button>
                                        <Link
                                            to="/quick-access"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <Grid size={16} />
                                            Quick Access
                                        </Link>
                                    </div>

                                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content (Bottom Padded on Mobile for Bar) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 scroll-smooth transition-colors">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet context={{ dismissAlert }} />
                    </div>
                </main>

                {/* Mobile Bottom Navigation Bar (Optimized for Mobile Phones) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-1 py-1.5 shadow-lg shadow-black/10">
                    <div className="flex items-center justify-around max-w-md mx-auto">
                        {STUDENT_ACTIONS.map((item) => {
                            const active = isActive(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px]
                                        ${active
                                            ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                                        }
                                    `}
                                >
                                    <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400' : ''}`}>
                                        <item.icon size={19} />
                                    </div>
                                    <span className="text-[10px] tracking-tight truncate max-w-[64px]">
                                        {item.label.replace('My ', '')}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
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
