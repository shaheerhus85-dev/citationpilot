'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, Pencil, Plus, Rocket, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, EmptyState, FormInput, InfoBadge, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type BusinessProfile = {
  id: number
  business_name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  address_line1?: string | null
  city?: string | null
  state?: string | null
  country: string
  category: string
}

export default function BusinessesPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [rows, setRows] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  async function loadBusinesses() {
    try {
      const response = await api.get('/api/v1/businesses')
      setRows(response.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load businesses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      void loadBusinesses()
    }
  }, [hydrated, isAuthenticated])

  async function handleDelete(businessId: number) {
    if (!window.confirm('Delete this business profile?')) return
    try {
      await api.delete(`/api/v1/businesses/${businessId}`)
      setRows((current) => current.filter((row) => row.id !== businessId))
      toast.success('Business deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete business')
    }
  }

  const categories = useMemo(
    () => ['all', ...new Set(rows.map((row) => row.category).filter(Boolean))],
    [rows]
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !search ||
        row.business_name.toLowerCase().includes(search.toLowerCase()) ||
        (row.website || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || row.category === category
      return matchesSearch && matchesCategory
    })
  }, [rows, search, category])

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading businesses"
      fallbackDescription="Preparing your business profiles."
    >
      <AppShell
        title="Businesses"
        subtitle="Manage business profiles, keep NAP data consistent, and launch campaigns from a clean workflow."
        actions={<ActionButton href="/businesses/new" icon={Plus} tone="primary">Add Business</ActionButton>}
      >
        <PageCard className="p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <FormInput label="Search businesses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or website" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All categories' : item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </PageCard>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonBlock className="h-60" />
            <SkeletonBlock className="h-60" />
            <SkeletonBlock className="h-60" />
          </div>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="No business profiles yet"
            description="Create your first business profile to start a campaign and route manual submissions correctly."
            action={<ActionButton href="/businesses/new" icon={Plus} tone="primary">Create Business</ActionButton>}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((business) => (
              <PageCard key={business.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-950">{business.business_name}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <InfoBadge tone="info">{business.category}</InfoBadge>
                      <InfoBadge tone="neutral">{business.country}</InfoBadge>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  {business.website ? <div>Website: {business.website}</div> : null}
                  {business.email ? <div>Email: {business.email}</div> : null}
                  {business.phone ? <div>Phone: {business.phone}</div> : null}
                  {business.address_line1 ? <div>Address: {business.address_line1}</div> : null}
                  {business.city || business.state ? <div>Location: {[business.city, business.state].filter(Boolean).join(', ')}</div> : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton href={`/campaigns/new?business=${business.id}`} icon={Rocket} tone="primary">Start Campaign</ActionButton>
                  <ActionButton href={`/businesses/new?edit=${business.id}`} icon={Pencil}>Edit</ActionButton>
                  <ActionButton icon={Trash2} tone="secondary" onClick={() => void handleDelete(business.id)}>Delete</ActionButton>
                </div>
              </PageCard>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
