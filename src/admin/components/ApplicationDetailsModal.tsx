import { X, User, MapPin, Calendar, BookOpen, CheckCircle2, CreditCard, ChevronDown } from 'lucide-react'
import type { EnrollmentApplication } from '../../types'

interface Props {
    isOpen: boolean
    onClose: () => void
    application: EnrollmentApplication
    onApprove: (app: EnrollmentApplication) => void
    onReject: (app: EnrollmentApplication) => void
}

export default function ApplicationDetailsModal({ isOpen, onClose, application, onApprove, onReject }: Props) {
    if (!isOpen || !application) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="text-indigo-600" size={24}/> Application Profile
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-sm font-bold rounded-lg uppercase tracking-wider">
                            Ref: {application.reference_id}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md flex items-end justify-between">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1">Applicant Name</p>
                            <h1 className="text-3xl font-black">{application.full_name}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-indigo-100 font-medium mb-1">Applied On</p>
                            <p className="font-bold text-lg">{new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Box 1: Contact & Basic Info */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                <User size={18} className="text-indigo-600"/> Contact Info
                            </h3>
                            <div className="space-y-4">
                                <div><p className="text-xs text-slate-500 font-bold uppercase">Phone Number</p><p className="font-semibold text-slate-900">{application.phone}</p></div>
                                <div><p className="text-xs text-slate-500 font-bold uppercase">Email Address</p><p className="font-semibold text-slate-900">{application.email || 'Not Provided'}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">Gender</p><p className="font-semibold text-slate-900">{application.gender}</p></div>
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">Date of Birth</p><p className="font-semibold text-slate-900">{application.dob ? new Date(application.dob).toLocaleDateString() : 'Not provided'}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Location */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-600"/> Address
                            </h3>
                            <div className="space-y-4">
                                <div><p className="text-xs text-slate-500 font-bold uppercase">Street Address</p><p className="font-semibold text-slate-900">{application.address}</p></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">Post Office</p><p className="font-semibold text-slate-900">{application.post_office}</p></div>
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">Pincode</p><p className="font-semibold text-slate-900">{application.pincode}</p></div>
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">District</p><p className="font-semibold text-slate-900">{application.district}</p></div>
                                    <div><p className="text-xs text-slate-500 font-bold uppercase">State</p><p className="font-semibold text-slate-900">{application.state}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Course Selection */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-600"/> Enrollment Target
                            </h3>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Target Course</p>
                                    <p className="font-black text-xl text-slate-900">{application.course?.course_name || 'Unknown'}</p>
                                    
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {application.opt_spoken_english && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                                                <CheckCircle2 size={14}/> Spoken English Added
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                                            <CheckCircle2 size={14}/> Practice Classes Included
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-700"><CreditCard size={18}/> <p className="font-bold text-sm">Payment Plan</p></div>
                                    <p className="font-black text-2xl text-indigo-900 capitalize">{application.payment_plan.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={() => {
                            onClose()
                            onReject(application)
                        }}
                        className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                        Reject Application
                    </button>
                    <button 
                        onClick={() => {
                            onClose()
                            onApprove(application)
                        }}
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 flex items-center transition-colors shadow-lg shadow-green-600/20"
                    >
                        Review & Approve Application
                    </button>
                </div>
            </div>
        </div>
    )
}
