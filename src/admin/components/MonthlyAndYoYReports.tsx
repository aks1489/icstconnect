import { useState, useMemo } from 'react';
import {
    IconCalendar as Calendar,
    IconDownload as Download,
    IconArrowUpRight as ArrowUpRight,
    IconArrowDownRight as ArrowDownRight,
    IconActivity as Activity
} from '@tabler/icons-react';
import type { Database } from '../../types/supabase';
import { useToast } from '../../contexts/ToastContext';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

interface MonthlyAndYoYReportsProps {
    transactions: Transaction[];
}

export default function MonthlyAndYoYReports({ transactions }: MonthlyAndYoYReportsProps) {
    const { showToast } = useToast();
    const currentYear = new Date().getFullYear();
    const [selectedFY, setSelectedFY] = useState<number>(currentYear);

    // Standard Indian Financial Year months (April to March)
    const fyMonths = [
        { label: 'Apr', monthNum: 3, yearOffset: 0 },
        { label: 'May', monthNum: 4, yearOffset: 0 },
        { label: 'Jun', monthNum: 5, yearOffset: 0 },
        { label: 'Jul', monthNum: 6, yearOffset: 0 },
        { label: 'Aug', monthNum: 7, yearOffset: 0 },
        { label: 'Sep', monthNum: 8, yearOffset: 0 },
        { label: 'Oct', monthNum: 9, yearOffset: 0 },
        { label: 'Nov', monthNum: 10, yearOffset: 0 },
        { label: 'Dec', monthNum: 11, yearOffset: 0 },
        { label: 'Jan', monthNum: 0, yearOffset: 1 },
        { label: 'Feb', monthNum: 1, yearOffset: 1 },
        { label: 'Mar', monthNum: 2, yearOffset: 1 }
    ];

    // Calculate monthly stats for selected FY
    const monthlyStats = useMemo(() => {
        return fyMonths.map(m => {
            const targetYear = selectedFY + m.yearOffset;
            const targetMonth = m.monthNum;

            const monthTx = transactions.filter(t => {
                const d = new Date(t.transaction_date);
                return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
            });

            const income = monthTx.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);
            const expense = monthTx.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
            const surplus = income - expense;
            const margin = income > 0 ? Math.round((surplus / income) * 100) : expense > 0 ? -100 : 0;

            return {
                label: m.label,
                fullLabel: `${m.label} ${targetYear}`,
                year: targetYear,
                income,
                expense,
                surplus,
                margin,
                txCount: monthTx.length
            };
        });
    }, [transactions, selectedFY]);

    // Current FY Totals
    const currentFYTotals = useMemo(() => {
        const totalIncome = monthlyStats.reduce((sum, m) => sum + m.income, 0);
        const totalExpense = monthlyStats.reduce((sum, m) => sum + m.expense, 0);
        const netSurplus = totalIncome - totalExpense;
        const profitMargin = totalIncome > 0 ? Math.round((netSurplus / totalIncome) * 100) : 0;
        const totalTx = monthlyStats.reduce((sum, m) => sum + m.txCount, 0);
        const activeMonths = monthlyStats.filter(m => m.txCount > 0).length || 1;
        const avgMonthlyIncome = Math.round(totalIncome / activeMonths);
        const avgMonthlyExpense = Math.round(totalExpense / activeMonths);

        return { totalIncome, totalExpense, netSurplus, profitMargin, totalTx, avgMonthlyIncome, avgMonthlyExpense };
    }, [monthlyStats]);

    // Previous FY Totals (For YoY Comparison)
    const previousFYTotals = useMemo(() => {
        const prevYear = selectedFY - 1;
        let prevIncome = 0;
        let prevExpense = 0;

        fyMonths.forEach(m => {
            const targetYear = prevYear + m.yearOffset;
            const targetMonth = m.monthNum;

            transactions.forEach(t => {
                const d = new Date(t.transaction_date);
                if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
                    if (t.type === 'income') prevIncome += t.amount;
                    if (t.type === 'expense') prevExpense += t.amount;
                }
            });
        });

        const prevSurplus = prevIncome - prevExpense;
        return { prevIncome, prevExpense, prevSurplus };
    }, [transactions, selectedFY]);

    // YoY Percentage changes
    const yoy = useMemo(() => {
        const incomeGrowth = previousFYTotals.prevIncome > 0
            ? Math.round(((currentFYTotals.totalIncome - previousFYTotals.prevIncome) / previousFYTotals.prevIncome) * 100)
            : currentFYTotals.totalIncome > 0 ? 100 : 0;

        const expenseChange = previousFYTotals.prevExpense > 0
            ? Math.round(((currentFYTotals.totalExpense - previousFYTotals.prevExpense) / previousFYTotals.prevExpense) * 100)
            : currentFYTotals.totalExpense > 0 ? 100 : 0;

        const surplusGrowth = previousFYTotals.prevSurplus !== 0
            ? Math.round(((currentFYTotals.netSurplus - previousFYTotals.prevSurplus) / Math.abs(previousFYTotals.prevSurplus)) * 100)
            : currentFYTotals.netSurplus > 0 ? 100 : 0;

        return { incomeGrowth, expenseChange, surplusGrowth };
    }, [currentFYTotals, previousFYTotals]);

    const handleExportCSV = () => {
        const headers = ['Month', 'Year', 'Gross Income (INR)', 'Expenditure (INR)', 'Net Surplus / Deficit (INR)', 'Operating Margin (%)', 'Transactions Count'];
        const rows = monthlyStats.map(m => [
            m.label,
            m.year,
            m.income,
            m.expense,
            m.surplus,
            `${m.margin}%`,
            m.txCount
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icst_monthly_financial_report_FY${selectedFY}-${(selectedFY + 1).toString().slice(2)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Monthly financial report exported', 'success');
    };

    return (
        <div className="space-y-6">
            {/* Header with FY Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-500" />
                        Financial Year & YoY Performance Analytics
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Indian Financial Year (April 1 to March 31) monthly cash flows, burn rate & year-over-year trends
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedFY}
                        onChange={(e) => setSelectedFY(parseInt(e.target.value, 10))}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm outline-none"
                    >
                        <option value={currentYear}>FY {currentYear}-{(currentYear + 1).toString().slice(2)} (Current)</option>
                        <option value={currentYear - 1}>FY {currentYear - 1}-{currentYear.toString().slice(2)} (Previous)</option>
                        <option value={currentYear - 2}>FY {currentYear - 2}-{(currentYear - 1).toString().slice(2)}</option>
                    </select>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                        <Download size={15} />
                        <span>Export P&L</span>
                    </button>
                </div>
            </div>

            {/* YoY Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Annual Income Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Annual Gross Receipts</span>
                        <div className={`flex items-center gap-0.5 text-xs font-bold ${yoy.incomeGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {yoy.incomeGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{yoy.incomeGrowth >= 0 ? `+${yoy.incomeGrowth}%` : `${yoy.incomeGrowth}%`} YoY</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{currentFYTotals.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        Avg. ₹{currentFYTotals.avgMonthlyIncome.toLocaleString()} / active month
                    </p>
                </div>

                {/* Annual Expenditure Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Annual Operating Costs</span>
                        <div className={`flex items-center gap-0.5 text-xs font-bold ${yoy.expenseChange <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {yoy.expenseChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{yoy.expenseChange >= 0 ? `+${yoy.expenseChange}%` : `${yoy.expenseChange}%`} YoY</span>
                        </div>
                    </div>
                    <p className="text-2xl font-black text-red-600 dark:text-red-400">
                        ₹{currentFYTotals.totalExpense.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        Avg. Burn ₹{currentFYTotals.avgMonthlyExpense.toLocaleString()} / active month
                    </p>
                </div>

                {/* Net Operating Surplus */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Net Institute Surplus</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {currentFYTotals.profitMargin}% Margin
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${currentFYTotals.netSurplus >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₹{currentFYTotals.netSurplus.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        Operating profit before depreciation
                    </p>
                </div>

                {/* Operating Ratio */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Financial Health Status</span>
                        <Activity size={16} className="text-indigo-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">
                        {currentFYTotals.netSurplus >= 0 ? 'Surplus Positive' : 'Deficit Active'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        {currentFYTotals.totalTx} transactions recorded in FY {selectedFY}
                    </p>
                </div>
            </div>

            {/* Monthly Financial Performance Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                            Month-by-Month Financial Ledger Breakdown (FY {selectedFY}-{(selectedFY + 1).toString().slice(2)})
                        </h3>
                        <p className="text-xs text-slate-400">Detailed cash inflows, outflows and net margins</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">Month / Period</th>
                                <th className="px-4 py-3.5 text-right">Collections / Inflow</th>
                                <th className="px-4 py-3.5 text-right">Operating Outflows</th>
                                <th className="px-4 py-3.5 text-right">Net Surplus / Deficit</th>
                                <th className="px-4 py-3.5 text-center">Net Margin</th>
                                <th className="px-4 py-3.5 text-center">Vouchers Count</th>
                                <th className="px-4 py-3.5 min-w-40 text-center">Inflow vs Outflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {monthlyStats.map((m) => {
                                const totalBoth = (m.income + m.expense) || 1;
                                const incomePercent = Math.round((m.income / totalBoth) * 100);

                                return (
                                    <tr key={m.fullLabel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                                            {m.fullLabel}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{m.income.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-bold text-red-600 dark:text-red-400">
                                            ₹{m.expense.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-black">
                                            <span className={m.surplus >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}>
                                                {m.surplus >= 0 ? `+₹${m.surplus.toLocaleString()}` : `-₹${Math.abs(m.surplus).toLocaleString()}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-xs">
                                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold
                                                ${m.margin > 0
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                    : m.margin < 0
                                                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}
                                            >
                                                {m.margin}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                                            {m.txCount}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                                                <div
                                                    className="bg-emerald-500 h-full transition-all"
                                                    style={{ width: `${incomePercent}%` }}
                                                    title={`Inflow: ${incomePercent}%`}
                                                />
                                                <div
                                                    className="bg-red-500 h-full transition-all"
                                                    style={{ width: `${100 - incomePercent}%` }}
                                                    title={`Outflow: ${100 - incomePercent}%`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-700">
                            <tr>
                                <td className="px-4 py-3.5 text-slate-900 dark:text-white">Total Annual (FY)</td>
                                <td className="px-4 py-3.5 text-right text-emerald-600 dark:text-emerald-400 text-base">
                                    ₹{currentFYTotals.totalIncome.toLocaleString()}
                                </td>
                                <td className="px-4 py-3.5 text-right text-red-600 dark:text-red-400 text-base">
                                    ₹{currentFYTotals.totalExpense.toLocaleString()}
                                </td>
                                <td className="px-4 py-3.5 text-right text-indigo-600 dark:text-indigo-400 text-base">
                                    ₹{currentFYTotals.netSurplus.toLocaleString()}
                                </td>
                                <td className="px-4 py-3.5 text-center text-indigo-600 dark:text-indigo-400">
                                    {currentFYTotals.profitMargin}%
                                </td>
                                <td className="px-4 py-3.5 text-center text-slate-500 font-mono">
                                    {currentFYTotals.totalTx}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
