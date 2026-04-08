import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, BookOpen, UserPlus } from 'lucide-react'
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
    const [classes, setClasses] = useState<any[]>([])
    const [loadingClasses, setLoadingClasses] = useState(true)
    const [selectedClassId, setSelectedClassId] = useState<string>('') // Can be 'new' to create a new class
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchClasses()
        }
    }, [isOpen, application.course_id])

    const fetchClasses = async () => {
        setLoadingClasses(true)
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('course_id', application.course_id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setClasses(data || [])
            if (data && data.length > 0) {
                setSelectedClassId(data[0].id)
            }
        } catch (err: any) {
            console.error("Error fetching classes", err)
            setError("Failed to load classes for this course.")
        } finally {
            setLoadingClasses(false)
        }
    }

    const handleApprove = async () => {
        if (!selectedClassId) {
            setError("Please select a class to assign.")
            return
        }

        setSubmitting(true)
        setError(null)
        try {
            // Standard approve: just update enrollment row and show a mock success of User Generation
            await enrollmentService.approveApplication(application.id, parseInt(selectedClassId), {}, application)

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
            
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Approve Application
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Applicant Summary */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Student Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500">Full Name</p>
                                <p className="font-bold text-slate-900">{application.full_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Phone</p>
                                <p className="font-bold text-slate-900">{application.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Location</p>
                                <p className="font-bold text-slate-900 text-sm truncate">{application.district}, {application.state}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Payment Plan</p>
                                <p className="font-bold text-slate-900 capitalize">{application.payment_plan.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Class Assignment */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-500"/> Assign to Class
                        </h3>
                        
                        {loadingClasses ? (
                            <div className="h-10 flex items-center justify-center text-slate-400 text-sm">Loading available classes...</div>
                        ) : (
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-bold text-slate-700 mb-2 block">Available Classes for this Course</span>
                                    <select 
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        <option value="" disabled>Select a class</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.batch_name} (Schedule: {cls.schedule})
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {classes.length === 0 && (
                                    <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-sm border border-amber-100 flex items-start gap-2">
                                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                        <p>No active classes exist for this course yet. You must create one in the Classes section before enrolling.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleApprove}
                        disabled={submitting || !selectedClassId}
                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                    >
                        {submitting ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                        ) : (
                            <><UserPlus size={18} /> Approve & Enroll</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
