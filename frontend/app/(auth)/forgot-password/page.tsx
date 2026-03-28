'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { AuthPanel } from '@/components/dashboard/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Check your email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPanel
      title="Reset your password"
      description="Enter your account email and we will send password reset guidance when that flow is enabled."
      footer={<Link href="/login" className="font-medium text-sky-700">Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>
    </AuthPanel>
  )
}
