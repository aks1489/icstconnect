import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus as Plus, IconBook as Book, IconTrash as Trash2, IconUsers as Users, IconLayersLinked as Layers } from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import CreateCourseModal from '../../components/admin/CreateCourseModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'
import { getIcon } from '../../utils/iconMapper'

interface Course {
    id: number
    course_name: string
    description: string
    icon: string
    color: string
    created_at: string
}

export default function AdminCourses() {
    const { showToast } = useToast()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setCourses(data || [])
        } catch (error) {
            console.error('Error fetching courses:', error)
            showToast('Failed to load courses', 'error')
        } finally {
            setLoading(false)
        }
    }

    const executeDeleteCourse = async () => {
        if (!courseToDelete) return

        try {
            setIsDeleting(true)
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseToDelete.id)

            if (error) throw error
            showToast(`Course "${courseToDelete.course_name}" deleted successfully`, 'success')
            setCourseToDelete(null)
            fetchCourses()
        } catch (error) {
            console.error('Error deleting course:', error)
            showToast('Failed to delete course', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading courses...</div>

    return (
        <div>
            <CreateCourseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchCourses}
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Courses</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your course catalog</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    <Plus size={20} />
                    Add Course
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400 dark:text-slate-500">
                        <Book className="text-2xl" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">No courses yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first course to get started.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                        Create Course &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                            <div className={`h-32 ${(course.color || '').split(' ')[1] || 'bg-slate-100'} dark:!bg-slate-800/80 p-6 relative border-b border-transparent dark:border-slate-800`}>
                                <div className={`w-14 h-14 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border border-transparent dark:border-slate-700 flex items-center justify-center absolute -bottom-7 left-6`}>
                                    {(() => {
                                        const Icon = getIcon(course.icon)
                                        return <Icon className={`text-2xl ${(course.color || '').split(' ')[0] || 'text-slate-600'}`} size={28} />
                                    })()}
                                </div>
                            </div>
                            <div className="pt-10 p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.course_name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                                    {course.description || 'No description provided.'}
                                </p>

                                <div className="border-t border-slate-50 dark:border-slate-800 pt-4 flex justify-between items-center">
                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                        {new Date(course.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/courses/${course.id}/classes`}
                                            className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                                            title="Manage Batches"
                                        >
                                            <Users size={16} />
                                        </Link>
                                        <Link
                                            to={`/admin/courses/${course.id}/structure`}
                                            className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            title="Edit Structure"
                                        >
                                            <Layers size={16} />
                                        </Link>
                                        <button
                                            onClick={() => setCourseToDelete(course)}
                                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                            title="Delete Course"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!courseToDelete}
                onOpenChange={(open) => !open && setCourseToDelete(null)}
                title="Delete Course"
                description={`Are you sure you want to permanently delete "${courseToDelete?.course_name}"? This action cannot be undone and will affect all related course modules and topics.`}
                confirmLabel="Delete Course"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={executeDeleteCourse}
            />
        </div>
    )
}
