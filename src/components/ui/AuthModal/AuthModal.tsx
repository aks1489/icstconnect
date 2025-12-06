import React, { useState, useEffect } from 'react'

interface AuthModalProps {
    show: boolean
    onClose: () => void
    initialMode?: 'login' | 'signup'
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setMode(initialMode)
    }, [initialMode])

    useEffect(() => {
        if (show) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [show])

    if (!isVisible && !show) return null

    return (
        <div className={`fixed inset-0 z-[1050] flex items-center justify-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10"
                >
                    <i className="bi bi-x-lg text-sm"></i>
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg shadow-blue-600/30">
                            I
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h3>
                        <p className="text-slate-500 text-sm mt-2">
                            {mode === 'login'
                                ? 'Enter your details to access your account'
                                : 'Join us and start your learning journey'}
                        </p>
                    </div>

                    <form className="space-y-4">
                        {mode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <i className="bi bi-person absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <i className="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <i className="bi bi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium no-underline">Forgot Password?</a>
                            </div>
                        )}

                        <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 mt-2">
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-600 font-bold hover:underline focus:outline-none"
                            >
                                {mode === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
