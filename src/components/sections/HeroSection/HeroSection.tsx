import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Atom,
    Box,
    FileCode2,
    Wind,
    ArrowRight,
    PlayCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const HeroSection = () => {
    const technologies = [
        { name: 'React', color: '#61DAFB', icon: Atom },
        { name: 'Bootstrap', color: '#7952B3', icon: Box },
        { name: 'Node.js', color: '#339933', icon: FileCode2 },
        { name: 'TailwindCSS', color: '#06B6D4', icon: Wind }
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
        <section className="relative py-12 md:py-20 lg:py-24 bg-slate-50 overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Side: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-100 shadow-sm"
                        >
                            🚀 Start your journey today
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 leading-tight">
                            Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Modern</span> Technologies
                        </h1>
                        <p className="text-slate-500 mb-8 text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Join ICST - Chowberia to become an expert in industry-standard tools and frameworks.
                        </p>

                        <div className="flex items-center justify-center lg:justify-start p-6 bg-white rounded-2xl shadow-lg border border-slate-100 mb-10 max-w-md mx-auto lg:mx-0 transform hover:-translate-y-1 transition-transform duration-300">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentTech.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-5 w-full"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner">
                                        <currentTech.icon size={40} style={{ color: currentTech.color }} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Learning</span>
                                        <span className="text-3xl font-bold" style={{ color: currentTech.color }}>
                                            {currentTech.name}
                                        </span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/courses" className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                Explore Courses <ArrowRight />
                            </Link>
                            <button className="px-8 py-4 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                                <PlayCircle /> Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Side: Carousel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 order-1 lg:order-2"
                    >
                        <div className="relative shadow-2xl shadow-slate-200 rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-square group border-4 border-white">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7 }}
                                    className="absolute inset-0"
                                >
                                    <img src={slides[currentSlide].image} className="w-full h-full object-cover" alt={slides[currentSlide].title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <motion.h5
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-3xl font-bold mb-2"
                                        >
                                            {slides[currentSlide].title}
                                        </motion.h5>
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-white/80 text-lg"
                                        >
                                            {slides[currentSlide].desc}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                                <button
                                    onClick={prevSlide}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection


