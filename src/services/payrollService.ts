import { supabase } from '../lib/supabase'
import { financeService } from './financeService'

export interface StaffPayslip {
    id: string
    employee_id: string
    employee_name: string
    employee_role: 'admin' | 'super_admin' | 'teacher' | 'receptionist' | 'lab_assistant' | 'maintenance' | string
    pay_period_month: number
    pay_period_year: number
    basic_salary: number
    allowances: number
    deductions: number
    net_salary: number
    payment_mode: 'bank_transfer' | 'cash' | 'cheque' | 'upi'
    payment_date: string | null
    status: 'pending' | 'approved' | 'paid' | 'cancelled'
    voucher_no: string
    transaction_id?: string | null
    remarks?: string | null
    created_at?: string
    updated_at?: string
}

export interface EmployeeRosterItem {
    id: string
    full_name: string
    email: string
    role: string
    employee_id?: string
    teacher_id?: string
    phone?: string
    avatar_url?: string
    designation?: string
    department?: string
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_SHORT = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
]

// Convert number to Indian Rupees format in words
export function numberToWordsINR(amount: number): string {
    const num = Math.floor(Math.abs(amount))
    if (num === 0) return 'Zero Rupees Only'

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
    const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety ']

    function inWords(n: number): string {
        let str = ''
        if (n > 19) {
            str += b[Math.floor(n / 10)] + a[n % 10]
        } else {
            str += a[n]
        }
        return str
    }

    let output = ''
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const hundred = Math.floor((num % 1000) / 100)
    const rest = num % 100

    if (crore > 0) output += inWords(crore) + 'Crore '
    if (lakh > 0) output += inWords(lakh) + 'Lakh '
    if (thousand > 0) output += inWords(thousand) + 'Thousand '
    if (hundred > 0) output += inWords(hundred) + 'Hundred '
    if (rest > 0) output += inWords(rest)

    return (output.trim() + ' Rupees Only').replace(/\s+/g, ' ')
}

