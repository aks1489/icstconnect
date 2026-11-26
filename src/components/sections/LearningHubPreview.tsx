import { useEffect, useRef } from 'react'
import { IconDeviceGamepad2 as Gamepad2, IconExternalLink } from '@tabler/icons-react'
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
            className="py-22 bg-gradient-to-b from-[#F4F8FD] via-[#FFFFFF] to-[#F8FAFC] border-t border-slate-200/75 relative overflow-x-clip overflow-y-hidden"
        >
            {/* Subtle Drafting Dot Grid */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.42]"
                    style={{
                        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        maskImage: 'radial-gradient(ellipse 80% 75% at 65% 50%, black 25%, transparent 100%)'
                    }}
                />
            </div>

            <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-10">
                    {/* Left Editorial Content (5 Cols) */}
                    <div className="lg:col-span-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border border-slate-200/90 rounded-full text-[#2572AB] font-medium text-xs mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                            <span>ICST Labs · Interactive Practice</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 mb-6">
                            <div className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-2xl bg-[#FFFFFF] border border-slate-200/90 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.14)] p-2 flex items-center justify-center shrink-0">
                                <img
                                    src={icstLabsLogo}
                                    alt="ICST Labs emblem"
                                    width={60}
                                    height={60}
                                    loading="lazy"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <h2 className="text-3xl sm:text-4xl xl:text-[2.6rem] font-semibold text-[#0F172A] mb-0 leading-[1.08] tracking-[-0.025em]">
                                Master Computers <br />
                                <span className="text-[#2572AB]">The Fun Way</span>
                            </h2>
                        </div>

                        <p className="text-[#475569] text-base sm:text-lg mb-8 leading-relaxed">
                            Explore our interactive <strong className="text-[#0F172A] font-semibold">Learning Hub</strong>. Build PCs, fight viruses, and practice typing across 50+ guided student simulations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                            <a
                                href="https://labs.icstconnect.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-7 py-3.5 bg-[#0F172A] hover:bg-[#2572AB] text-white rounded-xl font-semibold text-base shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 active:translate-y-0 transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center gap-2.5 group no-underline"
                            >
                                <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0">
                                    <img
                                        src={icstLabsLogo}
                                        alt=""
                                        aria-hidden="true"
                                        width={18}
                                        height={18}
                                        loading="lazy"
                                        className="w-4.5 h-4.5 object-contain"
                                    />
                                </span>
                                <span>Launch Labs</span>
                                <IconExternalLink size={17} aria-hidden="true" className="opacity-80 group-hover:opacity-100 transition-opacity duration-150" />
                            </a>

                            <div className="flex items-center gap-2 px-4 py-3.5 bg-[#FFFFFF] border border-slate-200/90 rounded-xl justify-center text-[#0F172A] font-medium text-xs sm:text-sm tabular-nums">
                                <Gamepad2 size={16} className="text-[#2572AB] shrink-0" aria-hidden="true" />
                                <span>50+ Lab Levels</span>
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
