import React, { useEffect, useRef } from 'react'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'

export interface ConfirmDialogProps {
    open?: boolean
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning' | 'primary'
    onConfirm: () => void
    onCancel?: () => void
    isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    const isDialogOpen = open !== undefined ? open : (isOpen ?? false)
    const dialogRef = useRef<HTMLDivElement>(null)

    const handleConfirm = () => {
        onConfirm()
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        if (onOpenChange) onOpenChange(false)
    }

    // Keyboard support: Escape to dismiss
    useEffect(() => {
        if (!isDialogOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                handleCancel()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isDialogOpen, isLoading])

    // Body scroll lock
    useEffect(() => {
        if (isDialogOpen) {
            const originalOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = originalOverflow
            }
        }
    }, [isDialogOpen])

    if (!isDialogOpen) return null

    const getVariantClasses = () => {
        if (variant === 'danger') {
            return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
        }
        if (variant === 'warning') {
            return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
        }
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
    }

    return (
        <div
            className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={!isLoading ? handleCancel : undefined}
                aria-hidden="true"
            />

            {/* Dialog Panel */}
            <div
                ref={dialogRef}
                className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-in zoom-in-95 duration-200 focus:outline-none"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
                        <IconAlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3
                            id="confirm-dialog-title"
                            className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1"
                        >
                            {title}
                        </h3>
                        <p
                            id="confirm-dialog-description"
                            className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                        >
                            {description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                        aria-label="Close dialog"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2 ${getVariantClasses()}`}
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        <span>{confirmLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
