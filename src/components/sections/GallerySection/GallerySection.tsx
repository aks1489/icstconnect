import { useState, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArrowRight as ArrowRight } from '@tabler/icons-react'
import { animate, cubicBezier, stagger } from 'animejs'
import { ThinkingOrb } from 'thinking-orbs'
import { mediaService, type SiteMediaItem } from '../../../services/mediaService'
import { prefersReducedMotion, revealOnScroll } from '../../../lib/motion'

type AnimeHandle = ReturnType<typeof animate>

interface GallerySlot {
    key: string
    num: string
    tag: string
    row: 0 | 1
    col: 0 | 1 | 2
}

const GALLERY_SLOTS: GallerySlot[] = [
    { key: 'home.gallery.1', num: '01', tag: 'Seminar', row: 0, col: 0 },
    { key: 'home.gallery.2', num: '02', tag: 'Collaboration', row: 0, col: 1 },
    { key: 'home.gallery.3', num: '03', tag: 'Practical Lab', row: 0, col: 2 },
    { key: 'home.gallery.4', num: '04', tag: 'Mentorship', row: 1, col: 0 },
    { key: 'home.gallery.5', num: '05', tag: 'Workshop', row: 1, col: 1 },
    { key: 'home.gallery.6', num: '06', tag: 'Instruction', row: 1, col: 2 }
]

const GALLERY_EASE = cubicBezier(0.22, 1, 0.36, 1)

