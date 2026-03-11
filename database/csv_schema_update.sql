-- Add new Enums and Columns for CSV Compatibility

-- 1. Extend Transaction Type (If not already supported, usually tricky in Postgres Enums, but we can check or create new text fields)
-- Suggestion: We'll stick to 'income', 'expense' but add 'asset', 'liability' if the user hasn't already.
-- Postgres doesn't easily support IF NOT EXISTS for enum values in a single block without DO block.
DO $$
BEGIN
    ALTER TYPE transaction_type ADD VALUE 'asset';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE transaction_type ADD VALUE 'liability';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Payment Mode Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_mode_type') THEN
        CREATE TYPE payment_mode_type AS ENUM ('cash', 'online', 'bank_transfer', 'cheque', 'other');
    END IF;
END $$;

-- 3. Update institution_transactions table
-- Add 'payment_mode' matching the CSV
ALTER TABLE institution_transactions 
ADD COLUMN IF NOT EXISTS payment_mode payment_mode_type DEFAULT 'cash';

-- Add 'sub_category' to store 'Item' from CSV (Room Rent, Fooding, etc.)
ALTER TABLE institution_transactions 
ADD COLUMN IF NOT EXISTS sub_category text;

-- Add 'transaction_date' is already there, check if it needs index
CREATE INDEX IF NOT EXISTS idx_transactions_date ON institution_transactions(transaction_date);

-- 4. Create a specialized View for Balance Sheet (Optional but helpful)
CREATE OR REPLACE VIEW balance_sheet_view AS
SELECT 
    EXTRACT(YEAR FROM transaction_date) as year,
    EXTRACT(MONTH FROM transaction_date) as month,
    type,
    category,
    SUM(amount) as total_amount
FROM institution_transactions
GROUP BY 1, 2, 3, 4;
