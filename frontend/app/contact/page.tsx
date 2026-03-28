'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import api from '@/lib/api'

type ContactFormState = {
  name: string
  email: string
  subject: string
  message: string
}

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await api.post('/api/v1/contact/', formData, {
        headers: { 'x-silent-error': '1' },
      })
      toast.success(response.data?.message || 'Email sent successfully!')
      setFormData(initialFormState)
    } catch {
      toast.error('Failed to send. Please email shaheerhus85@gmail.com directly')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_40%,#eef2f7_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Local SEO Citation
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
              Sign In
            </Link>
            <Link href="/register" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Contact</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">Send a production issue or onboarding request.</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              This form sends a real email through the backend contact endpoint. If delivery fails, we tell you directly.
            </p>
          </div>

          <div className="mt-10 rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] sm:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" value={formData.name} onChange={(value) => setFormData((current) => ({ ...current, name: value }))} />
                <Field label="Email" type="email" value={formData.email} onChange={(value) => setFormData((current) => ({ ...current, email: value }))} />
              </div>
              <Field label="Subject" value={formData.subject} onChange={(value) => setFormData((current) => ({ ...current, subject: value }))} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />
    </label>
  )
}
