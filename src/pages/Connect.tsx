import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    IconArrowLeft,
    IconExternalLink,
    IconShare,
    IconQrcode,
    IconPhone,
    IconMail,
    IconCopy,
    IconCheck,
    IconSearch,
    IconShieldCheck,
    IconSparkles,
    IconSchool,
    IconKeyboard,
    IconAward,
    IconBook,
    IconX,
    IconMapPin,
    IconBrandWhatsapp,
    IconLock,
    IconBriefcase,
    IconClipboardCheck
} from '@tabler/icons-react';

import logo from '../assets/logo.jpg';
import SEOHead from '../components/common/SEOHead';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import DiscountForm from './Connect/DiscountForm';

// Official Multi-Colored Modern Google Maps Pin SVG
const GoogleMapsLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 92.3 132.3" width="100%" height="100%" aria-hidden="true">
        <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z" />
        <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z" />
        <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3" />
        <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3" />
        <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2" />
    </svg>
);

// Official Facebook Logo SVG
const FacebookLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
        <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 9.96 7.34 18.23 16.87 19.72v-13.9h-5.08V24h5.08v-4.4c0-5.01 2.99-7.79 7.57-7.79 2.19 0 4.48.39 4.48.39v4.92h-2.52c-2.48 0-3.26 1.54-3.26 3.12V24h5.54l-.89 5.82h-4.66v13.9C36.66 42.23 44 33.96 44 24 44 12.95 35.05 4 24 4z" />
    </svg>
);

// Official Instagram Gradient Logo SVG
const InstagramLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
        <defs>
            <radialGradient id="instagram_grad_connect" cx="24" cy="46" r="44" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f09433" />
                <stop offset="0.25" stopColor="#e6683c" />
                <stop offset="0.5" stopColor="#dc2743" />
                <stop offset="0.75" stopColor="#cc2366" />
                <stop offset="1" stopColor="#bc1888" />
            </radialGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="12" ry="12" fill="url(#instagram_grad_connect)" />
        <path fill="#fff" d="M24 13c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11zm0 18c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" />
        <circle cx="35" cy="13" r="2.5" fill="#fff" />
        <path fill="none" stroke="#fff" strokeWidth="3.5" d="M34 8H14c-3.3 0-6 2.7-6 6v20c0 3.3 2.7 6 6 6h20c3.3 0 6-2.7 6-6V14c0-3.3-2.7-6-6-6z" />
    </svg>
);

// Official WhatsApp Logo SVG
const WhatsAppLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 100 101" width="100%" height="100%" aria-hidden="true">
        <path fill="#25D366" d="M50.1 5.3c-24.6 0-44.6 20-44.6 44.6 0 7.9 2.1 15.6 6.1 22.4L5.3 95.8l24-6.3c6.6 3.6 14 5.5 21.6 5.5 24.6 0 44.6-20 44.6-44.6C94.7 25.3 74.7 5.3 50.1 5.3z" />
        <path fill="#FFF" d="M75.2 65.5c-1-.5-6.1-3-7.1-3.4-.9-.4-1.6-.6-2.3.4-.7 1-2.7 3.4-3.3 4.1-.6.7-1.2.8-2.2.3-1-0.5-4.2-1.5-8-4.9-3-2.6-5-5.9-5.6-6.9-.6-1 0-1.5.5-1.9.4-.4.9-1.1 1.4-1.6.5-.5.6-.9.9-1.5.3-.6.1-1.1-.1-1.6-.2-.5-2-4.9-2.8-6.7-.7-1.7-1.5-1.5-2.1-1.5h-1.8c-.6 0-1.6.2-2.4 1.1-0.8.9-3.2 3.2-3.2 7.7s3.3 8.9 3.8 9.5c.5.6 6.5 9.9 15.7 13.9 6.2 2.7 8.5 2.2 11.6 2 3-0.2 5.8-2.4 6.6-4.7 0.8-2.3 0.8-4.3 0.6-4.7-.2-.5-.8-.7-1.8-1.2h0z" />
    </svg>
);

