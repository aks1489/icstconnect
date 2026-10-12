import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
    IconMail as Mail,
    IconLock as Lock,
    IconAlertCircle as AlertCircle,
    IconArrowRight as ArrowRight
} from '@tabler/icons-react'
import { supabase } from '../lib/supabase'
import SEOHead from '../components/common/SEOHead'
import logo from '../assets/logo.jpg'

export default function StaffLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            })

            if (authError) throw authError

            // Fetch user profile to determine role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.session.user.id)
                .single()

            if (profileError || !profile) {
                throw new Error('User profile record not found.')
            }

            const staffRoles = ['teacher', 'receptionist', 'lab_assistant', 'maintenance', 'admin', 'super_admin']
            if (!staffRoles.includes(profile.role)) {
                throw new Error('This account is registered as a student. Please log in through the student portal.')
            }

            // Dynamic route resolver
            let destination = from
            if (!destination) {
                switch (profile.role) {
                    case 'super_admin':
                    case 'admin':
                        destination = '/admin/dashboard'
                        break
                    case 'teacher':
                        destination = '/teacher/dashboard'
                        break
                    case 'receptionist':
                        destination = '/staff/reception'
                        break
                    case 'lab_assistant':
                        destination = '/staff/lab'
                        break
                    case 'maintenance':
                        destination = '/staff/maintenance'
                        break
                    default:
                        destination = '/student/dashboard'
                }
            }

            navigate(destination, { replace: true })
        } catch (err: any) {
            console.error('Staff Login Error:', err)
            setError(err.message || 'Invalid credentials or unauthorized staff role.')
            await supabase.auth.signOut()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <SEOHead
                title="Staff Portal Login - ICST Connect"
                description="Staff and Employee login portal for Institute of Computer Science & Technology."
                canonical="/staff/login"
                noindex={true}
            />

            {/* Background Glow Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-white/5 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 dark:border-slate-800/80 shadow-2xl relative z-10">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 p-0.5">
                        <img
                            src={logo}
                            alt="ICST Logo"
                            className="w-full h-full object-cover rounded-[14px]"
                        />
                    </div>
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Multi-Role Staff Portal
                        </span>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
                            Staff & Faculty Login
                        </h1>
                        <p className="mt-1 text-xs text-slate-400">
                            Teachers • Reception • Lab In-Charge • Maintenance • Administration
                        </p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 flex items-start gap-3">
                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-red-200">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Institutional Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@icstconnect.com"
                                className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Password
                            </label>
                            <Link
                                to="/reset-password"
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Staff Workspace</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Switcher */}
                <div className="pt-4 border-t border-white/10 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                        Need student portal?{' '}
                        <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-bold">
                            Return to Home
                        </Link>
                    </p>
                    <p className="text-[11px] text-slate-500">
                        Admin also an employee on payroll • ICST Institutional ERP
                    </p>
                </div>
            </div>
        </div>
    )
}
