import { useState, useMemo } from 'react'
import {
    IconShield,
    IconSearch,
    IconDeviceFloppy,
    IconRotate2,
    IconCheck,
    IconX,
    IconLock,
    IconLayersLinked,
    IconFilter
} from '@tabler/icons-react'
import { useToast } from '../../contexts/ToastContext'

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
    { key: 'finance.view', name: 'View Financials', module: 'Finance', description: 'Access institution ledger, collections, and dues' },
    { key: 'finance.create', name: 'Record Transaction', module: 'Finance', description: 'Log fee installments, receipts, and vouchers' },
    { key: 'finance.update', name: 'Modify Ledger', module: 'Finance', description: 'Adjust fee waivers, discounts, and corrections' },
    { key: 'finance.delete', name: 'Void Transaction', module: 'Finance', description: 'Delete inaccurate ledger postings' },
    { key: 'finance.export', name: 'Export Balance Sheet', module: 'Finance', description: 'Export accounting ledger sheets and audit exports' },

    // Scholarships CMS
    { key: 'scholarships.view', name: 'View Scholarships', module: 'Scholarships', description: 'Inspect scholarship settings, rules, and winners' },
    { key: 'scholarships.manage', name: 'Manage Scholarships', module: 'Scholarships', description: 'Publish scholarship banners, results, and photos' },

    // Gallery & Assets
    { key: 'gallery.view', name: 'View Gallery', module: 'Gallery', description: 'Browse institutional photo repository' },
    { key: 'gallery.manage', name: 'Manage Gallery', module: 'Gallery', description: 'Upload albums, tag students, and set layout styles' },
    { key: 'gallery.media.manage', name: 'Manage Media Registry', module: 'Gallery', description: 'Update site-wide master graphic banners' },

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

type RoleName = 'super_admin' | 'admin' | 'teacher' | 'student'

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
        'scholarships.view', 'scholarships.manage',
        'gallery.view', 'gallery.manage',
        'tests.view', 'tests.create', 'tests.update', 'tests.publish', 'tests.results.view',
        'external_sites.view', 'external_sites.manage',
        'audit_logs.view'
    ],
    teacher: [
        'dashboard.view',
        'classes.view', 'classes.schedule.manage',
        'courses.view',
        'students.view',
        'tests.view', 'tests.create', 'tests.update', 'tests.results.view'
    ],
    student: [
        'courses.view',
        'classes.view',
        'tests.view'
    ]
}

export default function AdminPermissions() {
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
            localStorage.setItem('icst_role_permissions', JSON.stringify(rolePermissions))
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
        localStorage.removeItem('icst_role_permissions')
        showToast('Reset all role permissions to factory defaults.', 'info')
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                            <IconShield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Permissions Matrix</h1>
                            <p className="text-slate-500 text-sm">
                                Centralized Role-Based Access Control (RBAC) & Capability Governance
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['super_admin', 'admin', 'teacher', 'student'] as RoleName[]).map((role) => {
                    const isActive = activeRole === role
                    const count = rolePermissions[role]?.length || 0
                    return (
                        <button
                            key={role}
                            onClick={() => setActiveRole(role)}
                            className={`p-4 rounded-xl border text-left transition-all ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                                    {role === 'super_admin' ? 'Root Authority' : 'Institutional Role'}
                                </span>
                                {role === 'super_admin' && <IconLock size={16} />}
                            </div>
                            <div className="text-lg font-bold capitalize">
                                {role.replace('_', ' ')}
                            </div>
                            <div className={`text-xs mt-1 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                                {count} permissions active
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search capabilities by name, key, or scope..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <IconFilter size={18} className="text-slate-400 shrink-0" />
                    <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod}>
                                {mod === 'all' ? 'All Modules' : mod}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Permissions Matrix Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {/* Module groups */}
                    {modules.filter(m => m !== 'all').map(mod => {
                        const permsInModule = filteredPermissions.filter(p => p.module === mod)
                        if (permsInModule.length === 0) return null

                        const allGranted = permsInModule.every(p => hasPerm(p.key))
                        const someGranted = permsInModule.some(p => hasPerm(p.key))

                        return (
                            <div key={mod} className="p-6">
                                {/* Module Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <IconLayersLinked size={20} className="text-indigo-600" />
                                        <h3 className="font-bold text-slate-800 text-base">{mod} Module</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            {permsInModule.length} privileges
                                        </span>
                                    </div>

                                    {activeRole !== 'super_admin' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleModuleToggle(mod, true)}
                                                disabled={allGranted}
                                                className="text-xs px-2.5 py-1 rounded-md font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                                            >
                                                Grant All
                                            </button>
                                            <button
                                                onClick={() => handleModuleToggle(mod, false)}
                                                disabled={!someGranted}
                                                className="text-xs px-2.5 py-1 rounded-md font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40 transition-colors"
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
                                                        ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-slate-800 truncate">
                                                            {perm.name}
                                                        </p>
                                                        <p className="font-mono text-xs text-slate-400 truncate mt-0.5">
                                                            {perm.key}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                                            {perm.description}
                                                        </p>
                                                    </div>

                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${granted
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-300'
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
                        <div className="p-12 text-center text-slate-400">
                            No permissions match your search query.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
