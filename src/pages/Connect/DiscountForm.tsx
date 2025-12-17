import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DiscountFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        guardianName: '',
        course: '',
        class: '',
        contactNumber: '',
        durationMonths: 3
    });

    // Validation State
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
    const [isVisible, setIsVisible] = useState(false);

    // Animation handling
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            setSubmitStatus('idle'); // Reset status on open
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
        if (!formData.course.trim()) newErrors.course = "Course is required";

        // Basic Phone Validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
        } else if (!phoneRegex.test(formData.contactNumber.replace(/\D/g, ''))) {
            newErrors.contactNumber = "Please enter a valid 10-digit number";
        }

        if (!acceptedTerms) {
            newErrors.terms = "You must accept the terms";
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
            // Check for Duplicate (Name + Phone)
            // Using maybeSingle() to handle 0 or 1 result gracefully
            const { data: existingClaims, error: checkError } = await supabase
                .from('discount_inquiries')
                .select('id')
                .eq('contact_number', formData.contactNumber)
                .ilike('student_name', formData.studentName) // Case insensitive match
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingClaims) {
                setSubmitStatus('duplicate');
                setIsSubmitting(false);
                return;
            }

            // Proceed with Insert
            const { error } = await supabase
                .from('discount_inquiries')
                .insert({
                    student_name: formData.studentName,
                    guardian_name: formData.guardianName,
                    course: formData.course,
                    class: formData.class,
                    contact_number: formData.contactNumber,
                    discount_percentage: discountPercentage,
                    duration_months: formData.durationMonths,
                    status: 'pending'
                });

            if (error) throw error;

            setSubmitStatus('success');
            // Auto close after success
            setTimeout(() => {
                onClose();
                setSubmitStatus('idle');
                setFormData({
                    studentName: '',
                    guardianName: '',
                    course: '',
                    class: '',
                    contactNumber: '',
                    durationMonths: 3
                });
                setAcceptedTerms(false);
                setErrors({});
            }, 2500);

        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            // Only stop submitting if NOT duplicate (duplicate handles its own state)
            // But actually we want to stop loader regardless
            if (submitStatus !== 'duplicate') {
                setIsSubmitting(false);
            }
        }
    };

    if (!isVisible) return null;

    // Helper for Input Classes
    const getInputClass = (error?: string) => `
        w-full bg-slate-900/50 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors
        ${error
            ? 'border-red-500/50 focus:border-red-500 placeholder:text-red-500/30'
            : 'border-slate-700 focus:border-blue-500 placeholder:text-slate-500'
        }
    `;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative w-full max-w-md bg-[#0f172a] border border-blue-500/30 rounded-2xl shadow-2xl p-6
                transform transition-all duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar
                ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
            `}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Claim Your Discount</h2>
                    <p className="text-slate-400 text-sm">Fill in the details to unlock your special offer.</p>
                </div>

                {/* Duplicate Error Alert */}
                {submitStatus === 'duplicate' && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="text-sm font-bold text-amber-500">Already Claimed!</h4>
                            <p className="text-xs text-amber-200/80 mt-1">
                                It looks like a discount has already been claimed for <strong>{formData.studentName}</strong> with this number.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Student & Guardian */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 ml-1">
                                Student Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                className={getInputClass(errors.studentName)}
                                placeholder="John Doe"
                                value={formData.studentName}
                                onChange={e => {
                                    setFormData({ ...formData, studentName: e.target.value });
                                    if (errors.studentName) setErrors({ ...errors, studentName: '' });
                                }}
                            />
                            {errors.studentName && <span className="text-[10px] text-red-400 ml-1">{errors.studentName}</span>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 ml-1">
                                Guardian Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                className={getInputClass(errors.guardianName)}
                                placeholder="Parent Name"
                                value={formData.guardianName}
                                onChange={e => {
                                    setFormData({ ...formData, guardianName: e.target.value });
                                    if (errors.guardianName) setErrors({ ...errors, guardianName: '' });
                                }}
                            />
                            {errors.guardianName && <span className="text-[10px] text-red-400 ml-1">{errors.guardianName}</span>}
                        </div>
                    </div>

                    {/* Class & Contact */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 ml-1">Current Class</label>
                            <input
                                type="text"
                                className={getInputClass()}
                                placeholder="Class 10"
                                value={formData.class}
                                onChange={e => setFormData({ ...formData, class: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 ml-1">
                                Contact No. <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                className={getInputClass(errors.contactNumber)}
                                placeholder="9876543210"
                                value={formData.contactNumber}
                                onChange={e => {
                                    setFormData({ ...formData, contactNumber: e.target.value });
                                    if (errors.contactNumber) setErrors({ ...errors, contactNumber: '' });
                                }}
                            />
                            {errors.contactNumber && <span className="text-[10px] text-red-400 ml-1">{errors.contactNumber}</span>}
                        </div>
                    </div>

                    {/* Course */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 ml-1">
                            Interested Course <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className={getInputClass(errors.course)}
                            placeholder="e.g. DCA, Hardware & Networking..."
                            value={formData.course}
                            onChange={e => {
                                setFormData({ ...formData, course: e.target.value });
                                if (errors.course) setErrors({ ...errors, course: '' });
                            }}
                        />
                        {errors.course && <span className="text-[10px] text-red-400 ml-1">{errors.course}</span>}
                    </div>

                    {/* Duration Selection & Badge */}
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-blue-300 mb-1 block">Course Duration</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                value={formData.durationMonths}
                                onChange={e => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                            >
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                                <option value={18}>18+ Months</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 mb-0.5">You Save</div>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                {discountPercentage}%
                            </div>
                        </div>
                    </div>

                    {/* Terms Scroll Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 ml-1">Terms & Conditions</label>
                        <div className="h-24 bg-slate-900/30 border border-slate-800 rounded-lg p-3 overflow-y-auto text-xs text-slate-400 leading-relaxed custom-scrollbar">
                            <ul className="list-disc pl-3 text-[10px] space-y-1.5">
                                <li>One discount applicable per student per course.</li>
                                <li>The discount percentage is determined by the total duration of the selected course.</li>
                                <li>This offer is valid for a limited period and subject to seat availability.</li>
                                <li>The discount cannot be combined with other promotional offers or scholarships.</li>
                                <li>The management reserves the right to modify or withdraw the offer at any time.</li>
                                <li>A valid guardian signature and ID proof are required during final admission.</li>
                                <li>Fees once paid are non-refundable under standard policy terms.</li>
                            </ul>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`
                                w-4 h-4 rounded border flex items-center justify-center transition-colors
                                ${acceptedTerms
                                    ? 'bg-blue-500 border-blue-500'
                                    : errors.terms
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-slate-600 group-hover:border-slate-500'
                                }
                            `}>
                                {acceptedTerms && <Check size={10} className="text-white" />}
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
                            <span className={`text-xs ${errors.terms ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                I accept the terms and conditions
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`
                            w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                            ${isSubmitting
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : acceptedTerms
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] shadow-lg shadow-blue-500/25 text-white'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : submitStatus === 'success' ? (
                            <>
                                <Check size={16} />
                                Claim Submitted!
                            </>
                        ) : submitStatus === 'error' ? (
                            <>
                                <AlertCircle size={16} />
                                Try Again
                            </>
                        ) : (
                            `Claim ${discountPercentage}% Discount Now`
                        )}
                    </button>
                    {/* General Error Message */}
                    {submitStatus === 'error' && (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[10px] text-red-500 inline-flex items-center gap-1">
                                <AlertCircle size={12} />
                                Something went wrong. Check your connection.
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DiscountForm;
