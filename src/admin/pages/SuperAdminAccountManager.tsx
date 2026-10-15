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
    IconDice as Dice,
    IconMail as Mail,
    IconServer as Server,
    IconCheck as Check,
    IconAlertCircle as AlertCircle,
    IconSend as Send
} from '@tabler/icons-react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import { verifySmtpConnection, sendEmail } from '../../services/emailService'
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

    // SMTP Diagnostics Modal
    const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false)
    const [smtpStatus, setSmtpStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle')
    const [smtpInfo, setSmtpInfo] = useState<{ host?: string; port?: number; user?: string; error?: string } | null>(null)
    const [testEmailAddress, setTestEmailAddress] = useState(profile?.email || 'akash.sarkar1489@gmail.com')
    const [testEmailSending, setTestEmailSending] = useState(false)
    const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message?: string; error?: string; messageId?: string } | null>(null)

    const handleCheckSmtp = async () => {
        setSmtpStatus('checking')
        setSmtpInfo(null)
        try {
            const res = await verifySmtpConnection()
            if (res.success) {
                setSmtpStatus('connected')
                setSmtpInfo({ host: res.host, port: res.port, user: res.user })
                showToast('SMTP Connection Verified Successfully!', 'success')
            } else {
                setSmtpStatus('error')
                setSmtpInfo({ error: res.error })
                showToast('SMTP Connection Failed', 'error')
            }
        } catch (err: any) {
            setSmtpStatus('error')
            setSmtpInfo({ error: err.message })
            showToast('SMTP Connection Failed', 'error')
        }
    }

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!testEmailAddress) return
        setTestEmailSending(true)
        setTestEmailResult(null)
        try {
            const res = await sendEmail({
                to: testEmailAddress,
                subject: 'ICST Connect - Live SMTP Diagnostics Test',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; text-align: center; color: white;">
                            <h2 style="margin: 0; font-size: 22px;">SMTP Diagnostics Test</h2>
                            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Institute of Computer Science & Technology</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="margin: 0 0 12px 0; color: #1e293b; font-size: 15px;"><strong>Test Successful!</strong></p>
                            <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.5;">This email confirms that the ICST Connect SMTP relay is online and communicating properly with the mail server.</p>
                            <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #334155;">
                                <div><strong>Timestamp:</strong> ${new Date().toLocaleString()}</div>
                                <div><strong>Relay Host:</strong> smtp.gmail.com:465</div>
                                <div><strong>Authorized User:</strong> icstconnect@gmail.com</div>
                                <div><strong>Recipient:</strong> ${testEmailAddress}</div>
                            </div>
                        </div>
                        <div style="background: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 12px; color: #64748b;">
                            ICST Connect Institutional Mail Subsystem
                        </div>
                    </div>
                `
            })
            if (res.success) {
                setTestEmailResult({ success: true, messageId: res.messageId, message: 'Test email delivered successfully!' })
                showToast('Test email sent successfully!', 'success')
            } else {
                setTestEmailResult({ success: false, error: res.error || 'Failed to dispatch email' })
                showToast(res.error || 'Test email failed', 'error')
            }
        } catch (err: any) {
            setTestEmailResult({ success: false, error: err.message || 'Dispatch error' })
            showToast(err.message || 'Test email failed', 'error')
        } finally {
            setTestEmailSending(false)
        }
    }

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
                        onClick={() => {
                            setIsSmtpModalOpen(true)
                            handleCheckSmtp()
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                        title="Run SMTP Health Check & Diagnostics"
                    >
                        <Mail size={16} />
                        <span>SMTP Diagnostics</span>
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

            {/* SMTP Diagnostics Modal */}
            {isSmtpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsSmtpModalOpen(false)}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                                    <Server size={13} />
                                    Mail Infrastructure
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Mail className="text-indigo-600 dark:text-indigo-400" size={24} />
                                SMTP & Email Transport Diagnostics
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Real-time verification of Gmail SMTP relay credentials, network handshakes, and test email delivery.
                            </p>
                        </div>

                        {/* Connection Card */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    SMTP Server Status
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {smtpStatus === 'checking' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                            Verifying Transporter...
                                        </span>
                                    )}
                                    {smtpStatus === 'connected' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            <Check size={13} />
                                            Connected & Operational
                                        </span>
                                    )}
                                    {smtpStatus === 'error' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                            <AlertCircle size={13} />
                                            Connection Failed
                                        </span>
                                    )}
                                    {smtpStatus === 'idle' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <span className="block text-slate-400 text-[10px] font-sans font-bold">RELAY HOST</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{smtpInfo?.host || 'smtp.gmail.com'}</span>
                                </div>
                                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <span className="block text-slate-400 text-[10px] font-sans font-bold">PORT / PROTOCOL</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{smtpInfo?.port || 465} (SSL)</span>
                                </div>
                                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                                    <span className="block text-slate-400 text-[10px] font-sans font-bold">AUTH USER</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{smtpInfo?.user || 'icstconnect@gmail.com'}</span>
                                </div>
                            </div>

                            {smtpInfo?.error && (
                                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{smtpInfo.error}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={smtpStatus === 'checking'}
                                onClick={handleCheckSmtp}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Refresh size={14} className={smtpStatus === 'checking' ? 'animate-spin' : ''} />
                                <span>Re-Verify SMTP Credentials</span>
                            </button>
                        </div>

                        {/* Test Email Dispatcher */}
                        <form onSubmit={handleSendTestEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Send Live Test Email To
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={testEmailAddress}
                                        onChange={e => setTestEmailAddress(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="flex-1 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={testEmailSending || !testEmailAddress}
                                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        <Send size={14} className={testEmailSending ? 'animate-spin' : ''} />
                                        <span>{testEmailSending ? 'Sending...' : 'Send Test'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Test Result Log */}
                            {testEmailResult && (
                                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                                    testEmailResult.success
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                                }`}>
                                    {testEmailResult.success ? (
                                        <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    )}
                                    <div className="space-y-0.5">
                                        <p className="font-bold">{testEmailResult.success ? 'Email Dispatched Successfully!' : 'Delivery Failed'}</p>
                                        <p className="text-[11px] opacity-90">{testEmailResult.message || testEmailResult.error}</p>
                                        {testEmailResult.messageId && (
                                            <p className="text-[10px] font-mono opacity-75">Message ID: {testEmailResult.messageId}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsSmtpModalOpen(false)}
                                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            >
                                Close Diagnostics
                            </button>
                        </div>
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
