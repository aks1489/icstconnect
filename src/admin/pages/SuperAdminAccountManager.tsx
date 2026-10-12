import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    IconShieldLock as ShieldLock,
    IconUserPlus as UserPlus,
    IconUsers as Users,
    IconKey as Key,
    IconSearch as Search,
    IconX as X,
    IconShieldCheck as ShieldCheck,
    IconCrown as Crown,
    IconBuildingBank as BuildingBank,
    IconTrash as Trash2,
    IconRefresh as Refresh,
    IconDice as Dice
} from '@tabler/icons-react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import SEOHead from '../../components/common/SEOHead'

interface StaffAccount {
    id: string
    full_name: string
    email: string
    role: 'super_admin' | 'admin' | 'teacher' | 'receptionist' | 'lab_assistant' | 'maintenance' | string
    employee_id?: string
    teacher_id?: string
    phone?: string
    designation?: string
    department?: string
    created_at: string
}

export default function SuperAdminAccountManager() {
    const { profile, isSuperAdmin } = useAuth()
    const { showToast } = useToast()

    const [accounts, setAccounts] = useState<StaffAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    // Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        description: string
        confirmLabel: string
        variant: 'danger' | 'warning' | 'primary'
        action: () => Promise<void>
    } | null>(null)

    // Form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'teacher' as 'admin' | 'teacher' | 'receptionist' | 'lab_assistant' | 'maintenance',
        designation: '',
        department: '',
        phone: '',
        employeeId: ''
    })
    const [formSubmitting, setFormSubmitting] = useState(false)

    useEffect(() => {
        if (isSuperAdmin) {
            loadAccounts()
        }
    }, [isSuperAdmin])

    const loadAccounts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['super_admin', 'admin', 'teacher', 'receptionist', 'lab_assistant', 'maintenance'])
                .order('created_at', { ascending: false })

            if (error) throw error
            setAccounts(data || [])
        } catch (err: any) {
            console.error('Error fetching staff accounts:', err)
            showToast('Failed to load management accounts', 'error')
        } finally {
            setLoading(false)
        }
    }

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$'
        let pass = ''
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, password: pass }))
        showToast('Generated secure temporary password', 'info')
    }

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.fullName || !formData.email || !formData.password) {
            showToast('Please fill in all required fields', 'error')
            return
        }

        setFormSubmitting(true)
        try {
            const empPrefix = formData.role === 'admin'
                ? 'ADM'
                : formData.role === 'teacher'
                    ? 'TCH'
                    : formData.role === 'receptionist'
                        ? 'REC'
                        : formData.role === 'lab_assistant'
                            ? 'LAB'
                            : 'MNT'

            const generatedEmpId = formData.employeeId || `${empPrefix}-${Math.floor(100000 + Math.random() * 900000)}`

            // Create a secondary client to prevent logging out the Super Admin
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            )

            const { data, error: authError } = await tempClient.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName.trim(),
                        role: formData.role,
                        employee_id: generatedEmpId,
                        teacher_id: formData.role === 'teacher' ? generatedEmpId : undefined,
                        designation: formData.designation,
                        department: formData.department,
                        phone: formData.phone
                    }
                }
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('This email address is already registered.')
                }
                throw authError
            }

            if (!data.user) throw new Error('User creation failed')

            // Update extended profile columns directly to ensure persistence
            try {
                await supabase
                    .from('profiles')
                    .update({
                        employee_id: generatedEmpId,
                        designation: formData.designation || undefined,
                        department: formData.department || undefined,
                        phone: formData.phone || undefined
                    })
                    .eq('id', data.user.id)
            } catch (pErr) {
                console.warn('Profile meta update warn:', pErr)
            }

            showToast(`Account provisioned successfully for ${formData.fullName} (${formData.role.toUpperCase()})`, 'success')
            setIsCreateModalOpen(false)
            setFormData({
                fullName: '',
                email: '',
                password: '',
                role: 'teacher',
                designation: '',
                department: '',
                phone: '',
                employeeId: ''
            })
            loadAccounts()
        } catch (err: any) {
            console.error('Account creation error:', err)
            showToast(err.message || 'Failed to provision account', 'error')
        } finally {
            setFormSubmitting(false)
        }
    }

    const handleDeleteAccount = (acc: StaffAccount) => {
        if (acc.role === 'super_admin') {
            showToast('Super Admin accounts cannot be deleted.', 'error')
            return
        }

        setConfirmModal({
            isOpen: true,
            title: `Decommission ${acc.full_name}'s Account`,
            description: `Are you sure you want to delete ${acc.full_name} (${acc.role.toUpperCase()})? This action is permanent and removes their system access.`,
            confirmLabel: 'Delete Account',
            variant: 'danger',
            action: async () => {
                try {
                    // Try rpc delete_user_by_id if present, or delete from profiles
                    const { error } = await supabase.rpc('delete_user_by_id', { user_id: acc.id })
                    if (error) {
                        // Fallback to profile record delete
                        await supabase.from('profiles').delete().eq('id', acc.id)
                    }
                    showToast('Account decommissioned successfully', 'success')
                    loadAccounts()
                } catch (err: any) {
                    console.error('Error deleting account:', err)
                    showToast('Failed to delete account', 'error')
                } finally {
                    setConfirmModal(null)
                }
            }
        })
    }

    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => {
            if (roleFilter !== 'all' && acc.role !== roleFilter) return false
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchName = (acc.full_name || '').toLowerCase().includes(q)
                const matchEmail = (acc.email || '').toLowerCase().includes(q)
                const matchEmp = (acc.employee_id || acc.teacher_id || '').toLowerCase().includes(q)
                if (!matchName && !matchEmail && !matchEmp) return false
            }
            return true
        })
    }, [accounts, roleFilter, searchQuery])

    // KPI counts
    const counts = useMemo(() => {
        return {
            total: accounts.length,
            admins: accounts.filter(a => a.role === 'admin').length,
            teachers: accounts.filter(a => a.role === 'teacher').length,
            staff: accounts.filter(a => ['receptionist', 'lab_assistant', 'maintenance'].includes(a.role)).length
        }
    }, [accounts])

    // Strictly Guarded Screen for non-super admins
    if (!isSuperAdmin) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <SEOHead
                    title="Access Restricted - ICST Connect"
                    canonical="/admin/management-accounts"
                    noindex={true}
                />
                <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <ShieldLock size={36} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Super Administrator Only
                        </span>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            Account Creation Gate
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Institutional governance dictates that <strong>only the Super Administrator (Owner & Lead Dev)</strong> has the authority to provision, modify roles, or decommission management & staff accounts.
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                        Signed in role: <span className="font-bold text-slate-700 dark:text-slate-300">{profile?.role || 'Guest'}</span>
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/admin/dashboard"
                            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md"
                        >
                            Return to Admin Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <SEOHead
                title="Management Accounts - Super Admin Gateway"
                canonical="/admin/management-accounts"
                noindex={true}
            />

            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                            <Crown size={13} />
                            Super Admin Master Control
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Owner & Lead Dev Access
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                        <ShieldCheck className="text-purple-600 dark:text-purple-400" size={28} />
                        Management & Staff Account Provisioning
                    </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={loadAccounts}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Refresh Accounts"
                    >
                        <Refresh size={18} />
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 cursor-pointer"
                    >
                        <UserPlus size={16} />
                        <span>Provision Management Account</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>All Management Accounts</span>
                        <Users size={18} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {counts.total}
                    </p>
                    <p className="text-[11px] text-slate-400">Total staff & leadership</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Operational Admins</span>
                        <BuildingBank size={18} className="text-indigo-500" />
                    </div>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {counts.admins}
                    </p>
                    <p className="text-[11px] text-slate-400">Operational In-Charge (On Payroll)</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Faculty & Teachers</span>
                        <Key size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {counts.teachers}
                    </p>
                    <p className="text-[11px] text-slate-400">Active instructors</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Specialized Staff</span>
                        <ShieldLock size={18} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {counts.staff}
                    </p>
                    <p className="text-[11px] text-slate-400">Reception, Lab & Maintenance</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin (Root)</option>
                        <option value="admin">Admin (Operational)</option>
                        <option value="teacher">Teacher (Faculty)</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="lab_assistant">Lab Assistant</option>
                        <option value="maintenance">Maintenance Staff</option>
                    </select>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search name, email, or employee ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="p-4">Staff Member</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role Classification</th>
                                <th className="p-4">Employee ID</th>
                                <th className="p-4">Department / Phone</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading authorized accounts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">
                                        No management accounts matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map(acc => {
                                    const isRoot = acc.role === 'super_admin'
                                    const empId = acc.employee_id || acc.teacher_id || '—'

                                    return (
                                        <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isRoot
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                                        }`}>
                                                        {acc.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{acc.full_name}</span>
                                                            {isRoot && (
                                                                <Crown size={14} className="text-amber-500" title="Super Admin / Owner" />
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">{acc.designation || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                                                {acc.email}
                                            </td>

                                            {/* Role */}
                                            <td className="p-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${acc.role === 'super_admin'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300'
                                                    : acc.role === 'admin'
                                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                                        : acc.role === 'teacher'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : acc.role === 'receptionist'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    }`}>
                                                    {acc.role.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Employee ID */}
                                            <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {empId}
                                            </td>

                                            {/* Department / Phone */}
                                            <td className="p-4 text-slate-500 dark:text-slate-400">
                                                <div>{acc.department || 'ICST Campus'}</div>
                                                <div className="text-[10px] font-mono">{acc.phone || '—'}</div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                {!isRoot && (
                                                    <button
                                                        onClick={() => handleDeleteAccount(acc)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                                        title="Decommission Account"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Provision Account Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Crown size={20} className="text-purple-600" />
                                    Provision Management Account
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Super Admin exclusive authorization
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Subir Karmakar"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Institutional Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. staff.member@icstconnect.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Password with generator */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Password *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <Dice size={13} />
                                        Generate Password
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter or generate temporary password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Role Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Institutional Role Hierarchy *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="admin">Admin (Operational In-Charge • On Institute Payroll)</option>
                                    <option value="teacher">Teacher (Instructional Faculty)</option>
                                    <option value="receptionist">Receptionist (Front Desk & Enquiries)</option>
                                    <option value="lab_assistant">Lab Assistant (Workstations & Hardware)</option>
                                    <option value="maintenance">Maintenance Staff (Hygiene & Campus Facilities)</option>
                                </select>
                            </div>

                            {/* Designation & Department */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Designation Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Instructor"
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {formSubmitting ? 'Provisioning...' : 'Provision Account'}
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
                    isLoading={false}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    )
}
