import React from 'react'

interface TechPopupProps {
    name: string
    color: string
    description: string
    keyPoints: string[]
    opportunities: string
    isVisible: boolean
    position: { x: number; y: number }
}

const TechPopup: React.FC<TechPopupProps> = ({
    name,
    color,
    description,
    keyPoints,
    opportunities,
    isVisible,
    position
}) => {
    if (!isVisible) return null

    return (
        <div
            className="fixed z-50 w-72 md:w-80 p-5 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/20 transition-all duration-300 animate-in fade-in zoom-in-95"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -110%)', // Position above the cursor/touch
                boxShadow: `0 20px 40px -10px ${color}30`
            }}
        >
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                <div
                    className="w-3 h-3 rounded-full shadow-[0_0_10px]"
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                ></div>
                <h3 className="font-bold text-slate-900 text-lg">{name}</h3>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {description}
            </p>

            <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                    {keyPoints.map((point, index) => (
                        <span
                            key={index}
                            className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600"
                        >
                            {point}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Career Path</h4>
                <p className="text-xs font-semibold" style={{ color: color }}>
                    {opportunities}
                </p>
            </div>

            {/* Arrow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white/90"
            ></div>
        </div>
    )
}

export default TechPopup
