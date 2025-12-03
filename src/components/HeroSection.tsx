import { useState, useEffect } from 'react'

const HeroSection = () => {
    const technologies = [
        { name: 'React', color: '#61DAFB', icon: 'bi-filetype-jsx' },
        { name: 'Bootstrap', color: '#7952B3', icon: 'bi-bootstrap-fill' },
        { name: 'Node.js', color: '#339933', icon: 'bi-filetype-js' },
        { name: 'TailwindCSS', color: '#06B6D4', icon: 'bi-wind' }
    ]

    const [currentTechIndex, setCurrentTechIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTechIndex((prev) => (prev + 1) % technologies.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const currentTech = technologies[currentTechIndex]

    return (
        <section className="py-3 py-lg-5 bg-light overflow-hidden">
            <div className="container">
                <div className="row align-items-center g-3 g-lg-5">
                    {/* Left Side: Carousel */}
                    <div className="col-lg-6">
                        <div id="heroCarousel" className="carousel slide shadow-lg rounded-4 overflow-hidden" data-bs-ride="carousel">
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" className="d-block w-100 hero-image" alt="Coding" />
                                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                                        <h5>Learn Coding</h5>
                                        <p>Master the latest technologies.</p>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" className="d-block w-100 hero-image" alt="Development" />
                                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                                        <h5>Build Projects</h5>
                                        <p>Hands-on experience with real projects.</p>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" className="d-block w-100 hero-image" alt="Teamwork" />
                                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
                                        <h5>Career Growth</h5>
                                        <p>Get placed in top IT companies.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Auto-changing Text/Logos */}
                    <div className="col-lg-6 text-center text-lg-start">
                        <h1 className="display-6 display-lg-4 fw-bold mb-2 mb-lg-4">
                            Master <span className="text-primary">Modern</span> Technologies
                        </h1>
                        <p className="lead text-muted mb-3 mb-lg-5 fs-6 fs-lg-5">
                            Join ICST - Chowberia to become an expert in:
                        </p>

                        <div className="d-flex align-items-center justify-content-center justify-content-lg-start p-3 p-lg-4 bg-white rounded-4 shadow-sm" style={{ minHeight: '100px' }}>
                            <div className="d-flex align-items-center gap-3 animate-fade-in" key={currentTech.name}>
                                <i className={`bi ${currentTech.icon} display-3`} style={{ color: currentTech.color }}></i>
                                <span className="display-5 fw-bold" style={{ color: currentTech.color }}>
                                    {currentTech.name}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 mt-lg-5">
                            <button className="btn btn-primary btn-lg px-5 py-3 rounded-pill fs-5 fw-semibold shadow-sm hover-lift">
                                Explore Courses <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
