import { useState, useEffect } from 'react';
import {
    IconX as X,
    IconCheck as Check,
    IconCurrencyRupee as CurrencyRupee,
    IconCalendar as Calendar,
    IconBuildingBank as BuildingBank
} from '@tabler/icons-react';
import { financeService } from '../../services/financeService';
import { useToast } from '../../contexts/ToastContext';
import StudentSearch from '../../components/admin/StudentSearch';

export interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultType?: 'income' | 'expense' | 'asset' | 'liability';
}

const CATEGORY_MAP: Record<string, { label: string; subcategories: string[] }[]> = {
    expense: [
        {
            label: 'Faculty & Staff Salaries',
            subcategories: ['Teacher Salary / Honorarium', 'Lab Assistant Remuneration', 'Administrative Staff', 'Guest Instructor']
        },
        {
            label: 'Computer Lab & IT Infrastructure',
            subcategories: ['Hardware Repairs & Components', 'PC / Laptop Maintenance', 'Printer Toners & Cartridges', 'Broadband & Internet', 'Website & Cloud Server Hosting', 'Software Tools & Subscriptions']
        },
        {
            label: 'Institute Utilities & Operations',
            subcategories: ['Electricity Bill', 'Drinking Water & Pantry', 'Housekeeping & Sanitation', 'Security Guard', 'Generator Fuel & Power Backup']
        },
        {
            label: 'Academic Materials & Stationery',
            subcategories: ['Course Study Notes Printing', 'Exam Papers & Booklets', 'Certificates & Student ID Cards', 'Whiteboard Markers & Office Paper']
        },
        {
            label: 'Marketing & Student Outreach',
            subcategories: ['Flex Banners & Hoardings', 'Pamphlets & Leaflets Distribution', 'Social Media Ads (Meta / Google)', 'Newspaper Advertisement', 'School / College Campaign']
        },
        {
            label: 'Campus Rent & Maintenance',
            subcategories: ['Classroom & Campus Rent', 'AC & Electrical Repairs', 'Furniture & Bench Repairs', 'Building Paint & Upkeep']
        },
        {
            label: 'Professional & Miscellaneous',
            subcategories: ['Chartered Accountant & Audit Fee', 'Bank Transaction Charges', 'Miscellaneous Incidentals']
        }
    ],
    income: [
        {
            label: 'Student Fees & Academics',
            subcategories: ['Tuition Fee Installment', 'Admission / Registration Fee', 'Examination Fee', 'Certificate Issuance Fee']
        },
        {
            label: 'Grants & Institutional Inflow',
            subcategories: ['Scholarship Grant', 'Institutional Trust Contribution', 'Donation / Sponsorship']
        },
        {
            label: 'Other Receipts',
            subcategories: ['Old Hardware Scrap Sale', 'Lab Extended Hour Fee', 'Miscellaneous Inflow']
        }
    ],
    asset: [
        {
            label: 'IT & Lab Equipment',
            subcategories: ['Desktop Computers / Laptops', 'Network Switches & Routers', 'Projector & Display Screens', 'Printers & Scanners']
        },
        {
            label: 'Furniture & Campus Infrastructure',
            subcategories: ['Classroom Benches & Chairs', 'Air Conditioners & Coolers', 'Office Tables & Cupboards', 'Inverter & Battery Setup']
        }
    ],
    liability: [
        {
            label: 'Current Liabilities',
            subcategories: ['Pending Teacher Payouts', 'Vendor Unpaid Bills', 'Student Security Deposit', 'Short-Term Facility Advance']
        }
    ]
};

