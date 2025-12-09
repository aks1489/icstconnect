import GlobalCalendar from '../../components/calendar/GlobalCalendar'

export default function StudentCalendar() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                <p className="text-slate-500 mt-1">View your classes and important dates.</p>
            </div>

            <GlobalCalendar />
        </div>
    )
}
