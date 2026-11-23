import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function BentoFlowLayout({ images }: { images: any[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Assign sizes cyclically to create a bento box look
    const getBentoClass = (index: number) => {
        const pattern = [
            'col-span-12 md:col-span-8 row-span-2', // Hero wide
            'col-span-6 md:col-span-4 row-span-1', // Small component
            'col-span-6 md:col-span-4 row-span-1', // Small component
            'col-span-12 md:col-span-4 row-span-2', // Tall
            'col-span-12 md:col-span-8 row-span-2' // Wide
        ];
        return pattern[index % pattern.length];
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (typeof IntersectionObserver === 'undefined') {
            const items = container.querySelectorAll<HTMLElement>('.bento-item');
            items.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = (Number(el.dataset.index || 0) % 5) * 50;
                    animate(el, {
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 600,
                        delay,
                        ease: 'outCubic'
                    });
                    observer.unobserve(el);
                }
            });
        }, { rootMargin: '50px' });

        const items = container.querySelectorAll('.bento-item');
        items.forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, [images]);

    return (
        <div ref={containerRef} className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-12 auto-rows-[180px] md:auto-rows-[250px] lg:auto-rows-[300px] gap-4 md:gap-6 grid-flow-dense">
                {images.map((img, index) => (
                    <div
                        key={img.id}
                        data-index={index}
                        style={{ opacity: 0, transform: 'scale(0.95)' }}
                        className={`bento-item relative w-full h-full rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-slate-200/60 dark:border-slate-800/80 ${getBentoClass(index)}`}
                    >
                        <InteractiveImageMarker 
                            src={getOptimizedImageUrl(img.cloudinary_url, 1000)} 
                            alt={img.title || ''} 
                            tags={img.tags || []} 
                            className="bg-slate-100 dark:bg-slate-900"
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
                    </div>
                ))}
            </div>
        </div>
    )
}
