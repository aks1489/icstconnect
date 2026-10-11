import { useState, useEffect, useMemo } from 'react';
import {
    IconDownload as Download,
    IconPlus as Plus,
    IconTrendingUp as TrendingUp,
    IconTrendingDown as TrendingDown,
    IconActivity as Activity,
    IconFileText as FileText,
    IconTrash as Trash2,
    IconBuildingBank as BuildingBank,
    IconReceipt as Receipt,
    IconRefresh as Refresh,
    IconSearch as Search,
    IconScale as Scale
} from '@tabler/icons-react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import AddTransactionModal from '../components/AddTransactionModal';
import StudentPaymentStatus from '../components/StudentPaymentStatus';
import DetailedExpenditures from '../components/DetailedExpenditures';
import MonthlyAndYoYReports from '../components/MonthlyAndYoYReports';
import IncomeTaxAuditExport from '../components/IncomeTaxAuditExport';
import type { Database } from '../../types/supabase';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

export default function FinancialDashboard() {
    const { showToast } = useToast();
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmLabel: string;
        variant: 'danger' | 'warning' | 'primary';
        action: () => Promise<void>;
    } | null>(null);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    // Active Tab
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'expenses' | 'monthly' | 'tax'>('overview');

    // Financial Data State
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalAssets: 0,
        totalLiabilities: 0
    });
    const [totalOutstandingDues, setTotalOutstandingDues] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [defaultTxType, setDefaultTxType] = useState<'income' | 'expense' | 'asset' | 'liability'>('expense');

    // Search and filter for Overview transaction table
    const [overviewSearch, setOverviewSearch] = useState('');
    const [overviewTypeFilter, setOverviewTypeFilter] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, txData] = await Promise.all([
                financeService.getDashboardStats(),
                financeService.getTransactions()
            ]);
            setStats(statsData);
            setTransactions(txData);

            // Fetch student fees to compute total receivables
            const { data: fees } = await supabase.from('student_fees').select('final_total_fee, student_id');
            const { data: feePays } = await supabase.from('fee_payments').select('amount_paid, student_id');

            const totalBilled = (fees || []).reduce((acc, f) => acc + (f.final_total_fee || 0), 0);
            const totalPaid = (feePays || []).reduce((acc, p) => acc + (p.amount_paid || 0), 0);
            setTotalOutstandingDues(Math.max(0, totalBilled - totalPaid));
        } catch (error) {
            console.error('Error fetching financial data:', error);
            showToast('Failed to load financial data', 'error');
        }
    };

    const netSurplus = stats.totalIncome - stats.totalExpense;
    const profitMargin = stats.totalIncome > 0 ? Math.round((netSurplus / stats.totalIncome) * 100) : 0;

    const handleExportCSV = () => {
        if (transactions.length === 0) {
            showToast('No transactions to export', 'info');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Sub Category', 'Amount (INR)', 'Payment Mode', 'Payee / Particulars', 'Voucher / Remarks'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(tx => [
                new Date(tx.transaction_date).toLocaleDateString(),
                tx.type.toUpperCase(),
                `"${tx.category || ''}"`,
                `"${tx.sub_category || ''}"`,
                tx.amount,
                tx.payment_mode,
                `"${tx.description || ''}"`,
                `"${tx.remarks || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `icst_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Complete financial ledger exported successfully', 'success');
    };

    const handleDeleteTransaction = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Transaction',
            description: 'Are you sure you want to delete this transaction? This will affect the institute balance sheet and profit calculation.',
            confirmLabel: 'Delete',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true);
                try {
                    await financeService.deleteTransaction(id);
                    showToast('Transaction deleted successfully', 'success');
                    fetchData();
                } catch (error) {
                    console.error('Error deleting transaction:', error);
                    showToast('Failed to delete transaction', 'error');
                } finally {
                    setIsConfirmLoading(false);
                    setConfirmModal(null);
                }
            }
        });
    };

    const filteredOverviewTx = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch =
                (t.category || '').toLowerCase().includes(overviewSearch.toLowerCase()) ||
                (t.sub_category || '').toLowerCase().includes(overviewSearch.toLowerCase()) ||
                (t.description || '').toLowerCase().includes(overviewSearch.toLowerCase()) ||
                (t.remarks || '').toLowerCase().includes(overviewSearch.toLowerCase());

            if (!matchesSearch) return false;
            if (overviewTypeFilter !== 'all' && t.type !== overviewTypeFilter) return false;
            return true;
        });
    }, [transactions, overviewSearch, overviewTypeFilter]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
                        <BuildingBank className="text-indigo-600 dark:text-indigo-400" size={28} />
                        Financial Overview & Balance Sheet
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Complete institute financial manager: student fee ledger, spending, profit, monthly YoY & tax filing
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Refresh data"
                    >
                        <Refresh size={18} />
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                    >
                        <Download size={16} />
                        <span>Export Ledger CSV</span>
                    </button>

                    <button
                        onClick={() => {
                            setDefaultTxType('expense');
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Core Financial Health KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* Total Collections */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Total Income</span>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{stats.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Gross inflows</p>
                </div>

                {/* Total Operating Costs */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Total Expenses</span>
                        <TrendingDown size={16} className="text-red-500" />
                    </div>
                    <p className="text-xl font-black text-red-600 dark:text-red-400">
                        ₹{stats.totalExpense.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Operating costs</p>
                </div>

                {/* Net Operating Surplus / Profit */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Net Profit</span>
                        <span className={`text-[11px] font-bold ${netSurplus >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {profitMargin}%
                        </span>
                    </div>
                    <p className={`text-xl font-black ${netSurplus >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{netSurplus.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Surplus / Deficit</p>
                </div>

                {/* Outstanding Student Dues */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Pending Dues</span>
                        <Receipt size={16} className="text-amber-500" />
                    </div>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        ₹{totalOutstandingDues.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Receivables</p>
                </div>

                {/* Capital Assets */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Fixed Assets</span>
                        <Scale size={16} className="text-blue-500" />
                    </div>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                        ₹{stats.totalAssets.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Lab & Furniture</p>
                </div>

                {/* Liabilities */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Liabilities</span>
                        <Activity size={16} className="text-purple-500" />
                    </div>
                    <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                        ₹{stats.totalLiabilities.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">Payables</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'overview'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Overview & Balance Sheet
                    </button>

                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'payments'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Student Fee Ledger
                    </button>

                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'expenses'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Detailed Expenditures
                    </button>

                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'monthly'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Monthly & YoY Reports
                    </button>

                    <button
                        onClick={() => setActiveTab('tax')}
                        className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'tax'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                    >
                        Income Tax & Audit Export
                    </button>
                </nav>
            </div>

            {/* TAB CONTENT */}

            {/* TAB 1: OVERVIEW & BALANCE SHEET */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Institutional Balance Sheet Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Liabilities & Capital Fund */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Liabilities & Capital Reserves
                                </h3>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    ₹{(Math.max(0, netSurplus) + stats.totalLiabilities).toLocaleString()}
                                </span>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                                    <span className="text-slate-600 dark:text-slate-400">Accumulated Institutional Surplus</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹{Math.max(0, netSurplus).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                                    <span className="text-slate-600 dark:text-slate-400">Current Outstanding Liabilities / Payables</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹{stats.totalLiabilities.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-600 dark:text-slate-400">Institutional Reserves & Provisions</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹0</span>
                                </div>
                            </div>
                        </div>

                        {/* Assets & Receivables */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Assets & Current Receivables
                                </h3>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    ₹{(stats.totalAssets + Math.max(0, netSurplus) + totalOutstandingDues).toLocaleString()}
                                </span>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                                    <span className="text-slate-600 dark:text-slate-400">Fixed Assets (Lab Computers, Machinery & Furniture)</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹{stats.totalAssets.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                                    <span className="text-slate-600 dark:text-slate-400">Cash In Hand & Bank Working Capital</span>
                                    <span className="font-semibold text-slate-800 dark:text-white">₹{Math.max(0, netSurplus).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-600 dark:text-slate-400">Current Student Fee Receivables (Pending Dues)</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">₹{totalOutstandingDues.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions Journal */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/50 dark:bg-slate-800/80">
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                    <FileText size={18} className="text-indigo-500" />
                                    General Journal & Ledger Transactions
                                </h2>
                                <p className="text-xs text-slate-400">{filteredOverviewTx.length} of {transactions.length} records</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search journal..."
                                        value={overviewSearch}
                                        onChange={(e) => setOverviewSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <select
                                    value={overviewTypeFilter}
                                    onChange={(e) => setOverviewTypeFilter(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold outline-none"
                                >
                                    <option value="all">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="asset">Asset</option>
                                    <option value="liability">Liability</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Ledger Head</th>
                                        <th className="px-4 py-3">Sub Category</th>
                                        <th className="px-4 py-3">Payee / Description</th>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                                    {filteredOverviewTx.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                                                No transactions found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOverviewTx.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                                                    {new Date(tx.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold capitalize
                                                        ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                                                            tx.type === 'expense' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' :
                                                                tx.type === 'asset' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' :
                                                                    'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-800 dark:text-white font-bold text-xs">{tx.category || '-'}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{tx.sub_category || '-'}</td>
                                                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs max-w-xs truncate">{tx.description || '-'}</td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs capitalize">{tx.payment_mode?.replace('_', ' ')}</td>
                                                <td className={`px-4 py-3 text-right font-black text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : tx.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    ₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                        title="Delete transaction"
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
                </div>
            )}

            {/* TAB 2: STUDENT FEE LEDGER */}
            {activeTab === 'payments' && (
                <StudentPaymentStatus />
            )}

            {/* TAB 3: DETAILED EXPENDITURES */}
            {activeTab === 'expenses' && (
                <DetailedExpenditures
                    transactions={transactions}
                    onRefresh={fetchData}
                    onOpenAddExpense={() => {
                        setDefaultTxType('expense');
                        setIsAddModalOpen(true);
                    }}
                />
            )}

            {/* TAB 4: MONTHLY & YOY REPORTS */}
            {activeTab === 'monthly' && (
                <MonthlyAndYoYReports transactions={transactions} />
            )}

            {/* TAB 5: INCOME TAX & AUDIT EXPORT */}
            {activeTab === 'tax' && (
                <IncomeTaxAuditExport transactions={transactions} />
            )}

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
                defaultType={defaultTxType}
            />

            {/* Confirm Dialog */}
            {confirmModal && (
                <ConfirmDialog
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    isLoading={isConfirmLoading}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
}
