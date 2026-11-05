import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

const BASE_URL = process.env.VITE_SITE_URL || 'https://icstconnect.in'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kuqzarcfinpejnjicudr.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8ztuOu77hriT0hGjwkjn5A_SfGVMV5g'

const defaultOrgSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Institute of Computer Science and Technology (ICST) Chowberia',
  alternateName: 'ICST Chowberia',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'Premier institute providing computer education, IT diplomas, coding courses, and government-recognized certifications in Chowberia, West Bengal.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Chowberia',
    addressLocality: 'Bangaon / Chowberia',
    addressRegion: 'West Bengal',
    postalCode: '743273',
    addressCountry: 'IN'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-8158031706',
    contactType: 'admissions',
    email: 'icstconnect@gmail.com',
    availableLanguage: ['English', 'Bengali', 'Hindi']
  },
  sameAs: ['https://www.facebook.com/icstconnect', 'https://www.instagram.com/icstconnect/']
}

// Static public route metadata
const routeMetadata = [
  {
    path: '/',
    title: 'ICST Connect - Computer Science & Technology Institute | Chowberia',
    description:
      'Official student and public portal for ICST Chowberia. Explore certified computer courses, programming diplomas, online tests, and academic scholarships.',
    h1: 'Master Computer Science & Technology Skills at ICST Chowberia',
    shortTitle: 'Home',
    schema: defaultOrgSchema
  },
  {
    path: '/about',
    title: 'About Us - Mission, Leadership & Excellence | ICST Chowberia',
    description:
      'Learn about ICST Chowberia mission, leadership, faculty credentials, certified tech courses, and digital education empowerment in West Bengal.',
    h1: 'About ICST Chowberia - Mission, Leadership & Excellence',
    shortTitle: 'About Us',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About ICST Chowberia',
      description: 'Mission, vision, faculty, and educational impact of ICST Chowberia.',
      mainEntity: defaultOrgSchema
    }
  },
  {
    path: '/courses',
    title: 'Computer Courses & Professional IT Diplomas | ICST Chowberia',
    description:
      'Explore certified computer courses at ICST Chowberia: ADCA, DCA, DITA, Python, Java, Full Stack Web Development, Financial Accounting, and Cyber Security.',
    h1: 'Explore Our Certified Computer Courses & Diplomas',
    shortTitle: 'Courses',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'ICST Chowberia Course Catalog',
      description: 'Certified diploma and certificate programs in computer technology and software development.',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Adv Diploma in Comp App (ADCA)' },
        { '@type': 'ListItem', position: 2, name: 'Diploma in IT Application (DITA)' },
        { '@type': 'ListItem', position: 3, name: 'Full Stack Web Development' },
        { '@type': 'ListItem', position: 4, name: 'Diploma in Cyber Security (DCSEH)' }
      ]
    }
  },
  {
    path: '/scholarships',
    title: 'Merit Scholarships & Talent Search Results | ICST Chowberia',
    description:
      'Discover ICST Chowberia Talent Search scholarships, position holders, merit awards, and academic fee discount programs for deserving students.',
    h1: 'Honoring Academic Excellence & Future Leaders - ICST Scholarships',
    shortTitle: 'Scholarships',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Who is eligible for ICST Talent Search Scholarships?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Students enrolled in secondary or higher education who achieve top percentiles in the annual ICST Talent Search Examination are eligible for tuition fee concessions and merit awards.'
          }
        },
        {
          '@type': 'Question',
          name: 'How can I check ICST scholarship results?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Results and position holder lists are published directly on the ICST Connect Scholarship Portal and notice board annually.'
          }
        }
      ]
    }
  },
  {
    path: '/notifications',
    title: 'Notice Board, Circulars & Academic Updates | ICST Chowberia',
    description:
      'Stay updated with official notices, exam timetables, batch announcements, and institutional circulars from ICST Chowberia.',
    h1: 'Official Notifications & Academic Circulars - ICST Chowberia',
    shortTitle: 'Notice Board',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'ICST Chowberia Notice Board',
      description: 'Official bulletins and academic announcements.'
    }
  },
  {
    path: '/gallery',
    title: 'Campus Moments & Event Gallery | ICST Chowberia',
    description:
      'Browse photos of classroom activities, computer lab sessions, annual celebrations, scholarship distribution, and workshops at ICST Chowberia.',
    h1: 'Campus Life & Event Gallery - ICST Chowberia',
    shortTitle: 'Gallery',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'ICST Chowberia Campus Life Gallery',
      description: 'Photos and event highlights from ICST Chowberia campus.'
    }
  },
  {
    path: '/online-test',
    title: 'Free Online Computer Practice Tests & Quizzes | ICST Chowberia',
    description:
      'Test your knowledge with practice tests in computer fundamentals, programming, web design, and office automation at ICST Chowberia.',
    h1: 'Online Computer Assessment Zone & Practice Tests',
    shortTitle: 'Online Test',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: 'ICST Online Computer Science Assessments',
      description: 'Interactive quizzes in computer fundamentals and programming.'
    }
  },
  {
    path: '/typing-practice',
    title: 'Typing Speed Test & Accuracy Tutor Online | ICST Chowberia',
    description:
      'Practice touch typing with timed tests (10s to 120s), track words per minute (WPM), accuracy, and unlock higher skill tiers at ICST Chowberia.',
    h1: 'Interactive Typing Speed Test & Practice Tutor',
    shortTitle: 'Typing Tutor',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'ICST Interactive Typing Tutor',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All'
    }
  },
  {
    path: '/connect',
    title: 'ICST Ecosystem, Social Hub & Direct Contact | ICST Chowberia',
    description:
      'Connect with ICST Chowberia: quick links, social media channels, discount coupons, companion portals, and direct WhatsApp / phone assistance.',
    h1: 'ICST Connect - Ecosystem & Community Social Hub',
    shortTitle: 'Connect',
    schema: defaultOrgSchema
  }
]

