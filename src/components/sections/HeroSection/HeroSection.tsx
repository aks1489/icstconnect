import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    IconAtom as Atom,
    IconBox as Box,
    IconFileCode2 as FileCode2,
    IconWind as Wind,
    IconBrandPython as BrandPython,
    IconCoffee as Coffee,
    IconHtml as HtmlIcon,
    IconCalculator as Calculator,
    IconArrowRight as ArrowRight,
    IconPlayerPlay as PlayCircle,
    IconSparkles as Sparkles,
    IconX as X,
    IconTerminal2 as Terminal2,
    IconCertificate as Certificate,
    IconCheck as Check
} from '@tabler/icons-react'
import icstLabsLogo from '../../../assets/icst-labs-logo.webp'
import InteractiveRobot from '../../common/InteractiveRobot'
import { revealOnScroll } from '../../../lib/motion'

const HERO_TECHNOLOGIES = [
    { name: 'React', tag: 'UI Architecture', color: '#0284C7', bgTint: 'rgba(2, 132, 199, 0.10)', borderTint: 'rgba(2, 132, 199, 0.25)', icon: Atom },
    { name: 'Python', tag: 'AI & Scripting', color: '#2572AB', bgTint: 'rgba(37, 114, 171, 0.10)', borderTint: 'rgba(37, 114, 171, 0.25)', icon: BrandPython },
    { name: 'Java', tag: 'OOP & Backend', color: '#D97706', bgTint: 'rgba(217, 119, 6, 0.10)', borderTint: 'rgba(217, 119, 6, 0.25)', icon: Coffee },
    { name: 'Node.js', tag: 'Server Runtime', color: '#059669', bgTint: 'rgba(5, 150, 105, 0.10)', borderTint: 'rgba(5, 150, 105, 0.25)', icon: FileCode2 },
    { name: 'HTML / CSS', tag: 'Web Foundations', color: '#E11D48', bgTint: 'rgba(225, 29, 72, 0.09)', borderTint: 'rgba(225, 29, 72, 0.24)', icon: HtmlIcon },
    { name: 'TailwindCSS', tag: 'Design Tokens', color: '#0891B2', bgTint: 'rgba(8, 145, 178, 0.10)', borderTint: 'rgba(8, 145, 178, 0.25)', icon: Wind },
    { name: 'Bootstrap', tag: 'Responsive Grid', color: '#4F46E5', bgTint: 'rgba(79, 70, 229, 0.10)', borderTint: 'rgba(79, 70, 229, 0.25)', icon: Box },
    { name: 'Tally & DCA', tag: 'Office & GST', color: '#7C3AED', bgTint: 'rgba(124, 58, 237, 0.10)', borderTint: 'rgba(124, 58, 237, 0.25)', icon: Calculator }
]

