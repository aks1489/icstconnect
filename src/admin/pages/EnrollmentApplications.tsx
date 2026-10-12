import { useState, useEffect } from 'react'
import { IconFileText as FileText, IconSearch as Search, IconFilter as Filter, IconCheck as Check, IconX as X } from '@tabler/icons-react'
import { useToast } from '../../contexts/ToastContext'
import { enrollmentService } from '../../services/enrollmentService'
import type { EnrollmentApplication } from '../../types'
import ApplicationApprovalModal from '../components/ApplicationApprovalModal'
import ApplicationDetailsModal from '../components/ApplicationDetailsModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function EnrollmentApplications() {
    const { showToast } = useToast()
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)
    const [isConfirmLoading, setIsConfirmLoading] = useState(false)
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

    const handleRejectClick = (app: EnrollmentApplication) => {
        setIsDetailsModalOpen(false) // Close details if open
        setConfirmModal({
            isOpen: true,
            title: 'Reject Application',
            description: `Are you sure you want to reject application ${app.reference_id}? This cannot be undone.`,
            confirmLabel: 'Reject Application',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await enrollmentService.rejectApplication(app.id, app)
                    showToast("Application rejected", "success")
                    fetchApplications()
                } catch (error: any) {
                    showToast(error.message || "Failed to reject application", "error")
                } finally {
                    setIsConfirmLoading(false)
                    setConfirmModal(null)
                }
            }
        })
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
        <div className="space-y-6 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enrollment Applications</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Review and approve new student enrollments</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or Ref ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition-colors cursor-pointer">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Reference ID</th>
                                <th className="px-6 py-4">Student Details</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Payment Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading applications...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No pending applications found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-sm font-semibold border border-slate-200 dark:border-slate-700">
                                                {app.reference_id}
                                            </span>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{app.full_name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{app.course?.course_name || 'Unknown Course'}</div>
                                            {app.opt_spoken_english && (
                                                <span className="text-[10px] bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-green-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                                                    + Spoken English
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{app.payment_plan.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold text-xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleInfoClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-200 dark:border-indigo-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                                    title="View Full Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleApproveClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400 hover:bg-green-600 hover:text-white border border-green-200 dark:border-emerald-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectClick(app)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border border-red-200 dark:border-red-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
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

            {confirmModal && (
                <ConfirmDialog
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    isLoading={isConfirmLoading}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
