import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function ForcePasswordChange() {
    const { user, profile, refreshProfile } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            // 1. Update Auth Password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            // 2. Remove the requires_password_change flag
            if (user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ 
                        requires_password_change: false,
                        temp_password: null
                    })
                    .eq('id', user.id)

                if (profileError) throw profileError
            }

            // 3. Refresh context and redirect
            await refreshProfile()
            showToast('Password updated successfully! Welcome securely to your portal.', 'success')
            
            if (profile?.role === 'admin') navigate('/admin/dashboard')
            else if (profile?.role === 'teacher') navigate('/teacher/dashboard')
            else navigate('/student/dashboard')

        } catch (err: any) {
            console.error('Password reset error:', err)
            setError(err.message || 'An error occurred while updating your password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <KeyRound size={100} />
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white relative z-10">Security Action Required</h2>
                    <p className="text-indigo-100 mt-2 text-sm relative z-10">
                        For your security, you must change your temporary password before accessing your account.
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                placeholder="Enter a strong new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                placeholder="Re-type your new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Updating Security...</>
                            ) : (
                                "Update Password & Continue"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
