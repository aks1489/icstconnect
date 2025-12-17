import { FileText } from 'lucide-react'

export default function Exams() {
    return (
        <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
                <FileText className="text-4xl text-amber-500" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Exams Management</h1>
            <p className="text-slate-500 max-w-md mx-auto">
                This feature is coming soon. Teachers will be able to create, schedule, and grade exams directly from this portal.
            </p>
        </div>
    )
}
