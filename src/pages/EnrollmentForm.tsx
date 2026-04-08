import React, { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    CheckCircle2, ArrowRight, BookOpen, MapPin, Phone, MessageSquare, 
    Info, CreditCard, ChevronDown, CheckCircle 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { courseService } from '../services/courseService'
import { enrollmentService } from '../services/enrollmentService'
import type { Course } from '../types/course'

// Whatsapp Phone number for ICST Chowberia
const CONTACT_PHONE = '+918158031706'

export default function EnrollmentForm() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { showToast } = useToast()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [course, setCourse] = useState<Course | null>(null)
    const [successData, setSuccessData] = useState<any>(null)

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        gender: '',
        dob: '',
        address: '',
        pincode: '',
        state: '',
        district: '',
        post_office: '',
        payment_plan: 'monthly',
        opt_spoken_english: false
    })

    // Postal Code states
    const [fetchingPincode, setFetchingPincode] = useState(false)
    const [postOffices, setPostOffices] = useState<string[]>([])

    // Info Popups state
    const [showPracticeInfo, setShowPracticeInfo] = useState(false)
    const [showSpokenEngInfo, setShowSpokenEngInfo] = useState(false)

    // Load Course and User Data
    useEffect(() => {
        const init = async () => {
            try {
                if (courseId) {
                    const c = await courseService.getCourseById(courseId)
                    setCourse(c)
                }

                // Pre-fill from auth profile if available
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        email: profile.email || '',
                        address: profile.address || '',
                        pincode: profile.pincode || '',
                        state: profile.state || '',
                        district: profile.district || '',
                        post_office: profile.post_office || '',
                        dob: profile.dob || ''
                        // Gender doesn't exist explicitly in base profile, leave empty
                    }))
                }

            } catch (err) {
                console.error(err)
                showToast("Failed to load details. Please refresh.", "error")
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [courseId, profile, showToast])

    // Handle Pincode Auto-fetch
    useEffect(() => {
        if (formData.pincode.length === 6) {
            const fetchPincode = async () => {
                setFetchingPincode(true)
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
                    const data = await res.json()
                    if (data[0].Status === "Success") {
                        const postOfficesList = data[0].PostOffice
                        const firstPO = postOfficesList[0]
                        setFormData(prev => ({
                            ...prev,
                            state: firstPO.State,
                            district: firstPO.District,
                            post_office: prev.post_office || postOfficesList[0].Name // Keep existing if set, else pick first
                        }))
                        setPostOffices(postOfficesList.map((po: any) => po.Name))
                    } else {
                        showToast("Invalid Pincode", "warning")
                    }
                } catch (error) {
                    console.error("Pincode API error", error)
                } finally {
                    setFetchingPincode(false)
                }
            }
            fetchPincode()
        }
    }, [formData.pincode, showToast])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        setFormData(prev => ({ ...prev, [name]: val }))
    }

    const calculateProgress = () => {
        const requiredFields = ['full_name', 'phone', 'gender', 'address', 'pincode', 'state', 'district', 'post_office']
        const filled = requiredFields.filter(field => !!formData[field as keyof typeof formData]).length
        return Math.floor((filled / requiredFields.length) * 100)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        
        if (!course) {
            showToast("Course information is missing.", "error")
            return
        }

        const progress = calculateProgress()
        if (progress < 100) {
            showToast("Please fill all mandatory fields.", "warning")
            return
        }

        // Show confirmation popup (Native browser prompt for safety, can be replaced with custom Modal later)
        const confirmed = window.confirm("Are you sure you want to submit this enrollment application?")
        if (!confirmed) return

        setSubmitting(true)
        try {
            const app = await enrollmentService.submitApplication({
                student_id: profile?.id,
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email, // Can be blank
                gender: formData.gender,
                dob: formData.dob || undefined,
                pincode: formData.pincode,
                state: formData.state,
                district: formData.district,
                post_office: formData.post_office,
                address: formData.address,
                course_id: course.id,
                payment_plan: formData.payment_plan as any,
                opt_spoken_english: formData.opt_spoken_english
            })

            setSuccessData(app)
            window.scrollTo(0, 0)
        } catch (error: any) {
            showToast(error.message || "Failed to submit application", "error")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    }

    if (successData) {
        const whatsappMsg = encodeURIComponent(`Hi, I just submitted an enrollment application for ${course?.title}. My Reference ID is ${successData.reference_id}. Can you provide more details?`)
        
        return (
            <div className="min-h-screen pt-24 pb-12 bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-xl p-8 text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-500" size={40} />
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Application Successful!</h2>
                    <p className="text-slate-600 mb-6">Your application for enrollment is taken successfully. ICST Chowberia officials will contact you soon.</p>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Reference ID</p>
                        <p className="text-2xl font-black text-indigo-600 tracking-wider font-mono">{successData.reference_id}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-sm text-slate-500 font-medium">For any information, reach out directly:</p>
                        <div className="flex gap-4 justify-center">
                            <a href={`tel:${CONTACT_PHONE}`} className="flex-1 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-4 rounded-xl transition-colors">
                                <Phone size={24} />
                                <span className="font-bold text-sm">Call Us</span>
                            </a>
                            <a href={`https://wa.me/${CONTACT_PHONE.replace('+', '')}?text=${whatsappMsg}`} target="_blank" rel="noreferrer" className="flex-1 flex flex-col items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 py-4 px-4 rounded-xl transition-colors">
                                <MessageSquare size={24} />
                                <span className="font-bold text-sm">WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Footer Address */}
                    <div className="text-left mt-8 pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                            <MapPin size={18} className="text-red-500" />
                            ICST Chowberia
                        </h4>
                        <p className="text-sm text-slate-600 mb-4">
                            Vill- Chowberia, P.O- Chowberia,<br />
                            P.S- Bongaon, Dist- North 24 Parganas,<br />
                            Pin- 743273
                        </p>
                        <a 
                            href="https://maps.google.com/?q=ICST+Chowberia" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-indigo-600 font-semibold text-sm hover:underline"
                        >
                            View on Google Maps →
                        </a>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/courses')}
                        className="mt-8 w-full block text-center text-slate-500 hover:text-slate-800 font-semibold"
                    >
                        Return to Courses
                    </button>
                </div>
            </div>
        )
    }

    const progress = calculateProgress()

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20 relative">
            {/* Sticky Progress Bar */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm py-3 px-4 md:px-8 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-600">Application Progress</span>
                <div className="flex-1 max-w-sm mx-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span className="font-bold text-sm text-indigo-600">{progress}%</span>
            </div>

            <div className="max-w-3xl mx-auto mt-8 px-4">
                <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Course Enrollment</h1>
                    <p className="text-slate-500">Fill out this quick application to reserve your seat.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                    
                    {/* Course Summary Section (Auto-filled) */}
                    <div className="bg-indigo-50/50 p-6 sm:p-8 border-b border-indigo-100/50">
                        <h3 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-4 flex items-center gap-2">
                            <BookOpen size={16} /> Selected Course
                        </h3>
                        {course ? (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className={`w-20 h-20 rounded-2xl ${course.color} flex items-center justify-center shrink-0 shadow-inner`}>
                                    <BookOpen size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-1">{course.title}</h4>
                                    <p className="text-sm text-slate-600 line-clamp-2 max-w-md">{course.description}</p>
                                    <div className="flex gap-4 mt-3 text-sm font-semibold text-slate-700">
                                        <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{course.duration}</span>
                                        <span className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-green-700">Fee: {course.price}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No course selected. Please go back.</p>
                        )}
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Section 1: Basic Details */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Personal Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name *</label>
                                    <input 
                                        required
                                        type="text" 
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="E.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                                    <input 
                                        required
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Email Address (Optional)</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Gender *</label>
                                    <select 
                                        required
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Address */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Address Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1 relative sm:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Pincode *</label>
                                    <div className="relative">
                                        <input 
                                            required
                                            type="text" 
                                            name="pincode"
                                            maxLength={6}
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                            placeholder="E.g. 743273"
                                        />
                                        {fetchingPincode && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">State</label>
                                    <input 
                                        readOnly
                                        type="text" 
                                        value={formData.state}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                        placeholder="Auto-filled via Pincode"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">District</label>
                                    <input 
                                        readOnly
                                        type="text" 
                                        value={formData.district}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                        placeholder="Auto-filled via Pincode"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Post Office *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            name="post_office"
                                            value={formData.post_office}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                                            disabled={postOffices.length === 0 && !formData.post_office}
                                        >
                                            <option value="">Select Post Office</option>
                                            {postOffices.map((po, idx) => (
                                                <option key={idx} value={po}>{po}</option>
                                            ))}
                                            {/* Fallback if manually typed before or pre-filled from auth */}
                                            {formData.post_office && !postOffices.includes(formData.post_office) && (
                                                <option value={formData.post_office}>{formData.post_office}</option>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20}/>
                                    </div>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Address Line *</label>
                                    <textarea 
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                                        placeholder="Village, Street, House number..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Extra Features & Payment */}
                        <section className="bg-slate-50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-8 border-y border-slate-200 mt-8 mb-4 relative">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <CreditCard size={20} className="text-indigo-600"/> Payment & Perks
                            </h3>

                            <div className="space-y-6">
                                {/* Opt In Logic */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <label className="flex items-center justify-center w-6 h-6 border-2 border-indigo-600 rounded cursor-pointer relative">
                                                <input
                                                    type="checkbox"
                                                    name="opt_spoken_english"
                                                    checked={formData.opt_spoken_english}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                {formData.opt_spoken_english && <CheckCircle2 size={16} className="text-indigo-600" />}
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 leading-tight">Enroll Free Spoken English Class</h4>
                                                <button type="button" onClick={() => setShowSpokenEngInfo(!showSpokenEngInfo)} className="text-indigo-500 hover:text-indigo-700">
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">Boost your communication skills along with your course.</p>
                                            
                                            {showSpokenEngInfo && (
                                                <div className="mt-3 p-3 bg-indigo-50 text-indigo-900 text-sm rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                                                    Free spoken english classes will be provided from the ICST Chowberia once in a week and students will take that class during same computer course duration.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Free Practice Classes Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 relative">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 text-blue-600"><CheckCircle size={20} /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900">Includes Free Practice Classes</h4>
                                                <button type="button" onClick={() => setShowPracticeInfo(!showPracticeInfo)} className="text-blue-500 hover:text-blue-700">
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                            {showPracticeInfo && (
                                                <div className="mt-3 p-3 bg-white text-slate-700 text-sm rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                                                    Student enrolled in any course will be able to join extra practice sessions Monday to Friday in between 10:00 AM to 01:00 PM by contacting the ICST Chowberia office.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Installment Form */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-3">Preferred Payment Plan *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {['monthly', 'quarterly', 'yearly', 'one_time'].map((plan) => (
                                            <label 
                                                key={plan}
                                                className={`
                                                    cursor-pointer p-4 rounded-xl text-center border-2 transition-all duration-200 shadow-sm
                                                    ${formData.payment_plan === plan 
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-[1.02]' 
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }
                                                `}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="payment_plan" 
                                                    value={plan}
                                                    checked={formData.payment_plan === plan}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                <span className="block font-bold capitalize text-sm">{plan.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </section>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={submitting || progress < 100}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20
                                    ${submitting || progress < 100 ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'}
                                `}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Application <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                                By submitting this application, you agree to the institution's enrollment policies.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
