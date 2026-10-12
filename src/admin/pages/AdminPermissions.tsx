import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    IconShield,
    IconSearch,
    IconDeviceFloppy,
    IconRotate2,
    IconCheck,
    IconX,
    IconLock,
    IconLayersLinked,
    IconFilter,
    IconShieldLock,
    IconCrown
} from '@tabler/icons-react'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import SEOHead from '../../components/common/SEOHead'
import { saveRolePermissions } from '../../utils/permissions'

interface PermissionDefinition {
    key: string
    name: string
    module: string
    description: string
}

const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
    // Dashboard & Overview
    { key: 'dashboard.view', name: 'View Dashboard', module: 'Dashboard', description: 'Access main statistics, KPIs, and operational summary' },
    
    // Students Module
    { key: 'students.view', name: 'View Students', module: 'Students', description: 'Access student records, enrollment lists, and contact info' },
    { key: 'students.create', name: 'Register Student', module: 'Students', description: 'Create and provision new student accounts' },
    { key: 'students.update', name: 'Update Student', module: 'Students', description: 'Edit profile details, batch assignments, and course progress' },
    { key: 'students.delete', name: 'Delete Student', module: 'Students', description: 'Permanently remove student profiles and account records' },
    { key: 'students.export', name: 'Export Student Records', module: 'Students', description: 'Download CSV and report exports of student datasets' },

    // Faculty & Teachers
    { key: 'teachers.view', name: 'View Faculty', module: 'Faculty', description: 'Browse active faculty and staff directories' },
    { key: 'teachers.create', name: 'Add Faculty', module: 'Faculty', description: 'Provision faculty accounts and permissions' },
    { key: 'teachers.update', name: 'Edit Faculty', module: 'Faculty', description: 'Modify assigned courses, teacher ID, and schedules' },
    { key: 'teachers.delete', name: 'Remove Faculty', module: 'Faculty', description: 'Demote or decommission faculty privileges' },

    // Courses & Curriculum
    { key: 'courses.view', name: 'View Courses', module: 'Curriculum', description: 'View course catalog and public curricula' },
    { key: 'courses.create', name: 'Create Course', module: 'Curriculum', description: 'Publish new course offerings and syllabus outlines' },
    { key: 'courses.update', name: 'Edit Course', module: 'Curriculum', description: 'Modify course descriptions, fees, and thumbnails' },
    { key: 'courses.delete', name: 'Delete Course', module: 'Curriculum', description: 'Remove course tracks and archived offerings' },
    { key: 'courses.structure.manage', name: 'Manage Structure', module: 'Curriculum', description: 'Reorder chapters, modules, and topic lessons' },

    // Batches & Classes
    { key: 'classes.view', name: 'View Classes', module: 'Classes', description: 'Browse active and upcoming batch schedules' },
    { key: 'classes.create', name: 'Create Batch', module: 'Classes', description: 'Initialize new batch sections and student capacities' },
    { key: 'classes.update', name: 'Edit Batch', module: 'Classes', description: 'Update batch timing, classroom, and instructor' },
    { key: 'classes.delete', name: 'Delete Batch', module: 'Classes', description: 'Decommission batches with no active students' },
    { key: 'classes.schedule.manage', name: 'Manage Schedule', module: 'Classes', description: 'Modify timetable slots and routine calendars' },

    // Admissions & Enrollment Applications
    { key: 'admissions.view', name: 'View Applications', module: 'Admissions', description: 'Inspect prospective student inquiry submissions' },
    { key: 'admissions.approve', name: 'Approve Application', module: 'Admissions', description: 'Authorize applicant verification and fee structure' },
    { key: 'admissions.reject', name: 'Reject Application', module: 'Admissions', description: 'Decline ineligible applicant submissions' },
    { key: 'admissions.enroll', name: 'Direct Enrollment', module: 'Admissions', description: 'Finalize official registration into courses' },

    // Finance & Fee Management
    // Finance & Fee Management
    { key: 'finance.view', name: 'View Financials', module: 'Finance', description: 'Access institution ledger, collections, and dues' },
    { key: 'finance.create', name: 'Record Transaction', module: 'Finance', description: 'Log fee installments, receipts, and vouchers' },
    { key: 'finance.update', name: 'Modify Ledger', module: 'Finance', description: 'Adjust fee waivers, discounts, and corrections' },
    { key: 'finance.delete', name: 'Void Transaction', module: 'Finance', description: 'Delete inaccurate ledger postings' },
    { key: 'finance.export', name: 'Export Balance Sheet', module: 'Finance', description: 'Export accounting ledger sheets and audit exports' },

    // Institutional Payroll & Staff Compensation
    { key: 'payroll.view', name: 'View Payroll & Payslips', module: 'Finance', description: 'Access institutional salary registers, payment disbursement records, and staff payslips' },
    { key: 'payroll.manage', name: 'Manage Payroll & Vouchers', module: 'Finance', description: 'Generate monthly payroll, approve salary calculations, and issue vouchers' },

    // Scholarships CMS
    { key: 'scholarships.view', name: 'View Scholarships', module: 'Scholarships', description: 'Inspect scholarship settings, rules, and winners' },
    { key: 'scholarships.manage', name: 'Manage Scholarships', module: 'Scholarships', description: 'Publish scholarship banners, results, and photos' },

    // Gallery & Assets
    { key: 'gallery.view', name: 'View Gallery', module: 'Gallery', description: 'Browse institutional photo repository' },
    { key: 'gallery.manage', name: 'Manage Gallery', module: 'Gallery', description: 'Upload albums, tag students, and set layout styles' },
    { key: 'gallery.media.manage', name: 'Manage Media Registry', module: 'Gallery', description: 'Update site-wide master graphic banners' },
    { key: 'home.media.manage', name: 'Manage Home Page Media', module: 'Gallery', description: 'Update, crop, and configure home page section images' },

    // Assessments & Tests
    { key: 'tests.view', name: 'View Tests', module: 'Assessments', description: 'Browse online examination sets' },
    { key: 'tests.create', name: 'Create Test', module: 'Assessments', description: 'Draft questions, timing, and question sets' },
    { key: 'tests.update', name: 'Edit Test', module: 'Assessments', description: 'Modify test keys and difficulty levels' },
    { key: 'tests.delete', name: 'Delete Test', module: 'Assessments', description: 'Remove outdated assessments' },
    { key: 'tests.publish', name: 'Publish Test', module: 'Assessments', description: 'Make assessments available to enrolled students' },
    { key: 'tests.results.view', name: 'View Results', module: 'Assessments', description: 'Review student test scores and accuracy breakdowns' },

    // System Administration & Security
    { key: 'external_sites.view', name: 'View Ecosystem', module: 'System', description: 'Access registered companion websites and simulators' },
    { key: 'external_sites.manage', name: 'Manage Ecosystem', module: 'System', description: 'Add and configure links to companion platforms' },
    { key: 'audit_logs.view', name: 'View Audit Logs', module: 'System', description: 'Audit security logs, logins, and administrative changes' },
    { key: 'permissions.manage', name: 'Manage Permissions', module: 'System', description: 'Authorize role access control matrices' }
]

