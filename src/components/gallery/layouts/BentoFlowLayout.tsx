import { motion } from 'framer-motion'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function BentoFlowLayout({ images }: { images: any[] }) {
    
    // Assign sizes cyclically to create a bento box look
    const getBentoClass = (index: number) => {
        const pattern = [
            'col-span-12 md:col-span-8 row-span-2 aspect-[16/9] md:aspect-[2/1]', // Hero wide
            'col-span-6 md:col-span-4 row-span-1 aspect-square', // Small square
            'col-span-6 md:col-span-4 row-span-1 aspect-square', // Small square
            'col-span-12 md:col-span-4 row-span-2 aspect-[3/4]', // Tall
            'col-span-12 md:col-span-8 row-span-2 aspect-video' // Wide
        ];
        return pattern[index % pattern.length];
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-12 auto-rows-min gap-4 md:gap-6">
                {images.map((img, index) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "50px" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                        className={`relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group ${getBentoClass(index)}`}
                    >
                        <InteractiveImageMarker 
                            src={getOptimizedImageUrl(img.cloudinary_url, 1000)} 
                            alt={img.title || ''} 
                            tags={img.tags || []} 
                            className="bg-slate-100"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-5 md:p-8">
                            <div>
                                {img.title && (
                                    <h4 className="text-white font-bold text-xl md:text-2xl tracking-tight mb-2 origin-left scale-90 group-hover:scale-100 transition-transform duration-300">
                                        {img.title}
                                    </h4>
                                )}
                                {img.description && (
                                    <p className="text-white/80 text-sm max-w-md hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        {img.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
