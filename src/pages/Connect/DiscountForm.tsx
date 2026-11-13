import React, { useState, useEffect } from 'react';
import {
    IconX,
    IconCheck,
    IconLoader2,
    IconAlertCircle,
    IconTicket,
    IconSparkles,
    IconShieldCheck
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

interface DiscountFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const DURATION_TIERS = [
    { months: 3, label: '3 Months', discount: 10, tag: 'Basic' },
    { months: 6, label: '6 Months', discount: 15, tag: 'Standard' },
    { months: 12, label: '12 Months', discount: 20, tag: 'Diploma' },
    { months: 18, label: '18+ Months', discount: 30, tag: 'Advance IT' },
];

const DiscountForm: React.FC<DiscountFormProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        guardianName: '',
        course: '',
        class: '',
        contactNumber: '',
        durationMonths: 6
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setSubmitStatus('idle');
            setErrors({});
            setAcceptedTerms(false);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const getDiscountPercentage = (months: number) => {
        if (months >= 18) return 30;
        if (months >= 12) return 20;
        if (months >= 6) return 15;
        return 10;
    };

    const discountPercentage = getDiscountPercentage(formData.durationMonths);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.studentName.trim()) newErrors.studentName = "Student name is required";
        if (!formData.guardianName.trim()) newErrors.guardianName = "Guardian name is required";
        if (!formData.course.trim()) newErrors.course = "Course selection is required";

        const phoneDigits = formData.contactNumber.replace(/\D/g, '');
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
        } else if (phoneDigits.length !== 10) {
            newErrors.contactNumber = "Enter a valid 10-digit mobile number";
        }

        if (!acceptedTerms) {
            newErrors.terms = "You must accept the admission terms";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const phoneDigits = formData.contactNumber.replace(/\D/g, '');
            const { data: existingClaims, error: checkError } = await supabase
                .from('discount_inquiries')
                .select('id')
                .eq('contact_number', phoneDigits)
                .ilike('student_name', formData.studentName.trim())
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingClaims) {
                setSubmitStatus('duplicate');
                setIsSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('discount_inquiries')
                .insert({
                    student_name: formData.studentName.trim(),
                    guardian_name: formData.guardianName.trim(),
                    course: formData.course.trim(),
                    class: formData.class.trim(),
                    contact_number: phoneDigits,
                    discount_percentage: discountPercentage,
                    duration_months: formData.durationMonths,
                    status: 'pending'
                });

            if (error) throw error;

            setSubmitStatus('success');
            setTimeout(() => {
                onClose();
                setSubmitStatus('idle');
                setFormData({
                    studentName: '',
                    guardianName: '',
                    course: '',
                    class: '',
                    contactNumber: '',
                    durationMonths: 6
                });
                setAcceptedTerms(false);
                setErrors({});
            }, 2500);
        } catch (error) {
            console.error('Error submitting discount inquiry:', error);
            setSubmitStatus('error');
        } finally {
            if (submitStatus !== 'duplicate') {
                setIsSubmitting(false);
            }
        }
    };

    if (!isVisible) return null;

    const getInputClass = (error?: string) => `
        w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none
        bg-slate-100 dark:bg-[#0F2038] text-slate-900 dark:text-slate-100
        border ${error
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-slate-300 dark:border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20'
        }
        placeholder:text-slate-400 dark:placeholder:text-slate-500
    `;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className={`
                relative w-full max-w-lg bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl shadow-blue-900/30 p-6 sm:p-7
                transform transition-all duration-300 max-h-[92vh] overflow-y-auto custom-scrollbar
                ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
            `}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    aria-label="Close discount dialog"
                >
                    <IconX size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                        <IconTicket size={24} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
                            <IconSparkles size={12} />
                            <span>Special Admissions Benefit</span>
                        </div>
                        <h2 id="discount-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Claim Course Discount
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Apply now for subsidized fees at ICST Chowberia
                        </p>
                    </div>
                </div>

                {/* Duplicate Notification */}
                {submitStatus === 'duplicate' && (
                    <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <IconAlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Already Registered</h4>
                            <p className="text-xs text-slate-600 dark:text-amber-200/90 mt-1 leading-relaxed">
                                A discount voucher has already been reserved for <strong>{formData.studentName}</strong> with this phone number. Please visit our Chowberia campus or contact our desk for enrollment.
                            </p>
                        </div>
                    </div>
                )}

                {/* Success Banner */}
                {submitStatus === 'success' ? (
                    <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                            <IconCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Discount Voucher Reserved!</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                                Congratulations, you have locked in a <span className="font-bold text-emerald-500">{discountPercentage}% Discount</span> on your diploma course fees.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-[#0F2038] rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Our admissions desk will contact you at <strong>{formData.contactNumber}</strong> to confirm your seat.
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Student & Guardian */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Student Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={getInputClass(errors.studentName)}
                                    placeholder="e.g. Rahul Mondal"
                                    value={formData.studentName}
                                    onChange={e => {
                                        setFormData({ ...formData, studentName: e.target.value });
                                        if (errors.studentName) setErrors({ ...errors, studentName: '' });
                                    }}
                                />
                                {errors.studentName && <span className="text-[11px] text-red-500">{errors.studentName}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Father / Guardian Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={getInputClass(errors.guardianName)}
                                    placeholder="Guardian's name"
                                    value={formData.guardianName}
                                    onChange={e => {
                                        setFormData({ ...formData, guardianName: e.target.value });
                                        if (errors.guardianName) setErrors({ ...errors, guardianName: '' });
                                    }}
                                />
                                {errors.guardianName && <span className="text-[11px] text-red-500">{errors.guardianName}</span>}
                            </div>
                        </div>

                        {/* Class & Contact Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Current Class / Qualification
                                </label>
                                <input
                                    type="text"
                                    className={getInputClass()}
                                    placeholder="e.g. Class 10 / 12 / Graduate"
                                    value={formData.class}
                                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    WhatsApp / Mobile No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    className={getInputClass(errors.contactNumber)}
                                    placeholder="10-digit mobile number"
                                    value={formData.contactNumber}
                                    onChange={e => {
                                        const clean = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, contactNumber: clean });
                                        if (errors.contactNumber) setErrors({ ...errors, contactNumber: '' });
                                    }}
                                />
                                {errors.contactNumber && <span className="text-[11px] text-red-500">{errors.contactNumber}</span>}
                            </div>
                        </div>

                        {/* Interested Course */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Interested Program / Course <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={getInputClass(errors.course)}
                                placeholder="e.g. DCA, ADCA, Web Dev, Python, Financial Accounting"
                                value={formData.course}
                                onChange={e => {
                                    setFormData({ ...formData, course: e.target.value });
                                    if (errors.course) setErrors({ ...errors, course: '' });
                                }}
                            />
                            {errors.course && <span className="text-[11px] text-red-500">{errors.course}</span>}
                        </div>

                        {/* Duration Selector with interactive cards */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Course Duration & Discount Tier
                                </label>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {discountPercentage}% Guaranteed Discount
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {DURATION_TIERS.map(tier => {
                                    const isSelected = formData.durationMonths === tier.months;
                                    return (
                                        <button
                                            key={tier.months}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, durationMonths: tier.months })}
                                            className={`
                                                relative p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer
                                                ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-slate-100 dark:bg-[#0F2038] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                                                }
                                            `}
                                        >
                                            <span className="block text-xs font-bold">{tier.label}</span>
                                            <span className={`text-[11px] font-semibold ${isSelected ? 'text-blue-100 dark:text-cyan-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {tier.discount}% OFF
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <IconShieldCheck size={14} className="text-blue-500 dark:text-cyan-400" />
                                <span>Terms of Admission Benefit</span>
                            </label>
                            <div className="h-20 bg-slate-50 dark:bg-[#081528] border border-slate-200 dark:border-slate-800 rounded-xl p-3 overflow-y-auto text-xs text-slate-500 dark:text-slate-400 leading-relaxed custom-scrollbar">
                                <ul className="list-disc pl-3 text-[10px] space-y-1">
                                    <li>One discount code applicable per student per course.</li>
                                    <li>Discount percentage scales with course duration (up to 30% for 18+ months).</li>
                                    <li>Valid for current admission session at ICST Chowberia campus.</li>
                                    <li>Valid student ID or guardian verification required during seat confirmation.</li>
                                    <li>Cannot be combined with state-sponsored fully funded schemes.</li>
                                </ul>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1 group">
                                <div className={`
                                    w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0
                                    ${acceptedTerms
                                        ? 'bg-blue-600 border-blue-600 text-white dark:bg-cyan-500 dark:border-cyan-500'
                                        : errors.terms
                                            ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                                            : 'border-slate-400 dark:border-slate-600 group-hover:border-slate-500'
                                    }
                                `}>
                                    {acceptedTerms && <IconCheck size={12} strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={acceptedTerms}
                                    onChange={e => {
                                        setAcceptedTerms(e.target.checked);
                                        if (e.target.checked && errors.terms) setErrors({ ...errors, terms: '' });
                                    }}
                                />
                                <span className={`text-xs ${errors.terms ? 'text-red-500 font-semibold' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                                    I agree to the admission discount terms and guidelines
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                                ${isSubmitting
                                    ? 'bg-slate-400 dark:bg-slate-800 text-white cursor-not-allowed'
                                    : acceptedTerms
                                        ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0'
                                        : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60'
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={18} className="animate-spin" />
                                    <span>Reserving Your Seat...</span>
                                </>
                            ) : (
                                <>
                                    <IconTicket size={18} />
                                    <span>Lock In {discountPercentage}% Discount Voucher</span>
                                </>
                            )}
                        </button>

                        {submitStatus === 'error' && (
                            <p className="text-center text-xs text-red-500 inline-flex items-center justify-center gap-1 w-full pt-1">
                                <IconAlertCircle size={14} />
                                <span>Submission failed. Please check your network and try again.</span>
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default DiscountForm;
