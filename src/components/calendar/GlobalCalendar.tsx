import { useState, useEffect } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns'
import { supabase } from '../../lib/supabase'

interface CalendarEvent {
    id: number
    title: string
    start_datetime: string
    end_datetime: string
    event_type: 'class' | 'exam' | 'holiday'
    description?: string
    course?: {
        course_name: string
        color: string
    }
}

interface GlobalCalendarProps {
    isAdmin?: boolean
    onDateClick?: (date: Date) => void
    refreshTrigger?: number // Simple way to trigger refresh from parent
}

export default function GlobalCalendar({ isAdmin = false, onDateClick, refreshTrigger = 0 }: GlobalCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [view, setView] = useState<'month' | 'agenda'>('month')

    useEffect(() => {
        fetchEvents()
    }, [currentDate, refreshTrigger])

    // Fetch events for the current month range (padded by weeks)
    const fetchEvents = async () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const startDate = startOfWeek(monthStart).toISOString()
        const endDate = endOfWeek(monthEnd).toISOString()

        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .select(`
                    *,
                    course:courses (
                        course_name,
                        color
                    )
                `)
                .gte('start_datetime', startDate)
                .lte('end_datetime', endDate)

            if (error) throw error
            setEvents(data || [])
        } catch (error) {
            console.error('Error fetching events:', error)
        }
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const resetToToday = () => setCurrentDate(new Date())

    // Calendar Grid Generation
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(parseISO(event.start_datetime), day))
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex bg-slate-100 rounded-lg p-1 hidden sm:flex">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('agenda')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${view === 'agenda' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Agenda
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                        onClick={resetToToday}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            {view === 'month' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 shrink-0">
                        {daysOfWeek.map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                        {calendarDays.map((day) => {
                            const dayEvents = getEventsForDay(day)
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                            const isCurrentMonth = isSameMonth(day, currentDate)

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => {
                                        setSelectedDate(day)
                                        if (onDateClick) onDateClick(day)
                                    }}
                                    className={`
                                        min-h-[100px] border-b border-r border-slate-100 p-2 transition-all cursor-pointer relative group
                                        ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50'}
                                        ${isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`
                                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                                            ${isToday(day)
                                                ? 'bg-red-500 text-white shadow-md'
                                                : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                                            }
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {isAdmin && (
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                                                <i className="bi bi-plus-circle-fill"></i>
                                            </button>
                                        )}
                                    </div>

                                    {/* Events List for the Day */}
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`
                                                    text-[10px] px-1.5 py-1 rounded border truncate font-medium
                                                    ${event.event_type === 'exam'
                                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                        : event.event_type === 'holiday'
                                                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                                                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                    }
                                                `}
                                                title={event.title}
                                            >
                                                {format(parseISO(event.start_datetime), 'h:mm a')} {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* Agenda View (better for mobile) */
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {calendarDays.filter(day => isSameMonth(day, currentDate)).map(day => {
                        const dayEvents = getEventsForDay(day)
                        if (dayEvents.length === 0) return null

                        return (
                            <div key={day.toString()} className="flex gap-4">
                                <div className="flex flex-col items-center w-14 shrink-0 pt-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">{format(day, 'EEE')}</span>
                                    <span className={`text-xl font-bold ${isToday(day) ? 'text-red-500' : 'text-slate-800'}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-2 pb-6 border-l border-slate-100 pl-4 relative">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white"></div>
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between group"
                                        >
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-sm">{event.title}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    <i className="bi bi-clock mr-1"></i>
                                                    {format(parseISO(event.start_datetime), 'h:mm a')} - {format(parseISO(event.end_datetime), 'h:mm a')}
                                                </p>
                                                {event.description && (
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{event.description}</p>
                                                )}
                                            </div>
                                            <span className={`
                                                text-[10px] uppercase font-bold px-2 py-1 rounded-full
                                                 ${event.event_type === 'exam'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : event.event_type === 'holiday'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                }
                                            `}>
                                                {event.event_type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                    {calendarDays.filter(day => isSameMonth(day, currentDate) && getEventsForDay(day).length > 0).length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <i className="bi bi-calendar-x text-4xl mb-3 block opacity-50"></i>
                            <p>No events scheduled for this month.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
