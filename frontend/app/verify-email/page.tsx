'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { AuthScreenLoader, PageCard } from '@/components/dashboard/ui'
import { verifyEmail } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')

  useEffect(() => {
    const userId = params.get('user_id')
    const token = params.get('token')
    if (!userId) {
      setStatus('error')
      return
    }

    if (!token) {
      setStatus('pending')
      return
    }

    verifyEmail(userId, token)
      .then((data) => {
        login(data.user, data.access_token, data.refresh_token)
        setStatus('success')
        toast.success('Email verified successfully')
        window.setTimeout(() => router.replace('/dashboard'), 1000)
      })
      .catch(() => {
        setStatus('error')
        toast.error('Verification failed')
      })
  }, [login, params, router])

  if (status === 'loading') {
    return <AuthScreenLoader title="Verifying your email" description="Please wait while we activate your account." />
  }

  if (status === 'pending') {
    const email = params.get('email')
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
        <PageCard className="w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Verify your email to continue</h1>
          <p className="mt-3 text-sm text-slate-500">
            {email ? `We sent a verification link to ${email}.` : 'We sent a verification link to your inbox.'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Open your email and click the verification link. This page will work automatically when opened from that
            link.
          </p>
        </PageCard>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <PageCard className="w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">
          {status === 'success' ? 'Verification complete' : 'Verification failed'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {status === 'success'
            ? 'Redirecting to your dashboard.'
            : 'The verification link is invalid or expired.'}
        </p>
      </PageCard>
    </div>
  )
}
