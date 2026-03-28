'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'

import { useAuthStore } from '@/lib/store'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/businesses', label: 'Businesses' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/manual-queue', label: 'Manual Queue' },
  { href: '/verification-inbox', label: 'Verification Inbox' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/campaigns/new', label: 'New Campaign' },
  { href: '/profile', label: 'Profile' },
]

function navClass(active: boolean) {
  return [
    'block rounded-2xl px-4 py-3 text-sm font-medium transition',
    active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const content = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white/95 px-4 py-5 backdrop-blur">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Local SEO Citation</div>
          <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">Operations</div>
        </Link>
        <button
          type="button"
          className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 lg:inline-flex"
          onClick={() => setOpen(false)}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href} className={navClass(active)} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Status</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Real campaigns, real submission progress, and manual handoff when automation hits a challenge.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Local SEO Citation
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600"
            aria-label="Toggle navigation"
          >
            {open ? <PanelLeftOpen className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] lg:block">{content}</aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[240px]" onClick={(event) => event.stopPropagation()}>
            {content}
          </div>
        </div>
      ) : null}
    </>
  )
}
