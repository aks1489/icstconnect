import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentType } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

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
    { name: "MS PowerPoint", desc: "Presentation software", url: "https://raw.githubusercontent.com/vscode-icons/vscode-icons/master/icons/file_type_powerpoint.svg" },
    { name: "TailwindCSS", desc: "Utility-first CSS design framework", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "Bootstrap", desc: "Responsive mobile-first UI grid", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "MySQL", desc: "Relational database management system", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Linux", desc: "Open-source OS & server fundamentals", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" }
];

const SPAWN_ACCENTS = [
    'border-sky-200 hover:border-[#0284C7] hover:shadow-[0_14px_28px_-6px_rgba(2,132,199,0.28)]',
    'border-indigo-200 hover:border-[#4F46E5] hover:shadow-[0_14px_28px_-6px_rgba(79,70,229,0.28)]',
    'border-emerald-200 hover:border-[#059669] hover:shadow-[0_14px_28px_-6px_rgba(5,150,105,0.28)]',
    'border-amber-200 hover:border-[#D97706] hover:shadow-[0_14px_28px_-6px_rgba(217,119,6,0.26)]'
];

const SPAWN_SLOTS = [
    { side: -1, xEnd: 'calc(-1 * min(124px, 31cqw))', yEnd: -84 },
    { side: 1, xEnd: 'min(124px, 31cqw)', yEnd: -84 },
    { side: -1, xEnd: 'calc(-1 * min(132px, 33cqw))', yEnd: -4 },
    { side: 1, xEnd: 'min(132px, 33cqw)', yEnd: -4 }
];

interface SpawnedApp {
    id: number;
    name: string;
    desc: string;
    url: string;
    side: number;
    xEnd: string;
    yEnd: number;
}

export interface HeroTechItem {
    name: string;
    tag: string;
    color: string;
    bgTint: string;
    borderTint: string;
    icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

interface InteractiveRobotProps {
    activeTech?: HeroTechItem;
    technologies?: HeroTechItem[];
    activeIndex?: number;
    onSelectTech?: (idx: number) => void;
}

const InteractiveRobot: React.FC<InteractiveRobotProps> = ({
    activeTech,
    technologies,
    activeIndex = 0,
    onSelectTech
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(true);

    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
    const [headRotation, setHeadRotation] = useState(0);

    const [spawnedIcons, setSpawnedIcons] = useState<SpawnedApp[]>([]);
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [interactionCount, setInteractionCount] = useState(0);
    const [isClosingPocket, setIsClosingPocket] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);

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

    // Natural human-like spontaneous blinking in randomized 1, 2, or 3-blink bursts
    useEffect(() => {
        if (!isInView || prefersReducedMotion()) {
            setIsBlinking(false);
            return;
        }

        const timers = new Set<ReturnType<typeof setTimeout>>();
        let cancelled = false;

        const schedule = (fn: () => void, ms: number) => {
            const id = setTimeout(() => {
                timers.delete(id);
                if (!cancelled) fn();
            }, ms);
            timers.add(id);
        };

        const runBlinkBurst = () => {
            const roll = Math.random();
            const blinkCount = roll < 0.52 ? 1 : roll < 0.84 ? 2 : 3;
            const cycleStepMs = 265;
            const closeHoldMs = 110;

            for (let i = 0; i < blinkCount; i++) {
                const start = i * cycleStepMs;
                schedule(() => setIsBlinking(true), start);
                schedule(() => setIsBlinking(false), start + closeHoldMs);
            }

            const totalBurstMs = (blinkCount - 1) * cycleStepMs + closeHoldMs + 140;
            const nextWaitMs = 2000 + Math.random() * 3200;
            schedule(runBlinkBurst, totalBurstMs + nextWaitMs);
        };

        schedule(runBlinkBurst, 1400 + Math.random() * 1400);

        return () => {
            cancelled = true;
            timers.forEach(clearTimeout);
            timers.clear();
        };
    }, [isInView]);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = useCallback(() => {
        setIsClosingPocket(false);
        setHoveredIcon(null);
        setIsInteracting(true);
        setInteractionCount((prev) => prev + 1);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const shuffled = [...APPS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        const newIcons: SpawnedApp[] = selected.map((app, i) => {
            const slot = SPAWN_SLOTS[i % SPAWN_SLOTS.length];
            return {
                id: Date.now() + i + Math.random(),
                ...app,
                side: slot.side,
                xEnd: slot.xEnd,
                yEnd: slot.yEnd
            };
        });

        setSpawnedIcons(newIcons);

        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
        }, 420);
    }, []);

