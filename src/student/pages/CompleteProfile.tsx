import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { UserProfile } from '../../types'
import ProfileForm from '../../components/common/ProfileForm'
import logo from '../../assets/logo.jpg'

export default function CompleteProfile() {
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (data: Partial<UserProfile>) => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    father_name: data.father_name,
                    dob: data.dob,
                    address: data.address,
                    pincode: data.pincode,
                    district: data.district,
                    state: data.state,
                    avatar_url: data.avatar_url,
                    // Helper logic could be added here to mark "is_complete" if you add a boolean flag col
                })
                .eq('id', user.id)

            if (error) throw error

            // Refresh context to acknowledge changes
            await refreshProfile()

            // Go to dashboard
            navigate('/student/dashboard')

        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-inter">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute top-10 -right-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <img
                            src={logo}
                            alt="ICST Logo"
                            className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white/20 mb-4"
                        />
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Complete Your Profile</h1>
                        <p className="text-indigo-100 max-w-md mx-auto">
                            Welcome to ICST Connect! Please provide your details to finish setting up your student account.
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <ProfileForm
                        initialData={{
                            full_name: profile?.full_name || '',
                            email: user.email || '',
                            id: user.id
                        }}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>

            <p className="text-slate-400 text-xs mt-6 text-center">
                © {new Date().getFullYear()} ICST Connect. All rights reserved.
            </p>
        </div>
    )
}
