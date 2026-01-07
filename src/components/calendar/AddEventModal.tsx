import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface AddEventModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddEventModal({ isOpen, onClose, onSuccess }: AddEventModalProps) {
    const [eventType, setEventType] = useState<'holiday' | 'extra_class'>('extra_class')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('10:00')


    // Selection for Extra Class
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClassId, setSelectedClassId] = useState('')

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && eventType === 'extra_class') {
            fetchCourses()
        }
    }, [isOpen, eventType])

    useEffect(() => {
        if (selectedCourseId) {
            fetchClasses(selectedCourseId)
        } else {
            setClasses([])
        }
    }, [selectedCourseId])

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, course_name').order('course_name')
        setCourses(data || [])
    }

    const fetchClasses = async (courseId: string) => {
        const { data } = await supabase.from('classes').select('*').eq('course_id', courseId).order('batch_number')
        setClasses(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const eventData: any = {
                title,
                description,
                start_datetime: `${date}T${startTime}:00`,
                end_datetime: `${date}T${startTime}:00`, // Ideally calc end time
                event_type: eventType,
                // created_by removed as strictly not in schema
            }

            if (eventType === 'extra_class') {
                if (!selectedClassId) throw new Error('Please select a batch')
                eventData.class_id = parseInt(selectedClassId)
                eventData.course_id = parseInt(selectedCourseId)
            } else {
                // Holiday is global, but let's just null out class_id
                eventData.class_id = null
                eventData.course_id = null
            }

            const { error } = await supabase.from('calendar_events').insert(eventData)
            if (error) throw error

            onSuccess()
            onClose()
            // Reset form
            setTitle('')
            setDescription('')
            setEventType('extra_class')
        } catch (error: any) {
            console.error('Error adding event:', error)
            alert(error.message || 'Failed to add event')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-slate-800">Add Calendar Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setEventType('extra_class')}
                            className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${eventType === 'extra_class'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                                }`}
                        >
                            Extra Class
                        </button>
                        <button
                            type="button"
                            onClick={() => setEventType('holiday')}
                            className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${eventType === 'holiday'
                                ? 'border-rose-600 bg-rose-50 text-rose-700'
                                : 'border-slate-100 bg-white text-slate-500 hover:border-rose-200'
                                }`}
                        >
                            Holiday / Event
                        </button>
                    </div>

                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={eventType === 'extra_class' ? "e.g. Extra Doubt Session" : "e.g. Independence Day"}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        {eventType === 'extra_class' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Extra Class Specifics */}
                    {eventType === 'extra_class' && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Batch</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Course</label>
                                    <select
                                        required
                                        value={selectedCourseId}
                                        onChange={e => setSelectedCourseId(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-sm"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.course_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Class Batch</label>
                                    <select
                                        required
                                        value={selectedClassId}
                                        onChange={e => setSelectedClassId(e.target.value)}
                                        disabled={!selectedCourseId}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 outline-none text-sm disabled:opacity-50"
                                    >
                                        <option value="">Select Batch</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.batch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Check size={20} />
                                Create Event
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
