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
                bg-white/95 border border-slate-200/80 shadow-sm
                /* Glass enhancement when supported */
                supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md
                /* Dark Mode */
                dark:bg-[#0F2440]/90 dark:border-slate-800/80
                dark:supports-[backdrop-filter]:bg-[#0F2440]/70 dark:supports-[backdrop-filter]:backdrop-blur-md
                /* Motion-safe interactive hover effect */
                ${hoverEffect ? 'motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:border-cyan-500/40 dark:hover:border-sky-400/50 dark:hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]' : ''}
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
