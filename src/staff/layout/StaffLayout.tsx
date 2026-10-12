import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
    IconLogout as LogOut,
    IconReceipt as Receipt,
    IconBuildingCommunity as Building2,
    IconMenu2 as Menu2
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/logo.jpg'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { SEOHead } from '../../components/common/SEOHead'

export default function StaffLayout() {
    const { profile, signOut, hasPerm } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024)

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
        navigate('/staff/login')
    }

    const role = profile?.role || 'staff'

    const getRoleDetails = () => {
        switch (role) {
            case 'receptionist':
                return {
                    title: 'Reception Portal',
                    badge: 'Front Desk In-Charge',
                    accent: 'from-amber-500 to-orange-600',
                    homePath: '/staff/reception'
                }
            case 'lab_assistant':
                return {
                    title: 'Lab Assistant Portal',
                    badge: 'Computer Lab Infrastructure',
                    accent: 'from-blue-600 to-cyan-600',
                    homePath: '/staff/lab'
                }
            case 'maintenance':
                return {
                    title: 'Maintenance Portal',
                    badge: 'Campus Facilities & Hygiene',
                    accent: 'from-emerald-600 to-teal-700',
                    homePath: '/staff/maintenance'
                }
            default:
                return {
                    title: 'Staff Portal',
                    badge: 'Institutional Staff',
                    accent: 'from-indigo-600 to-purple-600',
                    homePath: '/staff/reception'
                }
        }
    }

    const roleDetails = getRoleDetails()

    const navItems = [
        {
            label: 'Dashboard Hub',
            path: roleDetails.homePath,
            icon: Building2,
            requiredPermission: 'dashboard.view'
        },
        {
            label: 'My Payslips & Salary',
            path: `${roleDetails.homePath}/payslips`,
            icon: Receipt,
            requiredPermission: 'payroll.view'
        }
    ]

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-inter">
            <SEOHead
                title={`${roleDetails.title} - ICST Connect`}
                description="Staff Operational Portal at Institute of Computer Science & Technology."
                canonical="/staff"
                noindex={true}
            />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
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
                    {/* Header Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950 shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="ICST Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/10"
                            />
                            <div>
                                <span className="text-base font-bold tracking-tight block">
                                    {roleDetails.title}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    {roleDetails.badge}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
                            Operational Hub
                        </div>
                        {navItems.filter(item => !item.requiredPermission || hasPerm(item.requiredPermission)).map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }
                                `}
                            >
                                <item.icon className="text-lg" size={20} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile Info & Sign Out */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/30">
                                    {profile?.full_name?.charAt(0) || 'S'}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold truncate text-white">
                                        {profile?.full_name || 'Staff Member'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 capitalize">
                                        {role.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <ThemeToggle />
                                <button
                                    onClick={handleSignOut}
                                    title="Sign Out"
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Top Navbar */}
                <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu2 size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-bold text-sm">{roleDetails.title}</span>
                    </div>
                    <ThemeToggle />
                </header>

                {/* Outlet */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
