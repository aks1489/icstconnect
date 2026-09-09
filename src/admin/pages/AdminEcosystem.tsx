import { useState, useEffect } from 'react'
import {
    IconWorld,
    IconPlus,
    IconExternalLink,
    IconTrash,
    IconPencil,
    IconX,
    IconBriefcase,
    IconRefresh
} from '@tabler/icons-react'
import { ecosystemService, type EcosystemSite } from '../../services/ecosystemService'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function AdminEcosystem() {
    const { showToast } = useToast()
    const [sites, setSites] = useState<EcosystemSite[]>([])
    const [loading, setLoading] = useState(true)

    // Form / Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSite, setEditingSite] = useState<EcosystemSite | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form inputs
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [url, setUrl] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState<'student_tool' | 'faculty_tool' | 'public_portal'>('student_tool')
    const [badge, setBadge] = useState('')
    const [displayOrder, setDisplayOrder] = useState<number>(1)
    const [isActive, setIsActive] = useState(true)

    // Delete Confirmation
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)
    const [isConfirmLoading, setIsConfirmLoading] = useState(false)

    const fetchSites = async () => {
        setLoading(true)
        try {
            const data = await ecosystemService.getAllSitesForAdmin()
            setSites(data)
        } catch (err: any) {
            console.error('Failed to load ecosystem sites:', err)
            showToast('Failed to load ecosystem sites', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSites()
    }, [])

    const openCreateModal = () => {
        setEditingSite(null)
        setName('')
        setCode('')
        setUrl('')
        setDescription('')
        setCategory('student_tool')
        setBadge('')
        setDisplayOrder(sites.length + 1)
        setIsActive(true)
        setIsModalOpen(true)
    }

    const openEditModal = (site: EcosystemSite) => {
        setEditingSite(site)
        setName(site.name)
        setCode(site.code)
        setUrl(site.url)
        setDescription(site.description || '')
        setCategory(site.category)
        setBadge(site.badge || '')
        setDisplayOrder(site.display_order || 1)
        setIsActive(site.is_active)
        setIsModalOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !url) {
            showToast('Please provide a name and destination URL', 'warning')
            return
        }

        setIsSaving(true)
        try {
            const payload: Partial<EcosystemSite> = {
                ...(editingSite ? { id: editingSite.id } : {}),
                name,
                code: code || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                url,
                description,
                category,
                badge,
                display_order: Number(displayOrder),
                is_active: isActive
            }

            await ecosystemService.saveSite(payload)
            showToast(editingSite ? 'Companion site updated!' : 'New ecosystem site registered!', 'success')
            setIsModalOpen(false)
            fetchSites()
        } catch (err: any) {
            console.error('Failed to save site:', err)
            showToast('Failed to save: ' + (err.message || 'Unknown error'), 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = (site: EcosystemSite) => {
        setConfirmModal({
            isOpen: true,
            title: 'Deregister Ecosystem Site',
            description: `Are you sure you want to remove "${site.name}" from the ecosystem registry? Links in student and faculty navigation will be removed.`,
            confirmLabel: 'Remove Site',
            variant: 'danger',
            action: async () => {
                setIsConfirmLoading(true)
                try {
                    await ecosystemService.deleteSite(site.id)
                    showToast('Ecosystem site removed.', 'info')
                    fetchSites()
                } catch (err: any) {
                    showToast('Failed to remove: ' + err.message, 'error')
                } finally {
                    setIsConfirmLoading(false)
                    setConfirmModal(null)
                }
            }
        })
    }

    const handleToggleActive = async (site: EcosystemSite) => {
        try {
            await ecosystemService.saveSite({
                ...site,
                is_active: !site.is_active
            })
            showToast(`Site status changed to ${!site.is_active ? 'Active' : 'Inactive'}`, 'info')
            fetchSites()
        } catch (err: any) {
            showToast('Failed to toggle status: ' + err.message, 'error')
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                            <IconWorld size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Ecosystem & Companion Sites</h1>
                            <p className="text-slate-500 text-sm">
                                Manage registered ICST external web destinations and simulator platforms
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSites}
                        className="p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Refresh list"
                    >
                        <IconRefresh size={20} />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
                    >
                        <IconPlus size={18} />
                        <span>Add Ecosystem Site</span>
                    </button>
                </div>
            </div>

            {/* Sites Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-400">Loading ecosystem registry...</div>
            ) : sites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
                    No external companion platforms registered.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map(site => (
                        <div
                            key={site.id}
                            className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between ${site.is_active ? 'border-slate-200 hover:shadow-lg' : 'border-slate-200 opacity-60 bg-slate-50/50'
                                }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                            <IconBriefcase size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-base leading-snug">
                                                {site.name}
                                            </h3>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                {site.code}
                                            </span>
                                        </div>
                                    </div>

                                    {site.badge && (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {site.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                    {site.description || 'No description provided.'}
                                </p>
                            </div>

                            <div>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mb-4">
                                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                        {site.category.replace('_', ' ')}
                                    </span>
                                    <button
                                        onClick={() => handleToggleActive(site)}
                                        className={`font-semibold px-2 py-0.5 rounded transition-colors ${site.is_active ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        {site.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <a
                                        href={site.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <span>Launch Site</span>
                                        <IconExternalLink size={14} />
                                    </a>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(site)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Site Details"
                                        >
                                            <IconPencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(site)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Site"
                                        >
                                            <IconTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingSite ? 'Edit Companion Site' : 'Register Companion Site'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                            >
                                <IconX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Platform Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. ICST Job Portal Simulator"
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Destination Web URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://icst-job-portal-simulator.netlify.app/"
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Target Audience
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e: any) => setCategory(e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="student_tool">Student Portal</option>
                                        <option value="faculty_tool">Faculty Portal</option>
                                        <option value="public_portal">Public Website</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Badge Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={badge}
                                        onChange={(e) => setBadge(e.target.value)}
                                        placeholder="e.g. Recommended, New"
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Explain the purpose of this companion tool for students/teachers..."
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="site_active_toggle"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                <label htmlFor="site_active_toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Active (visible in student and faculty navigation menus)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Site'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
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
