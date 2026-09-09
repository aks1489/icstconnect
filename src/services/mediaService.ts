import { supabase } from '../lib/supabase'

export interface SiteMediaItem {
    id: string
    key: string
    title: string
    description?: string
    cloudinary_url: string
    public_id?: string
    alt_text: string
    placement: string
    theme?: 'light' | 'dark' | 'all'
    is_active: boolean
    sort_order?: number
    created_at?: string
    updated_at?: string
}

// Built-in resilient fallbacks so missing Supabase rows or offline state never breaks UI
export const MEDIA_FALLBACKS: Record<string, SiteMediaItem> = {
    'home.hero.background': {
        id: 'fallback-hero-bg',
        key: 'home.hero.background',
        title: 'ICST Main Campus Hero',
        cloudinary_url: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop',
        alt_text: 'ICST Institutional Academic Campus',
        placement: 'home_hero',
        is_active: true
    },
    'home.scholarship.banner': {
        id: 'fallback-scholarship-banner',
        key: 'home.scholarship.banner',
        title: 'Annual Merit Scholarship Banner',
        cloudinary_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop',
        alt_text: 'Students participating in ICST Scholarship Programs',
        placement: 'scholarship_page',
        is_active: true
    },
    'login.background': {
        id: 'fallback-login-bg',
        key: 'login.background',
        title: 'Authentication Backdrop',
        cloudinary_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920&auto=format&fit=crop',
        alt_text: 'Modern tech laboratory with workstations',
        placement: 'auth_portal',
        is_active: true
    }
}

export const mediaService = {
    /**
     * Fetch all active media items or return local fallback map
     */
    async getAllMedia(): Promise<Record<string, SiteMediaItem>> {
        const mediaMap: Record<string, SiteMediaItem> = { ...MEDIA_FALLBACKS }

        try {
            const { data, error } = await supabase
                .from('site_media')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (!error && data) {
                data.forEach((item: SiteMediaItem) => {
                    mediaMap[item.key] = item
                })
            }
        } catch (err) {
            console.warn('Could not fetch site media from database, utilizing local fallbacks:', err)
        }

        return mediaMap
    },

    /**
     * Get a specific media item by semantic key with guaranteed fallback
     */
    async getMediaByKey(key: string): Promise<SiteMediaItem | null> {
        try {
            const { data, error } = await supabase
                .from('site_media')
                .select('*')
                .eq('key', key)
                .eq('is_active', true)
                .single()

            if (!error && data) {
                return data as SiteMediaItem
            }
        } catch (err) {
            // Fallback gracefully
        }

        return MEDIA_FALLBACKS[key] || null
    },

    /**
     * Upsert a media asset entry (Admin only)
     */
    async saveMedia(item: Partial<SiteMediaItem>): Promise<SiteMediaItem | null> {
        const { data, error } = await supabase
            .from('site_media')
            .upsert({
                ...item,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data as SiteMediaItem
    }
}
