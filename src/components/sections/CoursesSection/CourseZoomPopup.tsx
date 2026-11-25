import { forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { IconArrowRight as ArrowRight, IconCheck as Check, IconBriefcase as Briefcase } from '@tabler/icons-react'
import AnimatedCourseIcon from '../../common/AnimatedCourseIcon'
import type { Course } from '../../../types/course'

export interface CourseCardAccent {
    iconColor: string
    bgClass: string
    pillClass: string
    glowColor: string
    hoverBorder: string
}

export interface HoveredCourseState {
    cardKey: string
    course: Course
    style: CourseCardAccent
    iconType: 'code' | 'data' | 'finance' | 'hardware' | 'general' | 'design' | 'office'
    rect: { top: number; left: number; width: number; height: number }
    closing: boolean
}

interface CourseZoomPopupProps {
    state: HoveredCourseState | null
    onRequestClose: (cardKey: string) => void
    onCancelClose: (cardKey: string) => void
}

const CourseZoomPopup = forwardRef<HTMLDivElement, CourseZoomPopupProps>(
    ({ state, onRequestClose, onCancelClose }, ref) => {
        if (!state || typeof document === 'undefined' || typeof window === 'undefined') return null

        const { cardKey, course, style, iconType, rect, closing } = state
        const viewportW = window.innerWidth
        const viewportH = window.innerHeight

        const popupW = Math.min(410, viewportW - 24)
        const approxH = 340

        const targetLeft = Math.min(
            Math.max(12, rect.left + rect.width / 2 - popupW / 2),
            viewportW - popupW - 12
        )
        const targetTop = Math.min(
            Math.max(76, rect.top + rect.height / 2 - approxH / 2),
            viewportH - approxH - 16
        )

        const deltaX = rect.left + rect.width / 2 - (targetLeft + popupW / 2)
        const deltaY = rect.top + rect.height / 2 - (targetTop + approxH / 2)
        const baseScale = Math.min(0.86, Math.max(0.66, rect.width / popupW))

        const topics = (course.syllabus && course.syllabus.length > 0
            ? course.syllabus
            : course.tags || []
        ).slice(0, 4)

        const feeLabel =
            course.price ||
            (course.fees?.monthly ? `₹${course.fees.monthly}/mo` : course.fees?.total ? `₹${course.fees.total}` : '')

        return createPortal(
            <div
                ref={ref}
                key={cardKey}
                onMouseEnter={() => onCancelClose(cardKey)}
                onMouseLeave={() => onRequestClose(cardKey)}
                style={{
                    left: targetLeft,
                    top: targetTop,
                    width: popupW,
                    '--zx': `${deltaX.toFixed(1)}px`,
                    '--zy': `${deltaY.toFixed(1)}px`,
                    '--zs': baseScale.toFixed(3),
                    animation: closing
                        ? 'icstCourseZoomOut 210ms cubic-bezier(0.4, 0, 1, 1) forwards'
                        : 'icstCourseZoomIn 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards'
                } as React.CSSProperties}
                className={`fixed z-[1100] origin-center will-change-transform ${closing ? 'pointer-events-none' : 'pointer-events-auto'}`}
            >
                <Link
                    to={`/courses/${course.id}`}
                    onClick={() => onRequestClose(cardKey)}
                    className="group relative block w-full rounded-3xl bg-[#FFFFFF]/95 backdrop-blur-2xl p-6 border border-white ring-1 ring-[#2572AB]/25 shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,1),0_34px_76px_-16px_rgba(15,23,42,0.34)] no-underline text-inherit overflow-hidden"
                >
                    <div
                        className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
                        aria-hidden="true"
                    />

                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-13 h-13 relative flex items-center justify-center shrink-0">
                                <div className={`absolute inset-0 ${style.bgClass} rounded-2xl border border-white shadow-xs`} />
                                <div className="relative z-10 w-7 h-7">
                                    <AnimatedCourseIcon type={iconType} color={style.iconColor} />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 block mb-0.5 truncate">
                                    {course.category || 'ICST Program'}
                                </span>
                                <h3 className="text-lg font-extrabold text-[#0F172A] leading-snug tracking-tight">
                                    {course.course_name}
                                </h3>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${style.pillClass} uppercase tracking-wider tabular-nums`}>
                            {course.duration || '6 Months'}
                        </span>
                    </div>

                    {/* Full Description */}
                    <p className="text-[#475569] text-xs sm:text-[13px] leading-relaxed mb-4 line-clamp-3">
                        {course.description || 'Master industry-ready computer skills with hands-on practical training.'}
                    </p>

                    {/* Key Topics */}
                    {topics.length > 0 && (
                        <div className="mb-4">
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">
                                What You Will Learn
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {topics.map((topic) => (
                                    <div
                                        key={topic}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50/95 border border-slate-200/75 text-[11px] font-medium text-[#0F172A] min-w-0"
                                    >
                                        <Check size={12} className="text-[#059669] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                        <span className="truncate">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Career / Fee + CTA Footer */}
                    <div className="pt-3.5 border-t border-slate-200/75 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 min-w-0">
                            <Briefcase size={13} className="text-[#2572AB] shrink-0" aria-hidden="true" />
                            <span className="truncate font-medium">
                                {course.careerPathways?.[0] || course.credential || 'Verified Certification'}
                            </span>
                            {feeLabel && (
                                <span className={`ml-1 font-bold shrink-0 px-2 py-0.5 rounded-md ${style.pillClass} tabular-nums`}>
                                    {feeLabel}
                                </span>
                            )}
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] group-hover:bg-[#2572AB] text-white text-xs font-semibold transition-colors shadow-xs">
                            <span>View Details</span>
                            <ArrowRight size={13} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </div>
                </Link>

                <style>{`
                    @keyframes icstCourseZoomIn {
                        0% {
                            opacity: 0.2;
                            transform: translate3d(var(--zx, 0px), var(--zy, 0px), 0) scale(var(--zs, 0.72));
                        }
                        100% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0) scale(1);
                        }
                    }
                    @keyframes icstCourseZoomOut {
                        0% {
                            opacity: 1;
                            transform: translate3d(0, 0, 0) scale(1);
                        }
                        100% {
                            opacity: 0;
                            transform: translate3d(var(--zx, 0px), var(--zy, 0px), 0) scale(var(--zs, 0.72));
                        }
                    }
                `}</style>
            </div>,
            document.body
        )
    }
)

CourseZoomPopup.displayName = 'CourseZoomPopup'

export default CourseZoomPopup
