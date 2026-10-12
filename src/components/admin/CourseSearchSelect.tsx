import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    IconSearch as Search,
    IconX as X,
    IconChevronDown as ChevronDown,
    IconBook2 as BookOpen,
    IconCheck as Check,
    IconClock as Clock
} from '@tabler/icons-react'

export interface CourseOption {
    id: number | string
    course_name: string
    duration_months?: number
    color?: string
}
export const CourseOption = {} as unknown as CourseOption;

export interface CourseSearchSelectProps {
    courses: CourseOption[]
    value: string | number
    onChange: (courseId: string, course?: CourseOption) => void
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    compact?: boolean
    className?: string
}

export default function CourseSearchSelect({
    courses,
    value,
    onChange,
    label = "Select Course",
    placeholder = "-- Choose a Course --",
    required = false,
    disabled = false,
    compact = false,
    className = ""
}: CourseSearchSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Current selected course object
    const selectedCourse = useMemo(() => {
        if (!value) return null
        return courses.find(c => String(c.id) === String(value)) || null
    }, [courses, value])

    // Filter courses based on search query
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses
        const q = searchQuery.toLowerCase().trim()
        return courses.filter(course => {
            const nameMatch = course.course_name.toLowerCase().includes(q)
            const durationMatch = course.duration_months
                ? `${course.duration_months} months`.toLowerCase().includes(q)
                : false
            return nameMatch || durationMatch
        })
    }, [courses, searchQuery])

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 50)
        }
    }, [isOpen])

    const handleSelect = (course: CourseOption) => {
        onChange(String(course.id), course)
        setIsOpen(false)
        setSearchQuery('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('', undefined)
        setSearchQuery('')
    }

    return (
        <div className={`${compact ? 'space-y-1' : 'space-y-2'} relative ${className}`} ref={containerRef}>
            {label && (
                <label className={compact
                    ? "block text-xs font-bold text-slate-500 dark:text-slate-400"
                    : "block text-sm font-semibold text-slate-700 dark:text-slate-300"
                }>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Custom Trigger Button */}
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault()
                        setIsOpen(prev => !prev)
                    } else if (e.key === 'Escape') {
                        setIsOpen(false)
                    }
                }}
                className={`
                    w-full ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'} rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none
                    ${disabled
                        ? 'opacity-60 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        : isOpen
                            ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-900/40 bg-white dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-800'
                    }
                    shadow-sm
                `}
            >
                {selectedCourse ? (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400`}>
                            <BookOpen size={compact ? 14 : 18} />
                        </div>
                        <div className="truncate flex-1">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm block truncate">
                                {selectedCourse.course_name}
                            </span>
                        </div>
                        {selectedCourse.duration_months && (
                            <span className={`shrink-0 ${compact ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'} rounded-full font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center gap-1 border border-slate-200/60 dark:border-slate-700`}>
                                <Clock size={11} className="text-slate-400" />
                                {selectedCourse.duration_months} Mo
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
                        <BookOpen size={compact ? 15 : 18} />
                        <span>{placeholder}</span>
                    </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {selectedCourse && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Clear selection"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`}
                    />
                </div>
            </div>

            {/* Custom Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                    {/* Integrated Search Box */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/95 border-b border-slate-100 dark:border-slate-800 relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses by name or duration..."
                                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-900/40 transition-all font-medium"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Search Result Counter */}
                        <div className="flex items-center justify-between mt-2 px-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            <span>
                                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
                            </span>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Reset filter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Course List */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5 scroll-smooth">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => {
                                const isSelected = selectedCourse?.id === course.id
                                return (
                                    <div
                                        key={course.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleSelect(course)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSelect(course)
                                        }}
                                        className={`
                                            p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all
                                            ${isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div
                                                className={`
                                                    w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                                    ${isSelected
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100'
                                                    }
                                                `}
                                            >
                                                <BookOpen size={18} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold truncate leading-snug">
                                                    {course.course_name}
                                                </p>
                                                {course.duration_months && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} />
                                                        {course.duration_months} Months Program
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="py-8 px-4 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                                    <Search size={18} />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No courses found</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    No matches for "{searchQuery}". Try a different keyword.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
