import { useState, useEffect } from 'react';
import {
    IconX as X,
    IconCheck as Check,
    IconReceipt as Receipt,
    IconCreditCard as CreditCard,
    IconCurrencyRupee as CurrencyRupee,
    IconCalendar as Calendar,
    IconUser as User
} from '@tabler/icons-react';
import { feesService } from '../../services/feesService';
import { useToast } from '../../contexts/ToastContext';

export interface CollectPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student: {
        id: string;
        name: string;
        courseId?: number | null;
        courseName?: string;
        studentFeeId?: string;
        totalFee?: number;
        paidAmount?: number;
        dueAmount?: number;
    } | null;
}

export default function CollectPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    student
}: CollectPaymentModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form fields
    const [amount, setAmount] = useState<number>(500);
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentMode, setPaymentMode] = useState<'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'>('cash');
    const [receiptNo, setReceiptNo] = useState<string>('');
    const [monthAllocated, setMonthAllocated] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');

    // Pre-fill fields on open
    useEffect(() => {
        if (isOpen && student) {
            const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
            const currentYear = new Date().getFullYear();
            setMonthAllocated(`${currentMonthName}-${currentYear}`);

            // Pre-fill amount to remaining due or reasonable default
            const suggestedAmount = student.dueAmount && student.dueAmount > 0
                ? Math.min(student.dueAmount, 1000)
                : 500;
            setAmount(suggestedAmount);

            // Auto-generate reference code
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            setReceiptNo(`REC-${currentYear}-${randomCode}`);
            setRemarks('');
        }
    }, [isOpen, student]);

    if (!isOpen || !student) return null;

    const remainingAfter = Math.max(0, (student.dueAmount ?? 0) - amount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (amount <= 0) {
            showToast('Please enter a valid payment amount.', 'warning');
            return;
        }

        setLoading(true);
        try {
            await feesService.collectFeeAndSyncTransaction({
                studentId: student.id,
                studentName: student.name,
                studentFeeId: student.studentFeeId,
                courseId: student.courseId,
                courseName: student.courseName,
                amount,
                paymentDate,
                paymentMethod: paymentMode,
                receiptNo: receiptNo.trim() || undefined,
                monthAllocated: monthAllocated.trim() || undefined,
                remarks: remarks.trim() || undefined
            });

            showToast(`Payment of ₹${amount.toLocaleString()} recorded successfully for ${student.name}!`, 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error collecting fee:', error);
            showToast('Failed to record payment. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                            <Receipt size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Collect Student Fee</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Record payment & generate receipt voucher</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Student Info Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                                <User size={16} className="text-indigo-500" />
                                <span>{student.name}</span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                {student.courseName || 'Course Enrolled'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Total Fee</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    ₹{(student.totalFee ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Paid To Date</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{(student.paidAmount ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Due Balance</p>
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                    ₹{(student.dueAmount ?? 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <CurrencyRupee size={14} className="text-indigo-500" />
                                Payment Amount (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                step="1"
                                value={amount || ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                placeholder="500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar size={14} className="text-indigo-500" />
                                Payment Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Mode & Allocation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <CreditCard size={14} className="text-indigo-500" />
                                Payment Mode <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value as any)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            >
                                <option value="cash">Cash In Hand</option>
                                <option value="online">Online / UPI / QR</option>
                                <option value="bank_transfer">Direct Bank Transfer</option>
                                <option value="cheque">Bank Cheque</option>
                                <option value="other">Other Mode</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Allocated Month / Purpose
                            </label>
                            <input
                                type="text"
                                value={monthAllocated}
                                onChange={(e) => setMonthAllocated(e.target.value)}
                                placeholder="e.g. Oct-2026, Admission"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Receipt No & Remarks */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Receipt / Voucher Ref
                            </label>
                            <input
                                type="text"
                                value={receiptNo}
                                onChange={(e) => setReceiptNo(e.target.value)}
                                placeholder="REC-2026-001"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Internal Remarks (Optional)
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Note / bank tx ID..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Due calculation preview */}
                    {student.dueAmount !== undefined && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Balance remaining after this payment:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                                ₹{remainingAfter.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || amount <= 0}
                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>Collect ₹{amount.toLocaleString()}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
