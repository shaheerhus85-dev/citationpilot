'use client'

import { Sidebar } from '@/components/Sidebar'

export function AppShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f5f7fb_42%,#eef2f7_100%)] text-slate-900">
      <Sidebar />
      <div className="min-h-screen md:pl-[240px]">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Citation Workspace</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h1>
              {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </section>
          <div className="space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
