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
    title: string // Computed for compatibility
    price: string // Computed for compatibility
}
