export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            student_fees: {
                Row: {
                    id: string
                    student_id: string
                    course_id: number | null
                    base_fee: number
                    admission_fee: number
                    discount_on_base: number
                    discount_on_admission: number
                    final_total_fee: number
                    payment_plan: 'one_time' | 'monthly'
                    monthly_installment_amount: number | null
                    monthly_due_day: number
                    next_payment_due_date: string | null
                    status: 'pending' | 'partial' | 'paid' | 'overdue'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    course_id?: number | null
                    base_fee?: number
                    admission_fee?: number
                    discount_on_base?: number
                    discount_on_admission?: number
                    payment_plan?: 'one_time' | 'monthly'
                    monthly_installment_amount?: number | null
                    monthly_due_day?: number
                    next_payment_due_date?: string | null
                    status?: 'pending' | 'partial' | 'paid' | 'overdue'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    course_id?: number | null
                    base_fee?: number
                    admission_fee?: number
                    discount_on_base?: number
                    discount_on_admission?: number
                    payment_plan?: 'one_time' | 'monthly'
                    monthly_installment_amount?: number | null
                    monthly_due_day?: number
                    next_payment_due_date?: string | null
                    status?: 'pending' | 'partial' | 'paid' | 'overdue'
                    created_at?: string
                    updated_at?: string
                }
            }
            fee_payments: {
                Row: {
                    id: string
                    student_fee_id: string
                    student_id: string
                    amount_paid: number
                    payment_date: string
                    payment_method: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    transaction_reference: string | null
                    remarks: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    student_fee_id: string
                    student_id: string
                    amount_paid: number
                    payment_date?: string
                    payment_method: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    transaction_reference?: string | null
                    remarks?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    student_fee_id?: string
                    student_id?: string
                    amount_paid?: number
                    payment_date?: string
                    payment_method?: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    transaction_reference?: string | null
                    remarks?: string | null
                    created_at?: string
                }
            }
            institution_transactions: {
                Row: {
                    id: string
                    transaction_date: string
                    type: 'income' | 'expense' | 'asset' | 'liability'
                    category: string
                    sub_category: string | null
                    amount: number
                    description: string | null
                    payment_mode: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    related_payment_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_date?: string
                    type: 'income' | 'expense' | 'asset' | 'liability'
                    category: string
                    sub_category?: string | null
                    amount: number
                    description?: string | null
                    payment_mode?: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    related_payment_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_date?: string
                    type?: 'income' | 'expense' | 'asset' | 'liability'
                    category?: string
                    sub_category?: string | null
                    amount?: number
                    description?: string | null
                    payment_mode?: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other'
                    related_payment_id?: string | null
                    created_at?: string
                }
            }
            // ... existing tables generic
        }
        Views: {
            [key: string]: any
        }
        Functions: {
            [key: string]: any
        }
        Enums: {
            [key: string]: any
        }
    }
}
