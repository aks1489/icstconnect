/**
 * ICST Connect — Granular Permission System Definitions
 * In accordance with Master Engineering Instructions Section 12 & 13
 */

export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin'

export type AppPermission =
    // Students
    | 'students:read'
    | 'students:write'
    | 'students:delete'
    // Teachers
    | 'teachers:read'
    | 'teachers:write'
    | 'teachers:delete'
    // Courses & Curriculum
    | 'courses:read'
    | 'courses:write'
    | 'courses:delete'
    // Classes & Timetable
    | 'classes:read'
    | 'classes:write'
    | 'classes:delete'
    // Financial Balance Sheet & Fees
    | 'finance:read'
    | 'finance:write'
    | 'finance:delete'
    // Admissions & Applications
    | 'admissions:read'
    | 'admissions:write'
    // Scholarships CMS
    | 'scholarships:read'
    | 'scholarships:write'
    // Gallery & Media
    | 'gallery:read'
    | 'gallery:write'
    // Online Tests
    | 'tests:read'
    | 'tests:write'
    | 'tests:delete'
    // Audit Logs
    | 'audit:read'
    // External Ecosystem & Site Registry
    | 'ecosystem:read'
    | 'ecosystem:write'
    // System Settings & Super Admin Control
    | 'settings:read'
    | 'settings:write'
    | 'admins:manage'

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, AppPermission[]> = {
    super_admin: [
        'students:read', 'students:write', 'students:delete',
        'teachers:read', 'teachers:write', 'teachers:delete',
        'courses:read', 'courses:write', 'courses:delete',
        'classes:read', 'classes:write', 'classes:delete',
        'finance:read', 'finance:write', 'finance:delete',
        'admissions:read', 'admissions:write',
        'scholarships:read', 'scholarships:write',
        'gallery:read', 'gallery:write',
        'tests:read', 'tests:write', 'tests:delete',
        'audit:read',
        'ecosystem:read', 'ecosystem:write',
        'settings:read', 'settings:write',
        'admins:manage'
    ],
    admin: [
        'students:read', 'students:write',
        'teachers:read', 'teachers:write',
        'courses:read', 'courses:write',
        'classes:read', 'classes:write',
        'finance:read', 'finance:write',
        'admissions:read', 'admissions:write',
        'scholarships:read', 'scholarships:write',
        'gallery:read', 'gallery:write',
        'tests:read', 'tests:write',
        'ecosystem:read'
    ],
    teacher: [
        'classes:read',
        'courses:read',
        'students:read',
        'tests:read', 'tests:write'
    ],
    student: [
        'courses:read',
        'classes:read',
        'tests:read'
    ]
}

export interface AdminPermissionOverride {
    userId: string
    grantedPermissions: AppPermission[]
    revokedPermissions: AppPermission[]
}
