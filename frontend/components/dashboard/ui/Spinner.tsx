'use client'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const classes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]',
  }[size]

  return <div className={`inline-block animate-spin rounded-full border-slate-300 border-t-slate-900 ${classes}`} />
}
