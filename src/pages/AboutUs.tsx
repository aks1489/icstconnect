import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconTarget as Target,
  IconDeviceLaptop as Laptop,
  IconAward as Award,
  IconMapPin as MapPin,
  IconMail as Mail,
  IconUsers as Users,
  IconChevronDown as ChevronDown,
  IconCertificate as Certificate,
  IconSchool as School,
  IconPhone as Phone
} from '@tabler/icons-react'
import SEOHead from '../components/common/SEOHead'

const faqData = [
  {
    q: 'Are certificates issued by ICST Chowberia government recognized?',
    a: 'Yes, ICST Chowberia provides certified diplomas and certificates recognized for private enterprise employment, competitive application credentials, and technical vocational qualification.'
  },
  {
    q: 'What are the eligibility criteria for enrolling in computer diploma courses?',
    a: 'Courses are structured for diverse levels: basic literacy for certificate courses (Class 8/10+), while advanced programming and cyber security diplomas welcome high school graduates and college students.'
  },
  {
    q: 'Does ICST provide hands-on practical lab facilities?',
    a: 'Absolutely. Every student receives dedicated lab workstation time with modern hardware, high-speed connectivity, and live programming environments under expert faculty mentorship.'
  },
  {
    q: 'How does the scholarship and fee discount program work?',
    a: 'ICST conducts an annual Talent Search Examination. High-performing students receive merit scholarships and tuition concessions. Need-based installment facilities are also supported.'
  }
]

const facultyMembers = [
  {
    name: 'Academic Directorate',
    role: 'Institute Leadership & Curriculum Direction',
    credentials: 'M.Tech / MCA, 15+ Years Industry & Academic Leadership',
    desc: 'Oversees pedagogy, industry curriculum alignment, and technical standards at ICST Chowberia.'
  },
  {
    name: 'Senior Software Faculty',
    role: 'Head of Programming & Web Technologies',
    credentials: 'B.Tech CS, Full Stack Engineer & Corporate Trainer',
    desc: 'Mentors students in Python, Java, React, database design, and modern web application development.'
  },
  {
    name: 'IT Applications & Automation Lead',
    role: 'Senior Instructor, Diploma & Professional Programs',
    credentials: 'Certified Professional Accountant & DTP Specialist',
    desc: 'Guides foundational computer literacy, advanced financial accounting (Tally Prime), and digital documentation.'
  }
]

const AboutUs: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <>
      <SEOHead
        title="About Us - Mission, Leadership & Excellence | ICST Chowberia"
        description="Learn about ICST Chowberia mission, leadership, faculty credentials, certified tech courses, and digital education empowerment in West Bengal."
        canonicalPath="/about"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' }
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqData.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a
            }
          }))
        }}
      />

      <div className="pt-24 pb-16 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 md:px-6 mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">About Us</span>
          </nav>
        </div>

        {/* Header Section */}
        <div className="container mx-auto px-4 md:px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200 dark:border-blue-800">
              <School size={16} />
              <span>Institutional Excellence Since Inception</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              About ICST Chowberia
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
              Institute of Computer Science and Technology (ICST) - Chowberia is committed to empowering students with premier computer education, modern engineering tools, and career-defining technical skills.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="container mx-auto px-4 md:px-6 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Our Mission</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                    To make quality, industry-aligned computer education universally accessible to every aspiring student in Chowberia and neighboring districts. We eliminate digital skill gaps through hands-on practice, personalized mentoring, and ethical professional guidance.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                    <Award size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Our Vision</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                    To stand as the regional benchmark in technical education, celebrated for producing confident problem solvers, certified software specialists, and digitally literate young innovators ready for global opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Curated Lab & Campus Imagery (Zero CLS & Explicit Dimensions) */}
            <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
              <div className="space-y-4 translate-y-6">
                <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="ICST Chowberia classroom seminar and student computer training"
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Interactive laboratory coding discussion and software development"
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Students collaborating on programming projects and technical assignments"
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Instructor assisting students during hands-on IT practical session"
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T: Faculty & Institutional Credibility */}
        <div className="container mx-auto px-4 md:px-6 mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Institutional Leadership & Faculty
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our instructional programs are directed by experienced educators dedicated to student progress and career outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {facultyMembers.map((fac, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    <Certificate size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{fac.name}</h3>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{fac.role}</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 italic">
                    {fac.credentials}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{fac.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose ICST */}
        <div className="bg-white dark:bg-slate-900/60 py-20 mb-20 border-y border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Why Students Trust ICST
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                A structured, outcome-driven learning framework designed for modern technological proficiency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  Icon: Laptop,
                  title: 'State-of-the-Art Labs',
                  description:
                    'Dedicated computer terminals, modern operating systems, high-speed fiber internet, and industry software.'
                },
                {
                  Icon: Users,
                  title: 'Personalized Mentorship',
                  description:
                    'Small batch sizes ensure every student receives one-on-one code reviews and customized doubt clearing.'
                },
                {
                  Icon: Award,
                  title: 'Verified Certifications',
                  description:
                    'Recognized diploma certificates with verifiable credentials for employment and competitive admissions.'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-slate-900 dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6">
                    <feature.Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section with JSON-LD Sync */}
        <div className="container mx-auto px-4 md:px-6 mb-20 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
              Common questions from prospective students and parents about admissions, courses, and certifications.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-base">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform duration-200 ${openFaq === index ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Admission CTA */}
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Start Your Tech Career at ICST
              </h2>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                Admissions are open for new academic batches. Visit our campus in Chowberia or apply online to reserve your seat today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-400" />
                  <span>Chowberia, West Bengal, 743290</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-indigo-400" />
                  <a href="tel:+918158031706" className="text-slate-300 hover:text-white no-underline">
                    +91 8158031706
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-indigo-400" />
                  <a href="mailto:icstconnect@gmail.com" className="text-slate-300 hover:text-white no-underline">
                    icstconnect@gmail.com
                  </a>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  to="/courses"
                  className="px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all shadow-md no-underline"
                >
                  Explore Course Catalog
                </Link>
                <Link
                  to="/connect"
                  className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md no-underline"
                >
                  Connect With Admissions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AboutUs
