'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
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
  recent_activity: Array<{
    id: number
    directory_name?: string | null
    status: string
  }>
}

export default function AnalyticsPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    api
      .get('/api/v1/dashboard/overview')
      .then((response) => setData(response.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const directoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of data?.recent_activity || []) {
      const name = item.directory_name || 'Unknown directory'
      counts.set(name, (counts.get(name) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]).slice(0, 8)
  }, [data])

  const chartRows = data
    ? [
        { label: 'Submitted', value: data.stats.success_count, color: 'bg-emerald-500' },
        { label: 'Pending', value: data.stats.pending_count + data.stats.in_progress_count, color: 'bg-sky-500' },
        { label: 'Failed', value: data.stats.failed_count, color: 'bg-rose-500' },
        { label: 'Manual', value: data.stats.manual_required, color: 'bg-amber-500' },
      ]
    : []

  const total = chartRows.reduce((sum, row) => sum + row.value, 0)

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading analytics"
      fallbackDescription="Preparing campaign performance metrics."
    >
      <AppShell
        title="Analytics"
        subtitle="High-signal metrics for campaign throughput, failure patterns, and manual review load."
      >
        {loading ? (
          <div className="space-y-6">
            <SkeletonBlock className="h-40" />
            <SkeletonBlock className="h-80" />
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Success Rate', `${Math.round(data.stats.success_rate)}%`],
                ['Total Campaigns', data.stats.total_campaigns],
                ['Total Submissions', data.stats.total_submissions],
                ['Manual Queue Load', data.stats.manual_required],
              ].map(([label, value]) => (
                <PageCard key={String(label)} className="p-6">
                  <div className="text-sm font-medium text-slate-500">{label}</div>
                  <div className="mt-4 text-3xl font-semibold text-slate-950">{value}</div>
                </PageCard>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <PageCard className="p-6">
                <h2 className="text-xl font-semibold text-slate-950">Submission outcome mix</h2>
                <p className="mt-1 text-sm text-slate-500">Current distribution from live dashboard data.</p>
                <div className="mt-6 space-y-4">
                  {chartRows.map((row) => {
                    const percentage = total ? Math.round((row.value / total) * 100) : 0
                    return (
                      <div key={row.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>{row.label}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-3 rounded-full ${row.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </PageCard>

              <PageCard className="p-6">
                <h2 className="text-xl font-semibold text-slate-950">Top active directories</h2>
                <p className="mt-1 text-sm text-slate-500">Recent activity grouped by directory name.</p>
                <div className="mt-5 space-y-3">
                  {directoryBreakdown.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="font-medium text-slate-900">{name}</div>
                      <InfoBadge tone="info">{count} events</InfoBadge>
                    </div>
                  ))}
                  {directoryBreakdown.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No activity yet to chart.</div>
                  ) : null}
                </div>
              </PageCard>
            </div>
          </>
        ) : (
          <PageCard className="p-6 text-sm text-slate-600">Analytics are temporarily unavailable.</PageCard>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
