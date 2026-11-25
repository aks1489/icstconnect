import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { isAdminSubdomain } from '../utils/subdomain'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: ResolvedTheme
}

const THEME_STORAGE_KEY = 'icst_theme_preference'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY)
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            return saved
        }
        return 'system'
    })

    const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
    })

    // Listen to OS system color scheme changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemPreference(e.matches ? 'dark' : 'light')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const location = useLocation()
    const isHomePage = !isAdminSubdomain() && location.pathname === '/'

    const resolvedTheme: ResolvedTheme = useMemo(() => {
        if (isHomePage) {
            return 'light'
        }
        if (theme === 'system') {
            return systemPreference
        }
        return theme
    }, [isHomePage, theme, systemPreference])

    // Apply .dark/.light class to root element with smooth transition class
    useEffect(() => {
        const root = document.documentElement
        const currentThemeAttr = root.getAttribute('data-theme')

        // Skip transition flash when already aligned (e.g. initial load on home page)
        if (currentThemeAttr !== resolvedTheme) {
            root.classList.add('theme-transitioning')
        }

        if (resolvedTheme === 'dark') {
            root.classList.add('dark')
            root.classList.remove('light')
        } else {
            root.classList.add('light')
            root.classList.remove('dark')
        }
        root.setAttribute('data-theme', resolvedTheme)

        // Dynamically update mobile browser theme-color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0A192F' : '#FFFFFF')
        }

        const timer = setTimeout(() => {
            root.classList.remove('theme-transitioning')
        }, 450)

        return () => clearTimeout(timer)
    }, [resolvedTheme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }

    const value = useMemo(() => ({
        theme,
        setTheme,
        resolvedTheme
    }), [theme, resolvedTheme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
