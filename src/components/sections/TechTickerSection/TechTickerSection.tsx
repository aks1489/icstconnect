import React, { useState, useRef, useEffect } from 'react'
import TechPopup from '../../ui/TechPopup'

interface TechItem {
    name: string
    iconUrl: string
    color: string
    chipBg: string
    description: string
    keyPoints: string[]
    opportunities: string
}

const TALLY_BADGE_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#0F766E"/><path d="M5 7.5h14v2.6h-5.6V18h-2.8v-7.9H5V7.5z" fill="#FFFFFF"/><circle cx="17.5" cy="16.5" r="2" fill="#FBBF24"/></svg>'
    )

const TECH_ITEMS: TechItem[] = [
    {
        name: 'React',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'The most popular library for building modern, interactive user interfaces.',
        keyPoints: ['Component-Based', 'Virtual DOM', 'Huge Ecosystem'],
        opportunities: 'Frontend Developer, React Native Developer'
    },
    {
        name: 'Next.js',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
        color: '#0F172A',
        chipBg: 'rgba(15, 23, 42, 0.07)',
        description: 'The React Framework for the Web. Used by some of the world\'s largest companies.',
        keyPoints: ['Server-Side Rendering', 'Static Site Gen', 'SEO Friendly'],
        opportunities: 'React Developer, Full Stack Engineer'
    },
    {
        name: 'JavaScript',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        color: '#CA8A04',
        chipBg: 'rgba(234, 179, 8, 0.14)',
        description: 'The core programming language powering interactive websites and web applications.',
        keyPoints: ['DOM Manipulation', 'Async / Promises', 'Full-Stack ES6+'],
        opportunities: 'Web Developer, Frontend Engineer'
    },
    {
        name: 'TypeScript',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'JavaScript with syntax for types. Adds safety and scalability to your code.',
        keyPoints: ['Static Typing', 'Better Tooling', 'Scalable'],
        opportunities: 'Senior Frontend Dev, Full Stack Developer'
    },
    {
        name: 'HTML5',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Semantic markup foundation structuring every modern webpage and web application.',
        keyPoints: ['Semantic Tags', 'Accessible Web', 'Multimedia Ready'],
        opportunities: 'Web Designer, UI Developer'
    },
    {
        name: 'CSS3',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        color: '#2563EB',
        chipBg: 'rgba(37, 99, 235, 0.10)',
        description: 'Visual styling engine for responsive grids, Flexbox, and fluid web animations.',
        keyPoints: ['Flexbox & Grid', 'Responsive Design', 'Animations'],
        opportunities: 'UI Designer, Frontend Developer'
    },
    {
        name: 'TailwindCSS',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        color: '#0891B2',
        chipBg: 'rgba(8, 145, 178, 0.10)',
        description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
        keyPoints: ['Utility-First', 'Highly Customizable', 'Small Bundle Size'],
        opportunities: 'Frontend Developer, UI/UX Engineer'
    },
    {
        name: 'Bootstrap',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
        color: '#6D28D9',
        chipBg: 'rgba(109, 40, 217, 0.10)',
        description: 'The world\'s most popular framework for building responsive, mobile-first sites.',
        keyPoints: ['Responsive Grid', 'Pre-built Components', 'Easy to Use'],
        opportunities: 'UI Developer, Web Designer'
    },
    {
        name: 'Node.js',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        color: '#059669',
        chipBg: 'rgba(5, 150, 105, 0.10)',
        description: 'Execute JavaScript on the server-side to build scalable network applications.',
        keyPoints: ['Event-Driven', 'Non-Blocking I/O', 'NPM Registry'],
        opportunities: 'Backend Developer, Full Stack Engineer'
    },
    {
        name: 'Express',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
        color: '#D97706',
        chipBg: 'rgba(217, 119, 6, 0.10)',
        description: 'Fast, unopinionated, minimalist web framework for Node.js.',
        keyPoints: ['Minimalist', 'Flexible Routing', 'Middleware Support'],
        opportunities: 'Backend Developer, API Engineer'
    },
    {
        name: 'MongoDB',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
        color: '#16A34A',
        chipBg: 'rgba(22, 163, 74, 0.10)',
        description: 'The most popular database for modern apps. Flexible, scalable, and powerful.',
        keyPoints: ['NoSQL', 'Document-Oriented', 'High Performance'],
        opportunities: 'Database Administrator, Backend Developer'
    },
    {
        name: 'MySQL',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'Industry-standard relational database management system for structured enterprise data.',
        keyPoints: ['SQL Queries', 'ACID Compliance', 'Relational Tables'],
        opportunities: 'Database Developer, Backend Engineer'
    },
    {
        name: 'Python',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'Versatile programming language for automation, data analysis, and AI workflows.',
        keyPoints: ['Beginner Friendly', 'Data & Automation', 'Backend Scripts'],
        opportunities: 'Python Developer, Data Analyst, AI Trainee'
    },
    {
        name: 'Java',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Enterprise-grade object-oriented language powering software, APIs, and Android.',
        keyPoints: ['Strong OOP Design', 'Cross-Platform JVM', 'High Reliability'],
        opportunities: 'Software Engineer, Java Developer'
    },
    {
        name: 'C',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Foundational procedural programming language teaching core memory & system logic.',
        keyPoints: ['System Fundamentals', 'Pointers & Memory', 'Fast Execution'],
        opportunities: 'Systems Programmer, Embedded Trainee'
    },
    {
        name: 'C++',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
        color: '#1E40AF',
        chipBg: 'rgba(30, 64, 175, 0.10)',
        description: 'High-performance object-oriented programming language for software & algorithms.',
        keyPoints: ['DSA & OOP', 'STL Library', 'Competitive Coding'],
        opportunities: 'Software Developer, C++ Engineer'
    },
    {
        name: 'Git',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        color: '#DC2626',
        chipBg: 'rgba(220, 38, 38, 0.10)',
        description: 'Essential distributed version control system for tracking every line of team code.',
        keyPoints: ['Branch & Merge', 'Version History', 'Team Collaboration'],
        opportunities: 'Software Developer, DevOps Trainee'
    },
    {
        name: 'GitHub',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
        color: '#0F172A',
        chipBg: 'rgba(15, 23, 42, 0.08)',
        description: 'Global platform for hosting repositories, pull requests, and developer portfolios.',
        keyPoints: ['Code Hosting', 'Pull Requests', 'Project Portfolios'],
        opportunities: 'Open Source Contributor, Web Developer'
    },
    {
        name: 'VS Code',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'The industry-standard extensible code editor for debugging, linting, and Git.',
        keyPoints: ['IntelliSense', 'Built-in Terminal', 'Rich Extensions'],
        opportunities: 'All Software & Web Development Roles'
    },
    {
        name: 'Docker',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'Container platform to package, ship, and deploy applications consistently anywhere.',
        keyPoints: ['Containers', 'Consistent Environments', 'Cloud Deployment'],
        opportunities: 'DevOps Engineer, Cloud Developer'
    },
    {
        name: 'Linux',
        iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
        color: '#D97706',
        chipBg: 'rgba(217, 119, 6, 0.10)',
        description: 'Open-source operating system powering cloud servers, shells, and cybersecurity labs.',
        keyPoints: ['CLI & Shell', 'File Permissions', 'Server Admin'],
        opportunities: 'System Administrator, Network Engineer'
    },
    {
        name: 'MS Word',
        iconUrl: 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_word.svg',
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Professional document formatting, mail merge, and executive reporting suite.',
        keyPoints: ['Document Formatting', 'Mail Merge', 'Office Layouts'],
        opportunities: 'Computer Operator, Front Office Executive'
    },
    {
        name: 'MS Excel',
        iconUrl: 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_excel.svg',
        color: '#15803D',
        chipBg: 'rgba(21, 128, 61, 0.10)',
        description: 'Spreadsheet mastery including VLOOKUP, Pivot Tables, formulas, and MIS reporting.',
        keyPoints: ['Pivot Tables', 'Formulas & Charts', 'Data Validation'],
        opportunities: 'MIS Executive, Data Entry Operator, Analyst'
    },
    {
        name: 'MS PowerPoint',
        iconUrl: 'https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_powerpoint.svg',
        color: '#C2410C',
        chipBg: 'rgba(194, 65, 12, 0.10)',
        description: 'Visual slide deck creation, SmartArt, and interactive business presentations.',
        keyPoints: ['Slide Design', 'Transitions', 'Visual Storytelling'],
        opportunities: 'Office Coordinator, Presentation Specialist'
    },
    {
        name: 'TallyPrime',
        iconUrl: TALLY_BADGE_SVG,
        color: '#0F766E',
        chipBg: 'rgba(15, 118, 110, 0.10)',
        description: 'India\'s leading accounting and GST compliance platform for modern finance careers.',
        keyPoints: ['GST Billing & Returns', 'Inventory Control', 'Payroll Ledger'],
        opportunities: 'Accounts Executive, GST Operator, Back Office'
    }
]

