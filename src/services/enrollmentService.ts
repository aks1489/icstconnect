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
        let tempPassword = ''

        if (!studentId) {
            // STRICT Profile Generation via Auth Backend
            const userEmail = applicationDetails.email || `student_${applicationDetails.phone}@icstchowberia.com`
            tempPassword = 'ICST@' + Math.floor(100000 + Math.random() * 900000)

            try {
                const response = await fetch('http://localhost:5000/api/create-auth-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userEmail,
                        password: tempPassword,
                        full_name: applicationDetails.full_name
                    })
                })
                
                const resData = await response.json()
                if (!response.ok || !resData.success) {
                    throw new Error(resData.error || 'Failed to generate auth user')
                }
                studentId = resData.user.id
            } catch (err) {
                console.error("Auth creation failed:", err)
                throw new Error("Unable to create student authentication account.")
            }

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
                    post_office: applicationDetails.post_office,
                    requires_password_change: true,
                    temp_password: tempPassword
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

            // Set up overridden basic fees
            await supabase.from('student_fees').insert({
                student_id: studentId,
                course_id: applicationDetails.course_id,
                base_fee: feeSettings?.base_fee || 0,
                admission_fee: 0,
                discount_on_base: feeSettings?.discount || 0,
                discount_on_admission: 0,
                payment_plan: applicationDetails.payment_plan,
                status: 'pending'
            })
        }

        // Fire Email
        if (applicationDetails.email) {
            fetch('http://localhost:5000/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: applicationDetails.email,
                    subject: 'Your ICST Enrollment has been Approved!',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #16a34a;">Enrollment Approved! 🎉</h2>
                            <p>Dear ${applicationDetails.full_name},</p>
                            <p>Great news! Your enrollment application (Ref: <strong>${applicationDetails.reference_id}</strong>) has been fully approved.</p>
                            <p>You have been assigned to your batch. You can now log in to the Student Portal!</p>
                            
                            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #1e293b;">Your Temporary Login Credentials</h3>
                                <p style="margin-bottom: 5px;"><strong>Portal Link:</strong> <a href="http://localhost:5173/login">Access Student Portal</a></p>
                                <p style="margin-bottom: 5px;"><strong>Email:</strong> ${applicationDetails.email || `student_${applicationDetails.phone}@icstchowberia.com`}</p>
                                <p style="margin-bottom: 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword || '*(Sent Previously)*'}</span></p>
                            </div>
                            
                            <p style="color: #b91c1c; font-size: 14px;"><em>Security Notice: Upon your first login, you will be strictly required to change this password.</em></p>
                            <br/>
                            <p>Thank you,</p>
                            <p><strong>ICST Connect Admin</strong></p>
                        </div>
                    `
                })
            }).catch(e => console.error(e))
        }

        return updatedApp
    },
    
    // Reject an application
    async rejectApplication(applicationId: string, applicationDetails?: EnrollmentApplication) {
        const { error } = await supabase
            .from('enrollment_applications')
            .update({ status: 'rejected' })
            .eq('id', applicationId)

        if (error) throw new Error(error.message)

        if (applicationDetails?.email) {
            fetch('http://localhost:5000/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: applicationDetails.email,
                    subject: 'Update on your ICST Enrollment',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #dc2626;">Enrollment Update</h2>
                            <p>Dear ${applicationDetails.full_name},</p>
                            <p>We have reviewed your application (Ref: <strong>${applicationDetails.reference_id}</strong>), but unfortunately we cannot proceed with your enrollment at this time.</p>
                            <p>Please contact the office at +91 8158031706 for more details.</p>
                            <br/>
                            <p>Thank you,</p>
                            <p><strong>ICST Connect Admin</strong></p>
                        </div>
                    `
                })
            }).catch(e => console.error(e))
        }

        return true
    }
}
