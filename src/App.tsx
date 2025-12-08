import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
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
import AdminLogin from './pages/AdminLogin'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Student Imports
import StudentLayout from './student/layout/StudentLayout'
import StudentDashboard from './student/pages/Dashboard'
import OfflineClasses from './student/pages/OfflineClasses'

// Admin Imports
import AdminLayout from './admin/layout/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import ManageStudents from './admin/pages/Students'

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/online-test" element={<OnlineTest />} />
              <Route path="/online-test/:testId" element={<TestPlayer />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute>
                  <StudentLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="offline-classes" element={<OfflineClasses />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
              </Route>

              {/* Catch all - Redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </Router>
    </AuthProvider>
  )
}

export default App
