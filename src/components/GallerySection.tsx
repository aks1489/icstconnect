

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
        <section className="py-5" id="gallery">
            <div className="container">
                <div className="text-center mb-5">
                    <h6 className="text-primary fw-bold text-uppercase">Gallery</h6>
                    <h2 className="display-5 fw-bold">Life at ICST</h2>
                </div>
                <div className="row g-3">
                    {images.map((img, index) => (
                        <div key={index} className="col-md-4 col-sm-6">
                            <div className="overflow-hidden rounded-4 shadow-sm position-relative group">
                                <img src={img} className="img-fluid w-100 transition-transform duration-500 hover-scale" alt={`Gallery ${index + 1}`} style={{ height: '250px', objectFit: 'cover' }} />
                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 opacity-0 hover-opacity-100 d-flex align-items-center justify-content-center transition-opacity duration-300">
                                    <i className="bi bi-plus-lg text-white display-4"></i>
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
