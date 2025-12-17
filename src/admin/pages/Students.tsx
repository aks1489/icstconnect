import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Users, ArrowRight, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import CreateStudentModal from '../../components/admin/CreateStudentModal'

interface StudentProfile {
    id: string
    full_name: string
    email: string
    created_at: string
}

export default function ManageStudents() {
    const [students, setStudents] = useState<StudentProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false })

            if (error) throw error

            setStudents(data)
        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading students...</div>

    return (
        <div>
            <CreateStudentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchStudents}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Manage Students</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    <UserPlus size={20} />
                    <span>Add Student</span>
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm overflow-hidden sm:rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th scope="col" className="relative px-6 py-4">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                            <Users className="text-xl text-slate-400" size={24} />
                                        </div>
                                        <p>No students found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                                    {student.full_name?.charAt(0) || 'S'}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-slate-900">{student.full_name || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-600">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{new Date(student.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/admin/students/${student.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            View
                                            <ArrowRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {students.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="text-xl text-slate-400" size={24} />
                        </div>
                        <p className="text-slate-500">No students found</p>
                    </div>
                ) : (
                    students.map((student) => (
                        <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                        {student.full_name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{student.full_name || 'Unknown'}</h3>
                                        <p className="text-xs text-slate-500">{new Date(student.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <Mail className="text-slate-400" size={16} />
                                    <span className="truncate">{student.email}</span>
                                </div>
                            </div>

                            <Link
                                to={`/admin/students/${student.id}`}
                                className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors font-medium text-sm"
                            >
                                View Profile
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
