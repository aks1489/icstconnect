import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { IconRosetteDiscountCheck as BadgeCheck, IconUsers as Users, IconArrowRight as ArrowRight, IconMapPin as MapPin } from '@tabler/icons-react'
import { mediaService, type SiteMediaItem } from '../../../services/mediaService'
import { revealOnScroll } from '../../../lib/motion'

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
        <section className="py-22 lg:py-28 bg-[#FFFFFF] relative overflow-hidden" id="about">
            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
                    {/* Left Photo Showcase (6 Cols) with Gradient Hairline Mat & Frosted Badge */}
                    <div className="lg:col-span-6 relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#2572AB]/14 via-[#4F46E5]/10 to-[#0EA5E9]/14 rounded-[2.2rem] blur-2xl -z-10" aria-hidden="true" />
                        <div className="p-[1px] rounded-[1.92rem] bg-gradient-to-br from-slate-200/90 via-[#BAE6FD]/80 to-[#C7D2FE]/80 shadow-[0_28px_60px_-18px_rgba(15,23,42,0.22)]">
                            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-3xl bg-[#FFFFFF] p-1.5">
                                <div className="relative w-full h-full overflow-hidden rounded-[1.2rem]">
                                    <img
                                        src={mediaItem.cloudinary_url}
                                        width={mediaItem.recommended_width || 870}
                                        height={mediaItem.recommended_height || 580}
                                        loading="lazy"
                                        className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700 block"
                                        alt={mediaItem.alt_text}
                                        onError={(e) => {
                                            const fallback = mediaService.getCachedMediaByKey('home.about.feature')
                                            if (e.currentTarget.src !== fallback.cloudinary_url) {
                                                e.currentTarget.src = fallback.cloudinary_url
                                            }
                                        }}
                                    />

                                    {/* Overlaid Frosted Institutional Badge */}
                                    <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs p-3 rounded-2xl bg-[#FFFFFF]/90 backdrop-blur-xl border border-white/85 shadow-[0_14px_30px_-10px_rgba(15,23,42,0.3)] flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2572AB] to-[#0EA5E9] text-white flex items-center justify-center shrink-0">
                                            <MapPin size={18} aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-[#0F172A] truncate">ICST - Chowberia</div>
                                            <div className="text-[11px] text-slate-500 truncate">Practical Computer Science Campus</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Editorial Copy (6 Cols) */}
                    <div className="lg:col-span-6">
                        <div className="inline-flex items-center gap-2.5 mb-4">
                            <span className="h-px w-6 bg-[#2572AB]" aria-hidden="true" />
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#2572AB]">
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

                        <div className="space-y-3 mb-9">
                            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/85 hover:border-[#2572AB]/40 hover:bg-[#FFFFFF] hover:shadow-[0_12px_28px_-14px_rgba(37,114,171,0.22)] transition-all duration-200">
                                <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-[#2572AB]/10 text-[#2572AB] rounded-xl group-hover:scale-105 transition-transform">
                                    <BadgeCheck size={22} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-0.5">Certified Courses</h3>
                                    <p className="text-xs sm:text-sm text-[#64748B] leading-snug mb-0">Industry recognized certifications upon completion.</p>
                                </div>
                            </div>

                            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/85 hover:border-[#059669]/40 hover:bg-[#FFFFFF] hover:shadow-[0_12px_28px_-14px_rgba(5,150,105,0.20)] transition-all duration-200">
                                <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-[#059669]/10 text-[#059669] rounded-xl group-hover:scale-105 transition-transform">
                                    <Users size={22} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-0.5">Expert Mentors</h3>
                                    <p className="text-xs sm:text-sm text-[#64748B] leading-snug mb-0">Learn directly from experienced industry professionals.</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold shadow-[0_12px_28px_-8px_rgba(15,23,42,0.32)] hover:-translate-y-0.5 transition-all no-underline group"
                        >
                            <span>Read More About Us</span>
                            <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
