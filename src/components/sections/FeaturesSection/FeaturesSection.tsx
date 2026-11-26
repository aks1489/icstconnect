import { useEffect, useRef, useState } from 'react'
import { IconUserCheck as UserCheck, IconDeviceLaptop as Laptop, IconBriefcase as Briefcase, IconClock as Clock } from '@tabler/icons-react'
import { staggerIn, revealOnScroll } from '../../../lib/motion'

const FeaturesSection = () => {
    const headerRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 })

    const features = [
        {
            num: '01',
            title: 'Expert Faculty',
            description: 'Learn from industry experts with years of real-world experience.',
            icon: UserCheck
        },
        {
            num: '02',
            title: 'Hands-on Training',
            description: 'Practical learning with live projects and assignments.',
            icon: Laptop
        },
        {
            num: '03',
            title: 'Placement Assistance',
            description: 'Dedicated support to help you land your dream job.',
            icon: Briefcase
        },
        {
            num: '04',
            title: 'Flexible Learning',
            description: 'Online and offline classes to suit your schedule.',
            icon: Clock
        }
    ]

    useEffect(() => {
        const cleanups: Array<() => void> = []
        if (headerRef.current) {
            cleanups.push(revealOnScroll(headerRef.current, { translateY: 14, duration: 500 }))
        }
        if (gridRef.current) {
            const el = gridRef.current
            const observer = new IntersectionObserver(
                (entries, obs) => {
                    if (entries[0]?.isIntersecting) {
                        obs.unobserve(el)
                        staggerIn(el, '.icst-feature-card', 70)
                    }
                },
                { threshold: 0.15 }
            )
            observer.observe(el)
            cleanups.push(() => observer.disconnect())
        }
        return () => cleanups.forEach((fn) => fn())
    }, [])

    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoveredIndex(index)
        setSpotlightPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    return (
        <section className="py-22 lg:py-26 bg-[#FFFFFF]" id="features">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    {/* Left Sticky Editorial Narrative (4 Cols) */}
                    <div ref={headerRef} className="lg:col-span-4 lg:sticky lg:top-28 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="h-px w-6 bg-[#2572AB] hidden lg:inline-block" aria-hidden="true" />
                            <span className="text-xs font-medium text-[#2572AB]">
                                ICST Advantage
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold mb-4 text-[#0F172A] tracking-[-0.025em] leading-[1.1]">
                            Why Choose Us?
                        </h2>
                        <p className="text-base sm:text-lg text-[#475569] leading-relaxed mb-0">
                            We provide top-notch education and training to help you succeed in the competitive IT industry.
                        </p>
                    </div>

                    {/* Right 2x2 Spotlight Bento Grid (8 Cols) */}
                    <div ref={gridRef} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {features.map((feature, index) => (
                            <div key={index} className="icst-feature-card group">
                                <div
                                    onMouseMove={(e) => handleCardMouseMove(e, index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className="relative bg-[#F8FAFC] hover:bg-[#FFFFFF] rounded-2xl p-7 h-full border border-slate-200/85 hover:border-[#2572AB]/45 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_18px_36px_-16px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Interactive Cursor-Tracking Hairline Wash */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-200"
                                        style={{
                                            opacity: hoveredIndex === index ? 1 : 0,
                                            background: `radial-gradient(320px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(37, 114, 171, 0.07), transparent 65%)`
                                        }}
                                    />

                                    <div className="relative z-10 flex items-start justify-between mb-8">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#2572AB]/10 text-[#2572AB]">
                                            <feature.icon size={24} aria-hidden="true" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 tabular-nums transition-colors duration-150">
                                            {feature.num}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-semibold mb-2 text-[#0F172A] tracking-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#64748B] text-sm leading-relaxed mb-0">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
