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
  credibility_score: number
  requires_verification: boolean
  last_validation_status: string
}

export function DirectorySelector({
  vertical,
  country,
  selectedIds,
  onChange,
}: {
  vertical?: string
  country?: string
  selectedIds: number[]
  onChange: (ids: number[]) => void
}) {
  const [directories, setDirectories] = useState<DirectoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('tier')

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (vertical) params.set('vertical', vertical)
    if (country) params.set('country', country)

    api
      .get(`/directories/recommended?${params.toString()}`)
      .then((response) => {
        if (!cancelled) setDirectories(response.data)
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
  }, [vertical, country])

  const filtered = useMemo(() => {
    let rows = [...directories]
    if (tierFilter !== 'all') {
      rows = rows.filter((directory) => directory.tier === tierFilter)
    }
    rows.sort((left, right) => {
      if (sortBy === 'credibility') return right.credibility_score - left.credibility_score
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
          <option value="tier">Sort by tier</option>
          <option value="credibility">Sort by score</option>
          <option value="name">Sort by name</option>
        </select>
        <div className="text-sm text-slate-500">{selectedIds.length} selected</div>
      </div>

      <div className="grid gap-4">
        {filtered.map((directory) => {
          const selected = selectedIds.includes(directory.id)
          const difficulty = directory.tier === 'tier_1' ? 8 : directory.tier === 'tier_2' ? 5 : 3
          const successRate = Math.max(20, Math.round(directory.credibility_score * 100))
          const captchaProbability = directory.tier === 'tier_1' ? 75 : directory.requires_verification ? 45 : 20

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
                    <div>Category: {directory.category}</div>
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
