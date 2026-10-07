import HeroSection from '../components/sections/HeroSection'
import TechTickerSection from '../components/sections/TechTickerSection'
import LearningHubPreview from '../components/sections/LearningHubPreview'
import ScholarshipPromoSection from '../components/sections/ScholarshipPromoSection'
import FeaturesSection from '../components/sections/FeaturesSection'
import AboutSection from '../components/sections/AboutSection'
import CoursesSection from '../components/sections/CoursesSection'
import GallerySection from '../components/sections/GallerySection'
import TestSection from '../components/sections/TestSection'
import SEOHead from '../components/common/SEOHead'

const Home = () => {
    return (
        <>
            <SEOHead
                title="ICST Connect - Computer Science & Technology Institute | Chowberia"
                description="Official student and public portal for ICST Chowberia. Explore certified computer courses, programming diplomas, online tests, and academic scholarships."
                canonicalPath="/"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'EducationalOrganization',
                    name: 'Institute of Computer Science and Technology (ICST) Chowberia',
                    alternateName: 'ICST Chowberia',
                    url: 'https://icstconnect.com',
                    logo: 'https://icstconnect.com/logo.png',
                    description: 'Premier institute providing computer education, IT diplomas, coding courses, and government-recognized certifications in Chowberia, West Bengal.',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Chowberia',
                        addressLocality: 'Bangaon / Chowberia',
                        addressRegion: 'West Bengal',
                        postalCode: '743290',
                        addressCountry: 'IN'
                    },
                    contactPoint: {
                        '@type': 'ContactPoint',
                        telephone: '+91-8158031706',
                        contactType: 'admissions',
                        email: 'icstconnect@gmail.com'
                    },
                    sameAs: [
                        'https://www.facebook.com/icstconnect',
                        'https://www.instagram.com/icstconnect/'
                    ]
                }}
            />
            <HeroSection />
            <TechTickerSection />
            <LearningHubPreview />
            <ScholarshipPromoSection />
            <AboutSection />
            <CoursesSection />
            <FeaturesSection />
            <GallerySection />
            <TestSection />
        </>
    )
}

export default Home
