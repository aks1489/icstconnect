import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Grid, List, UserPlus, Users, ChevronRight, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import CreateTeacherModal from '../../components/admin/CreateTeacherModal'

interface TeacherProfile {
    id: string
    full_name: string
    email: string
    created_at: string
    teacher_id?: string
    avatar_url?: string
}

export default function Teachers() {
    const [teachers, setTeachers] = useState<TeacherProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'teacher')
                .order('full_name')

            if (error) throw error
            setTeachers(data)
        } catch (error) {
            console.error('Error fetching teachers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.teacher_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Faculty Management</h1>
                    <p className="text-slate-500 mt-1">Manage your teaching staff and their permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        <span>Add Teacher</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Content Grid/List */}
            {filteredTeachers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-3xl text-indigo-300" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Teachers Found</h3>
                    <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                        {searchTerm ? 'No matches for your search' : 'Add your first teacher to get started.'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTeachers.map(teacher => (
                        <div key={teacher.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                                <div className="absolute top-4 right-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-white/20"></div>
                                </div>
                                {teacher.teacher_id && (
                                    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-mono text-white border border-white/10 shadow-sm">
                                        {teacher.teacher_id}
                                    </div>
                                )}
                            </div>
                            <div className="px-6 pb-6 relative">
                                <Link to={`/admin/teachers/${teacher.id}`} className="block -mt-12 mb-4">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md mx-auto transform group-hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden">
                                            {teacher.avatar_url ? (
                                                <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 w-full h-full flex items-center justify-center">
                                                    {teacher.full_name?.charAt(0) || 'T'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{teacher.full_name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{teacher.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                                        <div className="text-lg font-bold text-indigo-600">0</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Classes</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                                        <div className="text-lg font-bold text-purple-600">0</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</div>
                                    </div>
                                </div>

                                <Link
                                    to={`/admin/teachers/${teacher.id}`}
                                    className="block w-full py-2.5 rounded-xl bg-white border-2 border-slate-100 text-slate-600 text-sm font-bold text-center hover:border-indigo-600 hover:text-indigo-600 transition-all"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                <th className="hidden md:table-cell text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="hidden lg:table-cell text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="hidden xl:table-cell text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                {teacher.full_name?.charAt(0) || 'T'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-semibold text-slate-700 truncate">{teacher.full_name}</div>
                                                <div className="text-xs text-slate-500 md:hidden truncate">{teacher.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell px-6 py-4 text-sm font-mono text-slate-600">
                                        {teacher.teacher_id ? (
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">{teacher.teacher_id}</span>
                                        ) : (
                                            <span className="text-slate-400 italic">--</span>
                                        )}
                                    </td>
                                    <td className="hidden lg:table-cell px-6 py-4 text-sm text-slate-500">{teacher.email}</td>
                                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-slate-500">{new Date(teacher.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/admin/teachers/${teacher.id}`}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateTeacherModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTeachers}
            />
        </div>
    )
}
