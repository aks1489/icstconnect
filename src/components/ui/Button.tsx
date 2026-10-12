import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    className = '',
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const sizeStyles = {
        sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
        md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
        lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[48px]'
    }

    const variantStyles = {
        primary: 'bg-[#2572AB] hover:bg-[#1E5E91] active:bg-[#184F7B] text-white shadow-sm hover:shadow focus-visible:ring-[#2572AB] dark:bg-[#2572AB] dark:hover:bg-[#1E5E91]',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus-visible:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
        outline: 'border border-slate-300 hover:border-[#2572AB] hover:bg-slate-50 text-slate-700 focus-visible:ring-[#2572AB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-500'
    }

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : leftIcon ? (
                <span className="shrink-0">{leftIcon}</span>
            ) : null}
            <span>{children}</span>
            {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
