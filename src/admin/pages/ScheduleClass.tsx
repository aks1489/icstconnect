import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { addMonths, eachDayOfInterval, format, set, addMinutes } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

interface Course {
    id: number
    course_name: string
    duration_months: number
    color: string
}

export default function ScheduleClass() {
    const navigate = useNavigate()
    const [courses, setCourses] = useState<Course[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [selectedDays, setSelectedDays] = useState<string[]>([]) // ['Monday', 'Wednesday']
    const [startTime, setStartTime] = useState('10:00')
    const [durationMinutes, setDurationMinutes] = useState(60) // 1 Hour default
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    // Derived State
    const [previewEndDate, setPreviewEndDate] = useState<Date | null>(null)

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        calculateEndDate()
    }, [selectedCourseId, startDate])

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, course_name, duration_months, color')
        if (data) setCourses(data)
    }

    const calculateEndDate = () => {
        if (!selectedCourseId || !startDate) return

        const course = courses.find(c => c.id.toString() === selectedCourseId)
        if (!course) return

        const start = new Date(startDate)
        const end = addMonths(start, course.duration_months || 6)
        setPreviewEndDate(end)
    }

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day))
        } else {
            setSelectedDays([...selectedDays, day])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCourseId || selectedDays.length === 0) {
            alert('Please select a course and at least one day.')
            return
        }

        setSubmitting(true)

        try {
            const course = courses.find(c => c.id.toString() === selectedCourseId)
            if (!course) throw new Error('Course not found')

            const start = new Date(startDate)
            const end = previewEndDate || addMonths(start, 6)

            // 1. Create Schedule Rule (Parent)
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('class_schedules')
                .insert({
                    course_id: parseInt(selectedCourseId),
                    day_of_week: selectedDays.join(','),
                    start_time: startTime,
                    duration_minutes: durationMinutes
                })
                .select()
                .single()

            if (scheduleError) throw scheduleError

            // 2. Generate Calendar Events (Instances)
            const scheduleId = scheduleData.id
            const allDays = eachDayOfInterval({ start, end })

            const eventsToInsert: any[] = []

            allDays.forEach(day => {
                const dayName = format(day, 'EEEE') // 'Monday'
                if (selectedDays.includes(dayName)) {
                    // Set Time
                    const eventStart = set(day, {
                        hours: parseInt(startTime.split(':')[0]),
                        minutes: parseInt(startTime.split(':')[1]),
                        seconds: 0
                    })
                    const eventEnd = addMinutes(eventStart, durationMinutes)

                    eventsToInsert.push({
                        schedule_id: scheduleId,
                        course_id: parseInt(selectedCourseId),
                        title: `${course.course_name} Class`,
                        start_datetime: eventStart.toISOString(),
                        end_datetime: eventEnd.toISOString(),
                        event_type: 'class',
                        description: `Regular class for ${course.course_name}`
                    })
                }
            })

            if (eventsToInsert.length > 0) {
                const { error: eventsError } = await supabase
                    .from('calendar_events')
                    .insert(eventsToInsert)

                if (eventsError) throw eventsError
            }

            alert(`Successfully scheduled ${eventsToInsert.length} classes!`)
            navigate('/admin/calendar')

        } catch (error: any) {
            console.error('Error scheduling class:', error)
            alert('Failed to schedule class: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <button onClick={() => navigate('/admin/calendar')} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Calendar
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Schedule New Class</h1>
                <p className="text-slate-500 mt-1">Define recurring schedules for your courses.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
                {/* 1. Select Course */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    >
                        <option value="">-- Choose a Course --</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.course_name} ({course.duration_months} Months)
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Schedule Details */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Auto)</label>
                        <input
                            type="text"
                            readOnly
                            value={previewEndDate ? format(previewEndDate, 'MMM dd, yyyy') : '-'}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                        <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                        <select
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                        >
                            <option value={60}>1 Hour</option>
                            <option value={90}>1.5 Hours</option>
                            <option value={120}>2 Hours</option>
                            <option value={180}>3 Hours</option>
                        </select>
                    </div>
                </div>

                {/* 3. Days Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Class Days</label>
                    <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all border
                                    ${selectedDays.includes(day)
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }
                                `}
                            >
                                {day.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Select the days when this class takes place (e.g., Mon, Wed).
                    </p>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {submitting ? 'Generating Schedule...' : 'Create Class Schedule'}
                    </button>
                </div>
            </form>
        </div>
    )
}
