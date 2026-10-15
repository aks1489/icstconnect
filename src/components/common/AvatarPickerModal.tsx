import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    IconX as X,
    IconDice as Dice,
    IconUpload as Upload,
    IconCheck as Check,
    IconSparkles as Sparkles,
    IconRefresh as RefreshCw,
    IconUserCheck as UserCheck
} from '@tabler/icons-react'
import { AVATAR_STYLES, generateRandomAvatarSet, getEffectiveAvatarUrl } from '../../utils/avatarUtils'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ImageCropModal from './ImageCropModal'
import { getCroppedImg, type PixelCrop } from '../../utils/imageCropUtils'

export interface AvatarPickerModalProps {
    isOpen: boolean
    onClose: () => void
    currentAvatarUrl?: string | null
    userName?: string
    onAvatarSelect?: (newUrl: string) => void
    autoSaveToProfile?: boolean
}

export default function AvatarPickerModal({
    isOpen,
    onClose,
    currentAvatarUrl,
    userName,
    onAvatarSelect,
    autoSaveToProfile = true
}: AvatarPickerModalProps) {
    const { user, profile, refreshProfile } = useAuth()
    const { showToast } = useToast()

    const initialUrl = getEffectiveAvatarUrl(currentAvatarUrl || profile?.avatar_url, userName || profile?.full_name)
    const [selectedUrl, setSelectedUrl] = useState<string>(initialUrl)
    const [activeTab, setActiveTab] = useState<string>('all')
    const [avatarList, setAvatarList] = useState<Array<{ id: string; url: string; style: string; seed: string }>>([])
    const [isRolling, setIsRolling] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Upload & Crop State
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [rawImageSrc, setRawImageSrc] = useState<string>('')
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

    // Initialize & generate avatar set on open
    useEffect(() => {
        if (isOpen) {
            setSelectedUrl(getEffectiveAvatarUrl(currentAvatarUrl || profile?.avatar_url, userName || profile?.full_name))
            rollAvatars('all')
        }
    }, [isOpen, currentAvatarUrl, profile?.avatar_url, userName, profile?.full_name])

    const rollAvatars = (styleFilter: string = activeTab) => {
        setIsRolling(true)
        const set = generateRandomAvatarSet(styleFilter, 12)
        setAvatarList(set)
        setTimeout(() => setIsRolling(false), 250)
    }

    const handleCategoryChange = (catId: string) => {
        setActiveTab(catId)
        rollAvatars(catId)
    }

    // Handle File Selection for direct upload
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 15 * 1024 * 1024) {
            showToast('Selected file exceeds 15 MB limit.', 'error')
            e.target.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setRawImageSrc(reader.result as string)
            setIsCropModalOpen(true)
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleCropConfirm = async (pixelCrop: PixelCrop) => {
        const targetUserId = user?.id || profile?.id || 'guest'
        try {
            setIsUploadingPhoto(true)
            setIsCropModalOpen(false)

            const compressedWebpFile = await getCroppedImg(
                rawImageSrc,
                pixelCrop,
                500,
                500,
                0.85
            )

            const fileName = `${targetUserId}-${Date.now()}.webp`
            const filePath = `profile-pictures/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedWebpFile, {
                    contentType: 'image/webp',
                    upsert: true
                })

            let finalUrl = ''
            if (uploadError) {
                // Fallback to data url
                finalUrl = await new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(compressedWebpFile)
                })
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)
                finalUrl = publicUrl
            }

            setSelectedUrl(finalUrl)
            showToast('Custom photo cropped and selected!', 'success')
        } catch (err: any) {
            console.error('Crop/upload error:', err)
            showToast('Could not process photo: ' + (err.message || 'Error'), 'error')
        } finally {
            setIsUploadingPhoto(false)
        }
    }

    const handleSave = async () => {
        if (!selectedUrl) return

        setIsSaving(true)
        try {
            if (onAvatarSelect) {
                onAvatarSelect(selectedUrl)
            }

            if (autoSaveToProfile && user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ avatar_url: selectedUrl })
                    .eq('id', user.id)

                if (error) throw error

                await refreshProfile()
                showToast('Avatar updated successfully!', 'success')
            } else {
                showToast('Avatar chosen!', 'success')
            }

            onClose()
        } catch (err: any) {
            console.error('Save avatar error:', err)
            showToast('Failed to save avatar: ' + (err.message || 'Error'), 'error')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-inter">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[92vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white">
                                    Avatar Studio
                                </h2>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                                    Choose a creative avatar, roll random styles, or upload your photo.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 sm:space-y-6 flex-1">
                        {/* Selected Avatar Spotlight Card */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-indigo-500/30 dark:border-indigo-400/30 shadow-md ring-4 ring-indigo-500/10 flex items-center justify-center">
                                    <img
                                        src={selectedUrl}
                                        alt="Selected Preview"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs">
                                    <Check size={12} className="stroke-[3]" />
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                                <div>
                                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        Selected Avatar
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        {userName || profile?.full_name || 'Student Profile'}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                                        This picture will appear across your Student Portal, tests, and certificates.
                                    </p>
                                </div>

                                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => rollAvatars()}
                                        disabled={isRolling}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 min-h-[40px]"
                                    >
                                        <Dice size={15} className={isRolling ? 'animate-spin' : ''} />
                                        Roll Random Avatars
                                    </button>

                                    <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-300 dark:border-slate-600 shadow-2xs transition-colors cursor-pointer min-h-[40px]">
                                        <Upload size={14} />
                                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Real Photo'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelected}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter Pills (Mobile Horizontal Scroll) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Generative Styles
                                </label>
                                <button
                                    onClick={() => rollAvatars()}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <RefreshCw size={12} className={isRolling ? 'animate-spin' : ''} />
                                    Shuffle
                                </button>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 no-scrollbar touch-pan-x whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                                        activeTab === 'all'
                                            ? 'bg-indigo-600 text-white shadow-2xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    🌟 All Styles
                                </button>
                                {AVATAR_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => handleCategoryChange(style.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                                            activeTab === style.id
                                                ? 'bg-indigo-600 text-white shadow-2xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Avatar Grid */}
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Click any avatar below to select it:
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {avatarList.map((item) => {
                                    const isSelected = selectedUrl === item.url
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedUrl(item.url)}
                                            className={`
                                                relative aspect-square rounded-2xl overflow-hidden p-1.5
                                                bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40
                                                border-2 transition-all duration-200 cursor-pointer group
                                                ${
                                                    isSelected
                                                        ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-md scale-105'
                                                        : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600'
                                                }
                                            `}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`Avatar ${item.seed}`}
                                                className="w-full h-full object-cover rounded-xl transition-transform duration-200 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                                    <Check size={12} className="stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => rollAvatars()}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <Dice size={15} />
                                Roll More
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <UserCheck size={16} />
                                <span>{isSaving ? 'Applying...' : 'Save As My Avatar'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Nested Image Crop Modal for Real Photos */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                imageSrc={rawImageSrc}
                aspectRatio={1}
                cropShape="rect"
                title="Crop Profile Photo"
                instruction="Position face centered within the 1:1 square frame."
                isProcessing={isUploadingPhoto}
                onConfirm={handleCropConfirm}
                onCancel={() => setIsCropModalOpen(false)}
            />
        </AnimatePresence>
    )
}
