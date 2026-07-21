import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    GraduationCap,
    Trophy,
    Medal,
    Award,
    ExternalLink,
    ChevronDown,
    ArrowLeft,
    Sparkles,
    Calendar,
    CheckCircle2,
    Camera,
    Image as ImageIcon,
    X
} from 'lucide-react'
import { scholarshipService } from '../services/scholarshipService'
import type { ScholarshipSettings, ScholarshipWinner, ScholarshipExamImage } from '../types/scholarship'
import TailwindDropdown from '../components/ui/TailwindDropdown'

export default function ScholarshipsPage() {
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)
    const [winners, setWinners] = useState<ScholarshipWinner[]>([])
    const [examImages, setExamImages] = useState<ScholarshipExamImage[]>([])
    const [selectedExamImage, setSelectedExamImage] = useState<ScholarshipExamImage | null>(null)
    const [selectedYear, setSelectedYear] = useState<number>(2026)

    useEffect(() => {
        loadData()
        const unsubscribe = scholarshipService.onSettingsChange(updated => {
            setSettings(updated)
        })
        return () => unsubscribe()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [s, w, e] = await Promise.all([
                scholarshipService.getSettings(),
                scholarshipService.getWinners(),
                scholarshipService.getExamImages()
            ])
            setSettings(s)
            setWinners(w.filter(item => item.published))
            setExamImages(e.filter(item => item.published))

            const availableYears = Array.from(new Set(w.map(item => item.year))).sort((a, b) => b - a)
            if (availableYears.length > 0) {
                setSelectedYear(availableYears[0])
            }
        } catch (err) {
            console.error('Failed to load scholarship data', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 font-inter">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500 font-medium">Loading Scholarship Portal...</p>
                </div>
            </div>
        )
    }

    // Note: The /scholarships page remains active even if master control is off

    const availableYears = Array.from(new Set(winners.map(w => w.year))).sort((a, b) => b - a)
    if (!availableYears.includes(2026)) availableYears.unshift(2026)

    const yearWinners = winners.filter(w => w.year === selectedYear).sort((a, b) => a.rank - b.rank)

    const firstRank = yearWinners.find(w => w.rank === 1)
    const secondRank = yearWinners.find(w => w.rank === 2)
    const thirdRank = yearWinners.find(w => w.rank === 3)
    const otherWinners = yearWinners.filter(w => w.rank > 3)

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-inter">

            {/* HERO BANNER SECTION */}
            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>ICST Merit & Talent Search Scholarships</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                        Honoring Academic Excellence & Future Leaders
                    </h1>

                    <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                        ICST Connect celebrates top position holders who have achieved remarkable scores in computer technology, mathematics, and digital skills.
                    </p>

                    {settings?.resultEnabled && settings?.resultUrl && (
                        <div className="pt-2">
                            <a
                                href={settings.resultUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm md:text-base rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 no-underline"
                            >
                                <span>{settings?.resultButtonText || 'View Scholarship Result'}</span>
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 space-y-12">

                {/* YEAR FILTER BAR */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Scholarship Winners Gallery</h2>
                            <p className="text-xs text-slate-500">Select an academic year to view position holders and marks.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <label className="text-sm font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
                            <Calendar size={16} className="text-indigo-600" />
                            Select Year:
                        </label>
                        <TailwindDropdown
                            options={availableYears.map(yr => ({
                                label: `Academic Year ${yr}`,
                                value: yr
                            }))}
                            value={selectedYear}
                            onChange={(val) => setSelectedYear(Number(val))}
                            className="w-full md:w-56"
                        />
                    </div>
                </div>

                {yearWinners.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center space-y-3">
                        <Award className="mx-auto text-slate-300" size={48} />
                        <h3 className="text-lg font-bold text-slate-800">No Winners Announced for {selectedYear}</h3>
                        <p className="text-slate-500 text-sm">Winner records for this academic year will be published shortly.</p>
                    </div>
                ) : (
                    <div className="space-y-12">

                        {/* FIRST POSITION HOLDER - LARGE FEATURED CARD */}
                        {firstRank && (
                            <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-8 md:p-12 shadow-2xl overflow-hidden border border-amber-400">
                                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                                    <div className="relative shrink-0">
                                        <img
                                            src={firstRank.photo}
                                            alt={firstRank.studentName}
                                            className="w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover border-4 border-white/40 shadow-2xl"
                                            loading="lazy"
                                        />
                                        <div className="absolute -top-4 -left-4 bg-amber-300 text-amber-950 font-black text-xs px-3 py-1.5 rounded-full shadow-lg border border-white uppercase tracking-wider flex items-center gap-1">
                                            <Trophy size={14} className="fill-amber-950" />
                                            🥇 1st Rank (Gold)
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-center lg:text-left flex-1">
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                            Academic Year {firstRank.year} Champion
                                        </div>

                                        <h3 className="text-3xl md:text-4xl font-black text-white">{firstRank.studentName}</h3>

                                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                                            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                                                School: <span className="font-bold">{firstRank.schoolName}</span>
                                            </div>
                                            {firstRank.district && (
                                                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                                                    District: <span className="font-bold">{firstRank.district}</span>
                                                </div>
                                            )}
                                            <div className="bg-white text-amber-950 font-extrabold px-4 py-1.5 rounded-xl shadow">
                                                Score: {firstRank.marks}
                                            </div>
                                        </div>

                                        {firstRank.description && (
                                            <p className="text-amber-50 text-sm md:text-base italic leading-relaxed pt-2">
                                                "{firstRank.description}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECOND AND THIRD POSITION CARDS */}
                        {(secondRank || thirdRank) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {secondRank && (
                                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative shrink-0">
                                            <img
                                                src={secondRank.photo}
                                                alt={secondRank.studentName}
                                                className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                                                loading="lazy"
                                            />
                                            <div className="absolute -top-3 -left-3 bg-slate-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow">
                                                🥈 2nd Rank
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-center sm:text-left flex-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Silver Medalist</span>
                                            <h4 className="text-xl font-bold text-slate-900">{secondRank.studentName}</h4>
                                            <p className="text-xs text-slate-600 font-medium">{secondRank.schoolName} ({secondRank.district})</p>
                                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                                                Score: {secondRank.marks}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {thirdRank && (
                                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative shrink-0">
                                            <img
                                                src={thirdRank.photo}
                                                alt={thirdRank.studentName}
                                                className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                                                loading="lazy"
                                            />
                                            <div className="absolute -top-3 -left-3 bg-amber-800 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow">
                                                🥉 3rd Rank
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-center sm:text-left flex-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bronze Medalist</span>
                                            <h4 className="text-xl font-bold text-slate-900">{thirdRank.studentName}</h4>
                                            <p className="text-xs text-slate-600 font-medium">{thirdRank.schoolName} ({thirdRank.district})</p>
                                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                                                Score: {thirdRank.marks}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OTHER TOP WINNERS - RESPONSIVE GRID (4 DESKTOP / 2 TABLET / 1 MOBILE) */}
                        {otherWinners.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Medal className="text-indigo-600" size={20} />
                                    Top Merit Position Holders ({selectedYear})
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {otherWinners.map(winner => (
                                        <div
                                            key={winner.id}
                                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 space-y-3"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={winner.photo}
                                                    alt={winner.studentName}
                                                    className="w-full h-44 rounded-xl object-cover border border-slate-100"
                                                    loading="lazy"
                                                />
                                                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                                                    Rank #{winner.rank}
                                                </span>
                                                <span className="absolute bottom-2 right-2 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow">
                                                    {winner.marks}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-900 text-base line-clamp-1">{winner.studentName}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-1 font-medium">{winner.schoolName}</p>
                                                {winner.district && (
                                                    <p className="text-[11px] text-slate-400">{winner.district}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* SCHOLARSHIP EXAMINATION GALLERY & MOMENTS SECTION */}
                <div className="pt-8 border-t border-slate-200/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Scholarship Examination Moments</h3>
                                <p className="text-xs text-slate-500">Glimpses from talent search examinations conducted across participating schools and centers.</p>
                            </div>
                        </div>
                    </div>

                    {examImages.length === 0 ? (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center text-slate-400 text-sm">
                            No examination gallery photos published yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {examImages.map(imgItem => (
                                <div
                                    key={imgItem.id}
                                    onClick={() => setSelectedExamImage(imgItem)}
                                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
                                >
                                    <div className="relative h-52 bg-slate-900 overflow-hidden">
                                        <img
                                            src={imgItem.image}
                                            alt={imgItem.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30">
                                            {imgItem.session}
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20">
                                            Year {imgItem.year}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">{imgItem.schoolName}</span>
                                            <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">{imgItem.title}</h4>
                                            {imgItem.description && (
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{imgItem.description}</p>
                                            )}
                                        </div>

                                        <div className="pt-2 text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            <span>View full photo</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* LIGHTBOX PREVIEW MODAL */}
            {selectedExamImage && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4"
                    onClick={() => setSelectedExamImage(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[60vh]">
                            <img
                                src={selectedExamImage.image}
                                alt={selectedExamImage.title}
                                className="max-h-[60vh] w-auto max-w-full object-contain"
                            />
                            <button
                                onClick={() => setSelectedExamImage(null)}
                                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-2 bg-white">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                                    {selectedExamImage.session}
                                </span>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                                    School: {selectedExamImage.schoolName}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{selectedExamImage.title}</h3>
                            {selectedExamImage.description && (
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedExamImage.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
