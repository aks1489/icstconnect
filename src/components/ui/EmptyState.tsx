import React from 'react'
import { IconFolderOff } from '@tabler/icons-react'
import Button from './Button'

export interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    actionIcon?: React.ReactNode
    className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
    className = ''
}) => {
    return (
        <div
            role="status"
            className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2572AB]/10 dark:bg-[#4C96C2]/15 text-[#2572AB] dark:text-[#4C96C2] mb-4">
                {icon || <IconFolderOff size={28} />}
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                {title}
            </h3>

            {description && (
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="primary"
                    size="sm"
                    leftIcon={actionIcon}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}

export default EmptyState
