import React, { useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    helperText?: string
    errorText?: string
    leftElement?: React.ReactNode
    rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    helperText,
    errorText,
    leftElement,
    rightElement,
    id,
    disabled,
    required,
    className = '',
    ...props
}, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    const hasError = Boolean(errorText)

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                    {label}
                    {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {leftElement && (
                    <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                        {leftElement}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError ? 'true' : 'false'}
                    aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
                    className={`
                        w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors
                        placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                        dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-offset-slate-950
                        ${leftElement ? 'pl-10' : ''}
                        ${rightElement ? 'pr-10' : ''}
                        ${hasError
                            ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-700 dark:text-rose-100'
                            : 'border-slate-300 hover:border-slate-400 focus:border-[#2572AB] focus:ring-[#2572AB]/20 dark:border-slate-700 dark:hover:border-slate-600 dark:focus:border-[#4C96C2]'
                        }
                        ${className}
                    `}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute right-3.5 flex items-center text-slate-400">
                        {rightElement}
                    </div>
                )}
            </div>

            {hasError ? (
                <p id={errorId} className="text-xs text-rose-600 dark:text-rose-400 font-medium" role="alert">
                    {errorText}
                </p>
            ) : helperText ? (
                <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            ) : null}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
