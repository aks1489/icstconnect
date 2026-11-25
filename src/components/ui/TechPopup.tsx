import React from 'react'

interface TechPopupProps {
    name: string
    color: string
    chipBg?: string
    iconUrl?: string
    description: string
    keyPoints: string[]
    opportunities: string
    isVisible: boolean
    position: { x: number; y: number }
}

const TechPopup: React.FC<TechPopupProps> = ({
    name,
    color,
    chipBg = 'rgba(37, 114, 171, 0.10)',
    iconUrl,
    description,
    keyPoints,
    opportunities,
    isVisible,
    position
}) => {
    if (!isVisible) return null

    const safeLeft =
        typeof window !== 'undefined'
            ? Math.min(Math.max(position.x, 165), window.innerWidth - 165)
            : position.x

    return (
        <div
            className="fixed z-50 w-72 md:w-80 p-5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-xl shadow-[0_24px_54px_-12px_rgba(15,23,42,0.22)] border border-slate-200/90 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-none"
            style={{
                left: safeLeft,
                top: position.y,
                transform: 'translate(-50%, -110%)'
            }}
        >
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

            <p className="text-[#475569] text-xs sm:text-sm mb-4 leading-relaxed">
                {description}
            </p>

            <div className="mb-4">
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

            <div>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-1">Career Path</h4>
                <p className="text-xs font-semibold" style={{ color }}>
                    {opportunities}
                </p>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#FFFFFF]" />
        </div>
    )
}

export default TechPopup
