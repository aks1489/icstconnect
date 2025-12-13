
import React, { useState } from 'react'
import { Atom, Box, FileCode2, Wind, FileCode, Database, Server, Triangle } from 'lucide-react'
import TechPopup from '../../ui/TechPopup'

const TechTickerSection = () => {
    const [hoveredTech, setHoveredTech] = useState<string | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    const techs = [
        {
            name: 'React',
            icon: Atom,
            color: '#61DAFB',
            description: 'The most popular library for building modern, interactive user interfaces.',
            keyPoints: ['Component-Based', 'Virtual DOM', 'Huge Ecosystem'],
            opportunities: 'Frontend Developer, React Native Developer'
        },
        {
            name: 'Bootstrap',
            icon: Box,
            color: '#7952B3',
            description: 'The world’s most popular framework for building responsive, mobile-first sites.',
            keyPoints: ['Responsive Grid', 'Pre-built Components', 'Easy to Use'],
            opportunities: 'UI Developer, Web Designer'
        },
        {
            name: 'Node.js',
            icon: FileCode2,
            color: '#339933',
            description: 'Execute JavaScript on the server-side to build scalable network applications.',
            keyPoints: ['Event-Driven', 'Non-Blocking I/O', 'NPM Registry'],
            opportunities: 'Backend Developer, Full Stack Engineer'
        },
        {
            name: 'TailwindCSS',
            icon: Wind,
            color: '#06B6D4',
            description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
            keyPoints: ['Utility-First', 'Highly Customizable', 'Small Bundle Size'],
            opportunities: 'Frontend Developer, UI/UX Engineer'
        },
        {
            name: 'TypeScript',
            icon: FileCode,
            color: '#3178C6',
            description: 'JavaScript with syntax for types. Adds safety and scalability to your code.',
            keyPoints: ['Static Typing', 'Better Tooling', 'Scalable'],
            opportunities: 'Senior Frontend Dev, Full Stack Developer'
        },
        {
            name: 'MongoDB',
            icon: Database,
            color: '#47A248',
            description: 'The most popular database for modern apps. Flexible, scalable, and powerful.',
            keyPoints: ['NoSQL', 'Document-Oriented', 'High Performance'],
            opportunities: 'Database Administrator, Backend Developer'
        },
        {
            name: 'Express',
            icon: Server,
            color: '#000000',
            description: 'Fast, unopinionated, minimalist web framework for Node.js.',
            keyPoints: ['Minimalist', 'Flexible Routing', 'Middleware Support'],
            opportunities: 'Backend Developer, API Engineer'
        },
        {
            name: 'Next.js',
            icon: Triangle,
            color: '#000000',
            description: 'The React Framework for the Web. Used by some of the world\'s largest companies.',
            keyPoints: ['Server-Side Rendering', 'Static Site Gen', 'SEO Friendly'],
            opportunities: 'React Developer, Full Stack Engineer'
        }
    ]

    const handleMouseEnter = (e: React.MouseEvent, techName: string) => {
        setHoveredTech(techName)
        setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseLeave = () => {
        setHoveredTech(null)
    }

    // For mobile tap
    const handleClick = (e: React.MouseEvent, techName: string) => {
        // If already selected, deselect. Otherwise select.
        if (hoveredTech === techName) {
            setHoveredTech(null)
        } else {
            setHoveredTech(techName)
            setMousePos({ x: e.clientX, y: e.clientY })
        }
    }

    const activeTechData = techs.find(t => t.name === hoveredTech)

    return (
        <section className="py-8 bg-white border-y border-slate-100 overflow-hidden relative">
            <div className="w-full">
                <div className="flex items-center overflow-hidden relative">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <div className="flex items-center gap-16 animate-marquee py-4">
                        {/* Duplicate the list to create seamless loop */}
                        {[...techs, ...techs, ...techs, ...techs].map((tech, index) => (
                            <div
                                key={`${tech.name}-${index}`}
                                className="flex items-center gap-3 whitespace-nowrap group cursor-pointer relative"
                                onMouseEnter={(e) => handleMouseEnter(e, tech.name)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onClick={(e) => handleClick(e, tech.name)}
                            >
                                <tech.icon className={`text-3xl text-slate-300 group-hover:text-[color:var(--tech-color)] transition-colors duration-300`} style={{ '--tech-color': tech.color } as React.CSSProperties} size={32} />
                                <span className="font-bold text-lg text-slate-400 group-hover:text-slate-800 transition-colors duration-300">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popup */}
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
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
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
