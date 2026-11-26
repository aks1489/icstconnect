import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
    IconSchool as GraduationCap,
    IconArrowRight as ArrowRight,
    IconTrophy as Trophy,
    IconAward as Award,
    IconFileCheck as FileCheck,
    IconCalendarEvent as CalendarEvent
} from '@tabler/icons-react'
import { scholarshipService } from '../../services/scholarshipService'
import type { ScholarshipSettings } from '../../types/scholarship'
import { revealOnScroll } from '../../lib/motion'

const SCHOLARSHIP_HIGHLIGHTS = [
    { label: 'Position Holders', icon: Award },
    { label: 'Scholarship Criteria', icon: FileCheck },
    { label: 'Exam Registration', icon: CalendarEvent }
] as const

export default function ScholarshipPromoSection() {
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)
    const bannerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let isMounted = true
        scholarshipService.getSettings().then(s => {
            if (isMounted) setSettings(s)
        })

        const unsubscribe = scholarshipService.onSettingsChange(updated => {
            if (isMounted) setSettings(updated)
        })

        const unsubRealtime = scholarshipService.subscribeToChanges(() => {
            scholarshipService.getSettings().then(s => {
                if (isMounted) setSettings(s)
            })
        })

        return () => {
            isMounted = false
            unsubscribe()
            unsubRealtime()
        }
    }, [])

    useEffect(() => {
        if (!bannerRef.current || !settings?.masterEnabled || !settings?.homepagePromotionEnabled) return
        return revealOnScroll(bannerRef.current, { translateY: 14, duration: 500 })
    }, [settings])

    if (!settings || !settings.masterEnabled || !settings.homepagePromotionEnabled) {
        return null
    }

    return (
        <section className="py-16 lg:py-20 px-4 md:px-6 bg-gradient-to-b from-[#F8FAFC] via-[#F5F9FD] to-[#F7FAFE] relative overflow-hidden">
            <div ref={bannerRef} className="container mx-auto max-w-7xl relative z-10">
                {/* Refined Frosted Card Preserving Blended Section Continuity */}
                <div className="relative rounded-3xl bg-[#FFFFFF]/88 backdrop-blur-md border border-slate-200/90 shadow-[0_24px_56px_-22px_rgba(15,23,42,0.12)] overflow-hidden p-7 sm:p-10 lg:px-12 lg:py-11">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                        {/* Left Editorial Copy */}
                        <div className="space-y-4 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#2572AB] border border-slate-200/90 text-xs font-medium">
                                <Trophy size={13} className="text-[#2572AB]" aria-hidden="true" />
                                <span>ICST Scholarship Program</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-[#0F172A] leading-[1.12]">
                                Empowering Young Minds <span className="text-[#2572AB]">Through Education</span>
                            </h2>

                            <p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-0">
                                Discover past position holders, scholarship criteria, and exam registration details. We support exceptional talent across computer applications and academic excellence.
                            </p>

                            {/* Feature Pills */}
                            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                {SCHOLARSHIP_HIGHLIGHTS.map(({ label, icon: ItemIcon }) => (
                                    <span
                                        key={label}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs font-medium text-slate-700"
                                    >
                                        <ItemIcon size={14} className="text-[#2572AB]" aria-hidden="true" />
                                        <span>{label}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right Merit Portal Action Card */}
                        <div className="shrink-0 mx-auto lg:mx-0 w-full max-w-xs sm:max-w-sm lg:w-auto">
                            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/90 p-4 sm:p-5 flex flex-col items-center lg:items-stretch gap-3">
                                <div className="w-full flex items-center justify-between gap-4 text-xs font-medium text-slate-500 px-0.5">
                                    <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                                        Merit Excellence Portal
                                    </span>
                                    <span className="text-[#2572AB]">Official Track</span>
                                </div>

                                <Link
                                    to="/scholarships"
                                    className="w-full px-7 py-3.5 bg-[#0F172A] hover:bg-[#2572AB] text-white font-semibold text-sm sm:text-base rounded-xl shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] no-underline group"
                                >
                                    <GraduationCap size={18} className="text-white/90" aria-hidden="true" />
                                    <span>Explore Scholarship</span>
                                    <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
