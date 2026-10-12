import { useState, useEffect, useMemo } from 'react'
import {
    IconReceipt as Receipt,
    IconPrinter as Printer,
    IconCheck as Check,
    IconClock as Clock,
    IconBuildingBank as BuildingBank,
    IconRefresh as Refresh,
    IconFileText as FileText,
    IconCalendar as Calendar
} from '@tabler/icons-react'
import { useAuth } from '../../contexts/AuthContext'
import { payrollService, type StaffPayslip } from '../../services/payrollService'
import PayslipPrintModal from '../../admin/components/PayslipPrintModal'
import { useToast } from '../../contexts/ToastContext'

export default function MyPayslips() {
    const { profile } = useAuth()
    const { showToast } = useToast()
    const [payslips, setPayslips] = useState<StaffPayslip[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPayslip, setSelectedPayslip] = useState<StaffPayslip | null>(null)

    useEffect(() => {
        if (profile?.id) {
            loadMyPayslips()
        }
    }, [profile?.id])

    const loadMyPayslips = async () => {
        if (!profile?.id) return
        setLoading(true)
        try {
            const data = await payrollService.getPayslipsByEmployee(profile.id)
            setPayslips(data)
        } catch (err) {
            console.error('Error fetching employee payslips:', err)
            showToast('Unable to load your payslip history', 'error')
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const totalReceived = payslips
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0)

        const latestPaid = payslips.find(p => p.status === 'paid')

        return {
            totalReceived,
            latestNet: latestPaid ? latestPaid.net_salary : 0,
            latestPeriod: latestPaid
                ? `${payrollService.getMonthShort(latestPaid.pay_period_month)} ${latestPaid.pay_period_year}`
                : 'N/A',
            count: payslips.length
        }
    }, [payslips])

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Receipt className="text-indigo-600 dark:text-indigo-400" size={24} />
                        My Salary & Payslip Vault
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Official monthly institutional salary disbursals, vouchers, and tax breakdown
                    </p>
                </div>

                <button
                    onClick={loadMyPayslips}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Refresh Payslips"
                >
                    <Refresh size={18} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Total Disbursed (To Date)</span>
                        <BuildingBank size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{stats.totalReceived.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">Across verified payroll periods</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Latest Disbursed Salary</span>
                        <Receipt size={18} className="text-indigo-500" />
                    </div>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {stats.latestNet ? `₹${stats.latestNet.toLocaleString()}` : '—'}
                    </p>
                    <p className="text-[11px] text-slate-400">Period: {stats.latestPeriod}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Payslips on File</span>
                        <FileText size={18} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {stats.count}
                    </p>
                    <p className="text-[11px] text-slate-400">Institutional vouchers issued</p>
                </div>
            </div>

            {/* Payslip History Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="p-4">Pay Period</th>
                                <th className="p-4">Voucher No</th>
                                <th className="p-4">Basic Pay</th>
                                <th className="p-4">Allowances</th>
                                <th className="p-4">Deductions</th>
                                <th className="p-4">Net Salary</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Download / Print</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading your personal payslips...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : payslips.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <Receipt size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            No payslips issued yet
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Once accounts/admin disburse or issue your monthly payslips, they will appear here.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                payslips.map(slip => {
                                    const monthLabel = payrollService.getMonthName(slip.pay_period_month)

                                    return (
                                        <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* Period */}
                                            <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Calendar size={15} className="text-indigo-500" />
                                                <span>{monthLabel} {slip.pay_period_year}</span>
                                            </td>

                                            {/* Voucher No */}
                                            <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                {slip.voucher_no}
                                            </td>

                                            {/* Basic */}
                                            <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                                                ₹{(slip.basic_salary || 0).toLocaleString()}
                                            </td>

                                            {/* Allowances */}
                                            <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">
                                                +₹{(slip.allowances || 0).toLocaleString()}
                                            </td>

                                            {/* Deductions */}
                                            <td className="p-4 font-mono text-red-600 dark:text-red-400">
                                                -₹{(slip.deductions || 0).toLocaleString()}
                                            </td>

                                            {/* Net Salary */}
                                            <td className="p-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                                                ₹{(slip.net_salary || 0).toLocaleString()}
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${slip.status === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : slip.status === 'approved'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                    }`}>
                                                    {slip.status === 'paid' && <Check size={12} />}
                                                    {slip.status === 'pending' && <Clock size={12} />}
                                                    {slip.status}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedPayslip(slip)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs transition-colors cursor-pointer"
                                                >
                                                    <Printer size={14} />
                                                    <span>View Payslip</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Printable Payslip Modal */}
            <PayslipPrintModal
                isOpen={!!selectedPayslip}
                onClose={() => setSelectedPayslip(null)}
                payslip={selectedPayslip}
            />
        </div>
    )
}
