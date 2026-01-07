import { useNavigate } from 'react-router-dom'
import GlobalCalendar from '../../components/calendar/GlobalCalendar'
import { CalendarPlus } from 'lucide-react'

export default function AdminCalendar() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Class Calendar</h1>
                    <p className="text-slate-500 mt-1">Manage schedules and view upcoming classes.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/schedule')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    <CalendarPlus size={18} />
                    Schedule Class
                </button>
            </div>

            <GlobalCalendar />
        </div>
    )
}
