import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { X, AlertTriangle, Check } from 'lucide-react'

interface CreateTeacherModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateTeacherModal({ isOpen, onClose, onSuccess }: CreateTeacherModalProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const generatedTeacherId = `T-${Math.floor(100000 + Math.random() * 900000)}`

        try {
            // 1. Create a secondary Supabase client
            // This prevents the current Admin from being logged out when we create the new user.
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            )

            // 2. Sign up the user (Trigger handles the Profile creation)
            const { data, error: authError } = await tempClient.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim(),
                        role: 'teacher',          // <--- Trigger reads this
                        teacher_id: generatedTeacherId // <--- Trigger reads this
                    }
                }
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('This email is already registered.')
                }
                throw authError
            }

            if (!data.user) throw new Error('Failed to create user')

            // Success! We don't need to do anything else. The Database Trigger does the rest.
            alert('Teacher account created successfully!')
            onSuccess()
            onClose()
            setFormData({ fullName: '', email: '', password: '' })

        } catch (err: any) {
            console.error('Error creating teacher:', err)
            setError(err.message || 'Failed to create teacher')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                            <AlertTriangle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            placeholder="e.g. john@school.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            placeholder="Min 6 chars"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={18} />
                                    Create Teacher
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
