import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveImageMarker from '../InteractiveImageMarker'
import { getOptimizedImageUrl } from '../../../lib/cloudinary'

export default function CurveRoadLayout({ images }: { images: any[] }) {
    const [viewMode, setViewMode] = useState<'events' | 'story'>('events');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<any | null>(null);

    // EVENTS VIEW: Group by event name
    const events = useMemo(() => {
        const groups: Record<string, any[]> = {};
        const noEvent: any[] = [];

        images.forEach(img => {
            if (img.event_name) {
                if (!groups[img.event_name]) groups[img.event_name] = [];
                groups[img.event_name].push(img);
            } else {
                noEvent.push(img);
            }
        });

        const sortedEvents = Object.keys(groups).map(name => {
            const groupImages = groups[name];
            let cover = groupImages.find(img => img.group_cover);
            if (!cover) cover = groupImages[0];
            const others = groupImages.filter(img => img.id !== cover.id);

            return {
                name,
                date: cover.event_date ? new Date(cover.event_date) : new Date(cover.created_at || Date.now()),
                cover,
                others
            }
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); 

        return { grouped: sortedEvents, standalone: noEvent };
    }, [images]);

    // STORY VIEW: Flat list sorted by date globally
    const storyImages = useMemo(() => {
        return [...images].sort((a, b) => {
            const dateA = a.event_date ? new Date(a.event_date).getTime() : new Date(a.created_at || Date.now()).getTime();
            const dateB = b.event_date ? new Date(b.event_date).getTime() : new Date(b.created_at || Date.now()).getTime();
            return dateB - dateA;
        });
    }, [images]);

    const getAspectClass = (id: string, index: number) => {
        const num = (id.charCodeAt(0) + index) % 5;
        switch (num) {
            case 0: return 'row-span-2 col-span-1 flex flex-col h-full';
            case 1: return 'col-span-2 row-span-1 flex flex-col h-full';
            case 2: return 'col-span-1 row-span-1 flex flex-col h-full';
            case 3: return 'col-span-1 row-span-1 flex flex-col h-full';
            case 4: return 'row-span-2 col-span-1 flex flex-col h-full';
            default: return 'flex flex-col h-full';
        }
    };

    return (
        <div className="relative min-h-[60vh] pt-12 pb-20 px-4 max-w-6xl mx-auto overflow-hidden">
            
            {/* View Mode Toggle */}
            <div className="flex justify-center mb-20 relative z-20">
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-1">
                    <button 
                        onClick={() => { setViewMode('events'); setSelectedEvent(null); }}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'events' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                    >
                        Event Stacks
                    </button>
                    <button 
                        onClick={() => { setViewMode('story'); setSelectedEvent(null); }}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'story' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                    >
                        Story Timeline
                    </button>
                </div>
            </div>

            {/* The SVG Road Curve (Aesthetic Background) */}
            <div className="absolute inset-0 pointer-events-none opacity-10 md:opacity-30 mt-20">
                <svg viewBox="0 0 1000 2000" preserveAspectRatio="xMidYMin slice" className="w-full h-[200%] stroke-indigo-500 fill-transparent stroke-[3] stroke-dasharray-[10,10]">
                    <path d="M 500 0 C 800 200, 200 400, 500 600 C 800 800, 200 1000, 500 1200 C 800 1400, 200 1600, 500 1800 C 800 2000, 200 2200, 500 2400" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col gap-32">

                {/* ===================== VIEW MODE: EVENTS ===================== */}
                {viewMode === 'events' && events.grouped.map((event, index) => {
                    const isLeft = index % 2 === 0;
                    const isSelected = selectedEvent === event.name;

                    return (
                        <motion.div layout key={event.name} className="relative w-full scroll-mt-24" id={`event-${event.name.replace(/\s+/g, '-')}`}>
                            <AnimatePresence mode="wait">
                                {!isSelected ? (
                                    <motion.div 
                                        key="collapsed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex flex-col md:flex-row items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                    >
                                        <motion.div 
                                            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            className={`w-full md:w-1/2 flex flex-col ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center`}
                                        >
                                            <h3 className="text-3xl font-bold text-slate-800 mb-2">{event.name}</h3>
                                            {event.cover.event_date && (
                                                <p className="text-indigo-600 font-medium font-mono text-sm mb-4">
                                                    {new Date(event.cover.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            )}
                                            <p className="text-slate-500 max-w-sm">
                                                {event.cover.description || 'Explore the moments captured during this amazing event.'}
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setSelectedEvent(event.name);
                                                    setTimeout(() => {
                                                        const el = document.getElementById(`event-${event.name.replace(/\s+/g, '-')}`);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }, 100);
                                                }}
                                                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
                                            >
                                                View Gallery ({event.others.length + 1} photos)
                                            </button>
                                        </motion.div>

                                        <div className="w-full md:w-1/2 flex justify-center perspective-1000 mt-8 md:mt-0 px-4 md:px-0">
                                            <motion.div 
                                                className="relative w-[90%] sm:w-full max-w-md aspect-[4/3] mx-auto cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedEvent(event.name);
                                                    setTimeout(() => {
                                                        const el = document.getElementById(`event-${event.name.replace(/\s+/g, '-')}`);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }, 100);
                                                }}
                                            >
                                                {event.others.slice(0, 3).map((_, i) => (
                                                    <div 
                                                        key={i}
                                                        className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-slate-200 transition-transform duration-500 group-hover:-translate-y-2"
                                                        style={{
                                                            transform: `rotate(${(i + 1) * 4 * (isLeft ? 1 : -1)}deg) translateX(${(i + 1) * 10}px)`,
                                                            zIndex: 10 - i
                                                        }}
                                                    ></div>
                                                ))}
                                                <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                                                    <img src={getOptimizedImageUrl(event.cover.cloudinary_url, 800)} alt={event.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                                        <span className="text-white font-bold text-lg drop-shadow-md">{event.cover.title || 'Cover Photo'}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="expanded"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white max-h-[75vh] overflow-y-auto custom-scrollbar relative"
                                    >
                                        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 md:px-10 pt-6 md:pt-10 pb-4 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div>
                                                <h4 className="text-3xl font-bold text-slate-800 mb-2">{event.name}</h4>
                                                <p className="text-sm text-slate-500">{event.others.length + 1} photos • Click any thumbnail to view full details</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedEvent(null);
                                                    setTimeout(() => {
                                                        const el = document.getElementById(`event-${event.name.replace(/\s+/g, '-')}`);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }, 100);
                                                }} 
                                                className="self-start md:self-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold bg-white border border-slate-200 px-5 py-2 rounded-full text-sm shadow-sm transition-colors"
                                            >
                                                Collapse Gallery
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[160px] grid-flow-dense mt-4 px-6 md:px-10 pb-10">
                                            {[event.cover, ...event.others].map((img, idx) => (
                                                <div 
                                                    key={img.id} 
                                                    className={`rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all bg-slate-100 ${getAspectClass(img.id, idx)}`}
                                                    onClick={() => setExpandedImage(img)}
                                                >
                                                    <img src={getOptimizedImageUrl(img.cloudinary_url, 600)} alt="Thumbnail" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {viewMode === 'events' && events.standalone.length > 0 && (
                    <div className="mt-20 border-t border-slate-200 pt-20">
                        <h3 className="text-2xl font-bold text-center mb-12 text-slate-400">Other Moments</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {events.standalone.map(img => (
                                <motion.div 
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="rounded-xl overflow-hidden aspect-[4/3] md:aspect-square shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => setExpandedImage(img)}
                                >
                                    <img src={getOptimizedImageUrl(img.cloudinary_url, 400)} alt="Thumbnail" className="w-full h-full object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===================== VIEW MODE: STORY (Chronological Flat View) ===================== */}
                {viewMode === 'story' && storyImages.map((img, index) => {
                    const isLeft = index % 2 === 0;

                    return (
                        <motion.div 
                            layout 
                            key={img.id} 
                            className={`flex flex-col md:flex-row items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} relative z-20`}
                        >
                            {/* Text Info */}
                            <motion.div 
                                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`w-full md:w-1/2 flex flex-col ${isLeft ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center`}
                            >
                                {img.event_name && (
                                    <div className={`flex w-full mb-3 ${isLeft ? 'md:justify-end justify-center' : 'md:justify-start justify-center'}`}>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm">
                                            {img.event_name}
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-3xl font-bold text-slate-800 mb-2">
                                    {img.title || 'Captured Moment'}
                                </h3>
                                {(img.event_date || img.created_at) && (
                                    <p className="text-slate-400 font-medium font-mono text-sm mb-4">
                                        {new Date(img.event_date || img.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                                {img.description && (
                                    <p className="text-slate-500 max-w-sm text-sm">
                                        {img.description}
                                    </p>
                                )}
                            </motion.div>

                            {/* Single Image Frame */}
                            <div className="w-full md:w-1/2 flex justify-center perspective-1000 mt-6 md:mt-0 px-4 md:px-0">
                                <motion.div 
                                    className="relative w-[90%] sm:w-[80%] md:w-[90%] max-w-md aspect-[4/3] mx-auto cursor-pointer group"
                                    onClick={() => setExpandedImage(img)}
                                >
                                    <div className={`absolute inset-0 bg-white rounded-2xl shadow-xl -z-10 transition-transform duration-500 ${isLeft ? 'rotate-2 group-hover:rotate-6' : '-rotate-2 group-hover:-rotate-6'}`}></div>
                                    <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                                        <img src={getOptimizedImageUrl(img.cloudinary_url, 800)} alt={img.title || 'Story Moment'} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                            <span className="text-white text-sm font-bold uppercase tracking-widest border-2 border-white/50 px-6 py-2 rounded-full">Explore Picture</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}

            </div>

            {/* Lightbox Overlay for Expanded Image Details */}
            {expandedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-200/60 backdrop-blur-md" onClick={() => setExpandedImage(null)}></div>
                    <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-slate-100">
                        <button 
                            onClick={() => setExpandedImage(null)} 
                            className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div className="w-full md:w-3/5 h-[40vh] sm:h-[50vh] md:h-auto bg-slate-50 flex items-center justify-center relative p-2 md:p-8">
                            <InteractiveImageMarker 
                                src={getOptimizedImageUrl(expandedImage.cloudinary_url, 1200)} 
                                alt={expandedImage.title || ''} 
                                tags={expandedImage.tags || []}
                            />
                        </div>
                        
                        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col overflow-y-auto bg-white min-h-[30vh]">
                            <div className="mb-4">
                                {(expandedImage.event_name || expandedImage.event_date || expandedImage.created_at) && (
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block mb-3 bg-indigo-50 w-max px-3 py-1.5 rounded-full border border-indigo-100">
                                        {expandedImage.event_name ? `${expandedImage.event_name}` : 'Moment'}
                                        {' • '}
                                        {new Date(expandedImage.event_date || expandedImage.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                                <h3 className="text-3xl font-bold text-slate-800 leading-tight">
                                    {expandedImage.title || 'Untitled Moment'}
                                </h3>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap flex-grow mt-4">
                                {expandedImage.description || 'Explore the interactive tags in the photo to look at specific details!'}
                            </p>
                            
                            {expandedImage.categories && expandedImage.categories.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block w-full mb-1">Tags</span>
                                    {expandedImage.categories.slice(0,3).map((id: string, i: number) => (
                                        <span key={i} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded">Category Info</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
