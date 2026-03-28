import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

type Role = Database['public']['Enums']['user_role']

interface AuthState {
  user: User | null
  role: Role | null
  setAuth: (user: User | null, role: Role | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setAuth: (user, role) => set({ user, role }),
  clearAuth: () => set({ user: null, role: null }),
}))
