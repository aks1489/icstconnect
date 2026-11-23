import { useEffect, useRef } from 'react';
import {
    IconDeviceGamepad2 as Gamepad2,
    IconStar as Star,
    IconTrophy as Trophy,
    IconRocket,
    IconExternalLink,
} from '@tabler/icons-react';
import { animate } from 'animejs';

const LearningHubPreview = () => {
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let anim1: ReturnType<typeof animate> | undefined;
        let anim2: ReturnType<typeof animate> | undefined;

        if (card1Ref.current) {
            anim1 = animate(card1Ref.current, {
                translateY: [0, -20],
                duration: 4000,
                ease: 'inOutSine',
                loop: true,
                alternate: true,
            });
        }

        if (card2Ref.current) {
            anim2 = animate(card2Ref.current, {
                translateY: [0, 20],
                duration: 5000,
                delay: 500,
                ease: 'inOutSine',
                loop: true,
                alternate: true,
            });
        }

        return () => {
            anim1?.revert();
            anim2?.revert();
        };
    }, []);

    return (
        <section className="py-20 bg-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[128px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[128px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16">

                    {/* Text Content */}
                    <div className="lg:w-1/2 text-center lg:text-left pt-8 lg:pt-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-xs sm:text-sm uppercase tracking-wider mb-6">
                            <Gamepad2 size={16} />
                            <span>New Feature</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            Master Computers <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                The Fun Way
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Dive into our new <strong>Learning Hub</strong>! Build PCs, fight viruses, and master keyboard skills with 50+ interactive mini-games designed for students.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a
                                href="https://labs.icstconnect.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 group"
                            >
                                <IconRocket size={20} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                <span>Launch Labs</span>
                                <IconExternalLink size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm justify-center">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star fill="currentColor" size={20} />
                                    <Star fill="currentColor" size={20} />
                                    <Star fill="currentColor" size={20} />
                                    <Star fill="currentColor" size={20} />
                                    <Star fill="currentColor" size={20} />
                                </div>
                                <span className="text-white font-bold">50+ Levels</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Preview */}
                    <div className="lg:w-1/2 relative w-full">
                        {/* Floating Cards Mockup */}
                        <div className="relative w-full max-w-[320px] sm:max-w-md mx-auto aspect-square">
                            {/* Card 1 */}
                            <div ref={card1Ref} className="absolute top-0 right-0 z-20">
                                <a
                                    href="https://labs.icstconnect.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Earn Badges on ICST Labs"
                                    className="w-36 h-36 sm:w-48 sm:h-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 flex flex-col items-center justify-center gap-2 sm:gap-4 border-b-8 border-slate-200 dark:border-slate-800 rotate-6 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:shadow-green-500/20 group cursor-pointer block"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                                        <Trophy size={24} className="sm:w-8 sm:h-8" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-black text-sm sm:text-base text-slate-800 dark:text-white transition-colors group-hover:text-green-500 dark:group-hover:text-green-400">Earn Badges</div>
                                        <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Competitive Fun</div>
                                    </div>
                                </a>
                            </div>

                            {/* Card 2 */}
                            <div ref={card2Ref} className="absolute bottom-8 left-0 z-30">
                                <a
                                    href="https://labs.icstconnect.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Arcade Mode on ICST Labs"
                                    className="w-44 h-44 sm:w-56 sm:h-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 flex flex-col items-center justify-center gap-2 sm:gap-4 border-b-8 border-slate-200 dark:border-slate-800 -rotate-3 transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-blue-500/20 group cursor-pointer block"
                                >
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                                        <Gamepad2 size={32} className="sm:w-10 sm:h-10" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-black text-lg sm:text-xl text-slate-800 dark:text-white transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">Arcade Mode</div>
                                        <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Interactive Learning</div>
                                    </div>
                                </a>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full z-0"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LearningHubPreview;
