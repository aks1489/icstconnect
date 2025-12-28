import {
    Code, Database, Globe, Cpu, Palette, Calculator,
    BookOpen, Beaker, Music, Camera, Briefcase, Award
} from 'lucide-react'

// Default Icon
export const DefaultIcon = BookOpen

export const ICON_MAP = {
    'code': Code,
    'database': Database,
    'web': Globe,
    'hardware': Cpu,
    'design': Palette,
    'math': Calculator,
    'science': Beaker,
    'music': Music,
    'photo': Camera,
    'business': Briefcase,
    'award': Award
}

export const getIcon = (iconName: string | undefined) => {
    if (!iconName) return DefaultIcon
    return ICON_MAP[iconName as keyof typeof ICON_MAP] || DefaultIcon
}
