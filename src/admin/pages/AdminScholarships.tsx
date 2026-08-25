import React, { useState, useEffect, useRef } from 'react'
import { IconSchool as GraduationCap, IconPower as Power, IconUpload as Upload, IconExternalLink as ExternalLink, IconTrophy as Trophy, IconEye as Eye, IconDeviceFloppy as Save, IconPlus as Plus, IconTrash as Trash2, IconEdit as Edit3, IconCircleCheck as CheckCircle2, IconAlertCircle as AlertCircle, IconInfoCircle as Info, IconPhoto as ImageIcon, IconLink as LinkIcon, IconLayersLinked as Layers, IconArrowUpRight as ArrowUpRight, IconX as X } from '@tabler/icons-react'
import { scholarshipService } from '../../services/scholarshipService'
import type { ScholarshipSettings, ScholarshipWinner, ScholarshipExamImage } from '../../types/scholarship'
import { useToast } from '../../contexts/ToastContext'
import TailwindDropdown from '../../components/ui/TailwindDropdown'

export default function AdminScholarships() {
    const { showToast } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'settings' | 'winners' | 'examPhotos'>('settings')

    // Settings state
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

    // Banner file upload state
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    // Winners state
    const [winners, setWinners] = useState<ScholarshipWinner[]>([])
    const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>('all')

    // Winner Modal / Form state
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
    const [editingWinner, setEditingWinner] = useState<ScholarshipWinner | null>(null)
    const [uploadingWinnerPhoto, setUploadingWinnerPhoto] = useState(false)
    const winnerPhotoInputRef = useRef<HTMLInputElement>(null)

    const [winnerForm, setWinnerForm] = useState({
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
    const [examImages, setExamImages] = useState<ScholarshipExamImage[]>([])
    const [isExamModalOpen, setIsExamModalOpen] = useState(false)
    const [editingExamImage, setEditingExamImage] = useState<ScholarshipExamImage | null>(null)
    const [uploadingExamPhoto, setUploadingExamPhoto] = useState(false)
    const examPhotoInputRef = useRef<HTMLInputElement>(null)

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
            setWinners(w)
            setExamImages(e)
        } catch (e) {
            console.error('Error loading scholarship data', e)
            showToast('Error loading scholarship data', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true)
        try {
            const updated = await scholarshipService.updateSettings(settings)
            setSettings(updated)
            showToast('Scholarship settings saved successfully!', 'success')
        } catch (e) {
            console.error('Failed to save settings', e)
            showToast('Failed to save scholarship settings.', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Handle Banner File Upload
    const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size exceeds 5 MB limit. Please select a smaller image.', 'error')
            return
        }

        setUploadingBanner(true)
        try {
            const imageUrl = await scholarshipService.processAndUploadImage(file, 1920, 700)
            setSettings(prev => ({ ...prev, bannerImage: imageUrl }))
            showToast('Banner image uploaded and optimized successfully!', 'success')
        } catch (err) {
            console.error('Upload error', err)
            showToast('Failed to upload banner image', 'error')
        } finally {
            setUploadingBanner(false)
        }
    }

    // Handle Winner Photo Upload
    const handleWinnerPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            showToast('Photo size exceeds 2 MB limit.', 'error')
            return
        }

        setUploadingWinnerPhoto(true)
        try {
            const photoUrl = await scholarshipService.processAndUploadImage(file, 600, 600)
            setWinnerForm(prev => ({ ...prev, photo: photoUrl }))
            showToast('Student photo uploaded successfully!', 'success')
        } catch (err) {
            console.error('Photo upload error', err)
            showToast('Failed to upload photo', 'error')
        } finally {
            setUploadingWinnerPhoto(false)
        }
    }

    // Open Modal for Add/Edit Winner
    const handleOpenWinnerModal = (winner?: ScholarshipWinner) => {
        if (winner) {
            setEditingWinner(winner)
            setWinnerForm({
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
            const nextRank = winners.filter(w => w.year === (selectedYearFilter === 'all' ? 2026 : selectedYearFilter)).length + 1
            setWinnerForm({
                year: selectedYearFilter === 'all' ? 2026 : selectedYearFilter,
                rank: nextRank,
                studentName: '',
                schoolName: '',
                district: '',
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
        } catch (err) {
            console.error('Save winner error', err)
            showToast('Failed to save winner record.', 'error')
        }
    }

    const handleDeleteWinner = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this winner record?')) return
        try {
            await scholarshipService.deleteWinner(id)
            setWinners(prev => prev.filter(w => w.id !== id))
            showToast('Winner record deleted.', 'info')
        } catch (err) {
            showToast('Failed to delete record.', 'error')
        }
    }

    const handleToggleWinnerPublished = async (winner: ScholarshipWinner) => {
        try {
            const updated = await scholarshipService.saveWinner({
                ...winner,
                published: !winner.published
            })
            setWinners(prev => prev.map(w => w.id === updated.id ? updated : w))
            showToast(`Winner status set to ${updated.published ? 'Published' : 'Hidden'}`, 'info')
        } catch (err) {
            showToast('Failed to update status.', 'error')
        }
    }

    // ----------------------------------------------------
    // EXAM GALLERY HANDLERS
    // ----------------------------------------------------
    const handleExamPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            showToast('Photo size exceeds 5 MB limit.', 'error')
            return
        }

        setUploadingExamPhoto(true)
        try {
            const imageUrl = await scholarshipService.processAndUploadImage(file, 1200, 800)
            setExamForm(prev => ({ ...prev, image: imageUrl }))
            showToast('Exam photo uploaded successfully!', 'success')
        } catch (err) {
            console.error('Exam photo upload error', err)
            showToast('Failed to upload exam photo', 'error')
        } finally {
            setUploadingExamPhoto(false)
        }
    }

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
                schoolName: '',
                session: '2026-2027 Session',
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
        if (!examForm.title || !examForm.schoolName || !examForm.image) {
            showToast('Title, School Name, and Image are required.', 'error')
            return
        }

        try {
            const saved = await scholarshipService.saveExamImage({
                id: editingExamImage?.id,
                ...examForm
            })

            if (editingExamImage) {
                setExamImages(prev => prev.map(e => e.id === saved.id ? saved : e))
                showToast('Exam photo record updated successfully!', 'success')
            } else {
                setExamImages(prev => [saved, ...prev])
                showToast('New exam photo added to gallery!', 'success')
            }

            setIsExamModalOpen(false)
        } catch (err) {
            console.error('Save exam photo error', err)
            showToast('Failed to save exam photo.', 'error')
        }
    }

    const handleDeleteExamImage = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this exam photo?')) return
        try {
            await scholarshipService.deleteExamImage(id)
            setExamImages(prev => prev.filter(e => e.id !== id))
            showToast('Exam photo deleted.', 'info')
        } catch (err) {
            showToast('Failed to delete exam photo.', 'error')
        }
    }

    const handleToggleExamPublished = async (item: ScholarshipExamImage) => {
        try {
            const updated = await scholarshipService.saveExamImage({
                ...item,
                published: !item.published
            })
            setExamImages(prev => prev.map(e => e.id === updated.id ? updated : e))
            showToast(`Exam photo status set to ${updated.published ? 'Published' : 'Hidden'}`, 'info')
        } catch (err) {
            showToast('Failed to update status.', 'error')
        }
    }

    const availableYears = Array.from(new Set(winners.map(w => w.year))).sort((a, b) => b - a)
    if (!availableYears.includes(2026)) availableYears.unshift(2026)

    const filteredWinners = selectedYearFilter === 'all'
        ? winners
        : winners.filter(w => w.year === selectedYearFilter)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-16 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                        <GraduationCap size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ICST Scholarships</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${settings.masterEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                <span className={`w-2 h-2 rounded-full ${settings.masterEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {settings.masterEnabled ? 'System Active' : 'System Disabled'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Manage all scholarship banners, marketing content, results, links and homepage visibility.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <Layers size={18} />
                    <span>Control Panel & Banner</span>
                </button>
                <button
                    onClick={() => setActiveTab('winners')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'winners' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <Trophy size={18} />
                    <span>Winner Management ({winners.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('examPhotos')}
                    className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'examPhotos' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                    <ImageIcon size={18} />
                    <span>Exam Photos & Moments ({examImages.length})</span>
                </button>
            </div>

            {activeTab === 'settings' && (
                <div className="space-y-8">

                    {/* MASTER SWITCH CARD */}
                    <div className={`p-6 rounded-2xl border transition-all duration-300 ${settings.masterEnabled ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl' : 'bg-slate-100 border-slate-300 text-slate-700'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3.5 rounded-2xl ${settings.masterEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-300 text-slate-600'}`}>
                                    <Power size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold">Scholarship System Master Switch</h2>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${settings.masterEnabled ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' : 'bg-slate-300 text-slate-600'}`}>
                                            Global Control
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 max-w-2xl ${settings.masterEnabled ? 'text-slate-300' : 'text-slate-500'}`}>
                                        Master switch controls all public scholarship features. Turning this OFF hides all banners, results, navigation items, and winner pages site-wide immediately.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-800/40 p-3 rounded-2xl border border-white/10 shrink-0">
                                <span className="text-sm font-semibold tracking-wide">
                                    {settings.masterEnabled ? 'Scholarship System [ ON ]' : 'Scholarship System [ OFF ]'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, masterEnabled: !prev.masterEnabled }))}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.masterEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.masterEnabled ? 'translate-x-9' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {!settings.masterEnabled && (
                            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-sm flex items-center gap-3">
                                <AlertCircle size={20} className="shrink-0 text-amber-600" />
                                <span>
                                    <strong>Master Switch is OFF:</strong> All public scholarship features, banner sliders, result buttons, navigation links, and winner showcases are completely hidden from website visitors.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* DETAILED CONTROLS TOGGLES GRID */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Module Visibility Controls</h3>
                                <p className="text-xs text-slate-500">Enable or disable specific components independently when Master Switch is ON.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Control Switches */}
                            {[
                                { key: 'bannerEnabled', label: 'Homepage Banner', desc: 'Display banner image on home page' },
                                { key: 'bannerRedirectEnabled', label: 'Banner Click Redirect', desc: 'Make entire banner clickable' },
                                { key: 'resultEnabled', label: 'Homepage Result Button', desc: 'Display View Result CTA button' },
                                { key: 'navigationEnabled', label: 'Scholarship Navigation', desc: 'Show Scholarships in top navbar' },
                                { key: 'scholarshipPageEnabled', label: 'Scholarship Marketing Page', desc: 'Enable public /scholarships route' },
                                { key: 'winnersGalleryEnabled', label: 'Winners Gallery', desc: 'Show position holders & year filter' },
                                { key: 'homepagePromotionEnabled', label: 'Homepage Promotion Section', desc: 'Show promo section below hero' },
                            ].map(ctrl => {
                                const isChecked = (settings as any)[ctrl.key]
                                return (
                                    <div key={ctrl.key} className={`p-4 rounded-xl border transition-all ${isChecked ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                                                <CheckCircle2 size={16} className={isChecked ? 'text-indigo-600' : 'text-slate-400'} />
                                                {ctrl.label}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setSettings(prev => ({ ...prev, [ctrl.key]: !(prev as any)[ctrl.key] }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isChecked ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500">{ctrl.desc}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* HOMEPAGE SCHOLARSHIP BANNER CARD */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <ImageIcon className="text-indigo-600" size={22} />
                                    Homepage Scholarship Banner
                                </h3>
                                <p className="text-xs text-slate-500">Configure manual banner upload, target click link, and preview rendering.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700">Enable Banner:</span>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, bannerEnabled: !prev.bannerEnabled }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.bannerEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.bannerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Banner Image Upload & Guidance Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Upload Dropzone & Inputs */}
                            <div className="lg:col-span-7 space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">Banner Image Source</label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={settings.bannerImage}
                                        onChange={(e) => setSettings(prev => ({ ...prev, bannerImage: e.target.value }))}
                                        placeholder="https://... image URL or upload below"
                                        className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        onChange={handleBannerFileChange}
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current?.click()}
                                        disabled={uploadingBanner}
                                        className="px-4 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shrink-0"
                                    >
                                        <Upload size={16} />
                                        <span>{uploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                                    </button>
                                </div>

                                {/* Banner Redirect URL Fields */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                            <LinkIcon size={16} className="text-indigo-600" />
                                            Banner Redirect URL
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Enable Click Link:</span>
                                            <button
                                                type="button"
                                                onClick={() => setSettings(prev => ({ ...prev, bannerRedirectEnabled: !prev.bannerRedirectEnabled }))}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.bannerRedirectEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.bannerRedirectEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        value={settings.bannerRedirectUrl}
                                        onChange={(e) => setSettings(prev => ({ ...prev, bannerRedirectUrl: e.target.value }))}
                                        placeholder="https://... target link on banner click"
                                        disabled={!settings.bannerRedirectEnabled}
                                        className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                    />
                                    <p className="text-xs text-slate-500">
                                        When enabled, clicking anywhere on the banner redirects the user directly to the specified URL.
                                    </p>
                                </div>
                            </div>

                            {/* Recommended Image Size Helper Box */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 p-5 rounded-2xl border border-indigo-100 space-y-3 text-xs">
                                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm border-b border-indigo-100 pb-2">
                                    <Info size={18} className="text-indigo-600" />
                                    <span>Recommended Banner Specifications</span>
                                </div>

                                <ul className="space-y-2 text-slate-700">
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Desktop Resolution:</span>
                                        <span className="font-mono bg-white px-2 py-0.5 rounded text-indigo-700 font-bold">1920 × 700 px</span>
                                    </li>
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Tablet Resolution:</span>
                                        <span className="font-mono bg-white px-2 py-0.5 rounded text-slate-700">1400 × 600 px</span>
                                    </li>
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Mobile Resolution:</span>
                                        <span className="font-mono bg-white px-2 py-0.5 rounded text-slate-700">1080 × 1350 px</span>
                                    </li>
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Aspect Ratio:</span>
                                        <span>Approximately 2.75 : 1</span>
                                    </li>
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Safe Content Area:</span>
                                        <span>Center 70% of banner</span>
                                    </li>
                                    <li className="flex justify-between border-b border-indigo-50 pb-1">
                                        <span className="font-semibold text-slate-900">Maximum File Size:</span>
                                        <span className="text-amber-700 font-bold">5 MB max</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="font-semibold text-slate-900">Preferred Format:</span>
                                        <span className="text-emerald-700 font-bold">WEBP (Auto-optimized)</span>
                                    </li>
                                </ul>

                                <div className="p-2.5 bg-white/80 rounded-xl text-slate-600 border border-indigo-100 text-[11px] leading-relaxed">
                                    💡 <strong>Design Note:</strong> Following these dimensions ensures your banner loads instantly, avoids layout shift, and looks crisp across all screens without degrading user experience.
                                </div>
                            </div>
                        </div>

                        {/* Banner Live Preview */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Eye size={14} className="text-indigo-600" />
                                    Live Homepage Banner Preview
                                </span>
                                {settings.bannerRedirectEnabled && settings.bannerRedirectUrl && (
                                    <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                        <ExternalLink size={12} /> Clickable target: {settings.bannerRedirectUrl}
                                    </span>
                                )}
                            </div>

                            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 group">
                                {settings.bannerImage ? (
                                    <div className="relative">
                                        <img
                                            src={settings.bannerImage}
                                            alt="Scholarship Banner Preview"
                                            className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                                <div>
                                                    <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider mb-2 inline-block shadow">
                                                        ICST Scholarship
                                                    </span>
                                                    <h4 className="text-xl md:text-2xl font-black text-white">Empowering Young Minds Through Education</h4>
                                                </div>

                                                {settings.resultEnabled && (
                                                    <a
                                                        href={settings.resultUrl || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg flex items-center gap-2 shrink-0 no-underline"
                                                    >
                                                        <span>{settings.resultButtonText || 'View Scholarship Result'}</span>
                                                        <ArrowUpRight size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {settings.bannerRedirectEnabled && (
                                            <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur border border-white/20 flex items-center gap-1.5 shadow">
                                                <LinkIcon size={12} className="text-amber-400" />
                                                <span>Clickable Banner Active</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">
                                        No banner image set. Please upload or specify an image URL above.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SCHOLARSHIP RESULT BUTTON CARD */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Scholarship Result Button</h3>
                                <p className="text-xs text-slate-500">Configure CTA button leading to external or internal result pages.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-700">Enable Result Button:</span>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, resultEnabled: !prev.resultEnabled }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.resultEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.resultEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Result Target URL</label>
                                <input
                                    type="text"
                                    value={settings.resultUrl}
                                    onChange={(e) => setSettings(prev => ({ ...prev, resultUrl: e.target.value }))}
                                    placeholder="https://icstconnect.com/results/scholarship-2026"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                                <input
                                    type="text"
                                    value={settings.resultButtonText}
                                    onChange={(e) => setSettings(prev => ({ ...prev, resultButtonText: e.target.value }))}
                                    placeholder="View Scholarship Result"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'winners' && (
                <div className="space-y-6">

                    {/* Winner Management Actions Header */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Position Holder & Winner Management</h3>
                                <p className="text-xs text-slate-500">Manage student photos, ranks, marks, and year-wise gallery display.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Year Filter */}
                            <TailwindDropdown
                                labelPrefix="Year Filter:"
                                options={[
                                    { label: 'All Years', value: 'all' },
                                    ...availableYears.map(yr => ({ label: String(yr), value: yr }))
                                ]}
                                value={selectedYearFilter}
                                onChange={(val) => setSelectedYearFilter(val === 'all' ? 'all' : Number(val))}
                            />

                            <button
                                onClick={() => handleOpenWinnerModal()}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus size={18} />
                                <span>Add Position Holder</span>
                            </button>
                        </div>
                    </div>

                    {/* Winners Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Year</th>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">School & District</th>
                                        <th className="px-6 py-4">Marks</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredWinners.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                No winner records found for the selected filter. Click "+ Add Position Holder" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredWinners.map(winner => (
                                            <tr key={winner.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={winner.photo}
                                                            alt={winner.studentName}
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-slate-900">{winner.studentName}</div>
                                                            <div className="text-xs text-slate-400 line-clamp-1">{winner.description || 'No bio'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                                                        {winner.year}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${winner.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' : winner.rank === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' : winner.rank === 3 ? 'bg-amber-900/10 text-amber-900 border border-amber-900/20' : 'bg-indigo-50 text-indigo-700'}`}>
                                                        Rank #{winner.rank}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-600">
                                                    <div className="font-semibold text-slate-800">{winner.schoolName}</div>
                                                    <div className="text-slate-400">{winner.district}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-emerald-600">
                                                    {winner.marks}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleWinnerPublished(winner)}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${winner.published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full ${winner.published ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {winner.published ? 'Published' : 'Hidden'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenWinnerModal(winner)}
                                                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit record"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWinner(winner.id)}
                                                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Delete record"
                                                        >
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
                </div>
            )}

            {/* ADD / EDIT WINNER MODAL */}
            {isWinnerModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Trophy className="text-amber-500" size={20} />
                                {editingWinner ? 'Edit Winner Record' : 'Add Position Holder'}
                            </h3>
                            <button
                                onClick={() => setIsWinnerModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveWinner} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
                                    <input
                                        type="number"
                                        required
                                        value={winnerForm.year}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rank / Position *</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={winnerForm.rank}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, rank: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Subhadip Roy"
                                    value={winnerForm.studentName}
                                    onChange={(e) => setWinnerForm(prev => ({ ...prev, studentName: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">School Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Chowberia High School"
                                        value={winnerForm.schoolName}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, schoolName: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Nadia"
                                        value={winnerForm.district}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, district: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks / Percentage *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 98.8%"
                                    value={winnerForm.marks}
                                    onChange={(e) => setWinnerForm(prev => ({ ...prev, marks: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Photo</label>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={winnerForm.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                                        alt="Student Preview"
                                        className="w-14 h-14 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            value={winnerForm.photo}
                                            onChange={(e) => setWinnerForm(prev => ({ ...prev, photo: e.target.value }))}
                                            placeholder="https://... or upload photo"
                                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span>Recommended: 600×600 px Square WebP (Max 2MB)</span>
                                            <input
                                                type="file"
                                                ref={winnerPhotoInputRef}
                                                onChange={handleWinnerPhotoChange}
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => winnerPhotoInputRef.current?.click()}
                                                disabled={uploadingWinnerPhoto}
                                                className="text-indigo-600 font-semibold hover:underline"
                                            >
                                                {uploadingWinnerPhoto ? 'Uploading...' : 'Upload File'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Achievement Description / Bio</label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional note about their achievement..."
                                    value={winnerForm.description}
                                    onChange={(e) => setWinnerForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={winnerForm.published}
                                        onChange={(e) => setWinnerForm(prev => ({ ...prev, published: e.target.checked }))}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <span>Publish immediately to public website</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsWinnerModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition-all"
                                >
                                    Save Winner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'examPhotos' && (
                <div className="space-y-6 font-inter">
                    {/* Exam Photos Actions Header */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-600">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Scholarship Examination Gallery</h3>
                                <p className="text-xs text-slate-500">Upload and manage examination hall photos, sessions, and school event moments.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenExamModal()}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} />
                            <span>Add Exam Photo</span>
                        </button>
                    </div>

                    {/* Exam Photos Grid */}
                    {examImages.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                            No examination photos added yet. Click "+ Add Exam Photo" to upload one.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {examImages.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                                            {item.session}
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleToggleExamPublished(item)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${item.published ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-slate-300'}`}
                                            >
                                                {item.published ? 'Published' : 'Hidden'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{item.schoolName}</div>
                                            <h4 className="font-bold text-slate-900 text-base line-clamp-1">{item.title}</h4>
                                            {item.description && (
                                                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400">Year {item.year}</span>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenExamModal(item)}
                                                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Photo"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExamImage(item.id)}
                                                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Photo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ADD / EDIT EXAM PHOTO MODAL */}
            {isExamModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ImageIcon className="text-indigo-600" size={20} />
                                {editingExamImage ? 'Edit Exam Photo Details' : 'Add Examination Photo'}
                            </h3>
                            <button
                                onClick={() => setIsExamModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveExamPhoto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Event Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. ICST Talent Search Exam 2026 - Main Center"
                                    value={examForm.title}
                                    onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">School Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Chowberia High School"
                                        value={examForm.schoolName}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, schoolName: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Scholarship Session *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2026-2027 Session"
                                        value={examForm.session}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, session: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                                <input
                                    type="number"
                                    required
                                    value={examForm.year}
                                    onChange={(e) => setExamForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Photo *</label>
                                <div className="space-y-2">
                                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
                                        {examForm.image ? (
                                            <img
                                                src={examForm.image}
                                                alt="Exam Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                                                No image selected
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={examForm.image}
                                            onChange={(e) => setExamForm(prev => ({ ...prev, image: e.target.value }))}
                                            placeholder="https://... or upload file"
                                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                                        />
                                        <input
                                            type="file"
                                            ref={examPhotoInputRef}
                                            onChange={handleExamPhotoFileChange}
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => examPhotoInputRef.current?.click()}
                                            disabled={uploadingExamPhoto}
                                            className="px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                                        >
                                            {uploadingExamPhoto ? 'Uploading...' : 'Upload Image'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional details about this examination session..."
                                    value={examForm.description}
                                    onChange={(e) => setExamForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={examForm.published}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, published: e.target.checked }))}
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <span>Publish immediately to public website</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsExamModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition-all"
                                >
                                    Save Photo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
