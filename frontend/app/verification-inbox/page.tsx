'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, EmptyState, InfoBadge, PageCard, ProtectedRoute } from '@/components/dashboard/ui'
import { API_BASE_URL } from '@/lib/env'
import { useAuthStore } from '@/lib/store'

type VerificationRow = {
  id: number
  campaign_name?: string
  directory_name?: string
  subject: string
  received_time: string
  status: 'pending' | 'auto_verified' | 'manual'
}

export default function VerificationInboxPage() {
  const router = useRouter()
  const { isAuthenticated, logout, hydrated, isBootstrapping } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<VerificationRow[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      void fetchRows()
    }
  }, [hydrated, isAuthenticated])

  async function fetchRows() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/verification-inbox/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
      if (!response.ok) throw new Error('Failed to load verification inbox')
      const payload = await response.json()
      setRows(payload.items || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load verification inbox')
    } finally {
      setLoading(false)
    }
  }

  async function verifyNow(emailId: number) {
    setBusyId(emailId)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/verification-inbox/${emailId}/verify-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
      if (!response.ok) throw new Error('Verify action failed')
      toast.success('Verification worker started')
      await fetchRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verify action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading verification inbox"
      fallbackDescription="Loading your verification inbox securely..."
    >
      <AppShell
        title="Verification Inbox"
        subtitle="Incoming directory verification emails for your campaigns. Use Verify Now to trigger Playwright."
        actions={
          <>
            <ActionButton icon={RefreshCcw} onClick={() => void fetchRows()}>
              Refresh
            </ActionButton>
            <ActionButton icon={LogOut} tone="secondary" onClick={() => { logout(); router.push('/login') }}>
              Logout
            </ActionButton>
          </>
        }
      >
        <PageCard className="p-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading inbox...</div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No verification emails yet"
              description="Once forwarding is active, verification emails will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Campaign Name</th>
                    <th className="px-3 py-3">Directory</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Received Time</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-3 font-medium text-slate-800">{row.campaign_name || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{row.directory_name || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{row.subject}</td>
                      <td className="px-3 py-3 text-slate-500">{new Date(row.received_time).toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <InfoBadge
                          tone={
                            row.status === 'auto_verified'
                              ? 'success'
                              : row.status === 'manual'
                                ? 'warning'
                                : 'info'
                          }
                        >
                          {row.status.replace('_', ' ')}
                        </InfoBadge>
                      </td>
                      <td className="px-3 py-3">
                        <ActionButton
                          tone="primary"
                          disabled={busyId === row.id}
                          onClick={() => void verifyNow(row.id)}
                        >
                          {busyId === row.id ? 'Running...' : 'Verify Now'}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>
      </AppShell>
    </ProtectedRoute>
  )
}
