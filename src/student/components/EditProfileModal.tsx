import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { UserProfile } from '../../types'
import ProfileForm from '../../components/common/ProfileForm'
import { IconX as X } from '@tabler/icons-react'

import { useToast } from '../../contexts/ToastContext'

interface EditProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, profile, refreshProfile } = useAuth()
    const { showToast } = useToast()

    if (!isOpen || !user || !profile) return null

    const handleSubmit = async (data: Partial<UserProfile>) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    guardian_name: data.guardian_name,
                    dob: data.dob,
                    address: data.address,
                    pincode: data.pincode,
                    district: data.district,
                    state: data.state,
                    avatar_url: data.avatar_url,
                    phone: data.phone,
                    post_office: data.post_office,
                    enrollment_center: data.enrollment_center
                })
                .eq('id', user.id)

            if (error) throw error

            await refreshProfile()
            onClose()
            showToast('Profile updated successfully!', 'success')

        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-transparent dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-750 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <ProfileForm
                        initialData={{
                            ...profile,
                            id: user.id,
                            email: user.email || ''
                        }}
                        onSubmit={handleSubmit}
                        isEditing={true}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    )
}
