import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    IconArrowRight as ArrowRight,
    IconTerminal2 as Terminal2,
    IconCheck as Check,
    IconBrowser,
    IconComponents,
    IconCode,
    IconCpu,
    IconBolt,
    IconServer,
    IconCube,
    IconApi,
    IconDatabase,
    IconStack2,
    IconPalette,
    IconFileCode,
    IconLayout,
    IconBrush,
    IconLayoutGrid,
    IconTemplate,
    IconDeviceDesktop,
    IconCalculator,
    IconFileInvoice,
    IconFileSpreadsheet,
    IconDeviceMobile,
    IconGitBranch,
    IconCloud,
    IconChartBar,
    IconRobot,
    IconWorld
} from '@tabler/icons-react'
import InteractiveRobot, { type HeroTechItem } from '../../common/InteractiveRobot'
import { revealOnScroll } from '../../../lib/motion'

const TALLY_BADGE_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#0F766E"/><path d="M5 7.5h14v2.6h-5.6V18h-2.8v-7.9H5V7.5z" fill="#FFFFFF"/><circle cx="17.5" cy="16.5" r="2" fill="#FBBF24"/></svg>'
    )

const CHATGPT_BADGE_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#10A37F"/><g fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5a3 3 0 0 1 2.6 1.5l2.6 4.5a3 3 0 0 1 0 3l-2.6 4.5a3 3 0 0 1-5.2 0L6.8 14.5a3 3 0 0 1 0-3l2.6-4.5A3 3 0 0 1 12 5.5z"/><circle cx="12" cy="12" r="2.1"/></g></svg>'
    )

const GROUP_SIZE = 8

