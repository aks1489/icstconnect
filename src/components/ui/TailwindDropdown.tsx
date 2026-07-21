import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption<T = string | number> {
    label: string
    value: T
    icon?: React.ReactNode
}

interface TailwindDropdownProps<T = string | number> {
    options: DropdownOption<T>[]
    value: T
    onChange: (value: T) => void
    labelPrefix?: string
    placeholder?: string
    className?: string
    buttonClassName?: string
    menuAlignment?: 'left' | 'right'
}

export default function TailwindDropdown<T extends string | number>({
    options,
    value,
    onChange,
    labelPrefix,
    placeholder = 'Select option...',
    className = '',
    buttonClassName = '',
    menuAlignment = 'right'
}: TailwindDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={`relative inline-block text-left font-inter ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
                    flex items-center justify-between gap-3 shadow-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                    ${isOpen
                        ? 'bg-white border-indigo-500 text-indigo-900 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                    }
                    ${buttonClassName}
                `}
            >
                <span className="flex items-center gap-2 truncate">
                    {labelPrefix && <span className="font-medium text-slate-500">{labelPrefix}</span>}
                    {selectedOption?.icon}
                    <span className="font-extrabold text-indigo-900">{selectedOption ? selectedOption.label : placeholder}</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    className={`
                        absolute ${menuAlignment === 'right' ? 'right-0' : 'left-0'} top-full mt-2
                        min-w-[180px] sm:w-full bg-white rounded-2xl shadow-xl border border-slate-200/90
                        z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150
                    `}
                >
                    <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
                        {options.map((option) => {
                            const isSelected = option.value === value
                            return (
                                <button
                                    key={String(option.value)}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={`
                                        w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150
                                        flex items-center justify-between gap-3 text-left
                                        ${isSelected
                                            ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        {option.icon}
                                        <span>{option.label}</span>
                                    </span>
                                    {isSelected && (
                                        <Check size={16} className="text-indigo-600 shrink-0" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
