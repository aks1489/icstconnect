import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { X, ArrowLeft, Pencil } from 'lucide-react'
import { getIcon } from '../../utils/iconMapper'
import ProfileForm from '../../components/common/ProfileForm'
import type { UserProfile } from '../../types'

interface Enrollment {
    course_id: number
    progress: number
    enrolled_at: string
    course: {
        course_name: string
        icon: string
        color: string
    }
    class_id?: number | null
}

interface Course {
    id: number
    course_name: string
}

export default function StudentDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [student, setStudent] = useState<UserProfile | null>(null)
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [availableClasses, setAvailableClasses] = useState<any[]>([])
    const [selectedClassId, setSelectedClassId] = useState<string>('')

    const [isEditOpen, setIsEditOpen] = useState(false)

    // Batch Transfer State
    const [isChangeBatchOpen, setIsChangeBatchOpen] = useState(false)
    const [classToTransfer, setClassToTransfer] = useState<{ courseId: number, currentClassId: number } | null>(null)
    const [transferAvailableClasses, setTransferAvailableClasses] = useState<any[]>([])
    const [selectedTransferClassId, setSelectedTransferClassId] = useState('')

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id])

    // Fetch classes when a course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchClassesForCourse(selectedCourseId)
        } else {
            setAvailableClasses([])
            setSelectedClassId('')
        }
    }, [selectedCourseId])

    const fetchClassesForCourse = async (courseId: string) => {
        try {
            const { data: classesData, error } = await supabase
                .from('classes')
                .select('*')
                .eq('course_id', courseId)
                .order('batch_number', { ascending: false })

            if (error) throw error

            // Get enrollment counts for each class to check capacity
            const classesWithCounts = await Promise.all((classesData || []).map(async (cls) => {
                const { count } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', cls.id)
                return { ...cls, enrolled_count: count || 0 }
            }))

            setAvailableClasses(classesWithCounts)
        } catch (error) {
            console.error('Error fetching classes:', error)
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            // 1. Fetch Student Profile
            const { data: studentData, error: studentError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            if (studentError) {
                console.error('Error fetching student:', studentError)
                throw new Error(`Failed to load student: ${studentError.message}`)
            }
            setStudent(studentData)

            // 2. Fetch Enrollments
            const { data: enrollmentData, error: enrollmentError } = await supabase
                .from('enrollments')
                .select(`
                    course_id,
                    progress,
                    enrolled_at,
                    class_id,
                    course:courses (
                        course_name,
                        icon,
                        color
                    )
                `)
                .eq('student_id', id)

            if (enrollmentError) {
                console.error('Error fetching enrollments:', enrollmentError)
                throw new Error(`Failed to load enrollments: ${enrollmentError.message}`)
            }

            // Cast data to match interface
            setEnrollments(enrollmentData as unknown as Enrollment[])

            // 3. Fetch All Courses (for assignment)
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('id, course_name')
                .order('course_name')

            if (coursesError) {
                // Fallback logic for migration
                if (coursesError.message?.includes('column "course_name" does not exist')) {
                    const { data: fallbackData } = await supabase.from('courses').select('id, title').order('title')
                    setAllCourses(fallbackData?.map((c: any) => ({ ...c, course_name: c.title })) || [])
                }
            } else {
                setAllCourses(coursesData || [])
            }

        } catch (error: any) {
            console.error('Error fetching data:', error)
            alert(error.message || 'Error loading student details')
        } finally {
            setLoading(false)
        }
    }


    const openTransferModal = async (courseId: number, currentClassId: number) => {
        setClassToTransfer({ courseId, currentClassId })
        setIsChangeBatchOpen(true)
        setSelectedTransferClassId('')

        // Fetch other classes for this course
        const { data } = await supabase
            .from('classes')
            .select('*')
            .eq('course_id', courseId)
            .neq('id', currentClassId) // Exclude current
            .order('batch_number')

        setTransferAvailableClasses(data || [])
    }

    const handleBatchTransfer = async () => {
        if (!classToTransfer || !selectedTransferClassId) return

        try {
            const { error } = await supabase
                .from('enrollments')
                .update({ class_id: parseInt(selectedTransferClassId) })
                .match({ student_id: id, course_id: classToTransfer.courseId })

            if (error) throw error

            alert('Batch switched successfully!')
            setIsChangeBatchOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error switching batch:', error)
            alert('Failed to switch batch')
        }
    }

    const handleAssignCourse = async () => {
        if (!selectedCourseId || !id || !selectedClassId) {
            alert('Please select both a course and a batch class.')
            return
        }

        try {
            const { error } = await supabase
                .from('enrollments')
                .insert({
                    student_id: id,
                    course_id: parseInt(selectedCourseId),
                    class_id: parseInt(selectedClassId),
                    progress: 0
                })

            if (error) {
                if (error.code === '23505') {
                    alert('Student is already enrolled in this course')
                } else {
                    throw error
                }
            } else {
                fetchData()
                setSelectedCourseId('')
                setSelectedClassId('')
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
            fetchData()
        } catch (error) {
            console.error('Error unenrolling:', error)
            alert('Failed to unenroll student')
        }
    }

    const handleMakeTeacher = async () => {
        if (!window.confirm('Are you sure you want to promote this user to a Teacher?')) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'teacher' })
                .eq('id', id)

            if (error) throw error

            alert('User promoted to Teacher successfully!')
            navigate('/admin/students')
        } catch (error) {
            console.error('Error promoting user:', error)
            alert('Failed to promote user')
        }
    }

    const handleDeleteUser = async () => {
        if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return

        try {
            const { error } = await supabase.rpc('delete_user_by_id', { user_id: id })

            if (error) throw error

            alert('User deleted successfully.')
            navigate('/admin/students')
        } catch (error: any) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user: ' + error.message)
        }
    }

    const handleUpdateProfile = async (data: Partial<UserProfile>) => {
        try {
            // Remove email from updates as it shouldn't be changed here (or handled separately if needed)
            const { email, ...updates } = data

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id)

            if (error) throw error

            setStudent(prev => prev ? ({ ...prev, ...updates } as UserProfile) : null)
            setIsEditOpen(false)
            alert('Profile updated successfully')
        } catch (error: any) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    if (loading) return <div className="p-8 text-center">Loading details...</div>
    if (!student) return <div className="p-8 text-center">Student not found</div>

    const availableCourses = allCourses.filter(c => !enrollments.some(e => e.course_id === c.id))

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-800">Edit Student Profile</h2>
                            <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                                <X className="text-xs" size={14} />
                            </button>
                        </div>
                        <div className="p-6">
                            <ProfileForm
                                initialData={student}
                                onSubmit={handleUpdateProfile}
                                isEditing={true}
                                onCancel={() => setIsEditOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <Link to="/admin/students" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Students
                </Link>

                {/* Batch Transfer Modal */}
                {isChangeBatchOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsChangeBatchOpen(false)}></div>
                        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Switch Class Batch</h3>
                            <p className="text-sm text-slate-500 mb-4">Select a new batch for this course. Progress will be preserved.</p>

                            <select
                                className="w-full p-2 border border-slate-200 rounded-xl mb-4 bg-white"
                                value={selectedTransferClassId}
                                onChange={e => setSelectedTransferClassId(e.target.value)}
                            >
                                <option value="">-- Select New Batch --</option>
                                {transferAvailableClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.batch_name}</option>
                                ))}
                            </select>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsChangeBatchOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button
                                    onClick={handleBatchTransfer}
                                    disabled={!selectedTransferClassId}
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Confirm Switch
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold overflow-hidden">
                            {student.avatar_url ? (
                                <img src={student.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                student.full_name?.charAt(0) || 'S'
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
                            <p className="text-slate-500">{student.email}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${student.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {student.role || 'student'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                        <Pencil size={18} />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Enrollments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enrollments Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Enrolled Classes</h2>
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
                                                    {(() => {
                                                        const Icon = getIcon(enrollment.course.icon)
                                                        return <Icon className={`${(enrollment.course.color || '').split(' ')[0] || 'text-blue-600'}`} size={20} />
                                                    })()}
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
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Class Info & Logic */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">
                                                Batch: {enrollment.class_id ? `ID #${enrollment.class_id}` : 'N/A'}
                                                {/* Ideally we fetch batch name, but ID proves the link for now */}
                                            </span>
                                            {enrollment.class_id && (
                                                <button
                                                    onClick={() => openTransferModal(enrollment.course_id, enrollment.class_id!)}
                                                    className="text-xs text-indigo-600 font-bold hover:underline"
                                                >
                                                    Switch Batch
                                                </button>
                                            )}
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

                    {/* Personal Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                        <h2 className="font-bold text-slate-800 mb-4">Personal Details</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-xs font-semibold text-slate-500 uppercase">Father's Name</dt>
                                <dd className="text-slate-800 font-medium">{student.father_name || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-slate-500 uppercase">DOB</dt>
                                <dd className="text-slate-800 font-medium">{student.dob || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-slate-500 uppercase">Phone</dt>
                                <dd className="text-slate-800 font-medium">{student.phone || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-slate-500 uppercase">Pincode</dt>
                                <dd className="text-slate-800 font-medium">{student.pincode || '-'}</dd>
                            </div>
                            <div className="md:col-span-2">
                                <dt className="text-xs font-semibold text-slate-500 uppercase">Address</dt>
                                <dd className="text-slate-800 font-medium">{student.address || '-'}</dd>
                            </div>
                            {student.enrollment_center && (
                                <div className="md:col-span-2">
                                    <dt className="text-xs font-semibold text-slate-500 uppercase">Enrollment Center</dt>
                                    <dd className="text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded">{student.enrollment_center}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Sidebar: Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-800 mb-4">Enroll in Class</h2>
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

                            {selectedCourseId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Batch</label>
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                                    >
                                        <option value="">Choose a batch...</option>
                                        {availableClasses.map(cls => {
                                            const isFull = cls.enrolled_count >= cls.capacity
                                            return (
                                                <option key={cls.id} value={cls.id} disabled={isFull}>
                                                    {cls.batch_name} {isFull ? '(FULL)' : `(${cls.enrolled_count}/${cls.capacity})`}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    {availableClasses.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">
                                            No available batches. <Link to={`/admin/courses/${selectedCourseId}/classes`} className="underline font-bold">Create one here.</Link>
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleAssignCourse}
                                disabled={!selectedCourseId || !selectedClassId}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Enroll in Class
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="font-bold text-slate-800 mb-4">Account Actions</h2>
                        <button className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors mb-3">
                            Reset Password
                        </button>

                        {student.role !== 'teacher' && (
                            <button
                                onClick={handleMakeTeacher}
                                className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors mb-3"
                            >
                                Promote to Teacher
                            </button>
                        )}

                        <button
                            onClick={handleDeleteUser}
                            className="w-full py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
