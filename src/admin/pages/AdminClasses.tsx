import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus as Plus, IconSearch as Search, IconInbox as Inbox, IconTrash as Trash2 } from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import { getIcon } from '../../utils/iconMapper'
import CreateClassModal from '../../components/admin/CreateClassModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'

interface ClassBatch {
    id: number
    batch_name: string
    batch_number: number
    capacity: number
    created_at: string
    course_id: number
    enrolled_count: number
    course: {
        id: number
        course_name: string
        short_code: string | null
        color: string
        icon: string
    }
}

interface Course {
    id: number
    course_name: string
}

export default function AdminClasses() {
    const { showToast } = useToast()
    const [classes, setClasses] = useState<ClassBatch[]>([])
    const [filteredClasses, setFilteredClasses] = useState<ClassBatch[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<string>('all')
    const [classToDelete, setClassToDelete] = useState<ClassBatch | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        filterData()
    }, [selectedCourse, searchQuery, classes])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch Classes with Course info
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select(`
                    *,
                    course:courses (
                        id,
                        course_name,
                        short_code,
                        color,
                        icon
                    )
                `)
                .order('created_at', { ascending: false })

            if (classesError) throw classesError

            // Fetch Enrollment Counts manually for now or use a view
            // Fetch counts for each class
            const classesWithCounts = await Promise.all((classesData || []).map(async (cls: any) => {
                const { count } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', cls.id)

                return {
                    ...cls,
                    enrolled_count: count || 0
                }
            }))

            setClasses(classesWithCounts)

            // Fetch Courses for filter
            const { data: coursesData } = await supabase
                .from('courses')
                .select('id, course_name')
                .order('course_name')

            setCourses(coursesData || [])

        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterData = () => {
        let filtered = [...classes]

        if (selectedCourse !== 'all') {
            filtered = filtered.filter(c => c.course_id.toString() === selectedCourse)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(c =>
                c.batch_name.toLowerCase().includes(query) ||
                c.course.course_name.toLowerCase().includes(query)
            )
        }

        setFilteredClasses(filtered)
    }

    const initiateDelete = (cls: ClassBatch) => {
        if (cls.enrolled_count > 0) {
            showToast('Cannot delete a batch with enrolled students.', 'warning')
            return
        }
        setClassToDelete(cls)
    }

    const executeDeleteClass = async () => {
        if (!classToDelete) return

        try {
            setIsDeleting(true)
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', classToDelete.id)

            if (error) throw error
            showToast(`Batch "${classToDelete.batch_name}" deleted successfully`, 'success')
            setClassToDelete(null)
            fetchData()

        } catch (error) {
            console.error('Error deleting batch:', error)
            showToast('Failed to delete batch', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Classes</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and manage student batches across all courses</p>
                </div>

                {/* Create Batch Action */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus size={20} />
                    Create Batch
                </button>
            </div>

            <CreateClassModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchData} />

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-slate-600 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-slate-600 dark:text-slate-200"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.course_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between animate-pulse">
                            <div className="space-y-3">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Inbox className="text-2xl text-slate-300 dark:text-slate-600" size={32} />
                    </div>
                    <p>No classes found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((cls) => {
                        const isFull = cls.enrolled_count >= cls.capacity
                        const percentage = Math.round((cls.enrolled_count / cls.capacity) * 100)
                        const courseColor = (cls.course.color || 'text-indigo-600').split(' ')[0]
                        const courseBg = (cls.course.color || '').split(' ')[1] || 'bg-slate-50'

                        return (
                            <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${courseBg.replace('50', '100')} dark:bg-slate-800`}>
                                                {(() => {
                                                    const Icon = getIcon(cls.course.icon)
                                                    return <Icon className={`${courseColor}`} size={20} />
                                                })()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white">{cls.batch_name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="font-medium">{cls.course.course_name}</span>
                                                    <span>•</span>
                                                    <span>#{cls.batch_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${isFull ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'}`}>
                                            {isFull ? 'Full' : 'Open'}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            <span>Capacity</span>
                                            <span>{cls.enrolled_count} / {cls.capacity}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : cls.enrolled_count > 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                                        {/* Placeholder for Details Link */}
                                        <Link
                                            to={`/admin/classes/${cls.id}`}
                                            className="flex-1 py-2 text-center text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => initiateDelete(cls)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30"
                                            disabled={cls.enrolled_count > 0}
                                            title="Delete Batch"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <ConfirmDialog
                open={!!classToDelete}
                onOpenChange={(open) => !open && setClassToDelete(null)}
                title="Delete Class Batch"
                description={`Are you sure you want to permanently delete batch "${classToDelete?.batch_name}"? This action cannot be undone.`}
                confirmLabel="Delete Batch"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={executeDeleteClass}
            />
        </div>
    )
}
