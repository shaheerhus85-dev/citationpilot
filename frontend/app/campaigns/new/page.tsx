'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { DirectorySelector } from '@/components/campaigns/DirectorySelector'
import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, FormInput, InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type BusinessProfile = {
  id: number
  business_name: string
  category: string
  country: string
  website?: string | null
}

export default function CampaignCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState(searchParams.get('business') || '')
  const [campaignName, setCampaignName] = useState('')
  const [targetCountry, setTargetCountry] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    api
      .get('/businesses')
      .then((response) => {
        setBusinesses(response.data)
        if (!selectedBusinessId && response.data.length > 0) {
          setSelectedBusinessId(String(response.data[0].id))
          setTargetCountry(response.data[0].country || '')
        }
      })
      .catch(() => toast.error('Failed to load businesses'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated, selectedBusinessId])

  const selectedBusiness = useMemo(
    () => businesses.find((item) => String(item.id) === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  )

  useEffect(() => {
    if (selectedBusiness?.country) {
      setTargetCountry(selectedBusiness.country)
    }
  }, [selectedBusiness?.country])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedBusinessId) {
      toast.error('Select a business first')
      return
    }
    if (selectedIds.length === 0) {
      toast.error('Select at least one directory')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post('/campaigns', {
        business_profile_id: Number(selectedBusinessId),
        directory_ids: selectedIds,
        campaign_name: campaignName || undefined,
        requested_count: selectedIds.length,
        target_country: targetCountry || undefined,
      })
      toast.success('Campaign started successfully')
      router.push(`/campaigns/${response.data.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading campaign builder"
      fallbackDescription="Preparing business and directory data."
    >
      <AppShell
        title="New Campaign"
        subtitle="Select a business, choose recommended directories, and launch a campaign with real DB-backed submissions."
      >
        {loading ? (
          <div className="space-y-6">
            <SkeletonBlock className="h-44" />
            <SkeletonBlock className="h-[420px]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <PageCard className="p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Business</span>
                  <select
                    value={selectedBusinessId}
                    onChange={(event) => {
                      setSelectedBusinessId(event.target.value)
                      setSelectedIds([])
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  >
                    <option value="">Select a business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.business_name}
                      </option>
                    ))}
                  </select>
                </label>
                <FormInput
                  label="Campaign Name"
                  placeholder="FusionKode Local SEO Push"
                  value={campaignName}
                  onChange={(event) => setCampaignName(event.target.value)}
                />
                <FormInput
                  label="Target Country"
                  placeholder="Pakistan"
                  value={targetCountry}
                  onChange={(event) => setTargetCountry(event.target.value)}
                />
              </div>

              {selectedBusiness ? (
                <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">{selectedBusiness.business_name}</div>
                      <div className="mt-1 text-sm text-slate-500">{selectedBusiness.website || 'No website provided'}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <InfoBadge tone="info">{selectedBusiness.category}</InfoBadge>
                      <InfoBadge tone="neutral">{selectedBusiness.country}</InfoBadge>
                    </div>
                  </div>
                </div>
              ) : null}
            </PageCard>

            <PageCard className="p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Recommended directories</h2>
                  <p className="mt-1 text-sm text-slate-500">Tier-based recommendations based on business category and country.</p>
                </div>
                <div className="text-sm text-slate-500">{selectedIds.length} selected for this campaign</div>
              </div>
              <DirectorySelector
                vertical={selectedBusiness?.category}
                country={selectedBusiness?.country}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
            </PageCard>

            <PageCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Estimated campaign footprint</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{selectedIds.length} directories</div>
                  <div className="mt-1 text-sm text-slate-500">High-tier platforms are more likely to require manual review.</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <ActionButton href="/businesses/new">Add Another Business</ActionButton>
                  <ActionButton type="submit" tone="primary" disabled={submitting || !selectedBusinessId || selectedIds.length === 0}>
                    {submitting ? 'Starting campaign...' : 'Start Campaign'}
                  </ActionButton>
                </div>
              </div>
            </PageCard>
          </form>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
