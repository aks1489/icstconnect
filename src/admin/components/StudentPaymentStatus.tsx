import { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface StudentPayment {
    studentId: string;
    studentName: string;
    course: string;
    totalFee: number;
    paidAmount: number;
    dueAmount: number;
    monthlyPayments: { [key: string]: number }; // Format: "Apr-2025": 500
}

export default function StudentPaymentStatus() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [studentsData, setStudentsData] = useState<StudentPayment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Academic Year Configuration (Could be dynamic later)
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    // Assuming current session starts Apr 2025 for now (Need to manage years properly)
    // For MVP, we will just use the month name matching.

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all students with their course details (and fees)
            const { data: students, error: studentError } = await supabase
                .from('student_fees')
                .select(`
                    student_id,
                    final_total_fee,
                    student:profiles(id, full_name),
                    course:courses(course_name)
                `);

            if (studentError) throw studentError;

            // 2. Fetch all payment transactions
            const transactions = await financeService.getAllStudentPayments();

            // 3. Process Data
            const processedData: StudentPayment[] = students.map((s: any) => {
                const studentId = s.student.id;
                const studentName = s.student.full_name;
                const totalFee = s.final_total_fee || 0;

                // Filter transactions for this student
                const studentTx = transactions.filter((t: any) => t.student_id === studentId);

                // Calculate Paid amount
                const paidAmount = studentTx.reduce((sum: number, t: any) => sum + (t.type === 'income' ? t.amount : 0), 0);

                // Map months
                const monthlyPayments: { [key: string]: number } = {};
                studentTx.forEach((t: any) => {
                    if (t.type === 'income') {
                        const date = new Date(t.transaction_date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        monthlyPayments[month] = (monthlyPayments[month] || 0) + t.amount;
                    }
                });

                return {
                    studentId,
                    studentName,
                    course: s.course?.course_name || 'N/A',
                    totalFee,
                    paidAmount,
                    dueAmount: totalFee - paidAmount,
                    monthlyPayments
                };
            });

            setStudentsData(processedData);

        } catch (error) {
            console.error('Error fetching student payments:', error);
            showToast('Failed to load payment status.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = studentsData.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCellStyle = (amount: number) => {
        // Simple logic: 
        // If amount > 0: Green
        // If amount == 0 and Month is future: Gray (default)
        if (amount > 0) return 'bg-emerald-100 text-emerald-700';
        return '';
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 w-12">#</th>
                                <th className="px-4 py-3 sticky left-12 bg-slate-50 z-10 w-48">Name</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3 text-right">Total Fee</th>
                                <th className="px-4 py-3 text-right">Paid</th>
                                <th className="px-4 py-3 text-right">Due</th>
                                {months.map(m => (
                                    <th key={m} className="px-3 py-3 text-center w-20">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={18} className="p-8 text-center text-slate-500">Loading payment data...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={18} className="p-8 text-center text-slate-500">No students found.</td></tr>
                            ) : (
                                filteredData.map((student, idx) => (
                                    <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 sticky left-12 bg-white group-hover:bg-slate-50 z-10 font-medium text-slate-700">{student.studentName}</td>
                                        <td className="px-4 py-3 text-slate-600">{student.course}</td>
                                        <td className="px-4 py-3 text-right font-medium">₹{student.totalFee.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹{student.paidAmount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">₹{student.dueAmount.toLocaleString()}</td>

                                        {months.map((m) => {
                                            const amount = student.monthlyPayments[m] || 0;
                                            return (
                                                <td key={m} className="p-1">
                                                    <div className={`h-8 w-full flex items-center justify-center rounded text-xs px-1 ${getCellStyle(amount)}`}>
                                                        {amount > 0 ? amount : '-'}
                                                    </div>
                                                </td>
                                            );
                                        })}
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
