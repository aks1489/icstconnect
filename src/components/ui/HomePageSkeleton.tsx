import React from 'react'

interface ShimmerBlockProps {
    className?: string
    variant?: 'default' | 'brand'
}

export const HomeShimmerBlock: React.FC<ShimmerBlockProps> = ({
    className = '',
    variant = 'default'
}) => {
    return (
        <div
            aria-hidden="true"
            className={`${variant === 'brand' ? 'icst-shimmer-brand' : 'icst-shimmer'} ${className}`}
        />
    )
}

interface HomePageSkeletonProps {
    showNavShell?: boolean
}

const HomePageSkeleton: React.FC<HomePageSkeletonProps> = ({ showNavShell = false }) => {
    return (
        <div
            className="min-h-screen bg-[#FFFFFF] text-[#0F172A] overflow-hidden"
            role="status"
            aria-label="Loading ICST Connect home page"
        >
            {/* Optional Fixed Glass NavBar Shell for Initial Full-Page Load */}
            {showNavShell && (
                <div className="fixed top-0 left-0 right-0 z-[1040] bg-white/85 backdrop-blur-xl border-b border-slate-200/80 py-3">
                    <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HomeShimmerBlock className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1.5">
                                <HomeShimmerBlock className="w-12 h-3.5 rounded-md" />
                                <HomeShimmerBlock className="w-16 h-2 rounded-md" />
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-5">
                            {[46, 58, 76, 82, 52, 72, 48, 56, 62].map((width, i) => (
                                <div key={i} style={{ width }}>
                                    <HomeShimmerBlock className="h-3.5 rounded-md" />
                                </div>
                            ))}
                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <HomeShimmerBlock variant="brand" className="w-24 h-9 rounded-xl" />
                        </div>

                        <HomeShimmerBlock className="lg:hidden w-8 h-8 rounded-lg" />
                    </div>
                </div>
            )}

            {/* Hero Stage Skeleton (Mirrors HeroSection + InteractiveRobot 12-Col Layout) */}
            <section className="relative pt-28 pb-16 md:pt-34 md:pb-22 lg:pt-36 lg:pb-24 bg-[#FFFFFF] overflow-hidden">
                {/* Subtle Light Aurora & Architectural Grid */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                            maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 30%, transparent 100%)'
                        }}
                    />
                    <div className="absolute -top-36 -left-24 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(56,189,248,0.16)_0%,transparent_65%)]" />
                    <div className="absolute top-10 right-0 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(79,70,229,0.12)_0%,transparent_65%)]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
                        {/* Left Editorial Hero Column */}
                        <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-center lg:items-start">
                            {/* Pill Eyebrow */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs mb-7">
                                <HomeShimmerBlock variant="brand" className="w-5 h-5 rounded-full" />
                                <HomeShimmerBlock className="w-32 h-3 rounded-full" />
                            </div>

                            {/* H1 Display Lines */}
                            <div className="w-full max-w-lg space-y-3.5 mb-6 flex flex-col items-center lg:items-start">
                                <HomeShimmerBlock className="h-11 sm:h-14 w-4/5 rounded-2xl" />
                                <HomeShimmerBlock variant="brand" className="h-11 sm:h-14 w-3/5 rounded-2xl" />
                            </div>

                            {/* Subtitle Lines */}
                            <div className="w-full max-w-md space-y-2.5 mb-9 flex flex-col items-center lg:items-start">
                                <HomeShimmerBlock className="h-4 w-full rounded-lg" />
                                <HomeShimmerBlock className="h-4 w-3/4 rounded-lg" />
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto justify-center lg:justify-start mb-10">
                                <HomeShimmerBlock variant="brand" className="h-13.5 w-full sm:w-48 rounded-xl" />
                                <HomeShimmerBlock className="h-13.5 w-full sm:w-40 rounded-xl border border-slate-200/80" />
                            </div>

                            {/* Trust Micro-strip */}
                            <div className="pt-6 border-t border-slate-200/75 w-full max-w-md flex flex-wrap justify-center lg:justify-start gap-6">
                                <HomeShimmerBlock className="h-4 w-28 rounded-full" />
                                <HomeShimmerBlock className="h-4 w-28 rounded-full" />
                                <HomeShimmerBlock className="h-4 w-24 rounded-full" />
                            </div>
                        </div>

                        {/* Right Frosted Bot & Dock Stage Skeleton */}
                        <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
                            <div className="w-full max-w-md lg:max-w-[490px] rounded-[2rem] bg-gradient-to-br from-[#F8FAFC] via-[#FFFFFF] to-[#EFF6FF] border border-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_28px_64px_-20px_rgba(15,23,42,0.12)] p-5 sm:p-6 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <HomeShimmerBlock className="h-6 w-44 rounded-full" />
                                    <HomeShimmerBlock className="h-3 w-24 rounded-full hidden sm:block" />
                                </div>

                                {/* Center Bot Pedestal Silhouette */}
                                <div className="py-6 flex flex-col items-center justify-center">
                                    <HomeShimmerBlock variant="brand" className="w-36 h-28 rounded-3xl mb-1" />
                                    <HomeShimmerBlock className="w-24 h-24 rounded-b-[2.5rem] rounded-t-xl" />
                                    <div className="flex gap-3 mt-1">
                                        <HomeShimmerBlock className="w-7 h-8 rounded-b-xl" />
                                        <HomeShimmerBlock className="w-7 h-8 rounded-b-xl" />
                                    </div>
                                </div>

                                {/* Bottom Docked Curriculum Card */}
                                <div className="rounded-2xl bg-white/90 border border-slate-200/90 p-3.5 shadow-xs">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <HomeShimmerBlock variant="brand" className="w-10 h-10 rounded-xl" />
                                            <div className="space-y-1.5">
                                                <HomeShimmerBlock className="w-14 h-2.5 rounded-md" />
                                                <HomeShimmerBlock className="w-24 h-4 rounded-md" />
                                            </div>
                                        </div>
                                        <HomeShimmerBlock className="w-22 h-5 rounded-full" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-100">
                                        {[1, 2, 3, 4].map((i) => (
                                            <HomeShimmerBlock key={i} className="h-7 rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Ticker Pill Strip Skeleton */}
            <div className="py-5 bg-[#F8FAFC] border-y border-slate-200/80">
                <div className="container mx-auto px-4 mb-2.5 flex justify-between">
                    <HomeShimmerBlock className="h-2.5 w-36 rounded-full" />
                    <HomeShimmerBlock className="h-2.5 w-44 rounded-full hidden sm:block" />
                </div>
                <div className="flex items-center justify-center gap-6 px-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/85 shrink-0"
                        >
                            <HomeShimmerBlock className="w-7 h-7 rounded-full" />
                            <HomeShimmerBlock className="w-18 h-3.5 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            <HomeShimmerStyles />
        </div>
    )
}

export const HomeShimmerStyles = () => (
    <style>{`
        .icst-shimmer {
            background: linear-gradient(
                105deg,
                #E8EEF5 0%,
                #E8EEF5 36%,
                #F8FBFF 50%,
                #E8EEF5 64%,
                #E8EEF5 100%
            );
            background-size: 220% 100%;
            animation: icstShimmerSweep 1.65s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .icst-shimmer-brand {
            background: linear-gradient(
                105deg,
                rgba(37, 114, 171, 0.14) 0%,
                rgba(79, 70, 229, 0.14) 36%,
                rgba(255, 255, 255, 0.85) 50%,
                rgba(14, 165, 233, 0.16) 64%,
                rgba(37, 114, 171, 0.14) 100%
            );
            background-size: 220% 100%;
            animation: icstShimmerSweep 1.65s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes icstShimmerSweep {
            0% { background-position: 120% 0; }
            100% { background-position: -100% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
            .icst-shimmer,
            .icst-shimmer-brand {
                animation: none;
                background-position: 0 0;
            }
        }
    `}</style>
)

export default HomePageSkeleton
