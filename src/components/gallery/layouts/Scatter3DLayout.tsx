import { useState, useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function Scatter3DLayout({ images }: { images: any[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Randomize positions, rotations, and sizes
    const getTransformProps = (id: string, index: number) => {
        // Deterministic pseudo-random based on id/index
        const noise = (id.charCodeAt(0) + index);
        const xOffset = (noise % 80) - 40; // -40% to 40%
        const yOffset = (noise % 60) - 30; // -30% to 30%
        const rotation = (noise % 30) - 15; // -15deg to 15deg
        const scale = 0.7 + ((noise % 50) / 100); // 0.7x to 1.2x
        
        return {
            left: `${50 + xOffset}%`,
            top: `${50 + yOffset}%`,
            rotation,
            scale,
            zIndex: index
        };
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll<HTMLElement>('.scatter-card');
        if (cards.length > 0) {
            animate(cards, {
                opacity: [0, 1],
                scale: [0.7, 1],
                translateY: [80, 0],
                duration: 600,
                delay: stagger(70),
                ease: 'outBack(1.4)'
            });
        }
    }, [images]);

    if (images.length === 0) return null;

    return (
        <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-3xl perspective-1000 my-8 shadow-2xl flex items-center justify-center border border-slate-800">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 via-slate-900 dark:via-slate-950 to-emerald-900/40 opacity-50 blur-3xl"></div>
            
            <p className="absolute bottom-8 left-8 text-white/40 dark:text-slate-500 text-sm font-medium uppercase tracking-[0.2em] z-0">
                Interactive Scatter View
            </p>

            <div ref={containerRef} className="relative w-full h-full transform-style-3d p-20 flex flex-wrap justify-center items-center gap-8 overflow-y-auto custom-scrollbar-hide">
                {images.map((img, index) => {
                    const isHovered = hoveredId === img.id;
                    const isOtherHovered = hoveredId !== null && !isHovered;
                    const transform = getTransformProps(img.id, index);
                    
                    return (
                        <div
                            key={img.id}
                            onMouseEnter={() => setHoveredId(img.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="scatter-card relative flex-none"
                            style={{ 
                                opacity: isOtherHovered ? 0.3 : 1,
                                zIndex: isHovered ? 50 : index,
                                filter: isOtherHovered ? 'grayscale(100%) blur(4px)' : 'none',
                                transition: 'filter 0.4s ease, opacity 0.4s ease, z-index 0s'
                            }}
                        >
                            <div
                                style={{
                                    transform: isHovered 
                                        ? 'scale(1.2) translateY(-20px) rotate(0deg)' 
                                        : `scale(1) translateY(0) rotate(${transform.rotation}deg)`,
                                    boxShadow: isHovered 
                                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease'
                                }}
                                className="w-48 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border-4 border-white dark:border-slate-700 cursor-pointer"
                            >
                                <InteractiveImageMarker 
                                    src={getOptimizedImageUrl(img.cloudinary_url, 400)} 
                                    alt={img.title || ''} 
                                    tags={img.tags || []} 
                                />
                                {img.title && (
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-bold">{img.title}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
