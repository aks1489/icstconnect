import { IconLayoutDashboard as LayoutDashboard, IconCalendar as Calendar, IconBuildingCommunity as Building2, IconDeviceLaptop as Laptop, IconCalendarPlus as CalendarPlus, IconPresentation as Presentation, IconFileText as FileText, IconShield as Shield, IconUsers as Users, IconUserCog as UserCog, IconBooks as Library, IconLayoutGrid as LayoutGrid, IconCalendarEvent as CalendarDays, IconPhoto as Image, IconSchool as GraduationCap, IconKey as KeyRound, IconHistory as History, IconWorld as Globe, IconReceipt as Receipt, IconShieldLock as ShieldLock } from '@tabler/icons-react'

export interface NavItem {
    label: string
    path: string
    icon: any
    color: string
    description?: string
    external?: boolean
    superAdminOnly?: boolean
    requiredPermission?: string
}

export const STUDENT_ACTIONS: NavItem[] = [
    {
        label: 'My Dashboard',
        path: '/student/dashboard',
        icon: LayoutDashboard,
        color: 'text-indigo-600',
        description: 'View your progress and enrolled courses'
    },
    {
        label: 'My Calendar',
        path: '/student/calendar',
        icon: Calendar,
        color: 'text-emerald-600',
        description: 'Check upcoming classes and events'
    },
    {
        label: 'Offline Classes',
        path: '/student/offline-classes',
        icon: Building2,
        color: 'text-amber-600',
        description: 'Schedule and details for physical classes'
    },
    {
        label: 'Online Tests',
        path: '/student/tests',
        icon: Laptop,
        color: 'text-blue-600',
        description: 'Take practice exams and view results'
    },
    {
        label: 'My Fees',
        path: '/student/fees',
        icon: Building2,
        color: 'text-emerald-600',
        description: 'View fee status and payments'
    }
]

export const TEACHER_ACTIONS: NavItem[] = [
    {
        label: 'Teacher Dashboard',
        path: '/teacher/dashboard',
        icon: LayoutDashboard,
        color: 'text-violet-600',
        description: 'Overview of your classes and students',
        requiredPermission: 'dashboard.view'
    },
    {
        label: 'Schedule Class',
        path: '/teacher/calendar',
        icon: CalendarPlus,
        color: 'text-pink-600',
        description: 'Manage your teaching schedule',
        requiredPermission: 'classes.schedule.manage'
    },
    {
        label: 'Active Classes',
        path: '/teacher/active-classes',
        icon: Presentation,
        color: 'text-red-600',
        description: 'Manage currently running sessions',
        requiredPermission: 'classes.view'
    },
    {
        label: 'Create Test',
        path: '/teacher/exams',
        icon: FileText,
        color: 'text-cyan-600',
        description: 'Design new assessments for students',
        requiredPermission: 'tests.view'
    },
    {
        label: 'My Payslips & Salary',
        path: '/teacher/payslips',
        icon: Receipt,
        color: 'text-emerald-600',
        description: 'View and download monthly payslips',
        requiredPermission: 'payroll.view'
    }
]

export const ADMIN_ACTIONS: NavItem[] = [
    {
        label: 'Admin Dashboard',
        path: '/admin/dashboard',
        icon: Shield,
        color: 'text-slate-800',


        description: 'System overview and controls',
        requiredPermission: 'dashboard.view'
    },
    {
        label: 'Manage Students',
        path: '/admin/students',
        icon: Users,
        color: 'text-indigo-600',
        description: 'View and manage student records',
        requiredPermission: 'students.view'
    },
    {
        label: 'Manage Teachers',
        path: '/admin/teachers',
        icon: UserCog,
        color: 'text-emerald-600',
        description: 'View and manage teacher staff',
        requiredPermission: 'teachers.view'
    },
    {
        label: 'Manage Courses',
        path: '/admin/courses',
        icon: Library,
        color: 'text-orange-600',
        description: 'Create and edit course content',
        requiredPermission: 'courses.view'
    },
    {
        label: 'Manage Classes',
        path: '/admin/classes',
        icon: LayoutGrid,
        color: 'text-indigo-600',
        description: 'View and manage all batches',
        requiredPermission: 'classes.view'
    },
    {
        label: 'Calendar',
        path: '/admin/calendar',
        icon: CalendarDays,
        color: 'text-purple-600',
        description: 'Manage schedules and events',
        requiredPermission: 'classes.schedule.manage'
    },
    {
        label: 'Tests',
        path: '/admin/tests',
        icon: FileText,
        color: 'text-cyan-600',
        description: 'Manage assessments',
        requiredPermission: 'tests.view'
    },
    {
        label: 'Financials',
        path: '/admin/finance',
        icon: Building2,
        color: 'text-emerald-600',
        description: 'Balance sheet and transactions',
        requiredPermission: 'finance.view'
    },
    {
        label: 'Enrollment Apps',
        path: '/admin/enrollments',
        icon: FileText,
        color: 'text-indigo-600',
        description: 'Review and approve student enrollments',
        requiredPermission: 'admissions.view'
    },
    {
        label: 'ICST Scholarships',
        path: '/admin/scholarships',
        icon: GraduationCap,
        color: 'text-amber-500',
        description: 'Manage scholarship banners, settings, and winners',
        requiredPermission: 'scholarships.view'
    },
    {
        label: 'Gallery Management',
        path: '/admin/gallery',
        icon: Image,
        color: 'text-pink-600',
        description: 'Manage images and layout styles',
        requiredPermission: 'gallery.view'
    },
    {
        label: 'Home Page Images',
        path: '/admin/home-media',
        icon: Image,
        color: 'text-purple-600',
        description: 'Update, crop, and configure homepage section images',
        requiredPermission: 'home.media.manage'
    },
    {
        label: 'Permissions Matrix',
        path: '/admin/permissions',
        icon: KeyRound,
        color: 'text-indigo-600',
        description: 'Manage role capabilities and RBAC governance (Super Admin)',
        superAdminOnly: true,
        requiredPermission: 'permissions.manage'
    },
    {
        label: 'Security & Audit Logs',
        path: '/admin/audit-logs',
        icon: History,
        color: 'text-amber-600',
        description: 'Inspect chronological administrative actions',
        requiredPermission: 'audit_logs.view'
    },
    {
        label: 'Companion Ecosystem',
        path: '/admin/ecosystem',
        icon: Globe,
        color: 'text-cyan-600',
        description: 'Manage registered companion websites and simulators',
        requiredPermission: 'external_sites.view'
    },
    {
        label: 'Management Accounts',
        path: '/admin/management-accounts',
        icon: ShieldLock,
        color: 'text-purple-600',
        description: 'Provision & manage staff & admin accounts (Super Admin)',
        superAdminOnly: true,
        requiredPermission: 'admins.manage'
    }
]