const TechTickerSection = () => {
    const [hoveredTech, setHoveredTech] = useState<string | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const timeoutRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleMouseEnter = (e: React.MouseEvent, techName: string) => {
        setHoveredTech(techName)
        setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (timeoutRef.current) return

        const x = e.clientX
        const y = e.clientY

        timeoutRef.current = window.setTimeout(() => {
            setMousePos({ x, y })
            timeoutRef.current = null
        }, 40)
    }

    const handleMouseLeave = () => {
        setHoveredTech(null)
    }

    const handleClick = (e: React.MouseEvent, techName: string) => {
        if (hoveredTech === techName) {
            setHoveredTech(null)
        } else {
            const rect = e.currentTarget.getBoundingClientRect()
            setHoveredTech(techName)
            setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
        }
    }

    const activeTechData = TECH_ITEMS.find(t => t.name === hoveredTech)

    return (
        <section className="py-4 bg-[#F8FAFC] border-y border-slate-200/80 overflow-hidden relative">
            <div className="w-full">
                <div className="flex items-center overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

                    <div className="flex items-center gap-4 sm:gap-6 animate-marquee w-max py-1.5 touch-pan-y">
                        {[...TECH_ITEMS, ...TECH_ITEMS].map((tech, index) => (
                            <button
                                key={`${tech.name}-${index}`}
                                type="button"
                                className="flex items-center gap-2.5 whitespace-nowrap group cursor-pointer relative px-3.5 py-2 rounded-full bg-[#FFFFFF] hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.14)] transition-all duration-200 border border-slate-200/85 hover:border-slate-300"
                                onMouseEnter={(e) => handleMouseEnter(e, tech.name)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onFocus={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setHoveredTech(tech.name)
                                    setMousePos({ x: rect.left + rect.width / 2, y: rect.top })
                                }}
                                onBlur={handleMouseLeave}
                                onClick={(e) => handleClick(e, tech.name)}
                            >
                                <span
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0"
                                    style={{ backgroundColor: tech.chipBg }}
                                >
                                    <img
                                        src={tech.iconUrl}
                                        alt=""
                                        aria-hidden="true"
                                        width={18}
                                        height={18}
                                        loading="lazy"
                                        className="w-4.5 h-4.5 object-contain"
                                    />
                                </span>
                                <span className="font-semibold text-sm text-[#0F172A] transition-colors duration-200">
                                    {tech.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTechData && (
                <TechPopup
                    {...activeTechData}
                    isVisible={!!activeTechData}
                    position={mousePos}
                />
            )}

            <style>
                {`
                .animate-marquee {
                    animation: marquee 58s linear infinite;
                }
                .animate-marquee:hover,
                .animate-marquee:focus-within {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
        </section>
    )
}

export default TechTickerSection
