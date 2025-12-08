import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        classes: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [
                { count: studentsCount },
                { count: coursesCount },
                { count: classesCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('classes').select('*', { count: 'exact', head: true })
            ])

            setStats({
                students: studentsCount || 0,
                courses: coursesCount || 0,
                classes: classesCount || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading stats...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Total Students</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.students}</h3>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <i className="bi bi-people text-indigo-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Total Courses</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.courses}</h3>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <i className="bi bi-book text-emerald-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-semibold">Scheduled Classes</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.classes}</h3>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <i className="bi bi-calendar-event text-orange-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