async function fetchSupabaseData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  let courses = []
  let notifications = []

  try {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, course_name, description, duration, fees, category, syllabus')
      .order('id', { ascending: true })
    if (coursesData && coursesData.length > 0) courses = coursesData
  } catch (err) {
    console.warn('[Prerender] Supabase courses fetch error, using fallback:', err.message)
  }

  try {
    const { data: notifData } = await supabase
      .from('notifications')
      .select('id, title, date, message, type')
      .order('created_at', { ascending: false })
      .limit(6)
    if (notifData && notifData.length > 0) notifications = notifData
  } catch (err) {
    console.warn('[Prerender] Supabase notifications fetch error:', err.message)
  }

  if (courses.length === 0) {
    courses = [
      { id: 1, course_name: 'Certificate in C Programming', description: 'Master foundational C programming, syntax, control structures, and pointers.', duration: '6 Months', category: 'Core Programming', syllabus: ['Programming Logic & Flowcharts', 'C Syntax & Variables', 'Control Structures & Loops', 'Arrays & Functions', 'Pointers & Memory'] },
      { id: 20, course_name: 'Full Stack Web Development', description: 'Comprehensive modern web development from HTML/CSS to React and Node.js.', duration: '18 Months', category: 'Web Technologies', syllabus: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js Frontend', 'Node.js & Express', 'PostgreSQL & Databases'] },
      { id: 34, course_name: 'Diploma in IT Application (DITA)', description: 'Diploma course covering office automation, database management, and internet tools.', duration: '12 Months', category: 'Computer Diploma', syllabus: ['Computer Fundamentals', 'MS Word & Excel', 'PowerPoint & Access', 'Internet & Cyber Security'] },
      { id: 48, course_name: 'Adv Diploma in Comp App (ADCA)', description: 'Advanced computer applications with databases, programming, and software projects.', duration: '12 Months', category: 'Advanced Diploma', syllabus: ['Advanced IT Concepts', 'Database Administration', 'Web Design Basics', 'Software Project Lab'] }
    ]
  }

  return { courses, notifications }
}

