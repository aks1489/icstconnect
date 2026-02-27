import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAdmin?: boolean
    requireTeacher?: boolean
    requireStudent?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false, requireTeacher = false, requireStudent = false }: ProtectedRouteProps) {
    const { user, isAdmin, isTeacher, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!user) {
        // Redirect to login but save the attempted location
        if (requireAdmin) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />
        }
        if (requireTeacher) {
            return <Navigate to="/teacher/login" state={{ from: location }} replace />
        }
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requireAdmin && !isAdmin) {
        if (isTeacher) return <Navigate to="/teacher/dashboard" replace />
        return <Navigate to="/student/dashboard" replace />
    }

    if (requireTeacher && !isTeacher) {
        if (isAdmin) return <Navigate to="/admin/dashboard" replace />
        return <Navigate to="/student/dashboard" replace />
    }

    if (requireStudent && (isAdmin || isTeacher)) {
        if (isAdmin) return <Navigate to="/admin/dashboard" replace />
        if (isTeacher) return <Navigate to="/teacher/dashboard" replace />
    }

    // Default catch-all for root level protected routes (like /quick-access)
    // If you need more granular control over them, you can add more checks.

    return <>{children}</>
}
