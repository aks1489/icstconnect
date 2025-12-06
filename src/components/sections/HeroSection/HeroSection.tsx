import { useState, useEffect } from 'react'

const HeroSection = () => {
    const technologies = [
        { name: 'React', color: '#61DAFB', icon: 'bi-filetype-jsx' },
        { name: 'Bootstrap', color: '#7952B3', icon: 'bi-bootstrap-fill' },
        { name: 'Node.js', color: '#339933', icon: 'bi-filetype-js' },
        { name: 'TailwindCSS', color: '#06B6D4', icon: 'bi-wind' }
    ]

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            title: "Learn Coding",
            desc: "Master the latest technologies."
        },
        {
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            title: "Build Projects",
            desc: "Hands-on experience with real projects."
        },
        {
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
            title: "Career Growth",
            desc: "Get placed in top IT companies."
        }
    ]

    const [currentTechIndex, setCurrentTechIndex] = useState(0)
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const techInterval = setInterval(() => {
            setCurrentTechIndex((prev) => (prev + 1) % technologies.length)
        }, 2000)
        return () => clearInterval(techInterval)
    }, [])

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(slideInterval)
    }, [])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const currentTech = technologies[currentTechIndex]

    return (
        <section className="relative py-12 lg:py-24 bg-slate-50 overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Side: Text Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-100 shadow-sm">
                            🚀 Start your journey today
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 text-slate-900 leading-tight">
                            Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Modern</span> Technologies
                        </h1>
                        <p className="text-slate-500 mb-8 text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Join ICST - Chowberia to become an expert in industry-standard tools and frameworks.
                        </p>

                        <div className="flex items-center justify-center lg:justify-start p-6 bg-white rounded-2xl shadow-lg border border-slate-100 mb-10 max-w-md mx-auto lg:mx-0 transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-center gap-5" key={currentTech.name}>
                                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner">
                                    <i className={`bi ${currentTech.icon} text-4xl`} style={{ color: currentTech.color }}></i>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Learning</span>
                                    <span className="text-3xl font-bold" style={{ color: currentTech.color }}>
                                        {currentTech.name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                Explore Courses <i className="bi bi-arrow-right"></i>
                            </button>
                            <button className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                                <i className="bi bi-play-circle"></i> Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Carousel */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative shadow-2xl shadow-slate-200 rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-square group border-4 border-white">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                        }`}
                                >
                                    <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-0 transition-transform duration-500">
                                        <h5 className="text-3xl font-bold mb-2">{slide.title}</h5>
                                        <p className="text-white/80 text-lg">{slide.desc}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="absolute bottom-8 right-8 flex gap-2">
                                <button
                                    onClick={prevSlide}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
