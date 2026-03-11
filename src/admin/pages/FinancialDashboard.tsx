import { useState, useEffect } from 'react';
import { Download, Plus, DollarSign, TrendingUp, TrendingDown, Activity, FileText, Trash2 } from 'lucide-react';
import { financeService } from '../../services/financeService';
import AddTransactionModal from '../components/AddTransactionModal';
import StudentPaymentStatus from '../components/StudentPaymentStatus';
import type { Database } from '../../types/supabase';
import { useToast } from '../../contexts/ToastContext';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

export default function FinancialDashboard() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalAssets: 0,
        totalLiabilities: 0
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        } catch (error) {
            console.error('Error fetching financial data:', error);
            showToast('Failed to load financial data', 'error');
        }
    };

    const handleExportCSV = () => {
        if (transactions.length === 0) {
            showToast('No transactions to export', 'info');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Sub Category', 'Amount', 'Payment Mode', 'Description'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(tx => [
                new Date(tx.transaction_date).toLocaleDateString(),
                tx.type,
                `"${tx.category}"`,
                `"${tx.sub_category || ''}"`,
                tx.amount,
                tx.payment_mode,
                `"${tx.description || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV Exported Successfully', 'success');
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            await financeService.deleteTransaction(id);
            showToast('Transaction deleted successfully', 'success');
            fetchData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showToast('Failed to delete transaction', 'error');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Financial Overview</h1>
                    <p className="text-slate-500">Manage institution finances and balance sheet</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'payments'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Student Payments
                    </button>
                </nav>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Income"
                            amount={stats.totalIncome}
                            icon={<TrendingUp size={24} className="text-emerald-500" />}
                            bgClass="bg-emerald-50"
                            textClass="text-emerald-700"
                        />
                        <StatCard
                            title="Total Expenses"
                            amount={stats.totalExpense}
                            icon={<TrendingDown size={24} className="text-red-500" />}
                            bgClass="bg-red-50"
                            textClass="text-red-700"
                        />
                        <StatCard
                            title="Assets"
                            amount={stats.totalAssets}
                            icon={<DollarSign size={24} className="text-blue-500" />}
                            bgClass="bg-blue-50"
                            textClass="text-blue-700"
                        />
                        <StatCard
                            title="Liabilities"
                            amount={stats.totalLiabilities}
                            icon={<Activity size={24} className="text-amber-500" />}
                            bgClass="bg-amber-50"
                            textClass="text-amber-700"
                        />
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-slate-400" />
                                Recent Transactions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Sub Category</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                                                No transactions found. Add a transaction to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-3 text-slate-600">
                                                    {new Date(tx.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                                                        ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' :
                                                            tx.type === 'expense' ? 'bg-red-100 text-red-700' :
                                                                tx.type === 'asset' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-medium">{tx.category}</td>
                                                <td className="px-4 py-3 text-slate-500">{tx.sub_category || '-'}</td>
                                                <td className={`px-4 py-3 font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                    ₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 capitalize">{tx.payment_mode?.replace('_', ' ')}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
                </>
            ) : (
                <StudentPaymentStatus />
            )}

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}

function StatCard({ title, amount, icon, bgClass, textClass }: any) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className={`text-2xl font-bold ${textClass}`}>₹{amount.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bgClass}`}>
                {icon}
            </div>
        </div>
    );
}