// Global Tech Globe SVG
const WebsiteGlobeLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
        <circle fill="#2563EB" cx="24" cy="24" r="24" />
        <circle cx="24" cy="24" r="16" stroke="#FFF" strokeWidth="2.5" fill="none" />
        <path d="M7.9 24h32.2M24 7.9C20 12 18 18 18 24s2 12 6 16.1M24 7.9C28 12 30 18 30 24s-2 12-6 16.1" stroke="#FFF" strokeWidth="2.5" fill="none" />
    </svg>
);

type LinkCategory = 'all' | 'ecosystem' | 'social' | 'portals';

interface EcosystemLink {
    id: string;
    label: string;
    subLabel: string;
    category: 'ecosystem' | 'social' | 'portals';
    badge?: string;
    badgeColor?: string;
    isExternal: boolean;
    url: string;
    iconComponent?: React.FC<{ className?: string }>;
    tablerIcon?: React.ElementType;
    accentColor: string;
    gradientBg: string;
}

const Connect: React.FC = () => {
    const [isDiscountFormOpen, setIsDiscountFormOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<LinkCategory>('all');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Toast Notification helper
    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    }, []);

    // Share link handler
    const handleShare = useCallback(async () => {
        const shareData = {
            title: 'ICST Connect • Official Link & Ecosystem Hub',
            text: 'Connect with Institute of Computer Science and Technology (ICST) Chowberia: direct contact, admissions, courses, portals & social links.',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User dismissed or share failed, fallback to copy
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!');
        }
    }, [showToast]);

    // Copy to clipboard helper
    const handleCopyText = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`);
    }, [showToast]);

    // Curated link catalog across Academic Ecosystem, Social, and Portals
    const ecosystemLinks: EcosystemLink[] = useMemo(() => [
        // --- 1. Academic & Tech Ecosystem ---
        {
            id: 'job-simulator',
            label: 'Job Portal Simulator',
            subLabel: 'Tech Hiring, Mock Interviews & Assessments',
            category: 'ecosystem',
            badge: 'Interactive',
            badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            isExternal: true,
            url: 'https://icst-job-portal-simulator.netlify.app/',
            iconComponent: WebsiteGlobeLogo,
            accentColor: 'border-emerald-500/40 hover:border-emerald-500',
            gradientBg: 'from-emerald-500/10 to-teal-500/5'
        },
        {
            id: 'typing-practice',
            label: 'Typing Speed Lab',
            subLabel: 'Real-time WPM, Accuracy & Speed Benchmarks',
            category: 'ecosystem',
            badge: 'Live Test',
            badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
            isExternal: false,
            url: '/typing-practice',
            tablerIcon: IconKeyboard,
            accentColor: 'border-cyan-500/40 hover:border-cyan-400',
            gradientBg: 'from-cyan-500/10 to-blue-500/5'
        },
        {
            id: 'scholarships',
            label: 'Scholarship Entrance Exam',
            subLabel: 'Merit-Based Financial Aid & Talent Rewards',
            category: 'ecosystem',
            badge: 'Aid Program',
            badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
            isExternal: false,
            url: '/scholarships',
            tablerIcon: IconAward,
            accentColor: 'border-amber-500/40 hover:border-amber-400',
            gradientBg: 'from-amber-500/10 to-yellow-500/5'
        },
        {
            id: 'courses',
            label: 'Course Catalog & Syllabus',
            subLabel: 'DCA, ADCA, Web Dev, Python & Accounting',
            category: 'ecosystem',
            badge: 'Curriculum',
            badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
            isExternal: false,
            url: '/courses',
            tablerIcon: IconBook,
            accentColor: 'border-blue-500/40 hover:border-blue-400',
            gradientBg: 'from-blue-500/10 to-indigo-500/5'
        },
        {
            id: 'online-test',
            label: 'Online Exam Center',
            subLabel: 'Module Assessments & Student Certification Tests',
            category: 'ecosystem',
            badge: 'Exams',
            badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
            isExternal: false,
            url: '/online-test',
            tablerIcon: IconClipboardCheck,
            accentColor: 'border-purple-500/40 hover:border-purple-400',
            gradientBg: 'from-purple-500/10 to-violet-500/5'
        },

        // --- 2. Social & Community Channels ---
        {
            id: 'website',
            label: 'Official Website',
            subLabel: 'icstconnect.in • Programs, News & Noticeboard',
            category: 'social',
            badge: 'Main Portal',
            badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
            isExternal: true,
            url: 'https://icstconnect.in',
            iconComponent: WebsiteGlobeLogo,
            accentColor: 'border-blue-500/40 hover:border-blue-400',
            gradientBg: 'from-blue-500/10 to-cyan-500/5'
        },
        {
            id: 'maps',
            label: 'Campus Navigation (Google Maps)',
            subLabel: 'Chowberia Bazar, Near High School • 4.9 ★',
            category: 'social',
            badge: 'Directions',
            badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
            isExternal: true,
            url: 'https://maps.app.goo.gl/5AE3yZ6ry1mntPsM7',
            iconComponent: GoogleMapsLogo,
            accentColor: 'border-red-500/40 hover:border-red-400',
            gradientBg: 'from-red-500/10 to-orange-500/5'
        },
        {
            id: 'whatsapp-chat',
            label: 'WhatsApp Direct Desk',
            subLabel: '+91 81580 31706 • Instant Admissions Guidance',
            category: 'social',
            badge: 'Instant Chat',
            badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
            isExternal: true,
            url: 'https://wa.me/918158031706?text=Hello%20ICST%20Chowberia,%20I%20would%20like%20to%20know%20more%20about%20your%20courses%20and%20admission',
            iconComponent: WhatsAppLogo,
            accentColor: 'border-green-500/40 hover:border-green-400',
            gradientBg: 'from-green-500/10 to-emerald-500/5'
        },
        {
            id: 'facebook',
            label: 'Facebook Community',
            subLabel: '@icstconnect • Events, Galleries & Graduations',
            category: 'social',
            badge: 'Community',
            badgeColor: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/30',
            isExternal: true,
            url: 'https://www.facebook.com/icstconnect',
            iconComponent: FacebookLogo,
            accentColor: 'border-blue-600/40 hover:border-blue-500',
            gradientBg: 'from-blue-600/10 to-blue-400/5'
        },
        {
            id: 'instagram',
            label: 'Instagram Campus Reels',
            subLabel: '@icstconnect • Student Tech Life & Projects',
            category: 'social',
            badge: 'Follow Us',
            badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
            isExternal: true,
            url: 'https://www.instagram.com/icstconnect/',
            iconComponent: InstagramLogo,
            accentColor: 'border-pink-500/40 hover:border-pink-400',
            gradientBg: 'from-pink-500/10 to-rose-500/5'
        },

        // --- 3. Institutional Portals & Gateways ---
        {
            id: 'portal-student',
            label: 'Student Learning Hub',
            subLabel: 'Class Schedules, Fees, Grades & Resources',
            category: 'portals',
            badge: 'Student Login',
            badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
            isExternal: false,
            url: '/login',
            tablerIcon: IconSchool,
            accentColor: 'border-cyan-500/40 hover:border-cyan-400',
            gradientBg: 'from-cyan-500/10 to-blue-500/5'
        },
        {
            id: 'portal-teacher',
            label: 'Teacher & Faculty Portal',
            subLabel: 'Attendance, Batch Management & Assessments',
            category: 'portals',
            badge: 'Faculty Login',
            badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
            isExternal: false,
            url: '/teacher/login',
            tablerIcon: IconBriefcase,
            accentColor: 'border-indigo-500/40 hover:border-indigo-400',
            gradientBg: 'from-indigo-500/10 to-purple-500/5'
        },
        {
            id: 'portal-staff',
            label: 'Staff & Reception Desk',
            subLabel: 'Lab Supervision, Visitors & Daily Operations',
            category: 'portals',
            badge: 'Staff Login',
            badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
            isExternal: false,
            url: '/staff/login',
            tablerIcon: IconLock,
            accentColor: 'border-teal-500/40 hover:border-teal-400',
            gradientBg: 'from-teal-500/10 to-cyan-500/5'
        },
        {
            id: 'portal-admin',
            label: 'Campus Administration',
            subLabel: 'SuperAdmin & System Governance Gateway',
            category: 'portals',
            badge: 'Admin Login',
            badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30',
            isExternal: false,
            url: '/admin/login',
            tablerIcon: IconShieldCheck,
            accentColor: 'border-slate-500/40 hover:border-slate-400',
            gradientBg: 'from-slate-500/10 to-slate-700/5'
        }
    ], []);

    // Filtered links based on category and search query
    const filteredLinks = useMemo(() => {
        return ecosystemLinks.filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query ||
                item.label.toLowerCase().includes(query) ||
                item.subLabel.toLowerCase().includes(query) ||
                (item.badge && item.badge.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [ecosystemLinks, selectedCategory, searchQuery]);

    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://icstconnect.in/connect&color=0F2B42&bgcolor=FFFFFF';

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0A192F] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden selection:bg-cyan-500 selection:text-white flex flex-col items-center">
            {/* Mandatory SEO Head */}
            <SEOHead
                title="ICST Connect • Official Institute Ecosystem & Quick Access Hub"
                description="Connect with ICST Chowberia: quick links, social media channels, discount coupons, companion portals, and direct WhatsApp / phone assistance."
                canonicalPath="/connect"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Connect & Social Hub', path: '/connect' }
                ]}
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'EducationalOrganization',
                    name: 'Institute of Computer Science and Technology (ICST) Chowberia',
                    url: 'https://icstconnect.in',
                    sameAs: ['https://www.facebook.com/icstconnect', 'https://www.instagram.com/icstconnect/'],
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: 'Chowberia Bazar, Near High School',
                        addressLocality: 'Bongaon Sub-Division',
                        addressRegion: 'West Bengal',
                        postalCode: '743249',
                        addressCountry: 'IN'
                    },
                    telephone: '+918158031706',
                    email: 'icstconnect@gmail.com'
                }}
            />

            {/* Ambient Background Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-15%] w-[480px] h-[480px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
            <div className="absolute top-[35%] right-[-15%] w-[420px] h-[420px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[110px] pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" aria-hidden="true" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 dark:border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
                    <IconCheck size={16} className="text-emerald-400 dark:text-emerald-600" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Main Wrapper: Responsive container */}
            <main className="w-full max-w-xl px-4 py-6 sm:py-8 z-10 flex flex-col items-center">

                {/* Top Navigation & Status Bar */}
                <header className="w-full flex items-center justify-between mb-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-200 no-underline"
                    >
                        <IconArrowLeft size={15} />
                        <span>Home</span>
                    </Link>

                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Chowberia Hub</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle className="scale-90" />
                    </div>
                </header>

                {/* Institute Profile & Header Card */}
                <section className="w-full flex flex-col items-center text-center mb-5 animate-in fade-in zoom-in duration-300">
                    {/* Glowing Logo Avatar with Cyber Ring */}
                    <div className="relative mb-3 group">
                        <div
                            className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_10s_linear_infinite]"
                            aria-hidden="true"
                        />
                        <div className="relative p-1 bg-white dark:bg-[#0A192F] rounded-full shadow-2xl">
                            <img
                                src={logo}
                                alt="Institute of Computer Science and Technology (ICST) Chowberia Official Institute Crest"
                                width={96}
                                height={96}
                                loading="eager"
                                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-cyan-500/40 shadow-inner transform transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Single Semantic H1 */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                        ICST Connect
                    </h1>

                    <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-cyan-400 mb-2">
                        Institute of Computer Science and Technology • Chowberia
                    </p>

                    <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800/80 font-medium">
                            <IconShieldCheck size={13} className="text-blue-500 dark:text-cyan-400" />
                            <span>Govt. Regd. Academy</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>Estd. Chowberia</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Admissions 2026-27 Open</span>
                    </div>

                    {/* Quick Utility Action Bar: Call, WhatsApp, Share, QR */}
                    <div className="grid grid-cols-4 gap-2 w-full max-w-sm mt-4">
                        {/* Call Button */}
                        <a
                            href="tel:+918158031706"
                            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white dark:bg-[#0F2038] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-md transition-all group no-underline"
                            title="Call Institute Desk"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                <IconPhone size={17} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Call Us</span>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                            href="https://wa.me/918158031706?text=Hello%20ICST%20Chowberia,%20I%20would%20like%20to%20know%20more%20about%20your%20courses%20and%20admission"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white dark:bg-[#0F2038] border border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-400 shadow-sm hover:shadow-md transition-all group no-underline"
                            title="Direct WhatsApp Chat"
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                <IconBrandWhatsapp size={17} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">WhatsApp</span>
                        </a>

                        {/* Share Button */}
                        <button
                            type="button"
                            onClick={handleShare}
                            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white dark:bg-[#0F2038] border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-400 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            title="Share Connect Link"
                        >
                            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                <IconShare size={17} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Share Hub</span>
                        </button>

                        {/* QR Code Button */}
                        <button
                            type="button"
                            onClick={() => setIsQrModalOpen(true)}
                            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white dark:bg-[#0F2038] border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-400 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            title="Show Hub QR Code"
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                <IconQrcode size={17} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Scan QR</span>
                        </button>
                    </div>
                </section>

                {/* Hero Admission Coupon / Discount Card */}
                <section className="w-full mb-5">
                    <button
                        type="button"
                        onClick={() => setIsDiscountFormOpen(true)}
                        className="w-full group relative overflow-hidden rounded-2xl p-[1.5px] shadow-xl shadow-amber-500/10 transition-all duration-300 hover:shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
                    >
                        {/* Continuous Conic Cyber Border Animation */}
                        <div
                            className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,#f59e0b_120deg,#06b6d4_180deg,#3b82f6_240deg,transparent_300deg)] animate-[spin_6s_linear_infinite]"
                            aria-hidden="true"
                        />

                        {/* Card Content Interior */}
                        <div className="relative w-full bg-white dark:bg-[#0F2038] rounded-[15px] p-3.5 sm:p-4 flex items-center justify-between gap-3 border border-amber-500/30 dark:border-amber-500/30 backdrop-blur-md">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0 group-hover:rotate-6 transition-transform">
                                    <IconSparkles size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                            Limited Seats Available
                                        </span>
                                    </div>
                                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                                        Claim Admission Discount
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                                        Save <strong className="text-emerald-600 dark:text-emerald-400 font-bold">10% to 30%</strong> on IT diploma course fees
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm">
                                <span>Apply</span>
                                <IconExternalLink size={14} />
                            </div>
                        </div>
                    </button>
                </section>

                {/* Search & Category Filter Pills */}
                <section className="w-full mb-3 space-y-2.5">
                    {/* Live Search Input */}
                    <div className="relative w-full">
                        <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search links, tools, courses, portals..."
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-[#0F2038] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-500/20 outline-none transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                                title="Clear search"
                            >
                                <IconX size={15} />
                            </button>
                        )}
                    </div>

                    {/* Filter Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
                        {(
                            [
                                { key: 'all', label: 'All Links', count: ecosystemLinks.length },
                                { key: 'ecosystem', label: 'Academic & Tech', count: ecosystemLinks.filter(l => l.category === 'ecosystem').length },
                                { key: 'social', label: 'Social & Campus', count: ecosystemLinks.filter(l => l.category === 'social').length },
                                { key: 'portals', label: 'Portals & Logins', count: ecosystemLinks.filter(l => l.category === 'portals').length },
                            ] as const
                        ).map((tab) => {
                            const isSelected = selectedCategory === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(tab.key)}
                                    className={`
                                        whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5
                                        ${isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-cyan-500 dark:text-[#0A192F]'
                                            : 'bg-white dark:bg-[#0F2038] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isSelected ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0A192F]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Link Cards Stack */}
                <section className="w-full flex flex-col gap-2.5 mb-6" aria-label="Ecosystem Direct Links">
                    {filteredLinks.length === 0 ? (
                        <div className="text-center py-8 bg-white dark:bg-[#0F2038] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No links found</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Try searching for another keyword or switch category.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 hover:bg-blue-100 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        filteredLinks.map((link) => {
                            const isExternal = link.isExternal;
                            const IconComponent = link.iconComponent;
                            const TablerIcon = link.tablerIcon;

                            const content = (
                                <>
                                    {/* Icon Container with Dedicated Styling */}
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#0A192F] border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-1.5 group-hover:scale-105 transition-transform duration-200">
                                        {IconComponent ? (
                                            <IconComponent className="w-full h-full" />
                                        ) : TablerIcon ? (
                                            <TablerIcon size={24} className="text-blue-600 dark:text-cyan-400" />
                                        ) : null}
                                    </div>

                                    {/* Text Content */}
                                    <div className="ml-3 sm:ml-3.5 flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors truncate">
                                                {link.label}
                                            </span>
                                            {link.badge && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${link.badgeColor}`}>
                                                    {link.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {link.subLabel}
                                        </span>
                                    </div>

                                    {/* Action Arrow / Navigation Icon */}
                                    <div className="ml-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 shrink-0">
                                        <IconExternalLink size={16} />
                                    </div>
                                </>
                            );

                            const cardClasses = `
                                group relative flex items-center p-3 sm:p-3.5 rounded-2xl
                                bg-white/90 dark:bg-[#0F2038]/90 backdrop-blur-md
                                border border-slate-200/80 dark:border-slate-800/80
                                shadow-sm hover:shadow-md dark:hover:shadow-cyan-500/5
                                transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                                no-underline cursor-pointer ${link.accentColor}
                            `;

                            if (isExternal) {
                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cardClasses}
                                    >
                                        {content}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={link.id}
                                    to={link.url}
                                    className={cardClasses}
                                >
                                    {content}
                                </Link>
                            );
                        })
                    )}
                </section>

                {/* Campus Information & Direct Helpline Footer Card */}
                <footer className="w-full bg-white dark:bg-[#0F2038] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                            <IconMapPin size={18} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                ICST Chowberia Campus
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                Chowberia Bazar, Near High School, Bongaon Sub-Division, North 24 Parganas, WB - 743249
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                            type="button"
                            onClick={() => handleCopyText('+91 81580 31706', 'Helpline')}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0A192F] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer text-left"
                            title="Click to copy helpline"
                        >
                            <span className="flex items-center gap-1.5 truncate">
                                <IconPhone size={14} className="text-blue-500 dark:text-cyan-400 shrink-0" />
                                <span className="font-semibold">+91 81580 31706</span>
                            </span>
                            <IconCopy size={13} className="text-slate-400 shrink-0" />
                        </button>

                        <button
                            type="button"
                            onClick={() => handleCopyText('icstconnect@gmail.com', 'Email')}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0A192F] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer text-left"
                            title="Click to copy email address"
                        >
                            <span className="flex items-center gap-1.5 truncate">
                                <IconMail size={14} className="text-blue-500 dark:text-cyan-400 shrink-0" />
                                <span className="font-semibold truncate">icstconnect@gmail.com</span>
                            </span>
                            <IconCopy size={13} className="text-slate-400 shrink-0" />
                        </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-1 text-center sm:text-left">
                        <span>© {new Date().getFullYear()} ICST Connect • All rights reserved</span>
                        <div className="flex items-center gap-3">
                            <Link to="/courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Courses</Link>
                            <span>•</span>
                            <Link to="/scholarships" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Scholarships</Link>
                            <span>•</span>
                            <Link to="/about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">About Us</Link>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Discount Form Modal */}
            <DiscountForm isOpen={isDiscountFormOpen} onClose={() => setIsDiscountFormOpen(false)} />

            {/* Interactive QR Code Modal */}
            {isQrModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="qr-modal-title"
                >
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsQrModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setIsQrModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close QR dialog"
                        >
                            <IconX size={20} />
                        </button>

                        <div className="space-y-1 pt-2">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                                <IconQrcode size={22} />
                            </div>
                            <h3 id="qr-modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
                                Scan to Connect
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Open camera on your smartphone to instantly access all ICST links & portals.
                            </p>
                        </div>

                        {/* High-Resolution QR Display */}
                        <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 dark:border-cyan-500/30 shadow-inner inline-block">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code linking directly to ICST Connect hub at icstconnect.in/connect"
                                width={240}
                                height={240}
                                className="w-56 h-56 rounded-lg object-contain"
                            />
                        </div>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText('https://icstconnect.in/connect');
                                    showToast('Hub URL copied to clipboard!');
                                }}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <IconCopy size={15} />
                                <span>Copy Link (icstconnect.in/connect)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsQrModalOpen(false)}
                                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Connect;
