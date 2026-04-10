import { useState } from 'react'

interface Tag {
    x: number;
    y: number;
    label: string;
    description: string;
}

interface InteractiveImageMarkerProps {
    src: string;
    alt: string;
    tags: Tag[];
    className?: string;
    onClick?: () => void;
}

export default function InteractiveImageMarker({ src, alt, tags, className = '', onClick }: InteractiveImageMarkerProps) {
    const [hoveredTag, setHoveredTag] = useState<number | null>(null);

    return (
        <div 
            className={`relative w-full h-full group/image ${className}`}
            onClick={onClick}
        >
            <img 
                src={src} 
                alt={alt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                loading="lazy"
            />
            
            {/* Tags Overlay */}
            {tags && tags.length > 0 && (
                <div className="absolute inset-0 z-10 pointer-events-none group-hover/image:pointer-events-auto">
                    {tags.map((tag, idx) => (
                        <div 
                            key={idx}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                            onMouseEnter={() => setHoveredTag(idx)}
                            onMouseLeave={() => setHoveredTag(null)}
                        >
                            {/* The Marker Dot */}
                            <div className="relative w-5 h-5 cursor-help">
                                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full scale-150 animate-ping opacity-60"></div>
                                <div className="absolute inset-0 bg-white border-[3px] border-indigo-500 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-125 hover:border-indigo-400">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* The Tooltip (Glassmorphic) */}
                            <div 
                                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-max max-w-[220px] bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl transition-all duration-300 origin-bottom 
                                ${hoveredTag === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                            >
                                <span className="block text-white font-bold text-sm tracking-wide shadow-black/50 drop-shadow-md mb-1">
                                    {tag.label}
                                </span>
                                {tag.description && (
                                    <span className="block text-slate-100 text-[11px] leading-snug drop-shadow-md">
                                        {tag.description}
                                    </span>
                                )}
                                {/* Triangle pointer */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white/10 backdrop-blur-md border-b border-r border-white/20 transform rotate-45 -mt-1.5"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
