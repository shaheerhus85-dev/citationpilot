import axios, { AxiosInstance } from 'axios'
import toast from 'react-hot-toast'

import { API_ROOT } from '@/lib/env'
import { useAuthStore } from '@/lib/store'

export const api: AxiosInstance = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const silentError = String(error?.config?.headers?.['x-silent-error'] || '') === '1'
    const requestUrl = String(error?.config?.url || '')
    const responseDetail = String(error?.response?.data?.detail || '')
    const isAuthRoute = requestUrl.includes('/api/v1/auth/')

    if (!error?.response) {
      if (!silentError) {
        toast.error('Network error while calling API. Please refresh and try again.')
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      const isVerificationBlock = responseDetail.toLowerCase().includes('email verification required')
      if (!silentError && !isAuthRoute && !isVerificationBlock) {
        toast.error('You do not have permission to perform this action')
      }
    } else if (error.response?.status >= 500) {
      if (!silentError) {
        toast.error('Server error. Please try again later.')
      }
    }

    return Promise.reject(error)
  }
)

export default api
