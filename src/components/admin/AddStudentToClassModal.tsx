import { useState, useEffect } from 'react'
import { X, Search, UserPlus, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

interface Student {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
}

interface AddStudentToClassModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    classId: number
    courseId: number
    batchName: string
    existingStudentIds: string[]
}

export default function AddStudentToClassModal({
    isOpen,
    onClose,
    onSuccess,
    classId,
    courseId,
    batchName,
    existingStudentIds
}: AddStudentToClassModalProps) {
    const { showToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [allStudents, setAllStudents] = useState<Student[]>([])
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [addingIds, setAddingIds] = useState<string[]>([])

    // Load all students on mount (or when modal opens)
    useEffect(() => {
        if (isOpen) {
            setAddingIds([]) // Reset local adding state on reopen
            fetchAllStudents()
        }
    }, [isOpen])

    // Filter students locally when search query changes
    useEffect(() => {
        filterStudents()
    }, [searchQuery, allStudents, existingStudentIds])

    const fetchAllStudents = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url')
                .eq('role', 'student')
                .order('full_name')
                .limit(100) // Fetches top 100 students initially

            if (error) throw error

            setAllStudents(data || [])
        } catch (error) {
            console.error('Error fetching students:', error)
            showToast('Failed to load students', 'error')
        } finally {
            setLoading(false)
        }
    }

    const filterStudents = () => {
        let result = allStudents

        // 1. Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(s =>
                s.full_name?.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query)
            )
        }

        // 2. We DO NOT filter out enrolled students anymore, we just mark them
        // result = result.filter(s => !existingStudentIds.includes(s.id))

        setFilteredStudents(result)
    }

    const handleAddStudent = async (student: Student) => {
        try {
            setAddingIds(prev => [...prev, student.id])

            const { error } = await supabase
                .from('enrollments')
                .insert({
                    student_id: student.id,
                    class_id: classId,
                    course_id: courseId,
                    progress: 0
                })

            if (error) throw error

            showToast(`${student.full_name} added to class`, 'success')
            onSuccess() // Trigger refresh in parent

        } catch (error) {
            console.error('Error adding student:', error)
            showToast('Failed to add student to class', 'error')
            setAddingIds(prev => prev.filter(id => id !== student.id))
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Add Student to Class</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            autoFocus
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="overflow-y-auto max-h-[400px] min-h-[200px]">
                        {loading && allStudents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Loading students...</div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                {searchQuery ? 'No matching students found' : 'All available students listed'}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredStudents.map(student => {
                                    const isAlreadyEnrolled = existingStudentIds.includes(student.id)
                                    const isJustAdded = addingIds.includes(student.id)
                                    const isAdded = isAlreadyEnrolled || isJustAdded

                                    return (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm overflow-hidden flex-shrink-0">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        student.full_name?.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{student.full_name}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                    {isAdded && (
                                                        <p className="text-[10px] uppercase font-bold text-emerald-600 mt-1">
                                                            Enrolled in {batchName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAddStudent(student)}
                                                disabled={isAdded}
                                                className={`p-2 rounded-lg transition-colors ${isAdded
                                                        ? 'bg-slate-100 text-slate-400 cursor-default'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                                    }`}
                                            >
                                                {isAdded ? <CheckCircle size={18} /> : <UserPlus size={18} />}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="text-slate-500 font-bold text-sm hover:text-slate-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
