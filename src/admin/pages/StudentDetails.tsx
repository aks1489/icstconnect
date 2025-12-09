import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface StudentProfile {
    id: string
    full_name: string
    email: string
    created_at: string
}

interface Enrollment {
    course_id: number
    progress: number
    enrolled_at: string
    course: {
        course_name: string
        icon: string
        color: string
    }
}

interface Course {
    id: number
    course_name: string
}

export default function StudentDetails() {
    const { id } = useParams()
    const [student, setStudent] = useState<StudentProfile | null>(null)
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    const fetchData = async () => {
        try {
            setLoading(true)
            // 1. Fetch Student Profile
            const { data: studentData, error: studentError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            if (studentError) throw studentError
            setStudent(studentData)

            // 2. Fetch Enrollments
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('enrollments')
                .select(`
                    course_id,
                    progress,
                    enrolled_at,
                    course:courses (
                        course_name,
                        icon,
                        color
                    )
                `)
                .eq('student_id', id)

            if (enrollmentError) throw enrollmentError
            // Cast data to match interface (Supabase join returns array/object depending on relation, forcing cast here)
            setEnrollments(enrollmentData as unknown as Enrollment[])

            // 3. Fetch All Courses (for assignment)
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('id, course_name')
                .order('course_name')

            if (coursesError) throw coursesError
            setAllCourses(coursesData || [])

        } catch (error) {
            console.error('Error fetching data:', error)
            alert('Error loading student details')
        } finally {
            setLoading(false)
        }
    }

    const handleAssignCourse = async () => {
        if (!selectedCourseId || !id) return

        try {
            const { error } = await supabase
                .from('enrollments')
                .insert({
                    student_id: id,
                    course_id: parseInt(selectedCourseId),
                    progress: 0
                })

            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert('Student is already enrolled in this course')
                } else {
                    throw error
                }
            } else {
                fetchData() // Refresh
                setSelectedCourseId('')
            }
        } catch (error) {
            console.error('Error assigning course:', error)
            alert('Failed to assign course')
        }
    }

    const handleUpdateProgress = async (courseId: number, newProgress: number) => {
        try {
            const { error } = await supabase
                .from('enrollments')
                .update({ progress: newProgress })
                .match({ student_id: id, course_id: courseId })

            if (error) throw error

            // Optimistic update
            setEnrollments(prev => prev.map(e =>
                e.course_id === courseId ? { ...e, progress: newProgress } : e
            ))
        } catch (error) {
            console.error('Error updating progress:', error)
            alert('Failed to update progress')
        }
    }

    const handleUnenroll = async (courseId: number) => {
        if (!window.confirm('Are you sure you want to unenroll this student? Progress will be lost.')) return

        try {
            const { error } = await supabase
                .from('enrollments')
                .delete()
                .match({ student_id: id, course_id: courseId })

            if (error) throw error
            fetchData() // Refresh
        } catch (error) {
            console.error('Error unenrolling:', error)
            alert('Failed to unenroll student')
        }
    }

    if (loading) return <div className="p-8 text-center">Loading details...</div>
    if (!student) return <div className="p-8 text-center">Student not found</div>

    // Filter out courses already enrolled
    const availableCourses = allCourses.filter(c => !enrollments.some(e => e.course_id === c.id))

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/admin/students" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <i className="bi bi-arrow-left"></i>
                    Back to Students
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
                        <p className="text-slate-500">{student.email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Enrollments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Enrolled Courses</h2>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
                                {enrollments.length} Active
                            </span>
                        </div>

                        <div className="p-6 space-y-6">
                            {enrollments.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No active enrollments. Assign a course to get started.
                                </div>
                            ) : (
                                enrollments.map((enrollment) => (
                                    <div key={enrollment.course_id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(enrollment.course.color || '').split(' ')[0].replace('text-', 'bg-').replace('600', '100') || 'bg-blue-100'}`}>
                                                    <i className={`bi ${enrollment.course.icon} ${(enrollment.course.color || '').split(' ')[0] || 'text-blue-600'}`}></i>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{enrollment.course.course_name}</h3>
                                                    <p className="text-xs text-slate-500">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnenroll(enrollment.course_id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                                title="Unenroll"
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                                                <span>Progress</span>
                                                <span>{enrollment.progress || 0}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={enrollment.progress || 0}
                                                onChange={(e) => handleUpdateProgress(enrollment.course_id, parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-800 mb-4">Assign Course</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                                >
                                    <option value="">Choose a course...</option>
                                    {availableCourses.map(course => (
                                        <option key={course.id} value={course.id}>{course.course_name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAssignCourse}
                                disabled={!selectedCourseId}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Assign Course
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-800 mb-4">Account Actions</h2>
                        <button className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors mb-3">
                            Reset Password
                        </button>
                        <button className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors">
                            Deactivate Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
