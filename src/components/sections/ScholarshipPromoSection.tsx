import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    IconSchool as GraduationCap,
    IconArrowRight as ArrowRight,
    IconTrophy as Trophy,
    IconAward as Award,
    IconFileCheck as FileCheck,
    IconBuilding as SchoolBuilding
} from '@tabler/icons-react'
import { animate, cubicBezier, stagger } from 'animejs'
import { ThinkingOrb } from 'thinking-orbs'
import { scholarshipService } from '../../services/scholarshipService'
import { mediaService, type SiteMediaItem } from '../../services/mediaService'
import type { ScholarshipSettings } from '../../types/scholarship'
import { prefersReducedMotion, revealOnScroll } from '../../lib/motion'

type AnimeHandle = ReturnType<typeof animate>

const SCHOLARSHIP_HIGHLIGHTS = [
    { label: 'Class X Only', icon: SchoolBuilding },
    { label: 'Conducted in Schools', icon: FileCheck },
    { label: 'Position Holders', icon: Award }
] as const

interface ScholarshipGallerySlot {
    key: string
    num: string
    tag: string
}

// 7 open media keys wired to `mediaService` ('Scholarship Banner' group) for Admin & Super Admin panels
const SCHOLARSHIP_SLOTS: ScholarshipGallerySlot[] = [
    { key: 'home.scholarship.1', num: '01', tag: 'School Exam' },
    { key: 'home.scholarship.2', num: '02', tag: 'Class X Batches' },
    { key: 'home.scholarship.3', num: '03', tag: 'Classroom Prep' },
    { key: 'home.scholarship.4', num: '04', tag: 'Coordination' },
    { key: 'home.scholarship.5', num: '05', tag: 'Position Holders' },
    { key: 'home.scholarship.6', num: '06', tag: 'Tech Pathways' },
    { key: 'home.scholarship.7', num: '07', tag: 'Counseling' }
]

const ACCORDION_EASE = cubicBezier(0.22, 1, 0.36, 1)

