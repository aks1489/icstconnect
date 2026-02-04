import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast, type ToastType } from '../../contexts/ToastContext'
import { useEffect, useState } from 'react'

const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />
}

const styles = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    error: 'bg-red-50 border-red-100 text-red-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
    info: 'bg-blue-50 border-blue-100 text-blue-800'
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onDismiss }: { toast: any, onDismiss: () => void }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true))
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for exit animation
    }

    return (
        <div
            className={`
                pointer-events-auto transform transition-all duration-300 ease-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full
                ${styles[toast.type as ToastType] || styles.info}
            `}
        >
            <div className="shrink-0 mt-0.5">
                {icons[toast.type as ToastType] || icons.info}
            </div>
            <p className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={handleDismiss}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-black/5"
            >
                <X size={16} />
            </button>
        </div>
    )
}
