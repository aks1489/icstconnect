import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, GraduationCap, Sparkles, X } from 'lucide-react'
import { scholarshipService } from '../../services/scholarshipService'
import type { ScholarshipSettings } from '../../types/scholarship'

export default function ScholarshipHeroBanner() {
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)
    const [isDismissed, setIsDismissed] = useState(false)

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

    // If dismissed by user close button, return null
    if (isDismissed) {
        return null
    }

    // STRICT MASTER SWITCH CHECK: If master switch is OFF, no banner visible at all
    if (!settings || !settings.masterEnabled || !settings.bannerEnabled) {
        return null
    }

    const isClickable = settings.bannerRedirectEnabled && Boolean(settings.bannerRedirectUrl)
    const redirectUrl = settings.bannerRedirectUrl || '#'
    const isExternalLink = redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDismissed(true)
    }

    const bannerContent = (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group border border-slate-800 transition-all duration-300 hover:shadow-indigo-500/10">
            {/* Closable Button (X) */}
            <button
                type="button"
                onClick={handleClose}
                title="Dismiss Banner"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-950/90 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            >
                <X size={20} />
            </button>

            <div className="relative">
                <img
                    src={settings.bannerImage}
                    alt="ICST Scholarship Banner"
                    className={`w-full h-[320px] sm:h-[400px] md:h-[480px] object-cover transition-transform duration-700 ease-out ${isClickable ? 'group-hover:scale-105 cursor-pointer' : ''}`}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                    <div className="max-w-4xl space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                <Sparkles size={14} className="fill-slate-950" />
                                ICST Scholarship
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                            Empowering Young Minds Through Education
                        </h2>

                        <p className="text-sm md:text-base text-slate-200 line-clamp-2 max-w-2xl drop-shadow">
                            Discover talent search examinations, financial awards, and merit scholarship programs for ambitious students.
                        </p>

                        {/* Result CTA Button */}
                        {settings.resultEnabled && (
                            <div className="pt-2 flex flex-wrap items-center gap-4">
                                {settings.resultUrl.startsWith('http') ? (
                                    <a
                                        href={settings.resultUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 no-underline z-10"
                                    >
                                        <span>{settings.resultButtonText || 'View Scholarship Result'}</span>
                                        <ArrowUpRight size={18} />
                                    </a>
                                ) : (
                                    <Link
                                        to={settings.resultUrl}
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 no-underline z-10"
                                    >
                                        <span>{settings.resultButtonText || 'View Scholarship Result'}</span>
                                        <ArrowUpRight size={18} />
                                    </Link>
                                )}

                                {settings.scholarshipPageEnabled && (
                                    <Link
                                        to="/scholarships"
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-sm rounded-xl border border-white/20 flex items-center gap-2 transition-all no-underline z-10"
                                    >
                                        <GraduationCap size={18} />
                                        <span>Explore Winners & Details</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <section className="py-6 px-4 md:px-6 max-w-7xl mx-auto font-inter">
            {isClickable ? (
                isExternalLink ? (
                    <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="block no-underline">
                        {bannerContent}
                    </a>
                ) : (
                    <Link to={redirectUrl} className="block no-underline">
                        {bannerContent}
                    </Link>
                )
            ) : (
                bannerContent
            )}
        </section>
    )
}
