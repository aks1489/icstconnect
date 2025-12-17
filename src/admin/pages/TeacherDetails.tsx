import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Check, X, Pencil, Mail, Calendar, CalendarX, UserMinus, Ban } from 'lucide-react'

interface TeacherProfile {
    id: string
    full_name: string
    email: string
    created_at: string
    teacher_id?: string
}

export default function TeacherDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
    const [loading, setLoading] = useState(true)

    // Edit ID state
    const [isEditingId, setIsEditingId] = useState(false)
    const [newTeacherId, setNewTeacherId] = useState('')

    useEffect(() => {
        if (id) fetchTeacher()
    }, [id])

    const fetchTeacher = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (data) {
            setTeacher(data)
            setNewTeacherId(data.teacher_id || '')
        }
        setLoading(false)
    }

    const handleDemote = async () => {
        if (!window.confirm('Are you sure you want to remove Teacher privileges? This user will become a regular Student.')) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'student' })
                .eq('id', id)

            if (error) throw error

            alert('User role updated to Student.')
            navigate('/admin/teachers')
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to update role')
        }
    }

    const handleUpdateId = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ teacher_id: newTeacherId || null })
                .eq('id', id)

            if (error) throw error

            setTeacher(prev => prev ? { ...prev, teacher_id: newTeacherId } : null)
            setIsEditingId(false)
            alert('Teacher ID updated successfully')
        } catch (error) {
            console.error('Error updating ID:', error)
            alert('Failed to update Teacher ID')
        }
    }

    if (loading) return <div className="p-12 text-center text-slate-400">Loading profile...</div>
    if (!teacher) return <div className="p-12 text-center text-slate-400">Teacher not found</div>

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/admin/teachers" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Faculty
                </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
                <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-lg shrink-0 z-10">
                            <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-500">
                                {teacher.full_name?.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left min-w-0 w-full md:w-auto relative z-20 md:mt-20">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h1 className="text-3xl font-bold text-slate-800 truncate max-w-full py-1">{teacher.full_name}</h1>
                                {isEditingId ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newTeacherId}
                                            onChange={(e) => setNewTeacherId(e.target.value)}
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-32"
                                            placeholder="Enter ID..."
                                        />
                                        <button onClick={handleUpdateId} className="text-emerald-600 hover:text-emerald-700">
                                            <Check className="text-xl" size={20} />
                                        </button>
                                        <button onClick={() => setIsEditingId(false)} className="text-red-500 hover:text-red-700">
                                            <X className="text-xl" size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingId(true)}
                                        className="group cursor-pointer flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors shrink-0"
                                    >
                                        <span className="text-sm font-mono font-bold text-slate-600">
                                            {teacher.teacher_id || 'No ID'}
                                        </span>
                                        <Pencil className="text-xs text-slate-400 group-hover:text-slate-600" size={12} />
                                    </div>
                                )}
                                <span className="md:ml-auto px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200 whitespace-nowrap">
                                    Active Faculty
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 mt-2 text-slate-500 text-sm font-medium">
                                <span className="flex items-center gap-2"><Mail size={16} /> {teacher.email}</span>
                                <span className="hidden md:inline text-slate-300">|</span>
                                <span className="flex items-center gap-2"><Calendar size={16} /> Joined {new Date(teacher.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="col-span-2 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Assigned Schedule</h3>
                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                                    <CalendarX className="text-3xl mb-2 block mx-auto" size={36} />
                                    No specific classes assigned via the new system yet.
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-4">Management Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleDemote}
                                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <UserMinus size={18} />
                                        Remove Teacher Role
                                    </button>
                                    <button className="w-full py-3 bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2">
                                        <Ban size={18} />
                                        Deactivate Account
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
                                    Removing the teacher role will revert this user to a standard student account immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
