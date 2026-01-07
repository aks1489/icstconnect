import React, { useEffect, useState } from 'react'
import type { Course } from '../../types/course'
import { X, Check, ArrowRight } from 'lucide-react'
import { getIcon } from '../../utils/iconMapper'

interface CourseDetailsModalProps {
    course: Course | null
    isOpen: boolean
    onClose: () => void
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({ course, isOpen, onClose }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible && !isOpen) return null

    if (!course) return null

    return (
        <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh] ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button - Floated */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-500 hover:text-slate-900 z-50 transition-all border border-slate-100"
                >
                    <X size={20} />
                </button>

                {/* Hero Header - Centered & Clean matching image */}
                <div className="relative pt-12 pb-8 px-6 bg-cyan-50/50 flex flex-col items-center text-center border-b border-cyan-100/50">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    {/* Duration Badge */}
                    <div className="relative z-10 mb-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold shadow-sm border border-slate-100 uppercase tracking-wide">
                            {course.duration || '6 Months'}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="relative z-10 text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2 max-w-[80%]">
                        {course.title}
                    </h2>

                    {/* Subtitle / Code (Optional) */}
                    {course.course_name.includes('(') && (
                        <p className="relative z-10 text-slate-500 font-medium">
                            {course.course_name.match(/\(([^)]+)\)/)?.[1] || ''}
                        </p>
                    )}

                    {/* Faint Background Icon */}
                    {(() => {
                        const Icon = getIcon(course.icon)
                        return <Icon className="absolute right-0 bottom-0 text-cyan-200/40 transform translate-x-1/4 translate-y-1/4 rotate-12 pointer-events-none" size={140} />
                    })()}
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {/* Key Stats Row */}
                    <div className="px-6 py-6 border-b border-slate-50">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                <p className="text-xl font-extrabold text-slate-900">{course.price}</p>
                            </div>
                            <div className="border-l border-slate-100 pl-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Duration</p>
                                <p className="text-lg font-bold text-slate-900 leading-tight">
                                    {course.duration?.split(' ')[0]} <br />
                                    <span className="text-xs font-medium text-slate-500">{course.duration?.split(' ').slice(1).join(' ')}</span>
                                </p>
                            </div>
                            <div className="border-l border-slate-100 pl-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Level</p>
                                <p className="text-sm font-bold text-slate-900 leading-tight mt-1">Beginner to Pro</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}

                    {/* Syllabus Section */}
                    <div className="px-6 py-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            Course Syllabus
                        </h3>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
                            {course.syllabus && course.syllabus.length > 0 ? (
                                <ul className="space-y-3">
                                    {course.syllabus.map((topic, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="bg-blue-100 text-blue-600 rounded-full p-0.5 mt-0.5 shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-slate-700 font-medium leading-snug">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Detailed syllabus available upon enrollment.</p>
                            )}
                        </div>
                    </div>

                    {/* Fees Section (if matches) */}
                    {course.fees && (
                        <div className="px-6 pb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Fee Breakdown</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Admission</p>
                                    <p className="text-lg font-bold text-slate-900">{course.fees.admission ? `₹${course.fees.admission}` : '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Monthly</p>
                                    <p className="text-lg font-bold text-slate-900">{course.fees.monthly ? `₹${course.fees.monthly}` : '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between gap-4 flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClose}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 transition-colors"
                    >
                        Close
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Enroll Now
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CourseDetailsModal
