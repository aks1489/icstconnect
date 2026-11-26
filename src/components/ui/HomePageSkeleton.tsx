import React from 'react'
import { ThinkingOrb, type OrbSize, type OrbState } from 'thinking-orbs'

interface OrbSectionLoaderProps {
    state?: OrbState
    size?: OrbSize
    label?: string
    sublabel?: string
    className?: string
}

export const OrbSectionLoader: React.FC<OrbSectionLoaderProps> = ({
    state = 'working',
    size = 32,
    label,
    sublabel,
    className = ''
}) => {
    return (
        <div
            role="status"
            aria-label={label || 'Loading section content'}
            className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}
        >
            <ThinkingOrb
                state={state}
                size={size}
                theme="light"
                color="#2572AB"
                aria-label={label || 'Loading'}
            />
            {label && (
                <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-medium text-[#0F172A]">
                        {label}
                    </div>
                    {sublabel && (
                        <div className="text-[11px] text-slate-500">
                            {sublabel}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

interface HomePageSkeletonProps {
    showNavShell?: boolean
}

const HomePageSkeleton: React.FC<HomePageSkeletonProps> = ({ showNavShell = false }) => {
    return (
        <div
            className="min-h-screen bg-[#FFFFFF] text-[#0F172A] overflow-hidden flex flex-col"
            role="status"
            aria-label="Loading ICST Connect home page"
        >
            {/* Optional Fixed Hairline NavBar Shell for Initial Cold Load */}
            {showNavShell && (
                <div className="fixed top-0 left-0 right-0 z-[1040] bg-white/90 backdrop-blur-xl border-b border-slate-200/80 py-3">
                    <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#2572AB] text-white font-semibold flex items-center justify-center text-sm">
                                I
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-[#0F172A] text-base leading-none">ICST</span>
                                <span className="text-[10px] font-medium text-slate-500">Chowberia</span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-slate-200/90 text-xs font-medium text-slate-600">
                            <ThinkingOrb state="connecting" size={20} theme="light" color="#2572AB" />
                            <span>Preparing portal</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Centered Minimal Architectural Canvas with ThinkingOrb */}
            <section className="relative flex-1 flex items-center justify-center px-4 pt-24 pb-16 bg-[#FFFFFF]">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute inset-0 opacity-[0.42]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, rgba(15, 23, 42, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 100%)'
                        }}
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center px-8 py-10 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.12)]">
                    <ThinkingOrb
                        state="connecting"
                        size={64}
                        theme="light"
                        color="#2572AB"
                        aria-label="Loading ICST Connect"
                    />
                    <div className="mt-4 text-center">
                        <div className="text-sm font-semibold text-[#0F172A]">
                            ICST Connect
                        </div>
                        <p className="text-xs text-slate-500 mt-1 mb-0">
                            Loading courses, interactive labs &amp; campus hub
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePageSkeleton
