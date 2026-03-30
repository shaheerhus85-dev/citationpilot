'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { InfoBadge, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'

type DirectoryRecord = {
  id: number
  name: string
  url: string
  category: string
  country?: string | null
  tier: string
  score: number
  credibility_score: number
  success_rate: number
  captcha_probability: number
  estimated_completion_minutes: number
  requires_verification: boolean
}

type IntelligentSelectResponse = {
  used_fallback_category: boolean
  fallback_reason: string | null
  directories: DirectoryRecord[]
  estimated_success_rate: number
  estimated_completion_time_minutes: number
}

export function DirectorySelector({
  businessId,
  vertical,
  country,
  selectedIds,
  onChange,
  onInsightsChange,
}: {
  businessId?: number
  vertical?: string
  country?: string
  selectedIds: number[]
  onChange: (ids: number[]) => void
  onInsightsChange?: (insights: {
    usedFallbackCategory: boolean
    fallbackReason: string | null
    estimatedSuccessRate: number
    estimatedCompletionTimeMinutes: number
  }) => void
}) {
  const [directories, setDirectories] = useState<DirectoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [usedFallback, setUsedFallback] = useState(false)
  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const [estimatedSuccessRate, setEstimatedSuccessRate] = useState(0)
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState(0)

  useEffect(() => {
    let cancelled = false

    if (!businessId) {
      setDirectories([])
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    const params = new URLSearchParams()
    params.set('business_id', String(businessId))
    params.set('limit', '50')
    if (vertical) params.set('category', vertical)
    if (country) params.set('country', country)

    api
      .get<IntelligentSelectResponse>(`/directories/intelligent-select?${params.toString()}`)
      .then((response) => {
        if (cancelled) return
        const payload = response.data
        setDirectories(payload.directories || [])
        setUsedFallback(Boolean(payload.used_fallback_category))
        setFallbackReason(payload.fallback_reason || null)
        setEstimatedSuccessRate(Math.round((payload.estimated_success_rate || 0) * 100))
        setEstimatedCompletionTime(payload.estimated_completion_time_minutes || 0)
        onInsightsChange?.({
          usedFallbackCategory: Boolean(payload.used_fallback_category),
          fallbackReason: payload.fallback_reason || null,
          estimatedSuccessRate: payload.estimated_success_rate || 0,
          estimatedCompletionTimeMinutes: payload.estimated_completion_time_minutes || 0,
        })
      })
      .catch(() => {
        toast.error('Failed to load recommended directories')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [businessId, vertical, country, onInsightsChange])

  const filtered = useMemo(() => {
    let rows = [...directories]
    if (tierFilter !== 'all') {
      rows = rows.filter((directory) => directory.tier === tierFilter)
    }
    rows.sort((left, right) => {
      if (sortBy === 'score') return right.score - left.score
      if (sortBy === 'success') return right.success_rate - left.success_rate
      if (sortBy === 'name') return left.name.localeCompare(right.name)
      return left.tier.localeCompare(right.tier) || left.name.localeCompare(right.name)
    })
    return rows
  }, [directories, tierFilter, sortBy])

  function toggleDirectory(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tierFilter}
          onChange={(event) => setTierFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <option value="all">All tiers</option>
          <option value="tier_1">Tier 1</option>
          <option value="tier_2">Tier 2</option>
          <option value="tier_3">Tier 3</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <option value="score">Sort by relevance</option>
          <option value="success">Sort by success rate</option>
          <option value="tier">Sort by tier</option>
          <option value="name">Sort by name</option>
        </select>
        <div className="text-sm text-slate-500">{selectedIds.length} selected</div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated success</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{estimatedSuccessRate}%</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated completion</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{estimatedCompletionTime} min</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Selection mode</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {usedFallback ? 'Closest niche fallback' : 'Exact niche + country'}
          </div>
          {fallbackReason ? <div className="mt-1 text-xs text-amber-700">{fallbackReason}</div> : null}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((directory) => {
          const selected = selectedIds.includes(directory.id)
          const difficulty = directory.tier === 'tier_1' ? 8 : directory.tier === 'tier_2' ? 5 : 3
          const successRate = Math.round((directory.success_rate || 0) * 100)
          const captchaProbability = Math.round((directory.captcha_probability || 0) * 100)

          return (
            <label
              key={directory.id}
              className={`cursor-pointer rounded-[24px] border p-5 transition ${selected ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleDirectory(directory.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">{directory.name}</div>
                      <div className="mt-1 break-all text-sm text-slate-500">{directory.url}</div>
                    </div>
                    <InfoBadge tone={directory.tier === 'tier_1' ? 'success' : directory.tier === 'tier_2' ? 'info' : 'neutral'}>
                      {directory.tier.replace('_', ' ')}
                    </InfoBadge>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                    <div>Category: {directory.category || 'General'}</div>
                    <div>Difficulty: {difficulty}/10</div>
                    <div>Success Rate: {successRate}%</div>
                    <div>CAPTCHA Probability: {captchaProbability}%</div>
                  </div>
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
