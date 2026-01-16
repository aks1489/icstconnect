export interface CourseFees {
    admission: number | null
    monthly: number | null
    total: number | null
}

export interface Course {
    id: number
    category: string
    course_name: string
    duration: string
    fees: CourseFees
    syllabus: string[]
    // image: string - Removed in favor of icons
    icon: string
    color: string
    description: string
    tags: string[]
    title: string // Computed for compatibility
    price: string // Computed for compatibility
}

export interface Topic {
    id: number
    title: string
    description: string
    sort_order: number
}

export interface Module {
    id: number
    title: string
    description: string
    sort_order: number
    topics: Topic[]
}
