'use client'

type SuccessChartProps = {
  submitted: number
  failed: number
  manualRequired: number
  pending: number
}

export function SuccessChart({ submitted, failed, manualRequired, pending }: SuccessChartProps) {
  const total = submitted + failed + manualRequired + pending
  const rows = [
    { label: 'Submitted', value: submitted, color: 'bg-emerald-500' },
    { label: 'Failed', value: failed, color: 'bg-rose-500' },
    { label: 'Manual', value: manualRequired, color: 'bg-amber-500' },
    { label: 'Pending', value: pending, color: 'bg-slate-400' },
  ]

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const percent = total ? Math.round((row.value / total) * 100) : 0
        return (
          <div key={row.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{row.label}</span>
              <span>{percent}%</span>
            </div>
            <div className="overflow-hidden rounded-full bg-slate-200">
              <div className={`h-3 rounded-full ${row.color}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
