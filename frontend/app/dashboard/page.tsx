'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { EmptyState, InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type DashboardOverview = {
  stats: {
    total_campaigns: number
    total_submissions: number
    success_count: number
    pending_count: number
    in_progress_count: number
    failed_count: number
    manual_required: number
    success_rate: number
  }
  recent_campaigns: Array<{
    id: number
    business_name?: string | null
    requested_count: number
    status: string
    progress_percentage: number
    created_at: string
  }>
  recent_activity: Array<{
    id: number
    directory_name?: string | null
    directory_url?: string | null
    status: string
    timestamp: string
    error_message?: string | null
  }>
  recent_attempts: Array<{
    id: number
    submission_id: number
    directory_name?: string | null
    status: string
    captcha_type?: string | null
    resolution_path: string
    retries: number
    outcome: string
    timestamp: string
    error_message?: string | null
  }>
}

const initialData: DashboardOverview = {
  stats: {
    total_campaigns: 0,
    total_submissions: 0,
    success_count: 0,
    pending_count: 0,
    in_progress_count: 0,
    failed_count: 0,
    manual_required: 0,
    success_rate: 0,
  },
  recent_campaigns: [],
  recent_activity: [],
  recent_attempts: [],
}

function toneForStatus(status: string) {
  if (status === 'submitted' || status === 'completed') return 'success'
  if (status === 'failed') return 'error'
  if (status === 'manual_required') return 'warning'
  return 'info'
}

export default function DashboardPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [data, setData] = useState<DashboardOverview>(initialData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return

    let cancelled = false
    const load = async (silent = false) => {
      try {
        const response = await api.get('/dashboard/overview')
        if (!cancelled) setData(response.data)
      } catch {
        if (!silent) toast.error('Failed to load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load(false)
    const interval = window.setInterval(() => {
      void load(true)
    }, 12000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [hydrated, isAuthenticated])

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading dashboard"
      fallbackDescription="Preparing your campaign workspace."
    >
      <AppShell title="Dashboard" subtitle="Real campaign metrics, recent campaigns, and live submission activity from the API.">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-32" />)
            : [
                { label: 'Total Campaigns', value: data.stats.total_campaigns },
                { label: 'Success Rate', value: `${Math.round(data.stats.success_rate)}%` },
                { label: 'Pending', value: data.stats.pending_count + data.stats.in_progress_count },
                { label: 'Manual Required', value: data.stats.manual_required },
              ].map((item) => (
                <PageCard key={item.label} className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{item.value}</div>
                </PageCard>
              ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <PageCard className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Recent campaigns</h2>
                <p className="mt-1 text-sm text-slate-500">Latest campaigns with live progress and status badges.</p>
              </div>
              <Link href="/campaigns" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
              </div>
            ) : data.recent_campaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                description="Create your first campaign to start generating real submission rows."
                action={<Link href="/campaigns/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">New Campaign</Link>}
              />
            ) : (
              <div className="space-y-4">
                {data.recent_campaigns.map((campaign) => (
                  <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{campaign.business_name || `Campaign #${campaign.id}`}</div>
                        <p className="mt-1 text-sm text-slate-500">{campaign.requested_count} directories requested</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {new Date(campaign.created_at).toLocaleString()}
                        </p>
                      </div>
                      <InfoBadge tone={toneForStatus(campaign.status)}>{campaign.status.replace(/_/g, ' ')}</InfoBadge>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${campaign.progress_percentage}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </PageCard>

          <PageCard className="p-6">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Recent submissions</h2>
            <p className="mt-1 text-sm text-slate-500">Latest directory activity with real API-backed statuses.</p>
            {loading ? (
              <div className="mt-5 space-y-3">
                <SkeletonBlock className="h-20" />
                <SkeletonBlock className="h-20" />
                <SkeletonBlock className="h-20" />
              </div>
            ) : data.recent_activity.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">Submission activity appears here once a campaign starts.</div>
            ) : (
              <div className="mt-5 space-y-3">
                {data.recent_activity.map((activity) => (
                  <div key={activity.id} className="rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{activity.directory_name || 'Directory submission'}</div>
                        <div className="mt-1 truncate text-sm text-slate-500">{activity.directory_url || 'URL unavailable'}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                        {activity.error_message ? <div className="mt-2 text-sm text-rose-600">{activity.error_message}</div> : null}
                      </div>
                      <InfoBadge tone={toneForStatus(activity.status)}>{activity.status.replace(/_/g, ' ')}</InfoBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </section>

        <section>
          <PageCard className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Worker monitoring</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Last 20 submission attempts with CAPTCHA path, retries, and outcome.
                </p>
              </div>
              <InfoBadge tone="info">Auto refresh 12s</InfoBadge>
            </div>

            {loading ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-14" />
                <SkeletonBlock className="h-14" />
                <SkeletonBlock className="h-14" />
              </div>
            ) : data.recent_attempts.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                Worker attempts will appear here once processing starts.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      <th className="py-3 pr-4">Directory</th>
                      <th className="py-3 pr-4">CAPTCHA</th>
                      <th className="py-3 pr-4">Resolution</th>
                      <th className="py-3 pr-4">Retries</th>
                      <th className="py-3 pr-4">Outcome</th>
                      <th className="py-3 pr-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recent_attempts.map((attempt) => (
                      <tr key={attempt.id} className="align-top">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{attempt.directory_name || 'Directory'}</div>
                          <div className="text-xs text-slate-500">Submission #{attempt.submission_id}</div>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{attempt.captcha_type || 'none'}</td>
                        <td className="py-3 pr-4">
                          <InfoBadge tone={attempt.resolution_path === 'manual_queue' ? 'warning' : 'info'}>
                            {attempt.resolution_path.replace(/_/g, ' ')}
                          </InfoBadge>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{attempt.retries}</td>
                        <td className="py-3 pr-4">
                          <InfoBadge tone={attempt.outcome === 'submitted' || attempt.outcome === 'completed' || attempt.outcome === 'success' ? 'success' : attempt.outcome === 'manual_required' ? 'warning' : 'error'}>
                            {attempt.outcome.replace(/_/g, ' ')}
                          </InfoBadge>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{new Date(attempt.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PageCard>
        </section>
      </AppShell>
    </ProtectedRoute>
  )
}
