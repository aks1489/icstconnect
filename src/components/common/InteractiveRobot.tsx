import { useState, useEffect, useRef, useCallback } from 'react';

// Using Devicon CDN for high-quality original logos
// Static data defined outside component to prevent recreation
const APPS = [
    { name: "React", desc: "A JavaScript library for building user interfaces", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "JavaScript", desc: "The programming language of the Web", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "TypeScript", desc: "JavaScript with syntax for types", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "Python", desc: "Powerful programming language", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Java", desc: "High-level, class-based, object-oriented", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "C++", desc: "General-purpose programming language", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
    { name: "HTML5", desc: "Standard markup language for documents", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", desc: "Style sheet language", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "Node.js", desc: "JavaScript runtime built on Chrome's V8", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "VS Code", desc: "Code editor redefined", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
    { name: "Git", desc: "Distributed version control system", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    { name: "GitHub", desc: "Platform for hosting and collaborating", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Docker", desc: "Develop, ship, and run applications", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "MongoDB", desc: "The developer data platform", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Next.js", desc: "The React Framework for the Web", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "MS Word", desc: "Word processing software", url: "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_word.svg" },
    { name: "MS Excel", desc: "Spreadsheet software", url: "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_excel.svg" },
    { name: "MS PowerPoint", desc: "Presentation software", url: "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_powerpoint.svg" }
];

interface SpawnedApp {
    id: number;
    name: string;
    desc: string;
    url: string;
    xEnd: number;
    yEnd: number;
}

const InteractiveRobot = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(true);

    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
    const [headRotation, setHeadRotation] = useState(0);

    const [spawnedIcons, setSpawnedIcons] = useState<SpawnedApp[]>([]);
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);

    // Observe container visibility to pause animations and listeners when offscreen
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Optimized Mouse Handler with Throttling via rAF
    useEffect(() => {
        if (!isInView) return;

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const rawX = (e.clientX / window.innerWidth) * 2 - 1;
                const rawY = (e.clientY / window.innerHeight) * 2 - 1;
                const clampedX = Math.max(-1, Math.min(1, rawX));
                const clampedY = Math.max(-1, Math.min(1, rawY));
                setPupilPos({ x: clampedX * 8, y: clampedY * 8 });
                setHeadRotation(clampedX * 5);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isInView]);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = useCallback(() => {
        setIsInteracting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // 1. Immediate Data Update
        const shuffled = [...APPS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        const newIcons: SpawnedApp[] = selected.map((app, i) => ({
            id: Date.now() + i + Math.random(),
            ...app,
            xEnd: (i - 1) * 110 + (Math.random() * 20 - 10),
            yEnd: 130 + Math.random() * 30
        }));

        setSpawnedIcons(newIcons);

        // 2. Reset Interaction State after animation finishes
        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
        }, 450);
    }, []);

    // Hand tracking angle calculation
    let targetArmRotation = -10;
    let targetArmZIndex = 10;

    if (isInteracting) {
        targetArmZIndex = 30;
    } else if (hoveredIcon !== null) {
        const targetIcon = spawnedIcons.find(icon => icon.id === hoveredIcon);
        if (targetIcon) {
            targetArmRotation = targetIcon.xEnd * -0.35;
            targetArmZIndex = 15;
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-sm lg:max-w-md mx-auto min-h-[500px] bg-white dark:bg-slate-900/90 rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,112,184,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 overflow-visible backdrop-blur-sm"
        >
            {/* Decorative clean background element */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 dark:from-blue-950/20 to-transparent rounded-[2.5rem] pointer-events-none" />

            <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                <div className="relative w-64 h-96 flex justify-center items-end pb-10">

                    {/* Floating Icons Container */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 w-0 h-0 overflow-visible">
                        {spawnedIcons.map((item, index) => (
                            <div
                                key={item.id}
                                className="absolute pointer-events-auto"
                                style={{
                                    top: 0,
                                    left: 0,
                                    '--x-end': `${item.xEnd}px`,
                                    '--y-end': `${item.yEnd}px`,
                                    animation: `robotSpawnIcon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 50}ms both`
                                } as React.CSSProperties}
                                onMouseEnter={() => setHoveredIcon(item.id)}
                                onMouseLeave={() => setHoveredIcon(null)}
                            >
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center p-3 relative shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-120 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:z-50 cursor-pointer">
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                        width={64}
                                        height={64}
                                        loading="lazy"
                                    />

                                    {hoveredIcon === item.id && (
                                        <div
                                            className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl z-[60] text-center pointer-events-none"
                                            style={{ animation: 'robotTooltipIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                                        >
                                            <div className="font-bold text-sm mb-1">{item.name}</div>
                                            <div className="text-[10px] text-slate-300 leading-tight">{item.desc}</div>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Shadow */}
                    <div
                        style={{
                            animation: isInView ? 'robotShadow 3s ease-in-out infinite' : 'none'
                        }}
                        className="absolute bottom-0 w-32 h-6 bg-black/20 rounded-full blur-md"
                    />

                    {/* Robot */}
                    <div
                        onClick={handleClick}
                        style={{
                            animation: isInteracting
                                ? 'robotClickJump 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                                : (isInView ? 'robotFloat 3s ease-in-out infinite' : 'none')
                        }}
                        className="relative z-10 flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
                    >
                        {/* Head */}
                        <div
                            style={{
                                transform: `rotate(${headRotation}deg)`
                            }}
                            className="w-40 h-32 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-3xl relative p-4 shadow-xl border-4 border-white z-20 transition-transform duration-150 ease-out"
                        >
                            {/* Antenna */}
                            <div
                                style={{
                                    animation: isInView ? 'robotAntenna 4s ease-in-out infinite' : 'none'
                                }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
                                <div className="w-5 h-5 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse border-2 border-white/50" />
                            </div>

                            {/* Eyes */}
                            <div className="flex justify-between items-center h-full px-4 pt-2">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-black/5">
                                    <div
                                        style={{
                                            transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0)`
                                        }}
                                        className="w-5 h-5 bg-slate-900 rounded-full transition-transform duration-75 ease-out"
                                    />
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-50" />
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-black/5">
                                    <div
                                        style={{
                                            transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0)`
                                        }}
                                        className="w-5 h-5 bg-slate-900 rounded-full transition-transform duration-75 ease-out"
                                    />
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-50" />
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="w-28 h-32 bg-slate-100 dark:bg-slate-800 rounded-b-[3rem] rounded-t-xl -mt-5 pt-6 pb-2 relative z-10 shadow-lg border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <div className="absolute bottom-0 w-24 h-20 bg-white dark:bg-slate-900 rounded-b-[3rem] rounded-t-lg border-t-2 border-slate-100 dark:border-slate-750 shadow-sm flex items-center justify-center overflow-hidden z-0">
                                <div className="flex flex-col items-center justify-center p-2">
                                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 leading-none tracking-tighter">ICST</div>
                                    <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-700 my-0.5" />
                                    <div className="text-[5px] font-bold text-slate-400 uppercase tracking-wide leading-none">Chowberia</div>
                                </div>
                            </div>

                            {/* Left Arm */}
                            <div
                                style={{
                                    animation: isInView ? 'robotLeftArm 3s ease-in-out infinite' : 'none'
                                }}
                                className="absolute top-8 -left-8 w-8 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full -z-10 origin-top-right border-2 border-white dark:border-slate-800"
                            />

                            {/* Right Arm */}
                            <div
                                style={{
                                    zIndex: targetArmZIndex,
                                    transform: !isInteracting ? `rotate(${targetArmRotation}deg)` : undefined,
                                    animation: isInteracting ? 'robotArmThrow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none'
                                }}
                                className="absolute top-8 -right-8 w-8 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full origin-top-left border-2 border-white dark:border-slate-800 shadow-md cursor-pointer transition-transform duration-300 ease-out"
                            >
                                <div className="absolute bottom-0 w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 flex justify-center">
                                    <div
                                        className={`absolute -bottom-2 w-3 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 origin-top transition-all duration-200 ${
                                            hoveredIcon !== null && !isInteracting ? 'h-3 opacity-100' : 'h-0 opacity-0 pointer-events-none'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Legs */}
                        <div className="flex gap-4 -mt-4">
                            <div className="w-8 h-12 bg-slate-200 dark:bg-slate-700 rounded-b-xl border-2 border-slate-300 dark:border-slate-600" />
                            <div className="w-8 h-12 bg-slate-200 dark:bg-slate-700 rounded-b-xl border-2 border-slate-300 dark:border-slate-600" />
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes robotFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes robotShadow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(0.8); opacity: 0.4; }
                }
                @keyframes robotClickJump {
                    0% { transform: translateY(0) scale(1); }
                    25% { transform: translateY(10px) scale(1.05); }
                    65% { transform: translateY(-20px) scale(0.95); }
                    100% { transform: translateY(0) scale(1); }
                }
                @keyframes robotArmThrow {
                    0% { transform: rotate(-10deg); }
                    30% { transform: rotate(130deg); }
                    75% { transform: rotate(-45deg); }
                    100% { transform: rotate(-10deg); }
                }
                @keyframes robotLeftArm {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(5deg); }
                }
                @keyframes robotAntenna {
                    0%, 100% { transform: rotate(0deg); }
                    33% { transform: rotate(5deg); }
                    66% { transform: rotate(-5deg); }
                }
                @keyframes robotSpawnIcon {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 50px, 0) scale(0);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(var(--x-end, 0), var(--y-end, 0), 0) scale(1);
                    }
                }
                @keyframes robotTooltipIn {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, 10px) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, 0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default InteractiveRobot;
