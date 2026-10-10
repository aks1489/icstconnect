import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { IconUser as User, IconCrop as Crop, IconUpload as Upload } from '@tabler/icons-react'
import { useToast } from '../../contexts/ToastContext'
import ImageCropModal from './ImageCropModal'
import { getCroppedImg, type PixelCrop } from '../../utils/imageCropUtils'

interface ImageUploadProps {
    currentImageUrl?: string
    onUploadComplete: (url: string) => void
    userId: string
    shape?: 'rounded-rect' | 'circle'
}

export default function ImageUpload({ currentImageUrl, onUploadComplete, userId, shape = 'rounded-rect' }: ImageUploadProps) {
    const { showToast } = useToast()
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
    const [rawImageSrc, setRawImageSrc] = useState<string>('')
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 15 * 1024 * 1024) {
            showToast('Selected file exceeds 15 MB limit.', 'error')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setRawImageSrc(reader.result as string)
            setIsCropModalOpen(true)
        }
        reader.readAsDataURL(file)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleCropConfirm = async (pixelCrop: PixelCrop) => {
        try {
            setUploading(true)
            setIsCropModalOpen(false)

            // 1. Crop canvas to 1:1 and compress to WebP in background
            const compressedWebpFile = await getCroppedImg(
                rawImageSrc,
                pixelCrop,
                500,
                500,
                0.85
            )

            // 2. Set local client preview immediately
            setPreviewUrl(URL.createObjectURL(compressedWebpFile))

            // 3. Upload to Supabase Storage avatars
            const fileName = `${userId}-${Date.now()}.webp`
            const filePath = `profile-pictures/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedWebpFile, {
                    contentType: 'image/webp',
                    upsert: true
                })

            if (uploadError) {
                console.warn('Supabase storage upload failed, attempting fallback:', uploadError)
                // If storage fails, convert to dataURL as fallback
                const reader = new FileReader()
                reader.onload = () => {
                    const fallbackUrl = reader.result as string
                    onUploadComplete(fallbackUrl)
                    showToast('Photo cropped and saved locally!', 'success')
                }
                reader.readAsDataURL(compressedWebpFile)
                return
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
            showToast('Profile photo updated successfully!', 'success')
        } catch (error: any) {
            console.error('Error uploading image:', error)
            showToast('Error uploading image: ' + (error?.message || 'Upload error'), 'error')
        } finally {
            setUploading(false)
        }
    }

    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

    return (
        <div className="flex items-center gap-4">
            {/* Rounded Rectangular DP on Left */}
            <div className="relative group w-20 h-20 flex-shrink-0">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-full ${shapeClass} overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-indigo-500/40 hover:border-indigo-600 dark:hover:border-indigo-400 shadow-sm transition-all cursor-pointer flex items-center justify-center ${uploading ? 'opacity-50' : ''}`}
                    title="Click to select & crop photo"
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile DP"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <User className="w-8 h-8" />
                            <span className="text-[9px] font-bold tracking-tight mt-0.5">DP</span>
                        </div>
                    )}
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs rounded-2xl">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!uploading && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute inset-0 flex items-center justify-center bg-black/40 ${shapeClass} opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white`}
                        title="Change photo"
                    >
                        <Crop size={20} />
                    </button>
                )}
            </div>

            {/* Upload Button & Text to the right of DP */}
            <div className="space-y-1">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                    <Upload size={14} className={uploading ? 'animate-bounce' : ''} />
                    <span>{uploading ? 'Optimizing...' : 'Upload Photo'}</span>
                </button>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Square DP (1:1). Compressed to WebP in background.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                imageSrc={rawImageSrc}
                aspectRatio={1}
                cropShape="rect"
                title="Crop Profile Display Picture (DP)"
                instruction="Position face centered within the 1:1 square frame."
                isProcessing={uploading}
                onConfirm={handleCropConfirm}
                onCancel={() => setIsCropModalOpen(false)}
            />
        </div>
    )
}
