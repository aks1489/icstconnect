import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        if (!isOpen) return
        setError(null)
        setIsForgotPassword(false)
        // Keep inputs if switching modes, maybe? No, let's keep it clean or just keep them.
        // Actually good UX to keep email/password if they just clicked the wrong tab.
    }, [isOpen, isLogin])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                })
                if (error) throw error
                setError('Password reset instructions sent! Check your email.')
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/student/dashboard')
                onClose()
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/student/dashboard`,
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error

                // Check if session is established (auto-confirm enabled)
                if (data.session) {
                    navigate('/student/dashboard')
                    onClose()
                } else {
                    // Email confirmation required
                    setError('Account created! Please check your email to confirm your account before logging in.')
                }
            }
        } catch (err: any) {
            console.error('Auth Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-0 overflow-hidden animate-in fade-in zoom-in duration-300 mx-4">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute top-10 -right-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1 w-8 h-8 flex items-center justify-center backdrop-blur-md"
                    >
                        <i className="bi bi-x-lg text-sm"></i>
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md mb-4 shadow-lg ring-1 ring-white/30">
                            <i className={`bi ${isLogin ? 'bi-person-circle' : 'bi-person-plus-fill'} text-2xl text-white`}></i>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join ICST Connect'}
                        </h2>
                        <p className="text-indigo-100 text-sm mt-1 font-medium opacity-90">
                            {isLogin ? 'Please sign in to continue' : 'Start your learning journey today'}
                        </p>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8 pt-6">
                    {/* Tabs */}
                    <div className="flex p-1 rounded-xl bg-slate-100 mb-8 relative">
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-out ${isForgotPassword ? 'hidden' : isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                        ></div>
                        <button
                            className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${isLogin && !isForgotPassword ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => { setIsLogin(true); setIsForgotPassword(false); }}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${!isLogin && !isForgotPassword ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => { setIsLogin(false); setIsForgotPassword(false); }}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isForgotPassword ? (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-3">
                                        <i className="bi bi-key-fill text-xl text-indigo-600"></i>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">Forgot Password?</h3>
                                    <p className="text-sm text-slate-500">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <i className="bi bi-envelope"></i>
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(false)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium block text-center mt-2"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        ) : (
                            <>
                                {!isLogin && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                                        {isLogin && (
                                            <button
                                                type="button"
                                                onClick={() => setIsForgotPassword(true)}
                                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <i className="bi bi-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${error.includes('sent') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                <i className={`bi ${error.includes('sent') ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} mt-0.5`}></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In to Dashboard' : 'Create Account'}</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Section */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-xs text-slate-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