type RoleName = 'super_admin' | 'admin' | 'teacher' | 'receptionist' | 'lab_assistant' | 'maintenance' | 'student'

const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
    super_admin: PERMISSION_DEFINITIONS.map(p => p.key),
    admin: [
        'dashboard.view',
        'students.view', 'students.create', 'students.update', 'students.export',
        'teachers.view', 'teachers.create', 'teachers.update',
        'courses.view', 'courses.create', 'courses.update', 'courses.structure.manage',
        'classes.view', 'classes.create', 'classes.update', 'classes.schedule.manage',
        'admissions.view', 'admissions.approve', 'admissions.reject', 'admissions.enroll',
        'finance.view', 'finance.create', 'finance.export',
        'payroll.view', 'payroll.manage',
        'scholarships.view', 'scholarships.manage',
        'gallery.view', 'gallery.manage',
        'home.media.manage',
        'tests.view', 'tests.create', 'tests.update', 'tests.publish', 'tests.results.view',
        'external_sites.view', 'external_sites.manage',
        'audit_logs.view'
    ],
    teacher: [
        'dashboard.view',
        'classes.view', 'classes.schedule.manage',
        'courses.view',
        'students.view',
        'tests.view', 'tests.create', 'tests.update', 'tests.results.view',
        'payroll.view'
    ],
    receptionist: [
        'dashboard.view',
        'students.view',
        'courses.view',
        'classes.view',
        'admissions.view', 'admissions.enroll',
        'payroll.view'
    ],
    lab_assistant: [
        'dashboard.view',
        'classes.view',
        'courses.view',
        'payroll.view'
    ],
    maintenance: [
        'dashboard.view',
        'classes.view',
        'payroll.view'
    ],
    student: [
        'dashboard.view',
        'courses.view',
        'classes.view',
        'tests.view'
    ]
}

