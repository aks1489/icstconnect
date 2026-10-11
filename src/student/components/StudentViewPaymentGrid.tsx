import { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import { IconFileText as FileText } from '@tabler/icons-react';

export default function StudentViewPaymentGrid() {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<{ [key: string]: number }>({});

    // Academic Year Configuration
    const months = [
        'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const transactions = await financeService.getStudentPayments(user.id);

            // Map payments to months
            const monthlyPayments: { [key: string]: number } = {};
            transactions.forEach((t: any) => {
                if (t.type === 'income' && (t.category === 'Admission' || t.category === 'EMI')) {
                    const date = new Date(t.transaction_date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    monthlyPayments[month] = (monthlyPayments[month] || 0) + t.amount;
                }
            });

            setPaymentData(monthlyPayments);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCellStyle = (amount: number) => {
        if (amount > 0) return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border-emerald-200 dark:border-emerald-800/60';
        return 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/50">
                <FileText size={18} className="text-slate-400 dark:text-slate-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white">Monthly Payment Status (Session 2025-26)</h3>
            </div>

            <div className="overflow-x-auto p-4">
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 min-w-[600px]">
                    {months.map((m) => {
                        const amount = paymentData[m] || 0;
                        return (
                            <div key={m} className="flex flex-col gap-1">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">{m}</div>
                                <div className={`h-12 flex items-center justify-center rounded-lg border transition-colors ${getCellStyle(amount)}`}>
                                    {loading ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-400 dark:border-t-slate-200 animate-spin" />
                                    ) : amount > 0 ? (
                                        `₹${amount}`
                                    ) : (
                                        '-'
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
