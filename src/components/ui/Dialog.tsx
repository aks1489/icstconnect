import React, { useEffect, useRef } from 'react'
import { IconX } from '@tabler/icons-react'

export interface DialogProps {
    isOpen?: boolean
    open?: boolean
    onClose: () => void
    title?: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
    className?: string
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    open,
    onClose,
    title,
    description,
    children,
    maxWidth = 'lg',
    className = ''
}) => {
    const isDialogOpen = open !== undefined ? open : (isOpen ?? false)
    const dialogRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Escape listener & focus restoration
    useEffect(() => {
        if (!isDialogOpen) return

        previousActiveElement.current = document.activeElement as HTMLElement

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            if (previousActiveElement.current) {
                previousActiveElement.current.focus()
            }
        }
    }, [isDialogOpen, onClose])

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

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl'
    }

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            aria-describedby={description ? 'dialog-description' : undefined}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dialog Card */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                className={`
                    relative w-full ${maxWidthClasses[maxWidth]} my-8 p-6 rounded-2xl bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-800 shadow-2xl z-10
                    animate-in zoom-in-95 duration-200 focus:outline-none max-h-[90vh] flex flex-col
                    ${className}
                `}
            >
                {(title || description) && (
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div>
                            {title && (
                                <h3
                                    id="dialog-title"
                                    className="text-lg font-bold text-slate-900 dark:text-slate-100"
                                >
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p
                                    id="dialog-description"
                                    className="mt-1 text-sm text-slate-500 dark:text-slate-400"
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                            aria-label="Close dialog"
                        >
                            <IconX size={18} />
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto pt-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Dialog
