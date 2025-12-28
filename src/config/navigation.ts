import {
    LayoutDashboard,
    Calendar,
    Building2,
    Laptop,
    CalendarPlus,
    Presentation,
    FileText,
    Shield,
    Users,
    UserCog,
    Library,
    LayoutGrid,
    CalendarDays,
    Tag
} from 'lucide-react'

export interface NavItem {
    label: string
    path: string
    icon: any
    color: string
    description?: string
    external?: boolean
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
        path: '/online-test',
        icon: Laptop,
        color: 'text-blue-600',
        description: 'Take practice exams and view results'
    }
]

export const TEACHER_ACTIONS: NavItem[] = [
    {
        label: 'Teacher Dashboard',
        path: '/teacher/dashboard',
        icon: LayoutDashboard,
        color: 'text-violet-600',
        description: 'Overview of your classes and students'
    },
    {
        label: 'Schedule Class',
        path: '/teacher/calendar',
        icon: CalendarPlus,
        color: 'text-pink-600',
        description: 'Manage your teaching schedule'
    },
    {
        label: 'Active Classes',
        path: '/teacher/active-classes',
        icon: Presentation,
        color: 'text-red-600',
        description: 'Manage currently running sessions'
    },
    {
        label: 'Create Test',
        path: '/teacher/exams',
        icon: FileText,
        color: 'text-cyan-600',
        description: 'Design new assessments for students'
    }
]

export const ADMIN_ACTIONS: NavItem[] = [
    {
        label: 'Admin Dashboard',
        path: '/admin/dashboard',
        icon: Shield,
        color: 'text-slate-800',
        description: 'System overview and controls'
    },
    {
        label: 'Manage Students',
        path: '/admin/students',
        icon: Users,
        color: 'text-indigo-600',
        description: 'View and manage student records'
    },
    {
        label: 'Manage Teachers',
        path: '/admin/teachers',
        icon: UserCog,
        color: 'text-emerald-600',
        description: 'View and manage teacher staff'
    },
    {
        label: 'Manage Courses',
        path: '/admin/courses',
        icon: Library,
        color: 'text-orange-600',
        description: 'Create and edit course content'
    },
    {
        label: 'Manage Classes',
        path: '/admin/classes',
        icon: LayoutGrid,
        color: 'text-indigo-600',
        description: 'View and manage all batches'
    },
    {
        label: 'Calendar',
        path: '/admin/calendar',
        icon: CalendarDays,
        color: 'text-purple-600',
        description: 'Manage schedules and events'
    },
    {
        label: 'Tests',
        path: '/admin/tests',
        icon: FileText,
        color: 'text-cyan-600',
        description: 'Manage assessments'
    },
    {
        label: 'Discount Claims',
        path: '/admin/discount-claims',
        icon: Tag,
        color: 'text-pink-600',
        description: 'View student discount inquiries'
    }
]
