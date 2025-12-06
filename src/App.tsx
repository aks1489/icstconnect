import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from './components/layout/MainLayout'

import PageSkeleton from './components/ui/PageSkeleton'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const AllCourses = lazy(() => import('./pages/AllCourses'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Gallery = lazy(() => import('./pages/Gallery'))
const OnlineTest = lazy(() => import('./pages/OnlineTest'))
const TestPlayer = lazy(() => import('./pages/TestPlayer'))
const AboutUs = lazy(() => import('./pages/AboutUs'))

function App() {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<AllCourses />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/online-test" element={<OnlineTest />} />
            <Route path="/online-test/:testId" element={<TestPlayer />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  )
}

export default App
