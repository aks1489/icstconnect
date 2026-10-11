import { useState, useEffect } from 'react';
import {
    IconX as X,
    IconCheck as Check,
    IconCalculator as Calculator,
    IconUser as User
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { feesService } from '../../services/feesService';
import { useToast } from '../../contexts/ToastContext';
import CourseSearchSelect, { type CourseOption } from '../../components/admin/CourseSearchSelect';

export interface AssignFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student: {
        id: string;
        name: string;
        courseId?: number | null;
        courseName?: string;
        studentFeeId?: string;
        baseFee?: number;
        admissionFee?: number;
        discountOnBase?: number;
        discountOnAdmission?: number;
        finalTotalFee?: number;
        paymentPlan?: 'one_time' | 'monthly';
        monthlyDueDay?: number;
    } | null;
}

export default function AssignFeeModal({
    isOpen,
    onClose,
    onSuccess,
    student
}: AssignFeeModalProps) {
    const { showToast } = useToast();
    const [courses, setCourses] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [courseId, setCourseId] = useState<string>('');
    const [baseFee, setBaseFee] = useState<number>(0);
    const [admissionFee, setAdmissionFee] = useState<number>(0);
    const [discountOnBase, setDiscountOnBase] = useState<number>(0);
    const [discountOnAdmission, setDiscountOnAdmission] = useState<number>(0);
    const [paymentPlan, setPaymentPlan] = useState<'one_time' | 'monthly'>('monthly');
    const [monthlyDueDay, setMonthlyDueDay] = useState<number>(5);

    // Fetch courses on mount
    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            const { data } = await supabase
                .from('courses')
                .select('id, course_name, duration_months, fees')
                .order('course_name');
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    // Pre-fill on open
    useEffect(() => {
        if (isOpen && student) {
            setCourseId(student.courseId ? String(student.courseId) : '');
            setBaseFee(student.baseFee || 0);
            setAdmissionFee(student.admissionFee || 0);
            setDiscountOnBase(student.discountOnBase || 0);
            setDiscountOnAdmission(student.discountOnAdmission || 0);
            setPaymentPlan(student.paymentPlan || 'monthly');
            setMonthlyDueDay(student.monthlyDueDay || 5);
        }
    }, [isOpen, student]);

    // Handle course selection
    const handleCourseSelect = (idStr: string, selectedCourse?: CourseOption) => {
        setCourseId(idStr);
        if (selectedCourse) {
            const fullCourse = courses.find(c => String(c.id) === idStr);
            if (fullCourse?.fees) {
                const total = fullCourse.fees.total || fullCourse.fees.admission || 0;
                const adm = fullCourse.fees.admission || 0;
                setBaseFee(total > adm ? total - adm : total);
                setAdmissionFee(adm);
            }
        }
    };

    if (!isOpen || !student) return null;

    const finalTotal = Math.max(0, (baseFee + admissionFee) - (discountOnBase + discountOnAdmission));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await feesService.upsertFeeStructure({
                id: student.studentFeeId,
                student_id: student.id,
                course_id: courseId ? parseInt(courseId, 10) : null,
                base_fee: baseFee,
                admission_fee: admissionFee,
                discount_on_base: discountOnBase,
                discount_on_admission: discountOnAdmission,
                payment_plan: paymentPlan,
                monthly_due_day: monthlyDueDay,
                status: 'pending'
            });

            showToast(`Fee structure updated successfully for ${student.name}!`, 'success');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving fee structure:', error);
            showToast('Failed to save fee structure. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                            <Calculator size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fee Structure</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Configure or adjust student fees & discounts</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Student Name */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                        <User size={18} className="text-indigo-500" />
                        <div>
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Student</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{student.name}</p>
                        </div>
                    </div>

                    {/* Course Selection */}
                    <CourseSearchSelect
                        courses={courses}
                        value={courseId}
                        onChange={handleCourseSelect}
                        label="Enrolled Course"
                        placeholder="-- Select Course --"
                        compact
                    />

                    {/* Base Fee & Admission Fee */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Base Course Fee (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={baseFee || ''}
                                onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Admission / Reg Fee (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={admissionFee || ''}
                                onChange={(e) => setAdmissionFee(parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Discount & Scholarship */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Course Fee Discount (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={discountOnBase || ''}
                                onChange={(e) => setDiscountOnBase(parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Admission Discount (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={discountOnAdmission || ''}
                                onChange={(e) => setDiscountOnAdmission(parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:border-indigo-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Plan & Due Day */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Payment Plan
                            </label>
                            <select
                                value={paymentPlan}
                                onChange={(e) => setPaymentPlan(e.target.value as any)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            >
                                <option value="monthly">Monthly Installments</option>
                                <option value="one_time">One-Time Full Payment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Monthly Due Day
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="28"
                                value={monthlyDueDay}
                                onChange={(e) => setMonthlyDueDay(parseInt(e.target.value, 10) || 5)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Final Total Calculation Card */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Final Total Payable</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">After all applied discounts</p>
                        </div>
                        <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center">
                            ₹{finalTotal.toLocaleString()}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>Save Fee Plan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
