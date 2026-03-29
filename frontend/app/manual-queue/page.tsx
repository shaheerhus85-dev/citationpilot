'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

import { AppShell } from '@/components/dashboard/app-shell'
import { EmptyState, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import { ManualSubmissionCard } from '@/components/manual/ManualSubmissionCard'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type ManualQueueResponse = {
  total: number
  items: any[]
}

type QueueStats = {
  total_pending: number
  by_captcha_type: Record<string, number>
  estimated_time_minutes: number
}

export default function ManualQueuePage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [queue, setQueue] = useState<ManualQueueResponse>({ total: 0, items: [] })
  const [stats, setStats] = useState<QueueStats | null>(null)

  async function loadQueue() {
    try {
      const [{ data: queueData }, { data: statsData }] = await Promise.all([
        api.get('/submissions/manual-queue'),
        api.get('/submissions/manual-queue/stats'),
      ])
      setQueue(queueData)
      setStats(statsData)
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to load manual queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hydrated && isAuthenticated) void loadQueue()
  }, [hydrated, isAuthenticated])

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return queue.items
    return queue.items.filter((item) => {
      const haystack = [
        item.directory_name,
        item.directory_url,
        item.error_message,
        item.business_data?.business_name,
        item.business_data?.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [query, queue.items])

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading manual queue"
      fallbackDescription="Preparing operator tasks and blocked submissions."
    >
      <AppShell title="Manual Queue" subtitle="Review blocked submissions, generate temp inboxes, and complete operator handoffs.">
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-72" />
            <SkeletonBlock className="h-72" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PageCard className="p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Pending Manual</div>
                <div className="mt-3 text-3xl font-semibold text-slate-950">{stats?.total_pending || 0}</div>
              </PageCard>
              <PageCard className="p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Estimated Time</div>
                <div className="mt-3 text-3xl font-semibold text-slate-950">{stats?.estimated_time_minutes || 0}m</div>
              </PageCard>
              <PageCard className="p-5 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Captcha Breakdown</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats && Object.keys(stats.by_captcha_type).length > 0 ? (
                    Object.entries(stats.by_captcha_type).map(([key, value]) => (
                      <span key={key} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                        {key}: {value}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No breakdown available</span>
                  )}
                </div>
              </PageCard>
            </section>

            <PageCard className="p-5">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by directory, business, URL, or issue"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            </PageCard>

            {filteredItems.length === 0 ? (
              <EmptyState
                title="No manual tasks found"
                description="Either the queue is clear or your current search returned no matches."
              />
            ) : (
              <div className="space-y-6">
                {filteredItems.map((item) => (
                  <ManualSubmissionCard key={item.id} submission={item} onComplete={loadQueue} />
                ))}
              </div>
            )}
          </>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
