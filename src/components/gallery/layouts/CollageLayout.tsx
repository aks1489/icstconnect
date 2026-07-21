import { motion } from 'framer-motion'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function CollageLayout({ images }: { images: any[] }) {
    // Generate a random aspect ratio class for the collage feel, stable based on ID
    const getAspectClass = (id: string, index: number) => {
        // Pseudo-random but deterministic
        const num = (id.charCodeAt(0) + index) % 5;
        switch (num) {
            case 0: return 'row-span-2';
            case 1: return 'col-span-2 md:col-span-2';
            case 2: return 'col-span-1';
            case 3: return 'col-span-2 row-span-2';
            case 4: return 'row-span-2';
            default: return 'col-span-1';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
                {images.map((img, index) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "50px" }}
                        transition={{ 
                            delay: (index % 10) * 0.1, 
                            duration: 0.5, 
                            type: "spring", 
                            stiffness: 100 
                        }}
                        className={`relative w-full h-full rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group ${getAspectClass(img.id, index)}`}
                    >
                        <InteractiveImageMarker 
                            src={getOptimizedImageUrl(img.cloudinary_url, 800)} 
                            alt={img.title || ''} 
                            tags={img.tags || []}
                            className="bg-slate-100" 
                        />
                        
                        {/* Elegant overlay on hover for standard collage items */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end h-1/2">
                            {img.title && (
                                <h4 className="text-white font-bold text-lg leading-tight mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {img.title}
                                </h4>
                            )}
                            {img.description && (
                                <p className="text-white/80 text-sm line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {img.description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
