import { useState, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Skeleton from '../components/ui/Skeleton'

// Layouts
import CurveRoadLayout from '../components/gallery/layouts/CurveRoadLayout'
import CollageLayout from '../components/gallery/layouts/CollageLayout'
import Scatter3DLayout from '../components/gallery/layouts/Scatter3DLayout'
import BentoFlowLayout from '../components/gallery/layouts/BentoFlowLayout'

interface Category {
    id: string;
    name: string;
    layout_style: string;
}

interface GalleryImage {
    id: string;
    cloudinary_url: string;
    title: string | null;
    description: string | null;
    event_name: string | null;
    event_date: string | null;
    group_cover: boolean;
    categories: string[];
    tags: any[];
}

export default function Gallery() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, imgRes] = await Promise.all([
                    supabase.from('gallery_categories').select('*').order('name'),
                    supabase.from('gallery_images').select('*').order('created_at', { ascending: false })
                ]);
                
                if (catRes.error) throw catRes.error;
                if (imgRes.error) throw imgRes.error;

                const dbCategories = catRes.data || [];
                setCategories([{id: 'all', name: 'All Categories', layout_style: 'master'}, ...dbCategories]);
                setImages(imgRes.data || []);
            } catch (error) {
                console.error('Error loading gallery:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeCategory = useMemo(() => {
        return categories.find(c => c.id === activeCategoryId) || categories[0];
    }, [categories, activeCategoryId]);

    const filteredImages = useMemo(() => {
        if (activeCategoryId === 'all') return images;
        return images.filter(img => img.categories?.includes(activeCategoryId));
    }, [images, activeCategoryId]);

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            
            {/* Dynamic Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-slate-900 border-b border-slate-200">
                
                {/* Parallax Background */}
                <motion.div 
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 pointer-events-none"
                >
                    {images.length > 0 && activeCategoryId === 'all' && (
                        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-2 opacity-30 transform scale-110 -rotate-6 blur-[2px]">
                            {images.slice(0, 24).map(img => (
                                <div key={img.id} className="aspect-square bg-slate-800 rounded-lg overflow-hidden">
                                    <img src={img.cloudinary_url} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </motion.div>

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                            Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Chronicles</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
                            Immerse yourself in the moments that define our vibrant community. Explore interactive stories, events, and campus life.
                        </p>
                    </motion.div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {loading ? (
                            [1,2,3,4].map(i => <div key={i} className="w-24 h-10 bg-white/10 animate-pulse rounded-full"></div>)
                        ) : (
                            categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategoryId(category.id)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md ${
                                        activeCategoryId === category.id
                                        ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Layout Engine */}
            <main className="relative z-20 pb-20">
                {loading ? (
                    <div className="w-full max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="w-full aspect-[4/3] rounded-3xl" />)}
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center py-32">
                        <p className="text-slate-400 font-medium text-lg">No photos found in this category.</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700">
                        {/* Render based on layout style */}
                        {(activeCategory?.layout_style === 'curve_road') && <CurveRoadLayout images={filteredImages} />}
                        {(activeCategory?.layout_style === 'collage') && <CollageLayout images={filteredImages} />}
                        {(activeCategory?.layout_style === 'scatter_3d') && <Scatter3DLayout images={filteredImages} />}
                        {(activeCategory?.layout_style === 'bento_flow' || activeCategory?.layout_style === 'master') && <BentoFlowLayout images={filteredImages} />}
                    </div>
                )}
            </main>
        </div>
    )
}
