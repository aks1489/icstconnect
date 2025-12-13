
export interface NavItem {
    label: string
    path: string
    icon: string
    color: string
    description?: string
    external?: boolean
}

export const STUDENT_ACTIONS: NavItem[] = [
    {
        label: 'My Dashboard',
        path: '/student/dashboard',
        icon: 'bi-grid-fill',
        color: 'text-indigo-600',
        description: 'View your progress and enrolled courses'
    },
    {
        label: 'My Calendar',
        path: '/student/calendar',
        icon: 'bi-calendar-event-fill',
        color: 'text-emerald-600',
        description: 'Check upcoming classes and events'
    },
    {
        label: 'Offline Classes',
        path: '/student/offline-classes',
        icon: 'bi-building-fill',
        color: 'text-amber-600',
        description: 'Schedule and details for physical classes'
    },
    {
        label: 'Online Tests',
        path: '/online-test',
        icon: 'bi-laptop',
        color: 'text-blue-600',
        description: 'Take practice exams and view results'
    }
]

export const TEACHER_ACTIONS: NavItem[] = [
    {
        label: 'Teacher Dashboard',
        path: '/teacher/dashboard',
        icon: 'bi-speedometer2',
        color: 'text-violet-600',
        description: 'Overview of your classes and students'
    },
    {
        label: 'Schedule Class',
        path: '/teacher/calendar',
        icon: 'bi-calendar-plus-fill',
        color: 'text-pink-600',
        description: 'Manage your teaching schedule'
    },
    {
        label: 'Active Classes',
        path: '/teacher/active-classes',
        icon: 'bi-broadcast',
        color: 'text-red-600',
        description: 'Manage currently running sessions'
    },
    {
        label: 'Create Test',
        path: '/teacher/exams',
        icon: 'bi-file-earmark-text-fill',
        color: 'text-cyan-600',
        description: 'Design new assessments for students'
    }
]

export const ADMIN_ACTIONS: NavItem[] = [
    {
        label: 'Admin Dashboard',
        path: '/admin/dashboard',
        icon: 'bi-shield-lock-fill',
        color: 'text-slate-800',
        description: 'System overview and controls'
    },
    {
        label: 'Manage Students',
        path: '/admin/students',
        icon: 'bi-people-fill',
        color: 'text-indigo-600',
        description: 'View and manage student records'
    },
    {
        label: 'Manage Teachers',
        path: '/admin/teachers',
        icon: 'bi-person-badge-fill',
        color: 'text-emerald-600',
        description: 'View and manage teacher staff'
    },
    {
        label: 'Manage Courses',
        path: '/admin/courses',
        icon: 'bi-collection-fill',
        color: 'text-orange-600',
        description: 'Create and edit course content'
    },
    {
        label: 'Manage Classes',
        path: '/admin/classes',
        icon: 'bi-grid-3x3-gap-fill',
        color: 'text-indigo-600',
        description: 'View and manage all batches'
    },
    {
        label: 'Calendar',
        path: '/admin/calendar',
        icon: 'bi-calendar-week-fill',
        color: 'text-purple-600',
        description: 'Manage schedules and events'
    }
]
