/**
 * ICST Connect — Master Error Code Dictionary
 * As specified in Master Engineering Instructions Section 8.2
 */

export interface ErrorDefinition {
    code: string
    title: string
    userMessage: string
    suggestedAction: string
}

export const ERROR_CODES: Record<string, ErrorDefinition> = {
    // ----------------------------------------------------
    // AUTHENTICATION & ACCESS (ICST-AUTH)
    // ----------------------------------------------------
    'ICST-AUTH-001': {
        code: 'ICST-AUTH-001',
        title: 'Authentication Session Expired',
        userMessage: 'Your secure session has expired or is invalid.',
        suggestedAction: 'Please log in again to continue.'
    },
    'ICST-AUTH-002': {
        code: 'ICST-AUTH-002',
        title: 'Invalid Credentials',
        userMessage: 'The email or password provided does not match our records.',
        suggestedAction: 'Please verify your credentials or use the password recovery option.'
    },
    'ICST-AUTH-003': {
        code: 'ICST-AUTH-003',
        title: 'Mandatory Password Rotation Required',
        userMessage: 'Your account is configured with a temporary password that must be updated.',
        suggestedAction: 'Please set a new secure password to access your dashboard.'
    },
    'ICST-AUTH-004': {
        code: 'ICST-AUTH-004',
        title: 'Access Denied',
        userMessage: 'You do not have the necessary permissions to access this page or resource.',
        suggestedAction: 'Contact your administrator if you believe this is an error.'
    },

    // ----------------------------------------------------
    // PERMISSIONS & SUPER ADMIN (ICST-PERM)
    // ----------------------------------------------------
    'ICST-PERM-001': {
        code: 'ICST-PERM-001',
        title: 'Privilege Elevation Required',
        userMessage: 'This action is restricted to Super Administrators only.',
        suggestedAction: 'Request authorization from the system owner.'
    },
    'ICST-PERM-002': {
        code: 'ICST-PERM-002',
        title: 'Unauthorized Action',
        userMessage: 'Your role does not permit modifying this record.',
        suggestedAction: 'Check your assigned permissions or contact management.'
    },

    // ----------------------------------------------------
    // DATA & DATABASE (ICST-DATA)
    // ----------------------------------------------------
    'ICST-DATA-001': {
        code: 'ICST-DATA-001',
        title: 'Record Not Found',
        userMessage: 'The requested record could not be found in the database.',
        suggestedAction: 'Return to the previous screen or refresh the page.'
    },
    'ICST-DATA-002': {
        code: 'ICST-DATA-002',
        title: 'Duplicate Record Conflict',
        userMessage: 'A record with this identifier or email already exists.',
        suggestedAction: 'Please check existing records or use a unique identifier.'
    },
    'ICST-DATA-003': {
        code: 'ICST-DATA-003',
        title: 'Database Mutation Failed',
        userMessage: 'Unable to save changes to the database.',
        suggestedAction: 'Please check your input values and try again.'
    },

    // ----------------------------------------------------
    // FINANCIAL & FEES (ICST-FEE)
    // ----------------------------------------------------
    'ICST-FEE-001': {
        code: 'ICST-FEE-001',
        title: 'Fee Structure Unassigned',
        userMessage: 'No active fee configuration was found for this enrollment.',
        suggestedAction: 'Please allocate a fee structure via the student management panel.'
    },
    'ICST-FEE-002': {
        code: 'ICST-FEE-002',
        title: 'Payment Recording Error',
        userMessage: 'Failed to record the student installment payment.',
        suggestedAction: 'Verify transaction details and try again.'
    },
    'ICST-FEE-003': {
        code: 'ICST-FEE-003',
        title: 'Ledger Reconciliation Conflict',
        userMessage: 'Transaction amount or type does not match ledger constraints.',
        suggestedAction: 'Review balance sheet inputs.'
    },

    // ----------------------------------------------------
    // MEDIA & CLOUDINARY (ICST-MEDIA)
    // ----------------------------------------------------
    'ICST-MEDIA-001': {
        code: 'ICST-MEDIA-001',
        title: 'Media Upload Failed',
        userMessage: 'Unable to upload the image to the cloud storage provider.',
        suggestedAction: 'Verify file size and format (JPEG, PNG, WebP) and retry.'
    },

    // ----------------------------------------------------
    // ONLINE EXAMINATION & TESTS (ICST-TEST)
    // ----------------------------------------------------
    'ICST-TEST-001': {
        code: 'ICST-TEST-001',
        title: 'Private Test Access Required',
        userMessage: 'This examination requires an active enrolled student account.',
        suggestedAction: 'Please log in to your student account to attempt this test.'
    },
    'ICST-TEST-002': {
        code: 'ICST-TEST-002',
        title: 'Test Submission Error',
        userMessage: 'Failed to record your examination answers.',
        suggestedAction: 'Do not close your browser; retry submitting your assessment.'
    },

    // ----------------------------------------------------
    // NETWORK & SYSTEM (ICST-NET / ICST-SYS)
    // ----------------------------------------------------
    'ICST-NET-001': {
        code: 'ICST-NET-001',
        title: 'Network Disconnected',
        userMessage: 'Unable to establish a connection to the server.',
        suggestedAction: 'Check your internet connection and retry.'
    },
    'ICST-SYS-001': {
        code: 'ICST-SYS-001',
        title: 'Unexpected System Fault',
        userMessage: 'An unexpected component failure occurred.',
        suggestedAction: 'Click "Try Again" or report this issue with the error code.'
    }
}

export const getErrorDefinition = (codeOrError: unknown): ErrorDefinition => {
    if (typeof codeOrError === 'string' && ERROR_CODES[codeOrError]) {
        return ERROR_CODES[codeOrError]
    }

    if (codeOrError instanceof Error) {
        const msg = codeOrError.message.toLowerCase()
        if (msg.includes('network') || msg.includes('failed to fetch')) {
            return ERROR_CODES['ICST-NET-001']
        }
        if (msg.includes('jwt') || msg.includes('token') || msg.includes('auth')) {
            return ERROR_CODES['ICST-AUTH-001']
        }
        if (msg.includes('duplicate') || msg.includes('23505')) {
            return ERROR_CODES['ICST-DATA-002']
        }
        if (msg.includes('permission') || msg.includes('row-level security') || msg.includes('42501')) {
            return ERROR_CODES['ICST-AUTH-004']
        }
    }

    return ERROR_CODES['ICST-SYS-001']
}
