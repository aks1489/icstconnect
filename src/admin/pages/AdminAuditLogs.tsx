import { useState, useEffect } from 'react'
import {
    IconHistory,
    IconSearch,
    IconFilter,
    IconRefresh,
    IconUser,
    IconClock,
    IconEye,
    IconX,
    IconDatabase
} from '@tabler/icons-react'
import { auditService, type AuditLogEntry } from '../../services/auditService'
import { useToast } from '../../contexts/ToastContext'

export default function AdminAuditLogs() {
    const { showToast } = useToast()
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionFilter, setActionFilter] = useState<string>('all')
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const data = await auditService.getRecentLogs(100)
            setLogs(data)
        } catch (err: any) {
            console.error('Error loading audit logs:', err)
            showToast('Failed to load audit logs', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.resource_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (log.resource_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        const matchesAction = actionFilter === 'all' || log.resource_type === actionFilter
        return matchesSearch && matchesAction
    })

    const resourceTypes = Array.from(new Set(logs.map(l => l.resource_type).filter(Boolean)))

    const formatTimestamp = (ts?: string) => {
        if (!ts) return 'Unknown'
        try {
            return new Date(ts).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'medium'
            })
        } catch {
            return ts
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                            <IconHistory size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Security & Audit Logs</h1>
                            <p className="text-slate-500 text-sm">
                                Immutable chronological record of administrative actions, enrollments, and ledger changes
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <IconRefresh size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Logs</span>
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by actor email, action, resource, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <IconFilter size={18} className="text-slate-400 shrink-0" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">All Domains</option>
                        {resourceTypes.map(rt => (
                            <option key={rt} value={rt}>{rt.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading audit records...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <IconDatabase size={40} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">No audit logs found</p>
                        <p className="text-xs text-slate-400 mt-1">Actions performed by administrators will appear here in real time.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Timestamp</th>
                                    <th className="py-3.5 px-6">Actor</th>
                                    <th className="py-3.5 px-6">Action</th>
                                    <th className="py-3.5 px-6">Domain</th>
                                    <th className="py-3.5 px-6">Resource ID</th>
                                    <th className="py-3.5 px-6 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredLogs.map((log, idx) => (
                                    <tr key={log.id || idx} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3.5 px-6 whitespace-nowrap text-xs text-slate-500 font-mono flex items-center gap-1.5">
                                            <IconClock size={14} className="text-slate-400" />
                                            {formatTimestamp(log.created_at)}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <IconUser size={14} />
                                                </div>
                                                <div>
                                                    <span className="text-slate-800 font-medium block truncate max-w-[180px]">
                                                        {log.user_email || 'System Action'}
                                                    </span>
                                                    {log.user_role && (
                                                        <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            {log.user_role}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="font-semibold text-slate-800 font-mono text-xs">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                {log.resource_type || 'system'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                                            {log.resource_id || '—'}
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View raw payload"
                                            >
                                                <IconEye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Inspect Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Audit Record Details</h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    Action: {selectedLog.action}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                            >
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-1">Actor Email</span>
                                    <span className="font-medium text-slate-800">{selectedLog.user_email || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Timestamp</span>
                                    <span className="font-medium text-slate-800">{formatTimestamp(selectedLog.created_at)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">Target Entity</span>
                                    <span className="font-medium text-slate-800">{selectedLog.resource_type} ({selectedLog.resource_id || 'N/A'})</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-1">User Agent</span>
                                    <span className="font-mono text-slate-600 truncate block">{selectedLog.user_agent || 'Unknown'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                    Structured Metadata Payload
                                </label>
                                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
