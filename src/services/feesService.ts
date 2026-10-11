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

    async upsertFeeStructure(feeData: StudentFeeInsert & { id?: string }) {
        if (feeData.id) {
            const { data, error } = await supabase
                .from('student_fees')
                .update(feeData)
                .eq('id', feeData.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Check if existing fee record exists for this student
        const { data: existing } = await supabase
            .from('student_fees')
            .select('id')
            .eq('student_id', feeData.student_id)
            .limit(1)
            .maybeSingle();

        if (existing?.id) {
            const { data, error } = await supabase
                .from('student_fees')
                .update(feeData)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

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
          student:profiles(full_name, email, phone),
          course:courses(id, course_name, fees)
        `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // --- Payments ---

    async recordPayment(paymentData: FeePaymentInsert) {
        const { data: payment, error: paymentError } = await supabase
            .from('fee_payments')
            .insert(paymentData)
            .select()
            .single();

        if (paymentError) throw paymentError;
        return payment;
    },

    async collectFeeAndSyncTransaction(payload: {
        studentId: string;
        studentName: string;
        studentFeeId?: string;
        courseId?: number | null;
        courseName?: string;
        amount: number;
        paymentDate: string;
        paymentMethod: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other';
        receiptNo?: string;
        monthAllocated?: string;
        remarks?: string;
    }) {
        let feeId = payload.studentFeeId;
        let expectedTotal = payload.amount;

        // 1. Ensure a student_fees row exists
        if (!feeId) {
            const { data: existingFee } = await supabase
                .from('student_fees')
                .select('id, final_total_fee')
                .eq('student_id', payload.studentId)
                .limit(1)
                .maybeSingle();

            if (existingFee) {
                feeId = existingFee.id;
                expectedTotal = existingFee.final_total_fee || payload.amount;
            } else {
                const { data: newFee, error: createFeeError } = await supabase
                    .from('student_fees')
                    .insert({
                        student_id: payload.studentId,
                        course_id: payload.courseId || null,
                        base_fee: payload.amount,
                        admission_fee: 0,
                        discount_on_base: 0,
                        discount_on_admission: 0,
                        payment_plan: 'monthly',
                        status: 'partial'
                    })
                    .select()
                    .single();

                if (createFeeError) throw createFeeError;
                feeId = newFee.id;
                expectedTotal = newFee.final_total_fee || payload.amount;
            }
        }

        // 2. Insert into fee_payments
        const remarksWithDetails = [
            payload.monthAllocated ? `[${payload.monthAllocated}]` : '',
            payload.receiptNo ? `Receipt: ${payload.receiptNo}` : '',
            payload.remarks || ''
        ].filter(Boolean).join(' ');

        const { data: feePayment, error: paymentError } = await supabase
            .from('fee_payments')
            .insert({
                student_fee_id: feeId,
                student_id: payload.studentId,
                amount_paid: payload.amount,
                payment_date: payload.paymentDate,
                payment_method: payload.paymentMethod,
                transaction_reference: payload.receiptNo || null,
                remarks: remarksWithDetails || null
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        // 3. Automatically record in institution_transactions (Balance Sheet Income)
        const { error: txError } = await supabase
            .from('institution_transactions')
            .insert({
                transaction_date: payload.paymentDate,
                type: 'income',
                category: 'Student Fees',
                sub_category: payload.monthAllocated || 'Tuition Fee',
                amount: payload.amount,
                payment_mode: payload.paymentMethod,
                student_id: payload.studentId,
                related_payment_id: feePayment.id,
                description: `Fee collected from ${payload.studentName}${payload.courseName ? ` (${payload.courseName})` : ''}`,
                remarks: payload.receiptNo ? `Receipt #${payload.receiptNo}` : (payload.remarks || null)
            });

        if (txError) console.warn('Sync to institution_transactions warning:', txError);

        // 4. Update status in student_fees
        const { data: allStudentPayments } = await supabase
            .from('fee_payments')
            .select('amount_paid')
            .eq('student_fee_id', feeId);

        const totalPaid = (allStudentPayments || []).reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
        const newStatus = totalPaid >= expectedTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';

        await supabase
            .from('student_fees')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', feeId);

        return { feePayment, feeId, totalPaid, newStatus };
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
