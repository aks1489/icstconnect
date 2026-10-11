import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'

export interface SiteMediaItem {
    id: string
    key: string
    title: string
    group: string
    description?: string
    cloudinary_url: string
    public_id?: string
    alt_text: string
    placement: string
    aspect_ratio: number
    aspect_label: string
    recommended_width?: number
    recommended_height?: number
    theme?: 'light' | 'dark' | 'all'
    is_active: boolean
    sort_order?: number
    is_custom?: boolean
    created_at?: string
    updated_at?: string
}

export const MEDIA_GROUPS = [
    'About Section',
    'Campus Gallery',
    'Hero Section',
    'Learning Hub',
    'Scholarship Banner',
    'Online Assessment'
] as const

export type MediaGroupName = (typeof MEDIA_GROUPS)[number]

export interface GroupConfig {
    name: MediaGroupName
    title: string
    subtitle: string
    description: string
    aspect_label: string
    aspect_ratio: number
    recommended_dims: string
    keys: string[]
}

export const GROUP_CONFIGS: GroupConfig[] = [
    {
        name: 'About Section',
        title: 'About Us Section',
        subtitle: 'Classroom & Laboratory Feature',
        description: "Featured showcase image for the 'Empowering the Next Generation of Tech Leaders' section on the homepage. Highlight modern computer laboratories, students, or faculty mentorship.",
        aspect_label: '3:2 Landscape',
        aspect_ratio: 3 / 2,
        recommended_dims: '870 x 580 px',
        keys: ['home.about.feature']
    },
    {
        name: 'Campus Gallery',
        title: 'Campus Life & Labs Gallery',
        subtitle: '6 Curated Photo Chronicles',
        description: "Photo chronicle cards displayed in the 'Life at ICST Chowberia' gallery section on the homepage. Highlights student collaborations, hands-on programming labs, and workshops.",
        aspect_label: '4:3 Standard',
        aspect_ratio: 4 / 3,
        recommended_dims: '580 x 435 px',
        keys: [
            'home.gallery.1',
            'home.gallery.2',
            'home.gallery.3',
            'home.gallery.4',
            'home.gallery.5',
            'home.gallery.6'
        ]
    },
    {
        name: 'Hero Section',
        title: 'Hero & Header Section',
        subtitle: 'Top Technology Showcase Banner',
        description: 'Visual artwork and promotional highlight graphics featured in the top Hero header area of the homepage.',
        aspect_label: '16:9 Widescreen',
        aspect_ratio: 16 / 9,
        recommended_dims: '1200 x 675 px',
        keys: ['home.hero.featured']
    },
    {
        name: 'Learning Hub',
        title: 'Learning Hub & Mini-Games',
        subtitle: 'Interactive Arcade & Gamified Learning Art',
        description: "Visual artwork for PC building, virus fighting, and keyboard challenges displayed in the 'Master Computers The Fun Way' interactive preview.",
        aspect_label: '1:1 Square',
        aspect_ratio: 1,
        recommended_dims: '800 x 800 px',
        keys: ['home.learninghub.preview']
    },
    {
        name: 'Scholarship Banner',
        title: 'ICST Scholarship Program',
        subtitle: 'Annual Merit Scholarship Promotion',
        description: 'Promotional visual banner for the annual talent search scholarship examination. Automatically synchronized with the active scholarship database ledger.',
        aspect_label: '16:9 Widescreen',
        aspect_ratio: 16 / 9,
        recommended_dims: '1920 x 1080 px',
        keys: ['home.scholarship.banner']
    },
    {
        name: 'Online Assessment',
        title: 'Skills Certification & Test CTA',
        subtitle: 'Practice Assessment Call-to-Action',
        description: "Feature graphic and backdrop visual for the 'Ready to Test Your Skills?' assessment call-to-action banner.",
        aspect_label: '16:9 Widescreen',
        aspect_ratio: 16 / 9,
        recommended_dims: '1920 x 1080 px',
        keys: ['home.test.cta']
    }
]

