import { useState, useEffect } from 'react'
import { getEffectiveAvatarUrl } from '../../utils/avatarUtils'
import { IconCamera as Camera } from '@tabler/icons-react'

export interface UserAvatarProps {
    src?: string | null
    name?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shape?: 'circle' | 'rounded-rect'
    className?: string
    onClick?: () => void
    editable?: boolean
    showStatus?: boolean
    statusColor?: string
    alt?: string
}

const SIZE_CLASSES = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl'
}

const BADGE_SIZE_CLASSES = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
}

export default function UserAvatar({
    src,
    name,
    size = 'md',
    shape = 'circle',
    className = '',
    onClick,
    editable = false,
    showStatus = false,
    statusColor = 'bg-emerald-500',
    alt
}: UserAvatarProps) {
    const effectiveUrl = getEffectiveAvatarUrl(src, name)
    const [imageSrc, setImageSrc] = useState<string>(effectiveUrl)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        setImageSrc(getEffectiveAvatarUrl(src, name))
        setHasError(false)
    }, [src, name])

    const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
    const badgeSize = BADGE_SIZE_CLASSES[size] || BADGE_SIZE_CLASSES.md

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true)
            // Fallback to simpler seed
            setImageSrc(getEffectiveAvatarUrl(null, name || 'Student'))
        }
    }

    const firstChar = (name && name.trim().charAt(0).toUpperCase()) || 'S'

    return (
        <div
            onClick={onClick}
            className={`relative inline-block flex-shrink-0 ${onClick ? 'cursor-pointer select-none group' : ''} ${className}`}
        >
            <div
                className={`
                    ${sizeClass} ${shapeClass} overflow-hidden
                    bg-gradient-to-tr from-indigo-100 via-indigo-50 to-violet-100
                    dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800
                    border-2 border-white dark:border-slate-800 shadow-sm
                    flex items-center justify-center transition-all duration-300
                    ${onClick ? 'group-hover:ring-4 group-hover:ring-indigo-500/20 group-hover:border-indigo-400 group-hover:scale-[1.02]' : ''}
                `}
            >
                {!hasError && imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={alt || name || 'User Avatar'}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-300 tracking-wider">
                        {firstChar}
                    </span>
                )}
            </div>

            {/* Editable Camera Overlay */}
            {editable && (
                <div
                    className={`
                        absolute inset-0 ${shapeClass} bg-black/40 text-white
                        opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                    `}
                    title="Change Avatar"
                >
                    <Camera size={size === 'xl' || size === '2xl' ? 24 : 16} />
                </div>
            )}

            {/* Live Status Indicator */}
            {showStatus && (
                <span
                    className={`
                        absolute bottom-0 right-0 ${badgeSize} rounded-full ${statusColor}
                        ring-2 ring-white dark:ring-slate-900 shadow-xs
                    `}
                />
            )}
        </div>
    )
}
