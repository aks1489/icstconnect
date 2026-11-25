import React, { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface TechPopupAnchorRect {
    top: number
    bottom: number
    left: number
    width: number
}

export interface TechCompanyUsage {
    name: string
    iconUrl: string
}

interface TechPopupProps {
    name: string
    color: string
    chipBg?: string
    iconUrl?: string
    description: string
    keyPoints: string[]
    opportunities: string
    usedBy?: TechCompanyUsage[]
    isVisible: boolean
    anchorRect: TechPopupAnchorRect | null
}

const NAV_CLEARANCE = 82
const CARET_GAP = 12

const TechPopup: React.FC<TechPopupProps> = ({
    name,
    color,
    chipBg = 'rgba(37, 114, 171, 0.10)',
    iconUrl,
    description,
    keyPoints,
    opportunities,
    usedBy,
    isVisible,
    anchorRect
}) => {
    const popupRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState<{
        left: number
        top: number
        caretLeft: number
        placement: 'top' | 'bottom'
    } | null>(null)

    useLayoutEffect(() => {
        if (!isVisible || !anchorRect || typeof window === 'undefined') {
            setCoords(null)
            return
        }

        const el = popupRef.current
        const popupW = el?.offsetWidth || (window.innerWidth < 768 ? 288 : 320)
        const popupH = el?.offsetHeight || 305

        const vw = window.innerWidth
        const vh = window.innerHeight
        const anchorCenterX = anchorRect.left + anchorRect.width / 2

        const left = Math.min(Math.max(12, anchorCenterX - popupW / 2), vw - popupW - 12)
        const caretLeft = Math.min(Math.max(22, anchorCenterX - left), popupW - 22)

        const spaceAbove = anchorRect.top - NAV_CLEARANCE
        const spaceBelow = vh - anchorRect.bottom - 16
        const placement: 'top' | 'bottom' =
            spaceAbove >= popupH + CARET_GAP || spaceAbove >= spaceBelow ? 'top' : 'bottom'

        const top =
            placement === 'top'
                ? Math.max(NAV_CLEARANCE, anchorRect.top - popupH - CARET_GAP)
                : Math.min(vh - popupH - 12, anchorRect.bottom + CARET_GAP)

        setCoords({ left, top, caretLeft, placement })
    }, [isVisible, anchorRect, name])

    if (!isVisible || !anchorRect || typeof document === 'undefined' || typeof window === 'undefined') {
        return null
    }

    const fallbackW = window.innerWidth < 768 ? 288 : 320
    const fallbackLeft = Math.min(
        Math.max(12, anchorRect.left + anchorRect.width / 2 - fallbackW / 2),
        window.innerWidth - fallbackW - 12
    )
    const fallbackPlacement: 'top' | 'bottom' =
        anchorRect.top - NAV_CLEARANCE >= 317 ? 'top' : 'bottom'
    const fallbackTop =
        fallbackPlacement === 'top' ? Math.max(NAV_CLEARANCE, anchorRect.top - 317) : anchorRect.bottom + CARET_GAP

    const activeCoords = coords ?? {
        left: fallbackLeft,
        top: fallbackTop,
        caretLeft: Math.min(
            Math.max(22, anchorRect.left + anchorRect.width / 2 - fallbackLeft),
            fallbackW - 22
        ),
        placement: fallbackPlacement
    }

    return createPortal(
        <div
            ref={popupRef}
            role="tooltip"
            className="fixed z-[1100] w-72 md:w-80 p-5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-xl shadow-[0_24px_54px_-12px_rgba(15,23,42,0.24)] border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
            style={{
                left: activeCoords.left,
                top: activeCoords.top
            }}
        >
            {activeCoords.placement === 'bottom' && (
                <div
                    aria-hidden="true"
                    style={{ left: activeCoords.caretLeft }}
                    className="absolute top-0 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[9px] border-b-[#FFFFFF]"
                />
            )}

            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                {iconUrl ? (
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 shrink-0 border border-slate-200/80"
                        style={{ backgroundColor: chipBg }}
                    >
                        <img
                            src={iconUrl}
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            loading="lazy"
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                ) : (
                    <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
                    />
                )}
                <h3 className="font-bold text-[#0F172A] text-base tracking-tight">{name}</h3>
            </div>

            <p className="text-[#475569] text-xs sm:text-sm mb-3.5 leading-relaxed">
                {description}
            </p>

            <div className="mb-3.5">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-1.5">
                    {keyPoints.map((point, index) => (
                        <span
                            key={index}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
                            style={{ backgroundColor: chipBg, color }}
                        >
                            {point}
                        </span>
                    ))}
                </div>
            </div>

            <div className={usedBy && usedBy.length > 0 ? 'mb-3.5' : ''}>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-1">Career Path</h4>
                <p className="text-xs font-semibold mb-0" style={{ color }}>
                    {opportunities}
                </p>
            </div>

            {usedBy && usedBy.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-2">
                        Used in Industry By
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {usedBy.map((company) => (
                            <span
                                key={company.name}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-[#0F172A]"
                            >
                                <img
                                    src={company.iconUrl}
                                    alt=""
                                    aria-hidden="true"
                                    width={14}
                                    height={14}
                                    loading="lazy"
                                    className="w-3.5 h-3.5 object-contain shrink-0"
                                />
                                <span>{company.name}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {activeCoords.placement === 'top' && (
                <div
                    aria-hidden="true"
                    style={{ left: activeCoords.caretLeft }}
                    className="absolute bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#FFFFFF]"
                />
            )}
        </div>,
        document.body
    )
}

export default TechPopup
