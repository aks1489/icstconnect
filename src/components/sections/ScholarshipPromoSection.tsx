import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { IconSchool as GraduationCap, IconArrowRight as ArrowRight, IconTrophy as Trophy } from '@tabler/icons-react'
import { scholarshipService } from '../../services/scholarshipService'
import type { ScholarshipSettings } from '../../types/scholarship'
import { revealOnScroll } from '../../lib/motion'

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
        <section className="py-14 px-4 md:px-6 bg-[#FFFFFF]">
            <div ref={bannerRef} className="max-w-7xl mx-auto">
                {/* 1px Gradient Hairline Frame */}
                <div className="p-[1px] rounded-[1.92rem] bg-gradient-to-r from-[#F59E0B]/55 via-slate-200/80 to-[#2572AB]/45 shadow-[0_22px_54px_-18px_rgba(15,23,42,0.12)]">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFFDF7] via-[#FFFFFF] to-[#F8FAFC] p-8 md:p-12">
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_65%)] pointer-events-none" aria-hidden="true" />
                        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-[radial-gradient(circle,rgba(37,114,171,0.08)_0%,transparent_65%)] pointer-events-none" aria-hidden="true" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4 text-center md:text-left max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FEF3C7]/85 text-[#92400E] border border-[#F59E0B]/30 text-[11px] font-semibold uppercase tracking-[0.12em]">
                                    <Trophy size={13} className="text-[#D97706]" aria-hidden="true" />
                                    <span>ICST Scholarship Program</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.025em] text-[#0F172A] leading-tight">
                                    Empowering Young Minds Through Education.
                                </h2>

                                <p className="text-[#475569] text-sm md:text-base leading-relaxed">
                                    Discover past position holders, scholarship criteria, and exam registration details. We support exceptional talent across computer applications and academic excellence.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                                <Link
                                    to="/scholarships"
                                    className="px-7 py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm rounded-xl shadow-[0_14px_28px_-8px_rgba(15,23,42,0.35)] hover:shadow-[0_18px_36px_-8px_rgba(217,119,6,0.35)] flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 no-underline border border-slate-800 group"
                                >
                                    <GraduationCap size={19} className="text-[#FBBF24]" aria-hidden="true" />
                                    <span>Explore Scholarship</span>
                                    <ArrowRight size={17} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
