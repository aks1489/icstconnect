-- ==============================================================================
-- ICST CONNECT: Multi-Role Staff, Institutional Payroll & Super Admin Migration
-- ==============================================================================

-- 1. Upgrade profiles role check constraint & employee columns
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'teacher', 'admin', 'super_admin', 'receptionist', 'lab_assistant', 'maintenance'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;

-- 2. Enhanced User Registration Trigger supporting Staff & Employee IDs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, teacher_id, employee_id, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'teacher_id', new.raw_user_meta_data->>'employee_id'),
    COALESCE(new.raw_user_meta_data->>'employee_id', new.raw_user_meta_data->>'teacher_id'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    employee_id = COALESCE(EXCLUDED.employee_id, public.profiles.employee_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Staff Payroll & Payslips Table
CREATE TABLE IF NOT EXISTS public.staff_payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_role TEXT NOT NULL,
    pay_period_month INT NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
    pay_period_year INT NOT NULL CHECK (pay_period_year >= 2020),
    basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'bank_transfer',
    payment_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    voucher_no TEXT UNIQUE,
    transaction_id UUID REFERENCES public.institution_transactions(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_staff_payslips_employee ON public.staff_payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_payslips_period ON public.staff_payslips(pay_period_year, pay_period_month);
CREATE INDEX IF NOT EXISTS idx_staff_payslips_status ON public.staff_payslips(status);

-- 4. Row Level Security (RLS)
ALTER TABLE public.staff_payslips ENABLE ROW LEVEL SECURITY;

-- Super Admin has full control
DROP POLICY IF EXISTS "Super admin full access on payslips" ON public.staff_payslips;
CREATE POLICY "Super admin full access on payslips"
  ON public.staff_payslips FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Admin has operational access
DROP POLICY IF EXISTS "Admin operational access on payslips" ON public.staff_payslips;
CREATE POLICY "Admin operational access on payslips"
  ON public.staff_payslips FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Employees can view their own payslips
DROP POLICY IF EXISTS "Employees can view own payslips" ON public.staff_payslips;
CREATE POLICY "Employees can view own payslips"
  ON public.staff_payslips FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- 5. Promote akash.sarkar1489@gmail.com to Super Admin (Owner & Lead Dev)
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'akash.sarkar1489@gmail.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"super_admin"'
)
WHERE email = 'akash.sarkar1489@gmail.com';

