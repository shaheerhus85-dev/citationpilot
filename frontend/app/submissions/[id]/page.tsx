'use client'

import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import Link from 'next/link'

import { CampaignProgress } from '@/components/campaigns/CampaignProgress'
import { AppShell } from '@/components/dashboard/app-shell'
import { InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type CampaignDetails = {
  campaign: {
    id: number
    name: string
    status: string
    progress_percentage: number
    success_rate: number
  }
  stats: {
    total: number
    submitted: number
    pending: number
    in_progress: number
    failed: number
    manual_required: number
  }
  submissions: Array<{
    id: number
    directory_name: string
    directory_url: string
    status: string
    submitted_at?: string | null
    error?: string | null
  }>
}

function badgeTone(status: string) {
  if (status === 'submitted' || status === 'completed') return 'success'
  if (status === 'failed') return 'error'
  if (status === 'manual_required') return 'warning'
  return 'info'
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const campaignId = params.id
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [details, setDetails] = useState<CampaignDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleRows, setVisibleRows] = useState(20)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadDetails = () => {
    api
      .get(`/api/v1/campaigns/${campaignId}/details`)
      .then((response) => setDetails(response.data))
      .catch(() => toast.error('Failed to load campaign details'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !campaignId) return
    loadDetails()
  }, [hydrated, isAuthenticated, campaignId])

  useEffect(() => {
    if (!details || details.stats.pending <= 0) return
    const intervalId = window.setInterval(loadDetails, 15000)
    return () => window.clearInterval(intervalId)
  }, [details])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleRows((count) => count + 20)
      }
    })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  const rows = useMemo(() => details?.submissions.slice(0, visibleRows) ?? [], [details, visibleRows])

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading campaign"
      fallbackDescription="Fetching live campaign progress."
    >
      <AppShell
        title={details?.campaign.name || `Campaign #${campaignId}`}
        subtitle="Progress updates every 15 seconds while work remains pending."
        actions={
          details && details.stats.manual_required > 0 ? (
            <Link href="/manual-queue" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              View Manual Queue
            </Link>
          ) : null
        }
      >
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-48" />
            <SkeletonBlock className="h-96" />
          </div>
        ) : details ? (
          <>
            <PageCard className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Campaign progress</h2>
                  <p className="mt-1 text-sm text-slate-500">Live submission totals from the backend campaign detail API.</p>
                </div>
                <InfoBadge tone={badgeTone(details.campaign.status)}>{details.campaign.status.replace(/_/g, ' ')}</InfoBadge>
              </div>
              <div className="mt-6">
                <CampaignProgress
                  total={details.stats.total}
                  submitted={details.stats.submitted}
                  failed={details.stats.failed}
                  manualRequired={details.stats.manual_required}
                  pending={details.stats.pending + details.stats.in_progress}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['Total', details.stats.total],
                  ['Submitted', details.stats.submitted],
                  ['Pending', details.stats.pending],
                  ['Failed', details.stats.failed],
                  ['Manual', details.stats.manual_required],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-3xl bg-slate-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{value}</div>
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard className="overflow-hidden p-0">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Submissions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Directory Name</th>
                      <th className="px-6 py-4 font-medium">URL</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Submitted At</th>
                      <th className="px-6 py-4 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((submission) => (
                      <tr key={submission.id} className="border-t border-slate-100 align-top">
                        <td className="px-6 py-4 font-medium text-slate-900">{submission.directory_name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <a href={submission.directory_url} target="_blank" rel="noreferrer" className="break-all hover:text-slate-900">
                            {submission.directory_url}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={submission.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'Not submitted yet'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{submission.error || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div ref={sentinelRef} className="h-4" />
              </div>
            </PageCard>
          </>
        ) : (
          <PageCard className="p-6 text-sm text-slate-600">Campaign details are temporarily unavailable.</PageCard>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className = {
    submitted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    failed: 'border-rose-200 bg-rose-50 text-rose-700',
    pending: 'border-slate-200 bg-slate-100 text-slate-700',
    in_progress: 'border-sky-200 bg-sky-50 text-sky-700 animate-pulse',
    manual_required: 'border-amber-200 bg-amber-50 text-amber-700',
  }[status] || 'border-slate-200 bg-slate-100 text-slate-700'

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}>{status.replace(/_/g, ' ')}</span>
}
