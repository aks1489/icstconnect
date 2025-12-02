import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'
import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import TechTickerSection from './components/TechTickerSection'
import StatsSection from './components/StatsSection'
import FeaturesSection from './components/FeaturesSection'
import AboutSection from './components/AboutSection'
import CoursesSection from './components/CoursesSection'
import GallerySection from './components/GallerySection'
import TestSection from './components/TestSection'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <NavBar />
      <HeroSection />
      <TechTickerSection />
      <StatsSection />
      <AboutSection />
      <CoursesSection />
      <FeaturesSection />
      <GallerySection />
      <TestSection />
      <Footer />
    </>
  )
}

export default App
