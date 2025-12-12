import GlobalCalendar from '../../components/calendar/GlobalCalendar'

export default function TeacherCalendar() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Calendar</h1>
                <p className="text-slate-500 mt-1">View your upcoming classes and exam schedules.</p>
            </div>

            <GlobalCalendar />
        </div>
    )
}
