import { useState, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import {
    IconCrop,
    IconZoomIn,
    IconZoomOut,
    IconRotateClockwise,
    IconCheck,
    IconX,
    IconInfoCircle,
    IconSparkles
} from '@tabler/icons-react'
import type { PixelCrop } from '../../utils/imageCropUtils'

export interface ImageCropModalProps {
    isOpen: boolean
    imageSrc: string
    aspectRatio?: number
    cropShape?: 'rect' | 'round'
    title?: string
    instruction?: string
    isProcessing?: boolean
    onConfirm: (croppedAreaPixels: PixelCrop) => void
    onCancel: () => void
}

export default function ImageCropModal({
    isOpen,
    imageSrc,
    aspectRatio = 1,
    cropShape = 'rect',
    title = 'Crop & Frame Image',
    instruction = 'Drag and pinch/zoom to frame your image to the required dimensions.',
    isProcessing = false,
    onConfirm,
    onCancel
}: ImageCropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null)

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleApply = () => {
        if (!croppedAreaPixels) return
        onConfirm(croppedAreaPixels)
    }

    if (!isOpen) return null

    // Determine readable aspect label
    const aspectLabel =
        Math.abs(aspectRatio - 1) < 0.05
            ? '1:1 Square (DP / Portrait)'
            : Math.abs(aspectRatio - 16 / 9) < 0.05
            ? '16:9 Widescreen (Hall & Event)'
            : Math.abs(aspectRatio - 1920 / 700) < 0.1
            ? '16:6 Panoramic (Hero Banner)'
            : `${aspectRatio.toFixed(2)}:1 Ratio`

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <IconCrop size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                    <IconSparkles size={11} />
                                    Target: {aspectLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Instruction banner */}
                <div className="px-5 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                    <IconInfoCircle size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>
                        <strong>Required Framing:</strong> {instruction} User can upload any dimensions; pan or zoom to align cleanly before uploading.
                    </span>
                </div>

                {/* Cropper Viewport */}
                <div className="relative w-full h-80 sm:h-96 bg-slate-950 overflow-hidden select-none">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        cropShape={cropShape}
                        showGrid={true}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Toolbar Controls */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Zoom Out"
                        >
                            <IconZoomOut size={18} />
                        </button>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <button
                            type="button"
                            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Zoom In"
                        >
                            <IconZoomIn size={18} />
                        </button>

                        <span className="text-xs font-mono font-medium text-slate-500 min-w-[42px] text-right">
                            {Math.round(zoom * 100)}%
                        </span>

                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                        <button
                            type="button"
                            onClick={() => setRotation(prev => (prev + 90) % 360)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs"
                            title="Rotate 90°"
                        >
                            <IconRotateClockwise size={16} />
                            <span className="text-[11px] font-medium hidden sm:inline">Rotate</span>
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={isProcessing || !croppedAreaPixels}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Compressing to WebP & Uploading...</span>
                            </>
                        ) : (
                            <>
                                <IconCheck size={16} />
                                <span>Crop, Compress & Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
