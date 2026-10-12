import React from 'react'
import { IconAlertTriangle, IconRotate } from '@tabler/icons-react'
import Button from './Button'

export interface ErrorStateProps {
    title?: string
    message?: string
    errorCode?: string
    onRetry?: () => void
    onReport?: () => void
    className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'An unexpected error occurred while loading this section.',
    errorCode = 'ICST-UI-ERR-001',
    onRetry,
    onReport,
    className = ''
}) => {
    return (
        <div
            role="alert"
            className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 ${className}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mb-3">
                <IconAlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                {title}
            </h3>

            <p className="max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
                {message}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 mb-5">
                <span>Code:</span>
                <span className="font-bold text-[#2572AB] dark:text-[#4C96C2]">{errorCode}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="primary"
                        size="sm"
                        leftIcon={<IconRotate size={16} />}
                    >
                        Try Again
                    </Button>
                )}
                {onReport && (
                    <Button
                        onClick={onReport}
                        variant="outline"
                        size="sm"
                    >
                        Report Issue
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ErrorState
