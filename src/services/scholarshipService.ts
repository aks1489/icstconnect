import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import type {
    ScholarshipSettings,
    ScholarshipCampaign,
    ScholarshipSchool,
    ScholarshipSchoolParticipation,
    ScholarshipWinner,
    ScholarshipExamImage,
    PendingScholarshipOperation,
    ScholarshipSyncResult
} from '../types/scholarship'

export const DEFAULT_SCHOLARSHIP_SETTINGS: ScholarshipSettings = {
    masterEnabled: true,
    bannerEnabled: true,
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
    bannerRedirectEnabled: true,
    bannerRedirectUrl: 'https://icst-isms.netlify.app/',
    resultEnabled: true,
    resultUrl: 'https://icst-isms.netlify.app/',
    resultButtonText: 'View Scholarship Result',
    homepagePromotionEnabled: true,
    navigationEnabled: true,
    scholarshipPageEnabled: true,
    winnersGalleryEnabled: true,
    updatedAt: new Date().toISOString()
}

const PENDING_OPS_KEY = 'icst_scholarship_pending_operations'
const CACHE_CAMPAIGNS_KEY = 'icst_scholarship_cache_campaigns'
const CACHE_SCHOOLS_KEY = 'icst_scholarship_cache_schools'
const CACHE_PARTICIPATIONS_KEY = 'icst_scholarship_cache_participations'