export default function ScholarshipPromoSection() {
    const navigate = useNavigate()
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)
    const [mediaMap, setMediaMap] = useState<Record<string, SiteMediaItem>>(() =>
        mediaService.getCachedMediaByGroup('Scholarship Banner')
    )
    const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({})
    const [activeIdx, setActiveIdx] = useState<number>(0)

    const bannerRef = useRef<HTMLDivElement>(null)
    const rowRef = useRef<HTMLDivElement>(null)
    const statusTextRef = useRef<HTMLDivElement>(null)
    const paneRefs = useRef<Array<HTMLElement | null>>([])
    const imgRefs = useRef<Record<string, HTMLImageElement | null>>({})
    const captionRefs = useRef<Array<HTMLDivElement | null>>([])
    const ctaRefs = useRef<Array<HTMLAnchorElement | null>>([])
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
    }, [mediaMap])

    useEffect(() => {
        let isMounted = true

        scholarshipService.getSettings().then((s) => {
            if (isMounted) setSettings(s)
        })

        mediaService.getMediaByGroup('Scholarship Banner').then((items) => {
            if (isMounted && Object.keys(items).length > 0) {
                setMediaMap(items)
            }
        })

        const unsubscribe = scholarshipService.onSettingsChange((updated) => {
            if (isMounted) setSettings(updated)
        })

        const unsubRealtime = scholarshipService.subscribeToChanges(() => {
            scholarshipService.getSettings().then((s) => {
                if (isMounted) setSettings(s)
            })
        })

        const unsubMedia = mediaService.onMediaChange((items) => {
            if (!isMounted) return
            const updatedGroup: Record<string, SiteMediaItem> = {}
            Object.entries(items).forEach(([k, item]) => {
                if (item.group === 'Scholarship Banner') {
                    updatedGroup[k] = item
                }
            })
            if (Object.keys(updatedGroup).length > 0) {
                setMediaMap(updatedGroup)
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
            unsubRealtime()
            unsubMedia()
        }
    }, [])

    useEffect(() => {
        if (!bannerRef.current || !settings?.masterEnabled || !settings?.homepagePromotionEnabled) return
        const cleanups: Array<() => void> = [
            revealOnScroll(bannerRef.current, { translateY: 14, duration: 500 })
        ]

        if (rowRef.current && !prefersReducedMotion()) {
            const rowEl = rowRef.current
            const obs = new IntersectionObserver(
                (entries, observer) => {
                    if (entries[0]?.isIntersecting) {
                        observer.unobserve(rowEl)
                        const panes = paneRefs.current.filter((p): p is HTMLElement => Boolean(p))
                        if (panes.length > 0) {
                            animate(panes, {
                                translateY: [20, 0],
                                opacity: [0.6, 1],
                                duration: 540,
                                delay: stagger(55),
                                ease: ACCORDION_EASE
                            })
                        }
                    }
                },
                { threshold: 0.14 }
            )
            obs.observe(rowEl)
            cleanups.push(() => obs.disconnect())
        }

        return () => cleanups.forEach((fn) => fn())
    }, [settings])

    // Anime.js-driven single-row flex/height accordion + caption & image zoom choreography
    useEffect(() => {
        if (!settings?.masterEnabled || !settings?.homepagePromotionEnabled) return
        const panes = paneRefs.current
        if (!panes.some(Boolean)) return

        activeAnimsRef.current.forEach((a) => a.pause())
        activeAnimsRef.current = []

        const isDesktop =
            typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
        const reduced = prefersReducedMotion()

        panes.forEach((pane, idx) => {
            if (!pane) return
            const isActive = idx === activeIdx
            const key = SCHOLARSHIP_SLOTS[idx]?.key
            const img = key ? imgRefs.current[key] : null
            const caption = captionRefs.current[idx]
            const cta = ctaRefs.current[idx]

            if (reduced) {
                if (isDesktop) {
                    pane.style.flexGrow = isActive ? '4.6' : '0.72'
                    pane.style.height = '100%'
                } else {
                    pane.style.flexGrow = '0'
                    pane.style.height = isActive ? '230px' : '68px'
                }
                if (caption) {
                    caption.style.opacity = isActive ? '1' : ''
                    caption.style.transform = 'none'
                }
                if (cta) {
                    cta.style.opacity = isActive ? '1' : '0'
                    cta.style.transform = 'none'
                }
                return
            }

            if (isDesktop) {
                pane.style.height = ''
                activeAnimsRef.current.push(
                    animate(pane, {
                        flexGrow: isActive ? 4.6 : 0.72,
                        duration: 540,
                        ease: ACCORDION_EASE
                    })
                )
            } else {
                pane.style.flexGrow = ''
                activeAnimsRef.current.push(
                    animate(pane, {
                        height: isActive ? 230 : 68,
                        duration: 460,
                        ease: ACCORDION_EASE
                    })
                )
            }

            if (img) {
                activeAnimsRef.current.push(
                    animate(img, {
                        scale: isActive ? 1.03 : 1,
                        duration: 620,
                        ease: ACCORDION_EASE
                    })
                )
            }

            if (caption) {
                if (isActive) {
                    activeAnimsRef.current.push(
                        animate(caption, {
                            translateY: [10, 0],
                            opacity: [0, 1],
                            duration: 360,
                            delay: 85,
                            ease: ACCORDION_EASE
                        })
                    )
                } else {
                    activeAnimsRef.current.push(
                        animate(caption, {
                            opacity: isDesktop ? 0 : 0.9,
                            translateY: isDesktop ? 6 : 0,
                            duration: 200,
                            ease: 'outQuad'
                        })
                    )
                }
            }

            if (cta) {
                activeAnimsRef.current.push(
                    animate(cta, {
                        opacity: isActive ? 1 : 0,
                        translateY: isActive ? 0 : -4,
                        duration: isActive ? 280 : 160,
                        delay: isActive ? 110 : 0,
                        ease: ACCORDION_EASE
                    })
                )
            }
        })

        if (statusTextRef.current && !reduced) {
            activeAnimsRef.current.push(
                animate(statusTextRef.current, {
                    translateY: [4, 0],
                    opacity: [0.45, 1],
                    duration: 260,
                    ease: ACCORDION_EASE
                })
            )
        }

        return () => {
            activeAnimsRef.current.forEach((a) => a.pause())
        }
    }, [activeIdx, settings])

    if (!settings || !settings.masterEnabled || !settings.homepagePromotionEnabled) {
        return null
    }

    const activeSlot = SCHOLARSHIP_SLOTS[activeIdx] || SCHOLARSHIP_SLOTS[0]
    const activeItem = mediaMap[activeSlot.key] || mediaService.getCachedMediaByKey(activeSlot.key)

    return (
        <section className="py-16 lg:py-20 px-4 md:px-6 bg-gradient-to-b from-[#F8FAFC] via-[#F5F9FD] to-[#F7FAFE] relative overflow-hidden">
            <div ref={bannerRef} className="container mx-auto max-w-7xl relative z-10">
                <div className="relative rounded-3xl bg-[#FFFFFF]/90 backdrop-blur-md border border-slate-200/90 shadow-[0_24px_56px_-22px_rgba(15,23,42,0.12)] overflow-hidden p-6 sm:p-8 lg:p-10">
                    {/* Top Class X School Scholarship Narrative + Action Card */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 mb-8">
                        <div className="space-y-3.5 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#2572AB] border border-slate-200/90 text-xs font-medium">
                                <Trophy size={13} className="text-[#2572AB]" aria-hidden="true" />
                                <span>ICST Scholarship Program · Class X</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#0F172A] leading-[1.12]">
                                Empowering Class X Minds{' '}
                                <span className="text-[#2572AB]">Across Schools</span>
                            </h2>

                            <p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-0">
                                Currently conducted exclusively for <strong className="font-semibold text-[#0F172A]">Class X students</strong> directly across participating schools. Explore past position holders, scholarship criteria, and exam updates.
                            </p>

                            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                {SCHOLARSHIP_HIGHLIGHTS.map(({ label, icon: ItemIcon }) => (
                                    <span
                                        key={label}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs font-medium text-slate-700"
                                    >
                                        <ItemIcon size={14} className="text-[#2572AB]" aria-hidden="true" />
                                        <span>{label}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0 mx-auto lg:mx-0 w-full max-w-xs sm:max-w-sm lg:w-72">
                            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-4 flex flex-col items-stretch gap-3">
                                <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 px-0.5">
                                    <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                                        Merit Portal
                                    </span>
                                    <span className="text-[#2572AB]">Class X · Schools</span>
                                </div>

                                <Link
                                    to="/scholarships"
                                    className="w-full px-5 py-3.5 bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold text-sm rounded-xl shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] no-underline group"
                                >
                                    <GraduationCap size={18} className="text-white/90" aria-hidden="true" />
                                    <span>Explore Scholarship</span>
                                    <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Single-Row Anime.js Kinetic 7-Panel Image Accordion (Synced to mediaService) */}
                    <div
                        ref={rowRef}
                        className="flex flex-col md:flex-row gap-2 w-full md:h-[330px] lg:h-[360px]"
                        role="region"
                        aria-label="Class X school scholarship highlights"
                    >
                        {SCHOLARSHIP_SLOTS.map((slot, index) => {
                            const item = mediaMap[slot.key] || mediaService.getCachedMediaByKey(slot.key)
                            const isActive = activeIdx === index
                            const isLoaded = Boolean(loadedKeys[slot.key])

                            return (
                                <article
                                    key={slot.key}
                                    ref={(el) => {
                                        paneRefs.current[index] = el
                                    }}
                                    style={{
                                        flexGrow: index === 0 ? 4.6 : 0.72,
                                        flexBasis: '0%'
                                    }}
                                    onMouseEnter={() => setActiveIdx(index)}
                                    className={`group/pane relative overflow-hidden rounded-2xl border bg-[#F8FAFC] min-w-0 transition-[border-color,box-shadow] duration-300 ${
                                        isActive
                                            ? 'border-[#2572AB]/45 shadow-[0_18px_38px_-16px_rgba(15,23,42,0.28)]'
                                            : 'border-slate-200/85'
                                    }`}
                                >
                                    {!isLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] pointer-events-none z-0">
                                            <ThinkingOrb
                                                state="breathing"
                                                size={20}
                                                theme="light"
                                                color="#2572AB"
                                                aria-label={`Loading ${item.title}`}
                                            />
                                        </div>
                                    )}

                                    <img
                                        ref={(el) => {
                                            imgRefs.current[slot.key] = el
                                        }}
                                        src={item.cloudinary_url}
                                        width={item.recommended_width || 1200}
                                        height={item.recommended_height || 675}
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
                                        } ${isActive ? 'brightness-100 saturate-100' : 'brightness-85 saturate-85'}`}
                                    />

                                    {/* Accessible Interaction Layer */}
                                    <button
                                        type="button"
                                        aria-expanded={isActive}
                                        aria-label={`${item.title} — ${isActive ? 'view scholarship details' : 'preview highlight'}`}
                                        onFocus={() => setActiveIdx(index)}
                                        onClick={() => {
                                            if (isActive) {
                                                navigate('/scholarships')
                                            } else {
                                                setActiveIdx(index)
                                            }
                                        }}
                                        className="absolute inset-0 z-10 cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2572AB]"
                                    />

                                    {/* Top Index + Tag Badge */}
                                    <div className="pointer-events-none absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-md border transition-colors duration-200 ${
                                                isActive
                                                    ? 'bg-[#2572AB] text-white border-[#2572AB]'
                                                    : 'bg-[#0F172A]/60 text-white border-white/20'
                                            }`}
                                        >
                                            <span className="tabular-nums">{slot.num}</span>
                                            {isActive && (
                                                <span className="hidden sm:inline opacity-90 whitespace-nowrap">
                                                    · {slot.tag}
                                                </span>
                                            )}
                                        </span>

                                        <Link
                                            ref={(el) => {
                                                ctaRefs.current[index] = el
                                            }}
                                            to="/scholarships"
                                            style={{ opacity: index === 0 ? 1 : 0 }}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFFFF]/95 hover:bg-[#2572AB] text-[#0F172A] hover:text-white text-[11px] font-medium border border-slate-200/80 shadow-xs no-underline transition-colors duration-150 ${
                                                isActive ? 'pointer-events-auto' : 'pointer-events-none'
                                            }`}
                                        >
                                            <span>Details</span>
                                            <ArrowRight size={11} aria-hidden="true" />
                                        </Link>
                                    </div>

                                    {/* Anime.js Driven Caption Drawer */}
                                    <div
                                        ref={(el) => {
                                            captionRefs.current[index] = el
                                        }}
                                        style={{ opacity: index === 0 ? 1 : undefined }}
                                        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0F172A]/92 via-[#0F172A]/60 to-transparent ${
                                            isActive
                                                ? 'px-4 sm:px-6 pt-14 pb-4 sm:pb-6'
                                                : 'px-4 py-3'
                                        }`}
                                    >
                                        <h3
                                            className={`text-white font-semibold tracking-tight leading-snug ${
                                                isActive
                                                    ? 'text-base sm:text-xl mb-1 line-clamp-1'
                                                    : 'text-xs font-medium mb-0 line-clamp-1'
                                            }`}
                                        >
                                            {item.title}
                                        </h3>
                                        {isActive && (
                                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-0 line-clamp-2">
                                                {item.description || item.alt_text}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    {/* Active Moment Strip & 01-07 Quick Stepper */}
                    <div className="pt-3 mt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                        <div ref={statusTextRef} className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
                            <span className="font-semibold text-[#0F172A] tabular-nums shrink-0">
                                {activeSlot.num} · {activeSlot.tag}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">|</span>
                            <span className="truncate">{activeItem.title}</span>
                        </div>

                        <div className="flex items-center gap-1" role="tablist" aria-label="Select school scholarship moment">
                            {SCHOLARSHIP_SLOTS.map((slot, idx) => {
                                const selected = idx === activeIdx
                                return (
                                    <button
                                        key={slot.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-label={`View moment ${slot.num}: ${slot.tag}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onFocus={() => setActiveIdx(idx)}
                                        onClick={() => setActiveIdx(idx)}
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
        </section>
    )
}
