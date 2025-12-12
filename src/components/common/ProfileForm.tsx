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
        phone: '',
        post_office: '',
        enrollment_center: '',
        ...initialData
    })

    const [loading, setLoading] = useState(false)
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [postOffices, setPostOffices] = useState<any[]>([])

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
                setPostOffices([])
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
                    const data = await response.json()

                    if (data && data[0].Status === 'Success') {
                        const offices = data[0].PostOffice
                        const firstOffice = offices[0]

                        setPostOffices(offices)
                        setFormData(prev => ({
                            ...prev,
                            district: firstOffice.District,
                            state: firstOffice.State,
                            // If only one post office, select it automatically
                            post_office: offices.length === 1 ? offices[0].Name : prev.post_office
                        }))
                    } else {
                        setPostOffices([])
                        // Don't clear district/state immediately to avoid annoying flickering if user is typing
                    }
                } catch (err) {
                    console.error('Pincode lookup failed:', err)
                } finally {
                    setPincodeLoading(false)
                }
            } else {
                setPostOffices([])
            }
        }

        const timeoutId = setTimeout(lookupPincode, 500)
        return () => clearTimeout(timeoutId)
    }, [formData.pincode])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

            {/* Basic Info */}
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
                    <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-medium">+91</span>
                        <input
                            type="tel"
                            name="phone"
                            required
                            maxLength={10}
                            value={formData.phone || ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '')
                                setFormData(prev => ({ ...prev, phone: val }))
                            }}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            placeholder="9876543210"
                        />
                    </div>
                </div>
            </div>

            {/* Address Info */}
            <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Address Details</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pincode with Loader */}
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
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Post Office Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Post Office</label>
                            <select
                                name="post_office"
                                required
                                value={formData.post_office || ''}
                                onChange={handleChange}
                                disabled={pincodeLoading || postOffices.length === 0}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="">Select Post Office</option>
                                {postOffices.map((po, idx) => (
                                    <option key={`${po.Name}-${idx}`} value={po.Name}>
                                        {po.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-semibold text-slate-700">District</label>
                            <input
                                type="text"
                                name="district"
                                readOnly
                                value={formData.district || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none transition-all"
                            />
                            {pincodeLoading && (
                                <div className="absolute right-3 top-[34px] bg-slate-50 pl-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse"></div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-semibold text-slate-700">State</label>
                            <input
                                type="text"
                                name="state"
                                readOnly
                                value={formData.state || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none transition-all"
                            />
                            {pincodeLoading && (
                                <div className="absolute right-3 top-[34px] bg-slate-50 pl-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Address</label>
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
                </div>
            </div>

            {/* Course Enrollment Info */}
            <div className="pt-4 border-t border-slate-100">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                name="enrollment_center"
                                checked={formData.enrollment_center === 'ICST Chowberia'}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    enrollment_center: e.target.checked ? 'ICST Chowberia' : ''
                                }))}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-indigo-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-200"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                <i className="bi bi-check-lg text-sm"></i>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-indigo-900 block">I am enrolled at ICST Chowberia Center</span>
                            <span className="text-indigo-700/80">Check this box if you are attending offline classes at our main center.</span>
                        </div>
                    </label>
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