function cleanBaseTemplate(rawHtml) {
  return rawHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][\s\S]*?>/gi, '')
    .replace(/<meta\s+name=["']robots["'][\s\S]*?>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][\s\S]*?>/gi, '')
    .replace(/<meta\s+property=["']og:[\s\S]*?>/gi, '')
    .replace(/<meta\s+name=["']twitter:[\s\S]*?>/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '')
    .replace(/<div\s+id=["']root["']>[\s\S]*?<\/div>/gi, '<div id="root"></div>')
}

function renderHeader() {
  return `
  <header style="background: #0f172a; color: #f8fafc; padding: 18px 24px; border-bottom: 2px solid #3b82f6;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
      <div>
        <a href="/" style="color: #ffffff; text-decoration: none; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span>ICST Connect</span>
        </a>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Institute of Computer Science &amp; Technology, Chowberia</p>
      </div>
      <nav aria-label="Main Navigation" style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 14px;">
        <a href="/" style="color: #e2e8f0; text-decoration: none;">Home</a>
        <a href="/courses" style="color: #e2e8f0; text-decoration: none;">Courses</a>
        <a href="/about" style="color: #e2e8f0; text-decoration: none;">About</a>
        <a href="/scholarships" style="color: #e2e8f0; text-decoration: none;">Scholarships</a>
        <a href="/notifications" style="color: #e2e8f0; text-decoration: none;">Notifications</a>
        <a href="/gallery" style="color: #e2e8f0; text-decoration: none;">Gallery</a>
        <a href="/online-test" style="color: #e2e8f0; text-decoration: none;">Online Test</a>
        <a href="/typing-practice" style="color: #e2e8f0; text-decoration: none;">Typing Tutor</a>
        <a href="/connect" style="color: #e2e8f0; text-decoration: none;">Contact &amp; Hub</a>
      </nav>
    </div>
  </header>`
}

function renderBreadcrumbs(route, parent) {
  return `
  <nav aria-label="Breadcrumb" style="max-width: 1200px; margin: 20px auto 0 auto; padding: 0 16px; font-size: 13px; color: #64748b;">
    <a href="/" style="color: #2563eb; text-decoration: none;">Home</a>
    ${parent ? ` &gt; <a href="${parent.url}" style="color: #2563eb; text-decoration: none;">${parent.name}</a>` : ''}
    ${route.path !== '/' ? ` &gt; <span style="color: #0f172a; font-weight: 600;">${route.shortTitle || route.h1}</span>` : ''}
  </nav>`
}

function renderFooter() {
  return `
  <footer style="background: #0b1120; color: #94a3b8; padding: 48px 16px 24px 16px; margin-top: 60px; border-top: 1px solid #1e293b; font-size: 14px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 32px;">
      <div>
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px; font-weight: 700;">ICST Chowberia</h3>
        <p style="line-height: 1.6; margin: 0 0 12px 0;">Premier institute providing certified computer training, IT professional diplomas, coding programs, and scholarship initiatives in West Bengal.</p>
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;">Government Recognized Certifications | 100% Practical Lab Training</p>
      </div>
      <div>
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px; font-weight: 700;">Campus Contact</h3>
        <p style="margin: 0 0 8px 0; line-height: 1.5;">Vill &amp; P.O - Chowberia, P.S - Bongaon<br />Dist - North 24 Parganas, West Bengal - 743273</p>
        <p style="margin: 0 0 8px 0;">Phone: <a href="tel:+918158031706" style="color: #60a5fa; text-decoration: none;">+91 8158031706</a></p>
        <p style="margin: 0;">Email: <a href="mailto:icstconnect@gmail.com" style="color: #60a5fa; text-decoration: none;">icstconnect@gmail.com</a></p>
      </div>
      <div>
        <h3 style="color: #ffffff; font-size: 16px; margin-bottom: 12px; font-weight: 700;">Quick Navigation</h3>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
          <li><a href="/courses" style="color: #cbd5e1; text-decoration: none;">All Courses &amp; Diplomas</a></li>
          <li><a href="/online-test" style="color: #cbd5e1; text-decoration: none;">Online Practice Tests</a></li>
          <li><a href="/typing-practice" style="color: #cbd5e1; text-decoration: none;">Typing Speed Tutor</a></li>
          <li><a href="/scholarships" style="color: #cbd5e1; text-decoration: none;">Scholarship Talent Search</a></li>
          <li><a href="/notifications" style="color: #cbd5e1; text-decoration: none;">Academic Notice Board</a></li>
          <li><a href="/gallery" style="color: #cbd5e1; text-decoration: none;">Campus Gallery</a></li>
          <li><a href="/connect" style="color: #cbd5e1; text-decoration: none;">Connect &amp; Directions</a></li>
        </ul>
      </div>
    </div>
    <div style="max-width: 1200px; margin: 36px auto 0 auto; padding-top: 16px; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Institute of Computer Science and Technology (ICST) Chowberia. All rights reserved.</p>
    </div>
  </footer>`
}

function renderSemanticArticle(route, context) {
  const { path } = route

  if (path === '/') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <span style="display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 12px;">ISO 9001:2015 Certified Educational Institution</span>
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Empowering learners with high-impact software engineering skills, recognized IT diplomas, hands-on computer lab training, and merit scholarship programs at Chowberia, North 24 Parganas.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Flagship Computer Courses &amp; Diplomas</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Adv Diploma in Comp App (ADCA)</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">12-Month advanced program covering software fundamentals, databases, programming, web design, and office productivity.</p>
            <a href="/courses" style="color: #2563eb; font-weight: 600; font-size: 14px; text-decoration: none;">View Course Details &rarr;</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Diploma in IT Application (DITA)</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Comprehensive 12-month foundational IT diploma with intensive practical labs in office automation and database tools.</p>
            <a href="/courses" style="color: #2563eb; font-weight: 600; font-size: 14px; text-decoration: none;">View Course Details &rarr;</a>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Full Stack Web Development</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Build modern web apps from ground up using React, JavaScript ES6+, Node.js, and relational database systems.</p>
            <a href="/courses" style="color: #2563eb; font-weight: 600; font-size: 14px; text-decoration: none;">View Course Details &rarr;</a>
          </div>
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Why Study at ICST Chowberia?</h2>
        <ul style="padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          <li><strong>100% Practical Lab Training:</strong> Individual dedicated workstation for every student during every lab class.</li>
          <li><strong>Government Recognized Certification:</strong> Valid across public sector competitive exams and corporate IT companies.</li>
          <li><strong>Free Extra Practice Sessions:</strong> Daily lab practice available Monday to Friday from 10:00 AM to 1:00 PM.</li>
          <li><strong>Free Spoken English Support:</strong> Comprehensive communication classes integrated with IT diploma curriculums.</li>
        </ul>
      </section>
    </article>`
  }

  if (path === '/courses') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Browse our complete catalog of certified computer courses, programming diplomas, financial accounting software, and professional IT certifications at ICST Chowberia.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">All Course Offerings &amp; Specializations</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          ${context.courses.filter(c => c.id !== 69).map(c => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <span style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase;">${c.category || 'Diploma Course'}</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 8px 0;">${c.course_name}</h3>
              <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 12px 0;">${c.description || 'Comprehensive computer training program with certified curriculum.'}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #475569;">
                <span>Duration: ${c.duration || 'Flexible'}</span>
                <a href="/courses/${c.id}" style="color: #2563eb; text-decoration: none;">Syllabus &rarr;</a>
              </div>
            </div>
          `).join('\n')}
        </div>
      </section>

      <section style="margin: 36px 0; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #1e40af; margin-top: 0; margin-bottom: 12px;">Admission Consultation &amp; Seat Booking</h2>
        <p style="font-size: 15px; color: #1e3a8a; line-height: 1.6; margin: 0 0 16px 0;">Have questions about which diploma fits your career aspiration? Contact our academic counseling desk at Chowberia for personalized course guidance.</p>
        <a href="tel:+918158031706" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none;">Call Helpline: +91 8158031706</a>
      </section>
    </article>`
  }

  if (path.startsWith('/courses/')) {
    const course = context.course
    const syllabusList = (course.syllabus && course.syllabus.length > 0)
      ? course.syllabus
      : [
          'Module 1: Computing Fundamentals & Hardware Overview',
          'Module 2: Core Programming Logic & Flowcharts',
          'Module 3: Hands-on Practical Lab Implementation',
          'Module 4: Real-world Software Project Development',
          'Module 5: Final Examination, Viva & Government Certification'
        ]

    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 24px;">
        <span style="display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 10px;">${course.category || 'Professional IT Course'}</span>
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">${course.course_name} - Course Syllabus, Fees &amp; Certification</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; margin: 0;">${course.description || `Certified training program in ${course.course_name} with practical laboratory projects and personal mentorship at ICST Chowberia.`}</p>
      </header>

      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <div>
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Duration</strong>
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">${course.duration || 'Flexible'}</p>
        </div>
        <div>
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Training Mode</strong>
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">100% In-Person Practical Labs</p>
        </div>
        <div>
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Certification</strong>
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">Government Recognized Diploma</p>
        </div>
        <div>
          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Course Fee</strong>
          <p style="font-size: 18px; font-weight: 700; color: #16a34a; margin: 4px 0 0 0;">${course.fees?.total ? `₹${course.fees.total.toLocaleString()}` : 'Affordable Monthly Plan'}</p>
        </div>
      </section>

      <section style="margin: 32px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Curriculum &amp; Detailed Syllabus Modules</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">The curriculum for ${course.course_name} at ICST Chowberia is structured to balance conceptual clarity with hands-on computer lab assignments. Over 70% of class time is dedicated to individual computer practicals.</p>
        <ul style="margin: 16px 0 0 0; padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          ${syllabusList.map(item => `<li><strong>${item}</strong></li>`).join('\n')}
        </ul>
      </section>

      <section style="margin: 32px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Career Pathways &amp; Job Roles</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Completing ${course.course_name} validates your computational knowledge and qualifies you for technical roles across private enterprise and public organizations.</p>
        <ul style="margin: 12px 0 0 0; padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          <li>Software Assistant and Junior Developer roles</li>
          <li>Information Technology &amp; Systems Administrator</li>
          <li>Computer Operator and Office Automation Executive</li>
          <li>Independent Technology Consultant &amp; Freelancer</li>
        </ul>
      </section>

      <section style="margin: 32px 0; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #1e40af; margin-top: 0; margin-bottom: 12px;">Admission Guidance &amp; Course Enrollment</h2>
        <p style="font-size: 15px; color: #1e3a8a; line-height: 1.6; margin: 0 0 16px 0;">Admissions are conducted on a first-come, first-served basis at our Chowberia campus. Every enrolled student receives access to free extra practice classes (Monday to Friday, 10:00 AM - 1:00 PM), course study materials, and personal instructor mentorship.</p>
        <div style="display: flex; flex-wrap: gap; gap: 12px;">
          <a href="tel:+918158031706" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none;">Call Admissions: +91 8158031706</a>
          <a href="/courses" style="display: inline-block; background: #ffffff; color: #1e40af; border: 1px solid #93c5fd; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none;">View All Courses</a>
        </div>
      </section>
    </article>`
  }

  if (path === '/notifications') {
    const notifs = context.notifications && context.notifications.length > 0
      ? context.notifications
      : [
          { title: 'Academic Admissions Open for 2026 Batch', date: 'March 2026', message: 'Enrollment is open for ADCA, DITA, and Web Development diplomas at Chowberia campus.' },
          { title: 'Semester Practical Examination Timetable', date: 'February 2026', message: 'Practical lab exam schedules and hall tickets released for enrolled students.' },
          { title: 'ICST Talent Search Merit Results Announced', date: 'January 2026', message: 'Merit scholarship rank list published. Felicitations to award-winning school participants.' }
        ]

    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Stay informed with verified institutional circulars, examination schedules, batch timetables, scholarship results, and administrative bulletins from the Institute of Computer Science and Technology (ICST) Chowberia.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Latest Notice Board Bulletins</h2>
        <div style="display: grid; gap: 16px;">
          ${notifs.map(n => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase;">Official Notice</span>
                <span style="font-size: 13px; color: #64748b;">${n.date || 'Recent'}</span>
              </div>
              <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">${n.title}</h3>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">${n.message}</p>
            </div>
          `).join('\n')}
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Notice Verification &amp; Office Support</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">For queries regarding circulars, duplicate mark sheet issuance, or roll number verification, please visit the ICST administrative desk at Chowberia campus or reach our staff at +91 8158031706.</p>
      </section>
    </article>`
  }

  if (path === '/gallery') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Explore visual highlights from the Institute of Computer Science and Technology (ICST) Chowberia. From hands-on coding sessions in modern computer laboratories to annual scholarship felicitations and workshops.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Campus Facilities &amp; Event Categories</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">High-Speed Computer Labs</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Dedicated computer workstations, fiber internet connection, modern software stacks, and individual lab terminal access.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Talent Search Felicitations</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Annual merit award ceremonies celebrating meritorious students from participating schools across North 24 Parganas.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Workshops &amp; Seminars</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Technical seminars on cybersecurity hygiene, modern web development frameworks, and digital accounting with Tally.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Campus Life &amp; Celebrations</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Collaborative project showcases, friendly mentorship atmosphere, Saraswati Puja celebrations, and educational seminars.</p>
          </div>
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Schedule an In-Person Campus Tour</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Students and parents are welcome to visit our computer labs and inspect course curriculum in person. Our Chowberia campus is open Monday to Saturday from 9:00 AM to 6:00 PM.</p>
      </section>
    </article>`
  }

  if (path === '/online-test') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Assess and strengthen your digital computing skills with free interactive practice quizzes engineered by ICST faculty. Test your proficiency in computer fundamentals, programming, web design, and office productivity tools.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Practice Assessment Quizzes &amp; Categories</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Computer Fundamentals &amp; OS</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Hardware architecture, memory hierarchies, input/output peripherals, Windows utilities, and file system management.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Office Automation &amp; Spreadsheets</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">MS Word formatting, Excel formulas (VLOOKUP, SUMIFS), pivot tables, and PowerPoint presentation creation.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Programming Languages</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Syntax, loops, conditionals, object-oriented concepts, and functions across C, C++, and Python languages.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Web Technologies &amp; Cyber Safety</h3>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">HTML5 structure, CSS styling, responsive layout principles, browser security, and malware protection.</p>
          </div>
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Assessment Rules &amp; Learning Benchmarks</h2>
        <ul style="padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          <li><strong>Instant Result &amp; Analytics:</strong> Automatic score calculation upon submission with comprehensive feedback.</li>
          <li><strong>Timed Quiz Sessions:</strong> Real-time countdown timer to help you train under actual exam conditions.</li>
          <li><strong>Zero Negative Penalties:</strong> Designed for self-paced evaluation and continuous skill improvement.</li>
          <li><strong>Keyboard Typing Practice:</strong> Pair your quiz preparation with our online <a href="/typing-practice" style="color: #2563eb; font-weight: 600;">Interactive Typing Tutor</a>.</li>
        </ul>
      </section>
    </article>`
  }

  if (path === '/connect') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Welcome to ICST Connect, the institutional hub for the Institute of Computer Science and Technology (ICST) Chowberia. Access direct contacts, social channels, companion tools, and location directions.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Campus Location &amp; Contact Information</h2>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Institute of Computer Science and Technology (ICST) Chowberia</p>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Vill- Chowberia, P.O- Chowberia, P.S- Bongaon<br />
            Dist- North 24 Parganas, West Bengal, PIN - 743273
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 15px;">
            <p style="margin: 0;"><strong>Direct Helpline:</strong> <a href="tel:+918158031706" style="color: #2563eb; text-decoration: none;">+91 8158031706</a></p>
            <p style="margin: 0;"><strong>Email Inquiries:</strong> <a href="mailto:icstconnect@gmail.com" style="color: #2563eb; text-decoration: none;">icstconnect@gmail.com</a></p>
            <p style="margin: 0;"><strong>Office Hours:</strong> Mon – Sat: 9:00 AM – 6:00 PM</p>
          </div>
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Digital Portals &amp; Student Tools</h2>
        <ul style="padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          <li><a href="/courses" style="color: #2563eb; font-weight: 600;">Course Catalog:</a> Complete diploma syllabus and career outcomes.</li>
          <li><a href="/online-test" style="color: #2563eb; font-weight: 600;">Online Assessments:</a> Practice computer quizzes and tests.</li>
          <li><a href="/typing-practice" style="color: #2563eb; font-weight: 600;">Typing Speed Tutor:</a> Measure your typing WPM and accuracy metrics.</li>
          <li><a href="/scholarships" style="color: #2563eb; font-weight: 600;">Scholarship Portal:</a> Talent search results and merit concessions.</li>
        </ul>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Directions &amp; Campus Transit Guide</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Our campus is situated in Chowberia, easily reached by bus or shared auto from Bangaon Railway Station (25 minutes) and Gaighata. Ample parking and friendly assistance available on arrival.</p>
      </section>
    </article>`
  }

  if (path === '/about') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Established to bridge academic computer knowledge with real-world engineering skills, ICST Chowberia delivers industry-aligned technical education in North 24 Parganas.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Our Educational Mission &amp; Vision</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Our mission is to democratize high-quality computer education and modern software engineering skills for students across Chowberia, Bangaon, Gaighata, and surrounding districts. We ensure that every student gains confidence with modern computer hardware, operating systems, coding paradigms, and productivity software.</p>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Faculty Mentorship &amp; Practical Training Pedagogy</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Our instructors are seasoned software practitioners and certified computer educators who provide personalized 1-on-1 guidance during lab hours. With free daily practice sessions, students get unmatched hands-on laboratory time.</p>
      </section>
    </article>`
  }

  if (path === '/scholarships') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Recognizing and supporting academic talent through the annual ICST Talent Search Examination, merit awards, and substantial tuition fee concessions for meritorious candidates.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">ICST Talent Search Examination Overview</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Every year, ICST Chowberia conducts regional talent search examinations in collaboration with local schools to identify exceptional aptitude in mathematics, general science, and digital literacy. Top rankers receive merit certificates, trophies, and full or partial scholarships on professional IT courses.</p>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Scholarship Concessions &amp; Benefits</h2>
        <ul style="padding-left: 20px; line-height: 1.8; color: #334155; font-size: 15px;">
          <li><strong>Rank 1 – 3:</strong> Up to 100% tuition fee waiver on selected computer diploma programs.</li>
          <li><strong>Rank 4 – 10:</strong> 50% tuition fee waiver plus complimentary study materials.</li>
          <li><strong>Merit Certificates:</strong> Official certificates awarded to all qualifying school participants.</li>
        </ul>
      </section>
    </article>`
  }

  if (path === '/typing-practice') {
    return `
    <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 32px;">
        <h1 style="font-size: 34px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0 0 16px 0;">${route.h1}</h1>
        <p style="font-size: 18px; color: #475569; line-height: 1.6; max-width: 900px; margin: 0;">Improve your touch typing speed and accuracy with our interactive typing tutor. Features timed tests (10s, 30s, 60s, 120s), live words per minute (WPM) tracking, and progressive challenge tiers.</p>
      </header>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Typing Speed Benchmarks &amp; Tiers</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Beginner</strong>
            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">0 - 25 WPM</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Intermediate</strong>
            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">26 - 45 WPM</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Professional</strong>
            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">46 - 70 WPM</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Master</strong>
            <p style="font-size: 18px; font-weight: 700; color: #16a34a; margin: 4px 0 0 0;">70+ WPM</p>
          </div>
        </div>
      </section>

      <section style="margin: 36px 0;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Why Master Touch Typing?</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Touch typing is an indispensable core skill for software developers, data entry specialists, copywriters, and office executives. Practicing daily for just 15 minutes increases productivity and reduces keyboard strain.</p>
      </section>
    </article>`
  }

  return `
  <article style="max-width: 1200px; margin: 24px auto; padding: 0 16px; font-family: system-ui, -apple-system, sans-serif;">
    <header style="margin-bottom: 24px;">
      <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">${route.h1}</h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 0;">${route.description}</p>
    </header>
  </article>`
}

export async function prerender() {
  if (!fs.existsSync(distDir)) {
    console.error('[Prerender] dist directory not found. Please run vite build first.')
    return
  }

  const rawTemplate = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')
  const cleanTemplate = cleanBaseTemplate(rawTemplate)
  const { courses, notifications } = await fetchSupabaseData()

  // Build route list strictly for public canonical URLs (excluding thin utility forms like /enroll/:id)
  const allRoutes = [...routeMetadata]

  for (const course of courses) {
    if (!course.id || course.id === 69) continue // exclude dummy test courses
    const courseUrl = `/courses/${course.id}`

    allRoutes.push({
      path: courseUrl,
      title: `${course.course_name} Course Details & Syllabus | ICST Chowberia`,
      description: `Enroll in ${course.course_name} (${course.duration || 'Flexible'}) at ICST Chowberia. ${course.description?.substring(0, 100) || 'Comprehensive computer training with certified diploma.'}`,
      h1: `${course.course_name} - Course Syllabus & Certification`,
      shortTitle: course.course_name,
      parent: { url: '/courses', name: 'Courses' },
      course,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.course_name,
        description: course.description || `${course.course_name} training program at ICST Chowberia.`,
        provider: defaultOrgSchema,
        timeRequired: course.duration ? `P${course.duration.replace(/\D/g, '')}M` : undefined
      }
    })
  }

  console.log(`[Prerender] Generating rich static HTML for ${allRoutes.length} canonical public views (pruned thin enroll forms)...`)

  for (const route of allRoutes) {
    const canonicalUrl = `${BASE_URL}${route.path}`
    const ogImage = `${BASE_URL}/logo.png`

    // Build breadcrumb schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${BASE_URL}/`
        },
        ...(route.parent
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: route.parent.name,
                item: `${BASE_URL}${route.parent.url}`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: route.shortTitle || route.title.split(' - ')[0].split(' | ')[0],
                item: canonicalUrl
              }
            ]
          : route.path !== '/'
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: route.shortTitle || route.title.split(' - ')[0].split(' | ')[0],
                item: canonicalUrl
              }
            ]
          : [])
      ]
    }

    const schemasHtml = `
  <script type="application/ld+json" id="seo-schema-main">
${JSON.stringify(route.schema, null, 2)}
  </script>
  <script type="application/ld+json" id="seo-schema-breadcrumbs">
${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>`

    let html = cleanTemplate

    // 1. Insert title, meta description, canonical, OpenGraph, Twitter, and schemas into <head>
    const headAdditions = `
  <title>${route.title}</title>
  <meta name="description" content="${route.description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="ICST Connect" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="${ogImage}" />
${schemasHtml}
`
    html = html.replace('</head>', `${headAdditions}\n</head>`)

    // 2. Inject rich semantic HTML into <div id="root">
    // This gives crawlers instant rich text and high content-to-code ratio.
    // React's createRoot cleanly takes over the root container upon JS execution.
    const richCrawlableBody = `
  <div class="prerendered-content" style="min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; color: #0f172a;">
    ${renderHeader()}
    ${renderBreadcrumbs(route, route.parent)}
    <main style="flex: 1;">
      ${renderSemanticArticle(route, { courses, notifications, course: route.course })}
    </main>
    ${renderFooter()}
  </div>`

    html = html.replace('<div id="root"></div>', `<div id="root">${richCrawlableBody}</div>`)

    // 3. Write to target directory
    if (route.path === '/') {
      fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8')
    } else {
      const targetDir = path.join(distDir, ...route.path.split('/').filter(Boolean))
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
    }
  }

  console.log(`[Prerender] Successfully generated rich pre-rendered static HTML for all ${allRoutes.length} public routes!`)
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerender().catch(console.error)
}
