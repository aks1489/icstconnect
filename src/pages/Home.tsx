import { lazy } from 'react'
import HeroSection from '../components/sections/HeroSection'
import TechTickerSection from '../components/sections/TechTickerSection'
import LazySection from '../components/common/LazySection'
import SEOHead from '../components/common/SEOHead'

// Code-split below-the-fold sections so `/` initial bundle & data fetching stay fast
const LearningHubPreview = lazy(() => import('../components/sections/LearningHubPreview'))
const ScholarshipPromoSection = lazy(() => import('../components/sections/ScholarshipPromoSection'))
const AboutSection = lazy(() => import('../components/sections/AboutSection'))
const CoursesSection = lazy(() => import('../components/sections/CoursesSection'))
const FeaturesSection = lazy(() => import('../components/sections/FeaturesSection'))
const GallerySection = lazy(() => import('../components/sections/GallerySection'))
const TestSection = lazy(() => import('../components/sections/TestSection'))

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
                    url: 'https://icstconnect.in',
                    logo: 'https://icstconnect.in/logo.png',
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
            <LazySection
                anchorId="learning-hub"
                minHeightClass="min-h-[560px]"
                bgClassName="bg-[#F4F8FD]"
                loadingLabel="Loading ICST Labs showcase"
            >
                <LearningHubPreview />
            </LazySection>
            <LazySection
                minHeightClass="min-h-[580px]"
                bgClassName="bg-[#F7FAFE]"
                loadingLabel="Loading Class X Scholarship spotlight"
            >
                <ScholarshipPromoSection />
            </LazySection>
            <LazySection
                anchorId="about"
                minHeightClass="min-h-[640px]"
                bgClassName="bg-[#F7FAFE]"
                loadingLabel="Loading campus overview"
            >
                <AboutSection />
            </LazySection>
            <LazySection
                anchorId="courses"
                minHeightClass="min-h-[580px]"
                bgClassName="bg-[#F4F8FD]"
                loadingLabel="Loading certified courses"
            >
                <CoursesSection />
            </LazySection>
            <LazySection
                anchorId="features"
                minHeightClass="min-h-[500px]"
                bgClassName="bg-[#FFFFFF]"
                loadingLabel="Loading ICST advantages"
            >
                <FeaturesSection />
            </LazySection>
            <LazySection
                anchorId="gallery"
                minHeightClass="min-h-[700px]"
                bgClassName="bg-[#F8FAFC]"
                loadingLabel="Loading campus gallery"
            >
                <GallerySection />
            </LazySection>
            <LazySection
                anchorId="onlinetest"
                minHeightClass="min-h-[400px]"
                bgClassName="bg-[#FFFFFF]"
                loadingLabel="Loading online assessment"
            >
                <TestSection />
            </LazySection>
        </>
    )
}

export default Home
