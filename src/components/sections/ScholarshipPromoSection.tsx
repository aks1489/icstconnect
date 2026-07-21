import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowRight, Trophy } from 'lucide-react'
import { scholarshipService } from '../../services/scholarshipService'
import type { ScholarshipSettings } from '../../types/scholarship'

export default function ScholarshipPromoSection() {
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)

    useEffect(() => {
        let isMounted = true
        scholarshipService.getSettings().then(s => {
            if (isMounted) setSettings(s)
        })

        const unsubscribe = scholarshipService.onSettingsChange(updated => {
            if (isMounted) setSettings(updated)
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    if (!settings || !settings.masterEnabled || !settings.homepagePromotionEnabled) {
        return null
    }

    return (
        <section className="py-12 px-4 md:px-6 max-w-7xl mx-auto font-inter">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-8 md:p-12 text-white border border-slate-800 shadow-2xl">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                            <Trophy size={14} className="text-amber-400" />
                            <span>ICST Scholarship Program</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Empowering Young Minds Through Education.
                        </h2>

                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                            Discover past position holders, scholarship criteria, and exam registration details. We support exceptional talent across computer applications and academic excellence.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <Link
                            to="/scholarships"
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 no-underline"
                        >
                            <GraduationCap size={20} />
                            <span>Explore Scholarship</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
