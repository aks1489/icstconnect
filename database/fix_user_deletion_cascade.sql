-- Drop the existing constraint
ALTER TABLE public.student_fees 
DROP CONSTRAINT IF EXISTS student_fees_student_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE public.student_fees
ADD CONSTRAINT student_fees_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix institution_transactions constraint if we want to delete transactions when a student is deleted. 
-- Alternatively, ON DELETE SET NULL can be used if you want to keep the transactions but unlink the user. 
-- Assuming CASCADE here to fully clean up student data on delete.
ALTER TABLE public.institution_transactions
DROP CONSTRAINT IF EXISTS institution_transactions_student_id_fkey;

ALTER TABLE public.institution_transactions
ADD CONSTRAINT institution_transactions_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
