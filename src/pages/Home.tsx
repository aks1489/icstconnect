import HeroSection from '../components/sections/HeroSection'
import TechTickerSection from '../components/sections/TechTickerSection'
import LearningHubPreview from '../components/sections/LearningHubPreview'
import FeaturesSection from '../components/sections/FeaturesSection'
import AboutSection from '../components/sections/AboutSection'
import CoursesSection from '../components/sections/CoursesSection'
import GallerySection from '../components/sections/GallerySection'
import TestSection from '../components/sections/TestSection'

const Home = () => {
    return (
        <>
            <HeroSection />
            <TechTickerSection />
            <LearningHubPreview />
            <AboutSection />
            <CoursesSection />
            <FeaturesSection />
            <GallerySection />
            <TestSection />
        </>
    )
}

export default Home