const HeroSection = () => {
    const [currentTechIndex, setCurrentTechIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [showDemoModal, setShowDemoModal] = useState(false)
    const heroContentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isPaused) return
        const techInterval = setInterval(() => {
            setCurrentTechIndex((prev) => (prev + 1) % HERO_TECHNOLOGIES.length)
        }, 2400)
        return () => clearInterval(techInterval)
    }, [isPaused])

    useEffect(() => {
        if (!heroContentRef.current) return
        return revealOnScroll(heroContentRef.current, { translateY: 14, duration: 550 })
    }, [])

    const activeTech = HERO_TECHNOLOGIES[currentTechIndex]

    return (
        <section className="relative pt-28 pb-18 md:pt-34 md:pb-24 lg:pt-38 lg:pb-28 bg-gradient-to-b from-[#FFFFFF] via-[#FAFBFD] to-[#FFFFFF] overflow-hidden">
            {/* Soft Multi-Layered Aurora Mesh & Architectural Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.42]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 30%, transparent 100%)'
                    }}
                />
                <div className="absolute -top-40 -left-24 w-[620px] h-[620px] bg-[radial-gradient(circle,rgba(56,189,248,0.20)_0%,transparent_65%)]" />
                <div className="absolute top-6 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(79,70,229,0.14)_0%,transparent_65%)]" />
                <div className="absolute -bottom-36 left-1/3 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(251,146,60,0.10)_0%,transparent_65%)]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-12">
                    {/* Left Column (6 Cols): Editorial Display Typography */}
                    <div
                        ref={heroContentRef}
                        className="lg:col-span-6 text-center lg:text-left order-2 lg:order-1"
                    >
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#FFFFFF]/95 backdrop-blur-md text-[#0F172A] rounded-full text-xs font-semibold mb-7 border border-slate-200/90 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.08)]">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#2572AB] via-[#4F46E5] to-[#0EA5E9] text-white inline-flex items-center justify-center shadow-xs">
                                <Sparkles size={11} aria-hidden="true" />
                            </span>
                            <span className="tracking-wide">Start your journey today</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[4.15rem] font-extrabold mb-6 text-[#0F172A] leading-[1.04] tracking-[-0.035em]">
                            Master{' '}
                            <span className="relative inline-block">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2572AB] via-[#4F46E5] to-[#0EA5E9]">
                                    Modern
                                </span>
                                {/* Subtle Editorial Vector Flourish */}
                                <svg
                                    viewBox="0 0 220 14"
                                    fill="none"
                                    aria-hidden="true"
                                    className="absolute -bottom-1.5 left-0 w-full h-3 pointer-events-none"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M2 10.5C58 2.5 142 1.5 218 8.5"
                                        stroke="url(#icstHeroUnderline)"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="icstHeroUnderline" x1="2" y1="7" x2="218" y2="7" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#2572AB" />
                                            <stop offset="0.55" stopColor="#4F46E5" />
                                            <stop offset="1" stopColor="#0EA5E9" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>{' '}
                            Technologies
                        </h1>

                        <p className="text-[#475569] mb-9 text-base md:text-lg lg:text-[1.22rem] leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Join ICST - Chowberia to become an expert in industry-standard tools and frameworks.
                        </p>

                        {/* Elevated Primary & Glass Secondary CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-10">
                            <Link
                                to="/courses"
                                className="group relative overflow-hidden px-7 py-4 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#1B3A61] to-[#2572AB] hover:from-[#162238] hover:to-[#1E5E91] text-white font-semibold shadow-[0_16px_34px_-8px_rgba(37,114,171,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 no-underline"
                            >
                                <span className="relative z-10">Explore Courses</span>
                                <ArrowRight size={18} aria-hidden="true" className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowDemoModal(true)}
                                className="px-7 py-4 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-md text-[#0F172A] font-semibold border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_18px_-6px_rgba(15,23,42,0.10)] hover:border-[#2572AB]/50 hover:bg-slate-50/90 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <PlayCircle size={19} aria-hidden="true" className="text-[#2572AB]" />
                                <span>Watch Demo</span>
                            </button>
                        </div>

                        {/* Subtle Editorial Credential Strip */}
                        <div className="pt-6 border-t border-slate-200/75 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-medium text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#059669] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.75} aria-hidden="true" />
                                </span>
                                Certified Courses
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-sky-50 border border-sky-200/70 text-[#2572AB] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.75} aria-hidden="true" />
                                </span>
                                Hands-on Training
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200/70 text-[#4F46E5] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.75} aria-hidden="true" />
                                </span>
                                Expert Mentors
                            </span>
                        </div>
                    </div>

                    {/* Right Column (6 Cols): Frosted Aura Bot & Curriculum Dock */}
                    <div
                        className="lg:col-span-6 order-1 lg:order-2 flex justify-center"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onFocus={() => setIsPaused(true)}
                        onBlur={() => setIsPaused(false)}
                    >
                        <div className="w-full max-w-md lg:max-w-[500px] relative">
                            <InteractiveRobot
                                activeTech={activeTech}
                                technologies={HERO_TECHNOLOGIES}
                                activeIndex={currentTechIndex}
                                onSelectTech={setCurrentTechIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Lab & Curriculum Demo Preview Modal */}
            {showDemoModal && (
                <div
                    className="fixed inset-0 z-[1080] bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="hero-demo-title"
                    onClick={() => setShowDemoModal(false)}
                >
                    <div
                        className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl border border-slate-200 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.35)] p-6 sm:p-7 text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#2572AB] mb-2">
                                    ICST Chowberia Experience
                                </span>
                                <h3 id="hero-demo-title" className="text-xl font-bold text-[#0F172A] tracking-tight">
                                    Inside Our Practical Tech Training
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDemoModal(false)}
                                aria-label="Close demo preview"
                                className="p-2 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="py-5 space-y-3">
                            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
                                <div className="w-10 h-10 rounded-xl bg-[#2572AB]/10 text-[#2572AB] flex items-center justify-center shrink-0">
                                    <Terminal2 size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-[#0F172A]">100% Individual Lab Workstations</h4>
                                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                                        Every student codes and practices on a dedicated PC with guided mentor support.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
                                <div className="w-10 h-10 rounded-xl bg-white border border-sky-200/80 shadow-xs flex items-center justify-center shrink-0">
                                    <img
                                        src={icstLabsLogo}
                                        alt="ICST Labs logo"
                                        width={26}
                                        height={26}
                                        loading="lazy"
                                        className="w-6.5 h-6.5 object-contain"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-[#0F172A]">Interactive ICST Labs &amp; Typing Tutor</h4>
                                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                                        Practice real computer concepts through 50+ interactive simulations and online assessments.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
                                <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                                    <Certificate size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-[#0F172A]">Recognized IT Diplomas &amp; Tracks</h4>
                                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                                        From DCA &amp; ADCA to Python, Java, Tally, and Full Stack Web Development.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
                            <a
                                href="https://labs.icstconnect.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors no-underline inline-flex items-center gap-2"
                            >
                                <img
                                    src={icstLabsLogo}
                                    alt=""
                                    aria-hidden="true"
                                    width={18}
                                    height={18}
                                    loading="lazy"
                                    className="w-4.5 h-4.5 object-contain"
                                />
                                <span>Try ICST Labs</span>
                            </a>
                            <Link
                                to="/courses"
                                onClick={() => setShowDemoModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white text-xs sm:text-sm font-semibold transition-colors no-underline inline-flex items-center gap-1.5"
                            >
                                <span>Browse Courses</span>
                                <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default HeroSection
