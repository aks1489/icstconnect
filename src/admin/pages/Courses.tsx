import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Book, MoreVertical, Edit, Trash2, Users, Layers, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import CreateCourseModal from '../../components/admin/CreateCourseModal'
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
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
            alert('Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchCourses()
        } catch (error) {
            console.error('Error deleting course:', error)
            alert('Failed to delete course')
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
                    <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
                    <p className="text-slate-500">Manage your course catalog</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Add Course
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                        <Book className="text-2xl" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No courses yet</h3>
                    <p className="text-slate-500 mb-6">Create your first course to get started.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Create Course &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                            <div className={`h-32 ${(course.color || '').split(' ')[1] || 'bg-slate-100'} p-6 relative`}>
                                <div className={`w-14 h-14 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center absolute -bottom-7 left-6`}>
                                    {(() => {
                                        const Icon = getIcon(course.icon)
                                        return <Icon className={`text-2xl ${(course.color || '').split(' ')[0] || 'text-slate-600'}`} size={28} />
                                    })()}
                                </div>
                            </div>
                            <div className="pt-10 p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.course_name}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                                    {course.description || 'No description provided.'}
                                </p>

                                <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                                    <div className="text-xs text-slate-400 font-medium">
                                        {new Date(course.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/courses/${course.id}/classes`}
                                            className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                                            title="Manage Batches"
                                        >
                                            <Users size={16} />
                                        </Link>
                                        <Link
                                            to={`/admin/courses/${course.id}/structure`}
                                            className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                                            title="Edit Structure"
                                        >
                                            <Layers size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
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
        </div>
    )
}
