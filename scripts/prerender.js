import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

const BASE_URL = process.env.VITE_SITE_URL || 'https://icstconnect.com'
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
    postalCode: '743290',
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

const routeMetadata = [
  {
    path: '/',
    title: 'ICST Connect - Computer Science & Technology Institute | Chowberia',
    description:
      'Official student and public portal for ICST Chowberia. Explore certified computer courses, programming diplomas, online tests, and academic scholarships.',
    h1: 'Master Computer Science & Technology Skills at ICST Chowberia',
    content:
      'Premier computer science education, IT diplomas, programming frameworks, and industry certifications at ICST Chowberia. Equip yourself with modern tech skills for higher career success.',
    schema: defaultOrgSchema
  },
  {
    path: '/about',
    title: 'About Us - Mission, Leadership & Excellence | ICST Chowberia',
    description:
      'Learn about ICST Chowberia mission, leadership, faculty credentials, certified tech courses, and digital education empowerment in West Bengal.',
    h1: 'About ICST Chowberia - Mission, Leadership & Excellence',
    content:
      'Established to bridge academic theory and industry engineering, ICST Chowberia provides premier tech education, modern computer labs, and expert mentorship.',
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
    content:
      'Comprehensive computer science courses ranging from 3 to 18 months. Industry certifications, hands-on software development labs, and practical project training.',
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
    content:
      'ICST Connect celebrates top position holders who have achieved remarkable scores in computer technology, mathematics, and digital skills competitions.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Who is eligible for ICST Talent Search Scholarships?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Students enrolled in school or secondary education who achieve top percentiles in the ICST Talent Search Examination are eligible for tuition fee concessions and merit awards.'
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
    content:
      'Live notifications and verified bulletins for enrolled students, faculty, and admission candidates at ICST Chowberia.',
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
    content:
      'Visual chronicles of student life, state-of-the-art computer labs, coding bootcamps, and award ceremonies at ICST Chowberia.',
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
    content:
      'Interactive assessments designed to test theoretical knowledge and practical understanding in computer science, coding, and digital literacy.',
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
    content:
      'Boost your typing speed and keyboard accuracy with our standalone interactive typing tutor. Features real-time WPM, accuracy metrics, and progressive challenge tiers.',
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
    content:
      'Access all digital portals, social media profiles, location maps, student inquiry channels, and educational companion apps within the ICST network.',
    schema: defaultOrgSchema
  }
]

async function fetchCoursesForPrerender() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data } = await supabase.from('courses').select('id, course_name, description, duration, fees, category')
    if (data && data.length > 0) return data
  } catch (err) {
    console.warn('[Prerender] Supabase fetch error, using fallback course list:', err.message)
  }
  return [
    { id: 20, course_name: 'Full Stack Web Development', description: 'Comprehensive modern web development from HTML/CSS to React and Node.js.', duration: '18 Months', category: 'Web Technologies' },
    { id: 34, course_name: 'Diploma in IT Application (DITA)', description: 'Diploma course covering office automation, database management, and internet tools.', duration: '12 Months', category: 'Computer Diploma' },
    { id: 48, course_name: 'Adv Diploma in Comp App (ADCA)', description: 'Advanced computer applications with databases, programming, and software projects.', duration: '12 Months', category: 'Advanced Diploma' }
  ]
}

export async function prerender() {
  if (!fs.existsSync(distDir)) {
    console.error('[Prerender] dist directory not found. Please run vite build first.')
    return
  }

  const templateHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')
  const courses = await fetchCoursesForPrerender()

  // 1. Build static route list including courses
  const allRoutes = [...routeMetadata]

  for (const course of courses) {
    if (!course.id || course.id === 69) continue
    const courseUrl = `/courses/${course.id}`
    const enrollUrl = `/enroll/${course.id}`

    allRoutes.push({
      path: courseUrl,
      title: `${course.course_name} Course Details & Syllabus | ICST Chowberia`,
      description: `Enroll in ${course.course_name} (${course.duration || 'Flexible'}) at ICST Chowberia. ${course.description?.substring(0, 100) || 'Comprehensive computer training with certified diploma.'}`,
      h1: `${course.course_name} - Course Syllabus & Enrollment`,
      content: `Master ${course.course_name} with certified faculty mentors. Duration: ${course.duration || 'Flexible'}. Category: ${course.category || 'Computer Science'}. ${course.description || ''}`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.course_name,
        description: course.description || `${course.course_name} training program at ICST Chowberia.`,
        provider: defaultOrgSchema,
        timeRequired: course.duration ? `P${course.duration.replace(/\D/g, '')}M` : undefined
      }
    })

    allRoutes.push({
      path: enrollUrl,
      title: `Enroll in ${course.course_name} | ICST Chowberia Online Admission`,
      description: `Reserve your seat for ${course.course_name} at ICST Chowberia. Simple online application form with instant registration acknowledgment.`,
      h1: `Admission Application: ${course.course_name}`,
      content: `Complete online registration for ${course.course_name} at ICST Chowberia. Instant confirmation and guidance from our academic counseling team.`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Enroll in ${course.course_name}`,
        description: `Admission application for ${course.course_name} at ICST Chowberia.`
      }
    })
  }

  console.log(`[Prerender] Generating static pre-rendered HTML for ${allRoutes.length} public views...`)

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
        ...(route.path !== '/'
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: route.title.split(' - ')[0].split(' | ')[0],
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

    let html = templateHtml

    // Replace title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${route.title}</title>`)

    // Replace or insert meta description
    if (html.includes('name="description"')) {
      html = html.replace(/<meta name="description"[\s\S]*?>/i, `<meta name="description" content="${route.description}" />`)
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${route.description}" />\n</head>`)
    }

    // Insert canonical, OpenGraph, Twitter, and schemas before </head>
    const headAdditions = `
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

    // Inject semantic crawlable HTML into <div id="root">
    // Using noscript / semantic server-rendered container so crawlers without JS immediately index the content
    // while React seamlessly takes over client hydration
    const crawlableBody = `
    <noscript>
      <header style="padding: 20px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif;">
        <nav aria-label="Breadcrumbs" style="font-size: 14px; margin-bottom: 8px;">
          <a href="/">Home</a> ${route.path !== '/' ? `&gt; <span>${route.title.split(' - ')[0]}</span>` : ''}
        </nav>
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 12px; color: #0f172a;">${route.h1}</h1>
        <p style="font-size: 16px; color: #475569; max-width: 800px; line-height: 1.6;">${route.content}</p>
        <div style="margin-top: 16px; display: flex; gap: 16px;">
          <a href="/courses">All Courses</a> |
          <a href="/about">About Us</a> |
          <a href="/scholarships">Scholarships</a> |
          <a href="/gallery">Gallery</a> |
          <a href="/connect">Contact ICST</a>
        </div>
      </header>
    </noscript>`

    html = html.replace('<div id="root"></div>', `<div id="root">${crawlableBody}</div>`)

    // Determine target directory
    if (route.path === '/') {
      fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8')
    } else {
      const targetDir = path.join(distDir, ...route.path.split('/').filter(Boolean))
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })
      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
    }
  }

  console.log(`[Prerender] Successfully pre-rendered static HTML for all public routes!`)
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prerender().catch(console.error)
}
