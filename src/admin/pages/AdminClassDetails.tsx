import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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

export default function AdminClassDetails() {
    const { id } = useParams()
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>
    if (!classDetails) return <div className="p-8 text-center text-red-500">Class not found</div>

    const isFull = students.length >= classDetails.capacity
    const percentage = Math.round((students.length / classDetails.capacity) * 100)

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <Link to="/admin/classes" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6 transition-colors">
                <i className="bi bi-arrow-left"></i>
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

            {/* Students List */}
            <h2 className="text-xl font-bold text-slate-800 mb-6">Enrolled Students</h2>

            {students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <i className="bi bi-people text-4xl mb-3 block opacity-50"></i>
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
                                            <i className="bi bi-x-lg"></i>
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
