'use client'

import { Mail, X } from 'lucide-react'

import { ActionButton, InfoBadge, PageCard } from '@/components/dashboard/ui'

export function EmailForwardingGuide({
  open,
  onClose,
  forwardingAddress,
}: {
  open: boolean
  onClose: () => void
  forwardingAddress: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <PageCard className="w-full max-w-2xl p-6 md:p-8">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <InfoBadge tone="info">Email Verification Live Guide</InfoBadge>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Forward your business verification emails</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              To auto-verify directory listings, forward verification emails from your business inbox to the
              forwarding address below.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Close guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Forwarding Address</div>
          <div className="mt-1 break-all text-base font-semibold text-sky-900">{forwardingAddress}</div>
        </div>

        <ol className="mt-6 space-y-3 text-sm text-slate-700">
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">1. Open your business email settings.</li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            2. Add forwarding to <strong>{forwardingAddress}</strong>.
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            3. Keep your business email in this form. We will match incoming emails to your campaign.
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            4. Use Verification Inbox to run one-click manual verify if needed.
          </li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <ActionButton tone="primary" icon={Mail} onClick={onClose}>
            Got it
          </ActionButton>
          <ActionButton onClick={onClose}>Close</ActionButton>
        </div>
      </PageCard>
    </div>
  )
}

