import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Global Scroll Restoration and Scroll-to-Top Management
 * 
 * Rules enforced:
 * 1. When navigating to another page/route -> ALWAYS render from the top (top: 0).
 * 2. On refreshing the same page -> RESUME where the user left off.
 * 3. Fresh loads / initial landings -> ALWAYS start at top (top: 0).
 * 4. Applies across all public pages and portal views (handles window scroll
 *    and nested scrollable main containers).
 */

const STORAGE_LAST_PATH = 'icst_scroll_last_path'
const STORAGE_POS_PREFIX = 'icst_scroll_pos_'

interface ScrollPosition {
  windowY: number
  mainY: number
  timestamp: number
}

function getMainScrollContainers(): HTMLElement[] {
  if (typeof document === 'undefined') return []
  return Array.from(document.querySelectorAll<HTMLElement>('main, [data-scroll-container]'))
}

function getMainScrollTop(): number {
  const containers = getMainScrollContainers()
  for (const container of containers) {
    if (container.scrollTop > 0) {
      return container.scrollTop
    }
  }
  return 0
}

function scrollToTopInstant() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const originalBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = 'auto'

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  const containers = getMainScrollContainers()
  containers.forEach((container) => {
    container.scrollTop = 0
    container.scrollLeft = 0
  })

  // Restore scroll behavior on next frame
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = originalBehavior
  })
}

function isPageReload(): boolean {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return false
  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload'
    }
    // Fallback for older browsers
    const nav = (performance as unknown as { navigation?: { type: number } }).navigation
    if (nav) {
      return nav.type === 1 // TYPE_RELOAD
    }
  } catch {
    // Ignore error
  }
  return false
}

export default function ScrollToTop() {
  const location = useLocation()
  const currentPath = location.pathname + location.search
  const isFirstMountRef = useRef(true)
  const userInteractedRef = useRef(false)
  const prevPathRef = useRef<string | null>(null)

  // Configure history scroll restoration to manual so browser doesn't clobber React hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Save scroll position throttled & on unload
  useEffect(() => {
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null

    const savePosition = () => {
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return
      try {
        const windowY = window.scrollY || document.documentElement.scrollTop || 0
        const mainY = getMainScrollTop()
        const data: ScrollPosition = {
          windowY,
          mainY,
          timestamp: Date.now()
        }
        sessionStorage.setItem(STORAGE_LAST_PATH, currentPath)
        sessionStorage.setItem(STORAGE_POS_PREFIX + currentPath, JSON.stringify(data))
      } catch {
        // Ignore quota limits or storage exceptions
      }
    }

    const handleScroll = () => {
      userInteractedRef.current = true
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        savePosition()
        throttleTimeout = null
      }, 100)
    }

    const handleBeforeUnload = () => {
      savePosition()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  }, [currentPath])

  // Handle in-page navigation clicks on links pointing to current path
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // If it links to the current page without a hash or with "#" or "#top"
      const url = new URL(target.href, window.location.href)
      const isSamePage = url.origin === window.location.origin && url.pathname === location.pathname && url.search === location.search

      if (isSamePage && (!url.hash || url.hash === '#' || url.hash === '#top')) {
        scrollToTopInstant()
      }
    }

    document.addEventListener('click', handleDocumentClick, { capture: true })
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true })
  }, [location.pathname, location.search])

  // Primary scroll controller: runs before paint on mount and route changes
  useLayoutEffect(() => {
    const isFirstMount = isFirstMountRef.current
    isFirstMountRef.current = false

    if (isFirstMount) {
      // Check if this was a refresh on the same page
      const isReload = isPageReload()
      const lastPath = sessionStorage.getItem(STORAGE_LAST_PATH)
      const isSamePageReload = isReload && lastPath === currentPath

      if (isSamePageReload) {
        // RESUME WHERE LEFT: Retrieve saved position
        let savedPos: ScrollPosition | null = null
        try {
          const raw = sessionStorage.getItem(STORAGE_POS_PREFIX + currentPath)
          if (raw) savedPos = JSON.parse(raw)
        } catch {
          savedPos = null
        }

        if (savedPos && (savedPos.windowY > 0 || savedPos.mainY > 0)) {
          const targetWindowY = savedPos.windowY
          const targetMainY = savedPos.mainY

          let attempts = 0
          const maxAttempts = 30 // ~1.5s max polling while async content renders
          userInteractedRef.current = false

          const onUserAction = () => {
            userInteractedRef.current = true
          }
          window.addEventListener('wheel', onUserAction, { passive: true, once: true })
          window.addEventListener('touchstart', onUserAction, { passive: true, once: true })
          window.addEventListener('keydown', onUserAction, { passive: true, once: true })

          const restore = () => {
            if (userInteractedRef.current) return

            if (targetWindowY > 0) {
              window.scrollTo({ top: targetWindowY, left: 0, behavior: 'instant' as ScrollBehavior })
              document.documentElement.scrollTop = targetWindowY
              document.body.scrollTop = targetWindowY
            }

            if (targetMainY > 0) {
              const containers = getMainScrollContainers()
              containers.forEach((c) => {
                c.scrollTop = targetMainY
              })
            }

            const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0
            const maxScroll = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            ) - window.innerHeight

            // If the document hasn't expanded to full height yet, retry
            if (attempts < maxAttempts && (currentScrollY < Math.min(targetWindowY, maxScroll) || maxScroll < targetWindowY)) {
              attempts++
              setTimeout(restore, 50)
            }
          }

          restore()
          prevPathRef.current = currentPath
          return
        }
      }

      // Fresh landing / initial load: ALWAYS start at top
      scrollToTopInstant()
      sessionStorage.setItem(STORAGE_LAST_PATH, currentPath)
      prevPathRef.current = currentPath
      return
    }

    // Subsequent navigation to another page/route
    const isNavigation = prevPathRef.current !== currentPath
    prevPathRef.current = currentPath

    if (isNavigation) {
      // Clear any stale cached position for the target page so it starts fresh at top
      try {
        sessionStorage.removeItem(STORAGE_POS_PREFIX + currentPath)
        sessionStorage.setItem(STORAGE_LAST_PATH, currentPath)
      } catch {
        // Ignore
      }

      // Handle hash anchor if provided
      if (location.hash) {
        const id = location.hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          return
        }
      }

      // ALWAYS STAY TOP on navigating to another page
      scrollToTopInstant()

      // Redundant backup checks on next frames to catch async lazy chunk loads / suspense fallbacks
      const frameId1 = requestAnimationFrame(() => {
        scrollToTopInstant()
      })
      const timerId = setTimeout(() => {
        scrollToTopInstant()
      }, 50)

      return () => {
        cancelAnimationFrame(frameId1)
        clearTimeout(timerId)
      }
    }
  }, [currentPath, location.hash])

  return null
}
