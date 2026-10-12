import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kuqzarcfinpejnjicudr.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8ztuOu77hriT0hGjwkjn5A_SfGVMV5g'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('courses').select('id, course_name, category, duration')
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Courses count:', data?.length)
    console.log('Courses:', JSON.stringify(data, null, 2))
  }
}

run()
