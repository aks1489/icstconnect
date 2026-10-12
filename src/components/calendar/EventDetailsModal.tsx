import { IconX as X, IconCalendar as Calendar, IconClock as Clock, IconBook2 as BookOpen, IconInfoCircle as Info } from '@tabler/icons-react'
import { motion } from 'framer-motion'

interface CalendarEvent {
    id: string
    title: string
    start_time?: string
    duration_minutes: number
    type: 'class' | 'extra_class' | 'holiday' | 'event'
    date?: string
    color?: string
    description?: string
    course_id?: number
}

interface EventDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    event: CalendarEvent | null
    onDelete?: () => void
}

export default function EventDetailsModal({ isOpen, onClose, event, onDelete }: EventDetailsModalProps) {
    if (!isOpen || !event) return null

    // Helper to format duration
    const getDurationString = (mins: number) => {
        const hours = Math.floor(mins / 60)
        const m = mins % 60
        if (hours > 0 && m > 0) return `${hours}h ${m}m`
        if (hours > 0) return `${hours}h`
        return `${m}m`
    }

    // Helper to get formatted date safely
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }

    const isClass = event.type === 'class' || event.type === 'extra_class'
    const isHoliday = event.type === 'holiday'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header with Dynamic Color */}
                <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start 
                    ${isHoliday ? 'bg-rose-50 dark:bg-rose-950/40' : event.type === 'extra_class' ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-indigo-50 dark:bg-indigo-950/40'}
                `}>
                    <div>
                        <span className={`
                            inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-2
                            ${isHoliday ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : event.type === 'extra_class' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'}
                        `}>
                            {event.type.replace('_', ' ')}
                        </span>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">{event.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Date</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{formatDate(event.date)}</p>
                            </div>
                        </div>

                        {!isHoliday && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Time & Duration</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {event.start_time?.slice(0, 5)} • {getDurationString(event.duration_minutes)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {isClass && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Course / Batch</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Batch ID: {event.course_id ? `#${event.course_id}` : 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {event.description && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors border border-red-100 dark:border-red-900/40"
                        >
                            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">!</span>
                            Delete
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
