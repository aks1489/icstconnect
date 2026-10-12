/**
 * ICST Connect — Granular Permission System Definitions
 * In accordance with Master Engineering Instructions Section 12 & 13
 */

export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin' | 'receptionist' | 'lab_assistant' | 'maintenance'

export type AppPermission =
    // Students
    | 'students.view' | 'students.create' | 'students.update' | 'students.delete' | 'students.export'
    | 'students:read' | 'students:write' | 'students:delete'
    // Teachers / Faculty
    | 'teachers.view' | 'teachers.create' | 'teachers.update' | 'teachers.delete'
    | 'teachers:read' | 'teachers:write' | 'teachers:delete'
    // Courses & Curriculum
    | 'courses.view' | 'courses.create' | 'courses.update' | 'courses.delete' | 'courses.structure.manage'
    | 'courses:read' | 'courses:write' | 'courses:delete'
    // Classes & Timetable
    | 'classes.view' | 'classes.create' | 'classes.update' | 'classes.delete' | 'classes.schedule.manage'
    | 'classes:read' | 'classes:write' | 'classes:delete'
    // Financial Balance Sheet & Fees
    | 'finance.view' | 'finance.create' | 'finance.update' | 'finance.delete' | 'finance.export'
    | 'finance:read' | 'finance:write' | 'finance:delete'
    // Institutional Payroll
    | 'payroll.view' | 'payroll.manage'
    // Admissions & Applications
    | 'admissions.view' | 'admissions.approve' | 'admissions.reject' | 'admissions.enroll'
    | 'admissions:read' | 'admissions:write'
    // Scholarships CMS
    | 'scholarships.view' | 'scholarships.manage'
    | 'scholarships:read' | 'scholarships:write'
    // Gallery & Media
    | 'gallery.view' | 'gallery.manage' | 'gallery.media.manage' | 'home.media.manage'
    | 'gallery:read' | 'gallery:write'
    // Online Tests & Assessments
    | 'tests.view' | 'tests.create' | 'tests.update' | 'tests.delete' | 'tests.publish' | 'tests.results.view'
    | 'tests:read' | 'tests:write' | 'tests:delete'
    // Audit Logs
    | 'audit_logs.view'
    | 'audit:read'
    // External Ecosystem & Site Registry
    | 'external_sites.view' | 'external_sites.manage'
    | 'ecosystem:read' | 'ecosystem:write'
    // System Settings & Super Admin Control
    | 'dashboard.view'
    | 'permissions.manage'
    | 'settings:read' | 'settings:write'
    | 'admins:manage'
    | (string & {})

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
    super_admin: [
        'dashboard.view',
        'students.view', 'students.create', 'students.update', 'students.delete', 'students.export',
        'teachers.view', 'teachers.create', 'teachers.update', 'teachers.delete',
        'courses.view', 'courses.create', 'courses.update', 'courses.delete', 'courses.structure.manage',
        'classes.view', 'classes.create', 'classes.update', 'classes.delete', 'classes.schedule.manage',
        'admissions.view', 'admissions.approve', 'admissions.reject', 'admissions.enroll',
        'finance.view', 'finance.create', 'finance.update', 'finance.delete', 'finance.export',
        'payroll.view', 'payroll.manage',
        'scholarships.view', 'scholarships.manage',
        'gallery.view', 'gallery.manage', 'gallery.media.manage', 'home.media.manage',
        'tests.view', 'tests.create', 'tests.update', 'tests.delete', 'tests.publish', 'tests.results.view',
        'external_sites.view', 'external_sites.manage',
        'audit_logs.view',
        'permissions.manage',
        'admins:manage'
    ],
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

export interface AdminPermissionOverride {
    userId: string
    grantedPermissions: string[]
    revokedPermissions: string[]
}

