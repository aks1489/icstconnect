import { Link } from 'react-router-dom'
import { IconPlus as Plus, IconArrowRight as ArrowRight } from '@tabler/icons-react'

const galleryItems = [
    {
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt: 'ICST students collaborating during computer science software development seminar'
    },
    {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt: 'Interactive IT classroom discussion and programming project review at ICST Chowberia'
    },
    {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80',
        alt: 'Students learning teamwork and practical coding skills in technical laboratory'
    },
    {
        url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80',
        alt: 'Student coding mentor presenting algorithms and problem solving session'
    },
    {
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt: 'ICST campus workshop event on modern digital frameworks and career guidance'
    },
    {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        alt: 'Faculty member delivering hands-on computer engineering instructions'
    }
]

const GallerySection = () => {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors" id="gallery">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200 dark:border-purple-800">
                        Campus Gallery
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">Life at ICST Chowberia</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-3">Moments of discovery, teamwork, and innovation captured across our campus and digital labs.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {galleryItems.map((item, index) => (
                        <div key={index} className="group">
                            <Link to="/gallery" className="block relative overflow-hidden rounded-2xl shadow-md cursor-pointer aspect-[4/3] no-underline">
                                <img
                                    src={item.url}
                                    width={580}
                                    height={435}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={item.alt}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                                        <Plus className="text-2xl" size={28} />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/gallery"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 dark:bg-sky-600 text-white font-semibold shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 hover:-translate-y-1 transition-all no-underline"
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
