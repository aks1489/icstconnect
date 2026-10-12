import { useState } from 'react'
import {
    IconDeviceLaptop as Laptop,
    IconTools as Tools,
    IconAlertTriangle as AlertTriangle,
    IconCheck as Check,
    IconPlus as Plus
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import MyPayslips from '../components/MyPayslips'

interface Workstation {
    id: string
    name: string
    lab: string
    os: string
    status: 'online' | 'maintenance' | 'offline'
}

interface FaultTicket {
    id: string
    workstation: string
    issue: string
    reportedAt: string
    status: 'open' | 'resolving' | 'closed'
}

export default function LabDashboard() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<'infrastructure' | 'payslips'>('infrastructure')

    const [workstations] = useState<Workstation[]>([
        { id: 'ws1', name: 'PC-01 (Master)', lab: 'Lab A (Programming)', os: 'Windows 11 / VS Code / Python', status: 'online' },
        { id: 'ws2', name: 'PC-02', lab: 'Lab A (Programming)', os: 'Windows 11 / GCC / DevC++', status: 'online' },
        { id: 'ws3', name: 'PC-03', lab: 'Lab A (Programming)', os: 'Windows 11 / VS Code', status: 'maintenance' },
        { id: 'ws4', name: 'PC-04', lab: 'Lab B (Hardware & Office)', os: 'Windows 10 / MS Office', status: 'online' },
        { id: 'ws5', name: 'PC-05', lab: 'Lab B (Hardware & Office)', os: 'Windows 10 / Typing Master', status: 'online' },
        { id: 'ws6', name: 'PC-06', lab: 'Lab B (Hardware & Office)', os: 'Windows 10 / TallyPrime', status: 'offline' }
    ])

    const [tickets, setTickets] = useState<FaultTicket[]>([
        { id: 't1', workstation: 'PC-03 (Lab A)', issue: 'Keyboard USB port loose / intermittent disconnect', reportedAt: 'Yesterday', status: 'resolving' },
        { id: 't2', workstation: 'PC-06 (Lab B)', issue: 'RAM memory beep on cold boot', reportedAt: '2 days ago', status: 'open' }
    ])

    const [isAddTicketOpen, setIsAddTicketOpen] = useState(false)
    const [ticketForm, setTicketForm] = useState({ workstation: '', issue: '' })

    const handleAddTicket = (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticketForm.workstation || !ticketForm.issue) {
            showToast('Please specify workstation and problem description', 'error')
            return
        }

        const newTicket: FaultTicket = {
            id: `t-${Date.now()}`,
            workstation: ticketForm.workstation,
            issue: ticketForm.issue,
            reportedAt: 'Just now',
            status: 'open'
        }

        setTickets([newTicket, ...tickets])
        showToast('Hardware maintenance ticket registered', 'success')
        setTicketForm({ workstation: '', issue: '' })
        setIsAddTicketOpen(false)
    }

    const onlineCount = workstations.filter(w => w.status === 'online').length
    const maintCount = workstations.filter(w => w.status === 'maintenance').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Laptop className="text-blue-500" size={28} />
                        Lab Infrastructure & Hardware Portal
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Welcome, {profile?.full_name || 'Lab Assistant'} • Computer Lab Workstation Status & Maintenance
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('infrastructure')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'infrastructure'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        Lab Workstations
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
                                <span>Operational Workstations</span>
                                <Check size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {onlineCount} / {workstations.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Ready for batch sessions</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Active Maintenance</span>
                                <Tools size={18} className="text-amber-500" />
                            </div>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                {maintCount}
                            </p>
                            <p className="text-[11px] text-slate-400">Hardware checks in progress</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Open Tickets</span>
                                <AlertTriangle size={18} className="text-red-500" />
                            </div>
                            <p className="text-2xl font-black text-red-600 dark:text-red-400">
                                {tickets.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Requires technical repair</p>
                        </div>
                    </div>

                    {/* Workstations Grid & Maintenance Tickets */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Workstations Status */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Workstation Roster
                                    </h3>
                                    <p className="text-xs text-slate-400">Lab PC hardware inventory</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {workstations.map(ws => (
                                    <div key={ws.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Laptop size={16} className="text-blue-500" />
                                                <span>{ws.name}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ws.status === 'online'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                : ws.status === 'maintenance'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                }`}>
                                                {ws.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">{ws.lab}</p>
                                        <p className="text-[10px] font-mono text-slate-400">{ws.os}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fault Tickets */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Fault Tickets
                                    </h3>
                                    <p className="text-xs text-slate-400">Incident reporting</p>
                                </div>
                                <button
                                    onClick={() => setIsAddTicketOpen(!isAddTicketOpen)}
                                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    title="Add Ticket"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Ticket Form */}
                            {isAddTicketOpen && (
                                <form onSubmit={handleAddTicket} className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="Workstation / Component *"
                                        required
                                        value={ticketForm.workstation}
                                        onChange={e => setTicketForm({ ...ticketForm, workstation: e.target.value })}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="Fault Description *"
                                        required
                                        value={ticketForm.issue}
                                        onChange={e => setTicketForm({ ...ticketForm, issue: e.target.value })}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddTicketOpen(false)}
                                            className="px-2.5 py-1 text-xs text-slate-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                        >
                                            Submit Ticket
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-2.5">
                                {tickets.map(tk => (
                                    <div key={tk.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{tk.workstation}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tk.status === 'open' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                                                {tk.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400">{tk.issue}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{tk.reportedAt}</p>
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
