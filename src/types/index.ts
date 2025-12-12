export interface UserProfile {
    id: string;
    email: string; // Often joined from auth.users but useful to have in type
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    created_at: string;
    // Extended Profile Fields
    father_name?: string;
    address?: string;
    pincode?: string;
    district?: string;
    state?: string;
    dob?: string;
    avatar_url?: string;
    phone?: string;
    post_office?: string;
    enrollment_center?: string;
    is_profile_complete?: boolean; // Computed or derived
}
