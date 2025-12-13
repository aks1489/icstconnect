import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy, useState, useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'

import PageSkeleton from './components/ui/PageSkeleton'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const CoursesPage = lazy(() => import('./pages/Courses'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Gallery = lazy(() => import('./pages/Gallery'))
const OnlineTest = lazy(() => import('./pages/OnlineTest'))
const TestPlayer = lazy(() => import('./pages/TestPlayer'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
import AdminLogin from './pages/AdminLogin'
import TeacherLogin from './pages/TeacherLogin'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import QuickAccess from './components/dashboard/QuickAccess'

// Student Imports
import StudentLayout from './student/layout/StudentLayout'
import StudentDashboard from './student/pages/Dashboard'
import OfflineClasses from './student/pages/OfflineClasses'
import StudentCalendar from './student/pages/Calendar'
import CompleteProfile from './student/pages/CompleteProfile'

// Admin Imports
import AdminLayout from './admin/layout/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import ManageStudents from './admin/pages/Students'
import StudentDetails from './admin/pages/StudentDetails'
import AdminCourses from './admin/pages/Courses'
import CourseForm from './admin/pages/CourseForm'
import AdminCalendar from './admin/pages/Calendar'
import ScheduleClass from './admin/pages/ScheduleClass'
import AdminTeachers from './admin/pages/Teachers'
import TeacherDetails from './admin/pages/TeacherDetails'
import CourseStructureEditor from './admin/pages/CourseStructureEditor'

// Teacher Imports
import TeacherLayout from './teacher/layout/TeacherLayout'
import TeacherDashboard from './teacher/pages/Dashboard'
import TeacherCalendar from './teacher/pages/Calendar'
import ActiveClasses from './teacher/pages/ActiveClasses'
import ManageClass from './teacher/pages/ManageClass'
import TeacherExams from './teacher/pages/Exams'
import StudentProgressTracker from './teacher/pages/StudentProgressTracker'


// Simple Toast Component for global errors
const ErrorToast = () => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check URL hash for errors (Supabase redirect)
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)) // remove #
      const errorDescription = params.get('error_description')
      // const errorCode = params.get('error_code')

      if (errorDescription) {
        setError(errorDescription.replace(/\+/g, ' '))
        // Clear hash to prevent showing error on refresh
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-[1100] animate-in slide-in-from-right fade-in duration-300">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
        <i className="bi bi-exclamation-circle-fill mt-0.5 text-red-500"></i>
        <div>
          <h4 className="font-semibold text-sm">Authentication Error</h4>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-600 transition-colors ml-auto"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorToast />

        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout><Outlet /></MainLayout>}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/online-test" element={<OnlineTest />} />
              <Route path="/online-test/:testId" element={<TestPlayer />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Catch all to Home - Only inside MainLayout */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* Quick Access - Protected but Shared */}
            <Route path="/quick-access" element={
              <ProtectedRoute>
                <div className="animate-in fade-in duration-300">
                  <QuickAccess />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/student" element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="offline-classes" element={<OfflineClasses />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="complete-profile" element={<CompleteProfile />} />
            </Route>

            {/* Admin Routes - Independent Layout */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
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
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="schedule" element={<ScheduleClass />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="teachers/:id" element={<TeacherDetails />} />
            </Route>

            {/* Teacher Routes - Independent Layout */}
            <Route path="/teacher" element={
              <ProtectedRoute requireTeacher>
                <TeacherLayout />
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

          </Routes>
        </Suspense>
      </Router>
    </AuthProvider >
  )
}

export default App
