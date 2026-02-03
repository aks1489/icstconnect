import { useState, useEffect } from 'react';
import { Upload, DollarSign, TrendingUp, TrendingDown, Activity, FileText } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { parseBalanceSheetCSV } from '../../utils/csvParser';
import type { Database } from '../../types/supabase';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

export default function FinancialDashboard() {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalAssets: 0,
        totalLiabilities: 0
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isImporting, setIsImporting] = useState(false);

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
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target?.result as string;
            if (content) {
                try {
                    const parsedData = parseBalanceSheetCSV(content);
                    if (parsedData.length === 0) {
                        alert('No valid transactions found in CSV.');
                        return;
                    }

                    if (confirm(`Found ${parsedData.length} transactions. Import now?`)) {
                        await financeService.importTransactions(parsedData);
                        alert('Import successful!');
                        fetchData();
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    alert('Import failed. Check console for details.');
                } finally {
                    setIsImporting(false);
                }
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Financial Overview</h1>
                    <p className="text-slate-500">Manage institution finances and balance sheet</p>
                </div>
                <div className="flex gap-3">
                    <label className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer transition-colors ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={18} />
                        <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isImporting} />
                    </label>
                </div>
            </div>

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        No transactions found. Import a CSV to get started.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
