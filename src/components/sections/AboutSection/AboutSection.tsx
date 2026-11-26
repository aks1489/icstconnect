import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    IconRosetteDiscountCheck as BadgeCheck,
    IconUsers as Users,
    IconArrowRight as ArrowRight,
    IconMapPin as MapPin
} from '@tabler/icons-react'
import { mediaService, type SiteMediaItem } from '../../../services/mediaService'
import { revealOnScroll } from '../../../lib/motion'
import { OrbSectionLoader } from '../../ui/HomePageSkeleton'

const HIGHLIGHTS = [
    {
        title: 'Certified Courses',
        description: 'Industry recognized certifications upon completion.',
        icon: BadgeCheck
    },
    {
        title: 'Expert Mentors',
        description: 'Learn directly from experienced industry professionals.',
        icon: Users
    }
] as const

const AboutSection = () => {
    const [mediaItem, setMediaItem] = useState<SiteMediaItem>(() =>
        mediaService.getCachedMediaByKey('home.about.feature')
    )
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)

    useEffect(() => {
        if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
            setIsImageLoaded(true)
        } else {
            setIsImageLoaded(false)
        }
    }, [mediaItem.cloudinary_url])

    useEffect(() => {
        let isMounted = true
        mediaService.getMediaByKey('home.about.feature').then((item) => {
            if (isMounted && item) {
                setMediaItem(item)
            }
        })

        const unsubscribe = mediaService.onMediaChange((items) => {
            if (isMounted && items['home.about.feature']) {
                setMediaItem(items['home.about.feature'])
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!sectionRef.current) return
        return revealOnScroll(sectionRef.current, { translateY: 16, duration: 550 })
    }, [])

    return (
        <section
            id="about"
            className="py-22 lg:py-28 bg-[#F7FAFE] relative overflow-hidden"
        >
            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
                    {/* Left Photo Showcase (6 Cols) in Framed Showcase */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative rounded-3xl bg-[#FFFFFF] border border-slate-200/90 p-2.5 sm:p-3 shadow-[0_24px_54px_-22px_rgba(15,23,42,0.14)]">
                            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl bg-[#F8FAFC]">
                                {!isImageLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] z-0">
                                        <OrbSectionLoader
                                            state="working"
                                            size={32}
                                            label="Loading campus photo"
                                        />
                                    </div>
                                )}
                                <img
                                    ref={imgRef}
                                    src={mediaItem.cloudinary_url}
                                    width={mediaItem.recommended_width || 870}
                                    height={mediaItem.recommended_height || 580}
                                    loading="lazy"
                                    onLoad={() => setIsImageLoaded(true)}
                                    className={`w-full h-full object-cover block transition-opacity duration-300 ${
                                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    alt={mediaItem.alt_text}
                                    onError={(e) => {
                                        const fallback = mediaService.getCachedMediaByKey('home.about.feature')
                                        if (e.currentTarget.src !== fallback.cloudinary_url) {
                                            e.currentTarget.src = fallback.cloudinary_url
                                        } else {
                                            setIsImageLoaded(true)
                                        }
                                    }}
                                />

                                {/* Campus Tag Top-Right */}
                                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF]/92 backdrop-blur-md border border-slate-200/90 shadow-xs absolute top-3.5 right-3.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                                    <span className="text-[11px] font-medium text-[#0F172A]">Practical Labs</span>
                                </div>

                                {/* Overlaid Campus Card */}
                                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs p-3 rounded-2xl bg-[#FFFFFF]/92 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.2)] flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#2572AB] text-white flex items-center justify-center shrink-0">
                                        <MapPin size={18} aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-[#0F172A] truncate">ICST - Chowberia</div>
                                        <div className="text-[11px] text-slate-600 truncate">Practical Computer Science Campus</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Editorial Copy (6 Cols) */}
                    <div className="lg:col-span-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-slate-200/90 mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                            <span className="text-xs font-medium text-[#2572AB]">
                                About Us
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold mb-6 text-[#0F172A] leading-[1.1] tracking-[-0.025em]">
                            Empowering the <span className="text-[#2572AB]">Next Generation</span> of Tech Leaders
                        </h2>

                        <p className="text-base sm:text-lg text-[#475569] mb-4 leading-relaxed">
                            Institute of Computer Science and Technology (ICST) - Chowberia is a premier institution dedicated to providing high-quality computer education and training.
                        </p>
                        <p className="text-[#64748B] mb-8 leading-relaxed">
                            Our mission is to bridge the gap between academic learning and industry requirements. We offer a wide range of courses designed to equip students with the skills needed to succeed in the ever-evolving tech landscape.
                        </p>

                        {/* Institutional Highlights */}
                        <div className="space-y-3 mb-9">
                            {HIGHLIGHTS.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.title}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-slate-200/90 hover:border-[#2572AB]/40 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_24px_-12px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
                                    >
                                        <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#2572AB]/10 text-[#2572AB]">
                                            <Icon size={22} aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] mb-0.5">{item.title}</h3>
                                            <p className="text-xs sm:text-sm text-[#64748B] leading-snug mb-0">{item.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] no-underline group"
                        >
                            <span>Read More About Us</span>
                            <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
