import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { auditService } from '../../services/auditService'
import { feesService } from '../../services/feesService'
import { IconX as X, IconUserPlus, IconCopy, IconCheck, IconEye, IconEyeOff, IconRefresh, IconSchool, IconCurrencyRupee, IconMapPin, IconShield } from '@tabler/icons-react'

interface CreateStudentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface CourseOption {
    id: number
    course_name: string
    fees?: {
        admission?: number
        monthly?: number
        total?: number
    }
}

interface ClassBatchOption {
    id: number
    batch_name: string
    course_id: number
}

export default function CreateStudentModal({ isOpen, onClose, onSuccess }: CreateStudentModalProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [courses, setCourses] = useState<CourseOption[]>([])
    const [classes, setClasses] = useState<ClassBatchOption[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [createdStudentData, setCreatedStudentData] = useState<{
        name: string
        email: string
        tempPass: string
        courseName?: string
        batchName?: string
    } | null>(null)
    const [copied, setCopied] = useState(false)

    const generateTempPass = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = 'ICST-'
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    const [formData, setFormData] = useState({
        // Personal
        full_name: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '',
        // Guardian
        guardian_name: '',
        guardian_phone: '',
        // Academic
        course_id: '',
        class_id: '',
        // Address
        address: '',
        district: 'Nadia',
        state: 'West Bengal',
        post_office: '',
        pincode: '',
        // Login
        password: generateTempPass(),
        // Fee Setup
        base_fee: 0,
        admission_fee: 0,
        discount_on_base: 0,
        discount_on_admission: 0,
        payment_plan: 'monthly' as 'one_time' | 'monthly',
        monthly_due_day: 5
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchCoursesAndBatches = async () => {
            const { data: coursesData } = await supabase.from('courses').select('id, course_name, fees').order('id')
            const { data: classesData } = await supabase.from('classes').select('id, batch_name, course_id').order('id')
            if (coursesData) setCourses(coursesData)
            if (classesData) setClasses(classesData)
        }

        fetchCoursesAndBatches()
        setCreatedStudentData(null)
        setCopied(false)
    }, [isOpen])

    const handleCourseChange = (courseIdStr: string) => {
        const cId = parseInt(courseIdStr, 10)
        const selected = courses.find(c => c.id === cId)
        setFormData(prev => ({
            ...prev,
            course_id: courseIdStr,
            class_id: '',
            base_fee: selected?.fees?.total || 0,
            admission_fee: selected?.fees?.admission || 0
        }))
    }

    const filteredClasses = classes.filter(c => formData.course_id ? c.course_id === parseInt(formData.course_id, 10) : true)

    const finalTotalFee = Math.max(0, (formData.base_fee - formData.discount_on_base) + (formData.admission_fee - formData.discount_on_admission))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Create the user in Supabase Auth via relay or direct signUp
            let authUserId: string | null = null

            try {
                const relayRes = await fetch('/api/create-auth-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        full_name: formData.full_name
                    })
                })
                if (relayRes.ok) {
                    const relayData = await relayRes.json()
                    authUserId = relayData.user?.id || null
                }
            } catch {
                // Relay fallback: direct client call if local relay offline
            }

            if (!authUserId) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.full_name,
                            role: 'student'
                        }
                    }
                })
                if (authError) throw authError
                authUserId = authData.user?.id || null
            }

            if (!authUserId) {
                throw new Error('Failed to obtain user identity for new student')
            }

            // 2. Update extended profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authUserId,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    role: 'student',
                    guardian_name: formData.guardian_name,
                    address: formData.address,
                    district: formData.district,
                    state: formData.state,
                    post_office: formData.post_office,
                    pincode: formData.pincode,
                    dob: formData.dob || null,
                    temp_password: formData.password,
                    requires_password_change: true
                })

            if (profileError) console.warn('Profile upsert notice:', profileError)

            // 3. Create Enrollment if course and class selected
            if (formData.course_id && formData.class_id) {
                const classIdNum = parseInt(formData.class_id, 10)
                await supabase.from('enrollments').insert([{
                    student_id: authUserId,
                    class_id: classIdNum,
                    created_at: new Date().toISOString()
                }])

                // 4. Assign Fee Structure
                await feesService.assignFeeStructure({
                    student_id: authUserId,
                    course_id: parseInt(formData.course_id, 10),
                    base_fee: formData.base_fee,
                    admission_fee: formData.admission_fee,
                    discount_on_base: formData.discount_on_base,
                    discount_on_admission: formData.discount_on_admission,
                    payment_plan: formData.payment_plan,
                    monthly_due_day: formData.monthly_due_day,
                    status: 'pending'
                })
            }

            // 5. Emit Audit Log
            await auditService.logAction({
                action: 'STUDENT_REGISTER',
                resource_type: 'student',
                resource_id: authUserId,
                details: {
                    name: formData.full_name,
                    email: formData.email,
                    course_id: formData.course_id,
                    class_id: formData.class_id
                }
            })

            const selectedCourse = courses.find(c => c.id.toString() === formData.course_id)
            const selectedClass = classes.find(c => c.id.toString() === formData.class_id)

            setCreatedStudentData({
                name: formData.full_name,
                email: formData.email,
                tempPass: formData.password,
                courseName: selectedCourse?.course_name,
                batchName: selectedClass?.batch_name
            })

            showToast('Student registered and onboarded successfully!', 'success')
            onSuccess()
        } catch (err: unknown) {
            const msg = (err as Error).message || 'Failed to create student'
            console.error('Error registering student:', err)
            setError(msg)
            showToast(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const copyCredentials = () => {
        if (!createdStudentData) return
        const text = `ICST Connect Student Credentials:\nName: ${createdStudentData.name}\nEmail: ${createdStudentData.email}\nTemporary Password: ${createdStudentData.tempPass}\nPortal: ${window.location.origin}/login`
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
            showToast('Student credentials copied to clipboard!', 'info')
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
                            <IconUserPlus size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Direct Student Registration</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Complete admission and account provisioning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {createdStudentData ? (
                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300 font-semibold text-base">
                                <div className="p-2 rounded-lg bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                                    <IconCheck size={20} />
                                </div>
                                <span>Student Account Created Successfully</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                The student has been enrolled and configured with temporary login credentials. They will be prompted to rotate their password on initial login.
                            </p>

                            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm space-y-2">
                                <p><span className="text-slate-400">Student:</span> <strong className="text-slate-800 dark:text-slate-100">{createdStudentData.name}</strong></p>
                                <p><span className="text-slate-400">Email:</span> <strong className="text-slate-800 dark:text-slate-100">{createdStudentData.email}</strong></p>
                                <p><span className="text-slate-400">Temporary Password:</span> <strong className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{createdStudentData.tempPass}</strong></p>
                                {createdStudentData.courseName && <p><span className="text-slate-400">Course:</span> <strong className="text-slate-800 dark:text-slate-100">{createdStudentData.courseName}</strong></p>}
                                {createdStudentData.batchName && <p><span className="text-slate-400">Batch:</span> <strong className="text-slate-800 dark:text-slate-100">{createdStudentData.batchName}</strong></p>}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={copyCredentials}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all"
                                >
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    <span>{copied ? 'Copied to Clipboard' : 'Copy Credentials'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/50">
                                    {error}
                                </div>
                            )}

                            {/* Section 1: Personal Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconUserPlus size={16} /> Personal Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Subhadip Roy"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="student@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Guardian Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconShield size={16} /> Guardian Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guardian Name</label>
                                        <input
                                            type="text"
                                            value={formData.guardian_name}
                                            onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Father / Mother / Guardian Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guardian Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.guardian_phone}
                                            onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Guardian contact number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Academic Setup */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconSchool size={16} /> Academic Target & Batch
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Enrolling Course *</label>
                                        <select
                                            required
                                            value={formData.course_id}
                                            onChange={(e) => handleCourseChange(e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Select Course...</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id.toString()}>{c.course_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Batch Class *</label>
                                        <select
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            disabled={!formData.course_id}
                                        >
                                            <option value="">Select Active Batch...</option>
                                            {filteredClasses.map(c => (
                                                <option key={c.id} value={c.id.toString()}>{c.batch_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Address Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconMapPin size={16} /> Address Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Vill / Road / House number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">District</label>
                                        <input
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN Code</label>
                                        <input
                                            type="text"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="741222"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Credentials */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconShield size={16} /> Temporary Login Credentials
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, password: generateTempPass() }))}
                                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                                        title="Generate random temporary password"
                                    >
                                        <IconRefresh size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Section 6: Fee Setup */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                    <IconCurrencyRupee size={16} /> Fee Configuration & Plan
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Base Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.base_fee}
                                            onChange={(e) => setFormData({ ...formData, base_fee: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Admission Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.admission_fee}
                                            onChange={(e) => setFormData({ ...formData, admission_fee: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Discount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.discount_on_base}
                                            onChange={(e) => setFormData({ ...formData, discount_on_base: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Final Fee (₹)</label>
                                        <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm">
                                            ₹{finalTotalFee}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span>Registering...</span>
                                        </>
                                    ) : (
                                        'Register & Provision Student'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