export default function AdminPermissions() {
    const { profile, isSuperAdmin } = useAuth()
    const { showToast } = useToast()

    const [rolePermissions, setRolePermissions] = useState<Record<RoleName, string[]>>(() => {
        const saved = localStorage.getItem('icst_role_permissions')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch (e) {
                console.warn('Failed to parse cached permissions:', e)
            }
        }
        return DEFAULT_ROLE_PERMISSIONS
    })


    const [activeRole, setActiveRole] = useState<RoleName>('admin')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedModule, setSelectedModule] = useState<string>('all')
    const [isSaving, setIsSaving] = useState(false)

    // Modules list
    const modules = useMemo(() => {
        const set = new Set(PERMISSION_DEFINITIONS.map(p => p.module))
        return ['all', ...Array.from(set)]
    }, [])

    // Filtered permissions
    const filteredPermissions = useMemo(() => {
        return PERMISSION_DEFINITIONS.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesModule = selectedModule === 'all' || p.module === selectedModule
            return matchesSearch && matchesModule
        })
    }, [searchTerm, selectedModule])

    // Check if permission is granted for active role
    const hasPerm = (permKey: string) => {
        return rolePermissions[activeRole]?.includes(permKey) || false
    }

    // Toggle individual permission
    const handleToggle = (permKey: string) => {
        if (activeRole === 'super_admin') {
            showToast('Super Admin role must retain all system permissions.', 'warning')
            return
        }

        setRolePermissions(prev => {
            const current = prev[activeRole] || []
            const exists = current.includes(permKey)
            const updated = exists ? current.filter(k => k !== permKey) : [...current, permKey]
            return {
                ...prev,
                [activeRole]: updated
            }
        })
    }

    // Bulk module toggle
    const handleModuleToggle = (moduleName: string, enableAll: boolean) => {
        if (activeRole === 'super_admin') return

        const modulePermKeys = PERMISSION_DEFINITIONS
            .filter(p => p.module === moduleName)
            .map(p => p.key)

        setRolePermissions(prev => {
            const current = prev[activeRole] || []
            let updated: string[]
            if (enableAll) {
                updated = Array.from(new Set([...current, ...modulePermKeys]))
            } else {
                updated = current.filter(k => !modulePermKeys.includes(k))
            }
            return { ...prev, [activeRole]: updated }
        })

        showToast(`${enableAll ? 'Granted' : 'Revoked'} all ${moduleName} permissions for ${activeRole}.`, 'info')
    }

    // Save changes
    const handleSave = () => {
        setIsSaving(true)
        try {
            saveRolePermissions(rolePermissions)
            showToast(`Role permissions for ${activeRole.toUpperCase()} saved successfully!`, 'success')
        } catch (err: any) {
            showToast('Failed to save permissions: ' + err.message, 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Reset to defaults
    const handleReset = () => {
        setRolePermissions(DEFAULT_ROLE_PERMISSIONS)
        saveRolePermissions(DEFAULT_ROLE_PERMISSIONS)
        showToast('Reset all role permissions to factory defaults.', 'info')
    }


    if (!isSuperAdmin) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <SEOHead
                    title="Permissions Matrix Restricted - ICST Connect"
                    canonical="/admin/permissions"
                    noindex={true}
                />
                <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                        <IconShieldLock size={36} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Super Administrator Only
                        </span>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            Permissions Matrix Gate
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Access Restricted: Role-Based Access Control (RBAC) governance and capability matrices are strictly reserved for the <strong>Super Administrator (Owner & Lead Dev)</strong>.
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
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            <SEOHead
                title="Permissions Matrix - Super Admin Gateway"
                canonical="/admin/permissions"
                noindex={true}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                            <IconCrown size={13} />
                            Super Admin Exclusive Control
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-xl">
                            <IconShield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Permissions Matrix</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Centralized Role-Based Access Control (RBAC) & Capability Governance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
                        title="Revert to factory default permissions"
                    >
                        <IconRotate2 size={18} />
                        <span>Reset Defaults</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={18} />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {(['super_admin', 'admin', 'teacher', 'receptionist', 'lab_assistant', 'maintenance', 'student'] as RoleName[]).map((role) => {
                    const isActive = activeRole === role
                    const count = rolePermissions[role]?.length || 0
                    return (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role)}
                            className={`p-3 rounded-xl border text-left transition-all ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                    {role === 'super_admin' ? 'Root' : 'Role'}
                                </span>
                                {role === 'super_admin' && <IconLock size={14} />}
                            </div>
                            <div className="text-sm font-bold capitalize truncate">
                                {role.replace('_', ' ')}
                            </div>
                            <div className={`text-[11px] mt-1 ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                {count} perms
                            </div>
                        </button>
                    )
                })}
            </div>


            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search capabilities by name, key, or scope..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <IconFilter size={18} className="text-slate-400 shrink-0" />
                    <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod} className="dark:bg-slate-800">
                                {mod === 'all' ? 'All Modules' : mod}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Permissions Matrix Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Module groups */}
                    {modules.filter(m => m !== 'all').map(mod => {
                        const permsInModule = filteredPermissions.filter(p => p.module === mod)
                        if (permsInModule.length === 0) return null

                        const allGranted = permsInModule.every(p => hasPerm(p.key))
                        const someGranted = permsInModule.some(p => hasPerm(p.key))

                        return (
                            <div key={mod} className="p-6">
                                {/* Module Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <IconLayersLinked size={20} className="text-indigo-600 dark:text-indigo-400" />
                                        <h3 className="font-bold text-slate-800 dark:text-white text-base">{mod} Module</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {permsInModule.length} privileges
                                        </span>
                                    </div>

                                    {activeRole !== 'super_admin' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleModuleToggle(mod, true)}
                                                disabled={allGranted}
                                                className="text-xs px-2.5 py-1 rounded-md font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 disabled:opacity-40 transition-colors"
                                            >
                                                Grant All
                                            </button>
                                            <button
                                                onClick={() => handleModuleToggle(mod, false)}
                                                disabled={!someGranted}
                                                className="text-xs px-2.5 py-1 rounded-md font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 disabled:opacity-40 transition-colors"
                                            >
                                                Revoke All
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Permissions Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permsInModule.map(perm => {
                                        const granted = hasPerm(perm.key)
                                        const isLocked = activeRole === 'super_admin'

                                        return (
                                            <div
                                                key={perm.key}
                                                onClick={() => !isLocked && handleToggle(perm.key)}
                                                className={`p-4 rounded-xl border transition-all ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                                                    } ${granted
                                                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                                                            {perm.name}
                                                        </p>
                                                        <p className="font-mono text-xs text-slate-400 truncate mt-0.5">
                                                            {perm.key}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                                            {perm.description}
                                                        </p>
                                                    </div>

                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${granted
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                                        }`}>
                                                        {granted ? <IconCheck size={16} /> : <IconX size={16} />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    {filteredPermissions.length === 0 && (
                        <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                            No permissions match your search query.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
