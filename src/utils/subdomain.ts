/**
 * Utility functions for subdomain routing and environment detection.
 */

/**
 * Detects if the current hostname corresponds to the admin subdomain.
 * Matches if hostname starts with 'admin.' (e.g. admin.icstconnect.in, admin.localhost)
 * or equals 'admin.icstconnect.in'.
 */
export const isAdminSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname.toLowerCase()

  // Standard subdomain checks: starts with 'admin.' or exact match
  if (hostname.startsWith('admin.') || hostname === 'admin.icstconnect.in') {
    return true
  }

  // Developer preview override via sessionStorage (dev only)
  if (import.meta.env.DEV) {
    if (window.sessionStorage.getItem('dev_admin_subdomain') === 'true') {
      return true
    }
  }

  return false
}

/**
 * Checks if the current environment is running on the production main domain.
 */
export const isMainProductionDomain = (): boolean => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname.toLowerCase()
  return hostname === 'icstconnect.in' || hostname === 'www.icstconnect.in'
}

/**
 * Resolves an admin navigation path depending on whether the app is running
 * on the admin subdomain or under the /admin path prefix.
 */
export const resolveAdminPath = (path: string): string => {
  if (isAdminSubdomain()) {
    const stripped = path.replace(/^\/admin/, '')
    return stripped === '' ? '/' : stripped
  }
  return path.startsWith('/admin') ? path : `/admin${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Returns the admin base origin URL.
 */
export const getAdminOrigin = (): string => {
  if (typeof window === 'undefined') return ''
  if (isMainProductionDomain()) {
    return 'https://admin.icstconnect.in'
  }
  return window.location.origin
}
