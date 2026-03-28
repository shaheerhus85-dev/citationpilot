'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { ActionButton, AuthScreenLoader, PageCard } from '@/components/dashboard/ui'
import { resendVerification, verifyEmail } from '@/lib/auth'
import { useAuthStore } from '@/lib/store'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const userId = params.get('user_id')
    const token = params.get('token')
    const email = params.get('email')

    // Support both URL shapes:
    // 1) verify link from email: ?user_id=...&token=...
    // 2) pending screen from auth flow: ?email=...
    if (!userId || !token) {
      if (email || userId) {
        setStatus('pending')
      } else {
        setStatus('error')
      }
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

    async function handleResend() {
      if (!email) {
        toast.error('Email is required to resend verification')
        return
      }
      setSending(true)
      try {
        const response = await resendVerification(email)
        if (response?.email_delivery === false) {
          toast.error(response?.message || 'Could not send verification email right now')
        } else {
          toast.success(response?.message || 'Verification email sent')
        }
      } catch (error: any) {
        const detail = String(error?.response?.data?.detail || 'Failed to resend verification email')
        toast.error(detail)
      } finally {
        setSending(false)
      }
    }

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
          <div className="mt-6">
            <ActionButton
              type="button"
              tone="secondary"
              icon={RefreshCw}
              onClick={handleResend}
              disabled={sending || !email}
              className="mx-auto"
            >
              {sending ? 'Resending...' : 'Resend verification email'}
            </ActionButton>
          </div>
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
