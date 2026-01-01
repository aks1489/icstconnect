import { useState, useEffect } from 'react'
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    parseISO,
    eachDayOfInterval,
    isToday,
    addDays
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Clock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import AddEventModal from './AddEventModal'
import EventDetailsModal from './EventDetailsModal'

interface CalendarEvent {
    id: string
    title: string // Course Name or Event Title
    start_time?: string // HH:mm:ss for recurring
    duration_minutes: number
    type: 'class' | 'extra_class' | 'holiday' | 'event'
    date?: string // ISO date for one-off events
    color?: string
    description?: string
    course_id?: number
    teacher_name?: string
}

interface ClassSchedule {
    id: number
    day_of_week: string
    start_time: string
    duration_minutes: number
    course: {
        id: number
        course_name: string
        color?: string
    }
}



export default function GlobalCalendar() {
    const { user, isAdmin, isTeacher } = useAuth()
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })) // Start Monday
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

    // Role helpers
    const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student'

    useEffect(() => {
        if (user) fetchCalendarData()
    }, [user, currentWeekStart, role])

    const fetchCalendarData = async () => {
        setLoading(true)
        try {
            const weekStart = currentWeekStart
            const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }) // Monday start
            const weekStartISO = weekStart.toISOString()
            const weekEndISO = weekEnd.toISOString()

            // 1. Fetch One-off Events (Holidays, Extras)
            let eventQuery = supabase
                .from('calendar_events')
                .select(`
                    *,
                    course:courses(course_name, color)
                `)
                .gte('start_datetime', weekStartISO)
                .lte('end_datetime', weekEndISO)

            // 2. Fetch Recurring Schedules
            // Logic differs by role
            let scheduleQuery = supabase
                .from('class_schedules')
                .select(`
                    *,
                    course:courses(id, course_name)
                `)
                .not('class_id', 'is', null) // Hide orphan schedules

            // Role Filtering
            if (role === 'student' && user) {
                // Students: Only enrolled Batches (Classes)
                const { data: enrollments } = await supabase
                    .from('enrollments')
                    .select('class_id') // Fetch Class IDs (Batches)
                    .eq('student_id', user.id)
                    .eq('status', 'active')

                const classIds = enrollments?.map(e => e.class_id).filter(id => id !== null) || []

                // Filter the queries
                if (classIds.length > 0) {
                    // Match events for ANY of the enrolled classes OR Global Holidays (class_id is null)
                    eventQuery = eventQuery.or(`class_id.in.(${classIds.join(',')}),class_id.is.null`)

                    // Match schedules specifically for these batches
                    scheduleQuery = scheduleQuery.in('class_id', classIds)
                } else {
                    // No enrollments: Show only Global events
                    eventQuery = eventQuery.is('class_id', null)
                    scheduleQuery = scheduleQuery.eq('id', -1) // Empty
                }
            } else if (role === 'teacher') {
                // Teachers: Show everything for now, or refine later
            }

            const [eventsRes, schedulesRes] = await Promise.all([
                eventQuery,
                scheduleQuery
            ])

            if (eventsRes.error) throw eventsRes.error
            if (schedulesRes.error) throw schedulesRes.error

            const rawEvents = eventsRes.data || []
            const rawSchedules = schedulesRes.data as ClassSchedule[] || []

            // Merge Logic
            // We need to map 'rawSchedules' to the specific days of the current week
            const mergedEvents: CalendarEvent[] = []

            // Helper to get date for a day name in current week
            const daysMap: { [key: string]: number } = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0 }

            rawSchedules.forEach(sched => {
                const targetDayIndex = daysMap[sched.day_of_week]
                if (targetDayIndex !== undefined) {
                    // Find the date in current week that matches this index
                    const targetDate = addDays(weekStart, (targetDayIndex - 1 + 7) % 7) // Adjust for Mon start

                    mergedEvents.push({
                        id: `sched-${sched.id}-${format(targetDate, 'yyyy-MM-dd')}`,
                        title: sched.course.course_name,
                        start_time: sched.start_time,
                        duration_minutes: sched.duration_minutes,
                        type: 'class',
                        date: format(targetDate, 'yyyy-MM-dd'),
                        color: sched.course.color || 'indigo',
                        course_id: sched.course.id
                    })
                }
            })

            // Add One-off Events
            rawEvents.forEach((evt: any) => {
                mergedEvents.push({
                    id: `evt-${evt.id}`,
                    title: evt.title,
                    type: evt.event_type,
                    date: format(parseISO(evt.start_datetime), 'yyyy-MM-dd'),
                    start_time: format(parseISO(evt.start_datetime), 'HH:mm:ss'),
                    duration_minutes: 60, // Calc from end_time ideally
                    color: evt.event_type === 'holiday' ? 'rose' : 'amber',
                    description: evt.description
                })
            })

            setEvents(mergedEvents)

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1))
    const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1))
    const resetToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

    const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    })

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {format(currentWeekStart, 'MMMM yyyy')}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Week of {format(currentWeekStart, 'd')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd')}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={resetToday} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
                        Today
                    </button>
                    <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                        <ChevronRight size={20} />
                    </button>

                    {isAdmin && (
                        <div className="ml-4 pl-4 border-l border-slate-200">
                            <button
                                onClick={() => setIsAddEventOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200"
                            >
                                <Plus size={16} />
                                <span className="hidden md:inline">Add Event</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Event Modal */}
            <AddEventModal
                isOpen={isAddEventOpen}
                onClose={() => setIsAddEventOpen(false)}
                onSuccess={fetchCalendarData}
            />

            <EventDetailsModal
                isOpen={!!selectedEvent}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />

            {/* Week Grid */}
            <div className="grid grid-cols-7 min-h-[500px] divide-x divide-slate-100 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                )}

                {weekDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = events.filter(e => e.date === dateKey)
                        .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

                    const isTodayDate = isToday(day)

                    return (
                        <div key={dateKey} className="flex flex-col bg-slate-50/30">
                            {/* Day Header */}
                            <div className={`p-4 text-center border-b border-slate-100 ${isTodayDate ? 'bg-indigo-50/50' : ''}`}>
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    {format(day, 'EEE')}
                                </span>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mx-auto text-lg font-bold transition-all
                                    ${isTodayDate
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'text-slate-700 bg-white shadow-sm border border-slate-100'}
                                `}>
                                    {format(day, 'd')}
                                </div>
                            </div>

                            {/* Events Container */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                <AnimatePresence>
                                    {dayEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`
                                                p-3 rounded-2xl border mb-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md
                                                ${event.type === 'holiday'
                                                    ? 'bg-rose-50 border-rose-100'
                                                    : event.type === 'extra_class'
                                                        ? 'bg-amber-50 border-amber-100'
                                                        : 'bg-white border-slate-100'
                                                }
                                            `}
                                        >
                                            {/* Status Dot */}
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                    ${event.type === 'holiday' ? 'bg-rose-100 text-rose-600'
                                                        : event.type === 'extra_class' ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-indigo-100 text-indigo-600'}
                                                `}>
                                                    {event.type.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">
                                                {event.title}
                                            </h4>

                                            {event.type !== 'holiday' && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <Clock size={12} className="text-indigo-400" />
                                                    {event.start_time?.slice(0, 5)}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {!loading && dayEvents.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8 opacity-50">
                                        <div className="w-1 h-1 bg-slate-300 rounded-full mb-2" />
                                        <div className="w-1 h-1 bg-slate-300 rounded-full mb-2" />
                                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
