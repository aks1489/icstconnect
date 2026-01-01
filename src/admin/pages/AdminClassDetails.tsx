import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Users, X, Calendar, Clock, Plus, Trash2 } from 'lucide-react'


interface Student {
    id: string
    full_name: string
    email: string
    avatar_url: string
    enrollment_id: number
    enrolled_at: string
    progress: number
}

interface ClassDetails {
    id: number
    batch_name: string
    batch_number: number
    capacity: number
    created_at: string
    course: {
        id: number
        course_name: string
        short_code: string | null
    }

}

interface ClassSchedule {
    id: number
    day_of_week: string
    start_time: string
    duration_minutes: number
}

export default function AdminClassDetails() {
    const { id } = useParams()
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [schedules, setSchedules] = useState<ClassSchedule[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [newSchedule, setNewSchedule] = useState({
        day_of_week: 'Monday',
        start_time: '10:00',
        duration_minutes: 60
    })

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. Fetch Class Details
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .select(`
                    *,
                    course:courses (
                        id,
                        course_name,
                        short_code
                    )
                `)
                .eq('id', id)
                .single()

            if (classError) throw classError

            setClassDetails(classData)

            // 1.5 Fetch Schedules for this specific Class (Batch)
            const { data: scheduleData } = await supabase
                .from('class_schedules')
                .select('*')
                .eq('class_id', id) // Use the class ID from params

            setSchedules(scheduleData || [])

            // 2. Fetch Enrolled Students
            // We join enrollments -> profiles
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    enrolled_at,
                    progress,
                    student:profiles (
                        id,
                        full_name,
                        email,
                        avatar_url
                    )
                `)
                .eq('class_id', id)

            if (enrollmentError) throw enrollmentError

            // Map to flat structure
            const mappedStudents = enrollmentData.map((e: any) => ({
                id: e.student.id,
                full_name: e.student.full_name,
                email: e.student.email,
                avatar_url: e.student.avatar_url,
                enrollment_id: e.id,
                enrolled_at: e.enrolled_at,
                progress: e.progress
            }))

            setStudents(mappedStudents)

        } catch (error) {
            console.error('Error fetching details:', error)
            alert('Failed to load class details')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveStudent = async (enrollmentId: number) => {
        if (!confirm('Are you sure you want to remove this student from the class? This will delete their enrollment record.')) return

        try {
            const { error } = await supabase
                .from('enrollments')
                .delete()
                .eq('id', enrollmentId)

            if (error) throw error

            // Optimistic update
            setStudents(prev => prev.filter(s => s.enrollment_id !== enrollmentId))
            // Optionally refetch to be safe
            // fetchData()

        } catch (error) {
            console.error('Error removing student:', error)
            alert('Failed to remove student')
        }
    }

    const handleAddSchedule = async () => {
        if (!classDetails) return
        try {
            const { data, error } = await supabase
                .from('class_schedules')
                .insert({
                    course_id: classDetails.course.id, // Linked to Course
                    class_id: id, // Link to this specific batch
                    day_of_week: newSchedule.day_of_week,
                    start_time: newSchedule.start_time,
                    duration_minutes: newSchedule.duration_minutes
                })
                .select()

            if (error) throw error
            setSchedules([...schedules, data[0]])
            // Reset form (optional)
        } catch (error) {
            console.error('Error adding schedule:', error)
            alert('Failed to add schedule')
        }
    }

    const handleDeleteSchedule = async (id: number) => {
        if (!confirm('Delete this schedule?')) return
        try {
            const { error } = await supabase
                .from('class_schedules')
                .delete()
                .eq('id', id)

            if (error) throw error
            setSchedules(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error deleting schedule:', error)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>
    if (!classDetails) return <div className="p-8 text-center text-red-500">Class not found</div>

    const isFull = students.length >= classDetails.capacity
    const percentage = Math.round((students.length / classDetails.capacity) * 100)

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <Link to="/admin/classes" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to All Classes
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {classDetails.course.short_code || 'COURSE'}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-800">{classDetails.batch_name}</h1>
                        </div>
                        <p className="text-slate-500 text-lg">{classDetails.course.course_name}</p>
                    </div>

                    <div className="flex items-center gap-8 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase">Capacity</p>
                            <p className="text-2xl font-bold text-slate-800">{students.length} <span className="text-slate-400 text-lg">/ {classDetails.capacity}</span></p>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                            <p className={`text-lg font-bold ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>
                                {isFull ? 'FULL' : 'OPEN'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                        <span>Enrollment Progress</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Weekly Schedule Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-indigo-600" />
                        Weekly Class Schedule
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* List Existing Schedules */}
                    <div className="flex-1 space-y-3">
                        {schedules.length === 0 ? (
                            <p className="text-slate-400 italic text-sm">No regular classes scheduled.</p>
                        ) : (
                            schedules.map(sched => (
                                <div key={sched.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {sched.day_of_week.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{sched.day_of_week}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock size={12} />
                                                <span>{sched.start_time.slice(0, 5)}</span>
                                                <span>•</span>
                                                <span>{sched.duration_minutes} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSchedule(sched.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New Schedule Form */}
                    <div className="w-full lg:w-80 bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Add New Class Time</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Day</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newSchedule.day_of_week}
                                    onChange={e => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSchedule.start_time}
                                        onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSchedule.duration_minutes}
                                        onChange={e => setNewSchedule({ ...newSchedule, duration_minutes: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddSchedule}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List Link */}
            <h2 className="text-xl font-bold text-slate-800 mb-6">Enrolled Students</h2>

            {students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <Users className="text-4xl mb-3 block opacity-50 mx-auto" size={48} />
                    <p>No students enrolled in this batch yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Enrolled Date</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                                {student.avatar_url ? (
                                                    <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    student.full_name.charAt(0)
                                                )}
                                            </div>
                                            <Link to={`/admin/students/${student.id}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors">
                                                {student.full_name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{student.email}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                        {new Date(student.enrolled_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${student.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveStudent(student.enrollment_id)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            title="Remove from Batch"
                                        >
                                            <X size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
