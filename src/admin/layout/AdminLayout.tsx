import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <nav className="mt-4">
                    <Link to="/admin/dashboard" className="block py-2 px-4 hover:bg-gray-700">Dashboard</Link>
                    <Link to="/admin/students" className="block py-2 px-4 hover:bg-gray-700">Students</Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4">
                    <button onClick={handleSignOut} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
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
