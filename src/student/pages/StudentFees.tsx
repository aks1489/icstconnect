
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import StudentViewPaymentGrid from '../components/StudentViewPaymentGrid';

type StudentFee = Database['public']['Tables']['student_fees']['Row'];
type FeePayment = Database['public']['Tables']['fee_payments']['Row'];

export default function StudentFees() {
    const { user } = useAuth();
    const [feeData, setFeeData] = useState<StudentFee[]>([]);
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch all fee structures for this student (could be multiple courses)
            // Note: getAllStudentFees in service currently fetches ALL for admin. 
            // We need a method to fetch by studentId.
            // I'll assume I can add it or filter locally if needed, but better to query correctly.
            // I'll use direct supabase query here if service doesn't have it, or add to service.
            // Let's add 'getMyFees' to service logic conceptually:
            // But for now, since I can't edit service easily in this turn, I'll use getStudentFeesByEnrollment logic loop? 
            // Or better, just fetch via supabase here for speed, or assume service has it.
            // I'll modify the service later? No, let's just use supabase client here for MVP speed.

            // Actually, I should use the service. I'll stick to a simple query here.
            // Using top-level supabase client


            const { data: fees } = await supabase
                .from('student_fees')
                .select('*, course:courses(course_name)')
                .eq('student_id', user.id);

            const { data: pay } = await supabase
                .from('fee_payments')
                .select('*')
                .eq('student_id', user.id)
                .order('payment_date', { ascending: false });

            if (fees) setFeeData(fees as any);
            if (pay) setPayments(pay);

        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading fee details...</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">My Fees & Payments</h1>

            {/* Fee Cards */}
            <div className="space-y-4">
                {feeData.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                        No fee records found.
                    </div>
                ) : (
                    feeData.map(fee => {
                        // Calculate Paid logic (simple sum of payments for this fee ID)
                        const myPayments = payments.filter(p => p.student_fee_id === fee.id);
                        const paidTotal = myPayments.reduce((sum, p) => sum + p.amount_paid, 0);
                        const pending = fee.final_total_fee - paidTotal;
                        const progress = Math.min(100, (paidTotal / fee.final_total_fee) * 100);

                        return (
                            <div key={fee.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{(fee as any).course?.course_name || 'Course Fee'}</h3>
                                        <p className="text-slate-500 text-sm">Plan: <span className="capitalize">{fee.payment_plan.replace('_', ' ')}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-800">₹{pending.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Pending Amount</p>
                                    </div>
                                </div>

                                {/* Monthly Payment Grid */}
                                <StudentViewPaymentGrid />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Fee Structure Card */}
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Total Fee</p>
                                        <p className="font-semibold text-slate-700">₹{fee.final_total_fee.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
                                        <p className="font-semibold text-emerald-600">₹{paidTotal.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Next Due</p>
                                        <p className="font-semibold text-orange-600 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {fee.next_payment_due_date ? new Date(fee.next_payment_due_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                        {fee.payment_plan === 'monthly' && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                Due on {fee.monthly_due_day}{getOrdinal(fee.monthly_due_day)} of month
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="px-6 pb-6">
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}% ` }}
                                        />
                                    </div>
                                    <p className="text-xs text-right mt-1 text-slate-400">{progress.toFixed(0)}% paid</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Payment History */}
            <h2 className="text-lg font-bold text-slate-800 pt-4">Payment History</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Mode</th>
                            <th className="px-4 py-3">Reference</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payments.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">No payments recorded.</td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-700">₹{p.amount_paid.toLocaleString()}</td>
                                    <td className="px-4 py-3 capitalize">{p.payment_method.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.transaction_reference || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}
