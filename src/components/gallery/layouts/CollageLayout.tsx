import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function CollageLayout({ images }: { images: any[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (typeof IntersectionObserver === 'undefined') {
            const items = container.querySelectorAll<HTMLElement>('.collage-item');
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
                    const delay = (Number(el.dataset.index || 0) % 10) * 80;
                    animate(el, {
                        opacity: [0, 1],
                        translateY: [30, 0],
                        scale: [0.9, 1],
                        duration: 550,
                        delay,
                        ease: 'outBack(1.2)'
                    });
                    observer.unobserve(el);
                }
            });
        }, { rootMargin: '50px' });

        const items = container.querySelectorAll('.collage-item');
        items.forEach(item => observer.observe(item));

        return () => observer.disconnect();
    }, [images]);

    return (
        <div ref={containerRef} className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
                {images.map((img, index) => (
                    <div
                        key={img.id}
                        data-index={index}
                        style={{ opacity: 0, transform: 'translateY(30px) scale(0.9)' }}
                        className={`collage-item relative w-full h-full rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-200/60 dark:border-slate-800/80 ${getAspectClass(img.id, index)}`}
                    >
                        <InteractiveImageMarker 
                            src={getOptimizedImageUrl(img.cloudinary_url, 800)} 
                            alt={img.title || ''} 
                            tags={img.tags || []}
                            className="bg-slate-100 dark:bg-slate-900" 
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
                    </div>
                ))}
            </div>
        </div>
    )
}
