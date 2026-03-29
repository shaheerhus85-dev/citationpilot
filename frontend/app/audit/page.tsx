'use client'

import { useState } from 'react'
import { SearchCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, CardHeader, EmptyState, FormInput, InfoBadge, PageCard, ProtectedRoute } from '@/components/dashboard/ui'
import { buildApiUrl } from '@/lib/env'
import { useAuthStore } from '@/lib/store'

type AuditResponse = {
  business_name: string
  found_count: number
  missing_count: number
  inconsistency_count: number
  found_listings: string[]
  missing_opportunities: string[]
  inconsistencies: string[]
  competitor_signals: string[]
  recommendations: string[]
}

export default function AuditPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResponse | null>(null)
  const [formData, setFormData] = useState({
    business_name: '',
    website: '',
    category: '',
    country: '',
  })

  async function handleAudit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(buildApiUrl('/api/v1/audit/run'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to run audit')
      setResult(await response.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Audit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading audit tool"
      fallbackDescription="Loading your citation audit tool securely..."
    >
      <AppShell
        title="Citation Audit"
        subtitle="Run a one-click scan to review current citations, gaps, and NAP consistency."
      >
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <PageCard className="p-6">
            <form onSubmit={handleAudit} className="space-y-4">
              <FormInput label="Business name" value={formData.business_name} onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))} required />
              <FormInput label="Website" value={formData.website} onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))} />
              <FormInput label="Category" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} />
              <FormInput label="Country" value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} />
              <ActionButton type="submit" tone="primary" icon={SearchCheck} className="w-full" disabled={loading}>
                {loading ? 'Scanning...' : 'Audit my business'}
              </ActionButton>
            </form>
          </PageCard>

          {result ? (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-3">
                <PageCard className="p-5"><div className="text-sm text-slate-500">Found citations</div><div className="mt-2 text-3xl font-bold text-slate-950">{result.found_count}</div></PageCard>
                <PageCard className="p-5"><div className="text-sm text-slate-500">Missing opportunities</div><div className="mt-2 text-3xl font-bold text-slate-950">{result.missing_count}</div></PageCard>
                <PageCard className="p-5"><div className="text-sm text-slate-500">NAP inconsistencies</div><div className="mt-2 text-3xl font-bold text-slate-950">{result.inconsistency_count}</div></PageCard>
              </section>

              <PageCard className="p-6">
                <CardHeader title="Missing opportunities" />
                <div className="flex flex-wrap gap-2">
                  {result.missing_opportunities.map((item) => <InfoBadge key={item} tone="warning">{item}</InfoBadge>)}
                </div>
              </PageCard>

              <PageCard className="p-6">
                <CardHeader title="Found citations" />
                <div className="space-y-2 text-sm text-slate-600">
                  {result.found_listings.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3">{item}</div>)}
                </div>
              </PageCard>

              <PageCard className="p-6">
                <CardHeader title="Recommendations" />
                <div className="space-y-2 text-sm text-slate-600">
                  {result.recommendations.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-3">{item}</div>)}
                </div>
              </PageCard>
            </div>
          ) : (
            <EmptyState title="No audit yet" description="Enter business details and run an audit to view listings, gaps, and recommendations." />
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}
