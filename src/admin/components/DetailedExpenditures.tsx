import { useState, useMemo } from 'react';
import {
    IconSearch as Search,
    IconPlus as Plus,
    IconDownload as Download,
    IconTrash as Trash2,
    IconTrendingDown as TrendingDown
} from '@tabler/icons-react';
import type { Database } from '../../types/supabase';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { financeService } from '../../services/financeService';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

interface DetailedExpendituresProps {
    transactions: Transaction[];
    onRefresh: () => void;
    onOpenAddExpense: () => void;
}

export default function DetailedExpenditures({
    transactions,
    onRefresh,
    onOpenAddExpense
}: DetailedExpendituresProps) {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [deleteModal, setDeleteModal] = useState<{ id: string; isOpen: boolean } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter only expenses
    const expenseList = useMemo(() => {
        return transactions.filter(t => t.type === 'expense');
    }, [transactions]);

    // Categories breakdown
    const categoryBreakdown = useMemo(() => {
        const map = new Map<string, { total: number; count: number }>();
        let grandTotal = 0;

        expenseList.forEach(tx => {
            const cat = tx.category || 'General Miscellaneous';
            const cur = map.get(cat) || { total: 0, count: 0 };
            cur.total += tx.amount || 0;
            cur.count += 1;
            map.set(cat, cur);
            grandTotal += tx.amount || 0;
        });

        const list = Array.from(map.entries()).map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0
        }));

        list.sort((a, b) => b.total - a.total);
        return { list, grandTotal };
    }, [expenseList]);

    // Filtered expenses
    const filteredExpenses = useMemo(() => {
        return expenseList.filter(tx => {
            const matchesSearch =
                (tx.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tx.sub_category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (tx.remarks || '').toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;
            if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
            if (selectedMode !== 'all' && tx.payment_mode !== selectedMode) return false;

            return true;
        });
    }, [expenseList, searchTerm, selectedCategory, selectedMode]);

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await financeService.deleteTransaction(id);
            showToast('Expense record deleted successfully', 'success');
            onRefresh();
            setDeleteModal(null);
        } catch (error) {
            console.error('Error deleting expense:', error);
            showToast('Failed to delete expense record', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredExpenses.length === 0) {
            showToast('No expense records to export', 'info');
            return;
        }

        const headers = ['Date', 'Category', 'Sub Category', 'Amount (INR)', 'Payment Mode', 'Voucher / Ref', 'Notes / Payee'];
        const rows = filteredExpenses.map(tx => [
            new Date(tx.transaction_date).toLocaleDateString(),
            `"${tx.category || ''}"`,
            `"${tx.sub_category || ''}"`,
            tx.amount,
            tx.payment_mode,
            `"${tx.remarks || ''}"`,
            `"${tx.description || ''}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icst_expenditure_ledger_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Expenditure report exported', 'success');
    };

    return (
        <div className="space-y-6">
            {/* Top Cards: Total Expenditure & High Spend Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Institute Expenditure</p>
                        <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                            ₹{categoryBreakdown.grandTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{expenseList.length} recorded expense entries</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
                        <TrendingDown size={24} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Key Expenditure Allocations
                        </h3>
                        <span className="text-xs text-slate-400">Top Categories</span>
                    </div>
                    {categoryBreakdown.list.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3">No expenses recorded yet. Add an expense to view breakdown.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {categoryBreakdown.list.slice(0, 4).map(item => (
                                <div key={item.category} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="truncate max-w-44 text-slate-700 dark:text-slate-300">{item.category}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">₹{item.total.toLocaleString()} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search expenses by category, payee, voucher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold outline-none"
                    >
                        <option value="all">All Categories</option>
                        {categoryBreakdown.list.map(c => (
                            <option key={c.category} value={c.category}>{c.category}</option>
                        ))}
                    </select>

                    {/* Mode Filter */}
                    <select
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold outline-none"
                    >
                        <option value="all">All Payment Modes</option>
                        <option value="cash">Cash In Hand</option>
                        <option value="online">Online / UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                    </select>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>

                    <button
                        onClick={onOpenAddExpense}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/25 transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Record Expense</span>
                    </button>
                </div>
            </div>

            {/* Expenditure Records Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">Date</th>
                                <th className="px-4 py-3.5">Category</th>
                                <th className="px-4 py-3.5">Sub Category</th>
                                <th className="px-4 py-3.5">Payee / Description</th>
                                <th className="px-4 py-3.5">Voucher / Ref</th>
                                <th className="px-4 py-3.5">Mode</th>
                                <th className="px-4 py-3.5 text-right">Amount</th>
                                <th className="px-4 py-3.5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                        No expense records found. Click "+ Record Expense" to add your first expense.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                                            {new Date(tx.transaction_date).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-white text-xs">
                                            {tx.category}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                                            {tx.sub_category || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-xs max-w-xs truncate">
                                            {tx.description || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-mono">
                                            {tx.remarks || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 capitalize text-xs text-slate-600 dark:text-slate-300">
                                            {tx.payment_mode?.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-extrabold text-red-600 dark:text-red-400 text-sm">
                                            ₹{tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setDeleteModal({ id: tx.id, isOpen: true })}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete expense"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            {deleteModal?.isOpen && (
                <ConfirmDialog
                    isOpen={deleteModal.isOpen}
                    title="Delete Expense Record"
                    description="Are you sure you want to delete this expenditure? This will immediately recalculate your institute balance sheet and profit numbers."
                    confirmLabel="Delete Expense"
                    variant="danger"
                    isLoading={isDeleting}
                    onConfirm={() => handleDelete(deleteModal.id)}
                    onCancel={() => setDeleteModal(null)}
                />
            )}
        </div>
    );
}
