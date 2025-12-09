import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentLayout() {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-indigo-600">Student Portal</h1>
                </div>
                <nav className="mt-4">
                    <Link to="/student/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Dashboard</Link>
                    <Link to="/student/offline-classes" className="block py-2 px-4 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Offline Classes</Link>
                    <Link to="/student/calendar" className="block py-2 px-4 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Calendar</Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t">
                    <button onClick={handleSignOut} className="w-full text-left text-red-600 hover:text-red-800">
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
