import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            setPassword('')
            setConfirmPassword('')

            // Close after 2 seconds
            setTimeout(() => {
                onClose()
                setSuccess(false)
            }, 2000)

        } catch (err: any) {
            console.error('Error changing password:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors"
                    >
                        <i className="bi bi-x-lg text-xs"></i>
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <i className="bi bi-check-lg text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Password Updated!</h3>
                            <p className="text-slate-500">Your password has been changed successfully.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 text-sm">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Update Password</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
