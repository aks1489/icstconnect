import React, { Suspense, useEffect, useRef, useState } from 'react'
import { OrbSectionLoader } from '../ui/HomePageSkeleton'

interface LazySectionProps {
    children: React.ReactNode
    anchorId?: string
    minHeightClass?: string
    loadingLabel?: string
    rootMargin?: string
    bgClassName?: string
}

/**
 * Viewport-aware lazy section boundary for below-the-fold Home sections.
 * Defers chunk download, data fetches, and heavy media decode until the user
 * approaches the section, while preserving stable vertical space to prevent CLS.
 */
const LazySection: React.FC<LazySectionProps> = ({
    children,
    anchorId,
    minHeightClass = 'min-h-[480px]',
    loadingLabel = 'Loading section',
    rootMargin = '450px 0px',
    bgClassName = 'bg-[#FFFFFF]'
}) => {
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [shouldMount, setShouldMount] = useState(false)

    useEffect(() => {
        if (shouldMount) return
        const el = sentinelRef.current
        if (!el) return

        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setShouldMount(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldMount(true)
                    observer.disconnect()
                }
            },
            { rootMargin, threshold: 0 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [shouldMount, rootMargin])

    const fallbackBox = (
        <div
            className={`w-full ${minHeightClass} ${bgClassName} flex items-center justify-center`}
        >
            <OrbSectionLoader state="connecting" size={32} label={loadingLabel} />
        </div>
    )

    if (!shouldMount) {
        return (
            <div ref={sentinelRef} id={anchorId}>
                {fallbackBox}
            </div>
        )
    }

    return <Suspense fallback={fallbackBox}>{children}</Suspense>
}

export default LazySection