    // Auto-close the robot pocket & tuck icons back in after 2s of inactivity
    useEffect(() => {
        if (spawnedIcons.length === 0 || hoveredIcon !== null) return;

        let retractTimer: ReturnType<typeof setTimeout> | null = null;
        const inactivityTimer = setTimeout(() => {
            setIsClosingPocket(true);
            retractTimer = setTimeout(() => {
                setSpawnedIcons([]);
                setIsClosingPocket(false);
            }, 220);
        }, 2000);

        return () => {
            clearTimeout(inactivityTimer);
            if (retractTimer) clearTimeout(retractTimer);
        };
    }, [spawnedIcons, hoveredIcon, interactionCount]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    let targetArmRotation = -10;
    let targetArmZIndex = 10;

    if (isInteracting) {
        targetArmZIndex = 35;
    } else if (hoveredIcon !== null) {
        const targetIcon = spawnedIcons.find(icon => icon.id === hoveredIcon);
        if (targetIcon) {
            targetArmRotation = targetIcon.side * -28;
            targetArmZIndex = 15;
        }
    }

    const isPocketOpen = spawnedIcons.length > 0 && !isClosingPocket;
    const isEvenThrow = interactionCount % 2 === 0;

    return (
        <div className="relative p-[1px] rounded-[2.08rem] bg-gradient-to-br from-slate-200/90 via-[#BAE6FD]/70 to-[#C7D2FE]/80 shadow-[0_32px_70px_-20px_rgba(15,23,42,0.18)]">
            <div
                ref={containerRef}
                className="relative w-full mx-auto bg-gradient-to-br from-[#F8FAFC] via-[#FFFFFF] to-[#EFF6FF] rounded-[2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] flex flex-col items-center justify-between p-5 sm:p-6 overflow-visible"
            >
                {/* Studio Aurora & Rotating Orbital Halo */}
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-35 blur-2xl motion-safe:animate-[spin_20s_linear_infinite]"
                        style={{
                            background: 'conic-gradient(from 0deg, #38BDF8, #4F46E5, #0EA5E9, #34D399, #38BDF8)'
                        }}
                    />
                    <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-68 h-68 rounded-full border border-slate-200/75" />
                    <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-92 h-92 rounded-full border border-dashed border-slate-200/55" />
                </div>

                {/* Stage Top Header */}
                <div className="relative z-10 w-full flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-slate-200/90 text-[11px] font-semibold text-[#0F172A] shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" aria-hidden="true" />
                        Tap ICST Bot to launch skills
                    </span>
                    <div className="hidden sm:inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs text-[10px] font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                            100% Practical
                        </span>
                        <span className="w-px h-3 bg-slate-200" aria-hidden="true" />
                        <span className="inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" aria-hidden="true" />
                            AI &amp; Web Ready
                        </span>
                    </div>
                </div>

                {/* Robot Pedestal */}
                <div
                    className="flex items-center justify-center w-full py-3 relative"
                    style={{ containerType: 'inline-size' }}
                >
                    <div className="relative w-64 h-76 flex justify-center items-end pb-5">
                        {/* Floating Icons Container (Positioned strictly along upper/mid flanks — never overlaps bottom dock) */}
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 w-0 h-0 overflow-visible">
                            {spawnedIcons.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="absolute pointer-events-auto"
                                    style={{
                                        top: 0,
                                        left: 0,
                                        '--x-end': item.xEnd,
                                        '--y-end': `${item.yEnd}px`,
                                        animation: isClosingPocket
                                            ? 'robotRetractIcon 0.22s cubic-bezier(0.4, 0, 1, 1) forwards'
                                            : `robotSpawnIcon 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 45}ms both`
                                    } as React.CSSProperties}
                                    onMouseEnter={() => {
                                        if (!isClosingPocket) setHoveredIcon(item.id);
                                    }}
                                    onMouseLeave={() => setHoveredIcon(null)}
                                >
                                    <div className={`w-13 h-13 sm:w-15 sm:h-15 bg-[#FFFFFF]/95 backdrop-blur-md rounded-2xl flex items-center justify-center p-2.5 sm:p-3 relative shadow-lg border ${SPAWN_ACCENTS[index % SPAWN_ACCENTS.length]} transition-all duration-200 hover:scale-115 hover:z-50 cursor-pointer`}>
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
                                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 bg-[#0F172A]/95 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl z-[60] text-center pointer-events-none border border-white/10"
                                                style={{ animation: 'robotTooltipIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                                            >
                                                <div className="font-bold text-sm mb-0.5 text-[#38BDF8]">{item.name}</div>
                                                <div className="text-[10px] text-slate-300 leading-tight">{item.desc}</div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45" />
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
                            className="absolute bottom-0 w-32 h-5 bg-[#0F172A]/15 rounded-full blur-md"
                        />

                        {/* Robot */}
                        <button
                            type="button"
                            onClick={handleClick}
                            aria-label="Interact with ICST Bot pocket to preview tech stack skills"
                            style={{
                                animation: isInteracting
                                    ? `${isEvenThrow ? 'robotClickJumpA' : 'robotClickJumpB'} 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                                    : (isInView ? 'robotFloat 3s ease-in-out infinite' : 'none')
                            }}
                            className="relative z-10 flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-[#2572AB] focus-visible:outline-offset-4 rounded-3xl"
                        >
                            {/* Head */}
                            <div
                                style={{
                                    transform: `rotate(${headRotation}deg)`
                                }}
                                className="w-38 h-30 bg-gradient-to-tr from-[#0F2D4A] via-[#2572AB] to-[#0EA5E9] rounded-3xl relative p-4 shadow-[0_20px_35px_-10px_rgba(37,114,171,0.45)] border-4 border-white z-20 transition-transform duration-150 ease-out overflow-hidden"
                            >
                                {/* Specular Visor Glare */}
                                <div className="absolute -top-6 -left-6 w-28 h-24 bg-white/15 rounded-full rotate-12 pointer-events-none" aria-hidden="true" />

                                {/* Eyes with Human-like Upper & Lower Eyelid Blink */}
                                <div className="flex justify-between items-center h-full px-3.5 pt-1.5 relative z-10">
                                    {(['left', 'right'] as const).map((eye) => {
                                        const lidTransition = isBlinking
                                            ? 'transform 75ms cubic-bezier(0.55, 0.05, 0.9, 0.35)'
                                            : 'transform 125ms cubic-bezier(0.16, 1, 0.3, 1)';
                                        return (
                                            <div
                                                key={eye}
                                                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-[#0F172A]/10"
                                            >
                                                <div
                                                    style={{
                                                        transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0) scaleY(${isBlinking ? 0.85 : 1})`
                                                    }}
                                                    className="w-4.5 h-4.5 bg-[#0F172A] rounded-full transition-transform duration-75 ease-out"
                                                />
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-80" />

                                                {/* Upper Eyelid */}
                                                <div
                                                    aria-hidden="true"
                                                    style={{
                                                        transform: isBlinking ? 'translateY(0%)' : 'translateY(-106%)',
                                                        transition: lidTransition
                                                    }}
                                                    className="absolute inset-x-0 top-0 h-[82%] bg-gradient-to-b from-[#0F2D4A] via-[#1B4D7A] to-[#2572AB] border-b-2 border-[#0F172A]/45 rounded-b-lg z-20 pointer-events-none will-change-transform"
                                                />
                                                {/* Lower Eyelid */}
                                                <div
                                                    aria-hidden="true"
                                                    style={{
                                                        transform: isBlinking ? 'translateY(0%)' : 'translateY(106%)',
                                                        transition: lidTransition
                                                    }}
                                                    className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[#0F2D4A] to-[#1B4D7A] border-t border-[#38BDF8]/30 rounded-t-lg z-20 pointer-events-none will-change-transform"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Antenna (outside overflow-hidden head) */}
                            <div
                                style={{
                                    animation: isInView ? 'robotAntenna 4s ease-in-out infinite' : 'none'
                                }}
                                className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center z-30"
                            >
                                <div className="w-1.5 h-5 bg-slate-500 rounded-full" />
                                <div className="w-4.5 h-4.5 bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] rounded-full shadow-[0_0_16px_rgba(14,165,233,0.75)] animate-pulse border-2 border-white" />
                            </div>

                            {/* Body & Interactive Chest Pocket */}
                            <div className="w-26 h-28 bg-[#FFFFFF] rounded-b-[2.75rem] rounded-t-xl -mt-5 pt-5 pb-2 relative z-10 shadow-lg border border-slate-200 flex flex-col items-center">
                                {/* Pocket Cavity Glow Lip */}
                                <div
                                    aria-hidden="true"
                                    className={`w-18 h-2 rounded-full -mt-0.5 mb-0.5 transition-all duration-200 ${isPocketOpen
                                        ? 'bg-gradient-to-r from-[#2572AB] via-[#38BDF8] to-[#4F46E5] opacity-90 scale-x-105 shadow-[0_0_12px_rgba(14,165,233,0.65)]'
                                        : 'bg-slate-200/70 opacity-60 scale-x-95'
                                        }`}
                                />

                                <div
                                    className={`absolute bottom-0 w-22 h-18 bg-gradient-to-b from-slate-50 to-[#EFF6FF] rounded-b-[2.75rem] rounded-t-lg flex items-center justify-center overflow-hidden z-10 transition-all duration-200 ${isPocketOpen
                                        ? 'border-t-2 border-[#38BDF8] shadow-[inset_0_5px_12px_rgba(14,165,233,0.20)] translate-y-[1.5px]'
                                        : 'border-t border-slate-200/80 shadow-xs translate-y-0'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center p-2">
                                        <div className="text-xs font-black tracking-tighter text-[#2572AB] leading-none">
                                            ICST
                                        </div>
                                        <div className="w-7 h-[1px] bg-slate-300 my-0.5" />
                                        <div className="text-[5px] font-bold text-[#474747] uppercase tracking-wider leading-none">
                                            Chowberia
                                        </div>
                                    </div>
                                </div>

                                {/* Left Arm */}
                                <div
                                    style={{
                                        zIndex: isInteracting ? 25 : -1,
                                        animation: isInteracting
                                            ? `${isEvenThrow ? 'robotLeftArmThrowA' : 'robotLeftArmThrowB'} 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                                            : (isInView ? 'robotLeftArm 3s ease-in-out infinite' : 'none')
                                    }}
                                    className="absolute top-7 -left-7 w-7 h-18 bg-gradient-to-b from-[#0EA5E9] to-[#2572AB] rounded-full origin-top-right border-2 border-white shadow-sm"
                                />

                                {/* Right Arm (Reaches across pocket & flicks upward cleanly on every click) */}
                                <div
                                    style={{
                                        zIndex: targetArmZIndex,
                                        transform: !isInteracting ? `rotate(${targetArmRotation}deg)` : undefined,
                                        animation: isInteracting
                                            ? `${isEvenThrow ? 'robotArmThrowA' : 'robotArmThrowB'} 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
                                            : 'none'
                                    }}
                                    className="absolute top-7 -right-7 w-7 h-18 bg-gradient-to-b from-[#38BDF8] to-[#2572AB] rounded-full origin-top-left border-2 border-white shadow-md cursor-pointer transition-transform duration-300 ease-out"
                                >
                                    <div className="absolute bottom-0 w-7 h-7 bg-[#1E3A5F] rounded-full border-2 border-white flex justify-center">
                                        <div
                                            className={`absolute -bottom-2 w-2.5 h-3.5 bg-[#1E3A5F] rounded-full border-2 border-white origin-top transition-all duration-200 ${hoveredIcon !== null && !isInteracting ? 'h-3 opacity-100' : 'h-0 opacity-0 pointer-events-none'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Legs */}
                            <div className="flex gap-3.5 -mt-3.5">
                                <div className="w-7 h-10 bg-[#334155] rounded-b-xl border border-slate-400/30" />
                                <div className="w-7 h-10 bg-[#334155] rounded-b-xl border border-slate-400/30" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Unified Glassmorphic Curriculum Dock */}
                {activeTech && technologies && onSelectTech && (
                    <div className="relative z-10 w-full rounded-2xl bg-[#FFFFFF]/90 backdrop-blur-xl border border-slate-200/90 p-3.5 shadow-[0_12px_28px_-12px_rgba(15,23,42,0.12)]">
                        <div
                            key={activeTech.name}
                            className="flex items-center justify-between gap-3 mb-3 animate-in fade-in slide-in-from-bottom-1 duration-200"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                                    style={{ backgroundColor: activeTech.bgTint, borderColor: activeTech.borderTint }}
                                >
                                    <activeTech.icon size={22} style={{ color: activeTech.color }} />
                                </div>
                                <div className="text-left min-w-0">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 block leading-none mb-1">
                                        Learning
                                    </span>
                                    <span className="text-base font-bold text-[#0F172A] truncate block leading-none">
                                        {activeTech.name}
                                    </span>
                                </div>
                            </div>
                            <span
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                                style={{ backgroundColor: activeTech.bgTint, color: activeTech.color }}
                            >
                                {activeTech.tag}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-100" role="tablist" aria-label="Featured technologies">
                            {technologies.map((tech, idx) => {
                                const active = idx === activeIndex
                                return (
                                    <button
                                        key={tech.name}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => onSelectTech(idx)}
                                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate ${active
                                                ? 'bg-[#0F172A] text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
                                            }`}
                                    >
                                        {tech.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes robotFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes robotShadow {
                        0%, 100% { transform: scale(1); opacity: 0.22; }
                        50% { transform: scale(0.84); opacity: 0.35; }
                    }
                    @keyframes robotClickJumpA {
                        0% { transform: translateY(0) scale(1); }
                        25% { transform: translateY(8px) scale(1.04); }
                        65% { transform: translateY(-16px) scale(0.96); }
                        100% { transform: translateY(0) scale(1); }
                    }
                    @keyframes robotClickJumpB {
                        0% { transform: translateY(0) scale(1); }
                        25% { transform: translateY(8px) scale(1.04); }
                        65% { transform: translateY(-16px) scale(0.96); }
                        100% { transform: translateY(0) scale(1); }
                    }
                    @keyframes robotArmThrowA {
                        0% { transform: rotate(-10deg); }
                        30% { transform: rotate(125deg); }
                        72% { transform: rotate(-52deg); }
                        100% { transform: rotate(-10deg); }
                    }
                    @keyframes robotArmThrowB {
                        0% { transform: rotate(-10deg); }
                        30% { transform: rotate(125deg); }
                        72% { transform: rotate(-52deg); }
                        100% { transform: rotate(-10deg); }
                    }
                    @keyframes robotLeftArmThrowA {
                        0% { transform: rotate(0deg); }
                        32% { transform: rotate(-42deg); }
                        72% { transform: rotate(18deg); }
                        100% { transform: rotate(0deg); }
                    }
                    @keyframes robotLeftArmThrowB {
                        0% { transform: rotate(0deg); }
                        32% { transform: rotate(-42deg); }
                        72% { transform: rotate(18deg); }
                        100% { transform: rotate(0deg); }
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
                    @keyframes robotRetractIcon {
                        0% {
                            opacity: 1;
                            transform: translate3d(var(--x-end, 0), var(--y-end, 0), 0) scale(1);
                        }
                        100% {
                            opacity: 0;
                            transform: translate3d(0, 44px, 0) scale(0.15);
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
        </div>
    );
};

export default InteractiveRobot;