export const scholarshipService = {
    // ----------------------------------------------------
    // PENDING LOCAL OPERATIONS QUEUE
    // ----------------------------------------------------
    getPendingOperations(): PendingScholarshipOperation[] {
        try {
            const raw = localStorage.getItem(PENDING_OPS_KEY)
            return raw ? JSON.parse(raw) : []
        } catch (e) {
            console.error('Failed to parse pending operations from localStorage:', e)
            return []
        }
    },

    getPendingCount(): number {
        return this.getPendingOperations().length
    },

    savePendingOperations(ops: PendingScholarshipOperation[]): void {
        localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(ops))
        window.dispatchEvent(new CustomEvent('icst_scholarship_pending_changed', { detail: ops }))
    },

    addPendingOperation(op: Omit<PendingScholarshipOperation, 'id' | 'timestamp'> & { id?: string }): void {
        const ops = this.getPendingOperations()
        const id = op.id || `pending-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        const newOp: PendingScholarshipOperation = {
            ...op,
            id,
            timestamp: new Date().toISOString()
        }

        const filtered = ops.filter(existing => existing.id !== id)
        filtered.push(newOp)
        this.savePendingOperations(filtered)
    },

    removePendingOperation(id: string): void {
        const ops = this.getPendingOperations().filter(op => op.id !== id)
        this.savePendingOperations(ops)
    },

    onPendingChange(callback: (pendingOps: PendingScholarshipOperation[]) => void): () => void {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail) callback(detail)
        }
        window.addEventListener('icst_scholarship_pending_changed', handler)
        return () => window.removeEventListener('icst_scholarship_pending_changed', handler)
    },

    // ----------------------------------------------------
    // REALTIME DATABASE SUBSCRIPTION
    // ----------------------------------------------------
    subscribeToChanges(onUpdate: () => void): () => void {
        const channel = supabase
            .channel('public:scholarship_realtime_all')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_settings' }, () => onUpdate())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_campaigns' }, () => onUpdate())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_schools' }, () => onUpdate())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_school_participations' }, () => onUpdate())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_winners' }, () => onUpdate())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'scholarship_exam_images' }, () => onUpdate())
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },

    // ----------------------------------------------------
    // SETTINGS (Direct Supabase)
    // ----------------------------------------------------
    async getSettings(): Promise<ScholarshipSettings> {
        try {
            const { data, error } = await supabase
                .from('scholarship_settings')
                .select('*')
                .limit(1)
                .maybeSingle()

            if (error) {
                console.error('[scholarshipService] Supabase getSettings error:', error)
                return DEFAULT_SCHOLARSHIP_SETTINGS
            }

            if (data) {
                let bannerUrl = data.banner_redirect_url || 'https://icst-isms.netlify.app/'
                let resUrl = data.result_url || 'https://icst-isms.netlify.app/'

                if (!bannerUrl || bannerUrl === '/scholarships') bannerUrl = 'https://icst-isms.netlify.app/'
                if (!resUrl || resUrl === 'https://icstconnect.com/results/scholarship-2026') resUrl = 'https://icst-isms.netlify.app/'

                return {
                    id: data.id,
                    masterEnabled: data.master_enabled ?? true,
                    bannerEnabled: data.banner_enabled ?? true,
                    bannerImage: data.banner_image || DEFAULT_SCHOLARSHIP_SETTINGS.bannerImage,
                    bannerRedirectEnabled: data.banner_redirect_enabled ?? true,
                    bannerRedirectUrl: bannerUrl,
                    resultEnabled: data.result_enabled ?? true,
                    resultUrl: resUrl,
                    resultButtonText: data.result_button_text || 'View Scholarship Result',
                    homepagePromotionEnabled: data.homepage_promotion_enabled ?? true,
                    navigationEnabled: data.navigation_enabled ?? true,
                    scholarshipPageEnabled: data.scholarship_page_enabled ?? true,
                    winnersGalleryEnabled: data.winners_gallery_enabled ?? true,
                    updatedAt: data.updated_at || new Date().toISOString()
                }
            }
        } catch (e) {
            console.error('[scholarshipService] Failed to fetch settings from Supabase:', e)
        }

        return DEFAULT_SCHOLARSHIP_SETTINGS
    },

    async updateSettings(settings: Partial<ScholarshipSettings>): Promise<ScholarshipSettings> {
        const current = await this.getSettings()
        const payload: any = {
            master_enabled: settings.masterEnabled ?? current.masterEnabled,
            banner_enabled: settings.bannerEnabled ?? current.bannerEnabled,
            banner_image: settings.bannerImage ?? current.bannerImage,
            banner_redirect_enabled: settings.bannerRedirectEnabled ?? current.bannerRedirectEnabled,
            banner_redirect_url: settings.bannerRedirectUrl ?? current.bannerRedirectUrl,
            result_enabled: settings.resultEnabled ?? current.resultEnabled,
            result_url: settings.resultUrl ?? current.resultUrl,
            result_button_text: settings.resultButtonText ?? current.resultButtonText,
            homepage_promotion_enabled: settings.homepagePromotionEnabled ?? current.homepagePromotionEnabled,
            navigation_enabled: settings.navigationEnabled ?? current.navigationEnabled,
            scholarship_page_enabled: settings.scholarshipPageEnabled ?? current.scholarshipPageEnabled,
            winners_gallery_enabled: settings.winnersGalleryEnabled ?? current.winnersGalleryEnabled,
            updated_at: new Date().toISOString()
        }

        try {
            let res
            if (current.id) {
                res = await supabase.from('scholarship_settings').update(payload).eq('id', current.id).select().single()
            } else {
                res = await supabase.from('scholarship_settings').insert([payload]).select().single()
            }

            if (res.error) throw res.error

            this.removePendingOperation('pending-settings')

            const updatedSettings: ScholarshipSettings = {
                id: res.data.id,
                masterEnabled: res.data.master_enabled,
                bannerEnabled: res.data.banner_enabled,
                bannerImage: res.data.banner_image,
                bannerRedirectEnabled: res.data.banner_redirect_enabled,
                bannerRedirectUrl: res.data.banner_redirect_url,
                resultEnabled: res.data.result_enabled,
                resultButtonText: res.data.result_button_text,
                resultUrl: res.data.result_url,
                homepagePromotionEnabled: res.data.homepage_promotion_enabled,
                navigationEnabled: res.data.navigation_enabled,
                scholarshipPageEnabled: res.data.scholarship_page_enabled,
                winnersGalleryEnabled: res.data.winners_gallery_enabled,
                updatedAt: res.data.updated_at
            }

            window.dispatchEvent(new CustomEvent('icst_scholarship_settings_updated', { detail: updatedSettings }))
            return updatedSettings
        } catch (err: any) {
            console.warn('[scholarshipService] Settings update failed on Supabase, queuing for sync:', err)
            this.addPendingOperation({
                id: 'pending-settings',
                type: 'UPDATE_SETTINGS',
                payload: { currentId: current.id, ...payload },
                description: 'Update scholarship system settings & banner'
            })
            throw new Error(`Settings saved locally (queued for Supabase sync): ${err.message}`)
        }
    },

    onSettingsChange(callback: (settings: ScholarshipSettings) => void): () => void {
        const handleCustomEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail) callback(detail)
        }
        window.addEventListener('icst_scholarship_settings_updated', handleCustomEvent)
        return () => window.removeEventListener('icst_scholarship_settings_updated', handleCustomEvent)
    },

    // ----------------------------------------------------
    // SCHOLARSHIP CAMPAIGNS (Create / Manage Years)
    // ----------------------------------------------------
    async getCampaigns(): Promise<ScholarshipCampaign[]> {
        try {
            const { data, error } = await supabase
                .from('scholarship_campaigns')
                .select('*')
                .order('year', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                const campaigns: ScholarshipCampaign[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    year: item.year,
                    session: item.session,
                    description: item.description || '',
                    status: item.status || 'active',
                    createdAt: item.created_at
                }))
                localStorage.setItem(CACHE_CAMPAIGNS_KEY, JSON.stringify(campaigns))
                return campaigns
            }
        } catch (e) {
            console.warn('[scholarshipService] getCampaigns from Supabase failed, checking local cache:', e)
        }

        try {
            const cached = localStorage.getItem(CACHE_CAMPAIGNS_KEY)
            if (cached) return JSON.parse(cached)
        } catch {}

        // Fallback default campaign if clean setup
        return []
    },

    async saveCampaign(campaign: Omit<ScholarshipCampaign, 'id'> & { id?: string }): Promise<ScholarshipCampaign> {
        const id = campaign.id || `camp-${campaign.year}-${Date.now().toString(36)}`
        const dbPayload = {
            id,
            title: campaign.title,
            year: campaign.year,
            session: campaign.session,
            description: campaign.description || '',
            status: campaign.status || 'active'
        }

        // Optimistically update local cache
        const current = await this.getCampaigns()
        const existingIdx = current.findIndex(c => c.id === id)
        const updatedItem: ScholarshipCampaign = { ...dbPayload, createdAt: new Date().toISOString() }
        const nextList = existingIdx >= 0 ? current.map(c => c.id === id ? updatedItem : c) : [updatedItem, ...current]
        localStorage.setItem(CACHE_CAMPAIGNS_KEY, JSON.stringify(nextList))

        try {
            const { data, error } = await supabase
                .from('scholarship_campaigns')
                .upsert(dbPayload)
                .select()
                .single()

            if (error) throw error
            this.removePendingOperation(`pending-camp-${id}`)
            return {
                id: data.id,
                title: data.title,
                year: data.year,
                session: data.session,
                description: data.description,
                status: data.status,
                createdAt: data.created_at
            }
        } catch (err: any) {
            console.warn('[scholarshipService] saveCampaign failed, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-camp-${id}`,
                type: 'SAVE_CAMPAIGN',
                payload: dbPayload,
                description: `Save Scholarship Campaign: ${campaign.title} (${campaign.year})`
            })
            return updatedItem
        }
    },

    async deleteCampaign(id: string): Promise<void> {
        const current = await this.getCampaigns()
        localStorage.setItem(CACHE_CAMPAIGNS_KEY, JSON.stringify(current.filter(c => c.id !== id)))

        try {
            const { error } = await supabase
                .from('scholarship_campaigns')
                .delete()
                .eq('id', id)

            if (error) throw error
            this.removePendingOperation(`pending-camp-${id}`)
            this.removePendingOperation(`pending-del-camp-${id}`)
        } catch (err: any) {
            console.warn('[scholarshipService] deleteCampaign failed, queuing delete:', err)
            this.addPendingOperation({
                id: `pending-del-camp-${id}`,
                type: 'DELETE_CAMPAIGN',
                payload: { id },
                description: `Delete Scholarship Campaign ID: ${id}`
            })
        }
    },

    // ----------------------------------------------------
    // REGISTERED SCHOOLS DIRECTORY (Reusable Across Years)
    // ----------------------------------------------------
    async getSchools(): Promise<ScholarshipSchool[]> {
        try {
            const { data, error } = await supabase
                .from('scholarship_schools')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            if (data && data.length > 0) {
                const schools: ScholarshipSchool[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    district: item.district,
                    address: item.address || '',
                    logo: item.logo || '',
                    createdAt: item.created_at
                }))
                localStorage.setItem(CACHE_SCHOOLS_KEY, JSON.stringify(schools))
                return schools
            }
        } catch (e) {
            console.warn('[scholarshipService] getSchools failed, checking cache:', e)
        }

        try {
            const cached = localStorage.getItem(CACHE_SCHOOLS_KEY)
            if (cached) return JSON.parse(cached)
        } catch {}

        return []
    },

    async saveSchool(school: Omit<ScholarshipSchool, 'id'> & { id?: string }): Promise<ScholarshipSchool> {
        const id = school.id || `sch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
        const dbPayload = {
            id,
            name: school.name,
            district: school.district,
            address: school.address || '',
            logo: school.logo || ''
        }

        const current = await this.getSchools()
        const existingIdx = current.findIndex(s => s.id === id)
        const updatedItem: ScholarshipSchool = { ...dbPayload, createdAt: new Date().toISOString() }
        const nextList = existingIdx >= 0 ? current.map(s => s.id === id ? updatedItem : s) : [...current, updatedItem]
        localStorage.setItem(CACHE_SCHOOLS_KEY, JSON.stringify(nextList))

        try {
            const { data, error } = await supabase
                .from('scholarship_schools')
                .upsert(dbPayload)
                .select()
                .single()

            if (error) throw error
            this.removePendingOperation(`pending-school-${id}`)
            return {
                id: data.id,
                name: data.name,
                district: data.district,
                address: data.address,
                logo: data.logo,
                createdAt: data.created_at
            }
        } catch (err: any) {
            console.warn('[scholarshipService] saveSchool failed, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-school-${id}`,
                type: 'SAVE_SCHOOL',
                payload: dbPayload,
                description: `Save Registered School: ${school.name}`
            })
            return updatedItem
        }
    },

    async deleteSchool(id: string): Promise<void> {
        const current = await this.getSchools()
        localStorage.setItem(CACHE_SCHOOLS_KEY, JSON.stringify(current.filter(s => s.id !== id)))

        try {
            const { error } = await supabase
                .from('scholarship_schools')
                .delete()
                .eq('id', id)

            if (error) throw error
            this.removePendingOperation(`pending-school-${id}`)
            this.removePendingOperation(`pending-del-school-${id}`)
        } catch (err: any) {
            console.warn('[scholarshipService] deleteSchool failed, queuing delete:', err)
            this.addPendingOperation({
                id: `pending-del-school-${id}`,
                type: 'DELETE_SCHOOL',
                payload: { id },
                description: `Delete Registered School ID: ${id}`
            })
        }
    },

    // ----------------------------------------------------
    // SCHOOL PARTICIPATIONS & ANNOUNCEMENT SCHEDULING
    // ----------------------------------------------------
    async getParticipations(scholarshipId?: string): Promise<ScholarshipSchoolParticipation[]> {
        try {
            let query = supabase
                .from('scholarship_school_participations')
                .select('*, school:scholarship_schools(*)')

            if (scholarshipId) {
                query = query.eq('scholarship_id', scholarshipId)
            }

            const { data, error } = await query

            if (error) throw error

            if (data && data.length > 0) {
                const participations: ScholarshipSchoolParticipation[] = data.map((item: any) => ({
                    id: item.id,
                    scholarshipId: item.scholarship_id,
                    schoolId: item.school_id,
                    announcementDate: item.announcement_date,
                    isAnnouncedOverride: item.is_announced_override ?? false,
                    createdAt: item.created_at,
                    school: item.school ? {
                        id: item.school.id,
                        name: item.school.name,
                        district: item.school.district,
                        address: item.school.address,
                        logo: item.school.logo,
                        createdAt: item.school.created_at
                    } : undefined
                }))
                localStorage.setItem(CACHE_PARTICIPATIONS_KEY, JSON.stringify(participations))
                return participations
            }
        } catch (e) {
            console.warn('[scholarshipService] getParticipations failed, checking cache:', e)
        }

        try {
            const cached = localStorage.getItem(CACHE_PARTICIPATIONS_KEY)
            if (cached) {
                const parsed: ScholarshipSchoolParticipation[] = JSON.parse(cached)
                return scholarshipId ? parsed.filter(p => p.scholarshipId === scholarshipId) : parsed
            }
        } catch {}

        return []
    },

    async saveParticipation(participation: Omit<ScholarshipSchoolParticipation, 'id'> & { id?: string }): Promise<ScholarshipSchoolParticipation> {
        const id = participation.id || `part-${participation.scholarshipId}-${participation.schoolId}`
        const dbPayload = {
            id,
            scholarship_id: participation.scholarshipId,
            school_id: participation.schoolId,
            announcement_date: participation.announcementDate || null,
            is_announced_override: participation.isAnnouncedOverride ?? false
        }

        const current = await this.getParticipations()
        const existingIdx = current.findIndex(p => p.id === id)
        const updatedItem: ScholarshipSchoolParticipation = {
            ...participation,
            id,
            createdAt: new Date().toISOString()
        }
        const nextList = existingIdx >= 0 ? current.map(p => p.id === id ? updatedItem : p) : [...current, updatedItem]
        localStorage.setItem(CACHE_PARTICIPATIONS_KEY, JSON.stringify(nextList))

        try {
            const { data, error } = await supabase
                .from('scholarship_school_participations')
                .upsert(dbPayload)
                .select()
                .single()

            if (error) throw error
            this.removePendingOperation(`pending-part-${id}`)
            return {
                id: data.id,
                scholarshipId: data.scholarship_id,
                schoolId: data.school_id,
                announcementDate: data.announcement_date,
                isAnnouncedOverride: data.is_announced_override,
                createdAt: data.created_at,
                school: participation.school
            }
        } catch (err: any) {
            console.warn('[scholarshipService] saveParticipation failed, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-part-${id}`,
                type: 'SAVE_PARTICIPATION',
                payload: dbPayload,
                description: `Update school participation schedule for school ${participation.schoolId}`
            })
            return updatedItem
        }
    },

    async deleteParticipation(id: string): Promise<void> {
        const current = await this.getParticipations()
        localStorage.setItem(CACHE_PARTICIPATIONS_KEY, JSON.stringify(current.filter(p => p.id !== id)))

        try {
            const { error } = await supabase
                .from('scholarship_school_participations')
                .delete()
                .eq('id', id)

            if (error) throw error
            this.removePendingOperation(`pending-part-${id}`)
            this.removePendingOperation(`pending-del-part-${id}`)
        } catch (err: any) {
            console.warn('[scholarshipService] deleteParticipation failed, queuing delete:', err)
            this.addPendingOperation({
                id: `pending-del-part-${id}`,
                type: 'DELETE_PARTICIPATION',
                payload: { id },
                description: `Remove school participation ID: ${id}`
            })
        }
    },

    // ----------------------------------------------------
    // WINNERS (Direct Supabase Only)
    // ----------------------------------------------------
    async getWinners(scholarshipId?: string, schoolId?: string, year?: number): Promise<ScholarshipWinner[]> {
        try {
            let query = supabase
                .from('scholarship_winners')
                .select('*')
                .order('year', { ascending: false })
                .order('rank', { ascending: true })

            if (scholarshipId && year) {
                query = query.or(`scholarship_id.eq.${scholarshipId},year.eq.${year}`)
            } else if (scholarshipId) {
                query = query.eq('scholarship_id', scholarshipId)
            } else if (year) {
                query = query.eq('year', year)
            }

            if (schoolId) {
                query = query.eq('school_id', schoolId)
            }

            const { data, error } = await query

            if (error) {
                console.error('[scholarshipService] Supabase getWinners error:', error)
                throw new Error(error.message || 'Failed to fetch scholarship winners from Supabase')
            }

            if (data) {
                return data.map((item: any) => ({
                    id: item.id,
                    scholarshipId: item.scholarship_id,
                    schoolId: item.school_id,
                    year: item.year,
                    rank: item.rank,
                    studentName: item.student_name || '',
                    schoolName: item.school_name || '',
                    district: item.district || '',
                    marks: item.marks || '',
                    photo: item.photo || '',
                    description: item.description || '',
                    displayOrder: item.display_order ?? item.rank,
                    published: item.published ?? true,
                    createdAt: item.created_at || new Date().toISOString()
                }))
            }

            return []
        } catch (e) {
            console.error('[scholarshipService] getWinners failed:', e)
            throw e
        }
    },

    async saveWinner(winner: Omit<ScholarshipWinner, 'id'> & { id?: string }): Promise<ScholarshipWinner> {
        const id = winner.id || `w-${winner.year}-${Date.now().toString(36)}`
        const dbPayload: any = {
            id,
            scholarship_id: winner.scholarshipId || null,
            school_id: winner.schoolId || null,
            year: winner.year,
            rank: winner.rank,
            student_name: winner.studentName,
            school_name: winner.schoolName,
            district: winner.district || '',
            marks: winner.marks,
            photo: winner.photo,
            description: winner.description || '',
            display_order: winner.displayOrder ?? winner.rank,
            published: winner.published ?? true
        }

        try {
            const { data, error } = await supabase
                .from('scholarship_winners')
                .upsert(dbPayload)
                .select()
                .single()

            if (error) throw error

            this.removePendingOperation(`pending-winner-${id}`)

            return {
                id: data.id,
                scholarshipId: data.scholarship_id,
                schoolId: data.school_id,
                year: data.year,
                rank: data.rank,
                studentName: data.student_name,
                schoolName: data.school_name,
                district: data.district,
                marks: data.marks,
                photo: data.photo,
                description: data.description,
                displayOrder: data.display_order,
                published: data.published,
                createdAt: data.created_at
            }
        } catch (err: any) {
            console.warn('[scholarshipService] saveWinner failed on Supabase, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-winner-${id}`,
                type: 'SAVE_WINNER',
                payload: dbPayload,
                description: `Save position holder: ${winner.studentName} (Rank #${winner.rank}, Year ${winner.year})`
            })
            throw new Error(`Winner record saved locally and queued for Supabase sync: ${err.message}`)
        }
    },

    async deleteWinner(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('scholarship_winners')
                .delete()
                .eq('id', id)

            if (error) throw error

            this.removePendingOperation(`pending-winner-${id}`)
            this.removePendingOperation(`pending-del-winner-${id}`)
        } catch (err: any) {
            console.warn('[scholarshipService] deleteWinner failed on Supabase, queuing delete operation:', err)
            this.addPendingOperation({
                id: `pending-del-winner-${id}`,
                type: 'DELETE_WINNER',
                payload: { id },
                description: `Delete winner ID: ${id}`
            })
            throw new Error(`Deletion queued locally for Supabase sync: ${err.message}`)
        }
    },

    // ----------------------------------------------------
    // EXAM GALLERY IMAGES (Direct Supabase Only)
    // ----------------------------------------------------
    async getExamImages(): Promise<ScholarshipExamImage[]> {
        try {
            const { data, error } = await supabase
                .from('scholarship_exam_images')
                .select('*')
                .order('year', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[scholarshipService] Supabase getExamImages error:', error)
                throw new Error(error.message || 'Failed to fetch exam images from Supabase')
            }

            if (data) {
                return data.map((item: any) => ({
                    id: item.id,
                    scholarshipId: item.scholarship_id,
                    title: item.title || '',
                    schoolName: item.school_name || '',
                    session: item.session || '',
                    year: item.year,
                    image: item.image || '',
                    description: item.description || '',
                    published: item.published ?? true,
                    createdAt: item.created_at || new Date().toISOString()
                }))
            }

            return []
        } catch (e) {
            console.error('[scholarshipService] getExamImages failed:', e)
            throw e
        }
    },

    async saveExamImage(item: Omit<ScholarshipExamImage, 'id'> & { id?: string }): Promise<ScholarshipExamImage> {
        const id = item.id || `exam-${item.year}-${Date.now()}`
        const dbPayload = {
            id,
            scholarship_id: item.scholarshipId || null,
            title: item.title,
            school_name: item.schoolName,
            session: item.session,
            year: item.year,
            image: item.image,
            description: item.description || '',
            published: item.published ?? true
        }

        try {
            const { data, error } = await supabase
                .from('scholarship_exam_images')
                .upsert(dbPayload)
                .select()
                .single()

            if (error) throw error

            this.removePendingOperation(`pending-exam-${id}`)

            return {
                id: data.id,
                scholarshipId: data.scholarship_id,
                title: data.title,
                schoolName: data.school_name,
                session: data.session,
                year: data.year,
                image: data.image,
                description: data.description,
                published: data.published,
                createdAt: data.created_at
            }
        } catch (err: any) {
            console.warn('[scholarshipService] saveExamImage failed on Supabase, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-exam-${id}`,
                type: 'SAVE_EXAM_IMAGE',
                payload: dbPayload,
                description: `Save exam moment photo: ${item.title} (${item.year})`
            })
            throw new Error(`Exam photo saved locally and queued for Supabase sync: ${err.message}`)
        }
    },

    async deleteExamImage(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('scholarship_exam_images')
                .delete()
                .eq('id', id)

            if (error) throw error

            this.removePendingOperation(`pending-exam-${id}`)
            this.removePendingOperation(`pending-del-exam-${id}`)
        } catch (err: any) {
            console.warn('[scholarshipService] deleteExamImage failed on Supabase, queuing operation:', err)
            this.addPendingOperation({
                id: `pending-del-exam-${id}`,
                type: 'DELETE_EXAM_IMAGE',
                payload: { id },
                description: `Delete exam photo ID: ${id}`
            })
            throw new Error(`Photo deletion queued locally for Supabase sync: ${err.message}`)
        }
    },

    // ----------------------------------------------------
    // PUBLICATION DATE & ANNOUNCEMENT EVALUATION
    // ----------------------------------------------------
    evaluatePublicationStatus(
        campaignTitle: string,
        schoolName: string,
        participation?: ScholarshipSchoolParticipation
    ): {
        isAnnounced: boolean
        displayText: string
        badgeType: 'announced' | 'scheduled' | 'pending'
        dateText?: string
        remainingMs?: number
    } {
        if (!participation) {
            return {
                isAnnounced: false,
                displayText: `🏆 ${campaignTitle} — Official results for ${schoolName} will be announced soon.`,
                badgeType: 'pending'
            }
        }

        if (participation.isAnnouncedOverride) {
            return {
                isAnnounced: true,
                displayText: `🏆 ${campaignTitle} — Official Winners & Position Holders for ${schoolName}`,
                badgeType: 'announced'
            }
        }

        if (!participation.announcementDate) {
            return {
                isAnnounced: false,
                displayText: `🏆 ${campaignTitle} — Results for ${schoolName} will be announced soon. Stay tuned!`,
                badgeType: 'pending'
            }
        }

        const scheduledTime = new Date(participation.announcementDate).getTime()
        const now = Date.now()
        const remainingMs = scheduledTime - now

        if (remainingMs <= 0) {
            return {
                isAnnounced: true,
                displayText: `🏆 ${campaignTitle} — Official Winners & Results for ${schoolName}`,
                badgeType: 'announced'
            }
        }

        // Formatted Date & Time string
        const formattedDate = new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(participation.announcementDate))

        return {
            isAnnounced: false,
            displayText: `🏆 ${campaignTitle} — Results for ${schoolName} will be announced on ${formattedDate}.`,
            badgeType: 'scheduled',
            dateText: formattedDate,
            remainingMs
        }
    },

    // ----------------------------------------------------
    // SYNC ALL PENDING LOCAL OPERATIONS TO SUPABASE
    // ----------------------------------------------------
    async syncPendingOperations(): Promise<ScholarshipSyncResult> {
        const pendingOps = this.getPendingOperations()
        const result: ScholarshipSyncResult = {
            syncedCount: 0,
            remainingCount: 0,
            errors: [],
            details: []
        }

        if (pendingOps.length === 0) {
            try {
                const { error } = await supabase.from('scholarship_settings').select('id').limit(1)
                if (error) throw error
                result.details.push('Database connection active. All scholarship records are completely up to date with Supabase.')
                return result
            } catch (err: any) {
                result.errors.push(`Supabase connection error: ${err.message}`)
                return result
            }
        }

        const remaining: PendingScholarshipOperation[] = []

        for (const op of pendingOps) {
            try {
                switch (op.type) {
                    case 'SAVE_CAMPAIGN': {
                        const { error } = await supabase.from('scholarship_campaigns').upsert(op.payload)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Synced Scholarship Campaign: ${op.payload.title}`)
                        break
                    }
                    case 'DELETE_CAMPAIGN': {
                        const { error } = await supabase.from('scholarship_campaigns').delete().eq('id', op.payload.id)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Deleted Scholarship Campaign ID: ${op.payload.id}`)
                        break
                    }
                    case 'SAVE_SCHOOL': {
                        const { error } = await supabase.from('scholarship_schools').upsert(op.payload)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Synced Registered School: ${op.payload.name}`)
                        break
                    }
                    case 'DELETE_SCHOOL': {
                        const { error } = await supabase.from('scholarship_schools').delete().eq('id', op.payload.id)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Deleted Registered School ID: ${op.payload.id}`)
                        break
                    }
                    case 'SAVE_PARTICIPATION': {
                        const { error } = await supabase.from('scholarship_school_participations').upsert(op.payload)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Synced School Participation Schedule ID: ${op.payload.id}`)
                        break
                    }
                    case 'DELETE_PARTICIPATION': {
                        const { error } = await supabase.from('scholarship_school_participations').delete().eq('id', op.payload.id)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Removed School Participation ID: ${op.payload.id}`)
                        break
                    }
                    case 'SAVE_WINNER': {
                        const { error } = await supabase.from('scholarship_winners').upsert(op.payload)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Synced Winner: ${op.payload.student_name} (Rank #${op.payload.rank}, ${op.payload.year})`)
                        break
                    }
                    case 'DELETE_WINNER': {
                        const { error } = await supabase.from('scholarship_winners').delete().eq('id', op.payload.id)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Deleted Winner ID: ${op.payload.id}`)
                        break
                    }
                    case 'SAVE_EXAM_IMAGE': {
                        const { error } = await supabase.from('scholarship_exam_images').upsert(op.payload)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Synced Exam Photo: ${op.payload.title}`)
                        break
                    }
                    case 'DELETE_EXAM_IMAGE': {
                        const { error } = await supabase.from('scholarship_exam_images').delete().eq('id', op.payload.id)
                        if (error) throw error
                        result.syncedCount++
                        result.details.push(`Deleted Exam Photo ID: ${op.payload.id}`)
                        break
                    }
                    case 'UPDATE_SETTINGS': {
                        const { currentId, ...cleanPayload } = op.payload
                        let sRes
                        if (currentId) {
                            sRes = await supabase.from('scholarship_settings').update(cleanPayload).eq('id', currentId)
                        } else {
                            sRes = await supabase.from('scholarship_settings').insert([cleanPayload])
                        }
                        if (sRes.error) throw sRes.error
                        result.syncedCount++
                        result.details.push('Synced Scholarship Settings & Banners')
                        break
                    }
                    default:
                        console.warn('Unknown pending operation type:', op)
                }
            } catch (err: any) {
                console.error(`Failed to sync pending operation [${op.id}]:`, err)
                result.errors.push(`${op.description}: ${err.message}`)
                remaining.push({ ...op, error: err.message })
            }
        }

        this.savePendingOperations(remaining)
        result.remainingCount = remaining.length
        return result
    },

    // ----------------------------------------------------
    // IMAGE UPLOAD & OPTIMIZATION HELPER
    // ----------------------------------------------------
    async processAndUploadImage(file: File, maxW = 1920, maxH = 1080): Promise<string> {
        try {
            const cloudRes = await uploadToCloudinary(file)
            if (cloudRes && cloudRes.url) {
                return cloudRes.url
            }
        } catch (e) {
            console.warn('Cloudinary upload skipped or failed, using client-side WebP compressor.', e)
        }

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
                        ctx.drawImage(img, 0, 0, width, height)
                        const webpDataUrl = canvas.toDataURL('image/webp', 0.85)
                        resolve(webpDataUrl)
                    } else {
                        resolve(e.target?.result as string)
                    }
                }
                img.onerror = () => reject(new Error('Failed to read image file'))
                img.src = e.target?.result as string
            }
            reader.onerror = () => reject(new Error('Failed to read image file'))
            reader.readAsDataURL(file)
        })
    }
}
