/**
 * Utility functions for generative avatars and profile images.
 * Provides high-quality generative avatar styles (Adventurer, Personas, Lorelei, Bottts, Fun Emoji).
 */

export interface AvatarStyleOption {
    id: string
    name: string
    description: string
    category: 'illustrated' | 'persona' | 'artistic' | 'robot' | 'emoji'
}

export const AVATAR_STYLES: AvatarStyleOption[] = [
    {
        id: 'adventurer',
        name: 'Adventurer',
        description: 'Vibrant, expressive illustrated characters with fantasy & modern flair',
        category: 'illustrated'
    },
    {
        id: 'personas',
        name: 'Minimalist Persona',
        description: 'Clean, modern Notion-style character silhouettes',
        category: 'persona'
    },
    {
        id: 'lorelei',
        name: 'Artistic Lorelei',
        description: 'Sleek anime-inspired digital portrait illustrations',
        category: 'artistic'
    },
    {
        id: 'bottts',
        name: 'Cyber Bottts',
        description: 'Playful futuristic cyborgs and robot companions',
        category: 'robot'
    },
    {
        id: 'fun-emoji',
        name: '3D Modern Emoji',
        description: 'Expressive and colorful 3D dimensional avatars',
        category: 'emoji'
    },
    {
        id: 'avataaars',
        name: 'Classic Illustrated',
        description: 'Customizable cartoon style with varied hairstyles and glasses',
        category: 'persona'
    }
]

const BG_PALETTES = [
    'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    'd1fae5,c7d2fe,fbcfe8,fed7aa',
    'e0e7ff,fae8ff,fce7f3,ede9fe',
    'fef3c7,fde68a,ffedd5,fed7aa',
    'ccfbf1,e0e7ff,f5d0fe,ffe4e6'
]

const CURATED_SEEDS = [
    'NovaSpark', 'AriaCloud', 'PhoenixAce', 'EchoStar', 'ZenithSky',
    'AtlasWave', 'KiraPixel', 'OrionLight', 'LyraBloom', 'VortexMax',
    'SolsticeDawn', 'CosmoRider', 'HyperDrive', 'AeroPulse', 'LunarFrost',
    'RadiantSage', 'CyberPulse', 'QuantumGlow', 'BlazeSpirit', 'MysticPath'
]

/**
 * Constructs a DiceBear SVG URL for a specific style and seed.
 */
export const buildDicebearUrl = (
    style: string = 'adventurer',
    seed: string = 'student',
    paletteIndex: number = 0
): string => {
    const palette = BG_PALETTES[paletteIndex % BG_PALETTES.length]
    const cleanSeed = encodeURIComponent(seed.trim() || 'student')
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}&backgroundColor=${palette}&radius=50`
}

/**
 * Generates a deterministic default avatar URL based on a user's name or ID.
 */
export const getDefaultAvatar = (nameOrId?: string, style: string = 'adventurer'): string => {
    const seed = (nameOrId && nameOrId.trim()) || 'ICST-Student'
    return buildDicebearUrl(style, seed, 0)
}

/**
 * Returns the active avatar URL if present; otherwise returns a deterministic generated avatar.
 */
export const getEffectiveAvatarUrl = (
    avatarUrl?: string | null,
    nameOrId?: string,
    fallbackStyle: string = 'adventurer'
): string => {
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
        return avatarUrl.trim()
    }
    return getDefaultAvatar(nameOrId, fallbackStyle)
}

/**
 * Generates an array of randomized avatar options for the Avatar Studio.
 */
export const generateRandomAvatarSet = (style?: string, count: number = 8): { id: string; url: string; style: string; seed: string }[] => {
    const shuffledSeeds = [...CURATED_SEEDS]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)

    // Add unique random entropy so repeated rolls generate unique avatars
    const randomEntropy = Math.floor(Math.random() * 9000 + 1000)

    return shuffledSeeds.map((seed, index) => {
        const chosenStyle = style && style !== 'all' 
            ? style 
            : AVATAR_STYLES[index % AVATAR_STYLES.length].id
        const uniqueSeed = `${seed}-${randomEntropy}`
        return {
            id: `${chosenStyle}-${uniqueSeed}`,
            url: buildDicebearUrl(chosenStyle, uniqueSeed, index),
            style: chosenStyle,
            seed: uniqueSeed
        }
    })
}
