import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus as Plus, IconArrowRight as ArrowRight } from '@tabler/icons-react'
import { mediaService, type SiteMediaItem } from '../../../services/mediaService'
import { revealOnScroll } from '../../../lib/motion'
import { ThinkingOrb } from 'thinking-orbs'

const BENTO_SPANS = [
    'lg:col-span-2 lg:row-span-2',
    'lg:col-span-1 lg:row-span-1',
    'lg:col-span-1 lg:row-span-1',
    'lg:col-span-2 lg:row-span-1',
    'lg:col-span-2 lg:row-span-1',
    'lg:col-span-2 lg:row-span-1'
]

const GallerySection = () => {
    const [galleryMap, setGalleryMap] = useState<Record<string, SiteMediaItem>>(() =>
        mediaService.getCachedMediaByGroup('Campus Gallery')
    )
    const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({})
    const sectionRef = useRef<HTMLDivElement>(null)
    const imgRefs = useRef<Record<string, HTMLImageElement | null>>({})

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
        if (!sectionRef.current) return
        return revealOnScroll(sectionRef.current, { translateY: 14, duration: 550 })
    }, [])

    const galleryKeys = [
        'home.gallery.1',
        'home.gallery.2',
        'home.gallery.3',
        'home.gallery.4',
        'home.gallery.5',
        'home.gallery.6'
    ]

    return (
        <section className="py-22 bg-gradient-to-b from-[#F8FAFC] via-[#F4F8FD] to-[#F8FAFC] border-t border-slate-200/70" id="gallery">
            <div ref={sectionRef} className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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
                            <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px] gap-5">
                    {galleryKeys.map((key, index) => {
                        const item = galleryMap[key] || mediaService.getCachedMediaByKey(key)
                        const spanClass = BENTO_SPANS[index] || ''
                        return (
                            <div key={key} className={`group ${spanClass}`}>
                                <Link
                                    to="/gallery"
                                    className="block relative overflow-hidden rounded-2xl shadow-[0_6px_18px_-12px_rgba(15,23,42,0.12)] hover:shadow-[0_20px_40px_-16px_rgba(15,23,42,0.22)] cursor-pointer aspect-[4/3] lg:aspect-auto lg:h-full no-underline bg-[#FFFFFF] p-1.5 border border-slate-200/90 hover:border-[#2572AB]/50 transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5"
                                >
                                    <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#F8FAFC]">
                                        {!loadedKeys[key] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] pointer-events-none">
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
                                                imgRefs.current[key] = el
                                            }}
                                            src={item.cloudinary_url}
                                            width={item.recommended_width || 580}
                                            height={item.recommended_height || 435}
                                            loading="lazy"
                                            onLoad={() => markLoaded(key)}
                                            className={`w-full h-full object-cover transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] block ${loadedKeys[key] ? 'opacity-100' : 'opacity-0'
                                                }`}
                                            alt={item.alt_text}
                                            onError={(e) => {
                                                const fallback = mediaService.getCachedMediaByKey(key)
                                                if (e.currentTarget.src !== fallback.cloudinary_url) {
                                                    e.currentTarget.src = fallback.cloudinary_url
                                                } else {
                                                    markLoaded(key)
                                                }
                                            }}
                                        />

                                        {/* Hover Caption */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-between p-4 transition-opacity duration-200">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white tabular-nums">
                                                    0{index + 1}
                                                </span>
                                                <div className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-[#0F172A] shadow-sm">
                                                    <Plus size={18} aria-hidden="true" />
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-xl bg-[#0F172A]/65 backdrop-blur-md border border-white/15 transform translate-y-1.5 group-hover:translate-y-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
                                                <span className="text-[11px] font-medium text-[#7DD3FC] block mb-0.5 tabular-nums">
                                                    Highlight {index + 1}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm line-clamp-1">
                                                    {item.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default GallerySection
