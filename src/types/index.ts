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

// --- Test System Types ---

export interface TestOption {
    id: string;
    question_id: string;
    text: string;
    is_correct: boolean;
    order_index: number;
}

export interface TestQuestion {
    id: string;
    test_id: string;
    text: string;
    type: 'multiple-choice'; // expandable
    order_index: number;
    marks: number;
    options: TestOption[];
}

export interface Test {
    id: string;
    created_at: string;
    title: string;
    description: string;
    course_id?: string;
    course_name?: string;
    duration_minutes: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    access_type: 'public' | 'private';
    created_by: string;
    is_active: boolean;
    questions?: TestQuestion[]; // Joined view
    question_count?: number; // Count view
}

export interface TestResult {
    id: string;
    test_id: string;
    user_id?: string;
    guest_info?: { name: string };
    score: number;
    total_questions: number;
    percentage: number;
    answers: Record<string, string>; // question_id -> option_id
    completed_at: string;
    test?: Test; // Joined view
}
