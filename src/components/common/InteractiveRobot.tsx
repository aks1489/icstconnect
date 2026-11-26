import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight as ArrowRight, IconBriefcase as Briefcase } from '@tabler/icons-react';
import { prefersReducedMotion } from '../../lib/motion';
import { getTechIconUrl, warmupTechIcons } from '../../data/techIcons';

const APPS = [
    { name: "React", desc: "A JavaScript library for building user interfaces", url: getTechIconUrl('tech:react') },
    { name: "JavaScript", desc: "The programming language of the Web", url: getTechIconUrl('tech:javascript') },
    { name: "TypeScript", desc: "JavaScript with syntax for types", url: getTechIconUrl('tech:typescript') },
    { name: "Python", desc: "Powerful programming language", url: getTechIconUrl('tech:python') },
    { name: "Java", desc: "High-level, class-based, object-oriented", url: getTechIconUrl('tech:java') },
    { name: "C++", desc: "General-purpose programming language", url: getTechIconUrl('tech:cplusplus') },
    { name: "HTML5", desc: "Standard markup language for documents", url: getTechIconUrl('tech:html5') },
    { name: "CSS3", desc: "Style sheet language", url: getTechIconUrl('tech:css3') },
    { name: "Node.js", desc: "JavaScript runtime built on Chrome's V8", url: getTechIconUrl('tech:nodejs') },
    { name: "VS Code", desc: "Code editor redefined", url: getTechIconUrl('tech:vscode') },
    { name: "Git", desc: "Distributed version control system", url: getTechIconUrl('tech:git') },
    { name: "GitHub", desc: "Platform for hosting and collaborating", url: getTechIconUrl('tech:github') },
    { name: "Docker", desc: "Develop, ship, and run applications", url: getTechIconUrl('tech:docker') },
    { name: "MongoDB", desc: "The developer data platform", url: getTechIconUrl('tech:mongodb') },
    { name: "Next.js", desc: "The React Framework for the Web", url: getTechIconUrl('tech:nextjs') },
    { name: "MS Word", desc: "Word processing software", url: getTechIconUrl('tech:word') },
    { name: "MS Excel", desc: "Spreadsheet software", url: getTechIconUrl('tech:excel') },
    { name: "MS PowerPoint", desc: "Presentation software", url: getTechIconUrl('tech:powerpoint') },
    { name: "TailwindCSS", desc: "Utility-first CSS design framework", url: getTechIconUrl('tech:tailwindcss') },
    { name: "Bootstrap", desc: "Responsive mobile-first UI grid", url: getTechIconUrl('tech:bootstrap') },
    { name: "MySQL", desc: "Relational database management system", url: getTechIconUrl('tech:mysql') },
    { name: "Linux", desc: "Open-source OS & server fundamentals", url: getTechIconUrl('tech:linux') }
];

