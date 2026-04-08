import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Check, X } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { enrollmentService } from '../../services/enrollmentService'
import type { EnrollmentApplication } from '../../types'
import ApplicationApprovalModal from '../components/ApplicationApprovalModal'
import ApplicationDetailsModal from '../components/ApplicationDetailsModal'

export default function EnrollmentApplications() {
    const { showToast } = useToast()
    const [applications, setApplications] = useState<EnrollmentApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    
    // Modal State
    const [selectedApp, setSelectedApp] = useState<EnrollmentApplication | null>(null)
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const data = await enrollmentService.getPendingApplications()
            setApplications(data)
        } catch (error) {
            console.error(error)
            showToast("Failed to fetch applications", "error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    const handleApproveClick = (app: EnrollmentApplication) => {
        setIsDetailsModalOpen(false) // Close details if open
        setSelectedApp(app)
        setIsApproveModalOpen(true)
    }

    const handleInfoClick = (app: EnrollmentApplication) => {
        setSelectedApp(app)
        setIsDetailsModalOpen(true)
    }

    const handleRejectClick = async (app: EnrollmentApplication) => {
        setIsDetailsModalOpen(false) // Close details if open
        const confirm = window.confirm(`Are you sure you want to reject application ${app.reference_id}?`)
        if (!confirm) return

        try {
            await enrollmentService.rejectApplication(app.id, app)
            showToast("Application rejected", "success")
            fetchApplications()
        } catch (error: any) {
            showToast(error.message || "Failed to reject application", "error")
        }
    }

    const onApproveSuccess = () => {
        setIsApproveModalOpen(false)
        setSelectedApp(null)
        showToast("Application approved and student enrolled!", "success")
        fetchApplications()
    }

    const filtered = applications.filter(app => 
        app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enrollment Applications</h1>
                        <p className="text-sm text-slate-500">Review and approve new student enrollments</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or Ref ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Reference ID</th>
                                <th className="px-6 py-4">Student Details</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Payment Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-slate-500 text-sm">Loading applications...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No pending applications found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-sm font-semibold">
                                                {app.reference_id}
                                            </span>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{app.full_name}</div>
                                            <div className="text-sm text-slate-500">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{app.course?.course_name || 'Unknown Course'}</div>
                                            {app.opt_spoken_english && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                                                    + Spoken English
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize font-medium text-slate-700">{app.payment_plan.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleInfoClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                                    title="View Full Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleApproveClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedApp && (
                <>
                    <ApplicationDetailsModal 
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false)
                            setSelectedApp(null)
                        }}
                        application={selectedApp}
                        onApprove={handleApproveClick}
                        onReject={handleRejectClick}
                    />

                    <ApplicationApprovalModal 
                        isOpen={isApproveModalOpen}
                        onClose={() => {
                            setIsApproveModalOpen(false)
                            setSelectedApp(null)
                        }}
                        application={selectedApp}
                        onSuccess={onApproveSuccess}
                    />
                </>
            )}
        </div>
    )
}
