import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type StudentFee = Database['public']['Tables']['student_fees']['Row'];
type FeePayment = Database['public']['Tables']['fee_payments']['Row'];
type StudentFeeInsert = Database['public']['Tables']['student_fees']['Insert'];
type FeePaymentInsert = Database['public']['Tables']['fee_payments']['Insert'];

export const feesService = {
    // --- Student Fee Structure ---

    async assignFeeStructure(feeData: StudentFeeInsert) {
        const { data, error } = await supabase
            .from('student_fees')
            .insert(feeData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getStudentFeeByEnrollment(studentId: string, courseId: number) {
        const { data, error } = await supabase
            .from('student_fees')
            .select('*')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'Row not found'
        return data as StudentFee | null;
    },

    async getAllStudentFees() {
        const { data, error } = await supabase
            .from('student_fees')
            .select(`
          *,
          student:profiles(full_name, email, phone)
        `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // --- Payments ---

    async recordPayment(paymentData: FeePaymentInsert) {
        // 1. Insert Payment
        const { data: payment, error: paymentError } = await supabase
            .from('fee_payments')
            .insert(paymentData)
            .select()
            .single();

        if (paymentError) throw paymentError;

        // 2. Update Student Fee Status (Simple Logic for now)
        // We'll calculate totals later, for now just simple update if needed.
        // In a real app, we'd sum all payments and check against total.

        return payment;
    },

    async getPaymentsByStudent(studentId: string) {
        const { data, error } = await supabase
            .from('fee_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data as FeePayment[];
    },

    // --- Utility: Calculate Pending Amount ---
    async getOutstandingBalance(studentFeeId: string, expectedTotal: number) {
        const { data, error } = await supabase
            .from('fee_payments')
            .select('amount_paid')
            .eq('student_fee_id', studentFeeId);

        if (error) throw error;

        const totalPaid = data.reduce((sum, p) => sum + p.amount_paid, 0);
        return Math.max(0, expectedTotal - totalPaid);
    }
};
