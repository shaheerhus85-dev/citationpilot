'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { ActionButton, AuthScreenLoader, FormInput, PageCard } from '@/components/dashboard/ui'
import { signup as signupRequest } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, login } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (isAuthenticated) router.replace('/dashboard')
  }, [hydrated, isAuthenticated, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await signupRequest(formData.email, formData.password, formData.full_name)
      if (response.auto_verified && response.access_token && response.refresh_token && response.user) {
        login(response.user, response.access_token, response.refresh_token)
        toast.success(response.message || 'Account created successfully')
        router.replace('/dashboard')
        return
      }
      if (response.email_delivery === false) {
        toast.error(response.message || 'Account created, but verification email could not be delivered.')
      } else {
        toast.success(response.message || 'Verification email sent')
      }
      router.replace(`/verify-email?user_id=${response.user_id}&email=${encodeURIComponent(formData.email)}`)
    } catch (error) {
      const responseError = error as { response?: { data?: { detail?: string } } }
      toast.error(responseError.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <AuthScreenLoader
        title="Preparing registration"
        description="Checking your current session before opening the sign-up form."
      />
    )
  }
  if (isAuthenticated) {
    return (
      <AuthScreenLoader
        title="Redirecting to dashboard"
        description="Your account session is already active."
      />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 py-12">
      <PageCard className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-slate-950">Create Account</h1>
        <p className="mt-2 text-slate-500">Set up your citation workspace.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormInput label="Full Name" type="text" name="full_name" autoComplete="name" value={formData.full_name} onChange={handleChange} disabled={loading} />
          <FormInput label="Email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required disabled={loading} />
          <FormInput label="Password" type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required disabled={loading} />

          <ActionButton type="submit" disabled={loading} tone="primary" icon={ArrowRight} className="w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </ActionButton>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already registered? <Link href="/login" className="text-sky-600 hover:text-sky-700">Sign in</Link>
        </p>
      </PageCard>
    </div>
  )
}
