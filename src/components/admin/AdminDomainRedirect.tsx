import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SEOHead from '../common/SEOHead'

/**
 * When accessed from the production main domain (icstconnect.in / www.icstconnect.in),
 * redirects navigation attempts for `/admin` or `/admin/*` to `https://admin.icstconnect.in`.
 */
export default function AdminDomainRedirect() {
  const location = useLocation()

  useEffect(() => {
    const rawSubpath = location.pathname.replace(/^\/admin/, '') || '/'
    const targetUrl = `https://admin.icstconnect.in${rawSubpath}${location.search}${location.hash}`
    window.location.replace(targetUrl)
  }, [location])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-inter">
      <SEOHead
        title="Redirecting to Admin Portal - ICST Connect"
        description="Redirecting to the secure ICST Connect Administrative Portal."
        noindex={true}
      />
      <div className="text-center space-y-4 p-8 max-w-md w-full">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-white rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white">Redirecting to Admin Portal</h1>
          <p className="text-xs text-slate-400">Taking you to admin.icstconnect.in...</p>
        </div>
      </div>
    </div>
  )
}
