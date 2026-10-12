import { IconCode as Code, IconDatabase as Database, IconWorld as Globe, IconCpu as Cpu, IconPalette as Palette, IconCalculator as Calculator, IconBook2 as BookOpen, IconFlask as Beaker, IconMusic as Music, IconCamera as Camera, IconBriefcase as Briefcase, IconAward as Award } from '@tabler/icons-react'

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
