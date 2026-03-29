import { create } from 'zustand'

import api from './api'

export interface User {
  id: number
  email: string
  full_name?: string | null
  is_verified?: boolean
  is_active?: boolean
  created_at?: string
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hydrated: boolean
  isBootstrapping: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  bootstrapAuth: () => Promise<void>
}

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

function isBrowser() {
  return typeof window !== 'undefined'
}

function clearPersistedAuth() {
  if (!isBrowser()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function persistAuth(accessToken: string, refreshToken: string, user: User) {
  if (!isBrowser()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function parseStoredUser(userJson: string | null): User | null {
  if (!userJson) return null
  try {
    return JSON.parse(userJson) as User
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrated: false,
  isBootstrapping: true,
  login: (user, accessToken, refreshToken) => {
    persistAuth(accessToken, refreshToken, user)
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      hydrated: true,
      isBootstrapping: false,
    })
  },
  logout: () => {
    clearPersistedAuth()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hydrated: true,
      isBootstrapping: false,
    })
  },
  setUser: (user) => set({ user }),
  bootstrapAuth: async () => {
    if (!isBrowser()) {
      set({ hydrated: true, isBootstrapping: false })
      return
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const storedUser = parseStoredUser(localStorage.getItem(USER_KEY))
    set({ accessToken, refreshToken, user: storedUser, isBootstrapping: true })

    if (accessToken) {
      try {
        const { data: user } = await api.get('/auth/me')
        persistAuth(accessToken, refreshToken || '', user)
        set({
          user,
          isAuthenticated: true,
          isBootstrapping: false,
          hydrated: true,
        })
      } catch {
        clearPersistedAuth()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isBootstrapping: false,
          hydrated: true,
        })
      }
    } else {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isBootstrapping: false,
        hydrated: true,
      })
    }
  },
}))

interface Submission {
  id: number
  status: 'pending' | 'submitted' | 'failed' | 'manual_required' | 'completed'
  directory_id: number
  timestamp: string
  completed_at?: string
}

interface SubmissionStore {
  submissions: Submission[]
  currentRequest: any | null
  setSubmissions: (submissions: Submission[]) => void
  setCurrentRequest: (request: any) => void
}

export const useSubmissionStore = create<SubmissionStore>((set) => ({
  submissions: [],
  currentRequest: null,
  setSubmissions: (submissions) => set({ submissions }),
  setCurrentRequest: (currentRequest) => set({ currentRequest }),
}))
