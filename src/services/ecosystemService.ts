import { supabase } from '../lib/supabase'

export interface EcosystemSite {
    id: string
    name: string
    code: string
    url: string
    description?: string
    category: 'student_tool' | 'faculty_tool' | 'public_portal'
    is_active: boolean
    display_order: number
    icon_name?: string
    badge?: string
    created_at?: string
    updated_at?: string
}

export const DEFAULT_ECOSYSTEM_SITES: EcosystemSite[] = [
    {
        id: 'eco-job-sim',
        name: 'ICST Job Portal Simulator',
        code: 'job_portal_simulator',
        url: 'https://icst-job-portal-simulator.netlify.app/',
        description: 'Interactive employment and tech hiring assessment simulator designed for ICST students.',
        category: 'student_tool',
        is_active: true,
        display_order: 1,
        icon_name: 'IconBriefcase',
        badge: 'Recommended'
    }
]

export const ecosystemService = {
    async getSites(): Promise<EcosystemSite[]> {
        try {
            const { data, error } = await supabase
                .from('ecosystem_sites')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })

            if (!error && data && data.length > 0) {
                return data as EcosystemSite[]
            }
        } catch (err) {
            console.warn('Failed to load ecosystem sites from Supabase, using defaults:', err)
        }

        return DEFAULT_ECOSYSTEM_SITES
    },

    async getAllSitesForAdmin(): Promise<EcosystemSite[]> {
        try {
            const { data, error } = await supabase
                .from('ecosystem_sites')
                .select('*')
                .order('display_order', { ascending: true })

            if (!error && data) {
                return data as EcosystemSite[]
            }
        } catch (err) {
            console.warn('Failed to load all ecosystem sites:', err)
        }

        return DEFAULT_ECOSYSTEM_SITES
    },

    async saveSite(site: Partial<EcosystemSite>): Promise<EcosystemSite | null> {
        const { data, error } = await supabase
            .from('ecosystem_sites')
            .upsert({
                ...site,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data as EcosystemSite
    },

    async deleteSite(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('ecosystem_sites')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