export default function AddTransactionModal({
    isOpen,
    onClose,
    onSuccess,
    defaultType = 'expense'
}: AddTransactionModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form fields
    const [type, setType] = useState<'income' | 'expense' | 'asset' | 'liability'>(defaultType);
    const [categoryGroup, setCategoryGroup] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentMode, setPaymentMode] = useState<'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'>('cash');
    const [vendorOrPayee, setVendorOrPayee] = useState('');
    const [payerType, setPayerType] = useState<'self' | 'other'>('self');
    const [voucherNo, setVoucherNo] = useState('');
    const [description, setDescription] = useState('');
    const [studentId, setStudentId] = useState<string | null>(null);

    // Synchronize default category on type change
    useEffect(() => {
        if (isOpen) {
            setType(defaultType);
            setPayerType('self');
            const groups = CATEGORY_MAP[defaultType] || [];
            if (groups.length > 0) {
                setCategoryGroup(groups[0].label);
                setSubCategory(groups[0].subcategories[0] || '');
            }
            // Auto generate voucher reference
            const year = new Date().getFullYear();
            const rnd = Math.floor(1000 + Math.random() * 9000);
            setVoucherNo(`VCH-${year}-${rnd}`);
        }
    }, [isOpen, defaultType]);

    // Update subcategories when categoryGroup changes
    const currentGroupObj = (CATEGORY_MAP[type] || []).find(g => g.label === categoryGroup);
    const availableSubcategories = currentGroupObj?.subcategories || [];

    const handleTypeSwitch = (newType: 'income' | 'expense' | 'asset' | 'liability') => {
        setType(newType);
        if (newType === 'income') {
            setPayerType('self');
        } else {
            setStudentId(null);
        }
        const groups = CATEGORY_MAP[newType] || [];
        if (groups.length > 0) {
            setCategoryGroup(groups[0].label);
            setSubCategory(groups[0].subcategories[0] || '');
        } else {
            setCategoryGroup('');
            setSubCategory('');
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (amount <= 0) {
            showToast('Please enter a valid transaction amount.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const finalDescription = [
                vendorOrPayee ? `Payee/Vendor: ${vendorOrPayee}` : '',
                description ? description : ''
            ].filter(Boolean).join(' | ');

            await financeService.addTransaction({
                transaction_date: transactionDate,
                type,
                category: categoryGroup,
                sub_category: subCategory || null,
                amount,
                payment_mode: paymentMode,
                description: finalDescription || null,
                student_id: studentId,
                remarks: voucherNo ? `Voucher: ${voucherNo}` : null
            });

            showToast(`${type.toUpperCase()} transaction of ₹${amount.toLocaleString()} added successfully!`, 'success');
            onSuccess();
            onClose();

            // Reset
            setAmount(0);
            setVendorOrPayee('');
            setDescription('');
            setStudentId(null);
        } catch (error) {
            console.error('Error adding transaction:', error);
            showToast('Failed to add transaction. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border
                            ${type === 'income'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : type === 'expense'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                    : type === 'asset'
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}
                        >
                            <BuildingBank size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Institution Transaction</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Institutional accounts, tax voucher & ledger entry</p>
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
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                    {/* Type Selector Tabs */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                            Transaction Classification *
                        </label>
                        <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
                            {(['expense', 'income', 'asset', 'liability'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTypeSwitch(t)}
                                    className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${type === t
                                        ? t === 'expense'
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : t === 'income'
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : t === 'asset'
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-amber-600 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <CurrencyRupee size={14} className="text-indigo-500" />
                                Amount (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={amount || ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <Calendar size={14} className="text-indigo-500" />
                                Transaction Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Category & Subcategory */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Ledger Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={categoryGroup}
                                onChange={(e) => {
                                    setCategoryGroup(e.target.value);
                                    const grp = (CATEGORY_MAP[type] || []).find(g => g.label === e.target.value);
                                    setSubCategory(grp?.subcategories[0] || '');
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            >
                                {(CATEGORY_MAP[type] || []).map((grp) => (
                                    <option key={grp.label} value={grp.label}>{grp.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Subcategory / Head
                            </label>
                            <select
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            >
                                {availableSubcategories.map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Income Payer Workflow vs Expense/Asset/Liability Payee */}
                    {type === 'income' ? (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Source / Payer Type <span className="text-emerald-500 font-normal">(Auto-selected: Student Self)</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPayerType('self');
                                            setVendorOrPayee('');
                                        }}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            payerType === 'self'
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>👤</span>
                                        <span>Student (Self)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPayerType('other');
                                            setStudentId(null);
                                        }}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            payerType === 'other'
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>🏢</span>
                                        <span>Other Payer / Entity</span>
                                    </button>
                                </div>
                            </div>

                            {payerType === 'self' ? (
                                <div>
                                    <StudentSearch
                                        onSelect={(student) => {
                                            setStudentId(student.id);
                                            setVendorOrPayee(student.full_name);
                                        }}
                                        label="Link Student (Type Name or ID Last 3 Digits)"
                                        placeholder="Type student name or last 3 digits of ID..."
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Payer Name / Source Organization <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorOrPayee}
                                        onChange={(e) => setVendorOrPayee(e.target.value)}
                                        placeholder="e.g. WB Govt Scholarship, Trust Fund, Sponsor, Bank"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Payee / Vendor / Person <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorOrPayee}
                                        onChange={(e) => setVendorOrPayee(e.target.value)}
                                        placeholder={categoryGroup === 'Faculty & Staff Salaries' ? 'Staff / Teacher Name' : 'e.g. WBSEDCL, Computer Care'}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Voucher / Invoice Ref No.
                                    </label>
                                    <input
                                        type="text"
                                        value={voucherNo}
                                        onChange={(e) => setVoucherNo(e.target.value)}
                                        placeholder="VCH-2026-001"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {type === 'expense' && categoryGroup === 'Faculty & Staff Salaries' && (
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                                    <span className="text-base leading-none">ℹ️</span>
                                    <span>
                                        <strong>Staff Salary Workflow:</strong> Formal payslip generation, pending salary status, and employee portal downloads are managed under the dedicated <strong>Payroll & Staff</strong> management workflow.
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Voucher Reference (if income) and Payment Mode */}
                    <div className="grid grid-cols-2 gap-4">
                        {type === 'income' ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Voucher / Receipt Ref No.
                                </label>
                                <input
                                    type="text"
                                    value={voucherNo}
                                    onChange={(e) => setVoucherNo(e.target.value)}
                                    placeholder="VCH-2026-001"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:border-indigo-500 outline-none"
                                />
                            </div>
                        ) : null}

                        <div className={type !== 'income' ? 'col-span-2' : ''}>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Payment Mode <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value as any)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-indigo-500 outline-none"
                            >
                                <option value="cash">Cash In Hand</option>
                                <option value="online">Online / UPI (Google Pay, PhonePe)</option>
                                <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS/IMPS)</option>
                                <option value="cheque">Bank Cheque</option>
                                <option value="other">Other Mode</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes / Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Transaction Notes / Narrative
                        </label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detailed itemization, bill particulars, remarks..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-indigo-500 outline-none resize-none"
                        />
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
                            disabled={loading || amount <= 0}
                            className={`flex-1 py-3 px-4 rounded-xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${type === 'expense'
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
                                : type === 'income'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} />
                                    <span>Record {type.toUpperCase()} (₹{amount.toLocaleString()})</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
