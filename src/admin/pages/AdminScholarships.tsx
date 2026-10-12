import { useState, useEffect } from 'react'
import {
    IconSchool as GraduationCap,
    IconPower as Power,
    IconTrophy as Trophy,
    IconDeviceFloppy as Save,
    IconPlus as Plus,
    IconTrash as Trash2,
    IconEdit as Edit3,
    IconCircleCheck as CheckCircle2,
    IconAlertCircle as AlertCircle,
    IconPhoto as ImageIcon,
    IconLayersLinked as Layers,
    IconX as X,
    IconRefresh as RefreshCw,
    IconCalendarTime as CalendarTime,
    IconBuildingBank as SchoolIcon,
    IconCheck as Check,
    IconClock as Clock,
    IconSparkles as Sparkles
} from '@tabler/icons-react'
import { scholarshipService } from '../../services/scholarshipService'
import type {
    ScholarshipSettings,
    ScholarshipCampaign,
    ScholarshipSchool,
    ScholarshipSchoolParticipation,
    ScholarshipWinner,
    ScholarshipExamImage,
    ScholarshipSyncResult
} from '../../types/scholarship'
import { useToast } from '../../contexts/ToastContext'
import TailwindDropdown from '../../components/ui/TailwindDropdown'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ImageCropUploadField from '../../components/common/ImageCropUploadField'

