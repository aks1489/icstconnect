import { useState, useEffect } from 'react'

import type { UserProfile } from '../../types'
import ImageUpload from './ImageUpload'

interface ProfileFormProps {
    initialData: Partial<UserProfile>
    onSubmit: (data: Partial<UserProfile>) => Promise<void>
    isEditing?: boolean
    onCancel?: () => void
}

export default function ProfileForm({ initialData, onSubmit, isEditing = false, onCancel }: ProfileFormProps) {
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        full_name: '',
        father_name: '',
        dob: '',
        address: '',
        pincode: '',
        district: '',
        state: '',
        avatar_url: '',
        ...initialData
    })

    const [loading, setLoading] = useState(false)
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Sync initial data
    useEffect(() => {
        setFormData(prev => ({ ...prev, ...initialData }))
    }, [initialData])

    // Pincode Lookup
    useEffect(() => {
        const lookupPincode = async () => {
            const pin = formData.pincode
            if (pin && pin.length === 6) {
                setPincodeLoading(true)
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
                    const data = await response.json()

                    if (data && data[0].Status === 'Success') {
                        const postOffice = data[0].PostOffice[0]
                        setFormData(prev => ({
                            ...prev,
                            district: postOffice.District,
                            state: postOffice.State
                        }))
                    }
                } catch (err) {
                    console.error('Pincode lookup failed:', err)
                } finally {
                    setPincodeLoading(false)
                }
            }
        }

        const timeoutId = setTimeout(lookupPincode, 500)
        return () => clearTimeout(timeoutId)
    }, [formData.pincode])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageUpload = (url: string) => {
        setFormData(prev => ({ ...prev, avatar_url: url }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await onSubmit(formData)
        } catch (err: any) {
            console.error('Form submission error:', err)
            setError(err.message || 'Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
                <ImageUpload
                    currentImageUrl={formData.avatar_url}
                    onUploadComplete={handleImageUpload}
                    userId={initialData.id || ''}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        required
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="Student Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Father's Name</label>
                    <input
                        type="text"
                        name="father_name"
                        required
                        value={formData.father_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="Father's Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        required
                        value={formData.dob || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <input
                        type="tel"
                        disabled
                        value={initialData.email} // Using email as placeholder for unchangeable ID if needed, or just remove
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        title="Contact admin to change email"
                    />
                    <p className="text-xs text-slate-400">Email cannot be changed directly.</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Residential Address</label>
                <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                    placeholder="House No, Street, Locality"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-slate-700">Pincode</label>
                    <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={formData.pincode || ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '')
                            setFormData(prev => ({ ...prev, pincode: val }))
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="110001"
                    />
                    {pincodeLoading && (
                        <div className="absolute right-3 top-[34px]">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">District</label>
                    <input
                        type="text"
                        name="district"
                        readOnly
                        value={formData.district || ''}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">State</label>
                    <input
                        type="text"
                        name="state"
                        readOnly
                        value={formData.state || ''}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-3">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="flex gap-4 pt-4">
                {isEditing && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>{isEditing ? 'Save Changes' : 'Complete Profile'}</span>
                    )}
                </button>
            </div>
        </form>
    )
}
