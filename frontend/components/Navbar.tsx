'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useAuthStore } from '@/lib/store'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hydrated = useAuthStore((state) => state.hydrated)
  const logout = useAuthStore((state) => state.logout)

  const guestLinks = [
    { href: '/', label: 'Home' },
    { href: '/contact', label: 'Contact' },
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Register' },
  ]

  const authLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/businesses', label: 'Businesses' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/manual-queue', label: 'Manual Queue' },
    { href: '/verification-inbox', label: 'Verification Inbox' },
    { href: '/profile', label: 'Profile' },
  ]

  const links = hydrated && isAuthenticated ? authLinks : guestLinks
  const appShellPaths = [
    '/dashboard',
    '/businesses',
    '/campaigns',
    '/manual-queue',
    '/verification-inbox',
    '/analytics',
    '/profile',
    '/submissions',
  ]
  const hideOnAppShell = appShellPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

  if (hideOnAppShell) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          CitationPilot
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-[#2563eb] ${
                pathname === link.href ? 'text-slate-900' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {hydrated && isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/register"
              className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
