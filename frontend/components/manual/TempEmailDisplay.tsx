'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export function TempEmailDisplay({
  email,
  password,
  expiresAt,
}: {
  email: string
  password?: string | null
  expiresAt?: string | null
}) {
  const [showPassword, setShowPassword] = useState(false)

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`)
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Temp Email</div>
          <div className="mt-2 break-all text-sm font-medium text-emerald-950">{email}</div>
          <p className="mt-2 text-xs text-emerald-800">Use this email for directory registration and verification steps.</p>
        </div>
        <button
          type="button"
          onClick={() => copyValue(email, 'Email')}
          className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
        >
          <Copy className="mr-1 h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      {password ? (
        <div className="mt-4 rounded-2xl bg-white/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mailbox Password</div>
              <div className="mt-1 text-sm text-slate-800">{showPassword ? password : '••••••••••••••••'}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => copyValue(password, 'Password')}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {expiresAt ? (
        <div className="mt-3 text-xs text-slate-500">Expires: {new Date(expiresAt).toLocaleString()}</div>
      ) : null}
    </div>
  )
}
