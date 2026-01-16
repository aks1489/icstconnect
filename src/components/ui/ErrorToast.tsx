import { useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'

const ErrorToast = () => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check URL hash for errors (Supabase redirect)
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)) // remove #
      const errorDescription = params.get('error_description')
      // const errorCode = params.get('error_code')

      if (errorDescription) {
        // Wrap in setTimeout to avoid synchronous state update warning during render
        setTimeout(() => {
            setError(errorDescription.replace(/\+/g, ' '))
        }, 0)
        // Clear hash to prevent showing error on refresh
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-[1100] animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
        <AlertCircle className="mt-0.5 text-red-500 shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-sm">Authentication Error</h4>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600 transition-colors ml-auto"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

export default ErrorToast
