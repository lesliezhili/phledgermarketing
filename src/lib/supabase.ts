import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dtfbcvefttirngkjuqvl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null

export function getSupabase() {
  if (!supabaseAnonKey) return null
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _supabase
}

// Safe proxy — won't throw at build time when key isn't set
const noopAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
  signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

const noopFrom = () => ({
  select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }),
  insert: async () => ({ data: null, error: null }),
  update: () => ({ eq: async () => ({ data: null, error: null }) }),
  delete: () => ({ eq: async () => ({ data: null, error: null }) }),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase()
    if (!client) {
      if (prop === 'auth') return noopAuth
      if (prop === 'from') return noopFrom
      return () => {}
    }
    return client[prop]
  },
})

// ============================================================
// Table names (dm_ prefixed in public schema)
// ============================================================
export const TABLES = {
  profiles: 'dm_profiles',
  services: 'dm_services',
  bookings: 'dm_bookings',
  feedback: 'dm_feedback',
  payments: 'dm_payments',
  campaigns: 'dm_campaigns',
  bible_verses: 'dm_bible_verses',
  audit_trail: 'dm_audit_trail',
} as const

// ============================================================
// Types
// ============================================================
export interface UserProfile {
  id: string
  email: string
  full_name: string
  company?: string
  plan: 'grace' | 'faithful' | 'abundant'
  role: 'user' | 'admin'
  country?: string
  language?: string
  created_at: string
}

export interface Service {
  id: string
  platform: string
  name: string
  description: string
  price: number
  tier: string
  icon: string
  is_active: boolean
  sort_order: number
}

export interface Booking {
  id: string
  user_id: string
  service_name: string
  platform: string
  booking_date: string
  booking_time: string
  total: number
  status: string
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  service_name: string
  platform: string
  rating: number
  review: string
  bible_impact: boolean
  created_at: string
}
