import { useState, useEffect } from 'react'

import type { UserProfile } from '../../types'
import ImageUpload from './ImageUpload'
import { Check, AlertTriangle } from 'lucide-react'

interface ProfileFormProps {
    initialData: Partial<UserProfile>
    onSubmit: (data: Partial<UserProfile>) => Promise<void>
    isEditing?: boolean
    onCancel?: () => void
    onInteraction?: () => void
}

export default function ProfileForm({ initialData, onSubmit, isEditing = false, onCancel, onInteraction }: ProfileFormProps) {
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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
                            // Verify if current post office is valid for new pin, otherwise reset or auto-select
                            post_office: offices.length === 1 ? offices[0].Name : (offices.find((o: any) => o.Name === prev.post_office) ? prev.post_office : '')
                        }))
                    } else {
                        setPostOffices([])
                        setFormData(prev => ({ ...prev, district: '', state: '', post_office: '' }))
                    }
                } catch (err) {
                    console.error('Pincode lookup failed:', err)
                } finally {
                    setPincodeLoading(false)
                }
            } else {
                setPostOffices([])
                // Reset dependent fields if pin is invalid
                if (formData.district || formData.state || formData.post_office) {
                    setFormData(prev => ({ ...prev, district: '', state: '', post_office: '' }))
                }
            }
        }

        const timeoutId = setTimeout(lookupPincode, 500)
        return () => clearTimeout(timeoutId)
    }, [formData.pincode])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        onInteraction?.()
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleImageUpload = (url: string) => {
        onInteraction?.()
        setFormData(prev => ({ ...prev, avatar_url: url }))
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.full_name?.trim()) errors.full_name = "Name is required"
        if (!formData.father_name?.trim()) errors.father_name = "Father's name is required"
        if (!formData.dob) errors.dob = "Date of birth is required"

        if (!formData.phone) {
            errors.phone = "Phone number is required"
        } else if (formData.phone.length !== 10) {
            errors.phone = "Phone number must be 10 digits"
        }

        if (!formData.pincode) {
            errors.pincode = "Pincode is required"
        } else if (formData.pincode.length !== 6) {
            errors.pincode = "Pincode must be 6 digits"
        }

        if (!formData.post_office) errors.post_office = "Please select a post office"
        if (!formData.address?.trim()) errors.address = "Address is required"

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            // Scroll to first error?
            return
        }

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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    <label className="text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all`}
                        placeholder="Student Name"
                    />
                    {fieldErrors.full_name && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.full_name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Father's Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="father_name"
                        value={formData.father_name || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.father_name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all`}
                        placeholder="Father's Name"
                    />
                    {fieldErrors.father_name && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.father_name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.dob ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all`}
                    />
                    {fieldErrors.dob && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.dob}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-medium">+91</span>
                        <input
                            type="tel"
                            name="phone"
                            maxLength={10}
                            value={formData.phone || ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '')
                                onInteraction?.()
                                setFormData(prev => ({ ...prev, phone: val }))
                                if (fieldErrors.phone) {
                                    setFieldErrors(prev => {
                                        const newErrors = { ...prev }
                                        delete newErrors.phone
                                        return newErrors
                                    })
                                }
                            }}
                            className={`w-full pl-12 pr-4 py-2.5 rounded-xl border ${fieldErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all`}
                            placeholder="9876543210"
                        />
                    </div>
                    {fieldErrors.phone && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.phone}</p>}
                </div>
            </div>

            {/* Address Info */}
            <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Address Details</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pincode with Loader */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-semibold text-slate-700">Pincode <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="pincode"
                                maxLength={6}
                                value={formData.pincode || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    onInteraction?.()
                                    setFormData(prev => ({ ...prev, pincode: val }))
                                    if (fieldErrors.pincode) {
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.pincode
                                            return newErrors
                                        })
                                    }
                                }}
                                className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.pincode ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all`}
                                placeholder="110001"
                            />
                            {fieldErrors.pincode && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.pincode}</p>}
                            {pincodeLoading && (
                                <div className="absolute right-3 top-[34px]">
                                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Post Office Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Post Office <span className="text-red-500">*</span></label>
                            <select
                                name="post_office"
                                value={formData.post_office || ''}
                                onChange={handleChange}
                                disabled={pincodeLoading || postOffices.length === 0}
                                className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.post_office ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                            >
                                <option value="">Select Post Office</option>
                                {postOffices.map((po, idx) => (
                                    <option key={`${po.Name}-${idx}`} value={po.Name}>
                                        {po.Name}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.post_office && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.post_office}</p>}
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
                        <label className="text-sm font-semibold text-slate-700">Full Address <span className="text-red-500">*</span></label>
                        <textarea
                            name="address"
                            rows={3}
                            value={formData.address || ''}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 rounded-xl border ${fieldErrors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-2 outline-none transition-all resize-none`}
                            placeholder="House No, Street, Locality"
                        />
                        {fieldErrors.address && <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">{fieldErrors.address}</p>}
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
                                onChange={(e) => {
                                    onInteraction?.()
                                    setFormData(prev => ({
                                        ...prev,
                                        enrollment_center: e.target.checked ? 'ICST Chowberia' : ''
                                    }))
                                }}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-indigo-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-200"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                <Check size={14} />
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
                    <AlertTriangle size={20} className="shrink-0" />
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
