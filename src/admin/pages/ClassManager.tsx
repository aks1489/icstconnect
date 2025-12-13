import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ClassBatch {
    id: number
    batch_name: string
    batch_number: number
    capacity: number
    enrolled_count: number
}

interface Course {
    id: number
    course_name: string
    short_code: string | null
}

export default function ClassManager() {
    const { id } = useParams()
    const [course, setCourse] = useState<Course | null>(null)
    const [classes, setClasses] = useState<ClassBatch[]>([])
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [capacity, setCapacity] = useState(30)
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Fetch Course Details
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('id, course_name, short_code')
                .eq('id', id)
                .single()

            if (courseError) throw courseError
            setCourse(courseData)

            // Fetch Classes
            // Note: enrolled_count is not a real column, we'd need a subquery or separate count.
            // For now, let's fetch classes and we can implement count later or via a view.
            // Simplified: won't show count yet or will do a separate count query if critical.
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select('*')
                .eq('course_id', id)
                .order('batch_number', { ascending: true })

            if (classesError) throw classesError

            // Fetch counts for each class
            const classesWithCounts = await Promise.all(classesData.map(async (cls) => {
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

        } catch (error) {
            console.error('Error loading data:', error)
            alert('Failed to load class data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBatch = async () => {
        if (!course) return
        setCreateLoading(true)

        try {
            // Determine next batch number
            const lastBatch = classes.length > 0 ? classes[classes.length - 1] : null
            const nextNumber = lastBatch ? lastBatch.batch_number + 1 : 1

            // Generate Name
            const shortCode = course.short_code || course.course_name.substring(0, 3).toUpperCase()
            const batchName = `${shortCode} Batch ${nextNumber}`

            const { error } = await supabase
                .from('classes')
                .insert({
                    course_id: id,
                    batch_name: batchName,
                    batch_number: nextNumber,
                    capacity: capacity
                })

            if (error) throw error

            setShowCreateModal(false)
            fetchData()
        } catch (error) {
            console.error('Error creating batch:', error)
            alert('Failed to create batch')
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDeleteBatch = async (batchId: number, enrolledCount: number) => {
        if (enrolledCount > 0) {
            alert('Cannot delete a batch with enrolled students.')
            return
        }
        if (!confirm('Are you sure you want to delete this batch?')) return

        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', batchId)

            if (error) throw error
            fetchData()
        } catch (error) {
            console.error('Error deleting batch:', error)
            alert('Failed to delete batch')
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>
    if (!course) return <div className="p-8 text-center text-red-500">Course not found</div>

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/admin/courses" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
                        <i className="bi bi-arrow-left"></i>
                        Back to Courses
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {course.course_name} <span className="text-slate-400 font-normal">Batches</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage student batches and capacity</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <i className="bi bi-plus-lg"></i>
                        Create New Batch
                    </button>
                </div>
            </div>

            {/* Batches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => {
                    const isFull = cls.enrolled_count >= cls.capacity
                    const percentage = Math.round((cls.enrolled_count / cls.capacity) * 100)

                    return (
                        <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{cls.batch_name}</h3>
                                    <p className="text-xs text-slate-500">Batch #{cls.batch_number}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {isFull ? 'FULL' : 'OPEN'}
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                    <span>Capacity</span>
                                    <span>{cls.enrolled_count} / {cls.capacity}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => handleDeleteBatch(cls.id, cls.enrolled_count)}
                                    className="text-slate-400 hover:text-red-600 text-sm flex items-center gap-1 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                                    disabled={cls.enrolled_count > 0}
                                    title={cls.enrolled_count > 0 ? "Cannot delete non-empty batch" : "Delete Batch"}
                                >
                                    <i className="bi bi-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })}

                {classes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <i className="bi bi-people text-3xl mb-3 block"></i>
                        <p>No batches created yet.</p>
                        <button onClick={() => setShowCreateModal(true)} className="text-indigo-600 font-bold hover:underline mt-2">Create First Batch</button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">Create New Batch</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Batch Capacity</label>
                            <input
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(e) => setCapacity(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                New Batch Name: <span className="font-mono font-bold text-indigo-600">
                                    {course.short_code || course.course_name.substring(0, 3).toUpperCase()} Batch {(classes.length > 0 ? classes[classes.length - 1].batch_number + 1 : 1)}
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBatch}
                                disabled={createLoading}
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {createLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
