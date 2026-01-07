import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserPlus, X, Search, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getIcon } from '../../utils/iconMapper'

export interface Student {
    id: string
    full_name: string
    avatar_url: string
    enrollments: {
        course_id: number
        progress: number
        course: {
            id: number
            course_name: string
            icon: string
            color: string
        }
    }[]
}

export default function ActiveClasses() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Enrollment Modal State
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
    const [enrollLoading, setEnrollLoading] = useState(false)
    const [availableStudents, setAvailableStudents] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])

    // Form Selection State
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [selectedClassId, setSelectedClassId] = useState('')
    const [studentSearch, setStudentSearch] = useState('')

    useEffect(() => {
        fetchActiveClasses()
    }, [])

    const fetchActiveClasses = async () => {
        try {
            // Fetch students who have enrollments
            const { data: enrollments, error } = await supabase
                .from('enrollments')
                .select(`
                    progress,
                    course:courses (
                        id,
                        course_name,
                        icon,
                        color
                    ),
                    student:profiles!enrollments_student_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .order('enrolled_at', { ascending: false })

            if (error) throw error

            const activeStudents = enrollments?.map((e: any) => ({
                id: e.student.id,
                full_name: e.student.full_name,
                avatar_url: e.student.avatar_url,
                enrollment: {
                    course_id: e.course.id,
                    progress: e.progress,
                    course: e.course
                }
            })) || []

            setStudents(activeStudents)

        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    // New: Fetch data needed for enrollment modal
    const fetchEnrollmentData = async () => {
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                supabase.from('profiles').select('id, full_name, email, avatar_url').eq('role', 'student'),
                supabase.from('courses').select('id, course_name')
            ])

            if (studentsRes.error) throw studentsRes.error
            if (coursesRes.error) throw coursesRes.error

            setAvailableStudents(studentsRes.data || [])
            setCourses(coursesRes.data || [])
        } catch (error) {
            console.error('Error fetching enrollment options:', error)
        }
    }

    // New: Fetch classes when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            const fetchClasses = async () => {
                const { data } = await supabase
                    .from('classes')
                    .select('id, batch_name, capacity')
                    .eq('course_id', selectedCourseId)

                // TODO: Check fullness if needed, for now just list
                setClasses(data || [])
            }
            fetchClasses()
        } else {
            setClasses([])
        }
    }, [selectedCourseId])

    const handleEnrollStudent = async () => {
        if (!selectedStudentId || !selectedCourseId || !selectedClassId) {
            alert('Please select a student, course, and class batch.')
            return
        }

        try {
            setEnrollLoading(true)
            const { error } = await supabase.from('enrollments').insert({
                student_id: selectedStudentId,
                course_id: parseInt(selectedCourseId),
                class_id: parseInt(selectedClassId),
                progress: 0
            })

            if (error) {
                if (error.code === '23505') alert('Student is already enrolled in this course.')
                else throw error
            } else {
                alert('Student enrolled successfully!')
                setIsEnrollModalOpen(false)
                // Refresh list
                fetchActiveClasses()
                // Reset form
                setSelectedStudentId('')
                setSelectedCourseId('')
                setSelectedClassId('')
            }
        } catch (error) {
            console.error('Error enrolling student:', error)
            alert('Failed to enroll student.')
        } finally {
            setEnrollLoading(false)
        }
    }

    const filteredStudents = availableStudents.filter(s =>
        s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase())
    )

    if (loading) return <div className="p-8 text-center bg-slate-50 rounded-xl">Loading active classes...</div>

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Active Classes</h1>
                    <p className="text-slate-500">Manage student progress and track performance</p>
                </div>
                <button
                    onClick={() => {
                        setIsEnrollModalOpen(true)
                        fetchEnrollmentData()
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <UserPlus size={20} />
                    <span className="hidden sm:inline">Enroll Student</span>
                </button>
            </div>

            {/* Enrollment Modal */}
            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEnrollModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Enroll Student in Class</h3>
                            <button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Step 1: Select Student */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">1. Select Student</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search student by name or email..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={studentSearch}
                                        onChange={e => setStudentSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50 divide-y divide-slate-100">
                                    {filteredStudents.map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => setSelectedStudentId(student.id)}
                                            className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedStudentId === student.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-white'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full rounded-full object-cover" /> : student.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{student.full_name}</p>
                                                <p className="text-xs text-slate-500">{student.email}</p>
                                            </div>
                                            {selectedStudentId === student.id && <ChevronRight size={16} className="ml-auto text-indigo-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Course & Class */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">2. Select Course</h4>
                                    <select
                                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-700"
                                        value={selectedCourseId}
                                        onChange={e => setSelectedCourseId(e.target.value)}
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.course_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">3. Select Batch</h4>
                                    <select
                                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-700"
                                        value={selectedClassId}
                                        onChange={e => setSelectedClassId(e.target.value)}
                                        disabled={!selectedCourseId}
                                    >
                                        <option value="">-- Choose Class Batch --</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.batch_name} (Cap: {cls.capacity})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => setIsEnrollModalOpen(false)}
                                className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEnrollStudent}
                                disabled={enrollLoading || !selectedStudentId || !selectedClassId}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                            >
                                {enrollLoading ? 'Enrolling...' : 'Confirm Enrollment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users className="text-2xl" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No active classes</h3>
                    <p className="text-slate-500">As students enroll in courses, they will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((item: any, index) => (
                        <Link
                            to={`/teacher/classes/${item.id}/${item.enrollment.course_id}`}
                            key={`${item.id}-${item.enrollment.course_id}-${index}`}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group"
                        >
                            <div className={`h-24 ${(item.enrollment.course.color || '').split(' ')[1] || 'bg-slate-100'} relative p-6`}>
                                <div className="absolute -bottom-6 left-6 flex items-end">
                                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm">
                                        <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {item.avatar_url ? (
                                                <img src={item.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-indigo-600 font-bold text-sm">{item.full_name?.charAt(0)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm text-slate-700 flex items-center gap-1">
                                        {(() => {
                                            const Icon = getIcon(item.enrollment.course.icon)
                                            return <Icon size={14} />
                                        })()}
                                        {item.enrollment.course.course_name}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-8 px-6 pb-6">
                                <h3 className="font-bold text-slate-800 mb-1">{item.full_name}</h3>
                                <p className="text-xs text-slate-500 mb-4">Click to manage progress</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                                        <span>Progress</span>
                                        <span>{item.enrollment.progress || 0}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                                            style={{ width: `${item.enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
