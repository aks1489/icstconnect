import { useState } from 'react'
import {
    IconPhoneCall as PhoneCall,
    IconUsers as Users,
    IconClipboardList as ClipboardList,
    IconPlus as Plus,
    IconClock as Clock
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import MyPayslips from '../components/MyPayslips'

interface VisitorEntry {
    id: string
    name: string
    phone: string
    purpose: string
    timestamp: string
    status: 'arrived' | 'in_meeting' | 'departed'
}

interface EnquiryEntry {
    id: string
    studentName: string
    guardianName: string
    phone: string
    course: string
    notes: string
    status: 'new' | 'called' | 'visited'
}

export default function ReceptionDashboard() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<'frontdesk' | 'payslips'>('frontdesk')

    // Local in-memory demo state for reception operations
    const [visitors] = useState<VisitorEntry[]>([
        { id: '1', name: 'Rohan Mondal', phone: '9876543210', purpose: 'C++ Course Syllabus Enquiry', timestamp: '10:15 AM', status: 'arrived' },
        { id: '2', name: 'Priya Karmakar', phone: '9832109876', purpose: 'Certificate Collection', timestamp: '11:30 AM', status: 'departed' },
        { id: '3', name: 'Subham Ghosh', phone: '9748123456', purpose: 'Python Batch Schedule', timestamp: '12:45 PM', status: 'in_meeting' }
    ])

    const [enquiries, setEnquiries] = useState<EnquiryEntry[]>([
        { id: 'e1', studentName: 'Aniket Roy', guardianName: 'B. Roy', phone: '9876543211', course: 'Full Stack Web Dev', notes: 'Interested in evening batch', status: 'new' },
        { id: 'e2', studentName: 'Sneha Das', guardianName: 'K. Das', phone: '9876543212', course: 'Certificate in Python', notes: 'Weekend batch inquiry', status: 'called' }
    ])

    const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false)
    const [enquiryForm, setEnquiryForm] = useState({
        studentName: '',
        guardianName: '',
        phone: '',
        course: '',
        notes: ''
    })

    const handleAddEnquiry = (e: React.FormEvent) => {
        e.preventDefault()
        if (!enquiryForm.studentName || !enquiryForm.phone) {
            showToast('Please enter candidate name and phone', 'error')
            return
        }

        const newEntry: EnquiryEntry = {
            id: `enq-${Date.now()}`,
            studentName: enquiryForm.studentName,
            guardianName: enquiryForm.guardianName,
            phone: enquiryForm.phone,
            course: enquiryForm.course || 'General Enquiry',
            notes: enquiryForm.notes,
            status: 'new'
        }

        setEnquiries([newEntry, ...enquiries])
        showToast('Enquiry logged successfully!', 'success')
        setEnquiryForm({ studentName: '', guardianName: '', phone: '', course: '', notes: '' })
        setIsAddEnquiryOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <PhoneCall className="text-amber-500" size={28} />
                        Front Desk & Reception Hub
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Welcome back, {profile?.full_name || 'Reception In-Charge'} • Institute Front Desk Operations
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('frontdesk')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'frontdesk'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        Front Desk Operations
                    </button>
                    <button
                        onClick={() => setActiveTab('payslips')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'payslips'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        My Payslips & Salary
                    </button>
                </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'payslips' ? (
                <MyPayslips />
            ) : (
                <div className="space-y-6">
                    {/* Operational KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Today's Visitors</span>
                                <Users size={18} className="text-amber-500" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {visitors.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Walk-ins logged today</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Active Enquiries</span>
                                <ClipboardList size={18} className="text-blue-500" />
                            </div>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {enquiries.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Prospective student intake</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Front Desk In-Charge</span>
                                <Clock size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                {profile?.full_name || 'Staff User'}
                            </p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active On Duty</p>
                        </div>
                    </div>

                    {/* Quick Enquiries Logger & List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enquiries Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Admission Enquiries
                                    </h3>
                                    <p className="text-xs text-slate-400">Prospective student inquiries</p>
                                </div>
                                <button
                                    onClick={() => setIsAddEnquiryOpen(!isAddEnquiryOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>New Enquiry</span>
                                </button>
                            </div>

                            {/* Add Form */}
                            {isAddEnquiryOpen && (
                                <form onSubmit={handleAddEnquiry} className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Candidate Name *"
                                            value={enquiryForm.studentName}
                                            onChange={e => setEnquiryForm({ ...enquiryForm, studentName: e.target.value })}
                                            className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                        />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Contact Phone *"
                                            value={enquiryForm.phone}
                                            onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                            className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Course Interested in (e.g. Java, Python, Web Dev)"
                                        value={enquiryForm.course}
                                        onChange={e => setEnquiryForm({ ...enquiryForm, course: e.target.value })}
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddEnquiryOpen(false)}
                                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold"
                                        >
                                            Save Entry
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Enquiries List */}
                            <div className="space-y-2.5">
                                {enquiries.map(enq => (
                                    <div key={enq.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{enq.studentName}</div>
                                            <div className="text-[11px] text-slate-500 font-mono">{enq.phone} • {enq.course}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${enq.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                            {enq.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visitors Registry */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Visitor Log & Daily Registry
                                </h3>
                                <p className="text-xs text-slate-400">Campus front desk entries</p>
                            </div>

                            <div className="space-y-2.5">
                                {visitors.map(vis => (
                                    <div key={vis.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{vis.name}</div>
                                            <div className="text-[11px] text-slate-500">{vis.purpose} • <span className="font-mono">{vis.timestamp}</span></div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${vis.status === 'arrived'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                            : vis.status === 'departed'
                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            }`}>
                                            {vis.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
