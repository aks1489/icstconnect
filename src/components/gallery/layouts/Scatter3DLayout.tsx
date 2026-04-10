import { motion } from 'framer-motion'
import { useState } from 'react'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function Scatter3DLayout({ images }: { images: any[] }) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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

    if (images.length === 0) return null;

    return (
        <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-slate-900 rounded-3xl perspective-1000 my-8 shadow-2xl flex items-center justify-center">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 via-slate-900 to-emerald-900/40 opacity-50 blur-3xl"></div>
            
            <p className="absolute bottom-8 left-8 text-white/40 text-sm font-medium uppercase tracking-[0.2em] z-0">
                Interactive Scatter View
            </p>

            <div className="relative w-full h-full transform-style-3d p-20 flex flex-wrap justify-center items-center gap-8 overflow-y-auto custom-scrollbar-hide">
                {images.map((img, index) => {
                    const isHovered = hoveredId === img.id;
                    const isOtherHovered = hoveredId !== null && !isHovered;
                    
                    return (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0, y: 100 }}
                            animate={{ opacity: isOtherHovered ? 0.3 : 1, y: 0, scale: 1 }}
                            transition={{ 
                                delay: index * 0.1, 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 20 
                            }}
                            onMouseEnter={() => setHoveredId(img.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative flex-none"
                            style={{ 
                                zIndex: isHovered ? 50 : index,
                                filter: isOtherHovered ? 'grayscale(100%) blur(4px)' : 'none',
                                transition: 'filter 0.4s ease, z-index 0s'
                            }}
                        >
                            <motion.div
                                animate={isHovered ? {
                                    scale: 1.2,
                                    rotate: 0,
                                    y: -20,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                } : {
                                    scale: 1,
                                    rotate: getTransformProps(img.id, index).rotation,
                                    y: 0,
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                }}
                                className="w-48 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-800 border-4 border-white cursor-pointer"
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
                            </motion.div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
