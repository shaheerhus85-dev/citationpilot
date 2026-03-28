'use client'

import { useState } from 'react'
import { ExternalLink, MailPlus, XCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { PageCard } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { TempEmailDisplay } from '@/components/manual/TempEmailDisplay'

type ManualSubmission = {
  id: number
  task_id: number
  directory_name?: string | null
  directory_url?: string | null
  error_message?: string | null
  captcha_type?: string | null
  created_at?: string | null
  business_data: {
    business_name?: string | null
    website?: string | null
    email?: string | null
    phone?: string | null
    address_line1?: string | null
    address_line2?: string | null
    description?: string | null
    category?: string | null
    country?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
  }
}

type TempEmailPayload = {
  email: string
  password?: string | null
  provider: string
  expires_in_hours?: number
}

export function ManualSubmissionCard({
  submission,
  onComplete,
}: {
  submission: ManualSubmission
  onComplete: () => Promise<void> | void
}) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [tempEmail, setTempEmail] = useState<TempEmailPayload | null>(null)

  async function generateTempEmail() {
    try {
      const { data } = await api.get(`/api/v1/submissions/${submission.id}/temp-email`)
      setTempEmail(data)
      toast.success('Temporary inbox created')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to generate temp email')
    }
  }

  async function markComplete(success: boolean) {
    setLoading(true)
    try {
      await api.post(`/api/v1/submissions/${submission.id}/mark-complete`, {
        success,
        operator_notes: notes || null,
      })
      toast.success(success ? 'Marked complete' : 'Marked failed')
      await onComplete()
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update submission')
    } finally {
      setLoading(false)
    }
  }

  const business = submission.business_data

  return (
    <PageCard className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                {submission.directory_name || 'Directory'}
              </h3>
              {submission.directory_url ? (
                <a
                  href={submission.directory_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 break-all text-sm text-sky-700 hover:text-sky-900"
                >
                  {submission.directory_url}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
              {submission.captcha_type || 'manual required'}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reason</div>
            <div className="mt-2 text-sm text-slate-700">{submission.error_message || 'Manual review required.'}</div>
            {submission.created_at ? (
              <div className="mt-2 text-xs text-slate-500">Queued: {new Date(submission.created_at).toLocaleString()}</div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Business Name', business.business_name],
              ['Website', business.website],
              ['Email', business.email],
              ['Phone', business.phone],
              ['Category', business.category],
              ['Country', business.country],
              ['City', business.city],
              ['State', business.state],
              ['Postal Code', business.postal_code],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm text-slate-800">{value || 'Not provided'}</div>
              </div>
            ))}
          </div>

          {(business.address_line1 || business.address_line2 || business.description) ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Address</div>
                <div className="mt-2 text-sm text-slate-800">
                  {[business.address_line1, business.address_line2].filter(Boolean).join(', ') || 'Not provided'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Description</div>
                <div className="mt-2 text-sm text-slate-800">{business.description || 'Not provided'}</div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-full xl:max-w-md">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Operator Actions</div>
            <p className="mt-2 text-sm text-slate-500">
              Open the directory, submit the listing manually, then record the result below.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateTempEmail}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <MailPlus className="mr-2 h-4 w-4" />
                Generate Temp Email
              </button>
            </div>

            {tempEmail ? (
              <div className="mt-4">
                <TempEmailDisplay
                  email={tempEmail.email}
                  password={tempEmail.password}
                  expiresAt={
                    tempEmail.expires_in_hours
                      ? new Date(Date.now() + tempEmail.expires_in_hours * 60 * 60 * 1000).toISOString()
                      : null
                  }
                />
              </div>
            ) : null}

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Operator Notes</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                placeholder="Capture what happened during manual submission..."
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => markComplete(true)}
                className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Complete
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => markComplete(false)}
                className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageCard>
  )
}
