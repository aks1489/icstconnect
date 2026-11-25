import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight as ArrowRight, IconCertificate as Certificate, IconChecks as Checks } from '@tabler/icons-react'
import { revealOnScroll } from '../../../lib/motion'

const ASSESSMENT_TRACKS = [
    { label: 'Fundamentals', detail: 'Hardware, OS architecture & digital literacy quizzes.' },
    { label: 'Programming', detail: 'C, C++, Python & Web logic problem sets.' },
    { label: 'Web & Office', detail: 'Word, Excel, HTML/CSS & practical evaluations.' }
]

const TestSection = () => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [selectedTrack, setSelectedTrack] = useState(0)

    useEffect(() => {
        if (!cardRef.current) return
        return revealOnScroll(cardRef.current, { translateY: 16, duration: 550 })
    }, [])

    return (
        <section className="py-20 px-4 md:px-6 bg-[#FFFFFF]" id="onlinetest">
            <div ref={cardRef} className="max-w-7xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#091426] via-[#0F2744] to-[#1E3A8A] text-white p-8 sm:p-12 lg:p-16 shadow-[0_32px_72px_-20px_rgba(15,23,42,0.45)] border border-slate-800/40">
                    {/* Architectural Grid & Luminous Aurora */}
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                                backgroundSize: '52px 52px',
                                maskImage: 'radial-gradient(ellipse 80% 75% at 65% 45%, black 20%, transparent 100%)'
                            }}
                        />
                        <div className="absolute -top-24 right-0 w-[440px] h-[440px] bg-[radial-gradient(circle,rgba(56,189,248,0.24)_0%,transparent_65%)]" />
                        <div className="absolute -bottom-24 left-1/4 w-[380px] h-[380px] bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,transparent_65%)]" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
                        <div className="lg:col-span-7 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-[0.14em] mb-6 border border-white/15 text-[#E0F2FE]">
                                <Certificate size={15} className="text-[#FBBF24]" aria-hidden="true" />
                                <span>Get Certified</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] text-white leading-[1.08]">
                                Ready to Test Your Skills?
                            </h2>

                            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed mb-0">
                                Take our online assessment to evaluate your knowledge and get certified. Join thousands of students who have already proven their expertise.
                            </p>
                        </div>

                        <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-4">
                            <div className="w-full max-w-sm rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7DD3FC] mb-3">
                                    <Checks size={15} aria-hidden="true" />
                                    <span>Instant Evaluation</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3" role="tablist" aria-label="Assessment topic preview">
                                    {ASSESSMENT_TRACKS.map((track, idx) => {
                                        const active = idx === selectedTrack
                                        return (
                                            <button
                                                key={track.label}
                                                type="button"
                                                role="tab"
                                                aria-selected={active}
                                                onClick={() => setSelectedTrack(idx)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    active
                                                        ? 'bg-white text-[#0F172A] shadow-xs'
                                                        : 'bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15'
                                                }`}
                                            >
                                                {track.label}
                                            </button>
                                        )
                                    })}
                                </div>

                                <p className="text-xs text-slate-300 mb-4 leading-relaxed min-h-[32px]">
                                    {ASSESSMENT_TRACKS[selectedTrack].detail}
                                </p>

                                <Link
                                    to="/online-test"
                                    className="w-full bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F8FAFC] px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-[0_14px_30px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-2.5 group no-underline"
                                >
                                    <span>Start Online Test</span>
                                    <ArrowRight size={18} aria-hidden="true" className="text-[#2572AB] transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TestSection
