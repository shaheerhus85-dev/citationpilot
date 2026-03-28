'use client'

import { useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, InfoBadge, PageCard } from '@/components/dashboard/ui'
import { API_BASE_URL } from '@/lib/env'

type DirectoryItem = {
  id: number
  name: string
  url: string
  category: string
  country?: string | null
  tier: 'tier_1' | 'tier_2' | 'tier_3'
  is_active: boolean
  last_validation_status?: string | null
}

export default function InternalDirectoriesPage() {
  const [directories, setDirectories] = useState<DirectoryItem[]>([])
  const [loading, setLoading] = useState(true)

  async function loadDirectories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/internal/directories`)
      if (!response.ok) throw new Error('Could not load internal directories')
      setDirectories(await response.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Internal load failed')
    } finally {
      setLoading(false)
    }
  }

  async function updateTier(id: number, tier: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/internal/directories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      if (!response.ok) throw new Error('Tier update fail')
      await loadDirectories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Tier update failed')
    }
  }

  async function runValidation() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/internal/directories/quarterly-validate?limit=25`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Validation worker fail')
      toast.success('Quarterly validation batch started')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Validation start failed')
    }
  }

  useEffect(() => {
    void loadDirectories()
  }, [])

  return (
    <AppShell
      title="Internal Directory Admin"
      subtitle="Internal-only panel for Tier 1/2/3 management and quarterly validation."
      actions={
        <>
          <ActionButton onClick={() => void loadDirectories()} icon={RefreshCcw}>Refresh</ActionButton>
          <ActionButton tone="primary" onClick={() => void runValidation()}>Run quarterly validation</ActionButton>
        </>
      }
    >
      <PageCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-4 font-medium">Directory</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Country</th>
                <th className="px-5 py-4 font-medium">Tier</th>
                <th className="px-5 py-4 font-medium">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {directories.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="mt-1 break-all text-xs text-slate-400">{item.url}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.category}</td>
                  <td className="px-5 py-4 text-slate-600">{item.country || '—'}</td>
                  <td className="px-5 py-4">
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      value={item.tier}
                      onChange={(e) => void updateTier(item.id, e.target.value)}
                    >
                      <option value="tier_1">Tier 1</option>
                      <option value="tier_2">Tier 2</option>
                      <option value="tier_3">Tier 3</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <InfoBadge tone={item.last_validation_status === 'healthy' ? 'success' : item.last_validation_status === 'failed' ? 'error' : 'warning'}>
                      {item.last_validation_status || 'unknown'}
                    </InfoBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </AppShell>
  )
}
