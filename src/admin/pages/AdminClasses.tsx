import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
    const [classes, setClasses] = useState<ClassBatch[]>([])
    const [filteredClasses, setFilteredClasses] = useState<ClassBatch[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

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

    const handleDelete = async (id: number, count: number) => {
        if (count > 0) {
            alert('Cannot delete a batch with enrolled students.')
            return
        }
        if (!confirm('Are you sure you want to delete this batch?')) return

        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchData()

        } catch (error) {
            console.error('Error deleting batch:', error)
            alert('Failed to delete batch')
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Classes</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage student batches across all courses</p>
                </div>

                {/* Note: Creation is best done via Course context, so we might link there or add a global create modal later */}
                <Link
                    to="/admin/courses"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <i className="bi bi-plus-lg"></i>
                    Create Batch (via Course)
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <i className="bi bi-search absolute left-3 top-3 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Search batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-slate-600"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-slate-600"
                    >
                        <option value="all">All Courses</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.course_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading classes...</div>
            ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <i className="bi bi-inboxes text-2xl text-slate-300"></i>
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
                            <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${courseBg.replace('50', '100')}`}>
                                                <i className={`bi ${cls.course.icon} ${courseColor}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{cls.batch_name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <span className="font-medium">{cls.course.course_name}</span>
                                                    <span>•</span>
                                                    <span>#{cls.batch_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {isFull ? 'Full' : 'Open'}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                            <span>Capacity</span>
                                            <span>{cls.enrolled_count} / {cls.capacity}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isFull ? 'bg-red-500' : cls.enrolled_count > 0 ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                        {/* Placeholder for Details Link */}
                                        <Link
                                            to={`/admin/classes/${cls.id}`}
                                            className="flex-1 py-2 text-center text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(cls.id, cls.enrolled_count)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
                                            disabled={cls.enrolled_count > 0}
                                            title="Delete Batch"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
