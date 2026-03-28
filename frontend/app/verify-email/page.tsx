'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
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
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

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
        if (typeof response?.retry_in_seconds === 'number' && response.retry_in_seconds > 0) {
          setCooldown(response.retry_in_seconds)
        }
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
            Open your email and click the verification link. Check Inbox, Spam, and Promotions folders.
          </p>
          <div className="mt-6">
            <ActionButton
              type="button"
              tone="secondary"
              icon={RefreshCw}
              onClick={handleResend}
              disabled={sending || !email || cooldown > 0}
              className="mx-auto"
            >
              {sending ? 'Resending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
            </ActionButton>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link href="/login" className="text-sky-700 hover:text-sky-800">
              Back to sign in
            </Link>
            <Link href="/register" className="text-slate-500 hover:text-slate-700">
              Use different email
            </Link>
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
        {status === 'error' ? (
          <div className="mt-6 flex items-center justify-center">
            <Link href={`/verify-email?email=${encodeURIComponent(params.get('email') || '')}`} className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800">
              <ArrowLeft className="h-4 w-4" />
              Try resend verification
            </Link>
          </div>
        ) : null}
      </PageCard>
    </div>
  )
}
