import { Navigate, useLocation } from 'react-router-dom'

/**
 * On the admin subdomain (admin.icstconnect.in), preserves backwards-compatibility
 * if a user or legacy link navigates to `/admin` or `/admin/...` by redirecting to `/` or `/...`.
 */
export default function AdminBackwardsCompatRedirect() {
  const location = useLocation()
  const rawSubpath = location.pathname.replace(/^\/admin/, '')
  const target = rawSubpath === '' ? '/' : rawSubpath
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />
}
