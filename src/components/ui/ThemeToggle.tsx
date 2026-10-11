import React, { useState } from 'react'
import { flushSync } from 'react-dom'
import { useTheme, type Theme } from '../../contexts/ThemeContext'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'

export interface ThemeToggleProps {
    className?: string
    showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [isRotating, setIsRotating] = useState(false)

    const cycleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        let nextTheme: Theme = 'light'
        if (theme === 'light') nextTheme = 'dark'
        else if (theme === 'dark') nextTheme = 'system'
        else nextTheme = 'light'

        // Trigger button icon micro-animation
        setIsRotating(true)
        setTimeout(() => setIsRotating(false), 450)

        // Native View Transitions API circular sweep (hardware-accelerated, lightweight)
        const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (!document.startViewTransition || isReducedMotion) {
            setTheme(nextTheme)
            return
        }

        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setTheme(nextTheme)
            })
        })

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 450,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            )
        })
    }

    const getIcon = () => {
        if (theme === 'system') {
            return (
                <span className={`inline-flex transition-transform duration-500 ${isRotating ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}>
                    <IconDeviceDesktop size={18} className="text-sky-500" />
                </span>
            )
        }
        if (resolvedTheme === 'dark') {
            return (
                <span className={`inline-flex transition-transform duration-500 ${isRotating ? '-rotate-90 scale-110' : '-rotate-12 group-hover:rotate-0 group-hover:scale-110'}`}>
                    <IconMoon size={18} className="text-indigo-400" />
                </span>
            )
        }
        return (
            <span className={`inline-flex transition-transform duration-500 ${isRotating ? 'rotate-180 scale-110' : 'rotate-0 group-hover:rotate-45 group-hover:scale-110'}`}>
                <IconSun size={18} className="text-amber-500" />
            </span>
        )
    }

    const getLabel = () => {
        if (theme === 'system') return 'System Theme'
        if (theme === 'dark') return 'Dark Theme'
        return 'Light Theme'
    }

    return (
        <button
            type="button"
            onClick={cycleTheme}
            className={`group inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 backdrop-blur-md transition-all shadow-sm active:scale-95 hover:shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 ${className}`}
            title={`Current: ${getLabel()} (Click to toggle)`}
            aria-label={`Toggle Theme: currently ${getLabel()}`}
        >
            {getIcon()}
            {showLabel && <span className="text-xs font-medium">{getLabel()}</span>}
        </button>
    )
}

export default ThemeToggle
