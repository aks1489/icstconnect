import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { courseService } from '../../../services/courseService'
import AnimatedCourseIcon from '../../common/AnimatedCourseIcon'
import CourseDetailsModal from '../../courses/CourseDetailsModal'
import type { Course } from '../../../types/course'

const CoursesSection = () => {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchAndFilterCourses = async () => {
            try {
                const allCourses = await courseService.getCourses()

                // Helper for strict/flexible check
                const findCourse = (keywords: string[]) =>
                    allCourses.find(c => keywords.some(k => c.course_name.toLowerCase().includes(k.toLowerCase())));

                const selectionAttempt = [
                    // 1. Diploma (3 specific)
                    findCourse(['DITA']),
                    findCourse(['Diploma in Web Designing', 'DWD']),
                    findCourse(['Diploma in Cyber Security', 'DCSEH']),

                    // 2. 6 Month / Certificate (3 specific)
                    findCourse(['Cert. in Data Entry Operator', 'CDEO']),
                    findCourse(['Cert. in Desktop Publishing', 'CDTP']),
                    findCourse(['Cert. in Computer Fundamentals', 'CCF']),

                    // 3. Programming (3 specific)
                    findCourse(['Certificate in Java Programming', 'Java Programming']),
                    findCourse(['Certificate in Python Programming', 'Python Programming']),
                    findCourse(['Certificate in SQL Programming', 'SQL Programming']),

                    // 4. Wildcard (1 specific)
                    findCourse(['Full Stack Web Development'])
                ];

                const finalSelection = selectionAttempt.filter((c): c is Course => !!c);

                setCourses(finalSelection)
            } catch (error) {
                console.error("Failed to fetch courses", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAndFilterCourses()
    }, [])

    const handleCourseClick = (course: Course) => {
        setSelectedCourse(course)
        setIsModalOpen(true)
    }

    const getIconType = (title: string): any => {
        const t = title.toLowerCase()
        if (t.includes('code') || t.includes('web') || t.includes('java') || t.includes('python')) return 'code'
        if (t.includes('dca') || t.includes('data') || t.includes('adca') || t.includes('dita')) return 'data'
        if (t.includes('tally') || t.includes('account')) return 'finance'
        if (t.includes('hardware') || t.includes('net') || t.includes('security')) return 'hardware'
        if (t.includes('design') || t.includes('dtp')) return 'design'
        if (t.includes('office') || t.includes('certificate') || t.includes('fundamentals')) return 'office'
        return 'general'
    }

    const getColor = (index: number) => {
        const colors = ['blue', 'purple', 'emerald', 'orange', 'pink', 'cyan']
        return colors[index % colors.length]
    }

    // Marquee Logic: Duplicate list for loop
    const marqueeCourses = [...courses, ...courses, ...courses, ...courses];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden" id="courses">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="container-fluid px-0 relative z-10 overflow-hidden">
                <div className="container mx-auto px-4 mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                        <Sparkles size={14} className="text-yellow-500" />
                        Career Oriented Training
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Explore Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Courses</span>
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Hand-picked courses designed for students in West Bengal to build a successful career in IT and Digital sectors.
                    </p>
                </div>

                {loading ? (
                    <div className="flex gap-8 overflow-hidden px-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[240px] md:min-w-[280px] bg-white h-72 rounded-3xl shadow-sm border border-slate-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="relative w-full overflow-hidden py-10">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 z-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 z-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>

                        <motion.div
                            className="flex gap-5 md:gap-8 w-fit"
                            initial={{ x: 0 }}
                            animate={{ x: "-50%" }}
                            transition={{
                                duration: 80,
                                ease: "linear",
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                            style={{ willChange: 'transform' }}
                        >
                            {marqueeCourses.map((course, index) => {
                                const color = getColor(index);
                                const key = `${course.id}-${index}`;

                                return (
                                    <div
                                        key={key}
                                        onClick={() => handleCourseClick(course)}
                                        className="w-[240px] md:w-[280px] flex-shrink-0 group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer select-none"
                                    >
                                        <div className={`w-14 h-14 md:w-16 md:h-16 mb-4 relative flex items-center justify-center`}>
                                            <div className={`absolute inset-0 bg-${color}-50 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300`}></div>
                                            <div className={`relative z-10 w-8 h-8 md:w-10 md:h-10`}>
                                                <AnimatedCourseIcon
                                                    type={getIconType(course.course_name)}
                                                    color={`text-${color}-500`}
                                                />
                                            </div>
                                        </div>

                                        <h3 className="text-sm md:text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 break-words w-full px-2">
                                            {course.course_name}
                                        </h3>

                                        <p className="text-slate-500 text-[10px] md:text-xs mb-3 line-clamp-2 leading-relaxed h-8">
                                            {course.description || "Master the skills needed for the future."}
                                        </p>

                                        <div className="mt-auto w-full pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide`}>
                                                {course.duration || '6 Months'}
                                            </span>
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </motion.div>
                    </div>
                )}


                {/* View All Button */}
                <div className="text-center mt-12 relative z-20">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/10 group"
                    >
                        <span>View All Courses</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Course Details Modal */}
            <CourseDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                course={selectedCourse}
            />
        </section>
    )
}

export default CoursesSection
