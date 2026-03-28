'use client'

type CampaignProgressProps = {
  total: number
  submitted: number
  failed: number
  manualRequired: number
  pending: number
}

function pct(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

export function CampaignProgress({
  total,
  submitted,
  failed,
  manualRequired,
  pending,
}: CampaignProgressProps) {
  const submittedPct = pct(submitted, total)
  const failedPct = pct(failed, total)
  const manualPct = pct(manualRequired, total)
  const pendingPct = pct(pending, total)
  const completedPct = pct(submitted + failed + manualRequired, total)

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-full bg-slate-200">
        <div className="h-3 rounded-full bg-slate-950 transition-all" style={{ width: `${completedPct}%` }} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Submitted', submitted, 'text-emerald-700'],
          ['Failed', failed, 'text-rose-700'],
          ['Manual', manualRequired, 'text-amber-700'],
          ['Pending', pending, 'text-slate-700'],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
            <div className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        {[
          ['Submitted', submittedPct, 'bg-emerald-500'],
          ['Failed', failedPct, 'bg-rose-500'],
          ['Manual Required', manualPct, 'bg-amber-500'],
          ['Pending', pendingPct, 'bg-slate-400'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="overflow-hidden rounded-full bg-slate-200">
              <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
