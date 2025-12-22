import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence, useInView } from 'framer-motion';

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

const InteractiveRobot = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.1, once: false }); // Only active when visible

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [spawnedIcons, setSpawnedIcons] = useState<any[]>([]);
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);

    const bodyControls = useAnimation();
    const rightArmControls = useAnimation();

    // Optimized Mouse Handler with Throttling
    useEffect(() => {
        if (!isInView) return; // Disconnect listener if off-screen

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            // throttle via rAF
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth) * 2 - 1;
                const y = (e.clientY / window.innerHeight) * 2 - 1;
                setMousePosition({ x, y });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isInView]); // Re-bind only when visibility changes

    // Use ref to manage timeout cleanup for rapid clicking
    const timeoutRef = useRef<any>(null);

    const handleClick = useCallback(() => {
        // No lock - allow rapid clicking ("no delay")
        setIsInteracting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // 1. Immediate Data Update
        const shuffled = [...APPS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        const newIcons = selected.map((app, i) => ({
            id: Date.now() + i + Math.random(),
            ...app,
            xEnd: (i - 1) * 110 + (Math.random() * 20 - 10),
            yEnd: 130 + Math.random() * 30
        }));

        setSpawnedIcons(newIcons);

        // 2. Fire Animations Immediately (Concurrent)
        // Hand: Dig in (130) then throw (-45) in one fast fluid motion
        rightArmControls.start({
            rotate: [130, -45],
            zIndex: 30,
            transition: { duration: 0.4, ease: "backOut" }
        });

        bodyControls.start({
            y: [0, 10, -20, 0],
            scale: [1, 1.05, 0.95, 1],
            transition: { duration: 0.4, ease: "backOut" }
        });

        // 3. Reset Interaction State after animation finishes
        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
            if (isInView) {
                // Return to idle loop
                bodyControls.start({
                    y: [0, -15, 0],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                });
            }
        }, 500); // Match animation duration roughly
    }, [isInView, bodyControls, rightArmControls]);

    // Cleanup animations when out of view to save resources
    useEffect(() => {
        if (isInView) {
            bodyControls.start({
                y: [0, -15, 0],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            });
        } else {
            bodyControls.stop();
        }
    }, [isInView, bodyControls]);

    // Hand Tracking Logic
    useEffect(() => {
        if (!isInView) return;

        if (!isInteracting) {
            if (hoveredIcon) {
                const targetIcon = spawnedIcons.find(icon => icon.id === hoveredIcon);
                if (targetIcon) {
                    const targetRotation = targetIcon.xEnd * -0.35;
                    rightArmControls.start({
                        rotate: targetRotation,
                        zIndex: 15,
                        transition: { type: "spring", damping: 15, stiffness: 120 }
                    });
                }
            } else {
                rightArmControls.start({
                    rotate: -10,
                    zIndex: 10,
                    transition: { type: "spring", damping: 20, stiffness: 100 }
                });
            }
        }
    }, [mousePosition, isInteracting, rightArmControls, hoveredIcon, spawnedIcons, isInView]);

    const pupilMovement = {
        x: mousePosition.x * 8,
        y: mousePosition.y * 8
    };

    const headRotation = mousePosition.x * 5;

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-sm lg:max-w-md mx-auto min-h-[500px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,112,184,0.1)] border border-slate-100 flex items-center justify-center p-6 overflow-visible"
        >
            {/* Decorative clean background element */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent rounded-[2.5rem] pointer-events-none"></div>

            <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                <div className="relative w-64 h-96 flex justify-center items-end pb-10">

                    {/* Floating Icons Container */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 w-0 h-0 overflow-visible">
                        <AnimatePresence>
                            {spawnedIcons.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id} // Optimization: Framer motion needs this for shared layout transitions, but unique ID ensures no conflict
                                    initial={{ scale: 0, y: 50, x: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        y: item.yEnd,
                                        x: item.xEnd,
                                        opacity: 1,
                                    }}
                                    exit={{ scale: 0, opacity: 0, y: -50, transition: { duration: 0.2 } }}
                                    transition={{
                                        duration: 0.6,
                                        type: "spring",
                                        bounce: 0.4,
                                        delay: index * 0.05
                                    }}
                                    className="absolute pointer-events-auto"
                                    style={{ top: 0, left: 0 }}
                                    onMouseEnter={() => setHoveredIcon(item.id)}
                                    onMouseLeave={() => setHoveredIcon(null)}
                                >
                                    <motion.div
                                        className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 relative shadow-lg"
                                        whileHover={{
                                            scale: 1.2,
                                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                                            borderColor: "#3b82f6",
                                            zIndex: 50
                                        }}
                                        style={{ border: "1px solid #e2e8f0" }}
                                    >
                                        <img src={item.url} alt={item.name} className="w-full h-full object-contain" width={64} height={64} loading="lazy" />

                                        <AnimatePresence>
                                            {hoveredIcon === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                                    className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl z-[60] text-center pointer-events-none"
                                                >
                                                    <div className="font-bold text-sm mb-1">{item.name}</div>
                                                    <div className="text-[10px] text-slate-300 leading-tight">{item.desc}</div>
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Shadow */}
                    <motion.div
                        animate={isInView ? { scale: [1, 0.8, 1], opacity: [0.2, 0.4, 0.2] } : {}} // Only animate if in view
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 w-32 h-6 bg-black/20 rounded-full blur-md"
                    />

                    {/* Robot */}
                    <motion.div
                        animate={bodyControls}
                        onClick={handleClick}
                        className="relative z-10 flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
                    >
                        {/* Head */}
                        <motion.div
                            style={{ rotate: headRotation }}
                            className="w-40 h-32 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-3xl relative p-4 shadow-xl border-4 border-white z-20"
                        >
                            <motion.div
                                animate={isInView ? { rotate: [0, 5, -5, 0] } : {}}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                            >
                                <div className="w-1.5 h-6 bg-slate-400 rounded-full"></div>
                                <div className="w-5 h-5 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse border-2 border-white/50"></div>
                            </motion.div>

                            {/* Eyes */}
                            <div className="flex justify-between items-center h-full px-4 pt-2">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-black/5">
                                    <motion.div animate={pupilMovement} className="w-5 h-5 bg-slate-900 rounded-full" />
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-50"></div>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-black/5">
                                    <motion.div animate={pupilMovement} className="w-5 h-5 bg-slate-900 rounded-full" />
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-50"></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Body */}
                        <div className="w-28 h-32 bg-slate-100 rounded-b-[3rem] rounded-t-xl -mt-5 pt-6 pb-2 relative z-10 shadow-lg border-2 border-slate-200 flex flex-col items-center">
                            <div className="absolute bottom-0 w-24 h-20 bg-white rounded-b-[3rem] rounded-t-lg border-t-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden z-0">
                                <motion.div className="flex flex-col items-center justify-center p-2">
                                    <div className="text-xs font-black text-blue-600 leading-none tracking-tighter">ICST</div>
                                    <div className="w-8 h-[1px] bg-slate-200 my-0.5"></div>
                                    <div className="text-[5px] font-bold text-slate-400 uppercase tracking-wide leading-none">Chowberia</div>
                                </motion.div>
                            </div>

                            <motion.div
                                className="absolute top-8 -left-8 w-8 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full -z-10 origin-top-right border-2 border-white"
                                animate={isInView ? { rotate: [0, 5, 0] } : {}}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            />

                            <motion.div
                                animate={rightArmControls}
                                initial={{ rotate: -10 }}
                                className="absolute top-8 -right-8 w-8 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full origin-top-left border-2 border-white shadow-md cursor-pointer"
                            >
                                <div className="absolute bottom-0 w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex justify-center">
                                    <AnimatePresence>
                                        {hoveredIcon && !isInteracting && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 12, opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="absolute -bottom-2 w-3 h-4 bg-blue-500 rounded-full border-2 border-white origin-top"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>

                        {/* Legs */}
                        <div className="flex gap-4 -mt-4">
                            <div className="w-8 h-12 bg-slate-200 rounded-b-xl border-2 border-slate-300"></div>
                            <div className="w-8 h-12 bg-slate-200 rounded-b-xl border-2 border-slate-300"></div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveRobot;
