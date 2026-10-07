import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy, useState } from 'react'
import { IconAlertCircle as AlertCircle, IconX as X } from '@tabler/icons-react'
import MainLayout from './components/layout/MainLayout'

import PageSkeleton from './components/ui/PageSkeleton'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const CoursesPage = lazy(() => import('./pages/Courses'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Gallery = lazy(() => import('./pages/Gallery'))
const ScholarshipsPage = lazy(() => import('./pages/Scholarships'))
const OnlineTest = lazy(() => import('./pages/OnlineTest'))
const TestPlayer = lazy(() => import('./pages/TestPlayer'))
const EnrollmentForm = lazy(() => import('./pages/EnrollmentForm'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ForcePasswordChange = lazy(() => import('./pages/ForcePasswordChange'))
const Connect = lazy(() => import('./pages/Connect'))
const TypingPractice = lazy(() => import('./pages/TypingPractice'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'))
const QuickAccess = lazy(() => import('./components/dashboard/QuickAccess'))

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Student Imports (Lazy-loaded)
const StudentLayout = lazy(() => import('./student/layout/StudentLayout'))
const StudentDashboard = lazy(() => import('./student/pages/Dashboard'))
const OfflineClasses = lazy(() => import('./student/pages/OfflineClasses'))
const StudentCalendar = lazy(() => import('./student/pages/Calendar'))
const CompleteProfile = lazy(() => import('./student/pages/CompleteProfile'))
const StudentFeesPage = lazy(() => import('./student/pages/StudentFees'))

// Admin Imports (Lazy-loaded)
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const ManageStudents = lazy(() => import('./admin/pages/Students'))
const StudentDetails = lazy(() => import('./admin/pages/StudentDetails'))
const AdminCourses = lazy(() => import('./admin/pages/Courses'))
const CourseForm = lazy(() => import('./admin/pages/CourseForm'))
const AdminCalendar = lazy(() => import('./admin/pages/Calendar'))
const ScheduleClass = lazy(() => import('./admin/pages/ScheduleClass'))
const AdminTeachers = lazy(() => import('./admin/pages/Teachers'))
const TeacherDetails = lazy(() => import('./admin/pages/TeacherDetails'))
const CourseStructureEditor = lazy(() => import('./admin/pages/CourseStructureEditor'))
const ClassManager = lazy(() => import('./admin/pages/ClassManager'))
const AdminClasses = lazy(() => import('./admin/pages/AdminClasses'))
const AdminClassDetails = lazy(() => import('./admin/pages/AdminClassDetails'))
const CreateTest = lazy(() => import('./admin/pages/CreateTest'))
const AdminTests = lazy(() => import('./admin/pages/Tests'))
const DiscountClaims = lazy(() => import('./admin/pages/DiscountClaims'))
const AdminFinance = lazy(() => import('./admin/pages/FinancialDashboard'))
const EnrollmentApplications = lazy(() => import('./admin/pages/EnrollmentApplications'))
const AdminScholarships = lazy(() => import('./admin/pages/AdminScholarships'))
const AdminGallery = lazy(() => import('./admin/pages/AdminGallery'))
const AdminPermissions = lazy(() => import('./admin/pages/AdminPermissions'))
const AdminAuditLogs = lazy(() => import('./admin/pages/AdminAuditLogs'))
const AdminEcosystem = lazy(() => import('./admin/pages/AdminEcosystem'))

// Teacher Imports (Lazy-loaded)
const TeacherLayout = lazy(() => import('./teacher/layout/TeacherLayout'))
const TeacherDashboard = lazy(() => import('./teacher/pages/Dashboard'))
const TeacherCalendar = lazy(() => import('./teacher/pages/Calendar'))
const ActiveClasses = lazy(() => import('./teacher/pages/ActiveClasses'))
const ManageClass = lazy(() => import('./teacher/pages/ManageClass'))
const TeacherExams = lazy(() => import('./teacher/pages/Exams'))
const StudentProgressTracker = lazy(() => import('./teacher/pages/StudentProgressTracker'))


// Simple Toast Component for global errors
const ErrorToast = () => {
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1))
      const errorDescription = params.get('error_description')
      if (errorDescription) {
        window.history.replaceState(null, '', window.location.pathname)
        return errorDescription.replace(/\+/g, ' ')
      }
    }
    return null
  })

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-[1100] animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
        <AlertCircle className="mt-0.5 text-red-500 shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-sm">Authentication Error</h4>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600 transition-colors ml-auto"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ToastContainer from './components/ui/ToastContainer'
import AppErrorBoundary from './components/ui/AppErrorBoundary'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppErrorBoundary>
              <ErrorToast />
              <ToastContainer />

              <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public Routes with MainLayout */}
                <Route element={
                  <AppErrorBoundary fallbackTitle="Public Portal Error">
                    <MainLayout><Outlet /></MainLayout>
                  </AppErrorBoundary>
                }>
                <Route path="/" element={<Home />} />
                <Route path="/courses/:courseId?" element={<CoursesPage />} />
                <Route path="/enroll/:courseId" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <EnrollmentForm />
                  </Suspense>
                } />

                <Route path="/notifications" element={<Notifications />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/scholarships" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ScholarshipsPage />
                  </Suspense>
                } />

                <Route path="/online-test" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <OnlineTest />
                  </Suspense>
                } />

                <Route path="/online-test/:testId" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <TestPlayer />
                  </Suspense>
                } />

                {/* Security Flow */}
                <Route path="/force-password-change" element={
                  <ProtectedRoute>
                    <ForcePasswordChange />
                  </ProtectedRoute>
                } />

                <Route path="/about" element={<AboutUs />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/teacher/login" element={<TeacherLogin />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Dedicated 404 Not Found Route */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Standalone Typing Practice Page */}
              <Route path="/typing-practice" element={
                <Suspense fallback={<PageSkeleton />}>
                  <TypingPractice />
                </Suspense>
              } />

              {/* Quick Access - Protected but Shared */}
              <Route path="/quick-access" element={
                <ProtectedRoute>
                  <div className="animate-in fade-in duration-300">
                    <QuickAccess />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/student" element={
                <ProtectedRoute requireStudent>
                  <AppErrorBoundary fallbackTitle="Student Portal Unavailable">
                    <StudentLayout />
                  </AppErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="offline-classes" element={<OfflineClasses />} />
                <Route path="calendar" element={<StudentCalendar />} />
                <Route path="tests" element={<OnlineTest isStudentPortal />} />
                <Route path="tests/:testId" element={<TestPlayer />} />
                <Route path="fees" element={<StudentFeesPage />} />
                <Route path="complete-profile" element={<CompleteProfile />} />
              </Route>

              {/* Standalone Connect Page */}
              <Route path="/connect" element={<Connect />} />

              {/* Admin Routes - Independent Layout */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AppErrorBoundary fallbackTitle="Admin Portal Unavailable">
                    <AdminLayout />
                  </AppErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="students/:id" element={<StudentDetails />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/new" element={<CourseForm />} />
                <Route path="courses/:id/edit" element={<CourseForm />} />
                <Route path="courses/:id/structure" element={<CourseStructureEditor />} />
                <Route path="courses/:id/classes" element={<ClassManager />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="classes/:id" element={<AdminClassDetails />} />
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="schedule" element={<ScheduleClass />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="teachers/:id" element={<TeacherDetails />} />
                <Route path="tests" element={<AdminTests />} />
                <Route path="tests/new" element={<CreateTest />} />
                <Route path="tests/:id/edit" element={<CreateTest />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="discount-claims" element={<DiscountClaims />} />
                <Route path="enrollments" element={<EnrollmentApplications />} />
                <Route path="scholarships" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AdminScholarships />
                  </Suspense>
                } />
                <Route path="gallery" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AdminGallery />
                  </Suspense>
                } />
                <Route path="permissions" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AdminPermissions />
                  </Suspense>
                } />
                <Route path="audit-logs" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AdminAuditLogs />
                  </Suspense>
                } />
                <Route path="ecosystem" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AdminEcosystem />
                  </Suspense>
                } />
              </Route>

              {/* Teacher Routes - Independent Layout */}
              <Route path="/teacher" element={
                <ProtectedRoute requireTeacher>
                  <AppErrorBoundary fallbackTitle="Teacher Portal Unavailable">
                    <TeacherLayout />
                  </AppErrorBoundary>
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="calendar" element={<TeacherCalendar />} />
                <Route path="active-classes" element={<ActiveClasses />} />
                <Route path="classes/:courseId" element={<ManageClass />} />
                <Route path="classes/:studentId/:courseId" element={<StudentProgressTracker />} />
                <Route path="exams" element={<TeacherExams />} />
                {/* Add more teacher routes here */}
              </Route>

              {/* Global 404 Catch-All Route */}
              <Route path="*" element={
                <MainLayout>
                  <NotFound />
                </MainLayout>
              } />

            </Routes>
          </Suspense>
          </AppErrorBoundary>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
