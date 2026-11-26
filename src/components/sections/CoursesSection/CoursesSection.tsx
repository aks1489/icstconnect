import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight as ArrowRight } from '@tabler/icons-react'
import { animate } from 'animejs'
import { courseService } from '../../../services/courseService'
import AnimatedCourseIcon from '../../common/AnimatedCourseIcon'
import GeometricBackdrop from './GeometricBackdrop'
import CourseZoomPopup, { type CourseCardAccent, type HoveredCourseState } from './CourseZoomPopup'
import type { Course } from '../../../types/course'
import { OrbSectionLoader } from '../../ui/HomePageSkeleton'
import { prefersReducedMotion, revealOnScroll } from '../../../lib/motion'

type TrackFilter = 'all' | 'diploma' | 'certificate' | 'programming'

const CoursesSection = () => {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [isMarqueePaused, setIsMarqueePaused] = useState(false)
    const [activeFilter, setActiveFilter] = useState<TrackFilter>('all')
    const [hoveredPopup, setHoveredPopup] = useState<HoveredCourseState | null>(null)
    const marqueeRef = useRef<HTMLDivElement>(null)
    const animRef = useRef<ReturnType<typeof animate> | null>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)
    const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hoveredPopupRef = useRef<HoveredCourseState | null>(null)
    hoveredPopupRef.current = hoveredPopup

    useEffect(() => {
        if (headerRef.current) {
            return revealOnScroll(headerRef.current, { translateY: 14, duration: 500 })
        }
    }, [])

    useEffect(() => {
        if (activeFilter !== 'all' || !marqueeRef.current || loading || courses.length === 0 || prefersReducedMotion()) return
        const anim = animate(marqueeRef.current, {
            translateX: ['0%', '-50%'],
            duration: 82000,
            ease: 'linear',
            loop: true
        })
        animRef.current = anim
        if (isMarqueePaused) {
            anim.pause()
        }
        return () => {
            anim.pause()
            animRef.current = null
        }
    }, [activeFilter, loading, courses])

    const effectivePaused = isMarqueePaused || hoveredPopup !== null

    useEffect(() => {
        if (!animRef.current) return
        if (effectivePaused) {
            animRef.current.pause()
        } else {
            animRef.current.play()
        }
    }, [effectivePaused])

    const clearPopupTimers = useCallback(() => {
        if (popupCloseTimerRef.current !== null) {
            clearTimeout(popupCloseTimerRef.current)
            popupCloseTimerRef.current = null
        }
    }, [])

    const cancelCloseFor = useCallback(
        (cardKey: string) => {
            if (hoveredPopupRef.current?.cardKey !== cardKey) return
            clearPopupTimers()
            if (hoveredPopupRef.current.closing) {
                setHoveredPopup((prev) => (prev && prev.cardKey === cardKey ? { ...prev, closing: false } : prev))
            }
        },
        [clearPopupTimers]
    )

    const requestClosePopup = useCallback(
        (expectedCardKey?: string) => {
            const current = hoveredPopupRef.current
            if (!current) return
            if (expectedCardKey && current.cardKey !== expectedCardKey) return
            if (current.closing) return

            clearPopupTimers()
            const keyToClose = current.cardKey
            const nextState = { ...current, closing: true }
            hoveredPopupRef.current = nextState
            setHoveredPopup(nextState)

            popupCloseTimerRef.current = setTimeout(() => {
                setHoveredPopup((prev) => {
                    if (!prev || prev.cardKey !== keyToClose || !prev.closing) return prev
                    hoveredPopupRef.current = null
                    return null
                })
            }, 215)
        },
        [clearPopupTimers]
    )

    const handleCardPointerEnter = (
        e: React.PointerEvent<HTMLAnchorElement>,
        cardKey: string,
        course: Course,
        style: CourseCardAccent,
        iconType: HoveredCourseState['iconType']
    ) => {
        if (e.pointerType === 'touch') return
        const current = hoveredPopupRef.current
        if (current && current.cardKey === cardKey && !current.closing) return
        clearPopupTimers()
        const r = e.currentTarget.getBoundingClientRect()
        const nextState: HoveredCourseState = {
            cardKey,
            course,
            style,
            iconType,
            rect: { top: r.top, left: r.left, width: r.width, height: r.height },
            closing: false
        }
        hoveredPopupRef.current = nextState
        setHoveredPopup(nextState)
    }

    useEffect(() => {
        if (!hoveredPopup) return

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return
            const current = hoveredPopupRef.current
            if (!current || current.closing) return
            const popupEl = popupRef.current
            if (!popupEl) return

            const pr = popupEl.getBoundingClientRect()
            const or = current.rect
            const pad = 10
            const insidePopup =
                e.clientX >= pr.left - pad &&
                e.clientX <= pr.right + pad &&
                e.clientY >= pr.top - pad &&
                e.clientY <= pr.bottom + pad
            const insideOrigin =
                e.clientX >= or.left - 4 &&
                e.clientX <= or.left + or.width + 4 &&
                e.clientY >= or.top - 4 &&
                e.clientY <= or.top + or.height + 4

            if (!insidePopup && !insideOrigin) {
                requestClosePopup(current.cardKey)
            }
        }

        const onScrollOrEsc = (ev: Event) => {
            if (ev.type === 'keydown' && (ev as KeyboardEvent).key !== 'Escape') return
            requestClosePopup()
        }

        window.addEventListener('pointermove', onPointerMove, { passive: true })
        window.addEventListener('scroll', onScrollOrEsc, { passive: true })
        window.addEventListener('keydown', onScrollOrEsc)
        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('scroll', onScrollOrEsc)
            window.removeEventListener('keydown', onScrollOrEsc)
        }
    }, [hoveredPopup !== null, requestClosePopup])

    useEffect(() => {
        return () => clearPopupTimers()
    }, [clearPopupTimers])

    useEffect(() => {
        const fetchAndFilterCourses = async () => {
            try {
                const allCourses = await courseService.getCourses()

                const findCourse = (keywords: string[]) =>
                    allCourses.find(c => keywords.some(k => c.course_name.toLowerCase().includes(k.toLowerCase())))

                const selectionAttempt = [
                    findCourse(['DITA']),
                    findCourse(['Diploma in Web Designing', 'DWD']),
                    findCourse(['Diploma in Cyber Security', 'DCSEH']),
                    findCourse(['Cert. in Data Entry Operator', 'CDEO']),
                    findCourse(['Cert. in Desktop Publishing', 'CDTP']),
                    findCourse(['Cert. in Computer Fundamentals', 'CCF']),
                    findCourse(['Certificate in Java Programming', 'Java Programming']),
                    findCourse(['Certificate in Python Programming', 'Python Programming']),
                    findCourse(['Certificate in SQL Programming', 'SQL Programming']),
                    findCourse(['Full Stack Web Development'])
                ]

                const finalSelection = selectionAttempt.filter((c): c is Course => !!c)
                setCourses(finalSelection)
            } catch (error) {
                console.error('Failed to fetch courses', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAndFilterCourses()
    }, [])

    const getTrackCategory = (title: string): Exclude<TrackFilter, 'all'> => {
        const t = title.toLowerCase()
        if (t.includes('java') || t.includes('python') || t.includes('sql') || t.includes('full stack') || t.includes('web designing')) {
            return 'programming'
        }
        if (t.includes('diploma') || t.includes('dita') || t.includes('dcseh')) {
            return 'diploma'
        }
        return 'certificate'
    }

    const filteredCourses = useMemo(() => {
        if (activeFilter === 'all') return courses
        return courses.filter((c) => getTrackCategory(c.course_name) === activeFilter)
    }, [courses, activeFilter])

    const getIconType = (title: string): 'code' | 'data' | 'finance' | 'hardware' | 'general' | 'design' | 'office' => {
        const t = title.toLowerCase()
        if (t.includes('code') || t.includes('web') || t.includes('java') || t.includes('python')) return 'code'
        if (t.includes('dca') || t.includes('data') || t.includes('adca') || t.includes('dita')) return 'data'
        if (t.includes('tally') || t.includes('account')) return 'finance'
        if (t.includes('hardware') || t.includes('net') || t.includes('security')) return 'hardware'
        if (t.includes('design') || t.includes('dtp')) return 'design'
        if (t.includes('office') || t.includes('certificate') || t.includes('fundamentals')) return 'office'
        return 'general'
    }

    const getCardAccent = (_index: number): CourseCardAccent => ({
        iconColor: 'blue',
        bgClass: 'bg-[#2572AB]/8 border-[#2572AB]/15',
        pillClass: 'bg-[#2572AB]/8 text-[#2572AB]',
        glowColor: 'transparent',
        hoverBorder: 'hover:border-[#2572AB]/45'
    })

    const marqueeCourses = useMemo(
        () => (courses.length >= 8 ? [...courses, ...courses] : [...courses, ...courses, ...courses, ...courses]),
        [courses]
    )

    const renderCourseCard = (course: Course, index: number, key: string) => {
        const style = getCardAccent(index)
        const iconType = getIconType(course.course_name)
        const isCurrentlyZoomed = hoveredPopup?.cardKey === key && !hoveredPopup.closing

        return (
            <Link
                key={key}
                to={`/courses/${course.id}`}
                onPointerEnter={(e) => handleCardPointerEnter(e, key, course, style, iconType)}
                onPointerMove={(e) => handleCardPointerEnter(e, key, course, style, iconType)}
                className={`w-[255px] md:w-[290px] flex-shrink-0 h-[244px] group relative bg-[#FFFFFF]/88 hover:bg-[#FFFFFF] backdrop-blur-md rounded-2xl p-6 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.12)] border border-slate-200/90 ${style.hoverBorder} transition-[transform,opacity,border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCurrentlyZoomed ? 'scale-[0.98] opacity-55' : 'hover:-translate-y-0.5'} flex flex-col items-start text-left cursor-pointer select-none no-underline text-inherit overflow-hidden`}
            >
                <div className="w-full flex items-center justify-between mb-5 relative z-10">
                    <div className="w-13 h-13 relative flex items-center justify-center">
                        <div className={`absolute inset-0 ${style.bgClass} rounded-2xl border`} />
                        <div className="relative z-10 w-7 h-7">
                            <AnimatedCourseIcon
                                type={iconType}
                                color={style.iconColor}
                            />
                        </div>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${style.pillClass} tabular-nums`}>
                        {course.duration || '6 Months'}
                    </span>
                </div>

                <h3 className="relative z-10 text-base font-semibold text-[#0F172A] mb-2 group-hover:text-[#2572AB] transition-colors duration-150 line-clamp-1 break-words w-full">
                    {course.course_name}
                </h3>

                <p className="relative z-10 text-[#475569] text-xs mb-5 line-clamp-2 leading-relaxed h-8">
                    {course.description || 'Master the skills needed for the future.'}
                </p>

                <div className="relative z-10 mt-auto w-full pt-3.5 border-t border-slate-200/75 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">ICST Curriculum</span>
                    <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2572AB] flex items-center gap-1 transition-colors duration-150">
                        <span>View Details</span>
                        <ArrowRight size={13} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                    </span>
                </div>
            </Link>
        )
    }

    return (
        <section
            id="courses"
            className="py-22 lg:py-26 bg-[#F4F8FD] border-y border-slate-200/75 relative overflow-hidden"
        >
            <GeometricBackdrop />

            <div className="container-fluid px-0 relative z-10 overflow-hidden">
                <div ref={headerRef} className="container mx-auto px-4 mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border border-slate-200/90 text-[#2572AB] rounded-full text-xs font-medium mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2572AB]" aria-hidden="true" />
                                <span>Career Oriented Training</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A] mb-3 tracking-[-0.025em]">
                                Explore Popular <span className="text-[#2572AB]">Courses</span>
                            </h2>

                            <p className="text-[#475569] text-base sm:text-lg leading-relaxed mb-0">
                                Hand-picked courses designed for students in West Bengal to build a successful career in IT and Digital sectors.
                            </p>
                        </div>

                        {/* Interactive Track Tabs */}
                        {!loading && courses.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center lg:justify-end">
                                <div className="inline-flex p-1 rounded-xl bg-[#FFFFFF]/90 backdrop-blur-md border border-slate-200/90" role="tablist" aria-label="Filter courses by track">
                                    {([
                                        { id: 'all', label: 'All Tracks' },
                                        { id: 'diploma', label: 'Diplomas' },
                                        { id: 'programming', label: 'Coding' },
                                        { id: 'certificate', label: 'Certificates' }
                                    ] as const).map((tab) => {
                                        const active = activeFilter === tab.id
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                role="tab"
                                                aria-selected={active}
                                                onClick={() => {
                                                    clearPopupTimers()
                                                    hoveredPopupRef.current = null
                                                    setHoveredPopup(null)
                                                    setActiveFilter(tab.id)
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${active
                                                    ? 'bg-[#0F172A] text-white'
                                                    : 'text-slate-600 hover:text-[#0F172A]'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Uniform Fixed-Height Showcase Slot (Zero Vertical Jump Across All Categories) */}
                <div className="h-[292px] flex items-center w-full">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center px-4">
                            <OrbSectionLoader
                                state="searching"
                                size={64}
                                label="Loading featured ICST courses"
                                sublabel="Syncing diplomas, coding & career tracks"
                            />
                        </div>
                    ) : activeFilter === 'all' ? (
                        <div
                            className="relative w-full overflow-hidden py-6"
                            onMouseEnter={() => setIsMarqueePaused(true)}
                            onMouseLeave={() => setIsMarqueePaused(false)}
                            onFocus={() => setIsMarqueePaused(true)}
                            onBlur={() => setIsMarqueePaused(false)}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-10 md:w-28 z-20 bg-gradient-to-r from-[#F4F8FD] to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-10 md:w-28 z-20 bg-gradient-to-l from-[#F4F8FD] to-transparent pointer-events-none" />

                            <div
                                ref={marqueeRef}
                                className="flex gap-5 md:gap-6 w-fit"
                                style={{ willChange: 'transform' }}
                            >
                                {marqueeCourses.map((course, index) => renderCourseCard(course, index, `${course.id}-${index}`))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full overflow-x-auto overflow-y-hidden py-6 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="mx-auto w-max flex gap-5 md:gap-6 animate-in fade-in duration-200">
                                {filteredCourses.map((course, index) => renderCourseCard(course, index, `filtered-${course.id}`))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-10 relative z-20">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#0F172A] hover:bg-[#2572AB] text-white rounded-xl font-semibold transition-[background-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 shadow-[0_12px_24px_-10px_rgba(15,23,42,0.28)] group no-underline"
                    >
                        <span>View All Courses</span>
                        <ArrowRight size={18} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-150" />
                    </Link>
                </div>
            </div>

            <CourseZoomPopup
                ref={popupRef}
                state={hoveredPopup}
                onCancelClose={cancelCloseFor}
                onRequestClose={requestClosePopup}
            />
        </section>
    )
}

export default CoursesSection
