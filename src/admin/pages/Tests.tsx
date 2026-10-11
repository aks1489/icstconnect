import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { IconPlus as Plus, IconSearch as Search, IconFileText as FileText, IconClock as Clock, IconChartBar as BarChart3, IconPencil as Pencil, IconTrash as Trash2, IconWorld as Globe, IconLock as Lock } from '@tabler/icons-react'
import type { Test } from '../../types'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function Tests() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)
    const [isConfirmLoading, setIsConfirmLoading] = useState(false)
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
            showToast('Failed to load tests', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Test',
            description: 'Are you sure you want to delete this test? This action cannot be undone and will remove all student submissions.',
            confirmLabel: 'Delete Test',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    const { error } = await supabase
                        .from('tests')
                        .delete()
                        .eq('id', id)

                    if (error) throw error

                    // Remove from local state
                    setTests(tests.filter(t => t.id !== id))
                    showToast('Test deleted successfully', 'success')
                } catch (error) {
                    console.error('Error deleting test:', error)
                    showToast('Failed to delete test', 'error')
                } finally {
                    setIsConfirmLoading(false)
                    setConfirmModal(null)
                }
            }
        })
    }

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-8 pb-20 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Test Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create and manage your assessments</p>
                </div>

                {isAdminOrTeacher && (
                    <button
                        onClick={() => navigate('/admin/tests/new')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={20} /> Create New Test
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {/* Tests Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-800" />
                    ))}
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No tests found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Get started by creating your first test.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map(test => (
                        <div key={test.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${test.access_type === 'public'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                        {test.access_type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                        <span className="capitalize">{test.access_type}</span>
                                    </div>

                                    {isAdminOrTeacher && (
                                        <div className="relative">
                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/admin/tests/${test.id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit Test"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title="Delete Test"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {test.title}
                                </h3>

                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                                    {test.description || 'No description provided.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-indigo-500 dark:text-indigo-400" />
                                        {test.duration_minutes} mins
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={16} className={`
                                            ${test.difficulty === 'easy' ? 'text-green-500 dark:text-green-400' : ''}
                                            ${test.difficulty === 'medium' ? 'text-amber-500 dark:text-amber-400' : ''}
                                            ${test.difficulty === 'hard' ? 'text-red-500 dark:text-red-400' : ''}
                                        `} />
                                        <span className="capitalize">{test.difficulty}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    Created {new Date(test.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {confirmModal && (
                <ConfirmDialog
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    isLoading={isConfirmLoading}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
