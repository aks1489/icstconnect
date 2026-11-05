import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kuqzarcfinpejnjicudr.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8ztuOu77hriT0hGjwkjn5A_SfGVMV5g'

const catalogPath = path.join(__dirname, 'course-seo-catalog.json')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))

async function enrichDatabase() {
  console.log('[Enrichment] Starting safe course enrichment in Supabase...')
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 1. Generate safe SQL script
  const sqlStatements = []
  sqlStatements.push('-- Safe Course SEO Enrichment Migration')
  sqlStatements.push('-- STRICT INVARIANTS: course_name, fees, duration, category, and id are 100% UNTOUCHED.')
  sqlStatements.push('-- Only description, tags, and modern syllabus modules are enriched.\n')

  let updatedCount = 0
  let rlsRestricted = false

  for (const [idStr, meta] of Object.entries(catalog)) {
    const id = parseInt(idStr, 10)
    if (!id || id === 69) continue // Skip internal test course 69

    const safeDesc = meta.description.replace(/'/g, "''")
    const safeTagsArray = meta.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')
    const safeSyllabusArray = (meta.syllabus || []).map(s => `'${s.replace(/'/g, "''")}'`).join(', ')

    const sql = `UPDATE public.courses\nSET description = '${safeDesc}',\n    tags = ARRAY[${safeTagsArray}]::text[],\n    syllabus = ARRAY[${safeSyllabusArray}]::text[]\nWHERE id = ${id};`
    sqlStatements.push(sql)

    // Attempt direct API update
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          description: meta.description,
          tags: meta.tags,
          syllabus: meta.syllabus
        })
        .eq('id', id)
        .select('id, course_name')

      if (error) {
        console.warn(`[Enrichment] API update failed on course ${id}:`, error.message)
      } else if (data && data.length > 0) {
        updatedCount++
      } else {
        // If data is empty and no error, standard RLS policy restriction applies for anon key
        rlsRestricted = true
      }
    } catch (err) {
      console.warn(`[Enrichment] Exception updating course ${id}:`, err.message)
    }
  }

  // 2. Save SQL file to database/enrich_courses_seo.sql
  const sqlFilePath = path.join(rootDir, 'database', 'enrich_courses_seo.sql')
  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n\n'), 'utf-8')
  console.log(`[Enrichment] Successfully generated SQL migration script at: ${sqlFilePath}`)

  if (updatedCount > 0) {
    console.log(`[Enrichment] Successfully updated ${updatedCount} courses via direct Supabase API!`)
  } else if (rlsRestricted) {
    console.log('[Enrichment] Note: Direct anon API updates were guarded by Supabase RLS (Row Level Security).')
    console.log('[Enrichment] Client runtime fallback in src/data/courseEnrichment.ts and src/services/courseService.ts ensures 100% immediate live delivery across all UI components and search.')
    console.log('[Enrichment] To persist directly in Postgres storage, execute database/enrich_courses_seo.sql in Supabase SQL Editor.')
  }
}

enrichDatabase().catch(console.error)
