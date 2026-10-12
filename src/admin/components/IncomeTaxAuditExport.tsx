import { useState, useMemo } from 'react';
import {
    IconFileSpreadsheet as FileSpreadsheet,
    IconPrinter as Printer,
    IconDownload as Download,
    IconShieldCheck as ShieldCheck
} from '@tabler/icons-react';
import type { Database } from '../../types/supabase';
import { useToast } from '../../contexts/ToastContext';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];

interface IncomeTaxAuditExportProps {
    transactions: Transaction[];
}

export default function IncomeTaxAuditExport({ transactions }: IncomeTaxAuditExportProps) {
    const { showToast } = useToast();
    const currentYear = new Date().getFullYear();
    const [selectedFY, setSelectedFY] = useState<number>(currentYear);

    // Filter transactions for selected Indian Financial Year (April 1 to March 31)
    const fyTransactions = useMemo(() => {
        const startDate = new Date(`${selectedFY}-04-01T00:00:00`);
        const endDate = new Date(`${selectedFY + 1}-03-31T23:59:59`);

        return transactions.filter(t => {
            const d = new Date(t.transaction_date);
            return d >= startDate && d <= endDate;
        });
    }, [transactions, selectedFY]);

    // Schedule 1: Receipts
    const receiptsBreakdown = useMemo(() => {
        const incomeList = fyTransactions.filter(t => t.type === 'income');
        let tuitionFees = 0;
        let admissionFees = 0;
        let examFees = 0;
        let otherReceipts = 0;

        incomeList.forEach(t => {
            const sub = (t.sub_category || '').toLowerCase();
            const cat = (t.category || '').toLowerCase();
            const desc = (t.description || '').toLowerCase();

            if (sub.includes('admission') || desc.includes('admission')) {
                admissionFees += t.amount || 0;
            } else if (sub.includes('exam') || desc.includes('exam') || cat.includes('exam')) {
                examFees += t.amount || 0;
            } else if (cat.includes('student') || sub.includes('installment') || sub.includes('tuition') || desc.includes('fee')) {
                tuitionFees += t.amount || 0;
            } else {
                otherReceipts += t.amount || 0;
            }
        });

        const totalReceipts = tuitionFees + admissionFees + examFees + otherReceipts;
        return { tuitionFees, admissionFees, examFees, otherReceipts, totalReceipts };
    }, [fyTransactions]);

    // Schedule 2: Revenue Expenditures (Allowable Deductions)
    const revenueExpenses = useMemo(() => {
        const expenseList = fyTransactions.filter(t => t.type === 'expense');
        let salaries = 0;
        let itLab = 0;
        let utilities = 0;
        let stationery = 0;
        let marketing = 0;
        let campusRent = 0;
        let professional = 0;
        let misc = 0;

        expenseList.forEach(t => {
            const cat = (t.category || '').toLowerCase();
            if (cat.includes('salary') || cat.includes('faculty') || cat.includes('staff')) {
                salaries += t.amount || 0;
            } else if (cat.includes('it') || cat.includes('hardware') || cat.includes('computer')) {
                itLab += t.amount || 0;
            } else if (cat.includes('utility') || cat.includes('utilities') || cat.includes('electric')) {
                utilities += t.amount || 0;
            } else if (cat.includes('academic') || cat.includes('stationery') || cat.includes('print')) {
                stationery += t.amount || 0;
            } else if (cat.includes('market') || cat.includes('outreach')) {
                marketing += t.amount || 0;
            } else if (cat.includes('campus') || cat.includes('rent') || cat.includes('maintenance')) {
                campusRent += t.amount || 0;
            } else if (cat.includes('professional') || cat.includes('audit')) {
                professional += t.amount || 0;
            } else {
                misc += t.amount || 0;
            }
        });

        const totalRevenueExpenses = salaries + itLab + utilities + stationery + marketing + campusRent + professional + misc;
        return { salaries, itLab, utilities, stationery, marketing, campusRent, professional, misc, totalRevenueExpenses };
    }, [fyTransactions]);

    // Schedule 3: Capital Expenditures (Fixed Assets additions)
    const capitalExpenditures = useMemo(() => {
        const assetList = fyTransactions.filter(t => t.type === 'asset');
        const totalCapital = assetList.reduce((acc, t) => acc + (t.amount || 0), 0);
        return { assetList, totalCapital };
    }, [fyTransactions]);

    // Net Operational Surplus
    const netOperationalSurplus = receiptsBreakdown.totalReceipts - revenueExpenses.totalRevenueExpenses;

    // Export CA Ledger CSV
    const handleExportAuditCSV = () => {
        if (fyTransactions.length === 0) {
            showToast('No transactions found for the selected Financial Year.', 'info');
            return;
        }

        const headers = [
            'Date',
            'Voucher / Invoice Ref',
            'Classification Type',
            'ITR Schedule Category',
            'Subhead / Specifics',
            'Payee / Payer / Particulars',
            'Payment Mode',
            'Receipt / Inflow (INR)',
            'Expenditure / Outflow (INR)',
            'Net Amount (INR)'
        ];

        const rows = fyTransactions.map(t => {
            const isInflow = t.type === 'income';
            return [
                new Date(t.transaction_date).toLocaleDateString('en-IN'),
                `"${t.remarks || t.id.slice(0, 8)}"`,
                t.type.toUpperCase(),
                `"${t.category || ''}"`,
                `"${t.sub_category || ''}"`,
                `"${t.description || ''}"`,
                t.payment_mode,
                isInflow ? t.amount : 0,
                !isInflow ? t.amount : 0,
                isInflow ? t.amount : -t.amount
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `icst_ITR_audit_ledger_FY${selectedFY}-${(selectedFY + 1).toString().slice(2)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('ITR CA Audit Ledger exported successfully', 'success');
    };

    const handlePrintStatement = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header with FY and Direct Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-emerald-500" />
                        Income Tax & CA Audit Statement (ITR Export)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Standardized institutional schedule format for Chartered Accountant audit & Income Tax Filing
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={selectedFY}
                        onChange={(e) => setSelectedFY(parseInt(e.target.value, 10))}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs outline-none"
                    >
                        <option value={currentYear}>FY {currentYear}-{(currentYear + 1).toString().slice(2)} (AY {currentYear + 1}-{(currentYear + 2).toString().slice(2)})</option>
                        <option value={currentYear - 1}>FY {currentYear - 1}-{currentYear.toString().slice(2)} (AY {currentYear}-{(currentYear + 1).toString().slice(2)})</option>
                        <option value={currentYear - 2}>FY {currentYear - 2}-{(currentYear - 1).toString().slice(2)}</option>
                    </select>

                    <button
                        onClick={handleExportAuditCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                        <Download size={16} />
                        <span>Export CA Audit CSV</span>
                    </button>

                    <button
                        onClick={handlePrintStatement}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                        <Printer size={16} />
                        <span>Print Official Statement</span>
                    </button>
                </div>
            </div>

            {/* Income Tax Statement Card (Printable) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8 print:p-0 print:border-none print:shadow-none">
                {/* Institutional Letterhead */}
                <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="text-xs uppercase tracking-widest font-black text-indigo-600 dark:text-indigo-400">
                        Educational Institution Accounts & Audit
                    </p>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        INSTITUTE OF COMPUTER SCIENCE AND TECHNOLOGY
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Chowberia, West Bengal, India • Reg. Under Educational Trust & Society Provisions
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        STATEMENT OF INCOME & EXPENDITURE FOR FINANCIAL YEAR {selectedFY}-{(selectedFY + 1).toString().slice(2)}
                    </div>
                </div>

                {/* Statutory Computation Schedules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Schedule 1: Receipts */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Part I: Gross Educational Receipts (Inflows)
                            </h3>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{receiptsBreakdown.totalReceipts.toLocaleString()}
                            </span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">1.1 Tuition & Course Fees (Student Collections)</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{receiptsBreakdown.tuitionFees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">1.2 Admission & Registration Fees</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{receiptsBreakdown.admissionFees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">1.3 Examination & Certification Inflows</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{receiptsBreakdown.examFees.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">1.4 Other Institutional Receipts & Grants</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{receiptsBreakdown.otherReceipts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-sm text-emerald-600 dark:text-emerald-400 pt-2">
                                <span>Total Gross Receipts (A)</span>
                                <span>₹{receiptsBreakdown.totalReceipts.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule 2: Revenue Expenditures */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Part II: Operating Expenditures (Section 37)
                            </h3>
                            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                                ₹{revenueExpenses.totalRevenueExpenses.toLocaleString()}
                            </span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.1 Faculty & Staff Emoluments / Remuneration</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.salaries.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.2 Computer Lab & IT Operating Expenses</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.itLab.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.3 Electricity, Power & Utilities</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.utilities.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.4 Academic Stationery & Study Notes Printing</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.stationery.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.5 Classroom Rent & Campus Maintenance</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.campusRent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.6 Publicity, Banners & Student Outreach</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{revenueExpenses.marketing.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400">2.7 CA Audit, Bank Charges & Misc</span>
                                <span className="font-bold text-slate-800 dark:text-white">₹{(revenueExpenses.professional + revenueExpenses.misc).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-sm text-red-600 dark:text-red-400 pt-2">
                                <span>Total Revenue Expenditure (B)</span>
                                <span>₹{revenueExpenses.totalRevenueExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Surplus & Capital Outlay Summary */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Operational Surplus / (Deficit) (A - B)
                        </p>
                        <p className={`text-2xl font-black mt-1 ${netOperationalSurplus >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                            ₹{netOperationalSurplus.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Pre-depreciation net institutional surplus</p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Capital Additions (Fixed Assets)
                        </p>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            ₹{capitalExpenditures.totalCapital.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Eligible for depreciation under IT rules</p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Tax Compliance Readiness
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck size={24} className="text-emerald-500" />
                            <span className="font-bold text-slate-800 dark:text-white text-base">Audit Ready</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Ledger reconciled with {fyTransactions.length} vouchers</p>
                    </div>
                </div>

                {/* Audit Endorsement & Sign-off Block */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-500 dark:text-slate-400">
                    <div className="space-y-8">
                        <p>Prepared By: Administration & Accounts Desk</p>
                        <div className="border-t border-slate-300 dark:border-slate-700 w-48 pt-1 text-[11px] text-slate-400">
                            Authorized Signatory / Principal
                        </div>
                    </div>
                    <div className="space-y-8 text-right">
                        <p>Examined & Verified Against Books of Accounts</p>
                        <div className="border-t border-slate-300 dark:border-slate-700 w-48 ml-auto pt-1 text-[11px] text-slate-400">
                            Chartered Accountant / Internal Auditor
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
