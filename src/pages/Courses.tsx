
import { useState, useEffect, useMemo } from 'react'
import { Hourglass, Search, Hash, X } from 'lucide-react'
import { getIcon } from '../utils/iconMapper'
import CourseDetailsModal from '../components/courses/CourseDetailsModal'
import Skeleton from '../components/ui/Skeleton'
import { courseService } from '../services/courseService'
import type { Course } from '../types/course'

type Duration = '3 Months' | '6 Months' | '12 Months' | '18 Months' | 'All'

const CoursesPage = () => {
    const [activeFilter, setActiveFilter] = useState<Duration>('All')
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<Course[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getCourses()
                setCourses(data)
            } catch (error) {
                console.error('Error fetching courses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [])

    // Real-time keyboard search activation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus search on any key press if not already focused on an input
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                const searchInput = document.getElementById('course-search')
                if (searchInput) {
                    searchInput.focus()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filteredCourses = useMemo(() => {
        const query = searchQuery.toLowerCase().trim()

        return courses.filter(course => {
            // Duration Filter
            const matchesDuration = activeFilter === 'All' || course.duration === activeFilter

            // Search Filter
            if (!query) return matchesDuration

            const matchesTitle = course.title.toLowerCase().includes(query)
            const matchesDesc = course.description.toLowerCase().includes(query)
            const matchesTags = course.tags?.some(tag => tag.toLowerCase().includes(query))

            return matchesDuration && (matchesTitle || matchesDesc || matchesTags)
        })
    }, [activeFilter, courses, searchQuery])

    return (
        <div className="pt-24 pb-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-outfit">
                        Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Courses</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Choose from a wide range of industry-relevant courses designed to boost your career.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-10 relative">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            id="course-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm hover:shadow-md text-lg"
                            placeholder="Search courses, skills, or keywords..."
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    <div className="mt-2 text-center text-xs text-slate-400">
                        Press any key to start searching
                    </div>
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
                    ) : filteredCourses.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="text-blue-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No courses found</h3>
                            <p className="text-slate-500 max-w-md">
                                We couldn't find any courses matching "{searchQuery}" with the selected filter. Try correcting the spelling or use different keywords.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 flex flex-col h-full cursor-pointer"
                            >
                                <div className={`h-32 ${course.color} flex items-center justify-center relative overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-10 pattern-dots"></div>
                                    {(() => {
                                        const Icon = getIcon(course.icon)
                                        return (
                                            <Icon
                                                size={64}
                                                className="relative z-10 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                            />
                                        )
                                    })()}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                        {course.duration}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-3 flex flex-wrap gap-1.5">
                                        {course.tags?.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                                                <Hash size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
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

export default CoursesPage
