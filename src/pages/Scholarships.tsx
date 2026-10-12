import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    IconTrophy as Trophy,
    IconAward as Award,
    IconExternalLink as ExternalLink,
    IconSparkles as Sparkles,
    IconCamera as Camera,
    IconX as X,
    IconClock as Clock,
    IconBuildingBank as SchoolIcon,
    IconCircleCheck as CheckCircle2,
    IconSearch as Search,
    IconMapPin as MapPin,
    IconHistory as History,
    IconArrowLeft as ArrowLeft
} from '@tabler/icons-react'
import SEOHead from '../components/common/SEOHead'
import { scholarshipService } from '../services/scholarshipService'
import type {
    ScholarshipSettings,
    ScholarshipCampaign,
    ScholarshipSchool,
    ScholarshipSchoolParticipation,
    ScholarshipWinner,
    ScholarshipExamImage
} from '../types/scholarship'

export default function ScholarshipsPage() {
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(Date.now())
    const [settings, setSettings] = useState<ScholarshipSettings | null>(null)
    const [campaigns, setCampaigns] = useState<ScholarshipCampaign[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
    const [schools, setSchools] = useState<ScholarshipSchool[]>([])
    const [participations, setParticipations] = useState<ScholarshipSchoolParticipation[]>([])
    const [winners, setWinners] = useState<ScholarshipWinner[]>([])
    const [examImages, setExamImages] = useState<ScholarshipExamImage[]>([])
    const [selectedExamImage, setSelectedExamImage] = useState<ScholarshipExamImage | null>(null)

    // Lazy load cache for previous scholarship campaigns
    const [campaignCache, setCampaignCache] = useState<Record<string, { participations: ScholarshipSchoolParticipation[]; winners: ScholarshipWinner[] }>>({})
    const [isSwitchingCampaign, setIsSwitchingCampaign] = useState(false)

    // User filters
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all')

    // Live clock update every 1s for accurate scheduled releases & countdowns
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        loadData()
        const unsubSettings = scholarshipService.onSettingsChange(updated => {
            setSettings(updated)
        })
        const unsubRealtime = scholarshipService.subscribeToChanges(() => {
            loadData(false)
        })
        return () => {
            unsubSettings()
            unsubRealtime()
        }
    }, [])

    const loadData = async (showSpinner = true) => {
        if (showSpinner) setLoading(true)
        try {
            const [s, c, sc, e] = await Promise.all([
                scholarshipService.getSettings(),
                scholarshipService.getCampaigns(),
                scholarshipService.getSchools(),
                scholarshipService.getExamImages()
            ])
            setSettings(s)
            setSchools(sc)
            setExamImages(e.filter(item => item.published))

            // Sort campaigns: Latest first (descending by year)
            const sortedCampaigns = [...c].sort((a, b) => b.year - a.year)
            setCampaigns(sortedCampaigns)

            // Select latest campaign by default
            const latest = sortedCampaigns[0]
            if (latest) {
                const targetId = selectedCampaignId || latest.id
                setSelectedCampaignId(targetId)

                // Lazy load only the selected/latest campaign's participations & winners
                const targetCamp = sortedCampaigns.find(camp => camp.id === targetId) || latest
                const [p, w] = await Promise.all([
                    scholarshipService.getParticipations(targetId),
                    scholarshipService.getWinners(targetId, undefined, targetCamp.year)
                ])
                const publishedWinners = w.filter(item => item.published)

                setParticipations(p)
                setWinners(publishedWinners)
                setCampaignCache(prev => ({
                    ...prev,
                    [targetId]: { participations: p, winners: publishedWinners }
                }))
            }
        } catch (err) {
            console.error('Failed to load scholarship data', err)
        } finally {
            if (showSpinner) setLoading(false)
        }
    }

    // Lazy load previous or selected scholarship campaign on demand
    const handleSelectCampaign = async (campaignId: string) => {
        if (campaignId === selectedCampaignId) return
        setSelectedCampaignId(campaignId)

        // Check cache first
        if (campaignCache[campaignId]) {
            setParticipations(campaignCache[campaignId].participations)
            setWinners(campaignCache[campaignId].winners)
            return
        }

        // Lazy load on selection via API call
        try {
            setIsSwitchingCampaign(true)
            const targetCamp = campaigns.find(c => c.id === campaignId)
            const [lazyParts, lazyWins] = await Promise.all([
                scholarshipService.getParticipations(campaignId),
                scholarshipService.getWinners(campaignId, undefined, targetCamp?.year)
            ])
            const publishedWinners = lazyWins.filter(item => item.published)

            setCampaignCache(prev => ({
                ...prev,
                [campaignId]: {
                    participations: lazyParts,
                    winners: publishedWinners
                }
            }))
            setParticipations(lazyParts)
            setWinners(publishedWinners)
        } catch (err) {
            console.error('Failed to lazy load previous scholarship campaign data:', err)
        } finally {
            setIsSwitchingCampaign(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-24 font-inter">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading Scholarship Portal...</p>
                </div>
            </div>
        )
    }

    const latestCampaign = campaigns[0]
    const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0] || {
        id: 'default-2026',
        title: 'ICST Merit Scholarship Examination 2026',
        year: 2026,
        session: '2026-2027 Session',
        status: 'active' as const
    }
    const isViewingPrevious = Boolean(latestCampaign && activeCampaign.id !== latestCampaign.id)

    // Participating schools for current campaign
    const campaignParticipations = participations.filter(p => p.scholarshipId === activeCampaign.id)
    const participatingSchoolIds = campaignParticipations.map(p => p.schoolId)
    const activeSchools = schools.filter(s => participatingSchoolIds.includes(s.id))

    // Helper: calculate countdown
    const getCountdown = (targetDate?: string | null) => {
        if (!targetDate) return null
        const diff = new Date(targetDate).getTime() - currentTime
        if (diff <= 0) return null
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        return { days, hours, minutes, seconds }
    }

    // Quick stats
    const liveCount = activeSchools.filter(s => {
        const p = campaignParticipations.find(cp => cp.schoolId === s.id)
        return scholarshipService.evaluatePublicationStatus(activeCampaign.title, s.name, p).isAnnounced
    }).length
    const upcomingCount = activeSchools.length - liveCount

    // Filtered schools based on search & status
    const filteredSchools = activeSchools.filter(school => {
        const part = campaignParticipations.find(p => p.schoolId === school.id)
        const status = scholarshipService.evaluatePublicationStatus(activeCampaign.title, school.name, part)

        const matchesSearch = searchQuery.trim() === '' ||
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (school.address && school.address.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'live' && status.isAnnounced) ||
            (statusFilter === 'upcoming' && !status.isAnnounced)

        return matchesSearch && matchesStatus
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20 font-inter text-slate-900 dark:text-slate-100 transition-colors">
            <SEOHead
                title="Merit Scholarships & Talent Search Results | ICST Chowberia"
                description="Discover ICST Chowberia Talent Search scholarships, participating schools, scheduled winner releases, and academic awards."
                canonicalPath="/scholarships"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Scholarships', path: '/scholarships' }
                ]}
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'Who is eligible for ICST Talent Search Scholarships?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Students enrolled in school or secondary education who achieve top percentiles in the ICST Talent Search Examination are eligible for tuition fee concessions and merit awards.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'How can I check ICST scholarship results?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Results and position holder lists are published directly on the ICST Connect Scholarship Portal by participating school according to their announcement schedule.'
                            }
                        }
                    ]
                }}
            />

            {/* Visual Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-4">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">Scholarships</span>
                </nav>
            </div>

            {/* HERO BANNER SECTION */}
            <div className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 py-14 px-4 md:px-6 relative overflow-hidden border-b border-slate-200/80 dark:border-white/5 transition-colors duration-300">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30 text-xs font-black uppercase tracking-wider shadow-xs">
                        <Sparkles size={14} className="text-amber-500 dark:text-amber-400" />
                        <span>ICST Talent Search &amp; Merit Scholarships</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        Honoring Academic Excellence &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Future Leaders</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Official scholarship announcements and position holders from participating secondary schools across Nadia and North 24 Parganas.
                    </p>

                    {settings?.resultEnabled && settings?.resultUrl && (
                        <div className="pt-2">
                            <a
                                href={settings.resultUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 no-underline"
                            >
                                <span>{settings?.resultButtonText || 'View Scholarship Result'}</span>
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    )}

                    {/* Quick Stats Metrics Bar */}
                    <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto pt-4">
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 text-center shadow-xs hover:shadow-sm transition-all">
                            <span className="block text-2xl font-black text-amber-600 dark:text-amber-300">{activeSchools.length}</span>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Schools</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 text-center shadow-xs hover:shadow-sm transition-all">
                            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{liveCount}</span>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Results Live</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 text-center shadow-xs hover:shadow-sm transition-all">
                            <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-300">{upcomingCount}</span>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Releasing Soon</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 space-y-8">

                {/* ACADEMIC CAMPAIGN / YEAR SELECTOR (Always Latest by default + Lazy loaded previous editions) */}
                {campaigns.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center">
                                <History size={16} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                    Scholarship Academic Edition
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {isViewingPrevious ? 'Viewing previous archive edition' : 'Showing latest active scholarship campaign'}
                                </span>
                            </div>
                        </div>

                        {/* Session Switcher Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            {campaigns.map((camp, idx) => {
                                const isLatest = idx === 0
                                const isSelected = camp.id === selectedCampaignId
                                return (
                                    <button
                                        key={camp.id}
                                        type="button"
                                        onClick={() => handleSelectCampaign(camp.id)}
                                        disabled={isSwitchingCampaign && isSelected}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/30'
                                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80'
                                        }`}
                                    >
                                        {isLatest && <Sparkles size={13} className={isSelected ? 'text-amber-300' : 'text-amber-500'} />}
                                        <span>{camp.session || camp.year}</span>
                                        {isLatest ? (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                                                isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                            }`}>
                                                Latest
                                            </span>
                                        ) : (
                                            <span className="text-[10px] opacity-70">
                                                Archive
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ARCHIVE NOTICE BANNER (WHEN VIEWING PREVIOUS CAMPAIGN) */}
                {isViewingPrevious && (
                    <div className="p-4 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                            <History size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div>
                                <span className="font-bold">Archival Edition Active: </span>
                                <span>You are viewing historical results and participating schools from <strong>{activeCampaign.title}</strong> ({activeCampaign.session}).</span>
                            </div>
                        </div>
                        {latestCampaign && (
                            <button
                                type="button"
                                onClick={() => handleSelectCampaign(latestCampaign.id)}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all text-xs whitespace-nowrap cursor-pointer flex-shrink-0"
                            >
                                <ArrowLeft size={14} />
                                Return to Latest ({latestCampaign.session || latestCampaign.year})
                            </button>
                        )}
                    </div>
                )}

                {/* CAMPAIGN SWITCHER & SEARCH CONTROLS */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Active Campaign Info / Pills */}
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <Trophy size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    {activeCampaign.title}
                                </h2>
                                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {activeCampaign.session}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Select or search participating schools below to view official scores and releases.
                            </p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search school or district..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                All ({activeSchools.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('live')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                    statusFilter === 'live'
                                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Live ({liveCount})
                            </button>
                            <button
                                onClick={() => setStatusFilter('upcoming')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                    statusFilter === 'upcoming'
                                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                Upcoming ({upcomingCount})
                            </button>
                        </div>
                    </div>
                </div>

                {/* SCHOOLS SHOWCASE GRID (BALANCED 2-COLUMN MODERN CARDS) */}
                {isSwitchingCampaign ? (
                    <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-pulse">
                        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto text-indigo-600" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                Loading {activeCampaign.title}...
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Retrieving participating schools and verified results for {activeCampaign.session} from Supabase.
                            </p>
                        </div>
                    </div>
                ) : activeSchools.length > 0 ? (
                    filteredSchools.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                            <SchoolIcon size={40} className="mx-auto text-slate-400" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Schools Matching Search</h3>
                            <p className="text-xs text-slate-500">Try adjusting your school name or district search filter.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredSchools.map(school => {
                                const part = campaignParticipations.find(p => p.schoolId === school.id)
                                const status = scholarshipService.evaluatePublicationStatus(activeCampaign.title, school.name, part)
                                const countdown = getCountdown(part?.announcementDate)

                                const schoolWinners = winners.filter(w => {
                                    const matchCamp = w.scholarshipId ? w.scholarshipId === activeCampaign.id : w.year === activeCampaign.year
                                    const matchSchool = w.schoolId ? w.schoolId === school.id : w.schoolName === school.name
                                    return matchCamp && matchSchool
                                }).sort((a, b) => a.rank - b.rank)

                                const firstRank = schoolWinners.find(w => w.rank === 1)
                                const otherRanks = schoolWinners.filter(w => w.rank > 1)

                                return (
                                    <div
                                        key={school.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 mt-0.5">
                                                    <SchoolIcon size={22} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                                                        {school.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                                            {school.district}
                                                        </span>
                                                        {school.address && (
                                                            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 line-clamp-1">
                                                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                                                <span>{school.address}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {status.isAnnounced ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                                                    <CheckCircle2 size={13} />
                                                    <span>RESULTS LIVE</span>
                                                </span>
                                            ) : status.badgeType === 'scheduled' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0 flex items-center gap-1">
                                                    <Clock size={13} className="animate-spin" />
                                                    <span>SCHEDULED</span>
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 flex items-center gap-1">
                                                    <Clock size={13} />
                                                    <span>COMING SOON</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 flex-1 flex flex-col justify-center">
                                            {!status.isAnnounced ? (
                                                /* Notice & Countdown */
                                                <div className="space-y-5 text-center my-auto py-2">
                                                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto">
                                                            <Clock size={20} />
                                                        </div>

                                                        {/* POLISHED VISITOR NOTICE */}
                                                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                                                            {status.badgeType === 'scheduled'
                                                                ? `🏆 ${activeCampaign.title} — Official results for ${school.name} will be announced on ${status.dateText}.`
                                                                : `🏆 ${activeCampaign.title} — Official results for ${school.name} will be announced soon. Stay tuned!`
                                                            }
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            The academic evaluation committee is completing rank verifications. Scores will unlock automatically.
                                                        </p>
                                                    </div>

                                                    {/* Digital Countdown Timer */}
                                                    {countdown && (
                                                        <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <div className="text-center px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl min-w-[50px]">
                                                                <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">{countdown.days}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
                                                            </div>
                                                            <span className="font-black text-slate-300">:</span>
                                                            <div className="text-center px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl min-w-[50px]">
                                                                <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">{countdown.hours}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                                                            </div>
                                                            <span className="font-black text-slate-300">:</span>
                                                            <div className="text-center px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl min-w-[50px]">
                                                                <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">{countdown.minutes}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                                                            </div>
                                                            <span className="font-black text-slate-300">:</span>
                                                            <div className="text-center px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-xl min-w-[50px]">
                                                                <span className="block text-xl font-black text-amber-500">{countdown.seconds}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase">Secs</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Results LIVE: Position Holders List */
                                                <div className="space-y-4">
                                                    {schoolWinners.length === 0 ? (
                                                        <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed text-slate-500 text-xs">
                                                            Position holders for {school.name} will be published shortly.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* First Rank Card */}
                                                            {firstRank && (
                                                                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md flex items-center gap-4 relative overflow-hidden">
                                                                    <img
                                                                        src={firstRank.photo}
                                                                        alt={firstRank.studentName}
                                                                        width={64}
                                                                        height={64}
                                                                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/50 shrink-0 shadow-md"
                                                                        loading="lazy"
                                                                    />
                                                                    <div className="space-y-0.5 flex-1 min-w-0">
                                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 inline-block">
                                                                            🥇 1st Rank Champion
                                                                        </span>
                                                                        <h4 className="font-black text-base text-white truncate">{firstRank.studentName}</h4>
                                                                        <p className="text-xs text-amber-100 font-semibold">Score: {firstRank.marks}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Other Position Holders */}
                                                            {otherRanks.length > 0 && (
                                                                <div className="grid grid-cols-2 gap-2.5 pt-1">
                                                                    {otherRanks.map(w => (
                                                                        <div
                                                                            key={w.id}
                                                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2.5"
                                                                        >
                                                                            <img
                                                                                src={w.photo}
                                                                                alt={w.studentName}
                                                                                width={40}
                                                                                height={40}
                                                                                className="w-10 h-10 rounded-lg object-cover border shrink-0"
                                                                                loading="lazy"
                                                                            />
                                                                            <div className="min-w-0">
                                                                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                                                                    Rank #{w.rank}
                                                                                </span>
                                                                                <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">{w.studentName}</h5>
                                                                                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{w.marks}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                ) : (
                    /* Fallback when no participating schools configured */
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                        <Award size={48} className="mx-auto text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Participating Schools &amp; Announcements Coming Soon
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
                            The list of participating schools and scholarship publication dates for {activeCampaign.year} will be announced shortly.
                        </p>
                    </div>
                )}

                {/* EXAMINATION HALL MOMENTS GALLERY */}
                {examImages.length > 0 && (
                    <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-800">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Moments &amp; Gallery</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Glimpses of students appearing in the scholarship talent search examination.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {examImages.map(img => (
                                <div
                                    key={img.id}
                                    onClick={() => setSelectedExamImage(img)}
                                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={img.image}
                                            alt={img.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{img.title}</h4>
                                        <p className="text-xs text-slate-500">{img.schoolName} • Year {img.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* LIGHTBOX MODAL FOR EXAM MOMENTS */}
            {selectedExamImage && (
                <div
                    onClick={() => setSelectedExamImage(null)}
                    className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[1200] flex items-center justify-center p-4 animate-in fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
                    >
                        <div className="relative aspect-video bg-black">
                            <img src={selectedExamImage.image} alt={selectedExamImage.title} className="w-full h-full object-contain" />
                            <button
                                onClick={() => setSelectedExamImage(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedExamImage.title}</h3>
                            <p className="text-xs text-slate-500">{selectedExamImage.schoolName} • Session {selectedExamImage.session}</p>
                            {selectedExamImage.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">{selectedExamImage.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
