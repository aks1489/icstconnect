import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const BASE_URL = process.env.VITE_SITE_URL || 'https://icstconnect.com'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kuqzarcfinpejnjicudr.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8ztuOu77hriT0hGjwkjn5A_SfGVMV5g'

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/courses', priority: '0.9', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/scholarships', priority: '0.8', changefreq: 'weekly' },
  { url: '/notifications', priority: '0.8', changefreq: 'daily' },
  { url: '/gallery', priority: '0.8', changefreq: 'weekly' },
  { url: '/online-test', priority: '0.8', changefreq: 'weekly' },
  { url: '/typing-practice', priority: '0.7', changefreq: 'monthly' },
  { url: '/connect', priority: '0.7', changefreq: 'monthly' }
]

async function getPublishedCourses() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase.from('courses').select('id, course_name').order('id', { ascending: true })
    if (error) throw error
    if (data && data.length > 0) return data
  } catch (err) {
    console.warn('[Sitemap] Supabase courses fetch error, using fallback course list:', err.message)
  }

  // Fallback course IDs
  return [
    { id: 1, course_name: 'Core Programming' },
    { id: 20, course_name: 'Full Stack Web Development' },
    { id: 34, course_name: 'Diploma in IT Application (DITA)' },
    { id: 36, course_name: 'Diploma in Comp Application (DCA)' },
    { id: 38, course_name: 'Diploma in Web Designing (DWD)' },
    { id: 46, course_name: 'Diploma in Cyber Security (DCSEH)' },
    { id: 48, course_name: 'Adv Diploma in Comp App (ADCA)' }
  ]
}

export async function generateSitemap() {
  const courses = await getPublishedCourses()
  const today = new Date().toISOString().split('T')[0]

  let urlsXml = staticRoutes
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n')

  const dynamicCourseUrls = courses
    .filter((c) => c.id && c.id !== 69) // exclude dummy test courses
    .map(
      (c) => `  <url>
    <loc>${BASE_URL}/courses/${c.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/enroll/${c.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n')

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
${dynamicCourseUrls}
</urlset>
`

  // Write to public/sitemap.xml
  const publicDir = path.join(rootDir, 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8')
  console.log(`[Sitemap] Generated public/sitemap.xml with ${staticRoutes.length + courses.length * 2} URLs`)

  // Also write to dist/sitemap.xml if dist directory exists
  const distDir = path.join(rootDir, 'dist')
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent, 'utf-8')
    console.log(`[Sitemap] Copied to dist/sitemap.xml`)
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap().catch(console.error)
}
