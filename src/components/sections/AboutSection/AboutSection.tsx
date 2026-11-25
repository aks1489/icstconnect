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

const HIGHLIGHTS = [
    {
        title: 'Certified Courses',
        description: 'Industry recognized certifications upon completion.',
        icon: BadgeCheck,
        iconBg: 'bg-[#2572AB]/12 border-[#2572AB]/20 text-[#2572AB]',
        hoverRing: 'hover:ring-[#2572AB]/35',
        delay: '0s'
    },
    {
        title: 'Expert Mentors',
        description: 'Learn directly from experienced industry professionals.',
        icon: Users,
        iconBg: 'bg-[#059669]/12 border-[#059669]/20 text-[#059669]',
        hoverRing: 'hover:ring-[#059669]/35',
        delay: '-3.5s'
    }
] as const

const AboutSection = () => {
    const [mediaItem, setMediaItem] = useState<SiteMediaItem>(() =>
        mediaService.getCachedMediaByKey('home.about.feature')
    )
    const sectionRef = useRef<HTMLDivElement>(null)

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
            {/* Minimal Looping Ambient Backdrop Blobs (Compositor-Only CSS, Zero JS Loop) */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <div
                    className="icst-about-anim absolute -top-20 left-[6%] w-[380px] h-[380px] rounded-full bg-[#38BDF8]/14"
                    style={{ animation: 'icstLiquidOrbA 18s ease-in-out infinite' }}
                />
                <div
                    className="icst-about-anim absolute -bottom-24 right-[8%] w-[420px] h-[420px] rounded-full bg-[#4F46E5]/10"
                    style={{ animation: 'icstLiquidOrbB 22s ease-in-out infinite' }}
                />
            </div>

            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
                    {/* Left Photo Showcase (6 Cols) in Frosted Liquid Glass Lens Frame */}
                    <div className="lg:col-span-6 relative">
                        {/* Subtle Orbiting Liquid Glass Ring Accent */}
                        <div
                            className="icst-about-anim hidden sm:block absolute -top-5 -left-5 w-24 h-24 rounded-full border border-[#2572AB]/20 bg-white/40 backdrop-blur-sm -z-10"
                            style={{ animation: 'icstLiquidFloatA 9s ease-in-out infinite' }}
                            aria-hidden="true"
                        />

                        <div className="relative rounded-[2rem] bg-white/55 backdrop-blur-md border border-white/95 ring-1 ring-slate-200/75 p-2.5 sm:p-3 shadow-[inset_0_1.5px_2px_rgba(255,255,255,1),0_26px_54px_-18px_rgba(15,23,42,0.16)]">
                            {/* Continuous subtle top glass specular gleam */}
                            <div
                                className="icst-about-anim absolute inset-x-10 top-0 h-px bg-white pointer-events-none"
                                style={{ animation: 'icstSpecularPulse 6s ease-in-out infinite' }}
                                aria-hidden="true"
                            />

                            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-[1.4rem] bg-slate-100">
                                <img
                                    src={mediaItem.cloudinary_url}
                                    width={mediaItem.recommended_width || 870}
                                    height={mediaItem.recommended_height || 580}
                                    loading="lazy"
                                    style={{ animation: 'icstAboutKenBurns 18s ease-in-out infinite' }}
                                    className="icst-about-anim w-full h-full object-cover block will-change-transform"
                                    alt={mediaItem.alt_text}
                                    onError={(e) => {
                                        const fallback = mediaService.getCachedMediaByKey('home.about.feature')
                                        if (e.currentTarget.src !== fallback.cloudinary_url) {
                                            e.currentTarget.src = fallback.cloudinary_url
                                        }
                                    }}
                                />

                                {/* Minimal Looping Liquid Pill Top-Right */}
                                <div
                                    style={{ animation: 'icstLiquidFloatA 7.5s ease-in-out infinite' }}
                                    className="icst-about-anim hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_24px_-8px_rgba(15,23,42,0.2)] absolute top-3.5 right-3.5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" aria-hidden="true" />
                                    <span className="text-[11px] font-semibold text-[#0F172A]">Practical Labs</span>
                                </div>

                                {/* Overlaid Liquid Glass Campus Lens Card */}
                                <div
                                    style={{ animation: 'icstLiquidFloatB 8.5s ease-in-out infinite' }}
                                    className="icst-about-anim absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs p-3 rounded-2xl bg-white/72 backdrop-blur-md border border-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_16px_34px_-10px_rgba(15,23,42,0.24)] flex items-center gap-3 overflow-hidden"
                                >
                                    <div
                                        aria-hidden="true"
                                        style={{ animation: 'icstGlassSweep 6.5s ease-in-out infinite' }}
                                        className="icst-about-anim absolute inset-y-0 -left-1/2 w-1/2 bg-white/40 skew-x-[-20deg] pointer-events-none"
                                    />
                                    <div className="relative z-10 w-9 h-9 rounded-xl bg-[#2572AB] text-white flex items-center justify-center shrink-0 shadow-xs">
                                        <MapPin size={18} aria-hidden="true" />
                                    </div>
                                    <div className="relative z-10 min-w-0">
                                        <div className="text-xs font-bold text-[#0F172A] truncate">ICST - Chowberia</div>
                                        <div className="text-[11px] text-slate-600 truncate">Practical Computer Science Campus</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Editorial Copy (6 Cols) */}
                    <div className="lg:col-span-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/95 ring-1 ring-slate-200/75 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_6px_16px_-6px_rgba(15,23,42,0.08)] mb-5">
                            <span className="w-2 h-2 rounded-full bg-[#2572AB] animate-pulse" aria-hidden="true" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2572AB]">
                                About Us
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold mb-6 text-[#0F172A] leading-[1.1] tracking-[-0.025em]">
                            Empowering the{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2572AB] via-[#4F46E5] to-[#0EA5E9]">
                                Next Generation
                            </span>{' '}
                            of Tech Leaders
                        </h2>

                        <p className="text-base sm:text-lg text-[#475569] mb-4 leading-relaxed">
                            Institute of Computer Science and Technology (ICST) - Chowberia is a premier institution dedicated to providing high-quality computer education and training.
                        </p>
                        <p className="text-[#64748B] mb-8 leading-relaxed">
                            Our mission is to bridge the gap between academic learning and industry requirements. We offer a wide range of courses designed to equip students with the skills needed to succeed in the ever-evolving tech landscape.
                        </p>

                        {/* Minimal Liquid Glass Highlights */}
                        <div className="space-y-3 mb-9">
                            {HIGHLIGHTS.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.title}
                                        className={`group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white/68 hover:bg-white/88 backdrop-blur-md border border-white/95 ring-1 ring-slate-200/75 ${item.hoverRing} shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_10px_24px_-12px_rgba(15,23,42,0.10)] hover:shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_16px_32px_-12px_rgba(37,114,171,0.18)] transition-all duration-300 hover:-translate-y-0.5`}
                                    >
                                        <div
                                            aria-hidden="true"
                                            style={{ animation: `icstGlassSweep 7s ease-in-out ${item.delay} infinite` }}
                                            className="icst-about-anim absolute inset-y-0 -left-1/3 w-1/3 bg-white/45 skew-x-[-20deg] pointer-events-none"
                                        />
                                        <div
                                            className={`relative z-10 w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border ${item.iconBg} shadow-xs group-hover:scale-105 transition-transform duration-200`}
                                        >
                                            <Icon size={22} aria-hidden="true" />
                                        </div>
                                        <div className="relative z-10 min-w-0 flex-1">
                                            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-0.5">{item.title}</h3>
                                            <p className="text-xs sm:text-sm text-[#64748B] leading-snug mb-0">{item.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <Link
                            to="/about"
                            className="relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold shadow-[0_14px_30px_-8px_rgba(15,23,42,0.32)] hover:-translate-y-0.5 transition-all no-underline group"
                        >
                            <span
                                aria-hidden="true"
                                style={{ animation: 'icstGlassSweep 5.5s ease-in-out infinite' }}
                                className="icst-about-anim absolute inset-y-0 -left-1/2 w-1/2 bg-white/15 skew-x-[-20deg] pointer-events-none"
                            />
                            <span className="relative z-10">Read More About Us</span>
                            <ArrowRight size={17} aria-hidden="true" className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes icstLiquidOrbA {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(28px, 18px, 0) scale(1.06); }
                }
                @keyframes icstLiquidOrbB {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-26px, -20px, 0) scale(1.07); }
                }
                @keyframes icstLiquidFloatA {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(0, -6px, 0); }
                }
                @keyframes icstLiquidFloatB {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(4px, -5px, 0); }
                }
                @keyframes icstAboutKenBurns {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.035); }
                }
                @keyframes icstGlassSweep {
                    0%, 62% { transform: translate3d(-120%, 0, 0) skewX(-20deg); opacity: 0; }
                    72% { opacity: 1; }
                    92%, 100% { transform: translate3d(440%, 0, 0) skewX(-20deg); opacity: 0; }
                }
                @keyframes icstSpecularPulse {
                    0%, 100% { opacity: 0.55; }
                    50% { opacity: 1; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .icst-about-anim { animation: none !important; }
                }
            `}</style>
        </section>
    )
}

export default AboutSection