// Built-in resilient fallbacks so missing Supabase rows or offline state never breaks UI
export const MEDIA_FALLBACKS: Record<string, SiteMediaItem> = {
    'home.about.feature': {
        id: 'fallback-about-feature',
        key: 'home.about.feature',
        group: 'About Section',
        title: 'Modern Computer Lab Classroom',
        description: "Featured classroom image in the 'Empowering the Next Generation of Tech Leaders' section.",
        cloudinary_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt_text: 'ICST Chowberia modern computer lab classroom with students learning programming',
        placement: 'home_about',
        aspect_ratio: 3 / 2,
        aspect_label: '3:2 Landscape (Classroom Lab)',
        recommended_width: 870,
        recommended_height: 580,
        theme: 'all',
        is_active: true,
        sort_order: 1
    },

    'home.gallery.1': {
        id: 'fallback-gallery-1',
        key: 'home.gallery.1',
        group: 'Campus Gallery',
        title: 'Campus Life: Software Development Seminar',
        description: 'Students collaborating during computer science software development seminar.',
        cloudinary_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt_text: 'ICST students collaborating during computer science software development seminar',
        placement: 'home_gallery_1',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #1)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 10
    },
    'home.gallery.2': {
        id: 'fallback-gallery-2',
        key: 'home.gallery.2',
        group: 'Campus Gallery',
        title: 'Campus Life: Interactive IT Discussion',
        description: 'Interactive IT classroom discussion and programming project review at ICST Chowberia.',
        cloudinary_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt_text: 'Interactive IT classroom discussion and programming project review at ICST Chowberia',
        placement: 'home_gallery_2',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #2)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 11
    },
    'home.gallery.3': {
        id: 'fallback-gallery-3',
        key: 'home.gallery.3',
        group: 'Campus Gallery',
        title: 'Campus Life: Practical Laboratory Teamwork',
        description: 'Students learning teamwork and practical coding skills in technical laboratory.',
        cloudinary_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80',
        alt_text: 'Students learning teamwork and practical coding skills in technical laboratory',
        placement: 'home_gallery_3',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #3)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 12
    },
    'home.gallery.4': {
        id: 'fallback-gallery-4',
        key: 'home.gallery.4',
        group: 'Campus Gallery',
        title: 'Campus Life: Coding Mentorship Session',
        description: 'Student coding mentor presenting algorithms and problem solving session.',
        cloudinary_url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80',
        alt_text: 'Student coding mentor presenting algorithms and problem solving session',
        placement: 'home_gallery_4',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #4)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 13
    },
    'home.gallery.5': {
        id: 'fallback-gallery-5',
        key: 'home.gallery.5',
        group: 'Campus Gallery',
        title: 'Campus Life: Frameworks Workshop',
        description: 'ICST campus workshop event on modern digital frameworks and career guidance.',
        cloudinary_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt_text: 'ICST campus workshop event on modern digital frameworks and career guidance',
        placement: 'home_gallery_5',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #5)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 14
    },
    'home.gallery.6': {
        id: 'fallback-gallery-6',
        key: 'home.gallery.6',
        group: 'Campus Gallery',
        title: 'Campus Life: Computer Engineering Instructions',
        description: 'Faculty member delivering hands-on computer engineering instructions.',
        cloudinary_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt_text: 'Faculty member delivering hands-on computer engineering instructions',
        placement: 'home_gallery_6',
        aspect_ratio: 4 / 3,
        aspect_label: '4:3 Standard (Gallery Highlight #6)',
        recommended_width: 580,
        recommended_height: 435,
        theme: 'all',
        is_active: true,
        sort_order: 15
    },

    'home.hero.featured': {
        id: 'fallback-hero-featured',
        key: 'home.hero.featured',
        group: 'Hero Section',
        title: 'Hero Technology Graphic / Banner',
        description: 'Visual artwork or promotional showcase banner featured in the top Hero section.',
        cloudinary_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
        alt_text: 'Master Modern Technologies at ICST Chowberia',
        placement: 'home_hero_featured',
        aspect_ratio: 16 / 9,
        aspect_label: '16:9 Widescreen (Hero Feature)',
        recommended_width: 1200,
        recommended_height: 675,
        theme: 'all',
        is_active: true,
        sort_order: 2
    },

    'home.learninghub.preview': {
        id: 'fallback-learninghub-preview',
        key: 'home.learninghub.preview',
        group: 'Learning Hub',
        title: 'Learning Hub Gamification Showcase',
        description: 'Interactive gaming showcase graphic for PC building and typing challenges.',
        cloudinary_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Interactive gamified computer learning hub at ICST Chowberia',
        placement: 'home_learninghub',
        aspect_ratio: 1,
        aspect_label: '1:1 Square (Mini-Game Art)',
        recommended_width: 800,
        recommended_height: 800,
        theme: 'all',
        is_active: true,
        sort_order: 20
    },

    'home.scholarship.banner': {
        id: 'fallback-scholarship-banner',
        key: 'home.scholarship.banner',
        group: 'Scholarship Banner',
        title: 'Annual Merit Scholarship Banner',
        description: 'Banner visual for the annual talent search scholarship examination.',
        cloudinary_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop',
        alt_text: 'Students participating in ICST Scholarship Programs',
        placement: 'home_scholarship',
        aspect_ratio: 16 / 9,
        aspect_label: '16:9 Widescreen (Scholarship Banner)',
        recommended_width: 1920,
        recommended_height: 1080,
        theme: 'all',
        is_active: true,
        sort_order: 30
    },

    'home.test.cta': {
        id: 'fallback-test-cta',
        key: 'home.test.cta',
        group: 'Online Assessment',
        title: 'Skills Certification & Test Assessment Banner',
        description: "Visual banner for the 'Ready to Test Your Skills?' assessment call-to-action.",
        cloudinary_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1920&auto=format&fit=crop',
        alt_text: 'Students taking online certification tests and technical exams',
        placement: 'home_test',
        aspect_ratio: 16 / 9,
        aspect_label: '16:9 Widescreen (Assessment Banner)',
        recommended_width: 1920,
        recommended_height: 1080,
        theme: 'all',
        is_active: true,
        sort_order: 40
    }
}

