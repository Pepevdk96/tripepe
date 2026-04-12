// Supabase client using official @supabase/supabase-js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
