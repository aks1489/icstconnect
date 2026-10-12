import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus as Plus, IconArrowRight as ArrowRight, IconSparkles } from '@tabler/icons-react'
import { mediaService, type SiteMediaItem } from '../../../services/mediaService'

const GallerySection = () => {
    const [galleryMap, setGalleryMap] = useState<Record<string, SiteMediaItem>>(() =>
        mediaService.getCachedMediaByGroup('Campus Gallery')
    )

    useEffect(() => {
        let isMounted = true
        mediaService.getMediaByGroup('Campus Gallery').then((items) => {
            if (isMounted && Object.keys(items).length > 0) {
                setGalleryMap(items)
            }
        })

        const unsubscribe = mediaService.onMediaChange((items) => {
            if (isMounted) {
                const updatedGroup: Record<string, SiteMediaItem> = {}
                Object.entries(items).forEach(([k, item]) => {
                    if (item.group === 'Campus Gallery') {
                        updatedGroup[k] = item
                    }
                })
                if (Object.keys(updatedGroup).length > 0) {
                    setGalleryMap(updatedGroup)
                }
            }
        })

        return () => {
            isMounted = false
            unsubscribe()
        }
    }, [])

    // Ordered list of 6 keys
    const galleryKeys = [
        'home.gallery.1',
        'home.gallery.2',
        'home.gallery.3',
        'home.gallery.4',
        'home.gallery.5',
        'home.gallery.6'
    ]

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300" id="gallery">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200 dark:border-purple-800">
                        <IconSparkles size={14} />
                        <span>Campus Gallery</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Life at ICST Chowberia
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
                        Moments of discovery, teamwork, and innovation captured across our campus, robotics labs, and programming workstations.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {galleryKeys.map((key, index) => {
                        const item = galleryMap[key] || mediaService.getCachedMediaByKey(key)
                        return (
                            <div key={key} className="group">
                                <Link
                                    to="/gallery"
                                    className="block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl cursor-pointer aspect-[4/3] no-underline bg-slate-800/80 border border-slate-200/40 dark:border-slate-800 transition-all duration-300 transform group-hover:-translate-y-1"
                                >
                                    <img
                                        src={item.cloudinary_url}
                                        width={item.recommended_width || 580}
                                        height={item.recommended_height || 435}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 block"
                                        alt={item.alt_text}
                                        onError={(e) => {
                                            const fallback = mediaService.getCachedMediaByKey(key)
                                            if (e.currentTarget.src !== fallback.cloudinary_url) {
                                                e.currentTarget.src = fallback.cloudinary_url
                                            }
                                        }}
                                    />

                                    {/* Hover Details & Icon */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-between p-5 transition-opacity duration-300 backdrop-blur-[1px]">
                                        <div className="self-end w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 shadow-lg">
                                            <Plus size={22} />
                                        </div>

                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                                                Highlight #{index + 1}
                                            </span>
                                            <h3 className="text-white font-bold text-sm line-clamp-1">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 dark:bg-sky-600 text-white font-semibold shadow-lg shadow-slate-900/10 dark:shadow-sky-600/20 hover:bg-slate-800 dark:hover:bg-sky-500 hover:-translate-y-1 transition-all no-underline"
                    >
                        <span>Explore Full Photo Chronicles</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default GallerySection
