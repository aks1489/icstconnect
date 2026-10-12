import React from 'react'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(({
    children,
    hoverEffect = true,
    className = '',
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={`
                relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                /* Fallback solid surface if backdrop-filter is unsupported */
                bg-white/90 border border-slate-200/80 shadow-sm
                /* Glass enhancement when supported */
                supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-md
                /* Dark Mode */
                dark:bg-slate-900/90 dark:border-slate-800/80
                dark:supports-[backdrop-filter]:bg-slate-900/60 dark:supports-[backdrop-filter]:backdrop-blur-md
                /* Reduced Motion respects motion-safe */
                ${hoverEffect ? 'motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:border-[#2572AB]/30 dark:hover:border-[#4C96C2]/30' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    )
})

GlassCard.displayName = 'GlassCard'

export default GlassCard
