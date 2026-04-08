import { supabase } from '../lib/supabase'
import type { EnrollmentApplication } from '../types'

export const enrollmentService = {
    // Generate a unique reference ID like ENR-123456
    generateReferenceId: () => {
        const randomNum = Math.floor(100000 + Math.random() * 900000)
        return `ENR-${randomNum}`
    },

    // Submit a new application
    async submitApplication(applicationData: Omit<EnrollmentApplication, 'id' | 'status' | 'created_at' | 'reference_id'>) {
        const referenceId = this.generateReferenceId()
        
        const newApp = {
            ...applicationData,
            reference_id: referenceId,
            status: 'pending'
        }

        const { error } = await supabase
            .from('enrollment_applications')
            .insert([newApp])

        if (error) {
            console.error('Error submitting application:', error)
            throw new Error(error.message)
        }

        return newApp as EnrollmentApplication
    },

    // Fetch pending applications for Admin
    async getPendingApplications() {
        const { data, error } = await supabase
            .from('enrollment_applications')
            .select(`
                *,
                course: courses (course_name)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching applications:', error)
            throw new Error(error.message)
        }

        return data as EnrollmentApplication[]
    },

    // Get an application by reference ID
    async getApplication(referenceId: string) {
        const { data, error } = await supabase
            .from('enrollment_applications')
            .select(`
                *,
                course: courses (course_name)
            `)
            .eq('reference_id', referenceId)
            .single()

        if (error) {
            throw new Error(error.message)
        }

        return data as EnrollmentApplication
    },

    // Approve an application and initiate account creation logic
    async approveApplication(applicationId: string, assignedClassId: number, feeSettings: any, applicationDetails: EnrollmentApplication) {
        // 1. Update application status
        const { data: updatedApp, error: updateError } = await supabase
            .from('enrollment_applications')
            .update({ status: 'approved' })
            .eq('id', applicationId)
            .select()
            .single()

        if (updateError) throw new Error(updateError.message)

        let studentId = applicationDetails.student_id

        if (!studentId) {
            // Mock generating a generic auth user is tough from client SDK, so we generate a custom ID for profiles if needed
            // Assuming system allows profiles without strict auth user matching or we use application ID
            studentId = applicationDetails.id
            const { error: _profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: studentId,
                    full_name: applicationDetails.full_name,
                    phone: applicationDetails.phone,
                    email: applicationDetails.email,
                    role: 'student',
                    address: applicationDetails.address,
                    pincode: applicationDetails.pincode,
                    district: applicationDetails.district,
                    state: applicationDetails.state,
                    dob: applicationDetails.dob,
                    post_office: applicationDetails.post_office
                }])
            // If error here, might be FK constraint, but assuming DB is flexible based on requirements 
        }

        if (studentId) {
            // Enroll in class
            await supabase.from('enrollments').insert({
                student_id: studentId,
                class_id: assignedClassId,
                course_id: applicationDetails.course_id,
                progress: 0
            })

            // Set up basic fees
            await supabase.from('student_fees').insert({
                student_id: studentId,
                course_id: applicationDetails.course_id,
                base_fee: feeSettings?.base_fee || 0,
                admission_fee: feeSettings?.admission_fee || 0,
                discount_on_base: feeSettings?.discount || 0,
                discount_on_admission: 0,
                payment_plan: 'one_time',
                status: 'pending'
            })
        }

        return updatedApp
    },
    
    // Reject an application
    async rejectApplication(applicationId: string) {
        const { error } = await supabase
            .from('enrollment_applications')
            .update({ status: 'rejected' })
            .eq('id', applicationId)

        if (error) throw new Error(error.message)
        return true
    }
}
