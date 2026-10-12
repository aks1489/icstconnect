import { useState, useEffect, useMemo } from 'react';
import {
    IconSearch as Search,
    IconDownload as Download,
    IconEdit as Edit,
    IconCheck as Check,
    IconReceipt as Receipt,
    IconRefresh as Refresh
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { financeService } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import CollectPaymentModal from './CollectPaymentModal';
import AssignFeeModal from './AssignFeeModal';

export interface StudentPaymentRecord {
    studentId: string;
    studentName: string;
    email: string;
    phone?: string;
    courseId?: number | null;
    courseName: string;
    studentFeeId?: string;
    baseFee: number;
    admissionFee: number;
    discountOnBase: number;
    discountOnAdmission: number;
    totalFee: number;
    paidAmount: number;
    dueAmount: number;
    paymentPlan: 'one_time' | 'monthly';
    monthlyDueDay: number;
    status: 'paid' | 'partial' | 'pending' | 'unassigned';
    monthlyPayments: { [key: string]: number };
}

export default function StudentPaymentStatus() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [studentsData, setStudentsData] = useState<StudentPaymentRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'unassigned'>('all');

    // Modals
    const [collectModalStudent, setCollectModalStudent] = useState<any | null>(null);
    const [assignModalStudent, setAssignModalStudent] = useState<any | null>(null);

    // Month headers
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all student profiles
            const { data: profiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, role')
                .eq('role', 'student')
                .order('full_name');

            if (profileErr) throw profileErr;

            // 2. Fetch all student fee structures
            const { data: feesData, error: feesErr } = await supabase
                .from('student_fees')
                .select('*, course:courses(id, course_name, fees)');

            if (feesErr) throw feesErr;

            // 3. Fetch all institution transactions linked to students
            const transactions = await financeService.getAllStudentPayments();

            // 4. Fetch fee_payments
            const { data: feePayments } = await supabase
                .from('fee_payments')
                .select('*');

            // 5. Merge and process student records
            const feeByStudentMap = new Map<string, any>();
            (feesData || []).forEach(f => {
                feeByStudentMap.set(f.student_id, f);
            });

            // Also include any non-student profile that has a student_fee (e.g. Admin test account)
            const allStudentIds = new Set((profiles || []).map(p => p.id));
            const extraProfiles: any[] = [];
            (feesData || []).forEach(f => {
                if (!allStudentIds.has(f.student_id)) {
                    allStudentIds.add(f.student_id);
                    extraProfiles.push({
                        id: f.student_id,
                        full_name: 'Admin Test Student',
                        email: 'admin@icst.edu',
                        phone: ''
                    });
                }
            });

            const combinedProfiles = [...(profiles || []), ...extraProfiles];

            const processed: StudentPaymentRecord[] = combinedProfiles.map(student => {
                const feeRecord = feeByStudentMap.get(student.id);
                const studentTx = (transactions || []).filter(t => t.student_id === student.id);
                const studentFeePays = (feePayments || []).filter(fp => fp.student_id === student.id);

                // Calculate paid amount from transactions or fee payments
                const txPaid = studentTx.reduce((sum, t) => sum + (t.type === 'income' ? (t.amount || 0) : 0), 0);
                const directPaid = studentFeePays.reduce((sum, fp) => sum + (fp.amount_paid || 0), 0);
                const paidAmount = Math.max(txPaid, directPaid);

                const totalFee = feeRecord?.final_total_fee ?? 0;
                const dueAmount = Math.max(0, totalFee - paidAmount);

                // Map monthly payments
                const monthlyPayments: { [key: string]: number } = {};
                studentTx.forEach(t => {
                    if (t.type === 'income' && t.transaction_date) {
                        const date = new Date(t.transaction_date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        monthlyPayments[month] = (monthlyPayments[month] || 0) + (t.amount || 0);
                    }
                });

                studentFeePays.forEach(fp => {
                    if (fp.payment_date) {
                        const date = new Date(fp.payment_date);
                        const month = date.toLocaleString('default', { month: 'short' });
                        if (!monthlyPayments[month]) {
                            monthlyPayments[month] = fp.amount_paid || 0;
                        }
                    }
                });

                let status: 'paid' | 'partial' | 'pending' | 'unassigned' = 'unassigned';
                if (!feeRecord) {
                    status = 'unassigned';
                } else if (paidAmount >= totalFee && totalFee > 0) {
                    status = 'paid';
                } else if (paidAmount > 0) {
                    status = 'partial';
                } else {
                    status = 'pending';
                }

                return {
                    studentId: student.id,
                    studentName: student.full_name || 'Unnamed Student',
                    email: student.email || '',
                    phone: student.phone || '',
                    courseId: feeRecord?.course_id || null,
                    courseName: feeRecord?.course?.course_name || 'No Course Assigned',
                    studentFeeId: feeRecord?.id,
                    baseFee: feeRecord?.base_fee || 0,
                    admissionFee: feeRecord?.admission_fee || 0,
                    discountOnBase: feeRecord?.discount_on_base || 0,
                    discountOnAdmission: feeRecord?.discount_on_admission || 0,
                    totalFee,
                    paidAmount,
                    dueAmount,
                    paymentPlan: feeRecord?.payment_plan || 'monthly',
                    monthlyDueDay: feeRecord?.monthly_due_day || 5,
                    status,
                    monthlyPayments
                };
            });

            setStudentsData(processed);
        } catch (error) {
            console.error('Error fetching student fee data:', error);
            showToast('Failed to load student fee ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtered data
    const filteredData = useMemo(() => {
        return studentsData.filter(student => {
            const matchesSearch =
                student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return student.status === 'pending' || student.status === 'partial';
            if (statusFilter === 'paid') return student.status === 'paid';
            if (statusFilter === 'unassigned') return student.status === 'unassigned';
            return true;
        });
    }, [studentsData, searchTerm, statusFilter]);

    // Financial calculations
    const summary = useMemo(() => {
        const totalStudents = studentsData.length;
        const totalBilled = studentsData.reduce((acc, s) => acc + s.totalFee, 0);
        const totalCollected = studentsData.reduce((acc, s) => acc + s.paidAmount, 0);
        const totalDue = studentsData.reduce((acc, s) => acc + s.dueAmount, 0);
        const efficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
        return { totalStudents, totalBilled, totalCollected, totalDue, efficiency };
    }, [studentsData]);

    const handleExportCSV = () => {
        if (studentsData.length === 0) {
            showToast('No student payment records to export', 'info');
            return;
        }

        const headers = ['#', 'Student Name', 'Email', 'Course', 'Plan', 'Total Fee (INR)', 'Paid (INR)', 'Due (INR)', 'Status', ...months];
        const rows = studentsData.map((s, idx) => [
            idx + 1,
            `"${s.studentName}"`,
            `"${s.email}"`,
            `"${s.courseName}"`,
            s.paymentPlan,
            s.totalFee,
            s.paidAmount,
            s.dueAmount,
            s.status,
            ...months.map(m => s.monthlyPayments[m] || 0)
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `icst_student_fee_ledger_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Student Fee Ledger exported successfully', 'success');
    };

    return (
        <div className="space-y-6">
            {/* Ledger KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                        {summary.totalStudents} <span className="text-xs font-normal text-slate-400">Students</span>
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Billed</p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        ₹{summary.totalBilled.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Collected</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        ₹{summary.totalCollected.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Dues Pending</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        ₹{summary.totalDue.toLocaleString()}
                        <span className="text-xs ml-2 font-normal text-slate-400">({summary.efficiency}% collected)</span>
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student name, course or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'all'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                        >
                            All ({studentsData.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'pending'
                                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                        >
                            Has Dues
                        </button>
                        <button
                            onClick={() => setStatusFilter('paid')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'paid'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                        >
                            Paid
                        </button>
                        <button
                            onClick={() => setStatusFilter('unassigned')}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${statusFilter === 'unassigned'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                        >
                            Unassigned
                        </button>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Refresh ledger"
                    >
                        <Refresh size={18} />
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Student Payment Ledger Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5 sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 w-12 text-center">#</th>
                                <th className="px-4 py-3.5 sticky left-12 bg-slate-50 dark:bg-slate-900 z-20 min-w-44">Student Name</th>
                                <th className="px-4 py-3.5 min-w-48">Enrolled Course</th>
                                <th className="px-4 py-3.5 text-right">Total Fee</th>
                                <th className="px-4 py-3.5 text-right">Paid</th>
                                <th className="px-4 py-3.5 text-right">Due</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5 text-center">Actions</th>
                                {months.map(m => (
                                    <th key={m} className="px-3 py-3.5 text-center font-medium text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={20} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Loading student payment records...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                        No student records match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((student, idx) => (
                                    <tr key={student.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                        {/* Row Number */}
                                        <td className="px-4 py-3.5 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 z-10 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
                                            {idx + 1}
                                        </td>

                                        {/* Student Name */}
                                        <td className="px-4 py-3.5 sticky left-12 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 z-10">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                                                    {student.studentName}
                                                </p>
                                                {student.email && (
                                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-40">
                                                        {student.email}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Enrolled Course */}
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate block">
                                                {student.courseName}
                                            </span>
                                        </td>

                                        {/* Total Fee */}
                                        <td className="px-4 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                                            {student.totalFee > 0 ? `₹${student.totalFee.toLocaleString()}` : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Paid */}
                                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{student.paidAmount.toLocaleString()}
                                        </td>

                                        {/* Due */}
                                        <td className="px-4 py-3.5 text-right font-bold">
                                            {student.dueAmount > 0 ? (
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    ₹{student.dueAmount.toLocaleString()}
                                                </span>
                                            ) : student.totalFee > 0 ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-end gap-1">
                                                    <Check size={14} /> Clear
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                                                ${student.status === 'paid'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                                                    : student.status === 'partial'
                                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800'
                                                        : student.status === 'pending'
                                                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}
                                            >
                                                {student.status === 'unassigned' ? 'Unassigned' : student.status}
                                            </span>
                                        </td>

                                        {/* Quick Actions */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setCollectModalStudent({
                                                        id: student.studentId,
                                                        name: student.studentName,
                                                        courseId: student.courseId,
                                                        courseName: student.courseName,
                                                        studentFeeId: student.studentFeeId,
                                                        totalFee: student.totalFee,
                                                        paidAmount: student.paidAmount,
                                                        dueAmount: student.dueAmount
                                                    })}
                                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                                                    title="Collect fee payment"
                                                >
                                                    <Receipt size={14} />
                                                    <span>Collect</span>
                                                </button>
                                                <button
                                                    onClick={() => setAssignModalStudent({
                                                        id: student.studentId,
                                                        name: student.studentName,
                                                        courseId: student.courseId,
                                                        courseName: student.courseName,
                                                        studentFeeId: student.studentFeeId,
                                                        baseFee: student.baseFee,
                                                        admissionFee: student.admissionFee,
                                                        discountOnBase: student.discountOnBase,
                                                        discountOnAdmission: student.discountOnAdmission,
                                                        finalTotalFee: student.totalFee,
                                                        paymentPlan: student.paymentPlan,
                                                        monthlyDueDay: student.monthlyDueDay
                                                    })}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title="Configure fee structure"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Months */}
                                        {months.map(m => {
                                            const amt = student.monthlyPayments[m];
                                            return (
                                                <td key={m} className="px-3 py-3.5 text-center text-xs">
                                                    {amt ? (
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                                                            ₹{amt}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-700">-</span>
                                                    )}
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

            {/* Quick Collect Fee Modal */}
            <CollectPaymentModal
                isOpen={Boolean(collectModalStudent)}
                onClose={() => setCollectModalStudent(null)}
                onSuccess={fetchData}
                student={collectModalStudent}
            />

            {/* Configure Fee Plan Modal */}
            <AssignFeeModal
                isOpen={Boolean(assignModalStudent)}
                onClose={() => setAssignModalStudent(null)}
                onSuccess={fetchData}
                student={assignModalStudent}
            />
        </div>
    );
}
