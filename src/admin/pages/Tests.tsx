import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Search, FileText, Clock, BarChart3, Pencil, Trash2, Globe, Lock } from 'lucide-react'
import type { Test } from '../../types'

export default function Tests() {
    const navigate = useNavigate()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAdminOrTeacher, setIsAdminOrTeacher] = useState(false)

    useEffect(() => {
        checkUserRole()
        fetchTests()
    }, [])

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            setIsAdminOrTeacher(profile?.role === 'admin' || profile?.role === 'teacher')
        }
    }

    const fetchTests = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTests(data || [])
        } catch (error) {
            console.error('Error fetching tests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('tests')
                .delete()
                .eq('id', id)

            if (error) throw error

            // Remove from local state
            setTests(tests.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error deleting test:', error)
            alert('Failed to delete test')
        }
    }

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Test Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage your assessments</p>
                </div>

                {isAdminOrTeacher && (
                    <button
                        onClick={() => navigate('/admin/tests/new')}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Test
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Tests Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No tests found</h3>
                    <p className="text-slate-500 mt-1">Get started by creating your first test.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map(test => (
                        <div key={test.id} className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${test.access_type === 'public'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {test.access_type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                        <span className="capitalize">{test.access_type}</span>
                                    </div>

                                    {isAdminOrTeacher && (
                                        <div className="relative">
                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/admin/tests/${test.id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Test"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Test"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {test.title}
                                </h3>

                                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                                    {test.description || 'No description provided.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-indigo-400" />
                                        {test.duration_minutes} mins
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={16} className={`
                                            ${test.difficulty === 'easy' ? 'text-green-400' : ''}
                                            ${test.difficulty === 'medium' ? 'text-amber-400' : ''}
                                            ${test.difficulty === 'hard' ? 'text-red-400' : ''}
                                        `} />
                                        <span className="capitalize">{test.difficulty}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / CTA - Maybe link to view results or something? */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-medium">
                                    Created {new Date(test.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