const CACHE_STORAGE_KEY = 'icst_site_media_cache_v3'
const MEDIA_EVENT_KEY = 'icst_media_changed_event'

export const mediaService = {
    /**
     * Read local storage cache safely
     */
    getLocalCache(): Record<string, SiteMediaItem> {
        try {
            const raw = localStorage.getItem(CACHE_STORAGE_KEY)
            if (raw) {
                const parsed = JSON.parse(raw)
                return { ...MEDIA_FALLBACKS, ...parsed }
            }
        } catch (e) {
            console.warn('[mediaService] Failed to parse local media cache:', e)
        }
        return { ...MEDIA_FALLBACKS }
    },

    /**
     * Save local storage cache & notify listeners
     */
    saveLocalCache(items: Record<string, SiteMediaItem>): void {
        try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(items))
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent(MEDIA_EVENT_KEY, { detail: items }))
            }
        } catch (e) {
            console.warn('[mediaService] Failed to save local media cache:', e)
        }
    },

    /**
     * Synchronously get a media item from cache or fallback for instant zero-CLS render
     */
    getCachedMediaByKey(key: string): SiteMediaItem {
        const cache = this.getLocalCache()
        return cache[key] || MEDIA_FALLBACKS[key]
    },

    /**
     * Synchronously get all media items in a group
     */
    getCachedMediaByGroup(group: string): Record<string, SiteMediaItem> {
        const cache = this.getLocalCache()
        const result: Record<string, SiteMediaItem> = {}
        Object.entries(cache).forEach(([k, item]) => {
            if (item.group === group) {
                result[k] = item
            }
        })
        return result
    },

    /**
     * Fetch all media items with dual Supabase synchronization:
     * 1. Check site_media table
     * 2. Check gallery_images table (event_name: 'homepage_media')
     * 3. Check scholarship_settings table for scholarship banner
     */
    async getAllMedia(): Promise<Record<string, SiteMediaItem>> {
        const mediaMap: Record<string, SiteMediaItem> = this.getLocalCache()

        // Track whether we successfully loaded from database
        let dbLoaded = false

        // Attempt 1: Check site_media table
        try {
            const { data, error } = await supabase
                .from('site_media')
                .select('*')
                .order('sort_order', { ascending: true })

            if (!error && data && data.length > 0) {
                data.forEach((row: any) => {
                    const fallback = MEDIA_FALLBACKS[row.key]
                    if (fallback) {
                        mediaMap[row.key] = {
                            ...fallback,
                            id: row.id || fallback.id,
                            title: row.title || fallback.title,
                            cloudinary_url: row.cloudinary_url,
                            public_id: row.public_id,
                            alt_text: row.alt_text || fallback.alt_text,
                            description: row.description || fallback.description,
                            is_custom: true,
                            updated_at: row.updated_at
                        }
                    }
                })
                dbLoaded = true
            }
        } catch (err) {
            // site_media not in schema
        }

        // Attempt 2: Synchronize with gallery_images (event_name = 'homepage_media')
        try {
            const { data: galleryHomeData, error: gError } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('event_name', 'homepage_media')

            if (!gError && galleryHomeData && galleryHomeData.length > 0) {
                galleryHomeData.forEach((row: any) => {
                    const key = row.title
                    const fallback = MEDIA_FALLBACKS[key]
                    if (fallback && row.cloudinary_url) {
                        let parsedMeta: any = {}
                        try {
                            if (row.description && row.description.startsWith('{')) {
                                parsedMeta = JSON.parse(row.description)
                            }
                        } catch (e) {
                            // Raw text
                        }

                        mediaMap[key] = {
                            ...fallback,
                            id: row.id,
                            title: parsedMeta.title || fallback.title,
                            alt_text: parsedMeta.alt_text || fallback.alt_text,
                            description: parsedMeta.description || fallback.description,
                            cloudinary_url: row.cloudinary_url,
                            public_id: row.cloudinary_public_id,
                            is_custom: true,
                            updated_at: row.created_at
                        }
                    }
                })
                dbLoaded = true
            }
        } catch (err) {
            console.warn('[mediaService] Could not sync with gallery_images:', err)
        }

        // Attempt 3: Check scholarship_settings for scholarship banner
        try {
            const { data: sData, error: sError } = await supabase
                .from('scholarship_settings')
                .select('banner_image, updated_at')
                .limit(1)
                .maybeSingle()

            if (!sError && sData?.banner_image) {
                const sKey = 'home.scholarship.banner'
                const fallback = MEDIA_FALLBACKS[sKey]
                if (fallback) {
                    mediaMap[sKey] = {
                        ...fallback,
                        cloudinary_url: sData.banner_image,
                        is_custom: true,
                        updated_at: sData.updated_at
                    }
                }
                dbLoaded = true
            }
        } catch (err) {
            // Scholarship settings fallback
        }

        if (dbLoaded) {
            this.saveLocalCache(mediaMap)
        }

        return mediaMap
    },

    /**
     * Get a specific media item by key
     */
    async getMediaByKey(key: string): Promise<SiteMediaItem> {
        const all = await this.getAllMedia()
        return all[key] || this.getCachedMediaByKey(key)
    },

    /**
     * Get all media items for a specific group
     */
    async getMediaByGroup(group: string): Promise<Record<string, SiteMediaItem>> {
        const all = await this.getAllMedia()
        const result: Record<string, SiteMediaItem> = {}
        Object.entries(all).forEach(([k, item]) => {
            if (item.group === group) {
                result[k] = item
            }
        })
        return result
    },

    /**
     * Fetch existing pictures in the Supabase gallery_images table so admin can pick them
     */
    async getDatabaseGalleryImages(): Promise<Array<{ id: string; url: string; title: string | null }>> {
        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('id, cloudinary_url, title')
                .order('created_at', { ascending: false })
                .limit(40)

            if (!error && data) {
                return data.map((d: any) => ({
                    id: d.id,
                    url: d.cloudinary_url,
                    title: d.title
                }))
            }
        } catch (err) {
            console.warn('[mediaService] Could not fetch gallery photos:', err)
        }
        return []
    },

    /**
     * Upsert a media item (Admin access)
     * Fully syncs with Supabase database (site_media, gallery_images, scholarship_settings)
     */
    async saveMedia(item: Partial<SiteMediaItem> & { key: string }): Promise<SiteMediaItem> {
        const fallback = MEDIA_FALLBACKS[item.key]
        const existing = this.getCachedMediaByKey(item.key)

        const updatedItem: SiteMediaItem = {
            id: existing?.id || fallback?.id || `media-${Date.now()}`,
            key: item.key,
            title: item.title || existing?.title || fallback?.title || item.key,
            group: item.group || existing?.group || fallback?.group || 'About Section',
            description: item.description ?? existing?.description ?? fallback?.description,
            cloudinary_url: item.cloudinary_url || existing?.cloudinary_url || fallback?.cloudinary_url || '',
            public_id: item.public_id || existing?.public_id,
            alt_text: item.alt_text || existing?.alt_text || fallback?.alt_text || 'ICST Chowberia',
            placement: item.placement || existing?.placement || fallback?.placement || item.key,
            aspect_ratio: item.aspect_ratio || existing?.aspect_ratio || fallback?.aspect_ratio || 16 / 9,
            aspect_label: item.aspect_label || existing?.aspect_label || fallback?.aspect_label || 'Default',
            recommended_width: fallback?.recommended_width,
            recommended_height: fallback?.recommended_height,
            theme: item.theme || existing?.theme || 'all',
            is_active: item.is_active ?? existing?.is_active ?? true,
            is_custom: true,
            sort_order: item.sort_order ?? existing?.sort_order ?? fallback?.sort_order ?? 0,
            updated_at: new Date().toISOString()
        }

        // 1. Immediately persist to localStorage for instant UI reactivity
        const cache = this.getLocalCache()
        cache[item.key] = updatedItem
        this.saveLocalCache(cache)

        // 2. Synchronize to Supabase scholarship_settings if key is scholarship banner
        if (updatedItem.key === 'home.scholarship.banner') {
            try {
                const { data: sRecord } = await supabase
                    .from('scholarship_settings')
                    .select('id')
                    .limit(1)
                    .maybeSingle()

                if (sRecord?.id) {
                    await supabase
                        .from('scholarship_settings')
                        .update({
                            banner_image: updatedItem.cloudinary_url,
                            updated_at: updatedItem.updated_at
                        })
                        .eq('id', sRecord.id)
                }
            } catch (sErr) {
                console.warn('[mediaService] Could not sync scholarship banner in scholarship_settings:', sErr)
            }
        }

        // 3. Try primary site_media table in Supabase
        try {
            await supabase.from('site_media').upsert(
                {
                    key: updatedItem.key,
                    title: updatedItem.title,
                    description: updatedItem.description,
                    cloudinary_url: updatedItem.cloudinary_url,
                    public_id: updatedItem.public_id,
                    alt_text: updatedItem.alt_text,
                    placement: updatedItem.placement,
                    theme: updatedItem.theme,
                    is_active: updatedItem.is_active,
                    sort_order: updatedItem.sort_order,
                    updated_at: updatedItem.updated_at
                },
                { onConflict: 'key' }
            )
        } catch (err) {
            // site_media table missing
        }

        // 4. Save to gallery_images table in Supabase with event_name: 'homepage_media'
        try {
            const metaDescription = JSON.stringify({
                title: updatedItem.title,
                alt_text: updatedItem.alt_text,
                group: updatedItem.group,
                description: updatedItem.description,
                aspect_ratio: updatedItem.aspect_ratio
            })

            const { data: existingGRow } = await supabase
                .from('gallery_images')
                .select('id')
                .eq('event_name', 'homepage_media')
                .eq('title', updatedItem.key)
                .maybeSingle()

            if (existingGRow?.id) {
                await supabase
                    .from('gallery_images')
                    .update({
                        cloudinary_url: updatedItem.cloudinary_url,
                        cloudinary_public_id: updatedItem.public_id || null,
                        description: metaDescription,
                        group_cover: true,
                        tags: [{ key: updatedItem.key, group: updatedItem.group }]
                    })
                    .eq('id', existingGRow.id)
            } else {
                await supabase
                    .from('gallery_images')
                    .insert({
                        event_name: 'homepage_media',
                        title: updatedItem.key,
                        cloudinary_url: updatedItem.cloudinary_url,
                        cloudinary_public_id: updatedItem.public_id || null,
                        description: metaDescription,
                        group_cover: true,
                        categories: [],
                        tags: [{ key: updatedItem.key, group: updatedItem.group }]
                    })
            }
        } catch (gErr) {
            console.warn('[mediaService] Supabase gallery_images sync notice:', gErr)
        }

        return updatedItem
    },

    /**
     * Reset a media item back to original fallback default
     */
    async resetMedia(key: string): Promise<SiteMediaItem> {
        const fallback = MEDIA_FALLBACKS[key]
        if (!fallback) {
            throw new Error(`No default fallback found for key: ${key}`)
        }

        const cache = this.getLocalCache()
        cache[key] = { ...fallback, is_custom: false, updated_at: new Date().toISOString() }
        this.saveLocalCache(cache)

        // Clean up from database
        try {
            await supabase.from('site_media').delete().eq('key', key)
        } catch (err) {
            // Ignore
        }

        try {
            await supabase
                .from('gallery_images')
                .delete()
                .eq('event_name', 'homepage_media')
                .eq('title', key)
        } catch (err) {
            // Ignore
        }

        if (key === 'home.scholarship.banner') {
            try {
                const { data: sRecord } = await supabase
                    .from('scholarship_settings')
                    .select('id')
                    .limit(1)
                    .maybeSingle()

                if (sRecord?.id) {
                    await supabase
                        .from('scholarship_settings')
                        .update({ banner_image: fallback.cloudinary_url })
                        .eq('id', sRecord.id)
                }
            } catch (err) {
                // Ignore
            }
        }

        return cache[key]
    },

    /**
     * Subscribe to live media changes across tabs & components
     */
    onMediaChange(callback: (items: Record<string, SiteMediaItem>) => void): () => void {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<Record<string, SiteMediaItem>>
            if (customEvent.detail) {
                callback(customEvent.detail)
            } else {
                callback(this.getLocalCache())
            }
        }

        window.addEventListener(MEDIA_EVENT_KEY, handler)
        window.addEventListener('storage', handler)

        // Realtime channels
        let channelSM: any = null
        let channelGI: any = null
        try {
            channelSM = supabase
                .channel('public:site_media_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'site_media' }, () => {
                    this.getAllMedia().then((items) => callback(items))
                })
                .subscribe()

            channelGI = supabase
                .channel('public:gallery_images_home')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'gallery_images', filter: "event_name=eq.homepage_media" },
                    () => {
                        this.getAllMedia().then((items) => callback(items))
                    }
                )
                .subscribe()
        } catch (err) {
            // Channels fallback
        }

        return () => {
            window.removeEventListener(MEDIA_EVENT_KEY, handler)
            window.removeEventListener('storage', handler)
            if (channelSM) supabase.removeChannel(channelSM)
            if (channelGI) supabase.removeChannel(channelGI)
        }
    },

    /**
     * Process, compress to WebP, and upload image
     */
    async processAndUploadImage(file: File, maxW = 1920, maxH = 1200): Promise<string> {
        // Try Cloudinary upload first
        try {
            const cloudRes = await uploadToCloudinary(file)
            if (cloudRes && cloudRes.url) {
                return cloudRes.url
            }
        } catch (e) {
            console.warn('[mediaService] Cloudinary direct upload failed, compressing to client WebP:', e)
        }

        // Client-side fallback compressor
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    if (width > maxW) {
                        height = Math.round((height * maxW) / width)
                        width = maxW
                    }
                    if (height > maxH) {
                        width = Math.round((width * maxH) / height)
                        height = maxH
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true
                        ctx.imageSmoothingQuality = 'high'
                        ctx.drawImage(img, 0, 0, width, height)
                        const webpDataUrl = canvas.toDataURL('image/webp', 0.85)
                        resolve(webpDataUrl)
                    } else {
                        resolve(e.target?.result as string)
                    }
                }
                img.onerror = () => reject(new Error('Failed to process image file'))
                img.src = e.target?.result as string
            }
            reader.onerror = () => reject(new Error('Failed to read image file'))
            reader.readAsDataURL(file)
        })
    }
}
