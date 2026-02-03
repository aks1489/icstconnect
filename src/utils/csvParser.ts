import type { Database } from '../types/supabase';

type TransactionInsert = Database['public']['Tables']['institution_transactions']['Insert'];

export const parseBalanceSheetCSV = (csvContent: string): TransactionInsert[] => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Headers: Date, Item, Recive Transaction Type, Mode, Recived, Payment, Balance, Description
    // We assume the strict format provided in the user's file.

    const transactions: TransactionInsert[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Handle CSV split (simple split by comma, might need regex if quotes used)
        // The user's CSV likely doesn't have complex quotes based on "Item" usually being simple text.
        // But for safety, let's assume standard CSV. 
        // Since we don't have a library, we'll try a regex split or just simple split if confident.
        // Let's use a regex that handles quoted fields.
        // const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        // Actually, simple split is risky. Let's try a robust split.
        // Or better: Use a simple split but warn if length mismatch.

        // Simple mapping based on known columns:
        // 0: Date
        // 1: Item (Sub Category)
        // 2: Recive Transaction Type
        // 3: Mode
        // 4: Recived (Income/Asset)
        // 5: Payment (Expense/Liability)
        // 6: Balance (Ignore)
        // 7: Description (Remarks)

        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        if (cols.length < 6) continue; // Skip malformed lines

        const dateStr = cols[0]; // DD/MM/YYYY or DD-MM-YYYY
        const item = cols[1];
        const rawType = cols[2];
        const mode = cols[3];
        const receivedAmount = parseFloat(cols[4]) || 0;
        const paidAmount = parseFloat(cols[5]) || 0;
        const desc = cols[7] || '';

        // Parse Date
        let transactionDate = new Date().toISOString();
        try {
            const [day, month, year] = dateStr.split(/[-/]/);
            if (day && month && year) {
                transactionDate = new Date(`${year}-${month}-${day}`).toISOString();
            }
        } catch (e) {
            console.error('Invalid date:', dateStr);
        }

        // Map Payment Mode
        let paymentMode: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other' = 'cash';
        const lowerMode = mode.toLowerCase();
        if (lowerMode.includes('online') || lowerMode.includes('upi')) paymentMode = 'online';
        else if (lowerMode.includes('bank')) paymentMode = 'bank_transfer';
        else if (lowerMode.includes('cheque')) paymentMode = 'cheque';

        // Logic for Type and Category (from PAYMENT_README)
        let type: 'income' | 'expense' | 'asset' | 'liability' = 'expense';
        let category = 'Operational';

        if (rawType.toLowerCase().includes('admission') || rawType.toLowerCase().includes('emi')) {
            type = 'income';
            category = 'Fees';
        } else if (rawType.toLowerCase().includes('expance')) {
            type = 'expense';
            category = 'Operational';
        } else if (rawType.toLowerCase().includes('invest')) {
            // Investment could be expense (outflow) or asset (if tracking value). 
            // CSV logic: If "Recived" > 0, it's return on investment (Income). 
            // If "Payment" > 0, it's making an investment (Asset or Expense).
            // Let's assume 'Asset' for tracking.
            if (paidAmount > 0) type = 'asset';
            else type = 'income'; // Return
            category = 'Investment';
        } else if (rawType.toLowerCase().includes('takeout')) {
            // Withdrawal
            type = 'liability'; // Or 'equity' draw, but liability is closest prompt option
            category = 'Withdrawal';
        }

        const amount = receivedAmount > 0 ? receivedAmount : paidAmount;

        if (amount > 0) {
            transactions.push({
                transaction_date: transactionDate,
                type,
                category,
                sub_category: item,
                amount,
                payment_mode: paymentMode,
                description: desc
            });
        }
    }

    return transactions;
};
