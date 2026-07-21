import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import type { ScholarshipSettings, ScholarshipWinner, ScholarshipExamImage } from '../types/scholarship'

const SETTINGS_STORAGE_KEY = 'icst_scholarship_settings'
const WINNERS_STORAGE_KEY = 'icst_scholarship_winners'
const EXAM_IMAGES_STORAGE_KEY = 'icst_scholarship_exam_images'

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

export const INITIAL_WINNERS: ScholarshipWinner[] = [
    {
        id: 'w-2026-1',
        year: 2026,
        rank: 1,
        studentName: 'Subhadip Roy',
        schoolName: 'Chowberia High School',
        district: 'Nadia',
        marks: '98.8%',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        description: 'Secured 1st rank in ICST Merit Exam 2026 with exemplary performance in Mathematics and Computer Science.',
        displayOrder: 1,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2026-2',
        year: 2026,
        rank: 2,
        studentName: 'Priya Biswas',
        schoolName: 'Ranaghat Girls High School',
        district: 'Nadia',
        marks: '97.4%',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        description: 'Outstanding achievement in science stream and computer applications.',
        displayOrder: 2,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2026-3',
        year: 2026,
        rank: 3,
        studentName: 'Ankit Mondal',
        schoolName: 'Chakdaha Ramlal Academy',
        district: 'Nadia',
        marks: '96.2%',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        description: 'Achieved 3rd position in ICST Talent Search Scholarship.',
        displayOrder: 3,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2026-4',
        year: 2026,
        rank: 4,
        studentName: 'Sneha Sarkar',
        schoolName: 'Kalyani Shiksha Niketan',
        district: 'Nadia',
        marks: '95.5%',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        description: 'Top performer in web design module.',
        displayOrder: 4,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2026-5',
        year: 2026,
        rank: 5,
        studentName: 'Rahul Debnath',
        schoolName: 'Bongaon High School',
        district: 'North 24 Parganas',
        marks: '94.8%',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        description: 'Excellent score in hardware & programming.',
        displayOrder: 5,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2025-1',
        year: 2025,
        rank: 1,
        studentName: 'Rohan Ghosh',
        schoolName: 'Habra High School',
        district: 'North 24 Parganas',
        marks: '98.2%',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        description: 'ICST Scholarship Gold Medalist 2025.',
        displayOrder: 1,
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'w-2025-2',
        year: 2025,
        rank: 2,
        studentName: 'Moumitha Paul',
        schoolName: 'Krishnanagar Collegiate School',
        district: 'Nadia',
        marks: '96.9%',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
        description: 'Silver Medalist in ICST Merit Exam 2025.',
        displayOrder: 2,
        published: true,
        createdAt: new Date().toISOString()
    }
]

export const INITIAL_EXAM_IMAGES: ScholarshipExamImage[] = [
    {
        id: 'exam-2026-1',
        title: 'ICST Talent Search Exam 2026 - Main Center',
        schoolName: 'Chowberia High School',
        session: '2026-2027 Session',
        year: 2026,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        description: 'Students writing the online talent search examination in computer science and mathematics.',
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'exam-2026-2',
        title: 'Practical Computer Aptitude Test',
        schoolName: 'Ranaghat High School',
        session: '2026-2027 Session',
        year: 2026,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        description: 'Hands-on practical examination session for senior batch candidates.',
        published: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'exam-2025-1',
        title: 'Merit Scholarship Award Ceremony',
        schoolName: 'Chakdaha Ramlal Academy',
        session: '2025-2026 Session',
        year: 2025,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        description: 'Annual scholarship award ceremony recognizing top district rankers.',
        published: true,
        createdAt: new Date().toISOString()
    }
]

