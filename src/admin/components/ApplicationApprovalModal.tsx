import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, BookOpen, UserPlus, Info, CreditCard } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { enrollmentService } from '../../services/enrollmentService'
import type { EnrollmentApplication } from '../../types'

interface ApplicationApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    application: EnrollmentApplication
    onSuccess: () => void
}

export default function ApplicationApprovalModal({ isOpen, onClose, application, onSuccess }: ApplicationApprovalModalProps) {
    
    // Core State
    const [classes, setClasses] = useState<any[]>([])
    const [loadingClasses, setLoadingClasses] = useState(true)
    const [selectedClassId, setSelectedClassId] = useState<string>('') 
    
    // Dynamic Creation State
    const [isCreatingClass, setIsCreatingClass] = useState(false)
    const [newBatchCapacity, setNewBatchCapacity] = useState(30)

    // Override State
    const [overrideBaseFee, setOverrideBaseFee] = useState<number>(0)
    const [overrideDiscount, setOverrideDiscount] = useState<number>(0)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchClasses()
            // Assume default overrides based on mock 
            setOverrideBaseFee(12000)
            if (application.payment_plan === 'one_time') setOverrideDiscount(1200)
        }
    }, [isOpen, application])

    const fetchClasses = async () => {
        setLoadingClasses(true)
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('course_id', application.course_id)
                .order('batch_number', { ascending: false })

            if (error) throw error
            setClasses(data || [])
            if (data && data.length > 0) {
                setSelectedClassId(data[0].id)
                setIsCreatingClass(false)
            } else {
                setSelectedClassId('new')
                setIsCreatingClass(true)
            }
        } catch (err: any) {
            console.error("Error fetching classes", err)
            setError("Failed to load classes for this course.")
        } finally {
            setLoadingClasses(false)
        }
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSelectedClassId(val)
        if (val === 'new') {
            setIsCreatingClass(true)
        } else {
            setIsCreatingClass(false)
        }
    }

    const handleApprove = async () => {
        if (!selectedClassId) {
            setError("Please select or create a class to assign.")
            return
        }

        setSubmitting(true)
        setError(null)
        try {
            let finalClassId = selectedClassId

            // 1. Create class dynamically if selected
            if (finalClassId === 'new') {
                const nextNumber = classes.length > 0 ? classes[0].batch_number + 1 : 1
                const batchName = `Batch ${nextNumber}`

                const { data: newClass, error: classError } = await supabase
                    .from('classes')
                    .insert({
                        course_id: application.course_id,
                        batch_name: batchName,
                        batch_number: nextNumber,
                        capacity: newBatchCapacity
                    })
                    .select()
                    .single()

                if (classError) throw new Error("Failed to create new class: " + classError.message)
                finalClassId = newClass.id
            }

            // 2. Approve and Enroll with overridden fees
            await enrollmentService.approveApplication(
                application.id, 
                parseInt(finalClassId), 
                { base_fee: overrideBaseFee, discount: overrideDiscount }, 
                application
            )

            onSuccess()
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Approval failed")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Approve & Assign
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Applicant Summary */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Student Assignment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Applicant</p>
                                <p className="font-bold text-slate-900">{application.full_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Target Course</p>
                                <p className="font-bold text-slate-900">{application.course?.course_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Class Assignment & Creation */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-500"/> Select / Create Class
                        </h3>
                        
                        {loadingClasses ? (
                            <div className="h-10 flex items-center justify-center text-slate-400 text-sm">Loading available classes...</div>
                        ) : (
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 mb-2 block">Choose Active Batch</span>
                                    <select 
                                        value={selectedClassId}
                                        onChange={handleSelectChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        {classes.length > 0 && <optgroup label="Existing Batches">
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.batch_name} (Capacity: {cls.capacity})
                                                </option>
                                            ))}
                                        </optgroup>}
                                        <optgroup label="Actions">
                                            <option value="new" className="font-bold text-indigo-600">+ Create New Class Batch</option>
                                        </optgroup>
                                    </select>
                                </label>

                                {isCreatingClass && (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3 mb-3">
                                            <Info size={18} className="text-indigo-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-indigo-900">Dynamic Class Creation</p>
                                                <p className="text-xs text-indigo-700">A new sequential batch will be automatically created and assigned.</p>
                                            </div>
                                        </div>
                                        <label className="block mt-2 text-sm font-semibold text-indigo-900">
                                            New Batch Capacity
                                            <input 
                                                type="number" 
                                                value={newBatchCapacity}
                                                onChange={e => setNewBatchCapacity(parseInt(e.target.value) || 30)}
                                                className="w-full mt-1 px-3 py-2 border border-indigo-200 rounded-lg outline-none focus:border-indigo-400"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fee Overrides */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <CreditCard size={16} className="text-indigo-500"/> Fee Configuration
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block text-sm font-bold text-slate-700">
                                Base Fee (Total)
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={overrideBaseFee}
                                        onChange={e => setOverrideBaseFee(parseInt(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                            </label>
                            <label className="block text-sm font-bold text-slate-700">
                                Custom Discount
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={overrideDiscount}
                                        onChange={e => setOverrideDiscount(parseInt(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                            </label>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm font-mono border border-slate-100">
                            <span className="text-slate-500">Final Projected Fee:</span>
                            <span className="font-bold text-lg text-slate-900">₹{overrideBaseFee - overrideDiscount}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
                    <button 
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleApprove}
                        disabled={submitting || (!selectedClassId && !isCreatingClass)}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                    >
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                        ) : (
                            <><UserPlus size={18} /> Confirm Profile & Enroll</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
