import { useRef } from 'react'
import {
    IconX as X,
    IconPrinter as Printer,
    IconFileText as FileText
} from '@tabler/icons-react'
import type { StaffPayslip } from '../../services/payrollService'
import { payrollService, numberToWordsINR } from '../../services/payrollService'
import logo from '../../assets/logo.jpg'

interface PayslipPrintModalProps {
    isOpen: boolean
    onClose: () => void
    payslip: StaffPayslip | null
}

export default function PayslipPrintModal({ isOpen, onClose, payslip }: PayslipPrintModalProps) {
    const printRef = useRef<HTMLDivElement>(null)

    if (!isOpen || !payslip) return null

    const monthName = payrollService.getMonthName(payslip.pay_period_month)
    const grossEarnings = (payslip.basic_salary || 0) + (payslip.allowances || 0)
    const netInWords = numberToWordsINR(payslip.net_salary || 0)

    const handlePrint = () => {
        window.print()
    }

    const getStatusBadge = () => {
        switch (payslip.status) {
            case 'paid':
                return {
                    label: 'PAID & DISBURSED',
                    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                }
            case 'approved':
                return {
                    label: 'APPROVED FOR PAYMENT',
                    bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
                }
            case 'cancelled':
                return {
                    label: 'CANCELLED',
                    bg: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700'
                }
            default:
                return {
                    label: 'PENDING APPROVAL',
                    bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                }
        }
    }

    const badge = getStatusBadge()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
                {/* Modal Top Actions (Hidden on Print) */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/70 print:hidden">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Institutional Payslip Voucher
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Voucher Serial: {payslip.voucher_no}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                            <Printer size={16} />
                            <span>Print / PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Document Area */}
                <div ref={printRef} className="p-6 sm:p-10 space-y-6 text-slate-800 dark:text-slate-100 print:text-black print:p-8 bg-white dark:bg-slate-900">
                    {/* Header */}
                    <div className="border-b-2 border-indigo-600 pb-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={logo}
                                    alt="ICST Logo"
                                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 print:border-black/20"
                                />
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black uppercase">
                                        Institute of Computer Science & Technology
                                    </h1>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-700 font-medium">
                                        Chowberia, West Bengal, India | Reg. Institutional Management System
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                        Official Payroll & Salary Disbursal Voucher
                                    </p>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-black tracking-wider border ${badge.bg}`}>
                                    {badge.label}
                                </span>
                                <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                                    Ref: <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">{payslip.voucher_no}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 print:border-slate-300 print:bg-slate-50/50 text-xs">
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Employee Name</span>
                            <span className="font-bold text-slate-900 dark:text-white print:text-black text-sm">{payslip.employee_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Designation / Role</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black capitalize">
                                {payslip.employee_role.replace('_', ' ')}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Pay Period</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 print:text-black text-sm">
                                {monthName} {payslip.pay_period_year}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Payment Mode</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black uppercase">
                                {payslip.payment_mode.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Earnings vs Deductions Table */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
                        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 print:bg-slate-200 print:text-black">
                            <div className="p-3 border-r border-slate-200 dark:border-slate-700">Earnings & Allowances</div>
                            <div className="p-3">Deductions & Recoveries</div>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800 text-xs print:divide-slate-300">
                            {/* Left: Earnings */}
                            <div className="p-4 space-y-2.5">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 print:text-black">
                                    <span>Basic Salary</span>
                                    <span className="font-mono font-semibold">₹{(payslip.basic_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 print:text-black">
                                    <span>Allowances (HRA / DA / Travel)</span>
                                    <span className="font-mono font-semibold">₹{(payslip.allowances || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold text-slate-900 dark:text-white print:text-black">
                                    <span>Total Gross Earnings</span>
                                    <span className="font-mono">₹{grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {/* Right: Deductions */}
                            <div className="p-4 space-y-2.5">
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 print:text-black">
                                    <span>Statutory Deductions (TDS / PF)</span>
                                    <span className="font-mono font-semibold">₹{(payslip.deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 print:text-black">
                                    <span>Advance / Other Adjustments</span>
                                    <span className="font-mono font-semibold">₹0.00</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold text-slate-900 dark:text-white print:text-black">
                                    <span>Total Deductions</span>
                                    <span className="font-mono">₹{(payslip.deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Salary Highlight */}
                        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:bg-slate-100 print:border-slate-300">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 dark:text-indigo-300 print:text-black block">
                                    Net Salary Disbursed (Figures & Words)
                                </span>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 print:text-slate-800 italic">
                                    {netInWords}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black font-mono text-indigo-700 dark:text-indigo-400 print:text-black">
                                    ₹{(payslip.net_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Remarks / Transaction Reference */}
                    {payslip.remarks && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 print:border-slate-300 print:text-slate-800">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-black">Remarks / Note: </span>
                            {payslip.remarks}
                        </div>
                    )}

                    {/* Authorization & Signatures */}
                    <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                        <div>
                            <div className="border-b border-dashed border-slate-400 dark:border-slate-600 h-14 print:border-black"></div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-black block mt-2">
                                Employee Signature
                            </span>
                            <span className="text-[10px] text-slate-400">Signature / Acknowledgment</span>
                        </div>

                        <div>
                            <div className="border-b border-dashed border-slate-400 dark:border-slate-600 h-14 print:border-black flex items-center justify-center">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 print:text-black font-serif italic border border-indigo-200 dark:border-indigo-800 print:border-black px-2 py-0.5 rounded">
                                    [ICST Finance Authenticated]
                                </span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black block mt-2">
                                Authorized Signatory / Principal
                            </span>
                            <span className="text-[10px] text-slate-400">Institute of Computer Science & Technology</span>
                        </div>
                    </div>

                    {/* Footer System Disclaimer */}
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 print:text-slate-600 text-center border-t border-slate-100 dark:border-slate-800 pt-3">
                        This is a computer-generated institutional payroll document issued via ICST Connect ERP. Valid without manual signature when verified with voucher ID {payslip.voucher_no}.
                    </div>
                </div>
            </div>
        </div>
    )
}
