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

export interface ScholarshipWinner {
    id: string
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
    title: string
    schoolName: string
    session: string
    year: number
    image: string
    description?: string
    published: boolean
    createdAt?: string
}
