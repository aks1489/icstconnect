import { useState, useEffect } from 'react'
import { IconX as X, IconCheck as Check } from '@tabler/icons-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import CourseSearchSelect from './CourseSearchSelect'

interface CreateClassModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
    const { showToast } = useToast()
    const [courses, setCourses] = useState<any[]>([])
    const [loadingCourses, setLoadingCourses] = useState(false)

    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [batchName, setBatchName] = useState('')
    const [batchNumber, setBatchNumber] = useState('')
    const [capacity, setCapacity] = useState(30)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchCourses()
            // Reset form
            setSelectedCourseId('')
            setBatchName('')
            setBatchNumber('')
            setCapacity(30)
        }
    }, [isOpen])

    // Auto-generate batch name when course/number changes
    useEffect(() => {
        if (selectedCourseId && batchNumber) {
            const course = courses.find(c => c.id.toString() === selectedCourseId)
            if (course) {
                // e.g. "CCP Batch 1"
                setBatchName(`${course.course_name} Batch ${batchNumber}`)
            }
        }
    }, [selectedCourseId, batchNumber, courses])

    const fetchCourses = async () => {
        setLoadingCourses(true)
        const { data } = await supabase.from('courses').select('id, course_name').order('course_name')
        setCourses(data || [])
        setLoadingCourses(false)
    }

    const fetchNextBatchNumber = async (courseId: string) => {
        // Find max batch number for this course
        const { data } = await supabase
            .from('classes')
            .select('batch_number')
            .eq('course_id', courseId)
            .order('batch_number', { ascending: false })
            .limit(1)

        const nextNum = (data && data.length > 0) ? data[0].batch_number + 1 : 1
        setBatchNumber(nextNum.toString())
    }

    const handleCourseChange = (id: string) => {
        setSelectedCourseId(id)
        if (id) {
            fetchNextBatchNumber(id)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCourseId || !batchName) return

        try {
            setLoading(true)
            const { error } = await supabase.from('classes').insert({
                course_id: parseInt(selectedCourseId),
                batch_name: batchName,
                batch_number: parseInt(batchNumber),
                capacity: capacity
            })

            if (error) throw error

            showToast('Batch created successfully!', 'success')
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error creating batch:', error)
            showToast('Failed to create batch: ' + (error?.message || 'Error'), 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Batch</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <CourseSearchSelect
                        courses={courses}
                        value={selectedCourseId}
                        onChange={(id) => handleCourseChange(id)}
                        disabled={loadingCourses}
                        label="Select Course"
                        placeholder="-- Choose Course --"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Batch Number</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={batchNumber}
                                onChange={e => setBatchNumber(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={capacity}
                                onChange={e => setCapacity(parseInt(e.target.value))}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Batch Name</label>
                        <input
                            type="text"
                            required
                            value={batchName}
                            onChange={e => setBatchName(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-medium"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Auto-generated, but you can edit it.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedCourseId}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <Check size={20} />
                                Create Batch
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
