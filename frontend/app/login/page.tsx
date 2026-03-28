'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { ActionButton, AuthPanel, AuthScreenLoader, FormInput } from '@/components/dashboard/ui'
import { login as loginRequest } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [hydrated, isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await loginRequest(email, password)
      login(response.user, response.access_token, response.refresh_token)
      toast.success('Signed in successfully')
      router.replace('/dashboard')
    } catch (error: any) {
      const detail = String(error?.response?.data?.detail || 'Login failed')
      if (detail.toLowerCase().includes('email verification required')) {
        toast.error('Please verify your email first')
        router.replace(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  if (isBootstrapping || !hydrated) {
    return (
      <AuthScreenLoader
        title="Loading secure sign in"
        description="Checking for an existing session before showing your login form."
      />
    )
  }

  if (isAuthenticated) {
    return (
      <AuthScreenLoader
        title="Taking you to your dashboard"
        description="Your account is already active. Redirecting now."
      />
    )
  }

  return (
    <AuthPanel
      title="Sign In"
      description="Access your citation dashboard with your secure account session."
      footer={
        <>
          No account?{' '}
          <Link href="/register" className="font-medium text-[#2563eb] transition hover:text-[#1d4ed8]">
            Register here
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        <FormInput label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        <ActionButton type="submit" disabled={loading} tone="primary" icon={ArrowRight} className="w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </ActionButton>
      </form>
    </AuthPanel>
  )
}