export const scholarshipService = {
    // ----------------------------------------------------
    // SETTINGS
    // ----------------------------------------------------
    async getSettings(): Promise<ScholarshipSettings> {
        try {
            const { data, error } = await supabase
                .from('scholarship_settings')
                .select('*')
                .single()

            if (data && !error) {
                let bannerUrl = data.banner_redirect_url ?? data.bannerRedirectUrl ?? 'https://icst-isms.netlify.app/'
                let resUrl = data.result_url ?? data.resultUrl ?? 'https://icst-isms.netlify.app/'

                // Migrate legacy URLs if DB holds old default values
                if (!bannerUrl || bannerUrl === '/scholarships') {
                    bannerUrl = 'https://icst-isms.netlify.app/'
                }
                if (!resUrl || resUrl === 'https://icstconnect.com/results/scholarship-2026') {
                    resUrl = 'https://icst-isms.netlify.app/'
                }

                const settings: ScholarshipSettings = {
                    id: data.id,
                    masterEnabled: data.master_enabled ?? data.masterEnabled ?? true,
                    bannerEnabled: data.banner_enabled ?? data.bannerEnabled ?? true,
                    bannerImage: data.banner_image ?? data.bannerImage ?? DEFAULT_SCHOLARSHIP_SETTINGS.bannerImage,
                    bannerRedirectEnabled: data.banner_redirect_enabled ?? data.bannerRedirectEnabled ?? true,
                    bannerRedirectUrl: bannerUrl,
                    resultEnabled: data.result_enabled ?? data.resultEnabled ?? true,
                    resultUrl: resUrl,
                    resultButtonText: data.result_button_text ?? data.resultButtonText ?? 'View Scholarship Result',
                    homepagePromotionEnabled: data.homepage_promotion_enabled ?? data.homepagePromotionEnabled ?? true,
                    navigationEnabled: data.navigation_enabled ?? data.navigationEnabled ?? true,
                    scholarshipPageEnabled: data.scholarship_page_enabled ?? data.scholarshipPageEnabled ?? true,
                    winnersGalleryEnabled: data.winners_gallery_enabled ?? data.winnersGalleryEnabled ?? true,
                    updatedAt: data.updated_at || data.updatedAt
                }

                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
                return settings
            }
        } catch (e) {
            console.warn('Supabase fetch failed for scholarship_settings, using fallback.', e)
        }

        // Fallback to LocalStorage
        const local = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (local) {
            try {
                const parsed = JSON.parse(local)
                if (!parsed.resultUrl || parsed.resultUrl === 'https://icstconnect.com/results/scholarship-2026') {
                    parsed.resultUrl = 'https://icst-isms.netlify.app/'
                }
                if (!parsed.bannerRedirectUrl || parsed.bannerRedirectUrl === '/scholarships') {
                    parsed.bannerRedirectUrl = 'https://icst-isms.netlify.app/'
                }
                return parsed
            } catch (err) {
                console.error('Failed to parse local scholarship settings', err)
            }
        }

        // Initialize LocalStorage with default
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SCHOLARSHIP_SETTINGS))
        return DEFAULT_SCHOLARSHIP_SETTINGS
    },

    async updateSettings(settings: Partial<ScholarshipSettings>): Promise<ScholarshipSettings> {
        const current = await this.getSettings()
        const updated: ScholarshipSettings = {
            ...current,
            ...settings,
            updatedAt: new Date().toISOString()
        }

        // Save to LocalStorage immediately
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))

        // Broadcast real-time update event to all listening components
        window.dispatchEvent(new CustomEvent('icst_scholarship_settings_updated', { detail: updated }))

        // Attempt Supabase sync
        try {
            const payload = {
                master_enabled: updated.masterEnabled,
                banner_enabled: updated.bannerEnabled,
                banner_image: updated.bannerImage,
                banner_redirect_enabled: updated.bannerRedirectEnabled,
                banner_redirect_url: updated.bannerRedirectUrl,
                result_enabled: updated.resultEnabled,
                result_url: updated.resultUrl,
                result_button_text: updated.resultButtonText,
                homepage_promotion_enabled: updated.homepagePromotionEnabled,
                navigation_enabled: updated.navigationEnabled,
                scholarship_page_enabled: updated.scholarshipPageEnabled,
                winners_gallery_enabled: updated.winnersGalleryEnabled,
                updated_at: updated.updatedAt
            }

            if (current.id) {
                await supabase.from('scholarship_settings').update(payload).eq('id', current.id)
            } else {
                const { data } = await supabase.from('scholarship_settings').insert([payload]).select().single()
                if (data) updated.id = data.id
            }
        } catch (e) {
            console.warn('Supabase update failed for scholarship_settings', e)
        }

        return updated
    },

    onSettingsChange(callback: (settings: ScholarshipSettings) => void): () => void {
        const handleCustomEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail) callback(detail)
        }

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
                try {
                    callback(JSON.parse(e.newValue))
                } catch (err) {
                    console.error(err)
                }
            }
        }

        window.addEventListener('icst_scholarship_settings_updated', handleCustomEvent)
        window.addEventListener('storage', handleStorageEvent)

        return () => {
            window.removeEventListener('icst_scholarship_settings_updated', handleCustomEvent)
            window.removeEventListener('storage', handleStorageEvent)
        }
    },

    // ----------------------------------------------------
    // WINNERS
    // ----------------------------------------------------
    async getWinners(): Promise<ScholarshipWinner[]> {
        try {
            const { data, error } = await supabase
                .from('scholarship_winners')
                .select('*')
                .order('year', { ascending: false })
                .order('rank', { ascending: true })

            if (data && !error && data.length > 0) {
                return data.map((item: any) => ({
                    id: item.id,
                    year: item.year,
                    rank: item.rank,
                    studentName: item.student_name || item.studentName,
                    schoolName: item.school_name || item.schoolName,
                    district: item.district,
                    marks: item.marks,
                    photo: item.photo,
                    description: item.description,
                    displayOrder: item.display_order || item.displayOrder || item.rank,
                    published: item.published ?? true,
                    createdAt: item.created_at || item.createdAt
                }))
            }
        } catch (e) {
            console.warn('Supabase fetch failed for scholarship_winners, using fallback.', e)
        }

        // LocalStorage fallback
        const local = localStorage.getItem(WINNERS_STORAGE_KEY)
        if (local) {
            try {
                return JSON.parse(local)
            } catch (err) {
                console.error('Failed to parse local winners', err)
            }
        }

        localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(INITIAL_WINNERS))
        return INITIAL_WINNERS
    },

    async saveWinner(winner: Omit<ScholarshipWinner, 'id'> & { id?: string }): Promise<ScholarshipWinner> {
        const winners = await this.getWinners()
        const id = winner.id || `w-${winner.year}-${Date.now()}`
        const newWinner: ScholarshipWinner = {
            ...winner,
            id,
            createdAt: winner.createdAt || new Date().toISOString()
        }

        let updatedList: ScholarshipWinner[]
        const index = winners.findIndex(w => w.id === id)
        if (index >= 0) {
            updatedList = [...winners]
            updatedList[index] = newWinner
        } else {
            updatedList = [newWinner, ...winners]
        }

        // Sort by year desc, rank asc
        updatedList.sort((a, b) => b.year - a.year || a.rank - b.rank)
        localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(updatedList))

        // Sync with Supabase if table exists
        try {
            const dbPayload = {
                id,
                year: newWinner.year,
                rank: newWinner.rank,
                student_name: newWinner.studentName,
                school_name: newWinner.schoolName,
                district: newWinner.district,
                marks: newWinner.marks,
                photo: newWinner.photo,
                description: newWinner.description,
                display_order: newWinner.displayOrder,
                published: newWinner.published
            }
            await supabase.from('scholarship_winners').upsert(dbPayload)
        } catch (e) {
            console.warn('Supabase upsert failed for winner', e)
        }

        return newWinner
    },

    async deleteWinner(id: string): Promise<void> {
        const winners = await this.getWinners()
        const updated = winners.filter(w => w.id !== id)
        localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(updated))

        try {
            await supabase.from('scholarship_winners').delete().eq('id', id)
        } catch (e) {
            console.warn('Supabase delete failed for winner', e)
        }
    },

    // ----------------------------------------------------
    // EXAM GALLERY IMAGES
    // ----------------------------------------------------
    async getExamImages(): Promise<ScholarshipExamImage[]> {
        try {
            const { data, error } = await supabase
                .from('scholarship_exam_images')
                .select('*')
                .order('year', { ascending: false })
                .order('created_at', { ascending: false })

            if (data && !error && data.length > 0) {
                return data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    schoolName: item.school_name || item.schoolName,
                    session: item.session,
                    year: item.year,
                    image: item.image,
                    description: item.description,
                    published: item.published ?? true,
                    createdAt: item.created_at || item.createdAt
                }))
            }
        } catch (e) {
            console.warn('Supabase fetch failed for scholarship_exam_images, using fallback.', e)
        }

        const local = localStorage.getItem(EXAM_IMAGES_STORAGE_KEY)
        if (local) {
            try {
                return JSON.parse(local)
            } catch (err) {
                console.error('Failed to parse local exam images', err)
            }
        }

        localStorage.setItem(EXAM_IMAGES_STORAGE_KEY, JSON.stringify(INITIAL_EXAM_IMAGES))
        return INITIAL_EXAM_IMAGES
    },

    async saveExamImage(item: Omit<ScholarshipExamImage, 'id'> & { id?: string }): Promise<ScholarshipExamImage> {
        const list = await this.getExamImages()
        const id = item.id || `exam-${item.year}-${Date.now()}`
        const newItem: ScholarshipExamImage = {
            ...item,
            id,
            createdAt: item.createdAt || new Date().toISOString()
        }

        let updatedList: ScholarshipExamImage[]
        const index = list.findIndex(e => e.id === id)
        if (index >= 0) {
            updatedList = [...list]
            updatedList[index] = newItem
        } else {
            updatedList = [newItem, ...list]
        }

        updatedList.sort((a, b) => b.year - a.year)
        localStorage.setItem(EXAM_IMAGES_STORAGE_KEY, JSON.stringify(updatedList))

        try {
            const dbPayload = {
                id,
                title: newItem.title,
                school_name: newItem.schoolName,
                session: newItem.session,
                year: newItem.year,
                image: newItem.image,
                description: newItem.description,
                published: newItem.published
            }
            await supabase.from('scholarship_exam_images').upsert(dbPayload)
        } catch (e) {
            console.warn('Supabase upsert failed for exam image', e)
        }

        return newItem
    },

    async deleteExamImage(id: string): Promise<void> {
        const list = await this.getExamImages()
        const updated = list.filter(e => e.id !== id)
        localStorage.setItem(EXAM_IMAGES_STORAGE_KEY, JSON.stringify(updated))

        try {
            await supabase.from('scholarship_exam_images').delete().eq('id', id)
        } catch (e) {
            console.warn('Supabase delete failed for exam image', e)
        }
    },

    // ----------------------------------------------------
    // IMAGE UPLOAD & OPTIMIZATION HELPER
    // ----------------------------------------------------
    async processAndUploadImage(file: File, maxW = 1920, maxH = 1080): Promise<string> {
        // 1. Check Cloudinary upload availability
        try {
            const cloudRes = await uploadToCloudinary(file)
            if (cloudRes && cloudRes.url) {
                return cloudRes.url
            }
        } catch (e) {
            console.warn('Cloudinary upload skipped or failed, using client-side WebP compressor.', e)
        }

        // 2. Client-side canvas compression to WebP / DataURL fallback
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
                        // Compress to webp with 0.85 quality
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
