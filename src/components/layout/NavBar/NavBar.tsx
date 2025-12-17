import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Home,
    Book,
    Image as ImageIcon,
    Info,
    LayoutDashboard,
    User,
    Menu,
    X
} from 'lucide-react'
import logo from '../../../assets/logo.jpg'

interface NavigationProps {
    onLoginClick: () => void
    user?: any
}

export const NavigationHeader: React.FC<NavigationProps> = ({ onLoginClick, user }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we are on admin or teacher login pages
    const isRestrictedAuthPage = ['/admin/login', '/teacher/login'].includes(location.pathname);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
        { name: 'Notifications', href: '/notifications' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Online Test', href: '/online-test' },
        { name: 'About Us', href: '/about' },
    ];

    // Determine if we should use light text (white) or dark text
    // Light text not only when scrolled, but also when on dark-themed auth pages (even if not scrolled)
    const useLightText = isScrolled || isRestrictedAuthPage;

    const getLinkClasses = (isActive: boolean) => {
        if (useLightText) {
            return isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white';
        }
        return isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900';
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[1040] transition-all duration-300 ${isScrolled
                    ? 'bg-slate-900/90 backdrop-blur-md shadow-lg py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group no-underline">
                            <img
                                src={logo}
                                alt="ICST Logo"
                                className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:shadow-slate-500/30 transition-all duration-300"
                            />
                            <div className="flex flex-col">
                                <span className={`font-bold text-lg leading-none tracking-tight transition-colors duration-300 ${useLightText ? 'text-white' : 'text-slate-800'}`}>ICST</span>
                                <span className={`text-[0.65rem] font-medium tracking-wider uppercase transition-colors duration-300 ${useLightText ? 'text-slate-400' : 'text-slate-500'}`}>Chowberia</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-6">
                            <ul className="flex items-center gap-5 mb-0 list-none">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className={`text-sm font-medium transition-colors relative group py-2 no-underline whitespace-nowrap ${getLinkClasses(location.pathname === link.href)}`}
                                        >
                                            {link.name}
                                            <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 group-hover:w-full ${useLightText ? 'bg-white' : 'bg-slate-800'} ${location.pathname === link.href ? 'w-full' : 'w-0 opacity-0 group-hover:opacity-100'
                                                }`}></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className={`h-6 w-px mx-2 transition-colors duration-300 ${useLightText ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                            {user ? (
                                <Link
                                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                                    className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap no-underline"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                !isRestrictedAuthPage && (
                                    <button
                                        onClick={onLoginClick}
                                        className={`px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap ${useLightText ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-900/20'}`}
                                    >
                                        <User size={18} />
                                        <span>Login</span>
                                    </button>
                                )
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className={`lg:hidden text-2xl focus:outline-none transition-colors duration-300 ${useLightText ? 'text-white' : 'text-slate-800'}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 overflow-y-auto ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="container mx-auto px-4 py-4 pb-24 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`block py-3 px-4 rounded-lg hover:bg-slate-50 font-medium transition-colors no-underline ${location.pathname === link.href ? 'text-slate-900 bg-slate-50' : 'text-slate-600'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-slate-100 my-2"></div>
                        {user ? (
                            <Link
                                to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                                className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 no-underline"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LayoutDashboard size={20} />
                                <span>Go to Dashboard</span>
                            </Link>
                        ) : (
                            !isRestrictedAuthPage && (
                                <button
                                    onClick={() => {
                                        onLoginClick();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 px-4 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User size={20} />
                                    <span>Login / Sign Up</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}

export const NavigationFooter: React.FC<NavigationProps> = ({ onLoginClick, user }) => {
    const location = useLocation();
    const isRestrictedAuthPage = ['/admin/login', '/teacher/login'].includes(location.pathname);

    return (
        <div className="lg:hidden">
            <nav className="bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] fixed bottom-0 left-0 right-0 w-full z-[1030] pb-[env(safe-area-inset-bottom)]">
                <div className="w-full h-full">
                    <div className="flex justify-evenly items-center w-full h-full py-3">
                        <Link to="/" className="no-underline text-slate-400 hover:text-slate-800 active:text-slate-800 flex flex-col items-center gap-1 transition-colors group">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Home size={24} />
                            </motion.div>
                            <span className="text-[10px] font-medium">Home</span>
                        </Link>
                        <Link to="/courses" className="no-underline text-slate-400 hover:text-slate-800 active:text-slate-800 flex flex-col items-center gap-1 transition-colors group">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Book size={24} />
                            </motion.div>
                            <span className="text-[10px] font-medium">Courses</span>
                        </Link>
                        <div className="relative -top-5">
                            {user ? (
                                <Link
                                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                                    className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <LayoutDashboard size={24} />
                                </Link>
                            ) : (
                                !isRestrictedAuthPage ? (
                                    <button
                                        onClick={onLoginClick}
                                        className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <User size={24} />
                                    </button>
                                ) : (
                                    null
                                )
                            )}
                        </div>
                        <Link to="/gallery" className="no-underline text-slate-400 hover:text-slate-800 active:text-slate-800 flex flex-col items-center gap-1 transition-colors group">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <ImageIcon size={24} />
                            </motion.div>
                            <span className="text-[10px] font-medium">Gallery</span>
                        </Link>
                        <Link to="/about" className="no-underline text-slate-400 hover:text-slate-800 active:text-slate-800 flex flex-col items-center gap-1 transition-colors group">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Info size={24} />
                            </motion.div>
                            <span className="text-[10px] font-medium">About</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}
