import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'

export interface ThemeToggleProps {
    className?: string
    showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, setTheme, resolvedTheme } = useTheme()

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    const getIcon = () => {
        if (theme === 'system') return <IconDeviceDesktop size={18} className="text-sky-500 transition-transform hover:scale-110" />
        if (resolvedTheme === 'dark') return <IconMoon size={18} className="text-indigo-400 transition-transform hover:scale-110" />
        return <IconSun size={18} className="text-amber-500 transition-transform hover:scale-110" />
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
            className={`inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 backdrop-blur-md transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500 ${className}`}
            title={`Current: ${getLabel()} (Click to toggle)`}
            aria-label={`Toggle Theme: currently ${getLabel()}`}
        >
            {getIcon()}
            {showLabel && <span className="text-xs font-medium">{getLabel()}</span>}
        </button>
    )
}

export default ThemeToggle
