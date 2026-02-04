import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import type { Database } from '../../types/supabase';
import StudentSearch from '../../components/admin/StudentSearch';

type TransactionInsert = Database['public']['Tables']['institution_transactions']['Insert'];

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<TransactionInsert>>({
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        sub_category: '',
        amount: 0,
        payment_mode: 'cash',
        description: '',
        student_id: null,
        remarks: ''
    });

    const [txType, setTxType] = useState('Expense'); // UI Helper for Category selection

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };

    const handleTxTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setTxType(type);
        setFormData(prev => ({
            ...prev,
            category: type,
            // Reset fields based on type if needed
            student_id: (type !== 'Admission' && type !== 'EMI') ? null : prev.student_id,
        }));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, isReceived: boolean) => {
        const val = parseFloat(e.target.value) || 0;
        setFormData(prev => ({
            ...prev,
            amount: val,
            type: isReceived ? 'income' : 'expense'
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || formData.amount <= 0) {
            showToast('Please enter a valid amount.', 'error');
            return;
        }

        if ((txType === 'Admission' || txType === 'EMI') && !formData.student_id) {
            showToast(`Please select a student for ${txType}.`, 'error');
            return;
        }

        setLoading(true);
        try {
            await financeService.addTransaction(formData as TransactionInsert);
            showToast('Transaction added successfully!', 'success');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                transaction_date: new Date().toISOString().split('T')[0],
                type: 'expense',
                category: '',
                sub_category: '',
                amount: 0,
                payment_mode: 'cash',
                description: '',
                student_id: null,
                remarks: ''
            });
            setTxType('Expense');
        } catch (error) {
            console.error('Error adding transaction:', error);
            showToast('Failed to add transaction.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Serial No / Date</label>
                            <input
                                type="date"
                                name="transaction_date"
                                value={formData.transaction_date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Transaction Type</label>
                            <select
                                value={txType}
                                onChange={handleTxTypeChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                            >
                                <option value="Expense">Expense (General)</option>
                                <option value="Admission">Admission (New Student)</option>
                                <option value="EMI">EMI (Monthly Fee)</option>
                                <option value="Takeout">Takeout (Owner)</option>
                                <option value="Invest">Invest (Owner)</option>
                                <option value="Takeout-Cash">Takeout - Cash (Internal)</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Student Search */}
                    {(txType === 'Admission' || txType === 'EMI') && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <StudentSearch
                                onSelect={(s: any) => setFormData(prev => ({ ...prev, student_id: s.id }))}
                                required
                                label={txType === 'Admission' ? "Select Registered Student" : "Select Student for EMI"}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Item / Sub Category</label>
                            <input
                                type="text"
                                name="sub_category"
                                value={formData.sub_category || ''}
                                onChange={handleChange}
                                placeholder="e.g. Room Rent, Electricity"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                            <select
                                name="payment_mode"
                                value={formData.payment_mode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                            >
                                <option value="online">Online / UPI</option>
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-emerald-700">Received (Income) ₹</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                onChange={(e) => handleAmountChange(e, true)}
                                disabled={formData.type === 'expense' && formData.amount! > 0}
                                className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-red-700">Payment (Expense) ₹</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                onChange={(e) => handleAmountChange(e, false)}
                                disabled={formData.type === 'income' && formData.amount! > 0}
                                className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks || ''}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Any additional details..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Check size={18} />
                                    Save Transaction
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
