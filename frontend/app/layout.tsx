import './globals.css'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Providers } from './providers'

const appFont = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-app',
})

export const metadata: Metadata = {
  title: 'CitationPilot',
  description: 'Local SEO citation automation SaaS with campaign tracking, manual queue workflows, and verification support.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${appFont.variable} bg-[#f8fafc] font-sans text-slate-900`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
