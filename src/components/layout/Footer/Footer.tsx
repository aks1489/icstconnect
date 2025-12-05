import React from 'react'

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 lg:py-16 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white text-xl font-bold">
                                I
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-lg leading-none">ICST</span>
                                <span className="text-slate-400 text-[0.65rem] font-medium tracking-wider uppercase">Chowberia</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Empowering students with cutting-edge computer science education and technical skills for a brighter future.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all">
                                <i className="bi bi-twitter-x"></i>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all">
                                <i className="bi bi-linkedin"></i>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all">
                                <i className="bi bi-instagram"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Home</a></li>
                            <li><a href="#courses" className="hover:text-white transition-colors no-underline">Our Courses</a></li>
                            <li><a href="#about" className="hover:text-white transition-colors no-underline">About Us</a></li>
                            <li><a href="#gallery" className="hover:text-white transition-colors no-underline">Gallery</a></li>
                            <li><a href="#contact" className="hover:text-white transition-colors no-underline">Contact</a></li>
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Popular Courses</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Web Development</a></li>
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Data Science</a></li>
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Digital Marketing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Graphic Design</a></li>
                            <li><a href="#" className="hover:text-white transition-colors no-underline">Basic Computer</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <i className="bi bi-geo-alt mt-1 text-slate-400"></i>
                                <span>Chowberia, West Bengal, India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="bi bi-envelope text-slate-400"></i>
                                <a href="mailto:info@icst.com" className="hover:text-white transition-colors no-underline">info@icst.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="bi bi-telephone text-slate-400"></i>
                                <a href="tel:+911234567890" className="hover:text-white transition-colors no-underline">+91 123 456 7890</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} ICST Chowberia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
