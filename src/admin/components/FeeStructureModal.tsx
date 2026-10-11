import { useState, useEffect } from 'react';
import { IconX as X, IconCurrencyDollar as DollarSign, IconCalendar as Calendar, IconCircleCheck as CheckCircle, IconCalculator as Calculator } from '@tabler/icons-react';

interface FeeStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
    studentName: string;
    courseName: string;
    defaultBaseFee?: number; // Optional default from course
}

export default function FeeStructureModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    courseName,
    defaultBaseFee = 0
}: FeeStructureModalProps) {
    const [formData, setFormData] = useState({
        base_fee: defaultBaseFee,
        admission_fee: 0,
        discount_on_base: 0,
        discount_on_admission: 0,
        payment_plan: 'monthly', // 'monthly' | 'one_time'
        monthly_due_day: 5,
        monthly_installment_amount: 0 // Optional manual override
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, base_fee: defaultBaseFee }));
        }
    }, [isOpen, defaultBaseFee]);

    const finalTotal = (formData.base_fee + formData.admission_fee) - (formData.discount_on_base + formData.discount_on_admission);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                ...formData,
                final_total_fee: finalTotal
            });
            onClose();
        } catch (error) {
            console.error(error);
            // Parent handles alert usually
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Fee Structure Setup</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">For {studentName} • {courseName}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Fees Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Base Tuition Fee</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    value={formData.base_fee}
                                    onChange={e => setFormData({ ...formData, base_fee: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Admission Fee</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    value={formData.admission_fee}
                                    onChange={e => setFormData({ ...formData, admission_fee: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-green-600 dark:text-emerald-400 uppercase mb-2">Discount (Tuition)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-9 pr-4 py-2 border border-green-200 dark:border-emerald-800/60 bg-green-50 dark:bg-emerald-950/40 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium text-green-700 dark:text-emerald-300"
                                    value={formData.discount_on_base}
                                    onChange={e => setFormData({ ...formData, discount_on_base: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-green-600 dark:text-emerald-400 uppercase mb-2">Discount (Admission)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-9 pr-4 py-2 border border-green-200 dark:border-emerald-800/60 bg-green-50 dark:bg-emerald-950/40 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-medium text-green-700 dark:text-emerald-300"
                                    value={formData.discount_on_admission}
                                    onChange={e => setFormData({ ...formData, discount_on_admission: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-xl flex justify-between items-center border border-indigo-100 dark:border-indigo-900/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Net Payable Amount</h3>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400">After discounts</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                            ₹{finalTotal.toLocaleString()}
                        </div>
                    </div>

                    {/* Payment Plan */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-3">Payment Plan</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_plan: 'monthly' })}
                                className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all ${formData.payment_plan === 'monthly'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Monthly Installments
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment_plan: 'one_time' })}
                                className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all ${formData.payment_plan === 'one_time'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                One-Time Payment
                            </button>
                        </div>

                        {formData.payment_plan === 'monthly' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Installment (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Auto-calculated if empty"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.monthly_installment_amount || ''}
                                        onChange={e => setFormData({ ...formData, monthly_installment_amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Due Day of Month</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.monthly_due_day}
                                            onChange={e => setFormData({ ...formData, monthly_due_day: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || finalTotal < 0}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <CheckCircle size={18} />
                                    Confirm Enrollment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
