import { ROLE_DEFAULT_PERMISSIONS } from '../types/permissions'
import type { AppPermission, UserRole } from '../types/permissions'

export interface UserPermissionProfile {
    id: string
    role: UserRole | string
    permissions?: AppPermission[]
    custom_permissions?: AppPermission[]
}

/**
 * Evaluates whether a given user profile has a specific permission.
 * Super Admins automatically have all permissions.
 */
export const hasPermission = (profile: UserPermissionProfile | null | undefined, permission: AppPermission): boolean => {
    if (!profile) return false

    // Super Admin has unrestricted access to everything
    if (profile.role === 'super_admin') return true

    // Check custom explicit permissions if attached
    if (profile.custom_permissions && profile.custom_permissions.includes(permission)) {
        return true
    }

    // Check default permissions mapped to their role
    const defaultPerms = ROLE_DEFAULT_PERMISSIONS[profile.role as UserRole]
    if (defaultPerms && defaultPerms.includes(permission)) {
        return true
    }

    return false
}

/**
 * Checks if the user is any form of administrative staff (admin or super_admin)
 */
export const isStaffAdmin = (profile: UserPermissionProfile | null | undefined): boolean => {
    if (!profile) return false
    return profile.role === 'admin' || profile.role === 'super_admin'
}
