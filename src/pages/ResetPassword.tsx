import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
    IconCheck as Check,
    IconAlertCircle as AlertCircle,
    IconKey as Key,
    IconMail as Mail,
    IconLock as Lock,
    IconEye as Eye,
    IconEyeOff as EyeOff,
    IconShieldCheck as ShieldCheck,
    IconArrowLeft as ArrowLeft,
    IconRefresh as Refresh
} from '@tabler/icons-react'
import { supabase } from '../lib/supabase'
import SEOHead from '../components/common/SEOHead'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // Flow states
    const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null)
    const [email, setEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // UI feedback
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    // Pre-fill email from query params if available
    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setInterval(() => {
            setResendCooldown(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCooldown])

    // Monitor Supabase Auth state (handles direct reset link clicks & OTP logins)
    useEffect(() => {
        // 1. Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setHasActiveSession(true)
            } else {
                setHasActiveSession(false)
            }
        })

        // 2. Auth state change listener (catches PASSWORD_RECOVERY event or PKCE token exchange)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
                setHasActiveSession(true)
                setError(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // Request/Resend 6-Digit OTP via email
    const handleRequestOtp = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address first.')
            return
        }

        if (resendCooldown > 0 || loading) return

        setLoading(true)
        setError(null)
        setInfoMessage(null)

        try {
            const redirectUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/reset-password`
                : 'https://icstconnect.in/reset-password'

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            })

            if (resetError) throw resetError

            setResendCooldown(30)
            setInfoMessage(`A 6-digit verification code has been dispatched to ${email}. Please check your inbox and Spam folder!`)
        } catch (err: any) {
            console.error('[ResetPassword] Request OTP error:', err)
            setError(err.message || 'Failed to send verification code. Please verify the email and try again.')
        } finally {
            setLoading(false)
        }
    }

    // Verify 6-digit OTP code directly on this page
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            setError('Please provide your registered email address.')
            return
        }

        const cleanToken = otpCode.trim()
        if (cleanToken.length !== 6) {
            setError('Please enter the full 6-digit verification code.')
            return
        }

        setLoading(true)
        setError(null)
        setInfoMessage(null)

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: cleanToken,
                type: 'recovery'
            })

            if (verifyError) throw verifyError

            setHasActiveSession(true)
            setInfoMessage('Code verified successfully! You may now set your new password.')
        } catch (err: any) {
            console.error('[ResetPassword] Verify OTP error:', err)
            setError(err.message || 'Invalid or expired verification code. Please check or request a fresh code.')
        } finally {
            setLoading(false)
        }
    }

    // Set new password once session is verified
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        setLoading(true)
        setError(null)
        setInfoMessage(null)

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => {
                navigate('/quick-access')
            }, 3000)
        } catch (err: any) {
            console.error('[ResetPassword] Update password error:', err)
            setError(err.message || 'Failed to update password. Your session may have expired; please re-verify your OTP.')
        } finally {
            setLoading(false)
        }
    }

    // Password strength evaluator
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, text: '', color: 'bg-slate-200 dark:bg-slate-700' }
        let score = 0
        if (pass.length >= 8) score++
        if (/[A-Z]/.test(pass)) score++
        if (/[0-9]/.test(pass)) score++
        if (/[^A-Za-z0-9]/.test(pass)) score++

        if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' }
        if (score === 2 || score === 3) return { score: 2, text: 'Good', color: 'bg-amber-500' }
        return { score: 3, text: 'Strong', color: 'bg-emerald-500' }
    }

    const strength = getPasswordStrength(password)

    // Success Screen
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
                <SEOHead title="Password Reset Success | ICST Chowberia" noindex={true} />
                <div className="max-w-md w-full space-y-6 text-center bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <Check size={32} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        Password Updated!
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Your password has been securely reset. You will be redirected to the student dashboard in a moment...
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/quick-access"
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                        >
                            Proceed to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
            <SEOHead title="Reset Your Password | ICST Chowberia" noindex={true} />

            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {/* Decorative Top Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600"></div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 mb-3 border border-indigo-100 dark:border-indigo-800/80 shadow-sm">
                        {hasActiveSession ? (
                            <Key className="text-indigo-600 dark:text-indigo-400" size={28} />
                        ) : (
                            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={28} />
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {hasActiveSession ? 'Set New Password' : 'Reset Password'}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {hasActiveSession
                            ? 'Please choose a strong password for your ICST Connect account.'
                            : 'Enter your registered email and the 6-digit OTP verification code.'}
                    </p>
                </div>

                {/* Feedback Alerts */}
                {infoMessage && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        <ShieldCheck size={18} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                        <span className="leading-snug">{infoMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                        <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                        <span className="leading-snug">{error}</span>
                    </div>
                )}

                {/* STEP 1: If session is not active yet, let user input Email + 6-digit OTP */}
                {!hasActiveSession ? (
                    <form className="mt-6 space-y-5" onSubmit={handleVerifyOtp}>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                                Registered Email Address
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                    6-Digit OTP Code
                                </label>
                                <button
                                    type="button"
                                    disabled={resendCooldown > 0 || loading}
                                    onClick={handleRequestOtp}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <Refresh size={12} className={loading ? 'animate-spin' : ''} />
                                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Send / Resend OTP'}
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                placeholder="000000"
                                className="w-full text-center text-2xl tracking-[0.4em] py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold transition-all"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                                Check your email inbox (or Spam folder) for the 6-digit code.
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-none cursor-pointer"
                            >
                                {loading ? 'Verifying Code...' : 'Verify Code & Proceed'}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Homepage
                            </Link>
                        </div>
                    </form>
                ) : (
                    /* STEP 2: Authenticated / recovery session active $\rightarrow$ Set New Password */
                    <form className="mt-6 space-y-5" onSubmit={handleResetPassword}>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2 ml-1">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{strength.text}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                        <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                                        <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                                        <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 dark:shadow-none cursor-pointer"
                            >
                                {loading ? 'Saving New Password...' : 'Save & Update Password'}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    supabase.auth.signOut().then(() => setHasActiveSession(false))
                                }}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                Not your account? Re-enter OTP code
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