const GallerySection = () => {
    const navigate = useNavigate()
    const [galleryMap, setGalleryMap] = useState<Record<string, SiteMediaItem>>(() =>
        mediaService.getCachedMediaByGroup('Campus Gallery')
    )
    const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({})
    const [activeIdx, setActiveIdx] = useState<number | null>(null)

    const headerRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)
    const statusTextRef = useRef<HTMLDivElement>(null)
    const cellRefs = useRef<Array<HTMLElement | null>>([])
    const imgRefs = useRef<Record<string, HTMLImageElement | null>>({})
    const storyRefs = useRef<Array<HTMLDivElement | null>>([])
    const viewBtnRefs = useRef<Array<HTMLAnchorElement | null>>([])
    const activeAnimsRef = useRef<AnimeHandle[]>([])

    const markLoaded = (key: string) => {
        setLoadedKeys((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
    }

    useEffect(() => {
        Object.entries(imgRefs.current).forEach(([key, el]) => {
            if (el?.complete && el.naturalWidth > 0) {
                markLoaded(key)
            }
        })
    }, [galleryMap])

    useEffect(() => {
        let isMounted = true
        mediaService.getMediaByGroup('Campus Gallery').then((items) => {
            if (isMounted && Object.keys(items).length > 0) {
                setGalleryMap(items)
            }
        })

        const unsubscribe = mediaService.onMediaChange((items) => {
            if (isMounted) {
                const updatedGroup: Record<string, SiteMediaItem> = {}
                Object.entries(items).forEach(([k, item]) => {
                    if (item.group === 'Campus Gallery') {
                        updatedGroup[k] = item
                    }
                })
                if (Object.keys(updatedGroup).length > 0) {
                    setGalleryMap(updatedGroup)
                }
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        const cleanups: Array<() => void> = []
        if (headerRef.current) {
            cleanups.push(revealOnScroll(headerRef.current, { translateY: 14, duration: 500 }))
        }
        if (stageRef.current && !prefersReducedMotion()) {
            const el = stageRef.current
            const observer = new IntersectionObserver(
                (entries, obs) => {
                    if (entries[0]?.isIntersecting) {
                        obs.unobserve(el)
                        const cells = cellRefs.current.filter((c): c is HTMLElement => Boolean(c))
                        if (cells.length > 0) {
                            animate(cells, {
                                translateY: [18, 0],
                                scale: [0.97, 1],
                                opacity: [0.65, 1],
                                duration: 560,
                                delay: stagger(60),
                                ease: GALLERY_EASE
                            })
                        }
                    }
                },
                { threshold: 0.12 }
            )
            observer.observe(el)
            cleanups.push(() => observer.disconnect())
        }
        return () => cleanups.forEach((fn) => fn())
    }, [])

    // Anime.js orchestration for focused cell photo scale, description drawer, and action chip
    useEffect(() => {
        if (prefersReducedMotion()) return

        activeAnimsRef.current.forEach((a) => a.pause())
        activeAnimsRef.current = []

        GALLERY_SLOTS.forEach((slot, idx) => {
            const isExpanded = activeIdx === idx
            const img = imgRefs.current[slot.key]
            const story = storyRefs.current[idx]
            const viewBtn = viewBtnRefs.current[idx]

            if (img) {
                activeAnimsRef.current.push(
                    animate(img, {
                        scale: isExpanded ? 1.035 : 1,
                        duration: 560,
                        ease: GALLERY_EASE
                    })
                )
            }

            if (story) {
                activeAnimsRef.current.push(
                    animate(story, {
                        opacity: isExpanded ? 1 : 0,
                        translateY: isExpanded ? 0 : 8,
                        duration: isExpanded ? 340 : 180,
                        delay: isExpanded ? 85 : 0,
                        ease: GALLERY_EASE
                    })
                )
            }

            if (viewBtn) {
                activeAnimsRef.current.push(
                    animate(viewBtn, {
                        opacity: isExpanded ? 1 : 0,
                        translateY: isExpanded ? 0 : -4,
                        duration: isExpanded ? 260 : 140,
                        delay: isExpanded ? 90 : 0,
                        ease: GALLERY_EASE
                    })
                )
            }
        })

        if (statusTextRef.current) {
            activeAnimsRef.current.push(
                animate(statusTextRef.current, {
                    translateY: [4, 0],
                    opacity: [0.45, 1],
                    duration: 240,
                    ease: GALLERY_EASE
                })
            )
        }

        return () => {
            activeAnimsRef.current.forEach((a) => a.pause())
        }
    }, [activeIdx])

    const activeSlot = activeIdx !== null ? GALLERY_SLOTS[activeIdx] : null
    const colTracks = activeSlot
        ? ([0, 1, 2] as const).map((c) => (c === activeSlot.col ? '2.45fr' : '0.68fr'))
        : ['1.35fr', '1fr', '1fr']
    const rowTracks = activeSlot
        ? ([0, 1] as const).map((r) => (r === activeSlot.row ? '1.9fr' : '0.72fr'))
        : ['1.15fr', '1fr']

    const gridTrackVars = {
        '--gc-0': colTracks[0],
        '--gc-1': colTracks[1],
        '--gc-2': colTracks[2],
        '--gr-0': rowTracks[0],
        '--gr-1': rowTracks[1]
    } as CSSProperties

    return (
        <section
            className="py-22 bg-gradient-to-b from-[#F8FAFC] via-[#F4F8FD] to-[#F8FAFC] border-t border-slate-200/70"
            id="gallery"
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="text-center md:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] text-[#2572AB] rounded-full text-xs font-medium mb-4 border border-slate-200/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                            <span>Campus Gallery</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A] tracking-[-0.025em] mb-3">
                            Life at ICST Chowberia
                        </h2>
                        <p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-0">
                            Moments of discovery, teamwork, and innovation captured across our campus, robotics labs, and programming workstations.
                        </p>
                    </div>

                    <div className="flex justify-center md:justify-end shrink-0">
                        <Link
                            to="/gallery"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white text-sm font-semibold shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] no-underline group"
                        >
                            <span>Explore Full Photo Chronicles</span>
                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                                className="group-hover:translate-x-0.5 transition-transform duration-150"
                            />
                        </Link>
                    </div>
                </div>

                {/* Unified Kinetic Shutter Gallery Frame */}
                <div
                    ref={stageRef}
                    onMouseLeave={() => setActiveIdx(null)}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                            setActiveIdx(null)
                        }
                    }}
                    className="rounded-3xl bg-[#FFFFFF] p-2.5 sm:p-3 border border-slate-200/90 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]"
                >
                    <div
                        style={gridTrackVars}
                        className="icst-kinetic-grid grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:h-[520px]"
                    >
                        {GALLERY_SLOTS.map((slot, index) => {
                            const item = galleryMap[slot.key] || mediaService.getCachedMediaByKey(slot.key)
                            const isExpanded = activeIdx === index
                            const isSiblingCompressed = activeIdx !== null && !isExpanded
                            const isLoaded = Boolean(loadedKeys[slot.key])

                            return (
                                <article
                                    key={slot.key}
                                    ref={(el) => {
                                        cellRefs.current[index] = el
                                    }}
                                    onMouseEnter={() => setActiveIdx(index)}
                                    className={`group/cell relative rounded-2xl overflow-hidden bg-[#F8FAFC] border transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] aspect-[4/3] lg:aspect-auto ${
                                        isExpanded
                                            ? 'border-[#2572AB]/50 shadow-[0_18px_40px_-16px_rgba(15,23,42,0.28)]'
                                            : 'border-slate-200/80'
                                    }`}
                                >
                                    {!isLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] pointer-events-none z-0">
                                            <ThinkingOrb
                                                state="breathing"
                                                size={32}
                                                theme="light"
                                                color="#2572AB"
                                                aria-label={`Loading ${item.title || 'gallery highlight'}`}
                                            />
                                        </div>
                                    )}

                                    <img
                                        ref={(el) => {
                                            imgRefs.current[slot.key] = el
                                        }}
                                        src={item.cloudinary_url}
                                        width={item.recommended_width || 580}
                                        height={item.recommended_height || 435}
                                        loading="lazy"
                                        decoding="async"
                                        onLoad={() => markLoaded(slot.key)}
                                        onError={(e) => {
                                            const fallback = mediaService.getCachedMediaByKey(slot.key)
                                            if (e.currentTarget.src !== fallback.cloudinary_url) {
                                                e.currentTarget.src = fallback.cloudinary_url
                                            } else {
                                                markLoaded(slot.key)
                                            }
                                        }}
                                        alt={item.alt_text}
                                        className={`w-full h-full object-cover block pointer-events-none will-change-transform transition-[opacity,filter] duration-300 ${
                                            isLoaded ? 'opacity-100' : 'opacity-0'
                                        } ${isSiblingCompressed ? 'brightness-85 saturate-90' : 'brightness-100'}`}
                                    />

                                    {/* Accessible Interaction Layer (Sibling to Open Link) */}
                                    <button
                                        type="button"
                                        aria-expanded={isExpanded}
                                        aria-label={`${item.title} — ${isExpanded ? 'open gallery' : 'focus campus highlight'}`}
                                        onFocus={() => setActiveIdx(index)}
                                        onClick={() => {
                                            if (isExpanded) {
                                                navigate('/gallery')
                                            } else {
                                                setActiveIdx(index)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape' && isExpanded) {
                                                e.preventDefault()
                                                setActiveIdx(null)
                                            }
                                        }}
                                        className="absolute inset-0 z-10 cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2572AB]"
                                    />

                                    {/* Top Bar: Index + Category Tag & Direct Gallery Action */}
                                    <div className="pointer-events-none absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                                        <div
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[11px] font-medium transition-colors duration-200 ${
                                                isExpanded
                                                    ? 'bg-[#2572AB] text-white border-[#2572AB]'
                                                    : 'bg-[#0F172A]/60 text-white border-white/20'
                                            }`}
                                        >
                                            <span className="tabular-nums">{slot.num}</span>
                                            <span className="hidden sm:inline opacity-75">·</span>
                                            <span
                                                className={`transition-[opacity,max-width] duration-200 overflow-hidden whitespace-nowrap ${
                                                    isSiblingCompressed
                                                        ? 'lg:max-w-0 lg:opacity-0'
                                                        : 'max-w-[120px] opacity-100'
                                                }`}
                                            >
                                                {slot.tag}
                                            </span>
                                        </div>

                                        <Link
                                            ref={(el) => {
                                                viewBtnRefs.current[index] = el
                                            }}
                                            to="/gallery"
                                            style={{ opacity: 0 }}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFFFF]/95 hover:bg-[#2572AB] text-[#0F172A] hover:text-white text-[11px] font-medium border border-slate-200/80 shadow-xs no-underline transition-colors duration-150 ${
                                                isExpanded ? 'pointer-events-auto' : 'pointer-events-none'
                                            }`}
                                        >
                                            <span>View</span>
                                            <ArrowRight size={11} aria-hidden="true" />
                                        </Link>
                                    </div>

                                    {/* Anime.js Driven Architectural Caption */}
                                    <div
                                        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0F172A]/92 via-[#0F172A]/60 to-transparent transition-[padding,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                            isExpanded
                                                ? 'px-5 pt-16 pb-5 sm:pb-6'
                                                : isSiblingCompressed
                                                    ? 'px-3 pt-10 pb-3 opacity-85'
                                                    : 'px-4 pt-12 pb-4'
                                        }`}
                                    >
                                        <h3
                                            className={`text-white font-semibold tracking-tight leading-snug transition-[font-size,margin] duration-300 ${
                                                isExpanded
                                                    ? 'text-base sm:text-xl mb-1.5 line-clamp-2'
                                                    : isSiblingCompressed
                                                        ? 'text-xs sm:text-sm mb-0 line-clamp-1'
                                                        : 'text-sm sm:text-base mb-0 line-clamp-1'
                                            }`}
                                        >
                                            {item.title}
                                        </h3>

                                        <div
                                            ref={(el) => {
                                                storyRefs.current[index] = el
                                            }}
                                            style={{ opacity: 0 }}
                                            className={`overflow-hidden ${isExpanded ? 'max-h-24' : 'max-h-0'}`}
                                        >
                                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-0 line-clamp-2">
                                                {item.description || item.alt_text}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    {/* Interactive Chapter Selector Bar */}
                    <div className="pt-3 mt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 px-1">
                        <div ref={statusTextRef} className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
                            <span className="font-semibold text-[#0F172A] shrink-0">
                                {activeSlot
                                    ? `${activeSlot.num} · ${activeSlot.tag}`
                                    : '06 Moments'}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">|</span>
                            <span className="truncate">
                                {activeIdx !== null
                                    ? (galleryMap[GALLERY_SLOTS[activeIdx].key] ||
                                          mediaService.getCachedMediaByKey(GALLERY_SLOTS[activeIdx].key)).title
                                    : 'Computer labs, workshops & campus life'}
                            </span>
                        </div>

                        <div className="flex items-center gap-1" role="tablist" aria-label="Highlight frames">
                            {GALLERY_SLOTS.map((slot, idx) => {
                                const selected = activeIdx === idx
                                return (
                                    <button
                                        key={slot.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-label={`Highlight ${slot.num}: ${slot.tag}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onFocus={() => setActiveIdx(idx)}
                                        onClick={() => setActiveIdx((prev) => (prev === idx ? null : idx))}
                                        className={`h-7 px-2.5 rounded-lg text-[11px] font-medium tabular-nums transition-[background-color,color] duration-150 cursor-pointer ${
                                            selected
                                                ? 'bg-[#2572AB] text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#0F172A]'
                                        }`}
                                    >
                                        {slot.num}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .icst-kinetic-grid {
                        grid-template-columns: var(--gc-0) var(--gc-1) var(--gc-2);
                        grid-template-rows: var(--gr-0) var(--gr-1);
                        transition:
                            grid-template-columns 520ms cubic-bezier(0.22, 1, 0.36, 1),
                            grid-template-rows 520ms cubic-bezier(0.22, 1, 0.36, 1);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .icst-kinetic-grid {
                        transition: none !important;
                    }
                }
            `}</style>
        </section>
    )
}

export default GallerySection