export default function AdminScholarships() {
    const { showToast } = useToast()
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)
    const [isConfirmLoading, setIsConfirmLoading] = useState(false)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingCount, setPendingCount] = useState<number>(() => scholarshipService.getPendingCount())
    const [syncModalResult, setSyncModalResult] = useState<ScholarshipSyncResult | null>(null)

    // Navigation Tabs
    const [activeTab, setActiveTab] = useState<'flow' | 'winners' | 'settings' | 'examPhotos'>('flow')

    // Core Data States
    const [campaigns, setCampaigns] = useState<ScholarshipCampaign[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
    const [schools, setSchools] = useState<ScholarshipSchool[]>([])
    const [participations, setParticipations] = useState<ScholarshipSchoolParticipation[]>([])
    const [winners, setWinners] = useState<ScholarshipWinner[]>([])
    const [examImages, setExamImages] = useState<ScholarshipExamImage[]>([])

    // Settings State
    const [settings, setSettings] = useState<ScholarshipSettings>({
        masterEnabled: true,
        bannerEnabled: true,
        bannerImage: '',
        bannerRedirectEnabled: true,
        bannerRedirectUrl: '',
        resultEnabled: true,
        resultUrl: '',
        resultButtonText: 'View Scholarship Result',
        homepagePromotionEnabled: true,
        navigationEnabled: true,
        scholarshipPageEnabled: true,
        winnersGalleryEnabled: true
    })

    // Modal States: Campaign
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<ScholarshipCampaign | null>(null)
    const [campaignForm, setCampaignForm] = useState({
        title: '',
        year: new Date().getFullYear(),
        session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1} Session`,
        description: '',
        status: 'active' as 'active' | 'upcoming' | 'archived'
    })

    // Modal States: School
    const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false)
    const [editingSchool, setEditingSchool] = useState<ScholarshipSchool | null>(null)
    const [schoolForm, setSchoolForm] = useState({
        name: '',
        district: 'Nadia',
        address: '',
        logo: ''
    })

    // Modal States: Schedule Publication Date & Time
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [schedulingParticipation, setSchedulingParticipation] = useState<{
        school: ScholarshipSchool
        participation?: ScholarshipSchoolParticipation
        announcementDate: string
        isOverride: boolean
    } | null>(null)

    // Winner Modal / Form state
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
    const [editingWinner, setEditingWinner] = useState<ScholarshipWinner | null>(null)
    const [selectedSchoolForWinner, setSelectedSchoolForWinner] = useState<string>('all')

    const [winnerForm, setWinnerForm] = useState({
        scholarshipId: '',
        schoolId: '',
        year: new Date().getFullYear(),
        rank: 1,
        studentName: '',
        schoolName: '',
        district: '',
        marks: '',
        photo: '',
        description: '',
        displayOrder: 1,
        published: true
    })

    // Exam Gallery Photos state
    const [isExamModalOpen, setIsExamModalOpen] = useState(false)
    const [editingExamImage, setEditingExamImage] = useState<ScholarshipExamImage | null>(null)

    const [examForm, setExamForm] = useState({
        title: '',
        schoolName: '',
        session: '2026-2027 Session',
        year: new Date().getFullYear(),
        image: '',
        description: '',
        published: true
    })

    useEffect(() => {
        loadData()
        const unsub = scholarshipService.onPendingChange(ops => {
            setPendingCount(ops.length)
        })
        const unsubRealtime = scholarshipService.subscribeToChanges(() => {
            loadData(false)
        })
        return () => {
            unsub()
            unsubRealtime()
        }
    }, [])

    const loadData = async (showSpinner = true) => {
        if (showSpinner) setLoading(true)
        try {
            const [s, c, sc, p, w, e] = await Promise.all([
                scholarshipService.getSettings(),
                scholarshipService.getCampaigns(),
                scholarshipService.getSchools(),
                scholarshipService.getParticipations(),
                scholarshipService.getWinners(),
                scholarshipService.getExamImages()
            ])
            setSettings(s)
            setCampaigns(c)
            setSchools(sc)
            setParticipations(p)
            setWinners(w)
            setExamImages(e)
            setPendingCount(scholarshipService.getPendingCount())

            if (c.length > 0 && !selectedCampaignId) {
                setSelectedCampaignId(c[0].id)
            }
        } catch (e) {
            console.error('Error loading scholarship data', e)
            showToast('Error loading scholarship data', 'error')
        } finally {
            if (showSpinner) setLoading(false)
        }
    }

    const currentCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0]

    // ----------------------------------------------------
    // CAMPAIGN HANDLERS
    // ----------------------------------------------------
    const handleOpenCampaignModal = (camp?: ScholarshipCampaign) => {
        if (camp) {
            setEditingCampaign(camp)
            setCampaignForm({
                title: camp.title,
                year: camp.year,
                session: camp.session,
                description: camp.description || '',
                status: camp.status
            })
        } else {
            setEditingCampaign(null)
            const yr = new Date().getFullYear()
            setCampaignForm({
                title: `ICST Merit Scholarship Examination ${yr}`,
                year: yr,
                session: `${yr}-${yr + 1} Session`,
                description: 'Official annual talent search and scholarship examination.',
                status: 'active'
            })
        }
        setIsCampaignModalOpen(true)
    }

    const handleSaveCampaign = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!campaignForm.title) {
            showToast('Scholarship title is required.', 'error')
            return
        }

        try {
            const saved = await scholarshipService.saveCampaign({
                id: editingCampaign?.id,
                ...campaignForm
            })
            setCampaigns(prev => {
                const idx = prev.findIndex(c => c.id === saved.id)
                return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev]
            })
            setSelectedCampaignId(saved.id)
            setIsCampaignModalOpen(false)
            showToast(editingCampaign ? 'Scholarship campaign updated!' : 'New scholarship campaign created!', 'success')
        } catch (err: any) {
            showToast(err.message || 'Failed to save scholarship campaign', 'error')
        }
    }

    const handleDeleteCampaign = (id: string, title: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Scholarship Campaign',
            description: `Are you sure you want to delete "${title}"? This will also un-link participating schools and winners for this campaign.`,
            confirmLabel: 'Delete Campaign',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await scholarshipService.deleteCampaign(id)
                    setCampaigns(prev => prev.filter(c => c.id !== id))
                    if (selectedCampaignId === id) {
                        const remaining = campaigns.filter(c => c.id !== id)
                        setSelectedCampaignId(remaining[0]?.id || '')
                    }
                    showToast('Scholarship campaign removed.', 'success')
                    setConfirmModal(null)
                } catch (e: any) {
                    showToast(e.message || 'Failed to delete campaign', 'error')
                } finally {
                    setIsConfirmLoading(false)
                }
            }
        })
    }

    // ----------------------------------------------------
    // SCHOOL DIRECTORY & PARTICIPATION HANDLERS
    // ----------------------------------------------------
    const handleOpenSchoolModal = (sch?: ScholarshipSchool) => {
        if (sch) {
            setEditingSchool(sch)
            setSchoolForm({
                name: sch.name,
                district: sch.district,
                address: sch.address || '',
                logo: sch.logo || ''
            })
        } else {
            setEditingSchool(null)
            setSchoolForm({
                name: '',
                district: 'Nadia',
                address: '',
                logo: ''
            })
        }
        setIsSchoolModalOpen(true)
    }

    const handleSaveSchool = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!schoolForm.name || !schoolForm.district) {
            showToast('School name and district are required.', 'error')
            return
        }

        try {
            const saved = await scholarshipService.saveSchool({
                id: editingSchool?.id,
                ...schoolForm
            })
            setSchools(prev => {
                const idx = prev.findIndex(s => s.id === saved.id)
                return idx >= 0 ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]
            })
            setIsSchoolModalOpen(false)
            showToast(editingSchool ? 'School record updated!' : 'New school registered to directory!', 'success')
        } catch (err: any) {
            showToast(err.message || 'Failed to save school', 'error')
        }
    }

    const handleDeleteSchool = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete School From Directory',
            description: `Delete "${name}"? This will remove this school from the reusable directory and unlink it from all scholarships.`,
            confirmLabel: 'Delete School',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await scholarshipService.deleteSchool(id)
                    setSchools(prev => prev.filter(s => s.id !== id))
                    setParticipations(prev => prev.filter(p => p.schoolId !== id))
                    showToast('School removed from directory.', 'success')
                    setConfirmModal(null)
                } catch (e: any) {
                    showToast(e.message || 'Failed to delete school', 'error')
                } finally {
                    setIsConfirmLoading(false)
                }
            }
        })
    }

    // Toggle School Participation for Current Campaign
    const handleToggleSchoolParticipation = async (school: ScholarshipSchool) => {
        if (!currentCampaign) {
            showToast('Please create or select a scholarship campaign first.', 'warning')
            return
        }

        const existing = participations.find(p => p.scholarshipId === currentCampaign.id && p.schoolId === school.id)

        try {
            if (existing) {
                // Remove participation
                await scholarshipService.deleteParticipation(existing.id)
                setParticipations(prev => prev.filter(p => p.id !== existing.id))
                showToast(`Unlinked ${school.name} from ${currentCampaign.title}.`, 'info')
            } else {
                // Add participation (default: announce soon / no date)
                const added = await scholarshipService.saveParticipation({
                    scholarshipId: currentCampaign.id,
                    schoolId: school.id,
                    announcementDate: null,
                    isAnnouncedOverride: false,
                    school
                })
                setParticipations(prev => [...prev, added])
                showToast(`Added ${school.name} to ${currentCampaign.title}!`, 'success')
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to update participation', 'error')
        }
    }

    // Open Schedule Publication Modal for a School
    const handleOpenScheduleModal = (school: ScholarshipSchool) => {
        if (!currentCampaign) return
        const part = participations.find(p => p.scholarshipId === currentCampaign.id && p.schoolId === school.id)
        setSchedulingParticipation({
            school,
            participation: part,
            announcementDate: part?.announcementDate ? new Date(part.announcementDate).toISOString().slice(0, 16) : '',
            isOverride: part?.isAnnouncedOverride ?? false
        })
        setIsScheduleModalOpen(true)
    }

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!schedulingParticipation || !currentCampaign) return

        try {
            const saved = await scholarshipService.saveParticipation({
                id: schedulingParticipation.participation?.id,
                scholarshipId: currentCampaign.id,
                schoolId: schedulingParticipation.school.id,
                announcementDate: schedulingParticipation.announcementDate ? new Date(schedulingParticipation.announcementDate).toISOString() : null,
                isAnnouncedOverride: schedulingParticipation.isOverride,
                school: schedulingParticipation.school
            })

            setParticipations(prev => {
                const idx = prev.findIndex(p => p.id === saved.id)
                return idx >= 0 ? prev.map(p => p.id === saved.id ? saved : p) : [...prev, saved]
            })

            setIsScheduleModalOpen(false)
            showToast(`Publication schedule saved for ${schedulingParticipation.school.name}!`, 'success')
        } catch (err: any) {
            showToast(err.message || 'Failed to save publication schedule', 'error')
        }
    }

    // ----------------------------------------------------
    // WINNER HANDLERS
    // ----------------------------------------------------
    const handleOpenWinnerModal = (winner?: ScholarshipWinner, prefilledSchool?: ScholarshipSchool) => {
        const camp = currentCampaign
        if (winner) {
            setEditingWinner(winner)
            setWinnerForm({
                scholarshipId: winner.scholarshipId || camp?.id || '',
                schoolId: winner.schoolId || '',
                year: winner.year,
                rank: winner.rank,
                studentName: winner.studentName,
                schoolName: winner.schoolName,
                district: winner.district,
                marks: winner.marks,
                photo: winner.photo,
                description: winner.description || '',
                displayOrder: winner.displayOrder,
                published: winner.published
            })
        } else {
            setEditingWinner(null)
            const targetSchool = prefilledSchool || schools[0]
            const nextRank = winners.filter(w => (camp ? w.year === camp.year : true)).length + 1
            setWinnerForm({
                scholarshipId: camp?.id || '',
                schoolId: targetSchool?.id || '',
                year: camp ? camp.year : new Date().getFullYear(),
                rank: nextRank,
                studentName: '',
                schoolName: targetSchool ? targetSchool.name : '',
                district: targetSchool ? targetSchool.district : 'Nadia',
                marks: '',
                photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                description: '',
                displayOrder: nextRank,
                published: true
            })
        }
        setIsWinnerModalOpen(true)
    }

    const handleSaveWinner = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!winnerForm.studentName || !winnerForm.schoolName) {
            showToast('Student Name and School Name are required.', 'error')
            return
        }

        try {
            const saved = await scholarshipService.saveWinner({
                id: editingWinner?.id,
                ...winnerForm
            })

            if (editingWinner) {
                setWinners(prev => prev.map(w => w.id === saved.id ? saved : w))
                showToast('Winner record updated successfully!', 'success')
            } else {
                setWinners(prev => [saved, ...prev])
                showToast('New position holder added!', 'success')
            }

            setIsWinnerModalOpen(false)
        } catch (err: any) {
            console.error('Save winner error:', err)
            showToast(err.message || 'Failed to save winner record.', 'error')
        }
    }

    const handleDeleteWinner = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Position Holder',
            description: `Are you sure you want to delete ${name}? This will remove them from the website immediately.`,
            confirmLabel: 'Delete Winner',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await scholarshipService.deleteWinner(id)
                    setWinners(prev => prev.filter(w => w.id !== id))
                    showToast('Winner record deleted.', 'success')
                    setConfirmModal(null)
                } catch (e: any) {
                    showToast(e.message || 'Failed to delete winner.', 'error')
                } finally {
                    setIsConfirmLoading(false)
                }
            }
        })
    }

    // ----------------------------------------------------
    // EXAM PHOTOS HANDLERS
    // ----------------------------------------------------
    const handleOpenExamModal = (item?: ScholarshipExamImage) => {
        if (item) {
            setEditingExamImage(item)
            setExamForm({
                title: item.title,
                schoolName: item.schoolName,
                session: item.session,
                year: item.year,
                image: item.image,
                description: item.description || '',
                published: item.published
            })
        } else {
            setEditingExamImage(null)
            setExamForm({
                title: '',
                schoolName: schools[0]?.name || '',
                session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1} Session`,
                year: new Date().getFullYear(),
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                description: '',
                published: true
            })
        }
        setIsExamModalOpen(true)
    }

    const handleSaveExamPhoto = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!examForm.title || !examForm.image) {
            showToast('Title and Photo Image are required.', 'error')
            return
        }

        try {
            const saved = await scholarshipService.saveExamImage({
                id: editingExamImage?.id,
                ...examForm
            })

            if (editingExamImage) {
                setExamImages(prev => prev.map(img => img.id === saved.id ? saved : img))
                showToast('Exam photo updated successfully!', 'success')
            } else {
                setExamImages(prev => [saved, ...prev])
                showToast('New examination moment added!', 'success')
            }

            setIsExamModalOpen(false)
        } catch (err: any) {
            showToast(err.message || 'Failed to save exam photo', 'error')
        }
    }

    const handleDeleteExamImage = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Exam Photo',
            description: 'Are you sure you want to delete this examination photo from the gallery?',
            confirmLabel: 'Delete Photo',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await scholarshipService.deleteExamImage(id)
                    setExamImages(prev => prev.filter(img => img.id !== id))
                    showToast('Exam photo removed from gallery.', 'success')
                    setConfirmModal(null)
                } catch (e: any) {
                    showToast(e.message || 'Failed to delete photo', 'error')
                } finally {
                    setIsConfirmLoading(false)
                }
            }
        })
    }

    // ----------------------------------------------------
    // SETTINGS & SYNC HANDLERS
    // ----------------------------------------------------
    const handleSaveSettings = async () => {
        setSaving(true)
        try {
            const updated = await scholarshipService.updateSettings(settings)
            setSettings(updated)
            showToast('Scholarship settings saved successfully!', 'success')
        } catch (e: any) {
            showToast(e.message || 'Failed to save scholarship settings.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSyncToSupabase = async () => {
        setIsSyncing(true)
        try {
            const res = await scholarshipService.syncPendingOperations()
            setSyncModalResult(res)
            if (res.errors.length === 0) {
                if (res.syncedCount > 0) {
                    showToast(`Successfully synced ${res.syncedCount} pending operation(s) to Supabase!`, 'success')
                } else {
                    showToast('All scholarship operations are fully synchronized with Supabase.', 'success')
                }
            } else {
                showToast(`Sync completed with ${res.errors.length} issue(s). Check the acknowledgment report.`, 'warning')
            }
            await loadData(false)
        } catch (err: any) {
            console.error('Sync Supabase error:', err)
            showToast(err.message || 'Failed to sync data to Supabase.', 'error')
        } finally {
            setIsSyncing(false)
        }
    }



    // Filtered lists
    const participatingSchoolIds = participations
        .filter(p => currentCampaign ? p.scholarshipId === currentCampaign.id : true)
        .map(p => p.schoolId)

    const participatingSchools = schools.filter(s => participatingSchoolIds.includes(s.id))

    const filteredWinners = winners.filter(w => {
        const matchCamp = currentCampaign ? (w.scholarshipId ? w.scholarshipId === currentCampaign.id : w.year === currentCampaign.year) : true
        const matchSchool = selectedSchoolForWinner === 'all' ? true : (w.schoolId === selectedSchoolForWinner || w.schoolName === selectedSchoolForWinner)
        return matchCamp && matchSchool
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Scholarship Control Center...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 font-inter">

            {/* TOP HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">ICST Scholarships & Publisher</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${settings.masterEnabled ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'}`}>
                                <span className={`w-2 h-2 rounded-full ${settings.masterEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {settings.masterEnabled ? 'System Active' : 'System Disabled'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Step-by-step scholarship creation, school registration, scheduled publication dates, and position holders.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleSyncToSupabase}
                        disabled={isSyncing}
                        className={`px-4 py-2.5 font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 ${
                            pendingCount > 0
                                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 shadow-amber-500/20 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white border border-slate-700 dark:border-slate-700'
                        }`}
                        title={pendingCount > 0 ? `${pendingCount} pending local changes waiting to sync to Supabase` : 'Sync all pending local operations to Supabase'}
                    >
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync to Supabase'}</span>
                        {pendingCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-slate-950 text-amber-300 rounded-full">
                                {pendingCount} Pending
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('flow')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'flow' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    <Sparkles size={18} />
                    <span>Publishing Flow & Schools</span>
                </button>
                <button
                    onClick={() => setActiveTab('winners')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'winners' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    <Trophy size={18} />
                    <span>All Position Holders ({winners.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    <Layers size={18} />
                    <span>Control Panel & Banner</span>
                </button>
                <button
                    onClick={() => setActiveTab('examPhotos')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'examPhotos' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    <ImageIcon size={18} />
                    <span>Exam Photos & Moments ({examImages.length})</span>
                </button>
            </div>

            {/* TAB 1: PUBLISHING FLOW & SCHOOLS DIRECTORY */}
            {activeTab === 'flow' && (
                <div className="space-y-8">

                    {/* STEP 1: SCHOLARSHIP CAMPAIGN SELECTOR / CREATOR */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select or Create Scholarship Campaign</h2>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Choose the scholarship examination or year to attach participating schools and schedule winner releases.
                                </p>
                            </div>

                            <button
                                onClick={() => handleOpenCampaignModal()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start md:self-auto"
                            >
                                <Plus size={16} />
                                <span>Create New Scholarship</span>
                            </button>
                        </div>

                        {campaigns.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                                <GraduationCap size={36} className="mx-auto text-slate-400" />
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Scholarship Campaigns Found</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Click the button above to create your first scholarship examination (e.g. "ICST Merit Exam 2026").
                                </p>
                                <button
                                    onClick={() => handleOpenCampaignModal()}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                                >
                                    + Create First Scholarship
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {campaigns.map(camp => {
                                    const isSelected = selectedCampaignId === camp.id
                                    const countParticipating = participations.filter(p => p.scholarshipId === camp.id).length
                                    return (
                                        <div
                                            key={camp.id}
                                            onClick={() => setSelectedCampaignId(camp.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md shadow-indigo-600/10'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        {camp.session}
                                                    </span>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{camp.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Year {camp.year} • {countParticipating} Schools Linked</p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleOpenCampaignModal(camp)
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                                        title="Edit Scholarship"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteCampaign(camp.id, camp.title)
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                                        title="Delete Scholarship"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                                    <span>Active Campaign for Management</span>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* STEP 2: PARTICIPATING SCHOOLS & ANNOUNCEMENT SCHEDULER */}
                    {currentCampaign && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Schools & Scheduled Winner Publication
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Click custom cards below to toggle participation for <strong>{currentCampaign.title}</strong>. Set winner publication date & time for each school.
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleOpenSchoolModal()}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 self-start md:self-auto"
                                >
                                    <Plus size={16} />
                                    <span>Register New School</span>
                                </button>
                            </div>

                            {schools.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                                    <SchoolIcon size={36} className="mx-auto text-slate-400" />
                                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">School Directory is Empty</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        Register schools once to build your permanent directory. You can then select them across all scholarship years.
                                    </p>
                                    <button
                                        onClick={() => handleOpenSchoolModal()}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                                    >
                                        + Register First School
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {schools.map(school => {
                                        const isParticipating = participatingSchoolIds.includes(school.id)
                                        const part = participations.find(p => p.scholarshipId === currentCampaign.id && p.schoolId === school.id)
                                        const status = scholarshipService.evaluatePublicationStatus(currentCampaign.title, school.name, part)
                                        const schoolWinnersCount = winners.filter(w => w.schoolId === school.id || w.schoolName === school.name).length

                                        return (
                                            <div
                                                key={school.id}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 relative ${
                                                    isParticipating
                                                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 opacity-80 hover:opacity-100'
                                                }`}
                                            >
                                                {/* Header row with custom toggle button (NOT HTML checkbox) */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div
                                                        onClick={() => handleToggleSchoolParticipation(school)}
                                                        className="flex items-center gap-2.5 cursor-pointer select-none group"
                                                    >
                                                        {/* CUSTOM STYLED CARD CHECKBOX */}
                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                                            isParticipating
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                                                                : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                                                        }`}>
                                                            {isParticipating && <Check size={16} strokeWidth={3} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {school.name}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{school.district}</p>
                                                        </div>
                                                    </div>

                                                    {/* Edit & Delete School in Directory */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleOpenSchoolModal(school)}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Edit School Details"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSchool(school.id, school.name)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Delete School from Directory"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Participation Status & Scheduling Area */}
                                                {isParticipating ? (
                                                    <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                                                                {schoolWinnersCount} Winner(s) Ready
                                                            </span>

                                                            {/* Status Badge */}
                                                            {status.badgeType === 'announced' ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                                                    ● LIVE / ANNOUNCED
                                                                </span>
                                                            ) : status.badgeType === 'scheduled' ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                                                                    🕒 SCHEDULED
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                                    ⏳ WILL BE ANNOUNCED SOON
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Public Visitor Preview Text */}
                                                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-300">
                                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Visitor Notice:</span>
                                                            <p className="italic line-clamp-2">"{status.displayText}"</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 pt-1">
                                                            <button
                                                                onClick={() => handleOpenScheduleModal(school)}
                                                                className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                                                            >
                                                                <CalendarTime size={14} />
                                                                <span>{part?.announcementDate ? 'Change Date & Time' : 'Set Release Date'}</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleOpenWinnerModal(undefined, school)}
                                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                                                                title="Add position holder for this school"
                                                            >
                                                                <Plus size={14} />
                                                                <span>Winner</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                                                        Not participating in this campaign. Click checkbox above to include.
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: POSITION HOLDERS FOR PARTICIPATING SCHOOLS */}
                    {currentCampaign && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Winners for {currentCampaign.title}
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Position holders will automatically become visible to visitors once their school's publication date & time is reached.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <TailwindDropdown
                                        labelPrefix="School:"
                                        options={[
                                            { label: 'All Participating Schools', value: 'all' },
                                            ...participatingSchools.map(s => ({ label: s.name, value: s.id }))
                                        ]}
                                        value={selectedSchoolForWinner}
                                        onChange={(val) => setSelectedSchoolForWinner(String(val))}
                                    />

                                    <button
                                        onClick={() => handleOpenWinnerModal()}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                                    >
                                        <Plus size={16} />
                                        <span>Add Position Holder</span>
                                    </button>
                                </div>
                            </div>

                            {/* Winners Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Rank</th>
                                            <th className="px-6 py-4">School & District</th>
                                            <th className="px-6 py-4">Marks</th>
                                            <th className="px-6 py-4">Publication Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredWinners.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-xs">
                                                    No winners added yet for this filter. Click "+ Add Position Holder" to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredWinners.map(winner => {
                                                const part = participations.find(p => p.scholarshipId === currentCampaign.id && (p.schoolId === winner.schoolId || p.school?.name === winner.schoolName))
                                                const pubStatus = scholarshipService.evaluatePublicationStatus(currentCampaign.title, winner.schoolName, part)

                                                return (
                                                    <tr key={winner.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                            <img
                                                                src={winner.photo}
                                                                alt={winner.studentName}
                                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                            />
                                                            <div>
                                                                <span className="font-bold text-sm block">{winner.studentName}</span>
                                                                <span className="text-[11px] text-slate-500">Order #{winner.displayOrder}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
                                                                Rank #{winner.rank}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                                            {winner.schoolName} ({winner.district})
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                            {winner.marks}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {pubStatus.badgeType === 'announced' ? (
                                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                                    <CheckCircle2 size={14} /> LIVE on website
                                                                </span>
                                                            ) : pubStatus.badgeType === 'scheduled' ? (
                                                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1" title={pubStatus.displayText}>
                                                                    <Clock size={14} /> Releases {pubStatus.dateText}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-semibold text-slate-400">
                                                                    ⏳ Pending schedule
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleOpenWinnerModal(winner)}
                                                                    className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                                                                >
                                                                    <Edit3 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteWinner(winner.id, winner.studentName)}
                                                                    className="p-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: ALL POSITION HOLDERS LIST */}
            {activeTab === 'winners' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Master Position Holders Directory</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">View and manage all registered student awardees across all campaigns.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenWinnerModal()}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
                        >
                            <Plus size={18} />
                            <span>Add Position Holder</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">School & District</th>
                                    <th className="px-6 py-4">Marks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {winners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                            No winners found. Use the Publishing Flow tab or button above to add position holders.
                                        </td>
                                    </tr>
                                ) : (
                                    winners.map(w => (
                                        <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                <img src={w.photo} alt={w.studentName} className="w-10 h-10 rounded-full object-cover border" />
                                                <span className="font-bold">{w.studentName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{w.year}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                                                    Rank #{w.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{w.schoolName} ({w.district})</td>
                                            <td className="px-6 py-4 font-bold text-emerald-600">{w.marks}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenWinnerModal(w)} className="p-1.5 hover:text-indigo-600">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteWinner(w.id, w.studentName)} className="p-1.5 hover:text-rose-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: CONTROL PANEL & BANNERS */}
            {activeTab === 'settings' && (
                <div className="space-y-8">
                    {/* MASTER SWITCH CARD */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${settings.masterEnabled ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3.5 rounded-2xl ${settings.masterEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    <Power size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold">Scholarship System Master Switch</h2>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${settings.masterEnabled ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            Global Control
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 max-w-2xl ${settings.masterEnabled ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        Master switch controls all public scholarship features. Turning this OFF hides all banners, results, navigation items, and winner showcases site-wide immediately.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-800/40 dark:bg-slate-950/60 p-3 rounded-2xl border border-white/10 dark:border-slate-800 shrink-0">
                                <span className="text-sm font-semibold tracking-wide">
                                    {settings.masterEnabled ? 'Scholarship System [ ON ]' : 'Scholarship System [ OFF ]'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, masterEnabled: !prev.masterEnabled }))}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.masterEnabled ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.masterEnabled ? 'translate-x-9' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* HOMEPAGE BANNER CONTROLS */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Homepage Hero Banner & Redirect</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <ImageCropUploadField
                                    value={settings.bannerImage}
                                    onChange={(url) => setSettings(prev => ({ ...prev, bannerImage: url }))}
                                    label="Banner Graphic Image"
                                    uploadButtonText="Upload Banner"
                                    aspectRatio={1920 / 700}
                                    instruction="Hero Panoramic Banner (16:6). Frame wide banner header."
                                    maxW={1920}
                                    maxH={700}
                                    placeholder="https://images.unsplash.com/... or click upload"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Click Destination</label>
                                <input
                                    type="text"
                                    value={settings.bannerRedirectUrl}
                                    onChange={(e) => setSettings(prev => ({ ...prev, bannerRedirectUrl: e.target.value }))}
                                    placeholder="https://icst-isms.netlify.app/"
                                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                                <div className="pt-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Result Button Target URL</label>
                                    <input
                                        type="text"
                                        value={settings.resultUrl}
                                        onChange={(e) => setSettings(prev => ({ ...prev, resultUrl: e.target.value }))}
                                        placeholder="https://icst-isms.netlify.app/"
                                        className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: EXAM PHOTOS GALLERY */}
            {activeTab === 'examPhotos' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scholarship Examination Gallery</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Upload and manage examination hall photos, sessions, and school event moments.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenExamModal()}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 transition-all"
                        >
                            <Plus size={18} />
                            <span>Add Exam Photo</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {examImages.map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 space-y-2">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.schoolName} • Year {item.year}</p>
                                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                        <button onClick={() => handleOpenExamModal(item)} className="p-1.5 hover:text-indigo-600">
                                            <Edit3 size={15} />
                                        </button>
                                        <button onClick={() => handleDeleteExamImage(item.id)} className="p-1.5 hover:text-rose-600">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL: CREATE / EDIT SCHOLARSHIP CAMPAIGN */}
            {isCampaignModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={20} />
                                {editingCampaign ? 'Edit Scholarship Campaign' : 'Create Scholarship Campaign'}
                            </h3>
                            <button onClick={() => setIsCampaignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCampaign} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scholarship Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={campaignForm.title}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. ICST Merit Scholarship Examination 2026"
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year *</label>
                                    <input
                                        type="number"
                                        required
                                        value={campaignForm.year}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Session *</label>
                                    <input
                                        type="text"
                                        required
                                        value={campaignForm.session}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, session: e.target.value }))}
                                        placeholder="2026-2027 Session"
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={campaignForm.description}
                                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Annual talent hunt examination across participating secondary schools..."
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow">Save Campaign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: REGISTER / MODIFY SCHOOL DIRECTORY ENTRY */}
            {isSchoolModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <SchoolIcon className="text-emerald-600 dark:text-emerald-400" size={20} />
                                {editingSchool ? 'Edit School Details' : 'Register School to Directory'}
                            </h3>
                            <button onClick={() => setIsSchoolModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSchool} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">School Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={schoolForm.name}
                                    onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Chowberia High School"
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District *</label>
                                    <input
                                        type="text"
                                        required
                                        value={schoolForm.district}
                                        onChange={(e) => setSchoolForm(prev => ({ ...prev, district: e.target.value }))}
                                        placeholder="e.g. Nadia"
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address / Landmark</label>
                                    <input
                                        type="text"
                                        value={schoolForm.address}
                                        onChange={(e) => setSchoolForm(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="e.g. Chowberia, Ranaghat"
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsSchoolModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow">Save School</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: SET WINNER PUBLICATION DATE & TIME FOR A SCHOOL */}
            {isScheduleModalOpen && schedulingParticipation && currentCampaign && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CalendarTime className="text-indigo-600 dark:text-indigo-400" size={20} />
                                    Winner Publication Schedule
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{schedulingParticipation.school.name} • {currentCampaign.title}</p>
                            </div>
                            <button onClick={() => setIsScheduleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSchedule} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Release Date & Exact Time (Local Time)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={schedulingParticipation.announcementDate}
                                    onChange={(e) => setSchedulingParticipation(prev => prev ? ({ ...prev, announcementDate: e.target.value }) : null)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    Winners from this school will automatically go live when this exact time arrives.
                                </span>
                            </div>

                            {/* Quick Presets */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold text-slate-500">Quick Presets:</span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const d = new Date()
                                            d.setDate(d.getDate() + 2)
                                            d.setHours(10, 0, 0, 0)
                                            setSchedulingParticipation(prev => prev ? ({ ...prev, announcementDate: d.toISOString().slice(0, 16) }) : null)
                                        }}
                                        className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        +2 Days (10:00 AM)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const d = new Date()
                                            d.setDate(d.getDate() + 7)
                                            d.setHours(12, 0, 0, 0)
                                            setSchedulingParticipation(prev => prev ? ({ ...prev, announcementDate: d.toISOString().slice(0, 16) }) : null)
                                        }}
                                        className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                    >
                                        +1 Week (12:00 PM)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSchedulingParticipation(prev => prev ? ({ ...prev, announcementDate: '' }) : null)}
                                        className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg transition-colors"
                                    >
                                        Clear (Announce Soon)
                                    </button>
                                </div>
                            </div>

                            {/* Manual Force Live Checkbox */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Manual Override: Publish Immediately</span>
                                    <span className="text-[11px] text-slate-500">Bypasses schedule and reveals winners right now</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={schedulingParticipation.isOverride}
                                    onChange={(e) => setSchedulingParticipation(prev => prev ? ({ ...prev, isOverride: e.target.checked }) : null)}
                                    className="w-4 h-4 rounded text-indigo-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow">Save Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ADD / EDIT POSITION HOLDER */}
            {isWinnerModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Trophy className="text-amber-500" size={20} />
                                {editingWinner ? 'Edit Position Holder' : 'Add Position Holder & Winner'}
                            </h3>
                            <button onClick={() => setIsWinnerModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveWinner} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Participating School *</label>
                                    <select
                                        value={winnerForm.schoolId}
                                        onChange={(e) => {
                                            const sch = schools.find(s => s.id === e.target.value)
                                            setWinnerForm(prev => ({
                                                ...prev,
                                                schoolId: e.target.value,
                                                schoolName: sch ? sch.name : prev.schoolName,
                                                district: sch ? sch.district : prev.district
                                            }))
                                        }}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    >
                                        <option value="">Select School</option>
                                        {schools.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rank / Position *</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={winnerForm.rank}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, rank: Number(e.target.value), displayOrder: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={winnerForm.studentName}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, studentName: e.target.value }))}
                                        placeholder="e.g. Subhadip Roy"
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Score / Percentage *</label>
                                    <input
                                        type="text"
                                        required
                                        value={winnerForm.marks}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, marks: e.target.value }))}
                                        placeholder="e.g. 98.8%"
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <ImageCropUploadField
                                value={winnerForm.photo}
                                onChange={(url) => setWinnerForm(prev => ({ ...prev, photo: url }))}
                                label="Photo Image URL *"
                                uploadButtonText="Upload Photo"
                                aspectRatio={1}
                                instruction="Student Portrait / DP (1:1). Position face centered."
                                maxW={600}
                                maxH={600}
                                required
                                placeholder="https://images.unsplash.com/... or click to upload"
                            />

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Award Citation / Achievement Note</label>
                                <textarea
                                    rows={2}
                                    value={winnerForm.description}
                                    onChange={(e) => setWinnerForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Secured 1st rank with exemplary performance in Mathematics..."
                                    className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsWinnerModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow">Save Winner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EXAM PHOTO */}
            {isExamModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ImageIcon className="text-indigo-600" size={20} />
                                {editingExamImage ? 'Edit Exam Photo' : 'Add Examination Photo'}
                            </h3>
                            <button onClick={() => setIsExamModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExamPhoto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event / Hall Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={examForm.title}
                                    onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="ICST Talent Search Examination Hall"
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl"
                                />
                            </div>

                            <ImageCropUploadField
                                value={examForm.image}
                                onChange={(url) => setExamForm(prev => ({ ...prev, image: url }))}
                                label="Photo Image URL *"
                                uploadButtonText="Upload Photo"
                                aspectRatio={16 / 9}
                                instruction="Event & Examination (16:9). Frame the stage / students."
                                maxW={1200}
                                maxH={675}
                                required
                                placeholder="https://images.unsplash.com/... or click to upload"
                            />

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow">Save Photo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SYNC TO SUPABASE ACKNOWLEDGMENT MODAL */}
            {syncModalResult && (
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[1200] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className={`p-6 border-b ${syncModalResult.errors.length === 0 ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40' : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl ${syncModalResult.errors.length === 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'}`}>
                                        {syncModalResult.errors.length === 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {syncModalResult.errors.length === 0 ? 'Supabase Sync Acknowledgment' : 'Sync Acknowledgment with Issues'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {syncModalResult.errors.length === 0
                                                ? 'All pending operations processed and synced with Supabase.'
                                                : 'Some local operations encountered issues while syncing with Supabase.'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSyncModalResult(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5 mt-5">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                                    <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{syncModalResult.syncedCount}</span>
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Synced</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                                    <span className={`block text-2xl font-black ${syncModalResult.remainingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>{syncModalResult.remainingCount}</span>
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remaining</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                                    <span className={`block text-2xl font-black ${syncModalResult.errors.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{syncModalResult.errors.length}</span>
                                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Errors</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                            {syncModalResult.details.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span>Acknowledged Operations ({syncModalResult.details.length})</span>
                                    </h4>
                                    <ul className="space-y-2">
                                        {syncModalResult.details.map((detail, idx) => (
                                            <li key={idx} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-slate-800 dark:text-slate-100 font-medium text-xs shadow-sm">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <span className="leading-snug">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {syncModalResult.errors.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-rose-600 uppercase mb-2">Sync Errors</h4>
                                    <ul className="space-y-1.5 text-xs text-rose-700 dark:text-rose-300">
                                        {syncModalResult.errors.map((err, idx) => (
                                            <li key={idx} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                                                <AlertCircle size={14} className="text-rose-500 shrink-0" />
                                                <span>{err}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {syncModalResult.errors.some(e => e.includes('Could not find the table')) && (
                            <div className="mx-6 mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                                    <span>Action Required: Run SQL Migration in Supabase</span>
                                </div>
                                <p className="leading-relaxed">
                                    These new tables (<code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded">scholarship_campaigns</code>, <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded">scholarship_schools</code>, <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded">scholarship_school_participations</code>) do not exist in your Supabase project yet.
                                </p>
                                <p className="leading-relaxed font-semibold">
                                    👉 Open your Supabase Dashboard &gt; <strong>SQL Editor</strong>, paste and run <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded">scholarship_migration.sql</code>, then click <strong>"Retry Sync Now"</strong> below!
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                            {syncModalResult.remainingCount > 0 && (
                                <button
                                    onClick={() => {
                                        setSyncModalResult(null)
                                        handleSyncToSupabase()
                                    }}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCw size={14} />
                                    <span>Retry Sync Now</span>
                                </button>
                            )}
                            <button
                                onClick={() => setSyncModalResult(null)}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition-colors"
                            >
                                Acknowledge & Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal && (
                <ConfirmDialog
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    isLoading={isConfirmLoading}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
