'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { EmptyState, InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

interface SubmissionRequest {
  id: number
  requested_count: number
  status: string
  progress_percentage: number
  created_at: string
  completed_at?: string
  business_profile_id: number
}

export default function SubmissionsPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [submissions, setSubmissions] = useState<SubmissionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      void fetchSubmissions()
    }
  }, [hydrated, isAuthenticated])

  async function fetchSubmissions() {
    try {
      const response = await api.get('/campaigns')
      setSubmissions(response.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading campaigns"
      fallbackDescription="Loading your campaigns securely..."
    >
      <AppShell
        title="Campaigns"
        subtitle="Review all citation submission runs in the same structured, light-theme operator dashboard."
      >
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-56" />
            <SkeletonBlock className="h-56" />
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState title="No campaigns found yet" description="Launch a new citation campaign and the results will appear here." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {submissions.map((submission) => (
              <Link key={submission.id} href={`/campaigns/${submission.id}`} className="block">
                <PageCard className="p-6 transition hover:-translate-y-0.5 hover:border-sky-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Campaign #{submission.id}</h2>
                      <p className="mt-2 text-sm text-slate-500">Started {new Date(submission.created_at).toLocaleString()}</p>
                      <p className="mt-4 text-slate-700">{submission.requested_count} citations requested</p>
                      <p className="mt-1 text-sm text-slate-400">Business ID: {submission.business_profile_id}</p>
                    </div>
                    <InfoBadge tone={submission.status === 'completed' ? 'success' : submission.status === 'pending' ? 'neutral' : 'info'}>
                      {submission.status.replace(/_/g, ' ')}
                    </InfoBadge>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${submission.progress_percentage}%` }} />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>Open full details</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </PageCard>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
