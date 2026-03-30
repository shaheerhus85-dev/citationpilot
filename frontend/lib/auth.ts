'use client'

import api from '@/lib/api'

const ACCESS_TOKEN_KEY = 'access_token'
const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAuthToken(accessToken: string, refreshToken: string, user?: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function signup(email: string, password: string, fullName: string) {
  const { data } = await api.post('/auth/signup', {
    email,
    password,
    full_name: fullName,
  })
  return data
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  setAuthToken(data.access_token, data.refresh_token, data.user)
  return data
}

export async function verifyEmail(userId: string, token: string) {
  const { data } = await api.post('/auth/verify-email', {
    user_id: Number(userId),
    token,
  })
  setAuthToken(data.access_token, data.refresh_token, data.user)
  return data
}

export async function resendVerification(email: string) {
  const { data } = await api.post('/auth/resend-verification', { email })
  return data
}

export function logout() {
  clearAuthToken()
  if (typeof window !== 'undefined') window.location.href = '/'
}
