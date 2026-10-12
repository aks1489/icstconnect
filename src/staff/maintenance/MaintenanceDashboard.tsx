import { useState } from 'react'
import {
    IconTools as Tools,
    IconCheck as Check,
    IconClipboardCheck as ClipboardCheck,
    IconBox as Box,
    IconPlus as Plus,
    IconSparkles as Sparkles
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import MyPayslips from '../components/MyPayslips'

interface ChecklistItem {
    id: string
    task: string
    area: string
    frequency: 'Morning' | 'Afternoon' | 'Evening'
    completed: boolean
}

interface SupplyRequest {
    id: string
    item: string
    quantity: string
    status: 'pending' | 'approved' | 'received'
}

export default function MaintenanceDashboard() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<'facilities' | 'payslips'>('facilities')

    const [checklist, setChecklist] = useState<ChecklistItem[]>([
        { id: 'c1', task: 'Sanitize Computer Lab Workstations & Keyboards', area: 'Lab A & B', frequency: 'Morning', completed: true },
        { id: 'c2', task: 'Classroom Floor Mopping & Dustbin Clearance', area: 'Classrooms 1-4', frequency: 'Morning', completed: true },
        { id: 'c3', task: 'Drinking Water Purifier Filter Inspection', area: 'Ground Floor Hub', frequency: 'Morning', completed: false },
        { id: 'c4', task: 'Washroom Hygiene & Hand Sanitizer Refill', area: 'All Floors', frequency: 'Afternoon', completed: false },
        { id: 'c5', task: 'Air Conditioner Air Filter Dust Clearance', area: 'Server & Lab Room', frequency: 'Evening', completed: false }
    ])

    const [supplies, setSupplies] = useState<SupplyRequest[]>([
        { id: 's1', item: 'Microfiber Cleaning Cloths (Pack of 10)', quantity: '2 packs', status: 'approved' },
        { id: 's2', item: 'Antiseptic Floor Disinfectant Liquid (5L)', quantity: '2 cans', status: 'pending' },
        { id: 's3', item: 'Keyboard Compressed Air Dusters', quantity: '4 cans', status: 'pending' }
    ])

    const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false)
    const [supplyForm, setSupplyForm] = useState({ item: '', quantity: '' })

    const toggleChecklist = (id: string) => {
        setChecklist(prev => prev.map(item => {
            if (item.id === id) {
                const nextVal = !item.completed
                showToast(`Task marked as ${nextVal ? 'Completed' : 'Pending'}`, 'info')
                return { ...item, completed: nextVal }
            }
            return item
        }))
    }

    const handleAddSupply = (e: React.FormEvent) => {
        e.preventDefault()
        if (!supplyForm.item || !supplyForm.quantity) {
            showToast('Please specify item and required quantity', 'error')
            return
        }

        const newReq: SupplyRequest = {
            id: `sup-${Date.now()}`,
            item: supplyForm.item,
            quantity: supplyForm.quantity,
            status: 'pending'
        }

        setSupplies([newReq, ...supplies])
        showToast('Supplies requisition submitted to Admin', 'success')
        setSupplyForm({ item: '', quantity: '' })
        setIsAddSupplyOpen(false)
    }

    const completedCount = checklist.filter(c => c.completed).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Tools className="text-emerald-500" size={28} />
                        Campus Facilities & Maintenance Portal
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Welcome, {profile?.full_name || 'Maintenance Staff'} • Campus Cleanliness, Supplies & Facilities Checklist
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('facilities')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'facilities'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        Daily Maintenance Hub
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
                                <span>Today's Task Completion</span>
                                <ClipboardCheck size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {completedCount} / {checklist.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Routine hygiene checkpoints</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Supplies Requisitions</span>
                                <Box size={18} className="text-blue-500" />
                            </div>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {supplies.length}
                            </p>
                            <p className="text-[11px] text-slate-400">Facility supplies requested</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span>Shift Status</span>
                                <Sparkles size={18} className="text-amber-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Morning Shift Active
                            </p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Campus Sanitized</p>
                        </div>
                    </div>

                    {/* Checklist & Supplies Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Tasks Checklist */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Sanitation & Facilities Checklist
                                </h3>
                                <p className="text-xs text-slate-400">Daily hygiene and safety protocol</p>
                            </div>

                            <div className="space-y-2.5">
                                {checklist.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleChecklist(task.id)}
                                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${task.completed
                                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-700 dark:text-slate-300'
                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                                {task.task}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {task.area} • {task.frequency} Routine
                                            </div>
                                        </div>

                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${task.completed
                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                            : 'border-slate-300 dark:border-slate-600 text-transparent'
                                            }`}>
                                            <Check size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Supplies Requests */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Consumable Supplies Requisition
                                    </h3>
                                    <p className="text-xs text-slate-400">Sanitizer, cleaning liquids, tools</p>
                                </div>
                                <button
                                    onClick={() => setIsAddSupplyOpen(!isAddSupplyOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                    <Plus size={14} />
                                    <span>Request Item</span>
                                </button>
                            </div>

                            {/* Add Form */}
                            {isAddSupplyOpen && (
                                <form onSubmit={handleAddSupply} className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/40 space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="Item description (e.g. Floor Disinfectant 5L) *"
                                        required
                                        value={supplyForm.item}
                                        onChange={e => setSupplyForm({ ...supplyForm, item: e.target.value })}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Quantity needed (e.g. 2 cans) *"
                                        required
                                        value={supplyForm.quantity}
                                        onChange={e => setSupplyForm({ ...supplyForm, quantity: e.target.value })}
                                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddSupplyOpen(false)}
                                            className="px-2.5 py-1 text-xs text-slate-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                                        >
                                            Submit Requisition
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-2.5">
                                {supplies.map(sup => (
                                    <div key={sup.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{sup.item}</div>
                                            <div className="text-[11px] text-slate-400">Qty: {sup.quantity}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sup.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                                            {sup.status}
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
