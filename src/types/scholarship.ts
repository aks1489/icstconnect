export interface ScholarshipSettings {
    id?: string
    masterEnabled: boolean
    bannerEnabled: boolean
    bannerImage: string
    bannerRedirectEnabled: boolean
    bannerRedirectUrl: string
    resultEnabled: boolean
    resultUrl: string
    resultButtonText: string
    homepagePromotionEnabled: boolean
    navigationEnabled: boolean
    scholarshipPageEnabled: boolean
    winnersGalleryEnabled: boolean
    updatedAt?: string
}

export interface ScholarshipCampaign {
    id: string
    title: string
    year: number
    session: string
    description?: string
    status: 'active' | 'upcoming' | 'archived'
    createdAt?: string
}

export interface ScholarshipSchool {
    id: string
    name: string
    district: string
    address?: string
    logo?: string
    createdAt?: string
}

export interface ScholarshipSchoolParticipation {
    id: string
    scholarshipId: string
    schoolId: string
    announcementDate?: string | null // ISO Date string for when winners go live
    isAnnouncedOverride?: boolean
    createdAt?: string
    school?: ScholarshipSchool
    winnersCount?: number
}

export interface ScholarshipWinner {
    id: string
    scholarshipId?: string
    schoolId?: string
    year: number
    rank: number
    studentName: string
    schoolName: string
    district: string
    marks: string
    photo: string
    description?: string
    displayOrder: number
    published: boolean
    createdAt?: string
}

export interface ScholarshipExamImage {
    id: string
    scholarshipId?: string
    title: string
    schoolName: string
    session: string
    year: number
    image: string
    description?: string
    published: boolean
    createdAt?: string
}

export interface PendingScholarshipOperation {
    id: string
    type: 
        | 'SAVE_CAMPAIGN' 
        | 'DELETE_CAMPAIGN' 
        | 'SAVE_SCHOOL' 
        | 'DELETE_SCHOOL' 
        | 'SAVE_PARTICIPATION' 
        | 'DELETE_PARTICIPATION' 
        | 'SAVE_WINNER' 
        | 'DELETE_WINNER' 
        | 'SAVE_EXAM_IMAGE' 
        | 'DELETE_EXAM_IMAGE' 
        | 'UPDATE_SETTINGS'
    payload: any
    timestamp: string
    description: string
    error?: string
}

export interface ScholarshipSyncResult {
    syncedCount: number
    remainingCount: number
    errors: string[]
    details: string[]
}
