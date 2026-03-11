import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Transaction = Database['public']['Tables']['institution_transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['institution_transactions']['Insert'];

export const financeService = {
    async addTransaction(transaction: TransactionInsert) {
        const { data, error } = await supabase
            .from('institution_transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async importTransactions(transactions: TransactionInsert[]) {
        const { data, error } = await supabase
            .from('institution_transactions')
            .insert(transactions)
            .select();

        if (error) throw error;
        return data;
    },

    async getTransactions(filters?: { type?: string, startDate?: string, endDate?: string }) {
        let query = supabase
            .from('institution_transactions')
            .select('*')
            .order('transaction_date', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }
        if (filters?.startDate) {
            query = query.gte('transaction_date', filters.startDate);
        }
        if (filters?.endDate) {
            query = query.lte('transaction_date', filters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Transaction[];
    },

    async getDashboardStats() {
        // This logic is best done via RPC or View, but for now we fetch and aggregate.
        // Optimization: Use separate summary queries.

        // Fetch all (Not scalable long term, but fine for MVP)
        const { data, error } = await supabase
            .from('institution_transactions')
            .select('amount, type');

        if (error) throw error;

        const stats = {
            totalIncome: 0,
            totalExpense: 0,
            totalAssets: 0,
            totalLiabilities: 0
        };

        data.forEach(t => {
            if (t.type === 'income') stats.totalIncome += t.amount;
            if (t.type === 'expense') stats.totalExpense += t.amount;
            if (t.type === 'asset') stats.totalAssets += t.amount;
            if (t.type === 'liability') stats.totalLiabilities += t.amount;
        });

        return stats;
    },

    async deleteTransaction(id: string) {
        const { error } = await supabase
            .from('institution_transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getStudentPayments(studentId: string) {
        // Fetch all transactions linked to this student (Admission, EMI, etc.)
        const { data, error } = await supabase
            .from('institution_transactions')
            .select('*')
            .eq('student_id', studentId)
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
    },

    async getAllStudentPayments() {
        // Fetch specific payment types for the grid view
        const { data, error } = await supabase
            .from('institution_transactions')
            .select('*, student:profiles(full_name, id)')
            .in('category', ['Admission', 'EMI', 'Course Fee'])
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data;
    }
};
