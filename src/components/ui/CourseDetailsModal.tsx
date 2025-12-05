import React, { useEffect, useState } from 'react'

interface Course {
    id: number
    title: string
    duration: string
    image: string
    description: string
    price: string
}

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
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 hover:bg-white transition-all z-10 shadow-sm"
                >
                    <i className="bi bi-x-lg text-lg"></i>
                </button>

                {/* Hero Image */}
                <div className="relative h-64 flex-shrink-0">
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold mb-3 shadow-lg shadow-blue-600/30">
                                {course.duration}
                            </span>
                            <h2 className="text-3xl font-bold text-white leading-tight">{course.title}</h2>
                        </div>
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
                            <h3 className="text-xl font-bold text-slate-900 mb-3">About this Course</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {course.description} This comprehensive course is designed to equip you with the essential skills needed in today's digital landscape.
                                Whether you are starting from scratch or looking to upgrade your skills, our expert-led training ensures you gain practical, hands-on experience.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">What you'll learn</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Industry-standard tools & software',
                                    'Real-world project experience',
                                    'Professional portfolio building',
                                    'Career guidance and support',
                                    'Certificate of completion',
                                    'Lifetime access to resources'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-slate-600">
                                        <i className="bi bi-check-circle-fill text-green-500 mt-1 flex-shrink-0"></i>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
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
