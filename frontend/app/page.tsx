'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type Snapshot = {
  total_campaigns: number
  total_submissions: number
  success: number
  pending: number
  in_progress: number
  failed: number
  manual_required: number
  latest_campaign?: {
    id: number
    business_name?: string | null
    status: string
    requested_count: number
    progress_percentage: number
    success_rate: number
  } | null
}

const features = [
  {
    title: 'Tiered directory routing',
    description: 'Campaigns prioritize tier 1 directories first, then fill with tier 2 and tier 3 sources.',
  },
  {
    title: 'Live campaign tracking',
    description: 'Every submission row updates with pending, in progress, submitted, failed, and manual-required status.',
  },
  {
    title: 'Manual exception handling',
    description: 'CAPTCHA and challenge pages are detected early and safely routed for manual review.',
  },
]

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hydrated = useAuthStore((state) => state.hydrated)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    setLoading(true)
    api
      .get('/api/v1/dashboard/snapshot')
      .then((response) => setSnapshot(response.data))
      .catch(() => setSnapshot(null))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_42%,#eef2f7_100%)] text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <section className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="mx-auto w-full max-w-4xl text-center lg:mx-0 lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Professional citation operations</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
              Launch local citation campaigns with real progress visibility.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg">
              Build campaigns from real directories, monitor live submission status, and move manual exceptions into review without losing the audit trail.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/login" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Sign In
              </Link>
              <Link href="/register" className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(37,99,235,0.9)] transition hover:bg-[#1d4ed8]">
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Campaign Snapshot</p>
            {loading ? (
              <div className="mt-6 space-y-3">
                <div className="h-6 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : snapshot?.latest_campaign ? (
              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{snapshot.latest_campaign.business_name || `Campaign #${snapshot.latest_campaign.id}`}</h2>
                  <p className="mt-1 text-sm text-slate-500">{snapshot.latest_campaign.requested_count} directories in the current campaign.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Status</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">{snapshot.latest_campaign.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-950" style={{ width: `${snapshot.latest_campaign.progress_percentage}%` }} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-white p-4">Progress: {Math.round(snapshot.latest_campaign.progress_percentage)}%</div>
                    <div className="rounded-2xl bg-white p-4">Success rate: {Math.round(snapshot.latest_campaign.success_rate)}%</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-slate-50 p-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">No active campaign yet</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Start your first campaign to see live directory progress, submission health, and manual review items here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.24)]">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-8 rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Contact Us</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Need help with onboarding or campaign setup?</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Send a message and the backend contact endpoint will deliver it through Gmail SMTP.
            </p>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" action="/contact">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Your name" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="you@example.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" rows={4} placeholder="Tell us what you need." />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-20px_rgba(37,99,235,0.9)] transition hover:bg-[#1d4ed8]">
                Open Contact Form
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Local SEO Citation SaaS</p>
          <div className="flex gap-5">
            <Link href="/">Home</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
