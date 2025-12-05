import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from './components/layout/MainLayout'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const AllCourses = lazy(() => import('./pages/AllCourses'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Gallery = lazy(() => import('./pages/Gallery'))
const OnlineTest = lazy(() => import('./pages/OnlineTest'))
const TestPlayer = lazy(() => import('./pages/TestPlayer'))

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
  </div>
)

function App() {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<AllCourses />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/online-test" element={<OnlineTest />} />
            <Route path="/online-test/:testId" element={<TestPlayer />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  )
}

export default App
