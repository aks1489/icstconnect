import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    size?: 'sm' | 'md'
    dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = '',
    ...props
}) => {
    const sizeStyles = {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-1 gap-1.5'
    }

    const variantStyles = {
        primary: 'bg-[#2572AB]/10 text-[#1E5E91] border-[#2572AB]/20 dark:bg-[#4C96C2]/15 dark:text-[#78A5C5] dark:border-[#4C96C2]/30',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }

    const dotColors = {
        primary: 'bg-[#2572AB]',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        info: 'bg-sky-500',
        neutral: 'bg-slate-400'
    }

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full border
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                ${className}
            `}
            {...props}
        >
            {dot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
                    aria-hidden="true"
                />
            )}
            <span>{children}</span>
        </span>
    )
}

export default Badge
