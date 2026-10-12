import { ROLE_DEFAULT_PERMISSIONS } from '../types/permissions'
import type { AppPermission, UserRole } from '../types/permissions'

export interface UserPermissionProfile {
    id: string
    role: UserRole | string
    permissions?: string[]
    custom_permissions?: string[]
}

/**
 * Normalizes legacy colon-style permissions to dot-style matrix capability keys.
 */
export const normalizePermissionKey = (key: string): string => {
    const ALIAS_MAP: Record<string, string> = {
        'students:read': 'students.view',
        'students:write': 'students.update',
        'students:delete': 'students.delete',
        'teachers:read': 'teachers.view',
        'teachers:write': 'teachers.update',
        'teachers:delete': 'teachers.delete',
        'courses:read': 'courses.view',
        'courses:write': 'courses.update',
        'courses:delete': 'courses.delete',
        'classes:read': 'classes.view',
        'classes:write': 'classes.update',
        'classes:delete': 'classes.delete',
        'finance:read': 'finance.view',
        'finance:write': 'finance.create',
        'finance:delete': 'finance.delete',
        'admissions:read': 'admissions.view',
        'admissions:write': 'admissions.approve',
        'scholarships:read': 'scholarships.view',
        'scholarships:write': 'scholarships.manage',
        'gallery:read': 'gallery.view',
        'gallery:write': 'gallery.manage',
        'tests:read': 'tests.view',
        'tests:write': 'tests.create',
        'tests:delete': 'tests.delete',
        'audit:read': 'audit_logs.view',
        'ecosystem:read': 'external_sites.view',
        'ecosystem:write': 'external_sites.manage',
        'settings:read': 'dashboard.view',
        'settings:write': 'permissions.manage',
        'admins:manage': 'admins.manage'
    }
    return ALIAS_MAP[key] || key
}

/**
 * Loads the active role capability matrix configured by Super Admin from storage,
 * with graceful fallback to default role permissions.
 */
export const getActiveRolePermissions = (): Record<string, string[]> => {
    try {
        const saved = localStorage.getItem('icst_role_permissions')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed && typeof parsed === 'object') {
                return { ...ROLE_DEFAULT_PERMISSIONS, ...parsed }
            }
        }
    } catch (err) {
        console.warn('Failed to parse dynamic role permissions:', err)
    }
    return ROLE_DEFAULT_PERMISSIONS
}

/**
 * Saves updated role capabilities and notifies active components via DOM event.
 */
export const saveRolePermissions = (matrix: Record<string, string[]>): void => {
    try {
        localStorage.setItem('icst_role_permissions', JSON.stringify(matrix))
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('icst_permissions_updated', { detail: matrix }))
        }
    } catch (err) {
        console.error('Failed to save role permissions matrix:', err)
        throw err
    }
}

/**
 * Evaluates whether a given user profile has a specific capability.
 * - Super Admin always retains unrestricted root access.
 * - Profile custom_permissions override role defaults.
 * - Checks live capabilities matrix set by Super Admin.
 */
export const hasPermission = (
    profile: UserPermissionProfile | null | undefined,
    permission: AppPermission | string
): boolean => {
    if (!profile) return false

    // Super Admin has unrestricted access to everything across the entire app
    if (profile.role === 'super_admin') return true

    const normalized = normalizePermissionKey(permission)

    // Check individual user custom permissions / overrides
    if (profile.custom_permissions && Array.isArray(profile.custom_permissions)) {
        if (profile.custom_permissions.includes(`!${normalized}`) || profile.custom_permissions.includes(`!${permission}`)) {
            return false // Explicit user-level revocation
        }
        if (profile.custom_permissions.includes(normalized) || profile.custom_permissions.includes(permission)) {
            return true // Explicit user-level grant
        }
    }

    // Check dynamic live role permission matrix
    const matrix = getActiveRolePermissions()
    const rolePerms = matrix[profile.role] || ROLE_DEFAULT_PERMISSIONS[profile.role as UserRole] || []

    return rolePerms.includes(normalized) || rolePerms.includes(permission)
}

/**
 * Checks if the user is any form of administrative staff (admin or super_admin)
 */
export const isStaffAdmin = (profile: UserPermissionProfile | null | undefined): boolean => {
    if (!profile) return false
    return profile.role === 'admin' || profile.role === 'super_admin'
}

