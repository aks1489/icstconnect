import { useState, useRef } from 'react'
import {
    IconUpload,
    IconCamera,
    IconCrop,
    IconX,
    IconEye,
    IconSparkles
} from '@tabler/icons-react'
import ImageCropModal from './ImageCropModal'
import { getCroppedImg, type PixelCrop } from '../../utils/imageCropUtils'
import { scholarshipService } from '../../services/scholarshipService'
import { useToast } from '../../contexts/ToastContext'

export interface ImageCropUploadFieldProps {
    value: string
    onChange: (url: string) => void
    label?: string
    placeholder?: string
    uploadButtonText?: string
    aspectRatio?: number
    cropShape?: 'rect' | 'round'
    instruction?: string
    maxW?: number
    maxH?: number
    required?: boolean
    className?: string
    customUploadHandler?: (file: File) => Promise<string>
}

export default function ImageCropUploadField({
    value,
    onChange,
    label,
    placeholder = 'https://images.unsplash.com/... or upload photo',
    uploadButtonText = 'Upload Photo',
    aspectRatio = 1,
    cropShape = 'rect',
    instruction,
    maxW = 1200,
    maxH = 1200,
    required = false,
    className = '',
    customUploadHandler
}: ImageCropUploadFieldProps) {
    const { showToast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const [rawImageSrc, setRawImageSrc] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [previewZoomModal, setPreviewZoomModal] = useState(false)

    // Handle user selecting an image of any dimension
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        reader.onerror = () => {
            showToast('Failed to read image file.', 'error')
        }
        reader.readAsDataURL(file)

        // Reset file input so re-selecting same file fires onChange
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Process crop, compress to WebP in background, and upload
    const handleCropConfirm = async (pixelCrop: PixelCrop) => {
        try {
            setIsProcessing(true)

            // 1. Crop canvas and compress in background to WebP
            const croppedWebpFile = await getCroppedImg(
                rawImageSrc,
                pixelCrop,
                maxW,
                maxH,
                0.85
            )

            // 2. Upload to Cloudinary or Supabase or convert to optimized WebP DataURL
            let finalUrl = ''
            if (customUploadHandler) {
                finalUrl = await customUploadHandler(croppedWebpFile)
            } else {
                finalUrl = await scholarshipService.processAndUploadImage(croppedWebpFile, maxW, maxH)
            }

            onChange(finalUrl)
            setIsCropModalOpen(false)
            showToast('Image cropped, compressed to WebP and saved!', 'success')
        } catch (err: any) {
            console.error('Image crop & upload error:', err)
            showToast(`Upload failed: ${err.message || 'Unknown error'}`, 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    // Default friendly instruction based on aspect ratio
    const computedInstruction =
        instruction ||
        (Math.abs(aspectRatio - 1) < 0.05
            ? 'Square Portrait / DP (1:1). Position face centered.'
            : Math.abs(aspectRatio - 16 / 9) < 0.05
            ? 'Event & Examination (16:9). Frame the stage / students.'
            : Math.abs(aspectRatio - 1920 / 700) < 0.1
            ? 'Hero Panoramic Banner (16:6). Align the headline visual.'
            : 'Frame the image to fit the container cleanly.')

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <IconSparkles size={11} />
                        Auto WebP Crop
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2.5">
                {/* 1. ROUNDED RECTANGULAR DP PREVIEW ON THE LEFT */}
                <div className="relative group flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (value) {
                                setPreviewZoomModal(true)
                            } else {
                                fileInputRef.current?.click()
                            }
                        }}
                        title={value ? 'Click to preview enlarged photo' : 'Click to select and crop photo'}
                        className="relative w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/40 hover:border-indigo-600 dark:hover:border-indigo-400 overflow-hidden shadow-sm transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                        {value ? (
                            <img
                                src={value}
                                alt="DP Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                    // Fallback on broken URL
                                    ;(e.target as HTMLElement).style.display = 'none'
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <IconCamera size={18} className="group-hover:text-indigo-500 transition-colors" />
                                <span className="text-[8px] font-bold tracking-tighter mt-0.5 uppercase">DP</span>
                            </div>
                        )}

                        {/* Processing overlay spinner */}
                        {isProcessing && (
                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-10">
                                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Hover overlay hint */}
                        {!isProcessing && (
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-10">
                                {value ? <IconEye size={16} /> : <IconCrop size={16} />}
                            </div>
                        )}
                    </button>

                    {/* Quick recrop button badge if image already set */}
                    {value && !isProcessing && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                fileInputRef.current?.click()
                            }}
                            title="Crop new photo"
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 cursor-pointer"
                        >
                            <IconCrop size={10} />
                        </button>
                    )}
                </div>

                {/* 2. UPLOAD PHOTO BUTTON */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex-shrink-0 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 flex items-center gap-2 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50 cursor-pointer"
                >
                    <IconUpload size={14} className={isProcessing ? 'animate-bounce' : ''} />
                    <span>{isProcessing ? 'Optimizing...' : uploadButtonText}</span>
                </button>

                {/* 3. URL INPUT FIELD */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            title="Clear image URL"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        >
                            <IconX size={14} />
                        </button>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Subtitle helper */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-0.5">
                <span>{computedInstruction}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Any dimension accepted</span>
            </div>

            {/* Cropping Modal Dialog */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                imageSrc={rawImageSrc}
                aspectRatio={aspectRatio}
                cropShape={cropShape}
                title={`Crop Image (${computedInstruction.split('(')[0].trim()})`}
                instruction={computedInstruction}
                isProcessing={isProcessing}
                onConfirm={handleCropConfirm}
                onCancel={() => setIsCropModalOpen(false)}
            />

            {/* Modal for Zooming / Previewing DP Fullsize */}
            {previewZoomModal && value && (
                <div
                    className="fixed inset-0 z-[1250] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setPreviewZoomModal(false)}
                >
                    <div
                        className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                            <span className="text-xs font-semibold text-slate-300">Image Preview</span>
                            <button
                                type="button"
                                onClick={() => setPreviewZoomModal(false)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg"
                            >
                                <IconX size={18} />
                            </button>
                        </div>
                        <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                            <img src={value} alt="Preview enlarged" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewZoomModal(false)
                                    fileInputRef.current?.click()
                                }}
                                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                            >
                                <IconCrop size={14} />
                                Change / Crop New Photo
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{value}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
