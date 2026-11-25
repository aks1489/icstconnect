import { useEffect, useRef } from 'react'
import { IconStar as Star, IconExternalLink } from '@tabler/icons-react'
import icstLabsLogo from '../../assets/icst-labs-logo.webp'
import OrbitalLabCarousel from './OrbitalLabCarousel'
import { revealOnScroll } from '../../lib/motion'

const LearningHubPreview = () => {
    const sectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!sectionRef.current) return
        return revealOnScroll(sectionRef.current, { translateY: 16, duration: 550 })
    }, [])

    return (
        <section
            id="learning-hub"
            className="py-22 bg-gradient-to-b from-[#F4F8FD] via-[#FFFFFF] to-[#F8FAFC] border-y border-slate-200/75 relative overflow-x-clip overflow-y-hidden"
        >
            {/* Soft Light Aurora Washes & Subtle Dot Grid */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.45]"
                    style={{
                        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        maskImage: 'radial-gradient(ellipse 80% 75% at 65% 50%, black 25%, transparent 100%)'
                    }}
                />
                <div className="absolute -top-24 right-0 w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,transparent_65%)]" />
                <div className="absolute -bottom-24 left-0 w-[440px] h-[440px] bg-[radial-gradient(circle,rgba(79,70,229,0.10)_0%,transparent_65%)]" />
            </div>

            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-10">
                    {/* Left Editorial Content (5 Cols) */}
                    <div className="lg:col-span-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#FFFFFF] border border-[#BFDBFE] rounded-full text-[#2572AB] font-semibold text-xs uppercase tracking-[0.12em] mb-6 shadow-xs">
                            <img
                                src={icstLabsLogo}
                                alt="ICST Labs logo"
                                width={22}
                                height={22}
                                loading="lazy"
                                className="w-5.5 h-5.5 object-contain shrink-0"
                            />
                            <span>ICST Labs · New Feature</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] mb-6 leading-[1.08] tracking-[-0.025em]">
                            Master Computers <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2572AB] via-[#4F46E5] to-[#0EA5E9]">
                                The Fun Way
                            </span>
                        </h2>

                        <p className="text-[#475569] text-base sm:text-lg mb-8 leading-relaxed">
                            Dive into our new <strong className="text-[#0F172A] font-semibold">Learning Hub</strong>! Build PCs, fight viruses, and master keyboard skills with 50+ interactive mini-games designed for students.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                            <a
                                href="https://labs.icstconnect.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-7 py-4 bg-gradient-to-r from-[#0F172A] via-[#1B3A61] to-[#2572AB] hover:from-[#162238] hover:to-[#1E5E91] text-white rounded-xl font-semibold text-base shadow-[0_14px_30px_-8px_rgba(37,114,171,0.42)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 group no-underline"
                            >
                                <span className="w-6.5 h-6.5 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
                                    <img
                                        src={icstLabsLogo}
                                        alt=""
                                        aria-hidden="true"
                                        width={20}
                                        height={20}
                                        loading="lazy"
                                        className="w-5 h-5 object-contain"
                                    />
                                </span>
                                <span>Launch Labs</span>
                                <IconExternalLink size={17} aria-hidden="true" className="opacity-80 group-hover:opacity-100 transition-opacity" />
                            </a>

                            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[#FFFFFF] border border-slate-200/90 rounded-xl shadow-xs justify-center">
                                <div className="flex items-center gap-0.5 text-[#F59E0B]" aria-label="5 out of 5 rating">
                                    <Star fill="currentColor" size={15} aria-hidden="true" />
                                    <Star fill="currentColor" size={15} aria-hidden="true" />
                                    <Star fill="currentColor" size={15} aria-hidden="true" />
                                    <Star fill="currentColor" size={15} aria-hidden="true" />
                                    <Star fill="currentColor" size={15} aria-hidden="true" />
                                </div>
                                <span className="text-[#0F172A] font-semibold text-xs sm:text-sm tabular-nums">50+ Levels</span>
                            </div>
                        </div>
                    </div>

                    {/* Right 3D Orbital ICST Labs Carousel (7 Cols) */}
                    <div className="lg:col-span-7 w-full">
                        <OrbitalLabCarousel />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LearningHubPreview
