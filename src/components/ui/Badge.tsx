import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'tech' | 'navy'
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
        primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/80',
        tech: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30 shadow-xs dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/40',
        navy: 'bg-[#0A192F]/10 text-[#0A192F] border-[#0A192F]/20 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }

    const dotColors = {
        primary: 'bg-[#2563EB]',
        tech: 'bg-[#06B6D4]',
        navy: 'bg-[#0A192F] dark:bg-sky-400',
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
