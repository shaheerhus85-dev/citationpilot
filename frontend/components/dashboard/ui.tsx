'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import clsx from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2, type LucideIcon, ShieldCheck } from 'lucide-react'

const cardStyles = cva(
  'rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.22)] backdrop-blur-sm',
  {
    variants: {
      padding: {
        default: 'p-6 sm:p-7',
        compact: 'p-4 sm:p-5',
        spacious: 'p-8 sm:p-10',
      },
    },
    defaultVariants: {
      padding: 'default',
    },
  }
)

export function PageContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={clsx('min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function PageCard({
  className,
  padding,
  children,
}: {
  className?: string
  children: React.ReactNode
} & VariantProps<typeof cardStyles>) {
  return <div className={cardStyles({ padding, className })}>{children}</div>
}

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      tone: {
        primary: 'border-[#2563eb] bg-[#2563eb] text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.8)] hover:bg-[#1d4ed8]',
        secondary: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
        subtle: 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200',
      },
    },
    defaultVariants: {
      tone: 'secondary',
    },
  }
)

export function ActionButton({
  className,
  tone,
  icon: Icon,
  href,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    className?: string
    icon?: LucideIcon
    href?: string
    children: React.ReactNode
  }) {
  const classNames = buttonStyles({ tone, className })

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span>{children}</span>
      </Link>
    )
  }

  return (
    <button className={classNames} {...props}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  )
}

export function FormInput({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className={clsx(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 disabled:cursor-not-allowed disabled:bg-slate-50',
          className
        )}
        {...props}
      />
    </label>
  )
}

export function FormTextArea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className={clsx(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 disabled:cursor-not-allowed disabled:bg-slate-50',
          className
        )}
        {...props}
      />
    </label>
  )
}

type SelectOption = {
  label: string
  value: string
}

export function FormSelect({
  label,
  options,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options?: SelectOption[]
  children?: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        className={clsx(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 disabled:cursor-not-allowed disabled:bg-slate-50',
          className
        )}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </label>
  )
}

export function SectionHeading({
  title,
  description,
  align = 'left',
}: {
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={clsx(align === 'center' && 'text-center')}>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function MetricCard({
  title,
  value,
  description,
}: {
  title: string
  value: string | number
  description: string
}) {
  return (
    <PageCard className="h-full">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </PageCard>
  )
}

export function StatBlock({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper?: string
}) {
  return (
    <PageCard className="h-full">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      {helper ? <div className="mt-2 text-sm text-slate-500">{helper}</div> : null}
    </PageCard>
  )
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'info'
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        tone === 'info' ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'bg-slate-100 text-slate-600'
      )}
    >
      {children}
    </span>
  )
}

export function InfoBadge({
  children,
  tone = 'info',
}: {
  children: React.ReactNode
  tone?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
}) {
  const className = clsx(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
    tone === 'success' && 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    tone === 'warning' && 'border border-amber-200 bg-amber-50 text-amber-700',
    tone === 'error' && 'border border-rose-200 bg-rose-50 text-rose-700',
    tone === 'neutral' && 'border border-slate-200 bg-slate-100 text-slate-700',
    tone === 'info' && 'border border-sky-200 bg-sky-50 text-sky-700'
  )
  return <span className={className}>{children}</span>
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <PageCard className="flex min-h-[320px] flex-col items-center justify-center text-center" padding="spacious">
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      {eyebrow ? <Badge tone="info">{eyebrow}</Badge> : null}
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </PageCard>
  )
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-[28px] bg-white/80 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)]', className)} />
}

export function AuthPanel({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_42%,#eef2f7_100%)] px-4 py-12">
      <PageCard className="w-full max-w-lg" padding="spacious">
        <Badge tone="info">Secure access</Badge>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6 text-sm text-slate-500">{footer}</div> : null}
      </PageCard>
    </div>
  )
}

export function AuthScreenLoader({
  title = 'Preparing your workspace',
  description = 'Loading your account session and dashboard access...',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <PageCard className="w-full max-w-lg" padding="spacious">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#2563eb]/10 text-[#2563eb]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </PageCard>
    </div>
  )
}

export function ProtectedRoute({
  children,
  isAuthenticated,
  hydrated,
  isBootstrapping = false,
  fallbackTitle,
  fallbackDescription,
}: {
  children: React.ReactNode
  isAuthenticated: boolean
  hydrated: boolean
  isBootstrapping?: boolean
  fallbackTitle?: string
  fallbackDescription?: string
}) {
  const router = useRouter()

  useEffect(() => {
    if (hydrated && !isBootstrapping && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, isBootstrapping, isAuthenticated, router])

  if (!hydrated || isBootstrapping) {
    return (
      <AuthScreenLoader
        title={fallbackTitle || 'Checking your session'}
        description={fallbackDescription || 'Please wait while we restore your secure workspace.'}
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
        <PageCard className="w-full max-w-lg text-center" padding="spacious">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#2563eb]/10 text-[#2563eb]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Redirecting to sign in</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            You need an active account session to continue. Taking you to the login page now.
          </p>
        </PageCard>
      </div>
    )
  }

  return <>{children}</>
}
