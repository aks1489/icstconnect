
const GallerySection = () => {
    const images = [
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80',
        'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'
    ]

    return (
        <section className="py-20 bg-slate-50" id="gallery">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        Gallery
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">Life at ICST</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((img, index) => (
                        <div key={index} className="group">
                            <div className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer aspect-[4/3]">
                                <img
                                    src={img}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={`Gallery ${index + 1}`}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100">
                                        <i className="bi bi-plus-lg text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default GallerySection
