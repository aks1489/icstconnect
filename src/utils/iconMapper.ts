import {
    Atom, Box, FileCode2, Wind, FileCode, Database, Server, Triangle,
    BookOpen, LayoutDashboard, Calendar, Building2, Laptop,
    Users, TrendingUp, CalendarCheck, Shield, Book, Trophy, Star,
    Globe, Calculator, Router, AppWindow, Award, Code,
    Bell, Info, CheckCircle, AlertTriangle, Megaphone, Zap
} from 'lucide-react'

export const getIcon = (iconName: string) => {
    // Icon mapping for specific tech/course icons
    const iconMap: Record<string, any> = {
        // Tech Icons
        'bi-filetype-jsx': Atom,
        'bi-bootstrap-fill': Box,
        'bi-filetype-js': FileCode2,
        'bi-wind': Wind,
        'bi-filetype-tsx': FileCode,
        'bi-database-fill': Database,
        'bi-server': Server,
        'bi-triangle-fill': Triangle,

        // Common UI Icons
        'bi-grid-fill': LayoutDashboard,
        'bi-calendar-event-fill': Calendar,
        'bi-building-fill': Building2,
        'bi-laptop': Laptop,
        'bi-people-fill': Users,
        'bi-graph-up-arrow': TrendingUp,
        'bi-book-fill': BookOpen,
        'bi-calendar-check-fill': CalendarCheck,
        'bi-shield-lock-fill': Shield,
        'bi-trophy-fill': Trophy,
        'bi-star-fill': Star,
        'bi-book': Book,
        'bi-filetype-py': FileCode,
        'bi-filetype-java': FileCode,
        'bi-database': Database,
        'bi-globe': Globe,
        'bi-c-circle': Code,
        'bi-microsoft': AppWindow,
        'bi-calculator': Calculator,
        'bi-router': Router,

        'bi-award': Award,
        'bi-code-square': Code,
        'bi-bell-fill': Bell,
        'bi-info-circle-fill': Info,
        'bi-check-circle-fill': CheckCircle,
        'bi-exclamation-triangle-fill': AlertTriangle,
        'bi-megaphone-fill': Megaphone,
        'bi-lightning-fill': Zap,
    }

    return iconMap[iconName] || BookOpen // Default fallback
}
