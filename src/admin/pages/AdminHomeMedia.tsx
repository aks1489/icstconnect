import { useState, useEffect, useRef, useMemo } from 'react'
import {
    IconPhoto,
    IconCrop,
    IconUpload,
    IconRotate2,
    IconSearch,
    IconCheck,
    IconEdit,
    IconX,
    IconDeviceFloppy,
    IconDatabase,
    IconLayersLinked,
    IconSchool,
    IconRocket,
    IconDeviceGamepad2,
    IconAward,
    IconCertificate,
    IconFolderHeart
} from '@tabler/icons-react'
import {
    mediaService,
    GROUP_CONFIGS,
    type SiteMediaItem,
    type MediaGroupName
} from '../../services/mediaService'
import ImageCropModal from '../../components/common/ImageCropModal'
import { getCroppedImg, type PixelCrop } from '../../utils/imageCropUtils'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function AdminHomeMedia() {
    const { showToast } = useToast()
    const [mediaItems, setMediaItems] = useState<Record<string, SiteMediaItem>>(() =>
        mediaService.getLocalCache()
    )
    const [loading, setLoading] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<string>('All Groups')
    const [searchQuery, setSearchQuery] = useState('')

    // Cropper State
    const [croppingItem, setCroppingItem] = useState<SiteMediaItem | null>(null)
    const [cropperImageSrc, setCropperImageSrc] = useState<string>('')
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [isProcessingCrop, setIsProcessingCrop] = useState(false)

    // Direct Edit Modal State
    const [editingItem, setEditingItem] = useState<SiteMediaItem | null>(null)
    const [editForm, setEditForm] = useState<{
        title: string
        alt_text: string
        cloudinary_url: string
        description: string
    }>({ title: '', alt_text: '', cloudinary_url: '', description: '' })
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // Pick from Database Gallery Modal State
    const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false)
    const [targetPickerKey, setTargetPickerKey] = useState<string | null>(null)
    const [dbGalleryImages, setDbGalleryImages] = useState<
        Array<{ id: string; url: string; title: string | null }>
    >([])
    const [loadingDbGallery, setLoadingDbGallery] = useState(false)

    // Reset Confirmation Modal State
    const [resetTargetKey, setResetTargetKey] = useState<string | null>(null)
    const [isResetting, setIsResetting] = useState(false)

    // Hidden file input for "Upload & Crop"
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pendingUploadKeyRef = useRef<string | null>(null)

    // Initial Load & Realtime Sync
    useEffect(() => {
        let isMounted = true
        setLoading(true)
        mediaService
            .getAllMedia()
            .then((data) => {
                if (isMounted) {
                    setMediaItems(data)
                    setLoading(false)
                }
            })
            .catch(() => {
                if (isMounted) setLoading(false)
            })

        const unsubscribe = mediaService.onMediaChange((updated) => {
            if (isMounted) {
                setMediaItems(updated)
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    // Open Gallery Picker and fetch pictures from Supabase
    const handleOpenGalleryPicker = async (key: string) => {
        setTargetPickerKey(key)
        setIsGalleryPickerOpen(true)
        setLoadingDbGallery(true)
        try {
            const photos = await mediaService.getDatabaseGalleryImages()
            setDbGalleryImages(photos)
        } catch (err) {
            console.error('Error fetching gallery images from DB:', err)
        } finally {
            setLoadingDbGallery(false)
        }
    }

    // Pick an existing photo from the database gallery
    const handleSelectDbGalleryPhoto = async (photoUrl: string) => {
        if (!targetPickerKey) return
        const item = mediaItems[targetPickerKey]
        if (!item) return

        // Open cropper with the chosen DB photo URL
        setCropperImageSrc(photoUrl)
        setCroppingItem(item)
        setIsGalleryPickerOpen(false)
        setTargetPickerKey(null)
        setIsCropModalOpen(true)
    }

    // Trigger file selection for Upload & Crop
    const handleTriggerUpload = (key: string) => {
        pendingUploadKeyRef.current = key
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
            fileInputRef.current.click()
        }
    }

    // Handle user selected file
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const key = pendingUploadKeyRef.current
        if (!file || !key) return

        if (file.size > 15 * 1024 * 1024) {
            showToast('Selected file exceeds 15 MB limit. Please select an optimized image.', 'error')
            return
        }

        const item = mediaItems[key]
        if (!item) return

        const reader = new FileReader()
        reader.onload = () => {
            setCropperImageSrc(reader.result as string)
            setCroppingItem(item)
            setIsCropModalOpen(true)
        }
        reader.onerror = () => {
            showToast('Failed to load image file.', 'error')
        }
        reader.readAsDataURL(file)
    }

    // Trigger crop on existing image
    const handleCropExisting = (item: SiteMediaItem) => {
        setCropperImageSrc(item.cloudinary_url)
        setCroppingItem(item)
        setIsCropModalOpen(true)
    }

    // Process & Apply Crop
    const handleCropConfirm = async (pixelCrop: PixelCrop) => {
        if (!croppingItem) return

        try {
            setIsProcessingCrop(true)
            const targetW = croppingItem.recommended_width || 1200
            const targetH = croppingItem.recommended_height || 800

            // 1. Crop in browser & compress to WebP
            const croppedWebpFile = await getCroppedImg(
                cropperImageSrc,
                pixelCrop,
                targetW,
                targetH,
                0.85
            )

            // 2. Upload with Cloudinary or fallback WebP DataURL
            const uploadedUrl = await mediaService.processAndUploadImage(
                croppedWebpFile,
                targetW,
                targetH
            )

            // 3. Save into mediaService (syncs to Supabase database)
            await mediaService.saveMedia({
                key: croppingItem.key,
                cloudinary_url: uploadedUrl,
                is_custom: true
            })

            showToast(`Saved to database and live site for "${croppingItem.title}"!`, 'success')
            setIsCropModalOpen(false)
            setCroppingItem(null)
            setCropperImageSrc('')
        } catch (err: any) {
            console.error('Failed to crop and save image:', err)
            showToast(err.message || 'Failed to crop and upload image.', 'error')
        } finally {
            setIsProcessingCrop(false)
        }
    }

    // Open Edit Details Modal
    const handleOpenEdit = (item: SiteMediaItem) => {
        setEditingItem(item)
        setEditForm({
            title: item.title,
            alt_text: item.alt_text,
            cloudinary_url: item.cloudinary_url,
            description: item.description || ''
        })
    }

    // Save Edit Details Modal
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return

        try {
            setIsSavingEdit(true)
            await mediaService.saveMedia({
                key: editingItem.key,
                title: editForm.title.trim(),
                alt_text: editForm.alt_text.trim(),
                cloudinary_url: editForm.cloudinary_url.trim(),
                description: editForm.description.trim(),
                is_custom: true
            })
            showToast(`Updated and synced to database for "${editForm.title}"!`, 'success')
            setEditingItem(null)
        } catch (err: any) {
            showToast(err.message || 'Failed to update media details.', 'error')
        } finally {
            setIsSavingEdit(false)
        }
    }

    // Execute Reset to Default
    const handleConfirmReset = async () => {
        if (!resetTargetKey) return
        try {
            setIsResetting(true)
            const restored = await mediaService.resetMedia(resetTargetKey)
            showToast(`Restored "${restored.title}" to original default!`, 'success')
            setResetTargetKey(null)
        } catch (err: any) {
            showToast(err.message || 'Failed to reset image.', 'error')
        } finally {
            setIsResetting(false)
        }
    }

    // Metrics summary
    const metrics = useMemo(() => {
        const all = Object.values(mediaItems)
        const total = all.length
        const customCount = all.filter((i) => i.is_custom).length
        const defaultCount = total - customCount
        return { total, customCount, defaultCount }
    }, [mediaItems])

    // Get group icon
    const getGroupIcon = (grpName: MediaGroupName) => {
        switch (grpName) {
            case 'About Section':
                return <IconSchool size={20} className="text-blue-500" />
            case 'Campus Gallery':
                return <IconPhoto size={20} className="text-purple-500" />
            case 'Hero Section':
                return <IconRocket size={20} className="text-amber-500" />
            case 'Learning Hub':
                return <IconDeviceGamepad2 size={20} className="text-emerald-500" />
            case 'Scholarship Banner':
                return <IconAward size={20} className="text-indigo-500" />
            case 'Online Assessment':
                return <IconCertificate size={20} className="text-cyan-500" />
            default:
                return <IconLayersLinked size={20} className="text-indigo-500" />
        }
    }

    // Filtered groups based on search & tab selection
    const visibleGroups = useMemo(() => {
        return GROUP_CONFIGS.filter((config) => {
            if (selectedGroup !== 'All Groups' && config.name !== selectedGroup) {
                return false
            }

            // Check if any item in this group matches the search query
            if (!searchQuery) return true

            const q = searchQuery.toLowerCase()
            const matchesGroupMeta =
                config.title.toLowerCase().includes(q) ||
                config.description.toLowerCase().includes(q)

            const matchesAnyItem = config.keys.some((key) => {
                const item = mediaItems[key]
                if (!item) return false
                return (
                    item.title.toLowerCase().includes(q) ||
                    item.alt_text.toLowerCase().includes(q) ||
                    item.key.toLowerCase().includes(q)
                )
            })

            return matchesGroupMeta || matchesAnyItem
        })
    }, [selectedGroup, searchQuery, mediaItems])

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-inter">
            {/* Hidden Input for Upload & Crop */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept="image/png, image/jpeg, image/webp, image/jpg"
                className="hidden"
            />

            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                        <IconPhoto size={28} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Home Page Images
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Database Connected
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                            Structured management suite organized by homepage groups. Crop and synchronize section imagery directly with the live database and Cloudinary storage.
                        </p>
                    </div>
                </div>

                {/* Metrics Stats */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                    <div className="px-3 py-1.5 text-center border-r border-slate-200 dark:border-slate-700">
                        <span className="block text-lg font-black text-slate-900 dark:text-white leading-none">
                            6
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Groups
                        </span>
                    </div>
                    <div className="px-3 py-1.5 text-center border-r border-slate-200 dark:border-slate-700">
                        <span className="block text-lg font-black text-slate-900 dark:text-white leading-none">
                            {metrics.total}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Slots
                        </span>
                    </div>
                    <div className="px-3 py-1.5 text-center border-r border-slate-200 dark:border-slate-700">
                        <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {metrics.customCount}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Custom
                        </span>
                    </div>
                    <div className="px-3 py-1.5 text-center">
                        <span className="block text-lg font-black text-slate-600 dark:text-slate-300 leading-none">
                            {metrics.defaultCount}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Default
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                        <IconSearch
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, key, or alt text..."
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <IconX size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto">
                        <IconDatabase size={14} className="text-emerald-500" />
                        <span>Connected to Supabase live ledger & real-time sync</span>
                    </div>
                </div>

                {/* Section Group Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setSelectedGroup('All Groups')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            selectedGroup === 'All Groups'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        All Groups (6)
                    </button>
                    {GROUP_CONFIGS.map((config) => {
                        const isSelected = selectedGroup === config.name
                        return (
                            <button
                                key={config.name}
                                onClick={() => setSelectedGroup(config.name)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span>{config.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                    {config.keys.length}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Loading State */}
            {loading && Object.keys(mediaItems).length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                        Synchronizing with database...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Fetching image registry from Supabase and Cloudinary CDN
                    </p>
                </div>
            ) : visibleGroups.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
                    <IconPhoto size={48} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        No groups or images matched your search
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Try clearing search terms or selecting 'All Groups'.
                    </p>
                </div>
            ) : (
                /* Properly Grouped Sections */
                <div className="space-y-10">
                    {visibleGroups.map((config) => {
                        const groupItems = config.keys
                            .map((k) => mediaItems[k] || mediaService.getCachedMediaByKey(k))
                            .filter(Boolean)

                        return (
                            <section
                                key={config.name}
                                className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm"
                            >
                                {/* Group Section Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                                            {getGroupIcon(config.name)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                    {config.title}
                                                </h2>
                                                <span className="text-xs font-semibold text-slate-400">
                                                    ({config.keys.length} {config.keys.length === 1 ? 'Slot' : 'Slots'})
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl leading-relaxed">
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Aspect Ratio Badge & Requirements */}
                                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                            <IconCrop size={14} />
                                            <span>Target: {config.aspect_label}</span>
                                        </div>
                                        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                                            ({config.recommended_dims})
                                        </span>
                                    </div>
                                </div>

                                {/* Items Grid inside this Group */}
                                <div
                                    className={`grid gap-6 ${
                                        config.name === 'Campus Gallery'
                                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                            : config.keys.length === 1
                                            ? 'grid-cols-1 max-w-3xl'
                                            : 'grid-cols-1 md:grid-cols-2'
                                    }`}
                                >
                                    {groupItems.map((item, index) => {
                                        return (
                                            <div
                                                key={item.key}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group/card"
                                            >
                                                {/* Image Preview with exact aspect ratio container */}
                                                <div
                                                    className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center select-none"
                                                    style={{
                                                        aspectRatio: item.aspect_ratio ? `${item.aspect_ratio}` : '16/9'
                                                    }}
                                                >
                                                    <img
                                                        src={item.cloudinary_url}
                                                        alt={item.alt_text}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                                        onError={(e) => {
                                                            const fallback = mediaService.getCachedMediaByKey(item.key)
                                                            if (e.currentTarget.src !== fallback.cloudinary_url) {
                                                                e.currentTarget.src = fallback.cloudinary_url
                                                            }
                                                        }}
                                                    />

                                                    {/* Slot Index Tag Top Left */}
                                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white shadow-sm border border-white/20">
                                                        <span>
                                                            {config.name === 'Campus Gallery'
                                                                ? `Highlight #${index + 1}`
                                                                : item.aspect_label}
                                                        </span>
                                                    </div>

                                                    {/* Status Badge Top Right */}
                                                    <div className="absolute top-3 right-3">
                                                        {item.is_custom ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-[11px] font-bold text-white shadow-sm">
                                                                <IconCheck size={12} />
                                                                Custom Live
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-white/10">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons Overlay on Hover */}
                                                    <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-4 backdrop-blur-[2px]">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCropExisting(item)}
                                                            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform hover:scale-105 shadow-lg flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-slate-700"
                                                            title="Frame and crop current photo"
                                                        >
                                                            <IconCrop size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                            <span>Crop Existing</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleTriggerUpload(item.key)}
                                                            className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-transform hover:scale-105 shadow-lg flex items-center gap-1.5 cursor-pointer"
                                                            title="Upload new image and crop"
                                                        >
                                                            <IconUpload size={14} />
                                                            <span>Upload & Crop</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenGalleryPicker(item.key)}
                                                            className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-transform hover:scale-105 shadow-lg flex items-center gap-1.5 cursor-pointer"
                                                            title="Choose an existing photo from the database gallery"
                                                        >
                                                            <IconFolderHeart size={14} />
                                                            <span>Choose from DB</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content Details */}
                                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                                            <span className="text-[10px] font-mono text-slate-400">
                                                                {item.key}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                                            {item.title}
                                                        </h3>

                                                        {item.description && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        {/* SEO Alt Text Callout */}
                                                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                                                            <strong className="text-slate-700 dark:text-slate-200 block text-[10px] uppercase tracking-wider mb-0.5">
                                                                SEO Alt Text:
                                                            </strong>
                                                            <span className="line-clamp-2 italic">
                                                                "{item.alt_text}"
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card Actions Footer */}
                                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEdit(item)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                                                                title="Edit image URL and metadata"
                                                            >
                                                                <IconEdit size={14} />
                                                                <span>Edit</span>
                                                            </button>

                                                            {item.is_custom && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setResetTargetKey(item.key)}
                                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                                                                    title="Reset to default original asset"
                                                                >
                                                                    <IconRotate2 size={14} />
                                                                    <span>Reset</span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenGalleryPicker(item.key)}
                                                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900 transition-all flex items-center gap-1 cursor-pointer"
                                                                title="Select an image from existing database gallery"
                                                            >
                                                                <IconFolderHeart size={14} />
                                                                <span>From DB</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleTriggerUpload(item.key)}
                                                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                                            >
                                                                <IconCrop size={14} />
                                                                <span>Crop / Upload</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}

            {/* Choose from Database Gallery Modal */}
            {isGalleryPickerOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <IconFolderHeart size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Choose from Database Gallery
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Select an existing photograph from Supabase gallery_images to crop and frame
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsGalleryPickerOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <IconX size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            {loadingDbGallery ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-xs font-semibold text-slate-500">
                                        Loading photos from Supabase gallery...
                                    </p>
                                </div>
                            ) : dbGalleryImages.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <IconPhoto size={36} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">No pictures found in database gallery</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        You can upload directly using the "Upload & Crop" option.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {dbGalleryImages.map((photo) => (
                                        <button
                                            key={photo.id}
                                            type="button"
                                            onClick={() => handleSelectDbGalleryPhoto(photo.url)}
                                            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 focus:outline-none transition-all shadow-sm cursor-pointer"
                                        >
                                            <img
                                                src={photo.url}
                                                alt={photo.title || 'Gallery item'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md">
                                                    Select & Crop
                                                </span>
                                            </div>
                                            {photo.title && (
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left">
                                                    <p className="text-[10px] text-white font-medium line-clamp-1">
                                                        {photo.title}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsGalleryPickerOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Image Cropper Modal */}
            {croppingItem && (
                <ImageCropModal
                    isOpen={isCropModalOpen}
                    imageSrc={cropperImageSrc}
                    aspectRatio={croppingItem.aspect_ratio || 16 / 9}
                    title={`Frame & Crop: ${croppingItem.title}`}
                    instruction={`Target Aspect Ratio is ${croppingItem.aspect_label}. Drag or zoom to compose your image precisely for zero layout shifts.`}
                    isProcessing={isProcessingCrop}
                    onConfirm={handleCropConfirm}
                    onCancel={() => {
                        setIsCropModalOpen(false)
                        setCroppingItem(null)
                        setCropperImageSrc('')
                    }}
                />
            )}

            {/* Direct Edit Metadata / URL Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <IconEdit size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Edit Image Slot Details
                                    </h3>
                                    <span className="text-[11px] font-mono text-slate-400">
                                        {editingItem.key}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <IconX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Slot Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, title: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Image URL (Cloudinary, Unsplash, or CDN)
                                </label>
                                <input
                                    type="url"
                                    value={editForm.cloudinary_url}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, cloudinary_url: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    SEO & Accessible Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={editForm.alt_text}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, alt_text: e.target.value })
                                    }
                                    required
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Mandatory for WCAG compliance and Technical SEO audits.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Usage Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, description: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                                >
                                    {isSavingEdit ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <IconDeviceFloppy size={16} />
                                    )}
                                    <span>Save & Sync to Database</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog for Reset */}
            <ConfirmDialog
                isOpen={!!resetTargetKey}
                title="Reset Image to Default?"
                description="This will restore the slot back to the original default institutional asset. Your custom cropped image URL will be replaced in the database."
                confirmLabel="Reset to Default"
                variant="warning"
                isLoading={isResetting}
                onConfirm={handleConfirmReset}
                onCancel={() => setResetTargetKey(null)}
            />
        </div>
    )
}
