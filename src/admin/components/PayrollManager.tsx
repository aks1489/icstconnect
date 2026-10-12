import { useState, useEffect, useMemo } from 'react'
import {
    IconReceipt as Receipt,
    IconPlus as Plus,
    IconPrinter as Printer,
    IconCheck as Check,
    IconX as X,
    IconClock as Clock,
    IconSearch as Search,
    IconBuildingBank as BuildingBank,
    IconUsers as Users,
    IconTrash as Trash2,
    IconRefresh as Refresh
} from '@tabler/icons-react'
import { payrollService, type StaffPayslip, type EmployeeRosterItem } from '../../services/payrollService'
import PayslipPrintModal from './PayslipPrintModal'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const MONTHS = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
]

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

export default function PayrollManager() {
    const { showToast } = useToast()

    // Data State
    const [payslips, setPayslips] = useState<StaffPayslip[]>([])
    const [employees, setEmployees] = useState<EmployeeRosterItem[]>([])
    const [loading, setLoading] = useState(true)

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState<number>(CURRENT_MONTH)
    const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [printTarget, setPrintTarget] = useState<StaffPayslip | null>(null)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)

    // Create Payslip Form State
    const [formData, setFormData] = useState({
        employee_id: '',
        pay_period_month: CURRENT_MONTH,
        pay_period_year: CURRENT_YEAR,
        basic_salary: '',
        allowances: '',
        deductions: '',
        payment_mode: 'bank_transfer' as 'bank_transfer' | 'cash' | 'cheque' | 'upi',
        status: 'pending' as 'pending' | 'approved' | 'paid',
        remarks: ''
    })
    const [formSubmitting, setFormSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [selectedMonth, selectedYear])

    const loadData = async () => {
        setLoading(true)
        try {
            const [empList, slipList] = await Promise.all([
                payrollService.getAllEmployees(),
                payrollService.getAllPayslips({ month: selectedMonth, year: selectedYear })
            ])
            setEmployees(empList)
            setPayslips(slipList)
        } catch (err) {
            console.error('Error loading payroll data:', err)
            showToast('Unable to load payroll records. Ensure database migration has been run.', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Filtered list
    const filteredPayslips = useMemo(() => {
        return payslips.filter(slip => {
            if (roleFilter !== 'all' && slip.employee_role !== roleFilter) return false
            if (statusFilter !== 'all' && slip.status !== statusFilter) return false

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchName = (slip.employee_name || '').toLowerCase().includes(q)
                const matchVoucher = (slip.voucher_no || '').toLowerCase().includes(q)
                const matchRole = (slip.employee_role || '').toLowerCase().includes(q)
                if (!matchName && !matchVoucher && !matchRole) return false
            }

            return true
        })
    }, [payslips, roleFilter, statusFilter, searchQuery])

    // KPI Summary
    const stats = useMemo(() => {
        const totalNet = filteredPayslips.reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)
        const totalPaid = filteredPayslips.filter(p => p.status === 'paid').reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)
        const totalPending = filteredPayslips.filter(p => p.status === 'pending').reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)
        const paidCount = filteredPayslips.filter(p => p.status === 'paid').length
        const pendingCount = filteredPayslips.filter(p => p.status === 'pending').length

        return { totalNet, totalPaid, totalPending, paidCount, pendingCount }
    }, [filteredPayslips])

    // Handle Create Payslip
    const handleCreatePayslip = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.employee_id) {
            showToast('Please select an employee', 'error')
            return
        }

        const selectedEmp = employees.find(e => e.id === formData.employee_id)
        if (!selectedEmp) {
            showToast('Employee not found', 'error')
            return
        }

        setFormSubmitting(true)
        try {
            await payrollService.createPayslip({
                employee_id: selectedEmp.id,
                employee_name: selectedEmp.full_name,
                employee_role: selectedEmp.role,
                pay_period_month: Number(formData.pay_period_month),
                pay_period_year: Number(formData.pay_period_year),
                basic_salary: Number(formData.basic_salary) || 0,
                allowances: Number(formData.allowances) || 0,
                deductions: Number(formData.deductions) || 0,
                payment_mode: formData.payment_mode,
                status: formData.status,
                remarks: formData.remarks
            })

            showToast(`Payslip created for ${selectedEmp.full_name} (${formData.status.toUpperCase()})`, 'success')
            setIsCreateModalOpen(false)
            setFormData({
                employee_id: '',
                pay_period_month: selectedMonth,
                pay_period_year: selectedYear,
                basic_salary: '',
                allowances: '',
                deductions: '',
                payment_mode: 'bank_transfer',
                status: 'pending',
                remarks: ''
            })
            loadData()
        } catch (err: any) {
            console.error('Error creating payslip:', err)
            showToast(err.message || 'Failed to create payslip', 'error')
        } finally {
            setFormSubmitting(false)
        }
    }

    // Handle Status Change
    const handleUpdateStatus = (payslip: StaffPayslip, newStatus: 'approved' | 'paid' | 'cancelled') => {
        const isPaying = newStatus === 'paid'
        setConfirmModal({
            isOpen: true,
            title: isPaying ? 'Disburse Salary & Log Expense' : `Mark as ${newStatus.toUpperCase()}`,
            description: isPaying
                ? `Confirm disbursing ₹${payslip.net_salary.toLocaleString()} to ${payslip.employee_name}? This will mark the payslip as PAID and automatically record an institutional expense transaction.`
                : `Are you sure you want to change voucher ${payslip.voucher_no} status to ${newStatus.toUpperCase()}?`,
            confirmLabel: isPaying ? 'Disburse & Record Expense' : `Mark as ${newStatus}`,
            variant: isPaying ? 'primary' : 'warning',
            action: async () => {
                try {
                    await payrollService.updatePayslipStatus(payslip.id, newStatus)
                    showToast(`Voucher ${payslip.voucher_no} marked as ${newStatus.toUpperCase()}`, 'success')
                    loadData()
                } catch (err) {
                    console.error('Error updating payslip status:', err)
                    showToast('Failed to update status', 'error')
                } finally {
                    setConfirmModal(null)
                }
            }
        })
    }

    // Handle Delete Payslip
    const handleDeletePayslip = (payslip: StaffPayslip) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Payslip Voucher',
            description: `Are you sure you want to delete voucher ${payslip.voucher_no} for ${payslip.employee_name}? This cannot be undone.`,
            confirmLabel: 'Delete Voucher',
            variant: 'danger',
            action: async () => {
                try {
                    await payrollService.deletePayslip(payslip.id)
                    showToast('Payslip deleted successfully', 'success')
                    loadData()
                } catch (err) {
                    console.error('Error deleting payslip:', err)
                    showToast('Failed to delete payslip', 'error')
                } finally {
                    setConfirmModal(null)
                }
            }
        })
    }

    // Computed net preview for create form
    const formNetSalary = Math.max(
        0,
        (Number(formData.basic_salary) || 0) + (Number(formData.allowances) || 0) - (Number(formData.deductions) || 0)
    )

    return (
        <div className="space-y-6">
            {/* Top Bar with KPI cards */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            ERP Module
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Admin is an Employee on Payroll • Multi-Role Hierarchy
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                        <Receipt className="text-indigo-600 dark:text-indigo-400" size={24} />
                        Institutional Payroll & Payslip Engine
                    </h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={loadData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Refresh Payroll"
                    >
                        <Refresh size={18} />
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Generate Payslip</span>
                    </button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Total Monthly Payroll</span>
                        <BuildingBank size={18} className="text-indigo-500" />
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{stats.totalNet.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">{filteredPayslips.length} Payslips Generated</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Disbursed & Paid</span>
                        <Check size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{stats.totalPaid.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">{stats.paidCount} Disbursed</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Pending Disbursal</span>
                        <Clock size={18} className="text-amber-500" />
                    </div>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        ₹{stats.totalPending.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">{stats.pendingCount} Pending</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Employee Roster</span>
                        <Users size={18} className="text-purple-500" />
                    </div>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                        {employees.length}
                    </p>
                    <p className="text-[11px] text-slate-400">All Active Staff Roles</p>
                </div>
            </div>

            {/* Filter and Period Controls Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    {/* Month Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Period:</label>
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Employee Roles</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher / Faculty</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="lab_assistant">Lab Assistant</option>
                        <option value="maintenance">Maintenance Staff</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search employee or voucher..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Payslips Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="p-4">Voucher No</th>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Role / Dept</th>
                                <th className="p-4">Period</th>
                                <th className="p-4">Basic / Gross</th>
                                <th className="p-4">Deductions</th>
                                <th className="p-4">Net Salary</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading institutional payroll records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayslips.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center">
                                        <Receipt size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            No payslips found for this period
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Click "Generate Payslip" above to issue a new salary voucher.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayslips.map(slip => {
                                    const gross = (slip.basic_salary || 0) + (slip.allowances || 0)
                                    const monthLabel = payrollService.getMonthShort(slip.pay_period_month)

                                    return (
                                        <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* Voucher No */}
                                            <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                {slip.voucher_no}
                                            </td>

                                            {/* Employee */}
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {slip.employee_name}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    Mode: {slip.payment_mode.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold capitalize bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    {slip.employee_role.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Period */}
                                            <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                                                {monthLabel} {slip.pay_period_year}
                                            </td>

                                            {/* Basic / Gross */}
                                            <td className="p-4">
                                                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    ₹{gross.toLocaleString()}
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    Base: ₹{(slip.basic_salary || 0).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Deductions */}
                                            <td className="p-4 font-mono text-red-600 dark:text-red-400 font-semibold">
                                                -₹{(slip.deductions || 0).toLocaleString()}
                                            </td>

                                            {/* Net Salary */}
                                            <td className="p-4 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                                ₹{(slip.net_salary || 0).toLocaleString()}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${slip.status === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : slip.status === 'approved'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                        : slip.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                    }`}>
                                                    {slip.status === 'paid' && <Check size={12} />}
                                                    {slip.status === 'pending' && <Clock size={12} />}
                                                    {slip.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View / Print Voucher */}
                                                    <button
                                                        onClick={() => setPrintTarget(slip)}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                        title="Print / View Voucher"
                                                    >
                                                        <Printer size={15} />
                                                    </button>

                                                    {/* Status actions */}
                                                    {slip.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(slip, 'approved')}
                                                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 font-bold text-[10px] transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {slip.status !== 'paid' && slip.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(slip, 'paid')}
                                                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors shadow-sm"
                                                        >
                                                            Disburse
                                                        </button>
                                                    )}

                                                    {/* Delete option */}
                                                    {slip.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleDeletePayslip(slip)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                            title="Delete Payslip"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Payslip Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Generate Employee Payslip
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Voucher will be initialized with Pending status
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePayslip} className="p-6 space-y-4">
                            {/* Employee Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Select Employee (Any Role / Admin) *
                                </label>
                                <select
                                    required
                                    value={formData.employee_id}
                                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Choose Staff Member --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.full_name} [{emp.role.toUpperCase()}] ({emp.employee_id})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Pay Period Month & Year */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Pay Period Month *
                                    </label>
                                    <select
                                        value={formData.pay_period_month}
                                        onChange={e => setFormData({ ...formData, pay_period_month: Number(e.target.value) })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Pay Period Year *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={2020}
                                        max={2035}
                                        value={formData.pay_period_year}
                                        onChange={e => setFormData({ ...formData, pay_period_year: Number(e.target.value) })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Basic Salary */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Basic Salary (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step="0.01"
                                    placeholder="e.g. 25000"
                                    value={formData.basic_salary}
                                    onChange={e => setFormData({ ...formData, basic_salary: e.target.value })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Allowances & Deductions */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Allowances (HRA/DA) (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        placeholder="e.g. 5000"
                                        value={formData.allowances}
                                        onChange={e => setFormData({ ...formData, allowances: e.target.value })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Deductions (PF/TDS) (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        placeholder="e.g. 1500"
                                        value={formData.deductions}
                                        onChange={e => setFormData({ ...formData, deductions: e.target.value })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Live Computed Net */}
                            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                                        Computed Net Payable
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Basic + Allowances - Deductions
                                    </span>
                                </div>
                                <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                                    ₹{formNetSalary.toLocaleString()}
                                </span>
                            </div>

                            {/* Payment Mode & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Payment Mode
                                    </label>
                                    <select
                                        value={formData.payment_mode}
                                        onChange={e => setFormData({ ...formData, payment_mode: e.target.value as any })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                                        <option value="upi">UPI / Online</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="cash">Cash Voucher</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Initial Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Pending (Draft)</option>
                                        <option value="approved">Approved</option>
                                        <option value="paid">Paid & Disbursed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Remarks / Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Regular monthly payroll disbursal"
                                    value={formData.remarks}
                                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {formSubmitting ? 'Generating...' : 'Create Payslip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Voucher Modal */}
            <PayslipPrintModal
                isOpen={!!printTarget}
                onClose={() => setPrintTarget(null)}
                payslip={printTarget}
            />

            {/* Confirm Dialog */}
            {confirmModal && (
                <ConfirmDialog
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    isLoading={false}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
