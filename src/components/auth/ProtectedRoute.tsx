import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { IconShieldLock, IconArrowLeft } from '@tabler/icons-react'
import SEOHead from '../common/SEOHead'

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAdmin?: boolean
    requireSuperAdmin?: boolean
    requireTeacher?: boolean
    requireStudent?: boolean
    requireStaff?: boolean
    allowedRoles?: string[]
    requiredPermission?: string
}

export default function ProtectedRoute({
    children,
    requireAdmin = false,
    requireSuperAdmin = false,
    requireTeacher = false,
    requireStudent = false,
    requireStaff = false,
    allowedRoles,
    requiredPermission
}: ProtectedRouteProps) {
    const { user, profile, isAdmin, isSuperAdmin, isTeacher, isStaff, hasPerm, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-9 h-9 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        // Redirect to login but save the attempted location
        if (requireSuperAdmin || requireAdmin) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />
        }
        if (requireTeacher) {
            return <Navigate to="/teacher/login" state={{ from: location }} replace />
        }
        if (requireStaff) {
            return <Navigate to="/staff/login" state={{ from: location }} replace />
        }
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (profile?.requires_password_change && location.pathname !== '/force-password-change') {
        return <Navigate to="/force-password-change" replace />
    }

    // Role-based destination resolver for unauthorized attempts
    const getRoleHome = () => {
        const role = profile?.role
        if (role === 'admin' || role === 'super_admin') return '/admin/dashboard'
        if (role === 'teacher') return '/teacher/dashboard'
        if (role === 'receptionist') return '/staff/reception'
        if (role === 'lab_assistant') return '/staff/lab'
        if (role === 'maintenance') return '/staff/maintenance'
        return '/student/dashboard'
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to={getRoleHome()} replace />
    }

    if (requireTeacher && !isTeacher) {
        return <Navigate to={getRoleHome()} replace />
    }

    if (requireStaff && !isStaff) {
        return <Navigate to="/student/dashboard" replace />
    }

    if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
        return <Navigate to={getRoleHome()} replace />
    }

    if (requireStudent && (isAdmin || isStaff)) {
        return <Navigate to={getRoleHome()} replace />
    }

    // Capability matrix permission gate
    if (requiredPermission && !isSuperAdmin && !hasPerm(requiredPermission)) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center p-4">
                <SEOHead
                    title="Access Restricted - ICST Connect"
                    canonical={location.pathname}
                    noindex={true}
                />
                <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <IconShieldLock size={36} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Capability Restricted
                        </span>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            Permission Required
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Access to this section requires the capability <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{requiredPermission}</code>, which is currently revoked or not assigned to your account in the Super Admin Permission Matrix.
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                        Active role: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{profile?.role || 'Guest'}</span>
                    </p>
                    <div className="pt-2">
                        <Link
                            to={getRoleHome() === location.pathname ? '/quick-access' : getRoleHome()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md"
                        >
                            <IconArrowLeft size={16} />
                            {getRoleHome() === location.pathname ? 'Return to Safe Hub' : 'Return to Safe Dashboard'}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