const shuffleItems = <T,>(items: T[]): T[] => {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

const chunkTechGroups = (items: HeroTechItem[]): HeroTechItem[][] => {
    const groups: HeroTechItem[][] = []
    for (let i = 0; i < items.length; i += GROUP_SIZE) {
        groups.push(items.slice(i, i + GROUP_SIZE))
    }
    return groups
}

const HERO_TECHNOLOGIES = [
    {
        name: 'React',
        tag: 'UI Architecture',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        careerPaths: [
            { label: 'Frontend Dev', icon: IconBrowser },
            { label: 'UI Engineer', icon: IconComponents },
            { label: 'React Dev', icon: IconCode }
        ],
        courseTrack: 'Full Stack Web',
        outcomeSummary: 'Interactive web apps & component systems'
    },
    {
        name: 'Python',
        tag: 'AI & Scripting',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        careerPaths: [
            { label: 'Python Dev', icon: Terminal2 },
            { label: 'Data & AI', icon: IconCpu },
            { label: 'Automation', icon: IconBolt }
        ],
        courseTrack: 'Python & AI',
        outcomeSummary: 'Data analysis, automation & AI workflows'
    },
    {
        name: 'Java',
        tag: 'OOP & Backend',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
        careerPaths: [
            { label: 'Java Dev', icon: IconCode },
            { label: 'Backend Eng', icon: IconServer },
            { label: 'OOP Systems', icon: IconCube }
        ],
        courseTrack: 'Java Programming',
        outcomeSummary: 'Object-oriented systems & backend services'
    },
    {
        name: 'Node.js',
        tag: 'Server Runtime',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        careerPaths: [
            { label: 'Backend API', icon: IconApi },
            { label: 'Server Dev', icon: IconDatabase },
            { label: 'Full Stack', icon: IconStack2 }
        ],
        courseTrack: 'Full Stack Web',
        outcomeSummary: 'REST APIs, databases & server architecture'
    },
    {
        name: 'HTML/CSS',
        tag: 'Web Foundations',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        careerPaths: [
            { label: 'Web Designer', icon: IconPalette },
            { label: 'UI Markup', icon: IconFileCode },
            { label: 'Landing Dev', icon: IconLayout }
        ],
        courseTrack: 'Web Designing (DWD)',
        outcomeSummary: 'Semantic layout & responsive web craft'
    },
    {
        name: 'Tailwind',
        tag: 'Design Tokens',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        careerPaths: [
            { label: 'UI Designer', icon: IconBrush },
            { label: 'Design Sys', icon: IconLayoutGrid },
            { label: 'Frontend Dev', icon: IconBrowser }
        ],
        courseTrack: 'Web Designing (DWD)',
        outcomeSummary: 'Modern token-driven interface design'
    },
    {
        name: 'Bootstrap',
        tag: 'Responsive Grid',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
        careerPaths: [
            { label: 'Web Builder', icon: IconLayoutGrid },
            { label: 'Theme Dev', icon: IconTemplate },
            { label: 'Frontend UI', icon: IconDeviceDesktop }
        ],
        courseTrack: 'Web Designing (DWD)',
        outcomeSummary: 'Fast responsive websites & templates'
    },
    {
        name: 'Tally/DCA',
        tag: 'Office & GST',
        iconUrl: TALLY_BADGE_SVG,
        careerPaths: [
            { label: 'Accounts Exec', icon: IconCalculator },
            { label: 'GST Operator', icon: IconFileInvoice },
            { label: 'Back Office', icon: IconFileSpreadsheet }
        ],
        courseTrack: 'DCA / TallyPrime',
        outcomeSummary: 'GST compliance, Excel & office workflows'
    },
    {
        name: 'Next.js',
        tag: 'Full Stack SSR',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
        careerPaths: [
            { label: 'Full Stack', icon: IconStack2 },
            { label: 'React Lead', icon: IconBrowser },
            { label: 'SEO Web Dev', icon: IconWorld }
        ],
        courseTrack: 'Full Stack Web',
        outcomeSummary: 'Production server-rendered React apps'
    },
    {
        name: 'TypeScript',
        tag: 'Typed JavaScript',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        careerPaths: [
            { label: 'Frontend Eng', icon: IconCode },
            { label: 'Full Stack', icon: IconStack2 },
            { label: 'UI Architect', icon: IconComponents }
        ],
        courseTrack: 'Full Stack Web',
        outcomeSummary: 'Type-safe scalable application engineering'
    },
    {
        name: 'JavaScript',
        tag: 'Web Core',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        careerPaths: [
            { label: 'Web Developer', icon: IconWorld },
            { label: 'Frontend Dev', icon: IconBrowser },
            { label: 'Script Dev', icon: Terminal2 }
        ],
        courseTrack: 'Web Designing (DWD)',
        outcomeSummary: 'Interactive DOM logic & modern ES6+'
    },
    {
        name: 'MongoDB',
        tag: 'NoSQL Database',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
        careerPaths: [
            { label: 'Backend Dev', icon: IconServer },
            { label: 'DB Engineer', icon: IconDatabase },
            { label: 'MERN Stack', icon: IconStack2 }
        ],
        courseTrack: 'Full Stack Web',
        outcomeSummary: 'Document schemas, queries & cloud clusters'
    },
    {
        name: 'MySQL',
        tag: 'Relational SQL',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
        careerPaths: [
            { label: 'SQL Developer', icon: IconDatabase },
            { label: 'Data Analyst', icon: IconChartBar },
            { label: 'Backend Eng', icon: IconServer }
        ],
        courseTrack: 'SQL & Backend',
        outcomeSummary: 'Structured database modeling & joins'
    },
    {
        name: 'C++',
        tag: 'DSA & Systems',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
        careerPaths: [
            { label: 'Software Dev', icon: IconCode },
            { label: 'DSA Trainee', icon: IconCpu },
            { label: 'System Eng', icon: IconCube }
        ],
        courseTrack: 'C & C++ Foundations',
        outcomeSummary: 'Core algorithms, memory & problem solving'
    },
    {
        name: 'Git',
        tag: 'Version Control',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        careerPaths: [
            { label: 'Software Dev', icon: IconGitBranch },
            { label: 'Team Coder', icon: IconCode },
            { label: 'DevOps Trainee', icon: IconCloud }
        ],
        courseTrack: 'Developer Workflow',
        outcomeSummary: 'Branching, merging & collaborative coding'
    },
    {
        name: 'GitHub',
        tag: 'Code Hosting',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
        careerPaths: [
            { label: 'Portfolio Dev', icon: IconGitBranch },
            { label: 'Open Source', icon: IconWorld },
            { label: 'Web Developer', icon: IconBrowser }
        ],
        courseTrack: 'Developer Workflow',
        outcomeSummary: 'Pull requests & project portfolios'
    },
    {
        name: 'Docker',
        tag: 'Containers',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        careerPaths: [
            { label: 'DevOps Eng', icon: IconCloud },
            { label: 'Cloud Dev', icon: IconServer },
            { label: 'Deploy Lead', icon: IconCube }
        ],
        courseTrack: 'Cloud & Backend',
        outcomeSummary: 'Portable app packaging & deployment'
    },
    {
        name: 'Linux',
        tag: 'OS & Servers',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
        careerPaths: [
            { label: 'Sys Admin', icon: IconServer },
            { label: 'Cloud Trainee', icon: IconCloud },
            { label: 'Cyber Ops', icon: Terminal2 }
        ],
        courseTrack: 'Linux & Security',
        outcomeSummary: 'Shell workflows, servers & security basics'
    },
    {
        name: 'Flutter',
        tag: 'Mobile UI',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
        careerPaths: [
            { label: 'Mobile Dev', icon: IconDeviceMobile },
            { label: 'App Builder', icon: IconComponents },
            { label: 'UI Engineer', icon: IconBrush }
        ],
        courseTrack: 'Cross-Platform Apps',
        outcomeSummary: 'Android & iOS apps from one codebase'
    },
    {
        name: 'Django',
        tag: 'Python Backend',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
        careerPaths: [
            { label: 'Python Backend', icon: IconServer },
            { label: 'Web API Dev', icon: IconApi },
            { label: 'Full Stack', icon: IconStack2 }
        ],
        courseTrack: 'Python Programming & AI',
        outcomeSummary: 'Rapid secure web backends & admin portals'
    },
    {
        name: 'PyTorch',
        tag: 'Deep Learning',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
        careerPaths: [
            { label: 'ML Trainee', icon: IconCpu },
            { label: 'AI Developer', icon: IconRobot },
            { label: 'Data Sci Prep', icon: IconChartBar }
        ],
        courseTrack: 'Python & AI',
        outcomeSummary: 'Neural nets, tensors & AI model workflows'
    },
    {
        name: 'ChatGPT',
        tag: 'Applied AI',
        iconUrl: CHATGPT_BADGE_SVG,
        careerPaths: [
            { label: 'Prompt Eng', icon: IconRobot },
            { label: 'AI Assistant', icon: IconBolt },
            { label: 'Smart Office', icon: IconFileSpreadsheet }
        ],
        courseTrack: 'Applied AI Tools',
        outcomeSummary: 'Prompt workflows & smart productivity'
    },
    {
        name: 'Gemini AI',
        tag: 'Multimodal AI',
        iconUrl: 'https://cdn.simpleicons.org/googlegemini/4285F4',
        careerPaths: [
            { label: 'AI Builder', icon: IconRobot },
            { label: 'Automation', icon: IconBolt },
            { label: 'Research Ops', icon: IconChartBar }
        ],
        courseTrack: 'Applied AI Tools',
        outcomeSummary: 'Research synthesis & multimodal coding'
    },
    {
        name: 'MS Excel',
        tag: 'MIS & Data',
        iconUrl: 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_excel.svg',
        careerPaths: [
            { label: 'MIS Executive', icon: IconChartBar },
            { label: 'Data Operator', icon: IconFileSpreadsheet },
            { label: 'Office Admin', icon: IconCalculator }
        ],
        courseTrack: 'DCA / ADCA Office',
        outcomeSummary: 'Pivot tables, formulas & business reports'
    }
]

const HeroSection = () => {
    const [techGroups, setTechGroups] = useState<HeroTechItem[][]>(() =>
        chunkTechGroups(HERO_TECHNOLOGIES)
    )
    const [activeSlot, setActiveSlot] = useState({ group: 0, item: 0 })
    const [isPaused, setIsPaused] = useState(false)
    const heroContentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setTechGroups(chunkTechGroups(shuffleItems(HERO_TECHNOLOGIES)))
    }, [])

    useEffect(() => {
        if (isPaused) return
        const techInterval = setInterval(() => {
            setActiveSlot((prev) => {
                const groupLen = techGroups[prev.group]?.length || GROUP_SIZE
                if (prev.item + 1 < groupLen) {
                    return { group: prev.group, item: prev.item + 1 }
                }
                return {
                    group: (prev.group + 1) % techGroups.length,
                    item: 0
                }
            })
        }, 2400)
        return () => clearInterval(techInterval)
    }, [isPaused, techGroups])

    useEffect(() => {
        if (!heroContentRef.current) return
        return revealOnScroll(heroContentRef.current, { translateY: 14, duration: 550 })
    }, [])

    const currentGroup = techGroups[activeSlot.group] || techGroups[0]
    const activeTech = currentGroup[activeSlot.item] || currentGroup[0]

    return (
        <section className="relative pt-28 pb-18 md:pt-34 md:pb-24 lg:pt-38 lg:pb-28 bg-[#FFFFFF] overflow-hidden">
            {/* Subtle Architectural Grid Backdrop */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div
                    className="absolute inset-0 opacity-[0.42]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(15, 23, 42, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 30%, transparent 100%)'
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-12">
                    {/* Left Column (6 Cols): Editorial Display Typography */}
                    <div
                        ref={heroContentRef}
                        className="lg:col-span-6 text-center lg:text-left order-2 lg:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] text-[#475569] rounded-full text-xs font-medium mb-6 border border-slate-200/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                            <span>ICST Chowberia · Career IT Institute</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[4.15rem] font-semibold mb-6 text-[#0F172A] leading-[1.06] tracking-[-0.03em]">
                            Master <span className="text-[#2572AB]">Modern</span> Technologies
                        </h1>

                        <p className="text-[#475569] mb-8 text-base md:text-lg lg:text-[1.18rem] leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Join ICST - Chowberia to become an expert in industry-standard tools and frameworks.
                        </p>

                        {/* Primary CTA */}
                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-10">
                            <Link
                                to="/courses"
                                className="group px-7 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 no-underline"
                            >
                                <span>Explore Courses</span>
                                <ArrowRight size={18} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                            </Link>
                        </div>

                        {/* Editorial Credential Strip */}
                        <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs font-medium text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#2572AB]/10 text-[#2572AB] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.5} aria-hidden="true" />
                                </span>
                                Certified Courses
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#2572AB]/10 text-[#2572AB] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.5} aria-hidden="true" />
                                </span>
                                Hands-on Training
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-[#2572AB]/10 text-[#2572AB] inline-flex items-center justify-center">
                                    <Check size={10} strokeWidth={2.5} aria-hidden="true" />
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
                                technologies={currentGroup}
                                activeIndex={activeSlot.item}
                                onSelectTech={(idx) => setActiveSlot((prev) => ({ ...prev, item: idx }))}
                                groupIndex={activeSlot.group}
                                groupCount={techGroups.length}
                                onSelectGroup={(groupIdx) => setActiveSlot({ group: groupIdx, item: 0 })}
                                isAutoRotatePaused={isPaused}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
