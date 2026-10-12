import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    elevated?: boolean
    interactive?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    children,
    elevated = false,
    interactive = false,
    className = '',
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={`
                rounded-2xl border border-slate-200/80 bg-white p-6 text-slate-900 transition-all duration-200
                dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100
                ${elevated ? 'shadow-md dark:shadow-slate-950/40' : 'shadow-xs'}
                ${interactive ? 'hover:border-slate-300 hover:shadow-md cursor-pointer dark:hover:border-slate-700' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    )
})

Card.displayName = 'Card'

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props} />
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
    <h3 className={`text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100 ${className}`} {...props} />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props} />
)

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`pt-0 ${className}`} {...props} />
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
    <div className={`mt-6 flex items-center pt-0 ${className}`} {...props} />
)

export default Card
