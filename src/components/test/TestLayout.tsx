import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TestLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function TestLayout({ children, title = "Online Assessment" }: TestLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-inter selection:bg-indigo-100 selection:text-indigo-900">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50 opacity-50"></div>

                {/* Gradient Blobs */}
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                ></motion.div>

                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear", delay: 2 }}
                    className="absolute top-20 -left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                ></motion.div>

                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 18, ease: "linear", delay: 1 }}
                    className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                ></motion.div>
            </div>

            {/* Content Content - Centered and Focused */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    )
}
