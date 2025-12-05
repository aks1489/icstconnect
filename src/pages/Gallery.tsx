import { useState, useEffect } from 'react'
import Skeleton from '../components/ui/Skeleton'

const Gallery = () => {
    const categories = ['All', 'Campus', 'Events', 'Classrooms', 'Students']
    const [activeCategory, setActiveCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const images = [
        {
            id: 1,
            category: 'Campus',
            src: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1686&q=80',
            title: 'Main Building',
            desc: 'The heart of our campus'
        },
        {
            id: 2,
            category: 'Classrooms',
            src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            title: 'Modern Labs',
            desc: 'State-of-the-art computer labs'
        },
        {
            id: 3,
            category: 'Students',
            src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            title: 'Group Discussion',
            desc: 'Students collaborating on projects'
        },
        {
            id: 4,
            category: 'Events',
            src: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            title: 'Annual Tech Fest',
            desc: 'Celebrating innovation and creativity'
        },
        {
            id: 5,
            category: 'Campus',
            src: 'https://images.unsplash.com/photo-1592280771884-131186570d96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            title: 'Library',
            desc: 'A quiet place for study and research'
        },
        {
            id: 6,
            category: 'Students',
            src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80',
            title: 'Graduation Day',
            desc: 'Celebrating student success'
        },
        {
            id: 7,
            category: 'Classrooms',
            src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80',
            title: 'Smart Classrooms',
            desc: 'Interactive learning environment'
        },
        {
            id: 8,
            category: 'Events',
            src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            title: 'Workshop',
            desc: 'Hands-on training sessions'
        }
    ]

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter(img => img.category === activeCategory)

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Gallery</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Glimpses of life at ICST - Chowberia. Explore our campus, events, and vibrant student community.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === category
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-72 rounded-2xl overflow-hidden">
                                <Skeleton className="w-full h-full" />
                            </div>
                        ))
                    ) : (
                        filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="group relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <img
                                    src={image.src}
                                    alt={image.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        {image.category}
                                    </span>
                                    <h3 className="text-white text-xl font-bold mb-1">{image.title}</h3>
                                    <p className="text-slate-300 text-sm">{image.desc}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Gallery
