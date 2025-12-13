import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import CreateCourseModal from '../../components/admin/CreateCourseModal'

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
                    <i className="bi bi-plus-lg"></i>
                    Add Course
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                        <i className="bi bi-journal-bookmark text-2xl"></i>
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
                                    <i className={`bi ${course.icon || 'bi-code-square'} text-2xl ${(course.color || '').split(' ')[0] || 'text-slate-600'}`}></i>
                                </div>
                            </div>
                            <div className="pt-10 p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.course_name}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                                    {course.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                                    <Link
                                        to={`/admin/courses/${course.id}/edit`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-sm font-medium"
                                    >
                                        <i className="bi bi-pencil"></i>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        title="Delete Course"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
