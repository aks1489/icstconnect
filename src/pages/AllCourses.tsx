import { useState, useEffect } from 'react'
import CourseDetailsModal from '../components/ui/CourseDetailsModal'
import Skeleton from '../components/ui/Skeleton'

type Duration = '3 Months' | '6 Months' | '12 Months' | '18 Months' | 'All'

interface Course {
    id: number
    title: string
    duration: Duration
    image: string
    description: string
    price: string
}

const coursesData: Course[] = [
    // 3 Months Courses
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        title: `Certificate in Basic Computing ${i + 1}`,
        duration: '3 Months' as Duration,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'A short-term course designed to provide fundamental computer skills.',
        price: '₹2,500'
    })),
    // 6 Months Courses
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: i + 11,
        title: `Diploma in Office Automation ${i + 1}`,
        duration: '6 Months' as Duration,
        image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Comprehensive training in office tools and administrative software.',
        price: '₹5,000'
    })),
    // 12 Months Courses
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: i + 21,
        title: `Advanced Diploma in Software Engineering ${i + 1}`,
        duration: '12 Months' as Duration,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'In-depth study of software development, algorithms, and system design.',
        price: '₹12,000'
    })),
    // 18 Months Courses
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: i + 31,
        title: `Professional Master Diploma in IT ${i + 1}`,
        duration: '18 Months' as Duration,
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'An extensive program covering advanced IT concepts and project management.',
        price: '₹18,000'
    })),
]

const AllCourses = () => {
    const [activeFilter, setActiveFilter] = useState<Duration>('All')
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const filteredCourses = activeFilter === 'All'
        ? coursesData
        : coursesData.filter(course => course.duration === activeFilter)

    return (
        <div className="pt-24 pb-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-outfit">
                        Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Courses</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Choose from a wide range of industry-relevant courses designed to boost your career.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {['All', '3 Months', '6 Months', '12 Months', '18 Months'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as Duration)}
                            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${activeFilter === filter
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform -translate-y-0.5'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {loading ? (
                        // Skeleton Loading State
                        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 h-[450px] flex flex-col">
                                <Skeleton className="w-full h-48" />
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-8 w-3/4 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-6" />
                                    <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-10 w-32 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                        {course.duration}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                        <span className="text-slate-900 font-bold">{course.price}</span>
                                        <button
                                            onClick={() => setSelectedCourse(course)}
                                            className="text-blue-600 font-semibold text-sm hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Course Details Modal */}
            <CourseDetailsModal
                course={selectedCourse}
                isOpen={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
            />
        </div>
    )
}

export default AllCourses