const SPAWN_ACCENTS = [
    'border-slate-200 hover:border-[#2572AB]/50 hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,0.16)]'
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

export interface CareerPathOption {
    label: string;
    icon: ComponentType<{ size?: number; stroke?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export interface HeroTechItem {
    name: string;
    tag: string;
    iconUrl: string;
    careerPaths: CareerPathOption[];
    courseTrack: string;
    outcomeSummary: string;
}

interface InteractiveRobotProps {
    activeTech?: HeroTechItem;
    technologies?: HeroTechItem[];
    activeIndex?: number;
    onSelectTech?: (idx: number) => void;
    groupIndex?: number;
    groupCount?: number;
    onSelectGroup?: (groupIdx: number) => void;
    isAutoRotatePaused?: boolean;
}

const InteractiveRobot: React.FC<InteractiveRobotProps> = ({
    activeTech,
    technologies,
    activeIndex = 0,
    onSelectTech,
    groupIndex = 0,
    groupCount = 1,
    onSelectGroup,
    isAutoRotatePaused = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(true);
    const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);

    useEffect(() => {
        warmupTechIcons();
    }, []);

    useEffect(() => {
        setSelectedRoleIdx(0);
    }, [activeIndex]);

    const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
    const [headRotation, setHeadRotation] = useState(0);
    const [headOffset, setHeadOffset] = useState({ x: 0, y: 0 });
    const [isPointerTracking, setIsPointerTracking] = useState(false);
    const lastPointerAtRef = useRef(0);

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
        if (!isInView || prefersReducedMotion()) return;

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            lastPointerAtRef.current = Date.now();
            setIsPointerTracking(true);
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const rawX = (e.clientX / window.innerWidth) * 2 - 1;
                const rawY = (e.clientY / window.innerHeight) * 2 - 1;
                const clampedX = Math.max(-1, Math.min(1, rawX));
                const clampedY = Math.max(-1, Math.min(1, rawY));
                setPupilPos({ x: clampedX * 8, y: clampedY * 7 });
                setHeadRotation(clampedX * 6);
                setHeadOffset({ x: clampedX * 3.5, y: clampedY * 2.5 });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isInView]);

    // Organic autonomous head curiosity, eye saccades & posture shifts when cursor is idle
    useEffect(() => {
        if (!isInView || prefersReducedMotion()) {
            setHeadRotation(0);
            setHeadOffset({ x: 0, y: 0 });
            setPupilPos({ x: 0, y: 0 });
            return;
        }

        const IDLE_POSES = [
            { tilt: -5.5, dx: -3.5, dy: -1, px: -5.5, py: -1.5 }, // Look left toward Hero headline
            { tilt: 4.5, dx: 3, dy: -1.5, px: 5, py: -2 },        // Curious right look
            { tilt: -2.5, dx: -1.5, dy: 2.5, px: -2, py: 4.5 },   // Glance toward Career Paths
            { tilt: 5.5, dx: 2.5, dy: 1.5, px: 4.5, py: 3 },      // Nod/inspect lower right
            { tilt: 0, dx: 0, dy: -2, px: 0, py: -1 },            // Perky attentive center
            { tilt: -4, dx: -2.5, dy: 1, px: -4, py: 2 }          // Soft tilt toward visitor
        ];

        let poseTimer: ReturnType<typeof setTimeout> | null = null;
        let cancelled = false;
        let step = 0;

        const scheduleNextLook = (initialDelay?: number) => {
            const delay = initialDelay ?? (1500 + Math.random() * 1700);
            poseTimer = setTimeout(() => {
                if (cancelled) return;
                const idleFor = Date.now() - lastPointerAtRef.current;
                if (lastPointerAtRef.current === 0 || idleFor > 1800) {
                    setIsPointerTracking(false);
                    const pose = IDLE_POSES[step % IDLE_POSES.length];
                    step += 1 + (Math.random() > 0.65 ? 1 : 0);
                    setHeadRotation(pose.tilt);
                    setHeadOffset({ x: pose.dx, y: pose.dy });
                    setPupilPos({ x: pose.px, y: pose.py });
                }
                scheduleNextLook();
            }, delay);
        };

        scheduleNextLook(450);

        return () => {
            cancelled = true;
            if (poseTimer) clearTimeout(poseTimer);
        };
    }, [isInView]);

    // Subtle alive reaction when the active skill / career tab switches while cursor is idle
    useEffect(() => {
        if (!isInView || prefersReducedMotion()) return;
        const idleFor = Date.now() - lastPointerAtRef.current;
        if (lastPointerAtRef.current !== 0 && idleFor <= 1800) return;

        const colOffset = (activeIndex % 4) - 1.5;
        setIsPointerTracking(false);
        setHeadRotation(colOffset * 2.4);
        setHeadOffset({ x: colOffset * 1.8, y: 2.2 });
        setPupilPos({ x: colOffset * 2.8, y: 4.8 });
    }, [activeIndex, isInView]);

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
        <div className="relative rounded-[1.75rem] border border-slate-200/90 bg-[#FFFFFF] shadow-[0_22px_48px_-20px_rgba(15,23,42,0.13)]">
            <div
                ref={containerRef}
                className="relative w-full mx-auto bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] rounded-[1.75rem] flex flex-col items-center justify-between p-4 sm:p-5 overflow-visible"
            >
                {/* Clean Architectural Orbital Rings */}
                <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute top-[33%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-slate-200/80" />
                    <div className="absolute top-[33%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-84 h-84 rounded-full border border-dashed border-slate-200/60" />
                </div>

                {/* Stage Top Header */}
                <div className="relative z-10 w-full flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-slate-200/90 text-[11px] font-medium text-[#0F172A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                        Tap ICST Bot to launch skills
                    </span>
                    {activeTech ? (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/80 text-[11px] font-medium text-[#2572AB]">
                            <img
                                src={activeTech.iconUrl}
                                alt=""
                                aria-hidden="true"
                                width={14}
                                height={14}
                                decoding="sync"
                                className="w-3.5 h-3.5 object-contain shrink-0"
                            />
                            <span>{activeTech.name} · {activeTech.tag}</span>
                        </span>
                    ) : (
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-slate-200/80 text-[11px] font-medium text-slate-600">
                            100% Practical
                        </span>
                    )}
                </div>

                {/* Compact Robot Pedestal */}
                <div
                    className="flex items-center justify-center w-full py-1 relative"
                    style={{ containerType: 'inline-size' }}
                >
                    <div className="relative w-64 h-68 flex justify-center items-end pb-2">
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
                                    <div className={`w-13 h-13 sm:w-15 sm:h-15 bg-[#FFFFFF] rounded-2xl flex items-center justify-center p-2.5 sm:p-3 relative shadow-md border ${SPAWN_ACCENTS[index % SPAWN_ACCENTS.length]} transition-[transform,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:z-50 cursor-pointer`}>
                                        <img
                                            src={item.url}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                            width={64}
                                            height={64}
                                            decoding="sync"
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
                            {/* Head & Attached Antenna Pivot */}
                            <div
                                style={{
                                    transform: `translate3d(${headOffset.x}px, ${headOffset.y}px, 0) rotate(${headRotation}deg)`,
                                    transition: isPointerTracking
                                        ? 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)'
                                        : 'transform 620ms cubic-bezier(0.22, 1, 0.36, 1)'
                                }}
                                className="relative z-20 will-change-transform"
                            >
                                {/* Antenna (attached to head pivot) */}
                                <div
                                    style={{
                                        animation: isInView ? 'robotAntenna 4s ease-in-out infinite' : 'none'
                                    }}
                                    className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center z-30"
                                >
                                    <div className="w-1.5 h-5 bg-slate-500 rounded-full" />
                                    <div className="w-4.5 h-4.5 bg-gradient-to-tr from-[#0EA5E9] to-[#38BDF8] rounded-full shadow-[0_0_16px_rgba(14,165,233,0.75)] animate-pulse border-2 border-white" />
                                </div>

                                {/* Head */}
                                <div className="w-38 h-30 bg-gradient-to-tr from-[#0F2D4A] via-[#2572AB] to-[#0EA5E9] rounded-3xl relative p-4 shadow-[0_20px_35px_-10px_rgba(37,114,171,0.45)] border-4 border-white overflow-hidden">
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
                                                            transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0) scaleY(${isBlinking ? 0.85 : 1})`,
                                                            transition: isPointerTracking
                                                                ? 'transform 80ms ease-out'
                                                                : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
                                                        }}
                                                        className="w-4.5 h-4.5 bg-[#0F172A] rounded-full"
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

                {/* Compact Integrated Career Path & Skill Bar (Merged into Bot Base) */}
                {activeTech && technologies && onSelectTech && (() => {
                    const selectedRole =
                        activeTech.careerPaths[selectedRoleIdx] || activeTech.careerPaths[0];
                    const SelectedRoleIcon = selectedRole?.icon;
                    return (
                        <div className="relative z-10 w-full pt-3 mt-1 border-t border-slate-200/80">
                            {/* Hairline Cycle Indicator */}
                            <div className="absolute -top-[1.5px] inset-x-0 h-[1.5px] overflow-hidden" aria-hidden="true">
                                <div
                                    key={activeTech.name}
                                    style={{
                                        animation: isAutoRotatePaused ? 'none' : 'icstCycleBar 2.4s linear both',
                                        transformOrigin: 'left center'
                                    }}
                                    className="h-full w-full bg-[#2572AB]/65 motion-reduce:animate-none!"
                                />
                            </div>

                            {/* Integrated Career Path Chooser After Connecting with ICST */}
                            <div
                                key={activeTech.name}
                                className="flex flex-col gap-2 mb-2.5 animate-[icstDockSwap_200ms_cubic-bezier(0.22,1,0.36,1)_both]"
                            >
                                <div className="flex items-center justify-between gap-2 text-left">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                        <Briefcase size={13} className="text-[#2572AB] shrink-0" aria-hidden="true" />
                                        <span>
                                            After ICST (<strong className="font-semibold text-[#0F172A]">{activeTech.courseTrack}</strong>)
                                        </span>
                                    </span>
                                    {selectedRole && (
                                        <Link
                                            to="/courses"
                                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2572AB] hover:text-[#1E5E91] transition-colors duration-150 no-underline group"
                                        >
                                            {SelectedRoleIcon && <SelectedRoleIcon size={12} aria-hidden="true" />}
                                            <span>{selectedRole.label}</span>
                                            <ArrowRight
                                                size={12}
                                                aria-hidden="true"
                                                className="group-hover:translate-x-0.5 transition-transform duration-150"
                                            />
                                        </Link>
                                    )}
                                </div>

                                <div
                                    className="flex flex-wrap items-center gap-1.5"
                                    role="radiogroup"
                                    aria-label={`Choose career path for ${activeTech.name}`}
                                >
                                    {activeTech.careerPaths.map((role, roleIdx) => {
                                        const picked = roleIdx === selectedRoleIdx;
                                        const RoleIcon = role.icon;
                                        return (
                                            <button
                                                key={role.label}
                                                type="button"
                                                role="radio"
                                                aria-checked={picked}
                                                onClick={() => setSelectedRoleIdx(roleIdx)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-[background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer whitespace-nowrap ${
                                                    picked
                                                        ? 'bg-[#2572AB] text-white border-[#2572AB]'
                                                        : 'bg-[#FFFFFF] text-slate-600 border-slate-200/90 hover:border-[#2572AB]/45 hover:text-[#0F172A]'
                                                }`}
                                            >
                                                <RoleIcon
                                                    size={13}
                                                    stroke={1.85}
                                                    aria-hidden="true"
                                                    className={picked ? 'text-white shrink-0' : 'text-[#2572AB] shrink-0'}
                                                />
                                                <span>{role.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Compact 8-Skill Selector with Original Icons (Zero Truncation) */}
                            <div
                                key={groupIndex}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-200/70 animate-[icstDockSwap_220ms_cubic-bezier(0.22,1,0.36,1)_both]"
                                role="tablist"
                                aria-label="Featured technologies"
                            >
                                {technologies.map((tech, idx) => {
                                    const active = idx === activeIndex;
                                    return (
                                        <button
                                            key={tech.name}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() => onSelectTech(idx)}
                                            className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-[background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer whitespace-nowrap border ${
                                                active
                                                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                                    : 'bg-[#FFFFFF] text-slate-600 border-slate-200/80 hover:border-slate-300 hover:text-[#0F172A]'
                                            }`}
                                        >
                                            <span
                                                className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 ${
                                                    active ? 'bg-white/95 p-0.5' : ''
                                                }`}
                                            >
                                                <img
                                                    src={tech.iconUrl}
                                                    alt=""
                                                    aria-hidden="true"
                                                    width={14}
                                                    height={14}
                                                    decoding="sync"
                                                    className="w-3.5 h-3.5 object-contain"
                                                />
                                            </span>
                                            <span>{tech.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {groupCount > 1 && onSelectGroup && (
                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50">
                                    <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                                        Stack {groupIndex + 1} of {groupCount}
                                    </span>
                                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Technology stack group">
                                        {Array.from({ length: groupCount }).map((_, gIdx) => {
                                            const activeGroup = gIdx === groupIndex;
                                            return (
                                                <button
                                                    key={gIdx}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeGroup}
                                                    aria-label={`Show technology group ${gIdx + 1}`}
                                                    onClick={() => onSelectGroup(gIdx)}
                                                    className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                                                        activeGroup
                                                            ? 'w-5 bg-[#2572AB]'
                                                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

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
                    @keyframes icstDockSwap {
                        0% {
                            opacity: 0;
                            transform: translateY(5px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes icstCycleBar {
                        0% {
                            transform: scaleX(0);
                        }
                        100% {
                            transform: scaleX(1);
                        }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        @keyframes icstDockSwap {
                            0%, 100% { opacity: 1; transform: none; }
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default InteractiveRobot;
