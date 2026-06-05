'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, UserProfile, TABLES } from './supabase'

interface User {
  id: string
  name: string
  email: string
  company: string
  plan: string
  role: string
}

interface SignupData {
  name: string
  email: string
  company: string
  password: string
  plan: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin credentials (hardcoded fallback when Supabase not configured)
const ADMIN_EMAIL = 'zhili@phledger.com'
const ADMIN_PASSWORD = 'Lz@77071517'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if Supabase is configured
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Supabase session check
      checkSupabaseSession()
    } else {
      // Fallback: localStorage
      const stored = localStorage.getItem('phledger_user')
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
    }
  }, [])

  async function checkSupabaseSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from(TABLES.profiles)
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          const u: User = {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            company: profile.company || '',
            plan: profile.plan,
            role: profile.role,
          }
          setUser(u)
        }
      }
    } catch (err) {
      console.error('Session check error:', err)
    }
    setLoading(false)
  }

  async function login(email: string, password: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      // Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return false

      const { data: profile } = await supabase
        .from(TABLES.profiles)
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        const u: User = {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          company: profile.company || '',
          plan: profile.plan,
          role: profile.role,
        }
        setUser(u)
        return true
      }
      return false
    } else {
      // Fallback: hardcoded admin + localStorage users
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const u: User = { id: '1', name: 'Zhi Li', email: ADMIN_EMAIL, company: 'PhLedger', plan: 'Abundant', role: 'admin' }
        setUser(u)
        localStorage.setItem('phledger_user', JSON.stringify(u))
        return true
      }
      // Check localStorage signups
      const users = JSON.parse(localStorage.getItem('phledger_users') || '[]')
      const found = users.find((u: any) => u.email === email && u.password === password)
      if (found) {
        const u: User = { id: found.id, name: found.name, email: found.email, company: found.company, plan: found.plan, role: 'user' }
        setUser(u)
        localStorage.setItem('phledger_user', JSON.stringify(u))
        return true
      }
      return false
    }
  }

  async function signup(data: SignupData): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      // Supabase signup
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            company: data.company,
            plan: data.plan,
          }
        }
      })
      if (error) return { success: false, error: error.message }
      if (authData.user) {
        const u: User = { id: authData.user.id, name: data.name, email: data.email, company: data.company, plan: data.plan, role: 'user' }
        setUser(u)
        return { success: true }
      }
      return { success: false, error: 'Signup failed' }
    } else {
      // Fallback: localStorage
      const users = JSON.parse(localStorage.getItem('phledger_users') || '[]')
      if (users.find((u: any) => u.email === data.email)) {
        return { success: false, error: 'Email already registered' }
      }
      const newUser = { id: Date.now().toString(), ...data }
      users.push(newUser)
      localStorage.setItem('phledger_users', JSON.stringify(users))
      const u: User = { id: newUser.id, name: data.name, email: data.email, company: data.company, plan: data.plan, role: 'user' }
      setUser(u)
      localStorage.setItem('phledger_user', JSON.stringify(u))
      return { success: true }
    }
  }

  async function logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem('phledger_user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
