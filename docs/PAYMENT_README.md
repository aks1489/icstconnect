# Financial & Payment System Documentation

## Overview
This document outlines the architecture and workflow of the Financial System in ICST Connect. The system is designed to handle Institutional Transactions (Balance Sheet) and Student Fees in a unified manner.

## 1. Database Schema

### `student_fees`
Stores the configured fee structure for a specific student-course enrollment.
- **base_fee**: The standard course fee.
- **admission_fee**: The one-time admission fee.
- **discounts**: `discount_on_base`, `discount_on_admission`.
- **payment_plan**: `monthly` or `one_time`.
- **monthly_due_day**: The day of the month when payments are expected (Default: 5th).

### `fee_payments`
Records individual payments made by students.
- Linked to `student_fees`.
- **payment_method**: Cash, Online (UPI), Bank Transfer.
- **status**: Updates the parent `student_fees` status/balance.

### `institution_transactions`
The central ledger for the institution (Balance Sheet).
- **Categories**:
    - `Income`: General income, Student Fees (linked).
    - `Expense`: Operational costs (Rent, Bills, Salaries).
    - `Asset`: Investments, Equipment.
    - `Liability`: Loans, "Takeout" (Withdrawals).
- **New Fields for CSV Compatibility**:
    - `payment_mode`: Matches CSV 'Mode' (e.g., 'Online (UPI)', 'Cash').
    - `sub_category`: Captures specific items like 'Fooding', 'Room Rent'.

## 2. Fee Assignment Workflow
When enrolling a student in a course via the Admin Panel:

1.  **Select Course & Batch**: Choose the academic target.
2.  **Fee Audit Modal**: A dialog appears before confirmation.
    -   *Logic*: The system fetches the Course's default fee.
    -   *Action*: Admin can override the Base Fee, add Admission Fee, and apply Discounts.
    -   *Plan*: Select 'Monthly' (set due date) or 'One-Time'.
3.  **Confirm**: Creates both `enrollments` and `student_fees` records atomically.

## 3. CSV Data Import Logic
To support legacy data from Google Sheets/CSV:

| CSV Column | Database Field | Logic |
| :--- | :--- | :--- |
| `Date` | `transaction_date` | Date parsing (DD/MM/YYYY) |
| `Item` | `sub_category` | stored as text |
| `Recive Transaction Type` | `category` + `type` | Mapped below |
| `Mode` | `payment_mode` | 'Online (UPI)' -> 'online', 'Cash' -> 'cash' |
| `Recived` | `amount` | If present, Type = `income` |
| `Payment` | `amount` | If present, Type = `expense` |

### Category Mapping
- **Admission / EMI** $\rightarrow$ Category: `Fees`, Type: `income`.
- **Expance** $\rightarrow$ Category: `Operational`, Type: `expense`.
- **Invest** $\rightarrow$ Category: `Investment`, Type: `asset` (or `expense` if outflow).
- **Takeout** $\rightarrow$ Category: `Withdrawal`, Type: `liability` (or `income` if inflow).

## 4. Gentle Payment Reminders (Psychological UI)
The student-facing UI uses color-coded cards and soft language to encourage payments without pressure:
- **Upcoming (Green/Blue)**: "Your next payment is coming up on [Date]."
- **Due (Orange)**: "A friendly reminder that fees are due today."
- **Overdue (Red)**: "It seems we missed a payment. Please clear it at your earliest convenience."

## Future Extensions
- Automatic generation of `institution_transactions` when a `fee_payment` is recorded.
- PDF Receipt generation.