export const payrollService = {
    getMonthName(monthNum: number): string {
        return MONTH_NAMES[monthNum - 1] || `Month ${monthNum}`
    },

    getMonthShort(monthNum: number): string {
        return MONTH_SHORT[monthNum - 1] || `M${monthNum}`
    },

    generateVoucherNo(year: number, month: number): string {
        const mon = payrollService.getMonthShort(month)
        const rand = Math.floor(100 + Math.random() * 900)
        return `PAY-${year}-${mon}-${rand}`
    },

    /**
     * Get all institutional staff across all roles (including Admin, Faculty, Receptionist, etc.)
     */
    async getAllEmployees(): Promise<EmployeeRosterItem[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, teacher_id, employee_id, phone, avatar_url, designation, department')
            .in('role', ['super_admin', 'admin', 'teacher', 'receptionist', 'lab_assistant', 'maintenance'])
            .order('role')
            .order('full_name')

        if (error) {
            console.error('Error fetching employees:', error)
            throw error
        }

        return (data || []).map(p => ({
            ...p,
            employee_id: p.employee_id || p.teacher_id || `EMP-${p.id.substring(0, 6).toUpperCase()}`
        }))
    },

    /**
     * Fetch payslips with optional filtering
     */
    async getAllPayslips(filters?: {
        month?: number
        year?: number
        status?: string
        role?: string
    }): Promise<StaffPayslip[]> {
        try {
            let query = supabase
                .from('staff_payslips')
                .select('*')
                .order('created_at', { ascending: false })

            if (filters?.month) {
                query = query.eq('pay_period_month', filters.month)
            }
            if (filters?.year) {
                query = query.eq('pay_period_year', filters.year)
            }
            if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status)
            }
            if (filters?.role && filters.role !== 'all') {
                query = query.eq('employee_role', filters.role)
            }

            const { data, error } = await query

            if (error) {
                console.warn('Could not query staff_payslips table:', error)
                return []
            }

            return (data || []) as StaffPayslip[]
        } catch (err) {
            console.warn('Error reading staff_payslips:', err)
            return []
        }
    },

    /**
     * Fetch payslips for a specific employee
     */
    async getPayslipsByEmployee(employeeId: string): Promise<StaffPayslip[]> {
        try {
            const { data, error } = await supabase
                .from('staff_payslips')
                .select('*')
                .eq('employee_id', employeeId)
                .order('pay_period_year', { ascending: false })
                .order('pay_period_month', { ascending: false })

            if (error) {
                console.warn('Error reading employee payslips:', error)
                return []
            }

            return (data || []) as StaffPayslip[]
        } catch (err) {
            console.warn('Error fetching payslips for employee:', err)
            return []
        }
    },

    /**
     * Create a new payslip record with Pending status
     */
    async createPayslip(payload: {
        employee_id: string
        employee_name: string
        employee_role: string
        pay_period_month: number
        pay_period_year: number
        basic_salary: number
        allowances?: number
        deductions?: number
        payment_mode: 'bank_transfer' | 'cash' | 'cheque' | 'upi'
        remarks?: string
        status?: 'pending' | 'approved' | 'paid'
    }): Promise<StaffPayslip> {
        const basic = Number(payload.basic_salary) || 0
        const allowances = Number(payload.allowances) || 0
        const deductions = Number(payload.deductions) || 0
        const net = Math.max(0, basic + allowances - deductions)
        const voucherNo = payrollService.generateVoucherNo(payload.pay_period_year, payload.pay_period_month)

        const insertPayload = {
            employee_id: payload.employee_id,
            employee_name: payload.employee_name,
            employee_role: payload.employee_role,
            pay_period_month: payload.pay_period_month,
            pay_period_year: payload.pay_period_year,
            basic_salary: basic,
            allowances: allowances,
            deductions: deductions,
            net_salary: net,
            payment_mode: payload.payment_mode || 'bank_transfer',
            status: payload.status || 'pending',
            voucher_no: voucherNo,
            payment_date: payload.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
            remarks: payload.remarks || null
        }

        const { data, error } = await supabase
            .from('staff_payslips')
            .insert(insertPayload)
            .select()
            .single()

        if (error) {
            console.error('Error creating payslip:', error)
            throw error
        }

        // If directly created as paid, log to institution transactions
        if (payload.status === 'paid') {
            await payrollService.syncPaidTransaction(data as StaffPayslip)
        }

        return data as StaffPayslip
    },

    /**
     * Change payslip status. When status is set to 'paid', log an expense transaction.
     */
    async updatePayslipStatus(
        id: string,
        status: 'pending' | 'approved' | 'paid' | 'cancelled',
        paymentDate?: string
    ): Promise<StaffPayslip> {
        // Fetch current payslip
        const { data: current, error: fetchErr } = await supabase
            .from('staff_payslips')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchErr) throw fetchErr

        const pDate = status === 'paid'
            ? (paymentDate || new Date().toISOString().split('T')[0])
            : (status === 'pending' ? null : current.payment_date)

        const { data: updated, error: updateErr } = await supabase
            .from('staff_payslips')
            .update({
                status,
                payment_date: pDate,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateErr) throw updateErr

        // When moving to paid, create an institutional expense transaction if not already logged
        if (status === 'paid' && !current.transaction_id) {
            await payrollService.syncPaidTransaction(updated as StaffPayslip)
        }

        return updated as StaffPayslip
    },

    /**
     * Helper to log an institutional expense transaction for disbursed salary
     */
    async syncPaidTransaction(payslip: StaffPayslip): Promise<void> {
        try {
            const monthName = payrollService.getMonthName(payslip.pay_period_month)
            const txDate = payslip.payment_date || new Date().toISOString().split('T')[0]

            const txPaymentMode: 'online' | 'cash' | 'bank_transfer' | 'cheque' | 'other' =
                payslip.payment_mode === 'upi' ? 'online' : (payslip.payment_mode as any)

            const tx = await financeService.addTransaction({
                type: 'expense',
                category: 'Faculty & Staff Salaries',
                sub_category: 'Staff Payroll Disbursal',
                amount: payslip.net_salary,
                payment_mode: txPaymentMode,
                transaction_date: txDate,
                description: `Monthly Salary: ${payslip.employee_name} (${payslip.employee_role.toUpperCase()}) - ${monthName} ${payslip.pay_period_year}`,
                remarks: `Payslip Voucher Ref: ${payslip.voucher_no}`
            })

            if (tx?.id) {
                await supabase
                    .from('staff_payslips')
                    .update({ transaction_id: tx.id })
                    .eq('id', payslip.id)
            }
        } catch (txErr) {
            console.error('Failed to auto-log payroll expense transaction:', txErr)
            // Non-blocking for the payslip update
        }
    },

    /**
     * Delete a payslip record
     */
    async deletePayslip(id: string): Promise<void> {
        const { error } = await supabase
            .from('staff_payslips')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
