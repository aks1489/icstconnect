import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Course, Module } from '../../types/course'
import { courseService } from '../../services/courseService'
import { IconX as X, IconCheck as Check, IconArrowRight as ArrowRight } from '@tabler/icons-react'
import { getIcon } from '../../utils/iconMapper'

interface CourseDetailsModalProps {
    course: Course | null
    isOpen: boolean
    onClose: () => void
}

const CourseIconRenderer: React.FC<{ icon: string; className?: string; size?: number }> = ({ icon, className, size }) => {
    return React.createElement(getIcon(icon), { className, size })
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, isOpen, onClose }) => {
    const navigate = useNavigate()
    const [modules, setModules] = useState<Module[]>([])
    const [loadingStructure, setLoadingStructure] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = 'unset'
            return
        }

        document.body.style.overflow = 'hidden'

        let isMounted = true
        if (course?.id) {
            const fetchStructure = async () => {
                try {
                    const data = await courseService.getCourseStructure(course.id)
                    if (isMounted) setModules(data)
                } catch (e) {
                    console.error('Error loading course structure', e)
                    if (isMounted) setModules([])
                } finally {
                    if (isMounted) setLoadingStructure(false)
                }
            }
            fetchStructure()
        }

        return () => {
            isMounted = false
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, course?.id])

    if (!isOpen || !course) return null

    return (
        <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh] border border-transparent dark:border-slate-800 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button - Floated */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white z-50 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Hero Header - Centered & Clean matching image */}
                <div className="relative pt-12 pb-8 px-6 bg-cyan-50/50 dark:bg-cyan-950/40 flex flex-col items-center text-center border-b border-cyan-100/50 dark:border-cyan-900/40">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    {/* Duration Badge */}
                    <div className="relative z-10 mb-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm border border-slate-100 dark:border-slate-700 uppercase tracking-wide">
                            {course.duration || '6 Months'}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="relative z-10 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2 max-w-[80%] transition-colors">
                        {course.title}
                    </h2>

                    {/* Subtitle / Code (Optional) */}
                    {course.course_name.includes('(') && (
                        <p className="relative z-10 text-slate-500 dark:text-slate-400 font-medium">
                            {course.course_name.match(/\(([^)]+)\)/)?.[1] || ''}
                        </p>
                    )}

                    {/* Faint Background Icon */}
                    <CourseIconRenderer icon={course.icon} className="absolute right-0 bottom-0 text-cyan-200/40 dark:text-cyan-800/30 transform translate-x-1/4 translate-y-1/4 rotate-12 pointer-events-none" size={140} />
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    {/* Key Stats Row */}
                    <div className="px-6 py-6 border-b border-slate-50 dark:border-slate-800">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Price</p>
                                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{course.price}</p>
                            </div>
                            <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Duration</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {course.duration?.split(' ')[0]} <br />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{course.duration?.split(' ').slice(1).join(' ')}</span>
                                </p>
                            </div>
                            <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Level</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-1">Beginner to Pro</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}

                    {/* Syllabus Section */}
                    <div className="px-6 py-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            Course Syllabus
                        </h3>

                        {loadingStructure ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ) : modules.length > 0 ? (
                            <div className="space-y-4">
                                {modules.map((module) => (
                                    <div key={module.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100/50 dark:border-slate-700/50">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-base">{module.title}</h4>
                                        {module.topics && module.topics.length > 0 ? (
                                            <ul className="space-y-2">
                                                {module.topics.map((topic) => (
                                                    <li key={topic.id} className="flex items-start gap-3">
                                                        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full p-0.5 mt-0.5 shrink-0">
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{topic.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No topics listed.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100/50 dark:border-slate-700/50">
                                {course.syllabus && course.syllabus.length > 0 ? (
                                    <ul className="space-y-3">
                                        {course.syllabus.map((topic, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full p-0.5 mt-0.5 shrink-0">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{topic}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">Detailed syllabus available upon enrollment.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fees Section (if matches) */}
                    {course.fees && (
                        <div className="px-6 pb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Fee Breakdown</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Admission</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{course.fees.admission ? `₹${course.fees.admission}` : '-'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{course.fees.monthly ? `₹${course.fees.monthly}` : '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
                    <button
                        onClick={onClose}
                        className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => navigate(`/enroll/${course.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Enroll Now
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CourseDetailsModal
