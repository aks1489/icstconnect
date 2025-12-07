import React, { useEffect, useState } from 'react'
import type { Course } from '../../types/course'

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
            <div className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh] ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 hover:bg-white transition-all z-50 shadow-sm"
                >
                    <i className="bi bi-x-lg text-lg"></i>
                </button>

                {/* Hero Header */}
                <div className={`relative h-48 flex-shrink-0 ${course.color} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 pattern-dots"></div>
                    <i className={`bi ${course.icon} text-8xl text-current opacity-20 absolute -right-4 -bottom-4 transform rotate-12`}></i>

                    <div className="relative z-10 text-center p-8 w-full">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-slate-900 text-xs font-bold mb-3 shadow-sm border border-white/30">
                            {course.duration}
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight">{course.title}</h2>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                        <div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Price</p>
                            <p className="text-2xl font-bold text-slate-900">{course.price}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Duration</p>
                            <p className="text-lg font-semibold text-slate-900">{course.duration}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Level</p>
                            <p className="text-lg font-semibold text-slate-900">Beginner to Pro</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Course Syllabus</h3>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <ul className="grid grid-cols-1 gap-2">
                                    {course.syllabus && course.syllabus.map((topic, index) => (
                                        <li key={index} className="flex items-start gap-2 text-slate-700 font-medium">
                                            <i className="bi bi-check-lg text-blue-600 mt-1"></i>
                                            <span>{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {course.fees && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Fee Structure</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Admission</p>
                                        <p className="text-xl font-bold text-slate-900">{course.fees.admission ? `₹${course.fees.admission}` : 'N/A'}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Monthly</p>
                                        <p className="text-xl font-bold text-slate-900">{course.fees.monthly ? `₹${course.fees.monthly}` : 'N/A'}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total</p>
                                        <p className="text-xl font-bold text-slate-900">{course.fees.total ? `₹${course.fees.total}` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Certification</h3>
                            <p className="text-slate-600">
                                Upon successful completion of this course, you will receive a verified certificate from ICST Chowberia, which is recognized by leading companies.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                    <button className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                        <span>Enroll Now</span>
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CourseDetailsModal
