import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'

export interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
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
    const handleConfirm = () => {
        onConfirm()
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        onOpenChange(false)
    }

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
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1200] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[1201] animate-in zoom-in-95 duration-200 focus:outline-none">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
                            <IconAlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {title}
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {description}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                aria-label="Close"
                            >
                                <IconX size={18} />
                            </button>
                        </Dialog.Close>
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
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default ConfirmDialog
