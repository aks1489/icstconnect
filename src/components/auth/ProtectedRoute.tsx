import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAdmin?: boolean
    requireTeacher?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false, requireTeacher = false }: ProtectedRouteProps) {
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
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requireAdmin && !isAdmin) {
        // If user is logged in but not admin, redirect to home or student dashboard
        return <Navigate to="/student/dashboard" replace />
    }

    if (requireTeacher && !isTeacher) { // Assuming isTeacher is added to context or derived
        // Note: isTeacher might need to be destructured from useAuth()
        return <Navigate to="/student/dashboard" replace />
    }

    return <>{children}</>
}
