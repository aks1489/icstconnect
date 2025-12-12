import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

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
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otpCode, setOtpCode] = useState('')
    const [otpType, setOtpType] = useState<'signup' | 'recovery' | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [verificationSuccess, setVerificationSuccess] = useState(false)
    const navigate = useNavigate()

    // Reset state when modal opens/closes or mode changes
    useEffect(() => {
        if (!isOpen) return
        setError(null)
        setIsForgotPassword(false)
        setShowOtpInput(false)
        setVerificationSuccess(false)
        setOtpCode('')
        setOtpType(null)
    }, [isOpen, isLogin])

    if (!isOpen) return null

    const handleOtpVerification = async () => {
        setLoading(true)
        setError(null)
        try {
            if (!otpType) return

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: otpType
            })

            if (error) throw error

            // Show success message instead of auto-redirecting
            setVerificationSuccess(true)

        } catch (err: any) {
            console.error('OTP Error:', err)
            setError(err.message || 'Invalid code. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSuccessNavigation = () => {
        if (otpType === 'recovery') {
            navigate('/reset-password')
        } else {
            navigate('/student/dashboard')
        }
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (showOtpInput) {
            await handleOtpVerification()
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email)
                if (error) throw error

                // Switch to OTP mode
                setOtpType('recovery')
                setShowOtpInput(true)
                setError('Code sent! Please check your email and enter the code below.')

            } else if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                // Explicitly check for email verification
                if (data.user && !data.user.email_confirmed_at) {
                    await supabase.auth.signOut()
                    throw new Error('Please check your email to confirm your account before logging in.')
                }

                navigate('/student/dashboard')
                onClose()
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error

                if (data.session) {
                    navigate('/student/dashboard')
                    onClose()
                } else {
                    // Switch to OTP mode instead of just showing message
                    setOtpType('signup')
                    setShowOtpInput(true)
                    setError('Account created! Please enter the verification code sent to your email.')
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
                        {verificationSuccess ? (
                            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300 py-4">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-2 ring-8 ring-green-50">
                                    <i className="bi bi-check-lg text-4xl text-green-600"></i>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h3>
                                    <p className="text-slate-500 max-w-[260px] mx-auto">
                                        Your email has been successfully verified. You can now proceed to your dashboard.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSuccessNavigation}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Go to {otpType === 'recovery' ? 'Reset Password' : 'Dashboard'}
                                </button>
                            </div>
                        ) : showOtpInput ? (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 mb-3 border border-indigo-100">
                                        <i className="bi bi-shield-lock-fill text-2xl text-indigo-600"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Enter Verification Code</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        We sent a verification code to <span className="font-semibold text-slate-700">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={8}
                                        className="w-full text-center text-2xl tracking-[0.5em] py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 8))}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium block text-center"
                                >
                                    Wrong email? Go back
                                </button>
                            </div>
                        ) : isForgotPassword ? (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-3">
                                        <i className="bi bi-key-fill text-xl text-indigo-600"></i>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">Forgot Password?</h3>
                                    <p className="text-sm text-slate-500">
                                        Enter your email address to receive a verification code.
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

                        {!verificationSuccess && (
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
                                    <span>
                                        {showOtpInput
                                            ? 'Verify Code'
                                            : isForgotPassword
                                                ? 'Send Code'
                                                : isLogin
                                                    ? 'Sign In to Dashboard'
                                                    : 'Create Account'
                                        }
                                    </span>
                                )}
                            </button>
                        )}
                    </form>
                </div>

                {/* Footer Section */}
                <div className="px-8 pb-8 text-center space-y-4">
                    <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
                        <Link to="/teacher/login" onClick={onClose} className="hover:text-emerald-600 transition-colors">Teacher Login</Link>
                        <span className="text-slate-300">|</span>
                        <Link to="/admin/login" onClick={onClose} className="hover:text-indigo-600 transition-colors">Admin Login</Link>
                    </div>
                    <p className="text-xs text-slate-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
